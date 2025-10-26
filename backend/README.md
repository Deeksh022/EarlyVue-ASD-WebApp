# EarlyVue ASD Screening Backend

This backend service provides the Python-based ASD screening functionality using TensorFlow, MediaPipe, and scikit-learn.

## Setup Instructions

### 1. Install Python Dependencies

Make sure you have Python 3.11 installed, then install the required packages:

```bash
cd backend
pip install -r requirements.txt
```

### 2. Prepare Required Files

Ensure the following files are in the backend directory:
- `ASD_Detection.py` - Main screening system code
- `srijan_features_only_with_groups.csv` - Training data
- `models/` directory containing:
  - `scaler.pkl`
  - `feature_names.pkl`
  - `RF.pkl`
  - `SVM.pkl`
  - `DNN.keras`
  - `ensemble.json`

### 3. Run the Backend Server

```bash
python screening_api.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### Health Check
- **GET** `/api/health`
- Returns the health status of the service

### Initialize System
- **POST** `/api/initialize`
- Body: `{ "csv_path": "path/to/csv" }`
- Initializes the screening system with training data

### Start Screening
- **POST** `/api/start_screening`
- Body: `{ "duration": 60 }`
- Starts a new screening session

### Process Frame
- **POST** `/api/process_frame`
- Body: `{ "image": "base64_encoded_image" }`
- Processes a single video frame

### End Screening
- **POST** `/api/end_screening`
- Returns the final screening results

## Troubleshooting

### Port Already in Use
If port 5000 is already in use, you can change it in `screening_api.py`:
```python
app.run(host='0.0.0.0', port=5001, debug=True)
```

And update the frontend `API_BASE_URL` in `src/pages/NewScreening.js` accordingly.

### CORS Issues
The backend uses Flask-CORS to allow requests from the React frontend. If you encounter CORS issues, ensure both services are running.

### Missing Dependencies
If you get import errors, make sure all packages in `requirements.txt` are installed correctly.
