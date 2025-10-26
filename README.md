# EarlyVue - ASD Screening Application

A production-ready, full-stack web application designed for accurate and accessible screening of Autism Spectrum Disorder (ASD). Built with **React** for the frontend, **Node.js** for the API, **Python** for advanced machine learning/data processing, and **Supabase** for secure data persistence.

## 🚀 Quick Start: Full Production Setup

### Prerequisites

You must have **Node.js** (v16+) and **Python** (v3.11+) installed.

### 1\. Clone and Configure

```bash
# Clone the repository
git clone https://github.com/Deeksh022/EarlyVue-ASD-WebApp.git
cd EarlyVue-ASD-WebApp
```

### 2\. Set Up Environment Variables

Create a `.env` file in the project root by copying the example:

```bash
cp .env.example .env
```

Edit the new `.env` file with your **Supabase credentials** and backend API port:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=https: https://eovhilaldwbjwmvnosgq.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9

# Backend Configuration
REACT_APP_BACKEND_API_URL=http://localhost:5000
```

### 3\. Install Dependencies

Install dependencies for both the React frontend and the Python backend.

```bash
# Frontend (React/Node.js)
npm install

# Backend (Python)
cd backend
# Assuming your virtual environment is named 'venv' and Python is in the PATH
python -m venv venv
./venv/Scripts/activate # Use 'source venv/bin/activate' on Linux/Mac
pip install -r requirements.txt
cd ..
```

### 4\. Database Setup

Ensure your Supabase project is configured:

1.  Go to the Supabase SQL Editor.
2.  Run the **SQL commands** found in the `SUPABASE_SETUP.md` file to create the necessary tables (`users`, `patients`, `screenings`, `screening_results`).

### 5\. Run the Application (Dual Start)

You must run the frontend and the backend simultaneously in separate terminals.

**Terminal 1: Start Python Backend (API/ML Logic)**

```bash
cd backend
# Activate the environment (if not already)
./venv/Scripts/activate # Use 'source venv/bin/activate' on Linux/Mac
python api.py # or the main entry point of your Python server
```

**Terminal 2: Start React Frontend**

```bash
npm start
```

The application will now be running at `http://localhost:3000`.

-----

## 🎯 Core Features and Functionality

EarlyVue is a complete system that manages user authentication, patient data, screening execution, and predictive results.

| Feature Area | Key Functionality | Status |
| :--- | :--- | :--- |
| **Full Authentication** | Secure Login/Registration using **Supabase Auth**. | ✅ |
| **Patient Management** | Comprehensive patient profiles, medical history tracking, and data persistence. | ✅ |
| **Core Screening Engine** | Execution of **ASD and Developmental Assessments**. | ✅ |
| **Machine Learning Backend** | **Python** module for risk analysis and report generation. | ✅ |
| **Real-time Results** | Immediate feedback, risk indicators, and actionable recommendations. | ✅ |
| **Report Generation** | Downloadable, detailed reports for professionals and parents. | ✅ |

-----

## 🏗️ Technical Architecture

EarlyVue utilizes a robust, modern full-stack architecture to ensure scalability, speed, and data security.

### Frontend (User Interface)

  * **React 18:** For a dynamic and responsive user experience.
  * **React Router:** For efficient client-side navigation.
  * **Styled Components/CSS Modules:** For scoped, maintainable styling.

### Backend & Data (Application Logic)

  * **Node.js / Express:** Serves the primary API and handles routing, connecting the frontend to the Python microservice.
  * **Python (3.11+):** Dedicated microservice for complex tasks:
      * **ASD Detection:** Runs core predictive models (DNN, RF, SVM, Ensemble) on screening data.
      * **Data Processing:** Feature scaling and result interpretation.
      * **Report Generation:** Creates detailed, downloadable PDF reports.
  * **Supabase:** The core database and authentication platform.
      * **PostgreSQL:** Secure, robust relational data storage.
      * **Row Level Security (RLS):** Ensures users can only access data relevant to their profile.

-----

## 🔒 Security and Compliance

The application is built with a security-first approach:

  * **Data Isolation (RLS):** All data is protected by Supabase RLS policies, ensuring strict segregation of user and patient records.
  * **Secure Authentication:** Utilizes standard JWT tokens and automatic refresh provided by Supabase.
  * **Input Validation:** Robust client-side and server-side validation to prevent injection and corruption.
  * **Encrypted Transmission:** All data transfer is secured via **HTTPS**.

-----

## 📱 Usage Guide: The Screening Workflow

1.  **Register/Login:** New users create an account; returning users log in securely.
2.  **Add Patient:** Create a profile for the child being screened.
3.  **Start Screening:** Select the assessment type. The frontend collects input and sends the data to the Node.js API.
4.  **Backend Processing:** The Node.js layer forwards the data to the Python microservice, which runs the ML models.
5.  **View Results:** The final risk assessment and recommendations are displayed immediately on the dashboard.
6.  **Report:** A comprehensive PDF report can be generated and downloaded for record-keeping.

-----

### Support

  * **Issues:** Report bugs and request features via the GitHub Issues page.
  * **Documentation:** Consult `SUPABASE_SETUP.md` for in-depth database and backend configuration details.

-----

**EarlyVue** - Providing accurate, accessible, and actionable ASD screening tools worldwide.
