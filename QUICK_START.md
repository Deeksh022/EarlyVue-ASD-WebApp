# Quick Start Guide - ASD Screening

## 🚀 Get Started in 3 Steps

### Step 1: Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Start Backend Server
```bash
python screening_api.py
```
Leave this terminal window open. You should see:
```
* Running on http://127.0.0.1:5000
```

### Step 3: Start Frontend (New Terminal)
```bash
npm start
```

## ✅ You're Ready!

The application should now open in your browser at `http://localhost:3000`

## 🎯 Using the Screening Feature

1. **Login** to your account
2. **Navigate** to "New Screening"
3. **Select** a registered child
4. **Choose** screening type (Basic ASD Screening)
5. **Click** "Start Screening"
6. **Allow** camera access when prompted
7. **Wait** for 60 seconds while the system analyzes
8. **View** results on the All Results page

## ⚠️ Important Notes

- **Both servers must be running** (backend on port 5000, frontend on port 3000)
- **Camera access required** - Allow when browser prompts
- **Good lighting recommended** - Ensure face is clearly visible
- **Stable internet** - For API communication between frontend and backend

## 🔧 Troubleshooting

### Backend won't start
```bash
# Install dependencies again
cd backend
pip install -r requirements.txt
```

### Frontend can't connect
- Check backend is running (look for "Running on http://127.0.0.1:5000")
- Check browser console (F12) for errors

### Camera not working
- Allow camera permissions in browser
- Check no other app is using the camera
- Try refreshing the page

## 📚 Need More Help?

- **Detailed Setup:** See `SCREENING_SETUP_GUIDE.md`
- **What Changed:** See `CHANGES_SUMMARY.md`
- **Backend API:** See `backend/README.md`

## 🎉 That's It!

You should now be able to run ASD screenings without any module errors.
