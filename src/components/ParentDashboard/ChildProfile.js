import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/medical-theme.css';

const ChildProfile = ({ child }) => {
  const navigate = useNavigate();

  // Get screening data from localStorage
  const getScreeningStats = () => {
    const saved = localStorage.getItem('screeningResults');
    if (!saved) return { total: 0, avgMonthly: 0, currentRisk: 'N/A' };
    
    const results = JSON.parse(saved);
    const childResults = child ? results.filter(r => r.childId === child.id) : results;
    
    const total = childResults.length;
    const avgMonthly = total > 0 ? (total / 12).toFixed(1) : 0;
    const latestRisk = childResults.length > 0 ? childResults[childResults.length - 1].risk : 'N/A';
    
    return { total, avgMonthly, currentRisk: latestRisk };
  };

  const stats = getScreeningStats();

  // Handle case when child is not provided or loading
  if (!child) {
    return (
      <div className="medical-card">
        <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
          <div style={{ fontSize: '64px', marginBottom: 'var(--spacing-md)' }}>👶</div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--medical-gray-900)', marginBottom: 'var(--spacing-sm)' }}>
            No Child Selected
          </h2>
          <p style={{ color: 'var(--medical-gray-600)', marginBottom: 'var(--spacing-lg)' }}>
            Add a child to get started with screenings
          </p>
          <button
            className="medical-btn medical-btn-primary"
            onClick={() => navigate('/add-child')}
          >
            ➕ Add Child
          </button>
        </div>
      </div>
    );
  }

  const getRiskColor = (risk) => {
    switch(risk) {
      case 'low': return 'var(--medical-success)';
      case 'medium': return 'var(--medical-warning)';
      case 'high': return 'var(--medical-danger)';
      default: return 'var(--medical-gray-500)';
    }
  };

  const getRiskText = (risk) => {
    switch(risk) {
      case 'low': return 'Low';
      case 'medium': return 'Medium';
      case 'high': return 'High';
      default: return 'N/A';
    }
  };

  return (
    <div className="medical-card" style={{ background: 'linear-gradient(135deg, var(--medical-white) 0%, var(--medical-gray-50) 100%)' }}>
      {/* Profile Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 'var(--spacing-lg)',
        paddingBottom: 'var(--spacing-lg)',
        borderBottom: '2px solid var(--medical-gray-100)',
        marginBottom: 'var(--spacing-lg)'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: 'var(--radius-full)',
          background: 'linear-gradient(135deg, var(--medical-primary), var(--medical-secondary))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '40px',
          boxShadow: 'var(--shadow-lg)',
          border: '4px solid var(--medical-white)'
        }}>
          {child.avatar || '👶'}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            color: 'var(--medical-gray-900)', 
            marginBottom: 'var(--spacing-xs)' 
          }}>
            {child.name || 'Unknown Child'}
          </h2>
          <p style={{ 
            fontSize: '14px', 
            color: 'var(--medical-gray-600)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-sm)'
          }}>
            <span style={{ 
              padding: '4px 12px',
              background: 'var(--medical-primary-light)',
              color: 'var(--medical-primary)',
              borderRadius: 'var(--radius-full)',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {child.age || 'Age not specified'}
            </span>
            <span>•</span>
            <span>{child.gender || 'Gender not specified'}</span>
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: 'var(--spacing-md)',
        marginBottom: 'var(--spacing-xl)'
      }}>
        <div className="medical-stat-card" style={{ borderLeftColor: 'var(--medical-primary)' }}>
          <div className="medical-stat-label">SCREENINGS</div>
          <div className="medical-stat-value" style={{ color: 'var(--medical-primary)' }}>
            {stats.total}
          </div>
        </div>
        <div className="medical-stat-card" style={{ borderLeftColor: 'var(--medical-secondary)' }}>
          <div className="medical-stat-label">AVG. MONTHLY</div>
          <div className="medical-stat-value" style={{ color: 'var(--medical-secondary)' }}>
            {stats.avgMonthly}
          </div>
        </div>
        <div className="medical-stat-card" style={{ borderLeftColor: getRiskColor(stats.currentRisk) }}>
          <div className="medical-stat-label">CURRENT RISK</div>
          <div className="medical-stat-value" style={{ 
            color: getRiskColor(stats.currentRisk),
            fontSize: '20px'
          }}>
            {getRiskText(stats.currentRisk)}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: 'var(--spacing-md)' 
      }}>
        <button
          className="medical-btn medical-btn-primary"
          style={{ justifyContent: 'center' }}
          onClick={() => navigate('/new-screening')}
        >
          Start New Screening
        </button>
        <button
          className="medical-btn medical-btn-secondary"
          style={{ justifyContent: 'center' }}
          onClick={() => navigate('/all-results')}
        >
          View All Results
        </button>
      </div>
    </div>
  );
};

export default ChildProfile;