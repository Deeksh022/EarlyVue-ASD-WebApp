import React from 'react';
import { useNavigate } from 'react-router-dom';

const ScreeningHistory = ({ screenings }) => {
  const navigate = useNavigate();

  const getRiskClass = (risk) => {
    switch (risk) {
      case 'high': return 'risk-high';
      case 'medium': return 'risk-medium';
      case 'low': return 'risk-low';
      default: return '';
    }
  };

  const getRiskText = (risk) => {
    switch (risk) {
      case 'high': return 'High Risk';
      case 'medium': return 'Medium Risk';
      case 'low': return 'Low Risk';
      default: return 'Unknown';
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Handle case when screenings is not provided or is empty
  if (!screenings || screenings.length === 0) {
    return (
      <div className="screening-history">
        <h2>Recent Screenings</h2>
        <div className="screening-list empty">
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No Screenings Yet</h3>
            <p>Start your first screening to see results here</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/screening')}
            >
              Start Screening
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screening-history">
      <h2>Recent Screenings</h2>
      <div className="screening-list">
        {screenings.map((screening) => (
          <div key={screening.id || Math.random()} className="screening-item">
            <div className="screening-date">
              <span className="date">{formatDate(screening.date)}</span>
              <span className="duration">{screening.duration || 'N/A'}</span>
            </div>
            <div className="screening-result">
              <span className={`risk-badge ${getRiskClass(screening.risk)}`}>
                {getRiskText(screening.risk)}
              </span>
              <span className="score">Score: {screening.score || 0}/100</span>
            </div>
            <div className="screening-actions">
              {screening.verdict && (
                <span className="verdict-text" style={{ fontSize: '0.9rem', color: '#2E7D32', fontWeight: '600' }}>
                  {screening.verdict}
                </span>
              )}
              {screening.pdfReportUrl ? (
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => window.open(screening.pdfReportUrl, '_blank')}
                >
                  📄 Download PDF
                </button>
              ) : (
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => navigate('/all-results')}
                >
                  View All Results
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScreeningHistory;