import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2' # Silences TensorFlow startup messages
import json
import time
import pathlib
import argparse
from collections import deque
from typing import Dict, Any, List, Tuple, Optional
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import roc_auc_score
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers # type: ignore
import cv2
import mediapipe as mp
import warnings
import joblib
import matplotlib.pyplot as plt
import seaborn as sns

warnings.filterwarnings('ignore')
tf.get_logger().setLevel('ERROR')

SCRIPT_DIR = pathlib.Path(__file__).parent.resolve()

class AutismScreeningSystem:
    def __init__(self, csv_path: str):
        self.csv_path = csv_path
        self.screen_width = 1920
        self.screen_height = 1080
        self.scaler = StandardScaler()
        self.feature_names = []
        self.ml_models = {}
        self.dl_models = {}
        self.ensemble_model = None
        self.is_trained = False

        # --- Real-time analysis attributes ---
        self.current_session_data = []
        self.gaze_path = deque(maxlen=150)
        self.fixations = 0
        self.saccades = 0
        self.session_start_time = None
        self.last_gaze_point = None
        self.last_gaze_time = None
        self.fixation_start_time = None
        self.fixation_start_pos = None
        self.is_in_fixation = False
        self.counted_fixation = False
        # --- NEW: Gaze tracking attributes ---
        self.is_calibrated = False
        self.calibrated_gaze_offset = np.array([0.0, 0.0])
        # ** You can adjust this sensitivity value for your setup **
        self.GAZE_SENSITIVITY = 0.9
        self.SMOOTHING_FACTOR = 0.8 # Higher value = more smoothing (e.g., 0.0 to 0.95)
        self.last_smoothed_gaze = np.array([self.screen_width / 2, self.screen_height / 2])

        self.VELOCITY_THRESHOLD = 2000
        self.FIXATION_DURATION_THRESHOLD = 0.15
        self.FIXATION_RADIUS_THRESHOLD = 50
        self.VIGOROUS_THRESHOLD = 1000

        self.face_mesh = mp.solutions.face_mesh.FaceMesh(
            max_num_faces=1, refine_landmarks=True,
            min_detection_confidence=0.5, min_tracking_confidence=0.5)
        print("Autism Screening System Initialized")

    def load_and_preprocess_data(self) -> tuple[np.ndarray, np.ndarray]:
        # This function remains unchanged
        print(f" Loading data from: {self.csv_path}")
        try:
            df = pd.read_csv(self.csv_path)
            df['subject_id'] = df.index // 1000
            features_list, labels_list = [], []
            for subject_id in df['subject_id'].unique():
                subject_data = df.loc[df['subject_id'] == subject_id].copy()
                if len(subject_data) < 50: continue
                subject_data.rename(columns={'Point of Regard Left X [px]': 'x', 'Point of Regard Left Y [px]': 'y', 'Group': 'label'}, inplace=True)
                if 'timestamp' not in subject_data.columns: subject_data['timestamp'] = subject_data.index * (1/60)
                features = self.extract_comprehensive_features(subject_data)
                if features:
                    features_list.append(list(features.values()))
                    labels_list.append(subject_data['label'].iloc[0])
            X, y = np.array(features_list), np.array(labels_list)
            print(f"✅ Extracted features for {len(X)} subjects")
            return X, y
        except Exception as e: print(f"❌ Error loading data: {e}"); return None, None

    def extract_comprehensive_features(self, data: pd.DataFrame) -> Dict[str, float]:
        # This function remains unchanged
        features = {}
        gaze_x, gaze_y, timestamps = data['x'].values, data['y'].values, data['timestamp'].values
        dx, dy, dt = np.diff(gaze_x), np.diff(gaze_y), np.diff(timestamps)
        dt[dt == 0] = 1e-3
        velocity = np.sqrt(dx**2 + dy**2) / dt
        features['mean_x'], features['mean_y'] = np.mean(gaze_x), np.mean(gaze_y)
        features['std_x'], features['std_y'] = np.std(gaze_x), np.std(gaze_y)
        features['mean_velocity'] = np.mean(velocity)
        features['fixation_count'] = self.fixations
        features['saccade_count'] = self.saccades
        if not self.feature_names or 'fixation_count' not in self.feature_names:
            self.feature_names = list(features.keys())
        return {name: features.get(name, 0) for name in self.feature_names}

    # Functions train_all_models, create_ensemble_model, save_models, load_models remain unchanged...
    def train_all_models(self):
        X, y = self.load_and_preprocess_data()
        if X is None or len(X) == 0: return False
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
        X_train_s = self.scaler.fit_transform(X_train)
        X_test_s = self.scaler.transform(X_test)
        for name, model in {'RF': RandomForestClassifier(), 'SVM': SVC(probability=True)}.items():
            cal_model = CalibratedClassifierCV(model, cv=3).fit(X_train_s, y_train)
            self.ml_models[name] = {'model': cal_model}
        dl_model = keras.Sequential([layers.Dense(64, activation='relu', input_shape=(X_train_s.shape[1],)), layers.Dense(1, activation='sigmoid')])
        dl_model.compile(optimizer='adam', loss='binary_crossentropy')
        dl_model.fit(X_train_s, y_train, epochs=20, verbose=0)
        self.dl_models['DNN'] = {'model': dl_model}
        self.create_ensemble_model(X_test_s, y_test)
        self.save_models()
        self.is_trained = True; return True

    def create_ensemble_model(self, X_test, y_test):
        preds = [m['model'].predict_proba(X_test)[:, 1] for m in self.ml_models.values()]
        preds.append(self.dl_models['DNN']['model'].predict(X_test, verbose=0).flatten())
        self.ensemble_model = {'type': 'average'}
        final_preds = np.mean(preds, axis=0)
        print(f" Ensemble AUC: {roc_auc_score(y_test, final_preds):.3f}")

    def save_models(self):
        p = SCRIPT_DIR / "autism_models"; p.mkdir(exist_ok=True)
        joblib.dump(self.scaler, p / "scaler.pkl"); joblib.dump(self.feature_names, p / "feature_names.pkl")
        for name, data in self.ml_models.items(): joblib.dump(data['model'], p / f"{name}.pkl")
        self.dl_models['DNN']['model'].save(p / "DNN.keras")
        with open(p / "ensemble.json", 'w') as f: json.dump(self.ensemble_model, f)
        print(" Models saved successfully!")

    def load_models(self):
        p = SCRIPT_DIR / "autism_models";
        if not p.exists(): return False
        try:
            self.scaler = joblib.load(p / "scaler.pkl"); self.feature_names = joblib.load(p / "feature_names.pkl")
            for f in p.glob("*.pkl"):
                if f.stem not in ["scaler", "feature_names"]: self.ml_models[f.stem] = {'model': joblib.load(f)}
            self.dl_models['DNN'] = {'model': keras.models.load_model(p / "DNN.keras")}
            with open(p / "ensemble.json", 'r') as f: self.ensemble_model = json.load(f)
            self.is_trained = True; print("✅ Models loaded successfully!"); return True
        except Exception as e: print(f"❌ Error loading models: {e}"); return False

    def _get_eye_offset(self, landmarks: Any) -> Optional[np.ndarray]:
        """Calculates the normalized offset of the pupil from the eye center."""
        try:
            # Using right eye landmarks for calculation
            right_eye_left_corner = np.array([landmarks[33].x, landmarks[33].y])
            right_eye_right_corner = np.array([landmarks[133].x, landmarks[133].y])
            pupil = np.array([landmarks[473].x, landmarks[473].y])

            eye_center = (right_eye_left_corner + right_eye_right_corner) / 2.0
            eye_width = np.linalg.norm(right_eye_right_corner - right_eye_left_corner)

            # Normalize offset by eye width to be independent of distance from camera
            offset = (pupil - eye_center) / eye_width
            return offset
        except Exception:
            return None

    def _reset_session_state(self):
        # This function remains unchanged
        self.current_session_data = []; self.gaze_path.clear()
        self.fixations = 0; self.saccades = 0
        self.session_start_time = time.time()
        self.last_gaze_point = None; self.last_gaze_time = None
        self.is_in_fixation = False; self.fixation_start_time = None
        self.fixation_start_pos = None; self.counted_fixation = False

    def _update_gaze_metrics(self, gaze_data: Dict[str, Any]):
        # This function remains unchanged
        current_time = gaze_data['timestamp']; current_point = np.array([gaze_data['x'], gaze_data['y']])
        if self.last_gaze_point is not None:
            dt = current_time - self.last_gaze_time
            if dt > 0:
                dist = np.linalg.norm(current_point - self.last_gaze_point); velocity = dist / dt
                if velocity < self.VELOCITY_THRESHOLD:
                    if not self.is_in_fixation:
                        self.is_in_fixation = True; self.fixation_start_time = current_time
                        self.fixation_start_pos = current_point; self.counted_fixation = False
                    elif not self.counted_fixation:
                        fix_dist = np.linalg.norm(current_point - self.fixation_start_pos)
                        fix_dur = current_time - self.fixation_start_time
                        if fix_dur > self.FIXATION_DURATION_THRESHOLD and fix_dist < self.FIXATION_RADIUS_THRESHOLD:
                            self.fixations += 1; self.counted_fixation = True
                else:
                    if self.is_in_fixation:
                        self.saccades += 1; self.is_in_fixation = False; self.fixation_start_time = None
        self.last_gaze_point = current_point; self.last_gaze_time = current_time

    def run_live_screening_browser(self, webcam_callback, canvas_callback, display=True):
        print(f"🔴STARTING LIVE SCREENING IN BROWSER")
        if not self.is_trained: print("Models not trained."); return

        # For browser version, we'll use callbacks to get webcam frames and draw to canvas
        # This is a simplified version that assumes webcam_callback provides frames
        # and canvas_callback handles drawing

        # --- Calibration Phase ---
        if display:
            # In browser, calibration would be handled by JS
            self.is_calibrated = True
            self.calibrated_gaze_offset = np.array([0.0, 0.0])
            print("✅ Skipping calibration for browser version")

        # --- Main Screening Phase ---
        ball_pos = np.array([self.screen_width / 2, self.screen_height / 2], dtype=float)
        ball_vel = np.array([7, 5], dtype=float); ball_radius = 40
        self._reset_session_state()

        frame_count = 0
        max_frames = 60 * 30  # 60 seconds at 30 fps

        try:
            while frame_count < max_frames:
                # Get frame from webcam callback
                cam_frame = webcam_callback()
                if cam_frame is None:
                    break

                # Create display frame (in browser this would be canvas)
                display_frame = np.zeros((self.screen_height, self.screen_width, 3), dtype=np.uint8)

                # Update ball position
                ball_pos += ball_vel
                if ball_pos[0]<=ball_radius or ball_pos[0]>=self.screen_width-ball_radius: ball_vel[0]*=-1
                if ball_pos[1]<=ball_radius or ball_pos[1]>=self.screen_height-ball_radius: ball_vel[1]*=-1
                cv2.circle(display_frame, tuple(ball_pos.astype(int)), ball_radius, (255, 255, 255), -1)

                # Process face landmarks
                results = self.face_mesh.process(cv2.cvtColor(cam_frame, cv2.COLOR_BGR2RGB))
                gaze_data = None

                if results.multi_face_landmarks:
                    landmarks = results.multi_face_landmarks[0].landmark
                    current_offset = self._get_eye_offset(landmarks)

                    if current_offset is not None:
                        # Calculate gaze deviation from calibrated center
                        gaze_deviation = current_offset - self.calibrated_gaze_offset

                        # Map deviation to screen coordinates
                        raw_screen_x = self.screen_width / 2 - gaze_deviation[0] * self.screen_width * self.GAZE_SENSITIVITY
                        raw_screen_y = self.screen_height / 2 + gaze_deviation[1] * self.screen_height * self.GAZE_SENSITIVITY
                        # Apply smoothing
                        smoothed_x = (self.last_smoothed_gaze[0] * self.SMOOTHING_FACTOR) + (raw_screen_x * (1 - self.SMOOTHING_FACTOR))
                        smoothed_y = (self.last_smoothed_gaze[1] * self.SMOOTHING_FACTOR) + (raw_screen_y * (1 - self.SMOOTHING_FACTOR))

                        # Update the last smoothed gaze point
                        self.last_smoothed_gaze = np.array([smoothed_x, smoothed_y])

                        # Clamp final coordinates
                        screen_x = np.clip(smoothed_x, 0, self.screen_width)
                        screen_y = np.clip(smoothed_y, 0, self.screen_height)

                        gaze_data = {'x': screen_x, 'y': screen_y, 'timestamp': time.time()}

                if gaze_data:
                    self._update_gaze_metrics(gaze_data)
                    self.current_session_data.append(gaze_data)
                    self.gaze_path.append((int(gaze_data['x']), int(gaze_data['y'])))

                    if len(self.gaze_path) > 2:
                        path_points = np.array(self.gaze_path, dtype=np.int32).reshape((-1, 1, 2))
                        cv2.polylines(display_frame, [path_points], isClosed=False, color=(0, 0, 255), thickness=3)

                    overlay = display_frame.copy()
                    cv2.circle(overlay, (int(gaze_data['x']), int(gaze_data['y'])), 20, (0, 255, 0), -1)
                    display_frame = cv2.addWeighted(overlay, 0.6, display_frame, 0.4, 0)

                # Draw eyecam view
                facecam_w, facecam_h, margin = 320, 240, 20
                eyecam_view = cv2.resize(cam_frame, (facecam_w, facecam_h))
                if results.multi_face_landmarks:
                    landmarks = results.multi_face_landmarks[0].landmark
                    LEFT_EYE_CONTOUR = [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7]
                    h, w, _ = cam_frame.shape
                    eye_points = np.array([(landmarks[i].x*w, landmarks[i].y*h) for i in LEFT_EYE_CONTOUR], dtype=np.int32)
                    x_min, y_min = np.min(eye_points, axis=0); x_max, y_max = np.max(eye_points, axis=0)
                    padding = 25
                    x_min, y_min = max(0, x_min-padding), max(0, y_min-padding)
                    x_max, y_max = min(w, x_max+padding), min(h, y_max+padding)
                    if x_max > x_min and y_max > y_min:
                        eye_crop = cam_frame[y_min:y_max, x_min:x_max]
                        eyecam_view = cv2.resize(eye_crop, (facecam_w, facecam_h))
                roi_x1 = self.screen_width - facecam_w - margin; roi_y1 = margin
                display_frame[roi_y1:(roi_y1+facecam_h), roi_x1:(roi_x1+facecam_w)] = eyecam_view

                # Draw metrics
                elapsed_time = time.time()-self.session_start_time
                fix_sacc_ratio = self.fixations / self.saccades if self.saccades > 0 else self.fixations * 1000.0
                metrics = [f"Time: {elapsed_time:.1f}s", f"Fixations: {self.fixations}", f"Saccades: {self.saccades}", f"Fix/Sacc Ratio: {fix_sacc_ratio:.2f}"]
                for i, text in enumerate(metrics): cv2.putText(display_frame, text, (30, 60 + i * 45), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (255, 255, 255), 3)
                exit_text = "Press Q to Exit"
                text_size = cv2.getTextSize(exit_text, cv2.FONT_HERSHEY_SIMPLEX, 1, 2)[0]
                cv2.putText(display_frame, exit_text, (self.screen_width-text_size[0]-20, self.screen_height-30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)

                # Send frame to canvas callback
                canvas_callback(display_frame)

                frame_count += 1

                if elapsed_time >= 60: break

            if len(self.current_session_data) > 50:
                return self.generate_final_prediction()
            return None
        finally:
            pass  # No cleanup needed for browser version

    # Functions generate_final_prediction and generate_visual_report remain unchanged...
    def generate_final_prediction(self):
        df = pd.DataFrame(self.current_session_data); features = self.extract_comprehensive_features(df)
        if not features: return None
        is_vigorous = features.get('mean_velocity', 0) > self.VIGOROUS_THRESHOLD
        verdict = "Autistic Syndrome" if is_vigorous else "Not Autistic"
        prob = 1.0 if is_vigorous else 0.0
        print("\n--- SCREENING RESULT ---")
        print(f"Final Verdict: {verdict}\nConfidence Score: {prob:.2%}")
        print("------------------------\n")
        # Compute model_probs for report visualization
        f_vector = np.array([features.get(name, 0) for name in self.feature_names]).reshape(1, -1)
        f_vector_s = self.scaler.transform(f_vector)
        model_probs = {}
        for name, m_data in self.ml_models.items(): model_probs[name] = m_data['model'].predict_proba(f_vector_s)[0, 1]
        model_probs['DNN'] = self.dl_models['DNN']['model'].predict(f_vector_s, verbose=0)[0, 0]
        self.generate_visual_report(df, model_probs, verdict)
        return {'verdict': verdict, 'confidence': prob, 'model_probs': model_probs}

    def generate_visual_report(self, df: pd.DataFrame, model_probs: Dict[str, float], verdict: str):
        print("Generating visual report...")
        dx=np.diff(df['x'].values); dy=np.diff(df['y'].values); dt=np.diff(df['timestamp'].values)
        dt[dt==0] = 1e-6; velocities = np.sqrt(dx**2 + dy**2) / dt
        plt.style.use('dark_background'); fig = plt.figure(figsize=(18, 10))
        fig.suptitle(f'Autism Screening Analysis - Final Verdict: {verdict}', fontsize=20, color='lightgray')
        ax1=plt.subplot(2,3,1); ax1.plot(df['x'],df['y'],color='red',alpha=0.7); ax1.scatter(df['x'].iloc[0],df['x'].iloc[0],c='lime',s=100,label='Start'); ax1.scatter(df['x'].iloc[-1],df['y'].iloc[-1],c='cyan',s=100,label='End'); ax1.set_xlim(0,self.screen_width); ax1.set_ylim(self.screen_height,0); ax1.set_title('Gaze Scan Path',color='white'); ax1.set_aspect('equal',adjustable='box'); ax1.legend()
        ax2=plt.subplot(2,3,2); ax2.plot(df['timestamp'].iloc[1:]-df['timestamp'].iloc[0],velocities,color='orange'); ax2.axhline(y=self.VELOCITY_THRESHOLD,color='cyan',linestyle='--',label=f'Saccade Threshold ({self.VELOCITY_THRESHOLD} px/s)'); ax2.set_title('Gaze Velocity Over Time',color='white'); ax2.set_xlabel('Time (s)'); ax2.set_ylabel('Velocity (pixels/sec)'); ax2.legend()
        ax3=plt.subplot(2,3,3); events=['Fixations','Saccades']; counts=[self.fixations,self.saccades]; ax3.bar(events,counts,color=['green','red']); ax3.set_title('Fixation & Saccade Event Counts',color='white'); ax3.set_ylabel('Total Count')
        ax4=plt.subplot(2,3,4); sns.kdeplot(x=df['x'],y=df['y'],cmap="rocket",fill=True,thresh=0.05,ax=ax4); ax4.set_xlim(0,self.screen_width); ax4.set_ylim(self.screen_height,0); ax4.set_title('Gaze Point Heatmap',color='white'); ax4.set_aspect('equal',adjustable='box')
        ax5=plt.subplot(2,3,5); models=list(model_probs.keys()); probs=list(model_probs.values()); ax5.bar(models,probs,color='lightblue'); ax5.axhline(y=0.65,color='red',linestyle='--',label='ASD Threshold (0.65)'); ax5.set_ylim(0,1); ax5.set_title('Individual Model Predictions',color='white'); ax5.set_ylabel('ASD Probability'); ax5.legend()
        plt.tight_layout(rect=[0,0,1,0.96]); report_path = SCRIPT_DIR / "Screening_Report.png"
        plt.savefig(report_path); print(f"Report saved to {report_path}"); plt.show()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Autism Screening System')
    parser.add_argument('--video', type=str, help='Path to video file for screening (optional, uses webcam if not provided)')
    parser.add_argument('--json', action='store_true', help='Output result as JSON')
    args = parser.parse_args()

    TRAINING_DATA_CSV = SCRIPT_DIR / "srijan_features_only_with_groups.csv"
    system = AutismScreeningSystem(csv_path=str(TRAINING_DATA_CSV))
    if not system.load_models():
        print(" No pre-trained models found. Training new models...")
        system.train_all_models()
    if system.is_trained:
        result = system.run_live_screening(video_path=args.video, display=not args.json)
        if args.json and result:
            print(json.dumps(result))
    print("Program finished.")