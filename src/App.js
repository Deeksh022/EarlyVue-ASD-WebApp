import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './services/auth';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddChild from './pages/AddChild';
import Help from './pages/Help';
import ResourceDetail from './pages/ResourceDetail';
import FindSpecialist from './pages/FindSpecialist';
import NewScreening from './pages/NewScreening';
import Results from './pages/Results';
import AllResults from './pages/AllResults';
import MyProfile from './pages/MyProfile';
import './styles/main.css';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<HomeRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/add-child" element={
                <ProtectedRoute>
                  <AddChild />
                </ProtectedRoute>
              } />
              <Route path="/help" element={
                <ProtectedRoute>
                  <Help />
                </ProtectedRoute>
              } />
              <Route path="/resources/:id" element={
                <ProtectedRoute>
                  <ResourceDetail />
                </ProtectedRoute>
              } />
              <Route path="/find-specialist" element={
                <ProtectedRoute>
                  <FindSpecialist />
                </ProtectedRoute>
              } />
              <Route path="/screening" element={
                <ProtectedRoute>
                  <NewScreening />
                </ProtectedRoute>
              } />
              <Route path="/new-screening" element={
                <ProtectedRoute>
                  <NewScreening />
                </ProtectedRoute>
              } />
              <Route path="/screening-results" element={
                <ProtectedRoute>
                  <Results />
                </ProtectedRoute>
              } />
              <Route path="/results" element={
                <ProtectedRoute>
                  <AllResults />
                </ProtectedRoute>
              } />
              <Route path="/all-results" element={
                <ProtectedRoute>
                  <AllResults />
                </ProtectedRoute>
              } />
              <Route path="/my-profile" element={
                <ProtectedRoute>
                  <MyProfile />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

function HomeRedirect() {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
}

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default App;