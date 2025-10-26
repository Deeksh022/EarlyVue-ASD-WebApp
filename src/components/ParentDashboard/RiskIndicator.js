import React from 'react';

const RiskIndicator = ({ screenings }) => {
  // Handle case when screenings is not provided or is empty
  const screeningsArray = Array.isArray(screenings) ? screenings : [];

  // Calculate risk distribution from screenings
  const riskCounts = {
    low: screeningsArray.filter(s => s && s.risk === 'low').length,
    medium: screeningsArray.filter(s => s && s.risk === 'medium').length,
    high: screeningsArray.filter(s => s && s.risk === 'high').length
  };

  const total = screeningsArray.length;
  const riskData = [
    { level: 'Low Risk', value: total > 0 ? Math.round((riskCounts.low / total) * 100) : 65, color: '#4CAF50' },
    { level: 'Medium Risk', value: total > 0 ? Math.round((riskCounts.medium / total) * 100) : 20, color: '#FF9800' },
    { level: 'High Risk', value: total > 0 ? Math.round((riskCounts.high / total) * 100) : 15, color: '#F44336' }
  ];

  // If no screenings available, show clear state
  if (total === 0) {
    return (
      <div className="risk-indicator">
        <h2>Risk Distribution</h2>
        <div className="risk-chart-empty">
          <div className="empty-chart-visual">
            <div className="empty-chart-icon">📊</div>
            <div className="empty-chart-center">
              <span>0%</span>
            </div>
          </div>
          <div className="empty-chart-message">
            <p>No screening data available</p>
            <small>Complete a screening to see risk distribution</small>
          </div>
        </div>

        <div className="risk-legend">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#4CAF50' }}></div>
            <span className="legend-label">Low Risk</span>
            <span className="legend-value">0%</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#FF9800' }}></div>
            <span className="legend-label">Medium Risk</span>
            <span className="legend-value">0%</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#F44336' }}></div>
            <span className="legend-label">High Risk</span>
            <span className="legend-value">0%</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="risk-indicator">
      <h2>Risk Distribution</h2>
      <div className="risk-chart">
        <div className="chart-visual">
          <div className="chart-slice" style={{
            '--value': riskData[0].value,
            '--color': riskData[0].color
          }}></div>
          <div className="chart-slice" style={{
            '--value': riskData[1].value,
            '--color': riskData[1].color
          }}></div>
          <div className="chart-slice" style={{
            '--value': riskData[2].value,
            '--color': riskData[2].color
          }}></div>
        </div>
        <div className="chart-center">
          <span>{riskData.reduce((sum, item) => sum + item.value, 0)}%</span>
        </div>
      </div>

      <div className="risk-legend">
        {riskData.map((item, index) => (
          <div key={index} className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: item.color }}
            ></div>
            <span className="legend-label">{item.level}</span>
            <span className="legend-value">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiskIndicator;