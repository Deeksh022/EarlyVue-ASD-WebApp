import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/ParentDashboard/Header';
import { useAuth } from '../services/auth';
import { createPatient } from '../services/database';

const AddChild = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    dateOfBirth: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Function to calculate age in months from date of birth
  const calculateAgeInMonths = (dob) => {
    if (!dob) return '';
    
    const birthDate = new Date(dob);
    const today = new Date();
    
    let months = (today.getFullYear() - birthDate.getFullYear()) * 12;
    months += today.getMonth() - birthDate.getMonth();
    
    // Adjust if the current day is before the birth day in the month
    if (today.getDate() < birthDate.getDate()) {
      months--;
    }
    
    return Math.max(0, months); // Ensure non-negative
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // If date of birth is changed, automatically calculate age in months
    if (name === 'dateOfBirth') {
      const ageInMonths = calculateAgeInMonths(value);
      setFormData({
        ...formData,
        dateOfBirth: value,
        age: ageInMonths.toString()
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError('You must be logged in to add a child');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await createPatient(formData, user.id);

      if (result.success) {
        // Navigate back to dashboard after successfully adding
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Error adding child:', error);
      setError('Failed to add child. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'var(--medical-gray-50)', minHeight: '100vh' }}>
      <Header />
      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: 'var(--spacing-xl)' }}>
        {/* Modern Header Section */}
        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
          <button
            className="medical-btn medical-btn-secondary"
            onClick={() => navigate('/dashboard')}
            style={{ marginBottom: 'var(--spacing-lg)' }}
          >
            ← Back to Dashboard
          </button>
          
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
                  👶
                </div>
                <div>
                  <h1 style={{ 
                    fontSize: '36px', 
                    fontWeight: '700', 
                    margin: 0,
                    letterSpacing: '-0.5px'
                  }}>
                    Add New Child
                  </h1>
                  <p style={{ 
                    fontSize: '16px', 
                    margin: '8px 0 0 0',
                    opacity: 0.95,
                    fontWeight: '500'
                  }}>
                    Add your child's information to start screening
                  </p>
                </div>
              </div>
              
              {/* Quick Info */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 'var(--spacing-md)',
                marginTop: 'var(--spacing-lg)',
                paddingTop: 'var(--spacing-lg)',
                borderTop: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>Quick</div>
                  <div style={{ fontSize: '13px', opacity: 0.9 }}>Easy Registration</div>
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>Secure</div>
                  <div style={{ fontSize: '13px', opacity: 0.9 }}>Data Protected</div>
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>Simple</div>
                  <div style={{ fontSize: '13px', opacity: 0.9 }}>4 Fields Only</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && <div className="medical-alert medical-alert-danger" style={{ marginBottom: 'var(--spacing-xl)' }}>{error}</div>}

        <div className="medical-card">
          <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Child's Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your child's full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="dateOfBirth">Date of Birth</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="age">
                  Current Age (months)
                  {formData.age && (
                    <span style={{ marginLeft: '8px', fontSize: '12px', color: '#10b981', fontWeight: '500' }}>
                      ✓ Auto-calculated
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  min="1"
                  max="120"
                  placeholder="Auto-calculated from date of birth"
                  readOnly
                  style={{ 
                    backgroundColor: formData.age ? '#f0fdf4' : '#ffffff',
                    cursor: formData.age ? 'not-allowed' : 'text'
                  }}
                />
                {formData.age && (
                  <small style={{ color: '#64748b', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    Age is automatically calculated from the date of birth ({formData.age} months = {Math.floor(formData.age / 12)} years and {formData.age % 12} months)
                  </small>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'flex-end', marginTop: 'var(--spacing-xl)' }}>
                <button
                  type="button"
                  className="medical-btn medical-btn-secondary"
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="medical-btn medical-btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Adding Child...' : 'Add Child'}
                </button>
              </div>
            </form>
          </div>
      </main>
    </div>
  );
};

export default AddChild;