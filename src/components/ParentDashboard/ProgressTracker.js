import React from 'react';

const ProgressTracker = ({ data }) => {
  // Handle case when data is not provided
  const defaultData = {
    socialAttention: 72,
    nonSocialAttention: 28,
    improvement: 15
  };

  const progressData = data || defaultData;

  // Check if we have meaningful data (not just default values)
  const hasData = progressData &&
    (progressData.socialAttention > 0 || progressData.nonSocialAttention > 0 || progressData.improvement > 0);

  if (!hasData) {
    return (
      <div className="progress-tracker">
        <h2>Progress Overview</h2>
        <div className="progress-content-empty">
          <div className="empty-progress-visual">
            <div className="empty-progress-icon">📊</div>
            <div className="empty-progress-message">
              <h4>No Progress Data Available</h4>
              <p>Complete screenings to track your child's developmental progress</p>
            </div>
          </div>

          <div className="progress-placeholder">
            <div className="progress-chart">
              <div className="chart-visual empty">
                <div className="chart-fill" style={{ '--value': '0%' }}></div>
              </div>
              <div className="chart-labels">
                <span className="chart-label">Social Attention: 0%</span>
                <span className="chart-label">Non-Social: 0%</span>
              </div>
            </div>

            <div className="progress-stats">
              <div className="progress-stat">
                <span className="stat-icon">📈</span>
                <div className="stat-info">
                  <span className="stat-value">0%</span>
                  <span className="stat-label">Improvement</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="progress-tracker">
      <h2>Progress Overview</h2>
      <div className="progress-content">
        <div className="progress-chart">
          <div className="chart-visual">
            <div
              className="chart-fill"
              style={{ '--value': (progressData.socialAttention || 0) + '%' }}
            ></div>
          </div>
          <div className="chart-labels">
            <span className="chart-label">Social Attention: {progressData.socialAttention || 0}%</span>
            <span className="chart-label">Non-Social: {progressData.nonSocialAttention || 0}%</span>
          </div>
        </div>

        <div className="progress-stats">
          <div className="progress-stat">
            <span className="stat-icon">📈</span>
            <div className="stat-info">
              <span className="stat-value">{progressData.improvement || 0}%</span>
              <span className="stat-label">Improvement</span>
            </div>
          </div>
        </div>

        <div className="progress-notes">
          <h4>Progress Insights</h4>
          <div className="progress-insights">
            {progressData.socialAttention >= 70 && (
              <div className="insight positive">
                ✅ <strong>Good social attention:</strong> Your child shows strong focus on social interactions
              </div>
            )}
            {progressData.socialAttention < 50 && (
              <div className="insight attention">
                ⚠️ <strong>Social attention needs support:</strong> Consider activities that encourage social engagement
              </div>
            )}
            {progressData.improvement > 5 && (
              <div className="insight positive">
                📈 <strong>Positive improvement trend:</strong> Progress is being made over time
              </div>
            )}
            {progressData.improvement < 0 && (
              <div className="insight attention">
                📉 <strong>Monitor closely:</strong> Recent screenings show areas needing attention
              </div>
            )}
          </div>
          <h4>Recommendations</h4>
          <ul>
            <li>Continue regular screenings every 3-6 months</li>
            <li>{progressData.socialAttention < 60 ? 'Focus on social play activities and interaction games' : 'Maintain current social engagement activities'}</li>
            <li>Schedule pediatrician visit to discuss results</li>
            {progressData.improvement < 0 && <li>Consider consulting with a developmental specialist</li>}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;