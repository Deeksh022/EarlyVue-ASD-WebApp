from flask import Flask, request, jsonify, Response, send_file
from flask_cors import CORS
import base64
import io
import numpy as np
from PIL import Image
import sys
import os
import traceback
import cv2
import time
import json as json_module
from threading import Thread, Lock
import json
from datetime import datetime

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Force reload of modules to pick up changes
import importlib

# Try to import the screening system and report generator
try:
    import ASD_Detection_backup
    importlib.reload(ASD_Detection_backup)  # Force reload to get latest changes
    from ASD_Detection_backup import AutismScreeningSystem
    from report_generator import generate_screening_report
    IMPORT_ERROR = None
    REPORT_GENERATOR_AVAILABLE = True
except ImportError as e:
    if 'report_generator' in str(e):
        print(f"Warning: Report generator not available: {e}")
        print("Install reportlab: pip install reportlab")
        REPORT_GENERATOR_AVAILABLE = False
        import ASD_Detection_backup
        importlib.reload(ASD_Detection_backup)  # Force reload to get latest changes
        from ASD_Detection_backup import AutismScreeningSystem
        IMPORT_ERROR = None
    else:
        AutismScreeningSystem = None
        REPORT_GENERATOR_AVAILABLE = False
except Exception as e:
    AutismScreeningSystem = None
    REPORT_GENERATOR_AVAILABLE = False
    IMPORT_ERROR = str(e)
    print(f"WARNING: Failed to import AutismScreeningSystem: {e}")
    print("The server will start but screening functionality will not work.")
    print("\nTo fix this:")
    print("1. Install Visual C++ Redistributable: https://aka.ms/vs/17/release/vc_redist.x64.exe")
    print("2. Reinstall mediapipe: pip uninstall mediapipe && pip install mediapipe")
    print("3. Or use Python 3.10 instead of 3.11 if issues persist")

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Global variables
screening_system = None
current_frame = None
frame_lock = Lock()
screening_active = False
screening_result = None
screening_phase = "idle"  # idle, calibration, screening, completed
calibration_done = False

@app.route('/api/initialize', methods=['POST'])
def initialize():
    """Initialize the screening system"""
    global screening_system
    
    # Check if import failed
    if IMPORT_ERROR:
        return jsonify({
            'success': False, 
            'error': f'Cannot initialize: {IMPORT_ERROR}',
            'help': 'MediaPipe DLL error. Install Visual C++ Redistributable from https://aka.ms/vs/17/release/vc_redist.x64.exe'
        }), 500
    
    try:
        # Use the CSV file from the backend directory
        backend_dir = os.path.dirname(os.path.abspath(__file__))
        csv_path = os.path.join(backend_dir, 'srijan_features_only_with_groups.csv')
        
        if not os.path.exists(csv_path):
            return jsonify({'success': False, 'error': f'CSV file not found at {csv_path}'}), 404
        
        screening_system = AutismScreeningSystem(csv_path)
        
        # Load models from the autism_models directory
        models_dir = os.path.join(backend_dir, 'autism_models')
        print(f"Looking for models in: {models_dir}")
        print(f"Models directory exists: {os.path.exists(models_dir)}")
        
        if os.path.exists(models_dir):
            os.chdir(models_dir)
        
        models_loaded = screening_system.load_models()
        print(f"Models loaded: {models_loaded}")
        print(f"System is_trained: {screening_system.is_trained}")
        
        if not models_loaded:
            return jsonify({
                'success': False,
                'error': 'Failed to load ML models. Check if model files exist in backend/autism_models/'
            }), 500
        
        return jsonify({'success': True, 'message': 'Screening system initialized'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e), 'traceback': traceback.format_exc()}), 500

@app.route('/api/process_frame', methods=['POST'])
def process_frame():
    """Process a single frame from the webcam (NOT USED - screening runs via run_live_screening)"""
    # This endpoint is not used anymore since run_live_screening handles everything
    return jsonify({
        'success': False,
        'error': 'This endpoint is deprecated. Use /api/start_screening instead which runs the full screening.'
    }), 400

@app.route('/api/start_screening', methods=['POST'])
def start_screening():
    """Start a new screening session - runs the full ASD_Detection screening"""
    print("\n" + "!"*50)
    print("!!! START_SCREENING ENDPOINT CALLED !!!")
    print("!"*50 + "\n")
    
    global screening_system
    
    if IMPORT_ERROR:
        return jsonify({
            'success': False,
            'error': f'Cannot start screening: {IMPORT_ERROR}',
            'help': 'MediaPipe DLL error. Install Visual C++ Redistributable.'
        }), 500
    
    if screening_system is None:
        return jsonify({'success': False, 'error': 'System not initialized'}), 400
    
    try:
        data = request.json
        video_path = data.get('video_path', None)  # Optional: use video file instead of webcam
        duration = data.get('duration', 60)  # Get duration from request, default 60 seconds
        screening_type = data.get('screening_type', 'basic-asd')
        
        print("\n" + "="*50)
        print("🎯 Starting ASD Screening Session")
        print(f"System is_trained: {screening_system.is_trained}")
        print(f"Video path: {video_path}")
        print(f"Duration: {duration} seconds")
        print(f"Screening type: {screening_type}")
        print("="*50)
        
        # Run the actual screening (this will open fullscreen OpenCV window)
        result = screening_system.run_live_screening(video_path=video_path, display=True, max_duration=duration)
        
        print(f"\nScreening result: {result}")
        
        if result:
            print("\n✅ Screening completed successfully!")
            
            # Convert result to JSON-serializable format using custom encoder
            class NumpyEncoder(json.JSONEncoder):
                def default(self, obj):
                    if isinstance(obj, (np.integer, np.floating, np.bool_)):
                        return obj.item()
                    elif isinstance(obj, np.ndarray):
                        return obj.tolist()
                    return super().default(obj)
            
            # Serialize and deserialize to convert all numpy types
            result_json = json.dumps(result, cls=NumpyEncoder)
            result_serializable = json.loads(result_json)
            
            # Generate PDF report if report generator is available
            pdf_path = None
            if REPORT_GENERATOR_AVAILABLE:
                try:
                    # Get patient info from request
                    screening_type_name = 'Advanced ASD Screening' if screening_type == 'advanced-asd' else 'Basic ASD Screening'
                    patient_info = {
                        'name': data.get('patient_name', 'Unknown Patient'),
                        'id': data.get('patient_id', 'N/A'),
                        'age': data.get('patient_age', 'N/A'),
                        'date': datetime.now().strftime('%B %d, %Y'),
                        'time': datetime.now().strftime('%I:%M %p'),
                        'type': screening_type_name
                    }
                    
                    # Generate PDF report
                    pdf_path = generate_screening_report(result_serializable, patient_info)
                    print(f"📄 PDF Report generated: {pdf_path}")
                    
                    # Add PDF path to result
                    result_serializable['pdf_report_path'] = pdf_path
                    result_serializable['pdf_report_filename'] = os.path.basename(pdf_path)
                    
                except Exception as e:
                    print(f"⚠️ Failed to generate PDF report: {e}")
                    traceback.print_exc()
            
            return jsonify({
                'success': True,
                'message': 'Screening completed',
                'result': result_serializable,
                'duration': duration
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Screening did not collect enough data (need at least 50 frames)'
            }), 400
            
    except Exception as e:
        print(f"\n❌ Screening error: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500
    finally:
        print("\n✅ Screening endpoint completed")

@app.route('/api/end_screening', methods=['POST'])
def end_screening():
    """End the screening session and get results (NOT USED - screening runs via run_live_screening)"""
    # This endpoint is not used anymore since run_live_screening handles everything
    return jsonify({
        'success': False,
        'error': 'This endpoint is deprecated. Use /api/start_screening which runs the full screening and returns results.'
    }), 400

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy', 
        'initialized': screening_system is not None,
        'import_error': IMPORT_ERROR
    })

@app.route('/api/test', methods=['GET', 'POST'])
def test():
    """Test endpoint to verify routing"""
    print("\n" + "="*50)
    print("TEST ENDPOINT CALLED!")
    print(f"Method: {request.method}")
    print(f"Data: {request.get_json() if request.method == 'POST' else 'N/A'}")
    print("="*50 + "\n")
    return jsonify({'success': True, 'message': 'Test endpoint works!'})

@app.route('/api/download_report/<filename>', methods=['GET'])
def download_report(filename):
    """Download a generated PDF report"""
    try:
        reports_dir = os.path.join(os.path.dirname(__file__), 'reports')
        file_path = os.path.join(reports_dir, filename)
        
        print(f"\n📥 Download request for: {filename}")
        print(f"Looking in directory: {reports_dir}")
        print(f"Full path: {file_path}")
        print(f"File exists: {os.path.exists(file_path)}")
        
        if os.path.exists(reports_dir):
            print(f"Files in reports directory: {os.listdir(reports_dir)}")
        else:
            print("⚠️ Reports directory does not exist!")
        
        if not os.path.exists(file_path):
            print(f"❌ File not found: {file_path}")
            return jsonify({
                'success': False, 
                'error': f'Report not found: {filename}',
                'available_files': os.listdir(reports_dir) if os.path.exists(reports_dir) else []
            }), 404
        
        print(f"✅ Sending file: {filename}")
        return send_file(
            file_path,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=filename
        )
    except Exception as e:
        print(f"❌ Download error: {e}")
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    # Print startup info
    if IMPORT_ERROR:
        print(f"\n⚠️  WARNING: Import error detected: {IMPORT_ERROR}\n")
    else:
        print("\n✅ All imports successful! Screening system ready.\n")
    
    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)
