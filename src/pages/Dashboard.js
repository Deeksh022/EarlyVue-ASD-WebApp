import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/ParentDashboard/Header';
import ChildProfile from '../components/ParentDashboard/ChildProfile';
import ScreeningHistory from '../components/ParentDashboard/ScreeningHistory';
import RiskIndicator from '../components/ParentDashboard/RiskIndicator';
import ProgressTracker from '../components/ParentDashboard/ProgressTracker';
import ResourcesSection from '../components/ParentDashboard/ResourcesSection';
import ChatbotBlock from '../components/ParentDashboard/ChatbotBlock';
import { useAuth } from '../services/auth';
import { getPatientsByUserId, getAllScreeningsByUserId } from '../services/database';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeChild, setActiveChild] = useState(0);
  const [children, setChildren] = useState([]);
  const [screeningHistory, setScreeningHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        // Load patients with error handling
        const patientsResult = await getPatientsByUserId(user.id);
        if (patientsResult && patientsResult.success && patientsResult.patients) {
          const formattedChildren = patientsResult.patients.map(patient => ({
            id: patient.id,
            name: patient.name || 'Unknown Child',
            age: patient.age_months ? `${patient.age_months} months` : 'Age not specified',
            gender: patient.gender || 'Not specified',
            lastScreening: patient.created_at,
            avatar: patient.gender === 'Male' ? '👦' : '👧'
          }));
          setChildren(formattedChildren);
        } else {
          // If no patients found, set empty array
          setChildren([]);
        }

        // Load recent screenings from user-specific localStorage
        const storageKey = `screeningResults_${user.id}`;
        const savedResults = localStorage.getItem(storageKey);
        if (savedResults) {
          const results = JSON.parse(savedResults);
          // Filter to ensure we only show this user's results
          const userResults = results.filter(r => r.userId === user.id);
          const formattedScreenings = userResults.slice(-4).reverse().map(result => ({
            id: result.id,
            date: result.date,
            duration: result.duration,
            risk: result.risk,
            score: result.score,
            verdict: result.verdict,
            confidence: result.confidence,
            pdfReportUrl: result.pdfReportUrl,
            childName: result.childName,
            socialAttention: result.socialAttention || 0,
            nonSocialAttention: result.nonSocialAttention || 0,
            improvement: result.improvement || 0
          }));
          setScreeningHistory(formattedScreenings);
        } else {
          // Fallback to database screenings
          const screeningsResult = await getAllScreeningsByUserId(user.id);
          if (screeningsResult && screeningsResult.success && screeningsResult.screenings) {
            const formattedScreenings = screeningsResult.screenings.slice(0, 4).map(screening => ({
              id: screening.id || Math.random(),
              date: screening.created_at ? new Date(screening.created_at).toISOString().split('T')[0] : 'N/A',
              duration: screening.screening_results?.[0]?.duration_seconds
                ? `${Math.round(screening.screening_results[0].duration_seconds / 60)} minutes`
                : 'N/A',
              risk: screening.screening_results?.[0]?.risk_level || 'unknown',
              score: screening.screening_results?.[0]?.score || 0
            }));
            setScreeningHistory(formattedScreenings);
          } else {
            setScreeningHistory([]);
          }
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError('Failed to load dashboard data. Please try refreshing the page.');
        // Set empty arrays to prevent crashes
        setChildren([]);
        setScreeningHistory([]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  // Calculate progress data from screening history
  const progressData = screeningHistory.length > 0 ? {
    socialAttention: screeningHistory.reduce((sum, s) => sum + (s.socialAttention || 0), 0) / screeningHistory.length,
    nonSocialAttention: screeningHistory.reduce((sum, s) => sum + (s.nonSocialAttention || 0), 0) / screeningHistory.length,
    improvement: screeningHistory.reduce((sum, s) => sum + (s.improvement || 0), 0) / screeningHistory.length
  } : null;

  const resources = [
    {
      title: 'Understanding ASD Screening',
      description: 'Learn about what the screening results mean for your child',
      link: '#',
      icon: '📚'
    },
    {
      title: 'Developmental Milestones',
      description: 'Track your child\'s development against typical milestones',
      link: '#',
      icon: '📈'
    },
    {
      title: 'Find a Specialist',
      description: 'Connect with healthcare professionals in your area',
      link: '#',
      icon: '👨‍⚕️'
    }
  ];

  if (loading) {
    return (
      <div className="dashboard-container">
        <Header />
        <main className="dashboard-main">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container" style={{ background: 'var(--medical-gray-50)', minHeight: '100vh' }}>
      <Header />
      <main className="dashboard-main" style={{ maxWidth: '1400px', margin: '0 auto', padding: 'var(--spacing-xl)' }}>
        <div className="dashboard-welcome-section" style={{
          background: 'linear-gradient(135deg, #0066CC 0%, #00A896 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-2xl)',
          marginBottom: 'var(--spacing-xl)',
          color: 'white',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: 'var(--spacing-sm)' }}>
            Welcome back, {user?.name || 'Parent'}! 👋
          </h1>
          <p style={{ fontSize: '16px', opacity: 0.9 }}>
            Track your child's screening results and developmental progress
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        
        <div className="child-selector">
          <h3>Select Child</h3>
          <div className="child-buttons">
            {children.length > 0 ? (
              children.map((child, index) => (
                <button
                  key={child.id || index}
                  className={`child-btn ${activeChild === index ? 'active' : ''}`}
                  onClick={() => setActiveChild(index)}
                >
                  <span className="child-avatar">{child.avatar || '👶'}</span>
                  <span className="child-name">{child.name || 'Unknown'}</span>
                </button>
              ))
            ) : (
              <div className="no-children-message">
                <span className="child-avatar">👶</span>
                <span className="child-name">No children added yet</span>
              </div>
            )}
            <button
              className="child-btn add-child"
              onClick={() => navigate('/add-child')}
            >
              <span className="child-avatar">➕</span>
              <span className="child-name">Add Child</span>
            </button>
          </div>
        </div>
        
        <div className="dashboard-grid">
          <div className="main-content">
            <ChildProfile child={children.length > 0 ? children[activeChild] : null} />
            <ScreeningHistory screenings={screeningHistory} />
            <ChatbotBlock />
          </div>

          <div className="sidebar-content">
            {screeningHistory.length > 0 && (
              <>
                <RiskIndicator screenings={screeningHistory} />
                <ProgressTracker data={progressData} />
              </>
            )}
          </div>
        </div>

        {/* Horizontal Resources Section at Bottom */}
        <div style={{ marginTop: 'var(--spacing-xl)' }}>
          <ResourcesSection resources={resources} horizontal={true} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;