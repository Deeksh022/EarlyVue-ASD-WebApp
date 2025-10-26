@echo off
echo Starting EarlyVue ASD Screening Backend...
echo.

REM Check if virtual environment exists
if exist "..\venv\Scripts\python.exe" (
    echo Using virtual environment Python...
    set PYTHON_PATH=..\venv\Scripts\python.exe
) else (
    echo Warning: Virtual environment not found. Using global Python installation.
    set PYTHON_PATH=python
)

echo.
echo Testing MediaPipe import...
%PYTHON_PATH% -c "import mediapipe as mp; print('MediaPipe OK')" 2>nul
if errorlevel 1 (
    echo ERROR: MediaPipe import failed!
    echo Please install Visual C++ Redistributable from:
    echo https://aka.ms/vs/17/release/vc_redist.x64.exe
    pause
    exit /b 1
)

echo.
echo Starting Flask server on http://localhost:5000
echo Press Ctrl+C to stop the server
echo.

%PYTHON_PATH% screening_api.py

pause
