import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/ParentDashboard/Header';
import { useAuth } from '../services/auth';
import { getPatientsByUserId } from '../services/database';
import '../styles/results.css';
import '../styles/medical-theme.css';

const AllResults = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedChild, setSelectedChild] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [children, setChildren] = useState([]);
  const [loadingChildren, setLoadingChildren] = useState(true);

  // Start with empty results - will be populated after screenings
  // Load results from localStorage on mount - user-specific
  const [allResults, setAllResults] = useState([]);

  // Function to add new screening result
  const addScreeningResult = (newResult) => {
    if (!user) return;
    
    const newResultData = {
      id: Date.now(),
      userId: user.id,
      childId: newResult.patient_id,
      childName: newResult.patient_name,
      date: new Date().toISOString().split('T')[0],
      type: newResult.screening_type || 'ASD Screening',
      risk: newResult.risk,
      score: newResult.score,
      duration: `${Math.round(newResult.duration / 60 * 10) / 10} minutes`,
      verdict: newResult.verdict,
      confidence: newResult.confidence,
      modelProbs: newResult.model_probs,
      socialAttention: newResult.socialAttention || 0,
      nonSocialAttention: newResult.nonSocialAttention || 0,
      improvement: newResult.improvement || 0,
      pdfReportUrl: newResult.pdfReportUrl,
      timestamp: newResult.timestamp
    };
    
    setAllResults(prev => {
      const updated = [...prev, newResultData];
      // Save to user-specific localStorage
      const storageKey = `screeningResults_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
  };

  // Fetch registered children and load user-specific screening results
  useEffect(() => {
    const fetchChildren = async () => {
      if (!user) {
        setLoadingChildren(false);
        return;
      }

      try {
        setLoadingChildren(true);
        const result = await getPatientsByUserId(user.id);

        if (result.success && result.patients) {
          const formattedChildren = result.patients.map(patient => ({
            id: patient.id,
            name: patient.name
          }));
          setChildren(formattedChildren);
        }
        
        // Load user-specific screening results
        const storageKey = `screeningResults_${user.id}`;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const results = JSON.parse(saved);
          // Filter to ensure we only show this user's results
          const userResults = results.filter(r => r.userId === user.id);
          setAllResults(userResults);
        } else {
          setAllResults([]);
        }
      } catch (error) {
        console.error('Error fetching children:', error);
      } finally {
        setLoadingChildren(false);
      }
    };

    fetchChildren();
  }, [user]);

  // Expose addScreeningResult to window for global access
  useEffect(() => {
    window.addScreeningResult = addScreeningResult;
    return () => {
      delete window.addScreeningResult;
    };
  }, [user]);

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
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredResults = allResults.filter(result => {
    if (selectedChild !== 'all' && result.childId.toString() !== selectedChild) {
      return false;
    }
    return true;
  });
  
  // Function to add sample data for testing
  const addSampleData = () => {
    const sampleResult = {
      patient_id: '1',
      patient_name: 'Shramith',
      screening_type: 'basic-asd',
      risk: 'low',
      score: 85,
      duration: 60,
      verdict: 'Not Autistic',
      confidence: 0.85,
      model_probs: {
        'RF': 0.82,
        'SVM': 0.88,
        'DNN': 0.85
      },
      timestamp: new Date().toISOString(),
      pdfReportUrl: 'http://localhost:5000/api/download_report/sample.pdf'
    };
    addScreeningResult(sampleResult);
  };

  // Function to delete screening result
  const handleDeleteResult = (resultId, childName) => {
    if (!user) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete this screening result for ${childName}?\n\n` +
      `This action cannot be undone!`
    );

    if (confirmed) {
      setAllResults(prev => {
        const updated = prev.filter(r => r.id !== resultId);
        // Save to user-specific localStorage
        const storageKey = `screeningResults_${user.id}`;
        localStorage.setItem(storageKey, JSON.stringify(updated));
        return updated;
      });
      alert('Screening result deleted successfully.');
    }
  };

  return (
    <div style={{ background: 'var(--medical-gray-50)', minHeight: '100vh' }}>
      <Header />
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: 'var(--spacing-xl)' }}>
        {/* Modern Header Section */}
        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0066CC 0%, #00A896 100%)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-2xl)',
            color: 'white',
            boxShadow: '0 8px 32px rgba(0, 102, 204, 0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Decorative background pattern */}
            <div style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '200px',
              height: '200px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              pointerEvents: 'none'
            }}></div>
            <div style={{
              position: 'absolute',
              bottom: '-30px',
              left: '-30px',
              width: '150px',
              height: '150px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '50%',
              pointerEvents: 'none'
            }}></div>
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                  fontSize: '32px'
                }}>
                  📊
                </div>
                <div>
                  <h1 style={{ 
                    fontSize: '36px', 
                    fontWeight: '700', 
                    margin: 0,
                    letterSpacing: '-0.5px'
                  }}>
                    All Screening Results
                  </h1>
                  <p style={{ 
                    fontSize: '16px', 
                    margin: '8px 0 0 0',
                    opacity: 0.95,
                    fontWeight: '500'
                  }}>
                    View and manage all your children's screening results
                  </p>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 'var(--spacing-md)',
                marginTop: 'var(--spacing-lg)',
                paddingTop: 'var(--spacing-lg)',
                borderTop: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>{filteredResults.length}</div>
                  <div style={{ fontSize: '13px', opacity: 0.9 }}>Total Screenings</div>
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>{filteredResults.filter(r => r.risk === 'low').length}</div>
                  <div style={{ fontSize: '13px', opacity: 0.9 }}>Low Risk Results</div>
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>{filteredResults.filter(r => r.risk === 'high').length}</div>
                  <div style={{ fontSize: '13px', opacity: 0.9 }}>High Risk Results</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="medical-card" style={{ marginBottom: 'var(--spacing-xl)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
            <div className="medical-form-group">
              <label className="medical-label" htmlFor="child-filter">
                Filter by Child
              </label>
              <select
                id="child-filter"
                className="medical-input"
                value={selectedChild}
                onChange={(e) => setSelectedChild(e.target.value)}
              >
                <option value="all">All Children</option>
                {children.map(child => (
                  <option key={child.id} value={child.id.toString()}>
                    {child.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="medical-form-group">
              <label className="medical-label" htmlFor="period-filter">
                Time Period
              </label>
              <select
                id="period-filter"
                className="medical-input"
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last 3 Months</option>
                <option value="year">Last Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="medical-stats-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
          <div className="medical-stat-card" style={{ borderLeftColor: 'var(--medical-primary)' }}>
            <div className="medical-stat-label">Total Screenings</div>
            <div className="medical-stat-value" style={{ color: 'var(--medical-primary)' }}>
              {filteredResults.length}
            </div>
            <div className="medical-stat-change positive">
              All time results
            </div>
          </div>
          
          <div className="medical-stat-card" style={{ borderLeftColor: 'var(--medical-success)' }}>
            <div className="medical-stat-label">Low Risk</div>
            <div className="medical-stat-value" style={{ color: 'var(--medical-success)' }}>
              {filteredResults.filter(r => r.risk === 'low').length}
            </div>
            <div className="medical-stat-change positive">
              ✓ Typical development
            </div>
          </div>
          
          <div className="medical-stat-card" style={{ borderLeftColor: 'var(--medical-warning)' }}>
            <div className="medical-stat-label">Medium Risk</div>
            <div className="medical-stat-value" style={{ color: 'var(--medical-warning)' }}>
              {filteredResults.filter(r => r.risk === 'medium').length}
            </div>
            <div className="medical-stat-change">
              ⚠️ Needs monitoring
            </div>
          </div>
          
          <div className="medical-stat-card" style={{ borderLeftColor: 'var(--medical-danger)' }}>
            <div className="medical-stat-label">High Risk</div>
            <div className="medical-stat-value" style={{ color: 'var(--medical-danger)' }}>
              {filteredResults.filter(r => r.risk === 'high').length}
            </div>
            <div className="medical-stat-change negative">
              🚨 Requires evaluation
            </div>
          </div>
        </div>

        {/* Results Section */}
        {filteredResults.length === 0 ? (
          <div className="medical-card" style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
            <div style={{ fontSize: '64px', marginBottom: 'var(--spacing-md)' }}>📊</div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--medical-gray-900)', marginBottom: 'var(--spacing-sm)' }}>
              No Screening Results Yet
            </h3>
            <p style={{ color: 'var(--medical-gray-600)', marginBottom: 'var(--spacing-lg)' }}>
              Complete a screening to see results here.
            </p>
            <button
              className="medical-btn medical-btn-primary"
              onClick={() => navigate('/new-screening')}
            >
              Start New Screening
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
                {filteredResults.map((result) => (
                  <div key={result.id} className="result-card medical-card">
                    <div className="result-card-header">
                      <div className="result-card-title">
                        <h3>{result.childName}</h3>
                        <span className="result-date">{formatDate(result.date)}</span>
                      </div>
                      <span className={`risk-badge ${getRiskClass(result.risk)}`}>
                        {getRiskText(result.risk)}
                      </span>
                    </div>
                    
                    <div className="result-card-body">
                      <div className="result-info-grid">
                        <div className="result-info-item">
                          <label>Verdict:</label>
                          <span className="verdict-text">{result.verdict || 'N/A'}</span>
                        </div>
                        <div className="result-info-item">
                          <label>Confidence:</label>
                          <span>{result.confidence ? `${(result.confidence * 100).toFixed(2)}%` : 'N/A'}</span>
                        </div>
                        <div className="result-info-item">
                          <label>Score:</label>
                          <span>{result.score}/100</span>
                        </div>
                        <div className="result-info-item">
                          <label>Duration:</label>
                          <span>{result.duration}</span>
                        </div>
                      </div>
                      
                      {result.modelProbs && (
                        <div className="model-predictions">
                          <h4>Model Predictions:</h4>
                          <div className="model-probs-grid">
                            {Object.entries(result.modelProbs).map(([model, prob]) => (
                              <div key={model} className="model-prob-item">
                                <span className="model-name">{model}:</span>
                                <span className="model-prob">{(prob * 100).toFixed(2)}%</span>
                                <div className="prob-bar">
                                  <div 
                                    className="prob-bar-fill" 
                                    style={{ width: `${prob * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="result-card-actions" style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                      {result.pdfReportUrl && (
                        <button
                          className="medical-btn medical-btn-primary"
                          onClick={() => window.open(result.pdfReportUrl, '_blank')}
                        >
                          📄 Download PDF
                        </button>
                      )}
                      <button
                        className="medical-btn medical-btn-danger"
                        onClick={() => handleDeleteResult(result.id, result.childName)}
                        title="Delete this screening result"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AllResults;