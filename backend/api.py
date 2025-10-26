from flask import Flask, jsonify, request
from flask_cors import CORS
from ASD_Detection import AutismScreeningSystem
import pathlib
import json

app = Flask(__name__)
CORS(app)

SCRIPT_DIR = pathlib.Path(__file__).parent.resolve()
TRAINING_DATA_CSV = SCRIPT_DIR / "srijan_features_only_with_groups.csv"

# Initialize the system
system = AutismScreeningSystem(csv_path=str(TRAINING_DATA_CSV))

@app.route('/api/health', methods=['GET'])
def health_check():
    """Simple health check endpoint to verify server is running"""
    return jsonify({'status': 'ok', 'message': 'Server is running'})

@app.route('/api/screening', methods=['POST'])
def start_screening():
    try:
        data = request.get_json() or {}
        print(f"Received screening request: {data}")

        # Load or train models if not already done
        if not system.load_models():
            print("No pre-trained models found. Training new models...")
            if not system.train_all_models():
                return jsonify({'error': 'Failed to train models'}), 500

        # Run live screening in headed mode (with display)
        result = system.run_live_screening(display=True)

        if result:
            print(f"Screening completed successfully: {result}")
            return jsonify(result)
        else:
            return jsonify({'error': 'Screening failed or insufficient data'}), 400
    except Exception as e:
        print(f"Error during screening: {e}")
        return jsonify({'error': 'Internal server error occurred'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)