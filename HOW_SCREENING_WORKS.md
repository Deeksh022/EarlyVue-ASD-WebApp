# How the ASD Screening Works

## Overview

When you click "Start Screening" in the web interface, it triggers the full `ASD_Detection.py` application on the backend, which opens a **fullscreen OpenCV window** for the actual screening process.

## Workflow

### 1. User Clicks "Start Screening"
- Frontend: User selects child and screening type
- Frontend: Clicks "Start Screening" button
- Frontend: Sends POST request to `http://localhost:5000/api/start_screening`

### 2. Backend Initializes
- Backend: Receives request
- Backend: Calls `screening_system.run_live_screening()`
- Backend: Opens fullscreen OpenCV window

### 3. Calibration Phase
A fullscreen window appears showing:
- Red circle in the center
- Instructions: "Look at the red circle" and "Press 'C' to Calibrate"

**User Action Required:**
- Look directly at the red circle
- Press **"C"** key to calibrate your gaze
- System captures your eye position as the baseline

### 4. Screening Phase (60 seconds)
After calibration, the screening begins:
- **White bouncing ball** appears on black screen
- **Follow the ball with your eyes** (don't move your head)
- System tracks your gaze using MediaPipe face mesh
- Gaze path is drawn in **red** on screen
- Current gaze point shown as **green circle**
- **Eye camera view** in top-right corner shows your eye
- **Metrics displayed** on screen:
  - Time elapsed
  - Fixations count
  - Saccades count
  - Fixation/Saccade ratio

**What's Being Measured:**
- Gaze velocity (speed of eye movements)
- Fixation patterns (when eyes stay still)
- Saccades (rapid eye movements)
- Gaze path smoothness
- Eye tracking accuracy

### 5. Completion
After 60 seconds (or pressing "Q" to exit):
- Screening stops
- System analyzes collected data
- Generates prediction using ML models:
  - Random Forest
  - SVM
  - Deep Neural Network
- Creates visual report (saved as `Screening_Report.png`)
- Returns results to frontend

### 6. Results Display
Frontend receives results containing:
- **Verdict**: "Autistic Syndrome" or "Not Autistic"
- **Confidence**: Probability score (0-1)
- **Model Predictions**: Individual model probabilities

Results are saved and displayed in the "All Results" page.

## Technical Details

### Backend Processing

```python
# When /api/start_screening is called:
result = screening_system.run_live_screening(
    video_path=None,  # Use webcam
    display=True      # Show fullscreen window
)
```

The `run_live_screening()` method:
1. Opens webcam (camera 0)
2. Creates fullscreen OpenCV window
3. Runs calibration loop
4. Runs 60-second screening loop
5. Processes each frame with MediaPipe
6. Tracks gaze coordinates
7. Calculates metrics
8. Generates final prediction
9. Creates visual report
10. Returns results

### Key Components

**MediaPipe Face Mesh:**
- Detects 468 facial landmarks
- Tracks eye position in real-time
- Calculates gaze direction

**Feature Extraction:**
- Mean/std velocity
- Fixation duration
- Saccade amplitude
- Gaze path length
- Smoothness metrics
- And 20+ more features

**ML Models:**
- **Random Forest**: Ensemble decision trees
- **SVM**: Support Vector Machine with calibration
- **DNN**: Deep Neural Network (TensorFlow/Keras)
- **Ensemble**: Weighted combination of all models

### Visual Report

The system generates a comprehensive report showing:
1. **Gaze Scan Path**: Complete eye movement trajectory
2. **Velocity Over Time**: Speed of eye movements
3. **Event Counts**: Fixations vs Saccades
4. **Heatmap**: Where gaze concentrated most
5. **Model Predictions**: Individual model probabilities

Report saved to: `backend/Screening_Report.png`

## User Instructions

### Before Starting:
1. Ensure good lighting
2. Position yourself comfortably
3. Camera should clearly see your face
4. Minimize head movements

### During Calibration:
1. Look at the red circle
2. Keep your head still
3. Press "C" when ready

### During Screening:
1. **Follow the white ball with your eyes only**
2. Don't move your head
3. Try to track the ball smoothly
4. Continue for full 60 seconds
5. Press "Q" only if you need to exit early

### After Screening:
- Results appear automatically
- Visual report is generated
- Check "All Results" page for history

## Troubleshooting

### Fullscreen Window Doesn't Appear
- Check backend terminal for errors
- Ensure OpenCV is installed
- Try running backend manually: `python backend/ASD_Detection.py`

### Calibration Fails
- Ensure face is clearly visible
- Improve lighting
- Move closer to camera
- Try again with "C" key

### Gaze Tracking Inaccurate
- Recalibrate by restarting screening
- Adjust `GAZE_SENSITIVITY` in `ASD_Detection.py` (line 60)
- Adjust `SMOOTHING_FACTOR` (line 61)

### Screening Exits Early
- Check if you pressed "Q" accidentally
- Ensure webcam stays connected
- Check backend logs for errors

### No Results Generated
- Need at least 50 frames of data
- Ensure screening runs for sufficient time
- Check backend terminal for errors

## Architecture

```
┌─────────────────────┐
│  React Frontend     │
│  (Browser)          │
│                     │
│  User clicks        │
│  "Start Screening"  │
└──────────┬──────────┘
           │ HTTP POST
           │ /api/start_screening
           ▼
┌─────────────────────┐
│  Flask Backend      │
│  (Python Server)    │
│                     │
│  Calls:             │
│  run_live_screening()│
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  OpenCV Window      │
│  (Fullscreen)       │
│                     │
│  - Calibration      │
│  - Ball tracking    │
│  - Gaze analysis    │
│  - 60 sec duration  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  MediaPipe          │
│  Face Mesh          │
│                     │
│  - Eye tracking     │
│  - Landmark detect  │
│  - Gaze calculation │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  ML Models          │
│  (RF, SVM, DNN)     │
│                     │
│  - Feature extract  │
│  - Prediction       │
│  - Ensemble result  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Results            │
│                     │
│  - Verdict          │
│  - Confidence       │
│  - Visual Report    │
│  - Return to web    │
└─────────────────────┘
```

## Files Involved

- **Frontend**: `src/pages/NewScreening.js`
- **Backend API**: `backend/screening_api.py`
- **Screening Logic**: `backend/ASD_Detection.py`
- **ML Models**: `backend/autism_models/*.pkl`, `*.keras`
- **Training Data**: `backend/srijan_features_only_with_groups.csv`
- **Report Output**: `backend/Screening_Report.png`

## Next Steps

After understanding this workflow, you can:
1. Customize screening parameters in `ASD_Detection.py`
2. Adjust sensitivity and smoothing factors
3. Modify the visual display
4. Add new features to extract
5. Train models with more data
6. Customize the report format
