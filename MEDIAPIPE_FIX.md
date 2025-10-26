# MediaPipe DLL Error Fix

## Error Message
```
ImportError: DLL load failed while importing _framework_bindings: 
A dynamic link library (DLL) initialization routine failed.
```

## Root Cause
MediaPipe requires Visual C++ Redistributable libraries that may not be installed on your system.

## Solution Options

### Option 1: Install Visual C++ Redistributable (Recommended)

1. **Download** the Visual C++ Redistributable:
   - Link: https://aka.ms/vs/17/release/vc_redist.x64.exe
   
2. **Run the installer** and follow the prompts

3. **Restart your computer** after installation

4. **Try running the backend again:**
   ```bash
   cd backend
   python screening_api.py
   ```

### Option 2: Reinstall MediaPipe

Sometimes reinstalling MediaPipe can fix DLL issues:

```bash
pip uninstall mediapipe
pip install mediapipe==0.10.8
```

### Option 3: Use Python 3.10 Instead of 3.11

MediaPipe works more reliably with Python 3.10:

1. **Install Python 3.10** from https://www.python.org/downloads/release/python-31011/

2. **Create a new virtual environment:**
   ```bash
   python3.10 -m venv venv310
   venv310\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. **Run the backend:**
   ```bash
   python screening_api.py
   ```

### Option 4: Use Alternative Approach (Temporary Workaround)

If you need to test the application immediately without MediaPipe, you can:

1. Create a simplified version that doesn't use face tracking
2. Use mock data for testing
3. Deploy to a Linux server where MediaPipe works better

## Verification

After applying a fix, verify it works:

```bash
python -c "import mediapipe as mp; print('MediaPipe loaded successfully')"
```

If this command runs without errors, MediaPipe is working.

## Start the Backend

Once MediaPipe is fixed:

```bash
cd backend
python screening_api.py
```

You should see:
```
WARNING: Failed to import AutismScreeningSystem: ...  (if still broken)
OR
 * Running on http://127.0.0.1:5000  (if working)
```

## Test the API

Open a new terminal and test:

```bash
curl http://localhost:5000/api/health
```

Should return:
```json
{
  "status": "healthy",
  "initialized": false,
  "import_error": null
}
```

If `import_error` is not null, MediaPipe is still not working.

## Additional Resources

- MediaPipe GitHub Issues: https://github.com/google/mediapipe/issues
- Visual C++ Redistributable Info: https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist
- Python 3.10 Download: https://www.python.org/downloads/release/python-31011/

## Still Having Issues?

If none of these solutions work:

1. **Check your Python version:**
   ```bash
   python --version
   ```

2. **Check installed packages:**
   ```bash
   pip list | findstr mediapipe
   ```

3. **Try running with verbose output:**
   ```bash
   python -v screening_api.py
   ```

4. **Check Windows Event Viewer** for DLL-related errors

5. **Consider using WSL2** (Windows Subsystem for Linux) where MediaPipe works more reliably
