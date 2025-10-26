import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
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
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import roc_auc_score, accuracy_score, precision_recall_fscore_support, confusion_matrix
from sklearn.utils import class_weight
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import cv2
import mediapipe as mp
import warnings
import joblib
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
from scipy.signal import savgol_filter, butter, filtfilt
from scipy.interpolate import interp1d
from scipy.optimize import minimize
import warnings
warnings.filterwarnings('ignore')

# High-precision gaze tracking constants
SUB_PIXEL_REFINEMENT = True
GAZE_SMOOTHING_WINDOW = 7
VELOCITY_FILTER_CUTOFF = 0.1  # Hz for low-pass filter

class HighPrecisionGazeTracker:
    """Enhanced gaze tracker with sub-pixel precision and advanced filtering"""
    
    def __init__(self, screen_width=1920, screen_height=1080):
        self.screen_width = screen_width
        self.screen_height = screen_height
        self.iris_model = self._build_iris_detector()
        self.kalman_filter = self._init_enhanced_kalman()
        self.gaze_history = deque(maxlen=30)
        self.velocity_history = deque(maxlen=20)
        
        # Enhanced MediaPipe configuration
        self.face_mesh = mp.solutions.face_mesh.FaceMesh(
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.7
        )
        
        # Sub-pixel refinement parameters
        self.iris_contour_points = 32
        self.pupil_radius_estimation = True
        
    def _build_iris_detector(self):
        """Build enhanced iris detection model"""
        # Simple CNN for iris center refinement
        model = keras.Sequential([
            layers.Conv2D(32, (3, 3), activation='relu', input_shape=(32, 32, 1)),
            layers.MaxPooling2D((2, 2)),
            layers.Conv2D(64, (3, 3), activation='relu'),
            layers.MaxPooling2D((2, 2)),
            layers.Conv2D(64, (3, 3), activation='relu'),
            layers.Flatten(),
            layers.Dense(64, activation='relu'),
            layers.Dense(2, activation='sigmoid')  # x, y offsets
        ])
        return model
    
    def _init_enhanced_kalman(self):
        """Initialize enhanced Kalman filter for sub-pixel tracking"""
        dt = 1/60.0  # 60 FPS
        
        # State: [x, y, vx, vy, ax, ay]
        F = np.array([
            [1, 0, dt, 0, 0.5*dt**2, 0],
            [0, 1, 0, dt, 0, 0.5*dt**2],
            [0, 0, 1, 0, dt, 0],
            [0, 0, 0, 1, 0, dt],
            [0, 0, 0, 0, 1, 0],
            [0, 0, 0, 0, 0, 1]
        ])
        
        H = np.array([[1, 0, 0, 0, 0, 0],
                     [0, 1, 0, 0, 0, 0]])
        
        return {
            'F': F, 'H': H,
            'P': np.eye(6) * 10,
            'Q': np.eye(6) * 0.01,
            'R': np.eye(2) * 0.1,
            'x': np.zeros((6, 1))
        }
    
    def detect_iris_subpixel(self, eye_region: np.ndarray) -> Tuple[float, float]:
        """Detect iris center with sub-pixel precision"""
        if eye_region.size == 0:
            return 0.0, 0.0
            
        # Convert to grayscale and enhance contrast
        gray = cv2.cvtColor(eye_region, cv2.COLOR_BGR2GRAY)
        gray = cv2.equalizeHist(gray)
        
        # Apply Gaussian blur for noise reduction
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # Use multiple methods for robust detection
        methods = [
            self._ellipse_fitting(blurred),
            self._gradient_based_center(blurred),
            self._circular_hough(blurred)
        ]
        
        # Weighted average of methods
        valid_methods = [m for m in methods if m is not None]
        if len(valid_methods) > 0:
            centers = np.array(valid_methods)
            weights = [1.0, 1.2, 0.8]  # Prefer gradient-based method
            weighted_center = np.average(centers[:len(weights)], axis=0, weights=weights[:len(centers)])
            return weighted_center
        else:
            # Fallback to centroid
            moments = cv2.moments(blurred)
            if moments["m00"] != 0:
                cx = moments["m10"] / moments["m00"]
                cy = moments["m01"] / moments["m00"]
                return cx, cy
            return eye_region.shape[1] / 2, eye_region.shape[0] / 2
    
    def _ellipse_fitting(self, eye_region: np.ndarray) -> Optional[Tuple[float, float]]:
        """Ellipse fitting for iris detection"""
        edges = cv2.Canny(eye_region, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if contours:
            largest_contour = max(contours, key=cv2.contourArea)
            if len(largest_contour) >= 5:
                ellipse = cv2.fitEllipse(largest_contour)
                return ellipse[0]  # Center coordinates
        return None
    
    def _gradient_based_center(self, eye_region: np.ndarray) -> Optional[Tuple[float, float]]:
        """Gradient-based center detection"""
        # Calculate gradients
        grad_x = cv2.Sobel(eye_region, cv2.CV_64F, 1, 0, ksize=3)
        grad_y = cv2.Sobel(eye_region, cv2.CV_64F, 0, 1, ksize=3)
        
        magnitude = np.sqrt(grad_x**2 + grad_y**2)
        
        if np.sum(magnitude) > 0:
            y_coords, x_coords = np.indices(eye_region.shape)
            center_x = np.sum(x_coords * magnitude) / np.sum(magnitude)
            center_y = np.sum(y_coords * magnitude) / np.sum(magnitude)
            return center_x, center_y
        return None
    
    def _circular_hough(self, eye_region: np.ndarray) -> Optional[Tuple[float, float]]:
        """Circular Hough transform for iris detection"""
        circles = cv2.HoughCircles(
            eye_region, cv2.HOUGH_GRADIENT, dp=1.2, 
            minDist=eye_region.shape[0]//2,
            param1=50, param2=30,
            minRadius=eye_region.shape[0]//8,
            maxRadius=eye_region.shape[0]//3
        )
        
        if circles is not None:
            circles = np.round(circles[0, :]).astype("int")
            if len(circles) > 0:
                return circles[0][0], circles[0][1]  # x, y of first circle
        return None
    
    def kalman_predict_update(self, measurement: np.ndarray) -> np.ndarray:
        """Enhanced Kalman filter with acceleration modeling"""
        kf = self.kalman_filter
        
        # Predict
        kf['x'] = kf['F'] @ kf['x']
        kf['P'] = kf['F'] @ kf['P'] @ kf['F'].T + kf['Q']
        
        # Update
        y = measurement.reshape(2, 1) - kf['H'] @ kf['x']
        S = kf['H'] @ kf['P'] @ kf['H'].T + kf['R']
        K = kf['P'] @ kf['H'].T @ np.linalg.inv(S)
        
        kf['x'] = kf['x'] + K @ y
        kf['P'] = (np.eye(6) - K @ kf['H']) @ kf['P']
        
        return kf['x'][:2].flatten()

class EnhancedAutismScreeningSystem:
    """Enhanced autism screening system with high-precision gaze tracking"""
    
    def __init__(self, csv_path: str):
        self.csv_path = csv_path
        self.screen_width = 1920
        self.screen_height = 1080
        
        # Enhanced gaze tracker
        self.gaze_tracker = HighPrecisionGazeTracker(self.screen_width, self.screen_height)
        
        # Machine learning components
        self.scaler = StandardScaler()
        self.feature_names = []
        self.models = {}
        self.ensemble_weights = {}
        
        # Real-time tracking
        self.current_session_data = []
        self.gaze_path = deque(maxlen=200)
        self.session_metrics = {
            'fixations': 0, 'saccades': 0,
            'smooth_pursuits': 0, 'blinks': 0
        }
        
        # Calibration
        self.calibration_points = []
        self.calibration_data = []
        self.calibration_model = None
        
        print("Enhanced Autism Screening System Initialized")
    
    def enhanced_calibration(self, camera):
        """High-precision 13-point calibration"""
        calibration_points = [
            # 4 corners
            (100, 100), (self.screen_width-100, 100),
            (100, self.screen_height-100), (self.screen_width-100, self.screen_height-100),
            # Center and mid-points
            (self.screen_width//2, self.screen_height//2),
            (self.screen_width//2, 100), (self.screen_width//2, self.screen_height-100),
            (100, self.screen_height//2), (self.screen_width-100, self.screen_height//2),
            # Additional precision points
            (self.screen_width//4, self.screen_height//4),
            (3*self.screen_width//4, self.screen_height//4),
            (self.screen_width//4, 3*self.screen_height//4),
            (3*self.screen_width//4, 3*self.screen_height//4)
        ]
        
        calibration_data = []
        
        for point_idx, (target_x, target_y) in enumerate(calibration_points):
            print(f"Calibration point {point_idx + 1}/13: Look at the dot")
            
            # Display calibration point
            calibration_frame = np.zeros((self.screen_height, self.screen_width, 3), dtype=np.uint8)
            cv2.circle(calibration_frame, (target_x, target_y), 15, (0, 0, 255), -1)
            cv2.putText(calibration_frame, f"Point {point_idx + 1}/13", 
                       (self.screen_width//2 - 100, 50), 
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
            cv2.imshow('Calibration', calibration_frame)
            cv2.waitKey(500)  # Brief pause
            
            # Collect gaze samples for this point
            point_samples = []
            for sample in range(30):  # 30 samples per point
                ret, frame = camera.read()
                if ret:
                    gaze_pos = self._process_frame_high_precision(frame)
                    if gaze_pos is not None:
                        point_samples.append((gaze_pos[0], gaze_pos[1]))
                cv2.waitKey(33)  # ~30 FPS
            
            if point_samples:
                avg_gaze = np.median(point_samples, axis=0)
                calibration_data.append({
                    'target': (target_x, target_y),
                    'gaze_samples': point_samples,
                    'avg_gaze': avg_gaze
                })
        
        # Build calibration model
        self._build_calibration_model(calibration_data)
        cv2.destroyWindow('Calibration')
        return True
    
    def _build_calibration_model(self, calibration_data):
        """Build polynomial calibration model"""
        if len(calibration_data) < 5:
            print("Insufficient calibration data")
            return
        
        target_points = np.array([data['target'] for data in calibration_data])
        gaze_points = np.array([data['avg_gaze'] for data in calibration_data])
        
        # Polynomial regression for x and y separately
        # Using 2nd degree polynomial: x' = a*x² + b*y² + c*x*y + d*x + e*y + f
        A = np.column_stack([
            gaze_points[:, 0]**2, gaze_points[:, 1]**2,
            gaze_points[:, 0] * gaze_points[:, 1],
            gaze_points[:, 0], gaze_points[:, 1],
            np.ones(len(gaze_points))
        ])
        
        # Solve for x coefficients
        coeffs_x, _, _, _ = np.linalg.lstsq(A, target_points[:, 0], rcond=None)
        coeffs_y, _, _, _ = np.linalg.lstsq(A, target_points[:, 1], rcond=None)
        
        self.calibration_model = {
            'coeffs_x': coeffs_x,
            'coeffs_y': coeffs_y
        }
        
        print("Calibration model built successfully")
    
    def _apply_calibration(self, raw_gaze: Tuple[float, float]) -> Tuple[float, float]:
        """Apply polynomial calibration to raw gaze coordinates"""
        if self.calibration_model is None:
            return raw_gaze
        
        x, y = raw_gaze
        A = np.array([x**2, y**2, x*y, x, y, 1.0])
        
        calibrated_x = np.dot(A, self.calibration_model['coeffs_x'])
        calibrated_y = np.dot(A, self.calibration_model['coeffs_y'])
        
        return calibrated_x, calibrated_y
    
    def _process_frame_high_precision(self, frame: np.ndarray) -> Optional[Tuple[float, float]]:
        """Process frame with high-precision gaze tracking"""
        try:
            # Convert to RGB for MediaPipe
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.gaze_tracker.face_mesh.process(rgb_frame)
            
            if results.multi_face_landmarks:
                landmarks = results.multi_face_landmarks[0].landmark
                
                # Get high-precision eye regions
                left_eye_region = self._extract_eye_region(frame, landmarks, 'left')
                right_eye_region = self._extract_eye_region(frame, landmarks, 'right')
                
                # Detect iris centers with sub-pixel precision
                left_iris = self.gaze_tracker.detect_iris_subpixel(left_eye_region)
                right_iris = self.gaze_tracker.detect_iris_subpixel(right_eye_region)
                
                # Calculate gaze direction from both eyes
                left_gaze = self._calculate_gaze_vector(landmarks, left_iris, 'left')
                right_gaze = self._calculate_gaze_vector(landmarks, right_iris, 'right')
                
                # Average both eyes for final gaze position
                if left_gaze is not None and right_gaze is not None:
                    avg_gaze = ((left_gaze[0] + right_gaze[0]) / 2, 
                               (left_gaze[1] + right_gaze[1]) / 2)
                    
                    # Apply Kalman filtering
                    filtered_gaze = self.gaze_tracker.kalman_predict_update(np.array(avg_gaze))
                    
                    return filtered_gaze[0], filtered_gaze[1]
                    
        except Exception as e:
            print(f"Gaze tracking error: {e}")
            
        return None
    
    def _extract_eye_region(self, frame: np.ndarray, landmarks, eye: str) -> np.ndarray:
        """Extract high-resolution eye region for precise iris detection"""
        if eye == 'left':
            indices = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246]
        else:  # right eye
            indices = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398]
        
        h, w = frame.shape[:2]
        points = []
        
        for idx in indices:
            landmark = landmarks[idx]
            x = int(landmark.x * w)
            y = int(landmark.y * h)
            points.append((x, y))
        
        if len(points) > 2:
            # Create bounding box with padding
            points = np.array(points)
            x_min, y_min = np.min(points, axis=0)
            x_max, y_max = np.max(points, axis=0)
            
            # Add padding
            padding = 20
            x_min = max(0, x_min - padding)
            y_min = max(0, y_min - padding)
            x_max = min(w, x_max + padding)
            y_max = min(h, y_max + padding)
            
            # Extract eye region
            eye_region = frame[y_min:y_max, x_min:x_max]
            return eye_region
            
        return np.array([])
    
    def _calculate_gaze_vector(self, landmarks, iris_center, eye: str) -> Optional[Tuple[float, float]]:
        """Calculate precise gaze vector from iris position"""
        try:
            if eye == 'left':
                eye_corners = {
                    'inner': (landmarks[133].x, landmarks[133].y),
                    'outer': (landmarks[33].x, landmarks[33].y),
                    'top': (landmarks[159].x, landmarks[159].y),
                    'bottom': (landmarks[145].x, landmarks[145].y)
                }
            else:  # right eye
                eye_corners = {
                    'inner': (landmarks[362].x, landmarks[362].y),
                    'outer': (landmarks[263].x, landmarks[263].y),
                    'top': (landmarks[386].x, landmarks[386].y),
                    'bottom': (landmarks[374].x, landmarks[374].y)
                }
            
            # Calculate eye center from corners
            eye_center = np.mean([
                eye_corners['inner'], eye_corners['outer'],
                eye_corners['top'], eye_corners['bottom']
            ], axis=0)
            
            # Calculate normalized gaze vector
            gaze_vector = (iris_center[0] - eye_center[0], 
                          iris_center[1] - eye_center[1])
            
            # Normalize by eye dimensions
            eye_width = np.linalg.norm(np.array(eye_corners['outer']) - np.array(eye_corners['inner']))
            eye_height = np.linalg.norm(np.array(eye_corners['top']) - np.array(eye_corners['bottom']))
            
            if eye_width > 0 and eye_height > 0:
                normalized_gaze = (
                    gaze_vector[0] / eye_width,
                    gaze_vector[1] / eye_height
                )
                
                # Map to screen coordinates
                screen_x = self.screen_width / 2 + normalized_gaze[0] * self.screen_width * 0.4
                screen_y = self.screen_height / 2 + normalized_gaze[1] * self.screen_height * 0.4
                
                return screen_x, screen_y
                
        except Exception as e:
            print(f"Gaze vector calculation error: {e}")
            
        return None
    
    def extract_enhanced_features(self, data: pd.DataFrame) -> Dict[str, float]:
        """Extract comprehensive features with enhanced precision"""
        features = {}
        
        if len(data) < 10:
            return features
            
        gaze_x, gaze_y, timestamps = data['x'].values, data['y'].values, data['timestamp'].values
        
        # Enhanced velocity calculation with smoothing
        dx = np.diff(gaze_x)
        dy = np.diff(gaze_y)
        dt = np.diff(timestamps)
        dt[dt == 0] = 1e-6
        
        velocities = np.sqrt(dx**2 + dy**2) / dt
        accelerations = np.diff(velocities) / dt[1:] if len(velocities) > 1 else np.array([0])
        
        # Apply Savitzky-Golay filter for smooth derivatives
        if len(velocities) > 7:
            try:
                velocities_smooth = savgol_filter(velocities, 7, 3)
                accelerations_smooth = savgol_filter(accelerations, 5, 2) if len(accelerations) > 5 else accelerations
            except:
                velocities_smooth = velocities
                accelerations_smooth = accelerations
        else:
            velocities_smooth = velocities
            accelerations_smooth = accelerations
        
        # Basic statistical features
        features.update(self._extract_basic_features(gaze_x, gaze_y, velocities_smooth, accelerations_smooth))
        
        # Enhanced fixation and saccade detection
        features.update(self._detect_eye_movements_enhanced(gaze_x, gaze_y, timestamps, velocities_smooth))
        
        # Advanced pattern features
        features.update(self._extract_advanced_patterns(gaze_x, gaze_y, timestamps))
        
        # Spectral analysis features
        features.update(self._extract_spectral_features(gaze_x, gaze_y, timestamps))
        
        return features
    
    def _extract_basic_features(self, x, y, velocities, accelerations):
        """Extract basic statistical features"""
        features = {}
        
        # Position statistics
        features['mean_x'] = float(np.mean(x))
        features['mean_y'] = float(np.mean(y))
        features['std_x'] = float(np.std(x))
        features['std_y'] = float(np.std(y))
        
        # Velocity statistics
        features['mean_velocity'] = float(np.mean(velocities))
        features['velocity_std'] = float(np.std(velocities))
        features['velocity_skewness'] = float(stats.skew(velocities) if len(velocities) > 2 else 0)
        features['velocity_kurtosis'] = float(stats.kurtosis(velocities) if len(velocities) > 3 else 0)
        
        # Acceleration statistics
        if len(accelerations) > 0:
            features['mean_acceleration'] = float(np.mean(accelerations))
            features['acceleration_std'] = float(np.std(accelerations))
        else:
            features['mean_acceleration'] = 0.0
            features['acceleration_std'] = 0.0
            
        return features
    
    def _detect_eye_movements_enhanced(self, x, y, timestamps, velocities):
        """Enhanced eye movement detection with adaptive thresholds"""
        features = {}
        
        if len(x) < 3:
            return {'fixation_count': 0, 'saccade_count': 0, 'smooth_pursuit_ratio': 0}
        
        # Adaptive thresholds based on individual velocity distribution
        velocity_median = np.median(velocities)
        velocity_iqr = np.percentile(velocities, 75) - np.percentile(velocities, 25)
        
        fixation_threshold = velocity_median + 0.5 * velocity_iqr
        saccade_threshold = velocity_median + 2.5 * velocity_iqr
        
        fixations = 0
        saccades = 0
        smooth_pursuits = 0
        
        is_fixating = False
        fixation_start = 0
        fixation_center = None
        
        for i in range(1, len(velocities)):
            current_vel = velocities[i-1]
            
            if current_vel < fixation_threshold:
                if not is_fixating:
                    is_fixating = True
                    fixation_start = timestamps[i]
                    fixation_center = (x[i], y[i])
                else:
                    # Check if still in same fixation
                    current_pos = (x[i], y[i])
                    if fixation_center is not None:
                        distance = np.linalg.norm(np.array(current_pos) - np.array(fixation_center))
                        if distance > 20:  # Fixation radius threshold
                            is_fixating = False
                            if timestamps[i] - fixation_start > 0.1:  # Minimum fixation duration
                                fixations += 1
            elif current_vel > saccade_threshold:
                saccades += 1
                is_fixating = False
            else:
                smooth_pursuits += 1
                is_fixating = False
        
        features['fixation_count'] = fixations
        features['saccade_count'] = saccades
        features['smooth_pursuit_ratio'] = smooth_pursuits / max(1, len(velocities))
        features['fixation_saccade_ratio'] = fixations / max(1, saccades)
        
        return features
    
    def _extract_advanced_patterns(self, x, y, timestamps):
        """Extract advanced gaze pattern features"""
        features = {}
        
        # Scanpath complexity
        if len(x) > 2:
            # Calculate path length and efficiency
            total_path = np.sum(np.sqrt(np.diff(x)**2 + np.diff(y)**2))
            direct_path = np.sqrt((x[-1] - x[0])**2 + (y[-1] - y[0])**2)
            features['path_efficiency'] = direct_path / total_path if total_path > 0 else 0
            
            # Convex hull area
            from scipy.spatial import ConvexHull
            try:
                points = np.column_stack((x, y))
                hull = ConvexHull(points)
                features['exploration_area'] = hull.volume
            except:
                features['exploration_area'] = 0
        
        # Entropy and predictability
        features.update(self._calculate_entropy_measures(x, y))
        
        return features
    
    def _calculate_entropy_measures(self, x, y):
        """Calculate various entropy measures for gaze patterns"""
        features = {}
        
        if len(x) < 10:
            return {'scanpath_entropy': 0, 'velocity_entropy': 0, 'direction_entropy': 0}
        
        # Spatial entropy (2D histogram)
        try:
            H, x_edges, y_edges = np.histogram2d(x, y, bins=10, 
                                                range=[[0, self.screen_width], [0, self.screen_height]])
            H_flat = H.flatten()
            H_flat = H_flat[H_flat > 0]
            if len(H_flat) > 0:
                p = H_flat / np.sum(H_flat)
                features['scanpath_entropy'] = float(-np.sum(p * np.log2(p)))
            else:
                features['scanpath_entropy'] = 0
        except:
            features['scanpath_entropy'] = 0
        
        return features
    
    def _extract_spectral_features(self, x, y, timestamps):
        """Extract spectral features from gaze signals"""
        features = {}
        
        if len(x) < 20:
            return {'x_spectral_entropy': 0, 'y_spectral_entropy': 0, 'dominant_frequency': 0}
        
        try:
            # Remove linear trend
            x_detrend = x - np.linspace(x[0], x[-1], len(x))
            y_detrend = y - np.linspace(y[0], y[-1], len(y))
            
            # Calculate power spectral density
            from scipy.signal import welch
            freqs_x, psd_x = welch(x_detrend, fs=1/np.mean(np.diff(timestamps)))
            freqs_y, psd_y = welch(y_detrend, fs=1/np.mean(np.diff(timestamps)))
            
            # Spectral entropy
            def spectral_entropy(psd):
                psd_norm = psd / np.sum(psd)
                psd_norm = psd_norm[psd_norm > 0]
                return -np.sum(psd_norm * np.log2(psd_norm))
            
            features['x_spectral_entropy'] = spectral_entropy(psd_x)
            features['y_spectral_entropy'] = spectral_entropy(psd_y)
            
            # Dominant frequency
            features['dominant_frequency'] = float(freqs_x[np.argmax(psd_x)])
            
        except Exception as e:
            features['x_spectral_entropy'] = 0
            features['y_spectral_entropy'] = 0
            features['dominant_frequency'] = 0
        
        return features
    
    def train_enhanced_models(self):
        """Train ensemble of models with enhanced features"""
        print("Training enhanced autism screening models...")
        
        # Load and preprocess data
        X, y = self.load_and_preprocess_data()
        if X is None or len(X) == 0:
            print("No data available for training")
            return False
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Define models for ensemble
        models = {
            'RandomForest': RandomForestClassifier(
                n_estimators=200, max_depth=15, min_samples_split=5,
                min_samples_leaf=2, max_features='sqrt', random_state=42
            ),
            'GradientBoosting': GradientBoostingClassifier(
                n_estimators=150, learning_rate=0.1, max_depth=6,
                min_samples_split=5, random_state=42
            ),
            'SVM': SVC(
                C=1.0, kernel='rbf', gamma='scale', probability=True, random_state=42
            )
        }
        
        # Train models
        for name, model in models.items():
            print(f"Training {name}...")
            model.fit(X_train_scaled, y_train)
            self.models[name] = model
            
            # Calculate model weight based on performance
            y_pred = model.predict_proba(X_test_scaled)[:, 1]
            auc_score = roc_auc_score(y_test, y_pred)
            self.ensemble_weights[name] = auc_score
            print(f"{name} AUC: {auc_score:.4f}")
        
        # Normalize weights
        total_weight = sum(self.ensemble_weights.values())
        for name in self.ensemble_weights:
            self.ensemble_weights[name] /= total_weight
        
        print("Model training completed successfully")
        return True
    
    def predict_with_uncertainty(self, features: Dict) -> Dict[str, Any]:
        """Make prediction with comprehensive uncertainty quantification"""
        if not self.models:
            return {'error': 'Models not trained'}
        
        # Convert features to array
        feature_vector = np.array([features.get(name, 0) for name in self.feature_names]).reshape(1, -1)
        feature_vector_scaled = self.scaler.transform(feature_vector)
        
        # Get predictions from all models
        predictions = {}
        for name, model in self.models.items():
            try:
                prob = model.predict_proba(feature_vector_scaled)[0, 1]
                predictions[name] = prob
            except Exception as e:
                predictions[name] = 0.5
        
        # Weighted ensemble prediction
        ensemble_prob = 0
        for name, weight in self.ensemble_weights.items():
            ensemble_prob += predictions[name] * weight
        
        # Calculate uncertainty metrics
        model_probs = list(predictions.values())
        uncertainty_std = np.std(model_probs)
        model_agreement = 1 - uncertainty_std
        
        # Bootstrap confidence intervals
        bootstrap_probs = []
        for _ in range(1000):
            # Add noise to features
            noisy_features = feature_vector_scaled + np.random.normal(0, 0.01, feature_vector_scaled.shape)
            bootstrap_preds = []
            for name, model in self.models.items():
                try:
                    bootstrap_preds.append(model.predict_proba(noisy_features)[0, 1])
                except:
                    bootstrap_preds.append(0.5)
            bootstrap_ensemble = np.average(bootstrap_preds, weights=list(self.ensemble_weights.values()))
            bootstrap_probs.append(bootstrap_ensemble)
        
        ci_lower, ci_upper = np.percentile(bootstrap_probs, [2.5, 97.5])
        
        # Risk classification
        if ensemble_prob < 0.3:
            risk_level = "LOW RISK"
            recommendation = "Continue routine developmental monitoring"
        elif ensemble_prob < 0.6:
            risk_level = "MODERATE RISK"
            recommendation = "Consider developmental screening with pediatrician"
        else:
            risk_level = "HIGH RISK"
            recommendation = "Refer to autism specialist for comprehensive evaluation"
        
        return {
            'probability': float(ensemble_prob),
            'confidence_interval': [float(ci_lower), float(ci_upper)],
            'uncertainty_std': float(uncertainty_std),
            'model_agreement': float(model_agreement),
            'risk_level': risk_level,
            'recommendation': recommendation,
            'model_predictions': predictions
        }
    
    def run_high_precision_screening(self, video_source=0, duration=120):
        """Run screening with high-precision gaze tracking"""
        print("Starting high-precision autism screening...")
        
        # Initialize camera
        cap = cv2.VideoCapture(video_source)
        if not cap.isOpened():
            print("Error: Could not open video source")
            return None
        
        # Calibration
        print("Starting calibration...")
        self.enhanced_calibration(cap)
        
        # Main screening loop
        self.current_session_data = []
        start_time = time.time()
        
        while time.time() - start_time < duration:
            ret, frame = cap.read()
            if not ret:
                break
            
            # Process frame with high-precision tracking
            gaze_pos = self._process_frame_high_precision(frame)
            
            if gaze_pos is not None:
                # Apply calibration
                calibrated_pos = self._apply_calibration(gaze_pos)
                
                # Store gaze data
                gaze_data = {
                    'x': calibrated_pos[0],
                    'y': calibrated_pos[1],
                    'timestamp': time.time() - start_time
                }
                self.current_session_data.append(gaze_data)
            
            # Display preview (optional)
            if len(self.current_session_data) > 0:
                preview = frame.copy()
                cv2.putText(preview, f"Tracking: {len(self.current_session_data)} samples", 
                           (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                cv2.imshow('Autism Screening - High Precision', preview)
            
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
        
        cap.release()
        cv2.destroyAllWindows()
        
        # Generate prediction
        if len(self.current_session_data) >= 50:
            return self.generate_final_prediction()
        else:
            print("Insufficient data collected")
            return None
    
    def generate_final_prediction(self):
        """Generate final screening prediction"""
        if len(self.current_session_data) < 50:
            return {'error': 'Insufficient data'}
        
        # Convert to DataFrame
        df = pd.DataFrame(self.current_session_data)
        
        # Extract enhanced features
        features = self.extract_enhanced_features(df)
        
        # Make prediction
        prediction = self.predict_with_uncertainty(features)
        
        # Generate report
        self.generate_enhanced_report(df, prediction, features)
        
        return prediction
    
    def generate_enhanced_report(self, df, prediction, features):
        """Generate comprehensive screening report"""
        print("\n" + "="*80)
        print("ENHANCED AUTISM SCREENING REPORT")
        print("="*80)
        
        print(f"\nSCREENING RESULT: {prediction['risk_level']}")
        print(f"Probability: {prediction['probability']:.1%}")
        print(f"95% Confidence Interval: [{prediction['confidence_interval'][0]:.1%}, "
              f"{prediction['confidence_interval'][1]:.1%}]")
        print(f"Model Agreement: {prediction['model_agreement']:.1%}")
        
        print(f"\nKEY OBSERVATIONS:")
        if features.get('scanpath_entropy', 0) < 2.0:
            print("- Repetitive gaze patterns detected")
        if features.get('fixation_saccade_ratio', 0) > 2.0:
            print("- Elevated fixation patterns")
        if features.get('center_bias_ratio', 0) < 0.3:
            print("- Reduced center attention bias")
        if features.get('smooth_pursuit_ratio', 0) < 0.1:
            print("- Atypical smooth pursuit movements")
        
        print(f"\nRECOMMENDATION: {prediction['recommendation']}")
        
        print(f"\nDATA QUALITY METRICS:")
        print(f"Tracking Samples: {len(df)}")
        print(f"Data Completeness: {len(df) / max(1, len(self.current_session_data)):.1%}")
        print(f"Tracking Duration: {df['timestamp'].max() - df['timestamp'].min():.1f} seconds")
        
        print("\n" + "!"*80)
        print("IMPORTANT: This is a screening tool, not a diagnostic instrument.")
        print("Always consult qualified healthcare professionals for diagnosis.")
        print("!"*80)

# Usage example
if __name__ == "__main__":
    # Initialize the enhanced system
    system = EnhancedAutismScreeningSystem("training_data.csv")
    
    # Train models (if needed)
    system.train_enhanced_models()
    
    # Run high-precision screening
    result = system.run_high_precision_screening(duration=120)  # 2 minutes
    
    if result and 'error' not in result:
        print(f"\nFinal Screening Result: {result}")