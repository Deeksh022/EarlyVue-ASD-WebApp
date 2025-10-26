# EarlyVue ASD Screening Setup Guide

## Problem Summary

The application was trying to run Python code with TensorFlow and MediaPipe directly in the browser using Pyodide, but these packages are not compatible with browser environments. This caused the errors:
- `ModuleNotFoundError: No module named 'scikit-learn'`
- `ModuleNotFoundError: No module named 'tensorflow'`

## Solution

The solution is to use a **backend API architecture** where:
1. Python code runs on a local Flask server (backend)
2. React frontend communicates with the backend via HTTP API
3. Video frames are captured in the browser and sent to the backend for processing

## Setup Instructions

### Step 1: Install Backend Dependencies

Open a terminal in the project root directory and run:

```bash
cd backend
pip install -r requirements.txt
```

This will install all required Python packages including:
- Flask (web server)
- TensorFlow (deep learning)
- MediaPipe (face tracking)
- scikit-learn (machine learning)
- OpenCV (computer vision)
- And other dependencies

### Step 2: Start the Backend Server

**Option A: Using the batch file (Windows)**
```bash
cd backend
start_backend.bat
```

**Option B: Manual start**
```bash
cd backend
python screening_api.py
```

The backend server will start on `http://localhost:5000`

You should see output like:
```
* Running on http://127.0.0.1:5000
* Running on http://192.168.x.x:5000
```

### Step 3: Start the React Frontend

In a **new terminal window**, run:

```bash
npm start
```

The React app will start on `http://localhost:3000`

### Step 4: Test the Screening

1. Navigate to the screening page
2. Select a child
3. Select screening type
4. Click "Start Screening"

The frontend will:
- Connect to the backend API
- Initialize the screening system
- Start the webcam
- Send video frames to the backend for processing
- Display results after completion

## Architecture Overview

```
┌─────────────────────┐         HTTP API         ┌──────────────────────┐
│                     │ ◄──────────────────────► │                      │
│  React Frontend     │                          │  Flask Backend       │
│  (localhost:3000)   │                          │  (localhost:5000)    │
│                     │                          │                      │
│  - Webcam capture   │   POST /api/initialize   │  - TensorFlow        │
│  - UI/UX            │   POST /api/start        │  - MediaPipe         │
│  - Frame sending    │   POST /api/process      │  - ML Models         │
│  - Results display  │   POST /api/end          │  - Gaze tracking     │
│                     │   GET  /api/health       │                      │
└─────────────────────┘                          └──────────────────────┘
```

## API Endpoints

### 1. Health Check
- **Endpoint:** `GET /api/health`
- **Purpose:** Check if backend is running
- **Response:** `{ "status": "healthy", "initialized": true/false }`

### 2. Initialize System
- **Endpoint:** `POST /api/initialize`
- **Purpose:** Load ML models and prepare screening system
- **Body:** `{ "csv_path": "path/to/training/data.csv" }`
- **Response:** `{ "success": true, "message": "..." }`

### 3. Start Screening
- **Endpoint:** `POST /api/start_screening`
- **Purpose:** Begin a new screening session
- **Body:** `{ "duration": 60 }`
- **Response:** `{ "success": true, "message": "..." }`

### 4. Process Frame
- **Endpoint:** `POST /api/process_frame`
- **Purpose:** Process a single video frame
- **Body:** `{ "image": "base64_encoded_jpeg" }`
- **Response:** `{ "success": true, "result": {...} }`

### 5. End Screening
- **Endpoint:** `POST /api/end_screening`
- **Purpose:** Finalize screening and get results
- **Response:** `{ "success": true, "result": { "verdict": "...", "confidence": 0.85, ... } }`

## Troubleshooting

### Backend won't start

**Error:** `ModuleNotFoundError: No module named 'flask'`
- **Solution:** Run `pip install -r requirements.txt` in the backend directory

**Error:** `Port 5000 is already in use`
- **Solution:** Either:
  - Stop the process using port 5000
  - Change the port in `backend/screening_api.py` (line 107) and update `API_BASE_URL` in `src/pages/NewScreening.js` (line 70)

### Frontend can't connect to backend

**Error:** `Failed to connect to screening service`
- **Solution:** 
  1. Make sure the backend is running (`python backend/screening_api.py`)
  2. Check that the backend is on `http://localhost:5000`
  3. Check browser console for CORS errors

### CORS Errors

**Error:** `Access to fetch at 'http://localhost:5000' has been blocked by CORS policy`
- **Solution:** The backend already has CORS enabled via `flask-cors`. Make sure:
  - Flask-CORS is installed: `pip install flask-cors`
  - Backend is running properly

### Models not loading

**Error:** `Failed to initialize screening system`
- **Solution:** Ensure these files exist in `backend/autism_models/`:
  - `scaler.pkl`
  - `feature_names.pkl`
  - `RF.pkl`
  - `SVM.pkl`
  - `DNN.keras`
  - `ensemble.json`

### CSV file not found

**Error:** `CSV file not found`
- **Solution:** Ensure `srijan_features_only_with_groups.csv` exists in the `backend/` directory

## Development Notes

### Adding New Features

To add new screening features:
1. Update `backend/ASD_Detection.py` with new methods
2. Add corresponding API endpoints in `backend/screening_api.py`
3. Update frontend to call new endpoints in `src/pages/NewScreening.js`

### Debugging

Enable debug mode in Flask (already enabled by default):
```python
app.run(host='0.0.0.0', port=5000, debug=True)
```

Check backend logs in the terminal where you started `screening_api.py`

### Performance Optimization

- Adjust frame processing interval in `NewScreening.js` (line 182): `const frameInterval = 100;`
- Lower values = more frames processed = more accurate but slower
- Higher values = fewer frames = faster but less accurate

## File Structure

```
EarlyVue-ASD WebApp/
├── backend/
│   ├── ASD_Detection.py              # Main screening logic
│   ├── screening_api.py              # Flask API server
│   ├── requirements.txt              # Python dependencies
│   ├── start_backend.bat             # Windows startup script
│   ├── README.md                     # Backend documentation
│   ├── autism_models/                # ML model files
│   │   ├── RF.pkl
│   │   ├── SVM.pkl
│   │   ├── DNN.keras
│   │   ├── scaler.pkl
│   │   ├── feature_names.pkl
│   │   └── ensemble.json
│   └── srijan_features_only_with_groups.csv
├── src/
│   └── pages/
│       └── NewScreening.js           # Frontend screening page
└── SCREENING_SETUP_GUIDE.md          # This file
```

## Next Steps

1. **Start both servers** (backend and frontend)
2. **Test the screening** with a registered child
3. **Monitor the backend logs** for any errors
4. **Check browser console** for frontend errors

If you encounter any issues not covered here, check:
- Backend terminal output for Python errors
- Browser console (F12) for JavaScript errors
- Network tab in browser DevTools for API call failures
