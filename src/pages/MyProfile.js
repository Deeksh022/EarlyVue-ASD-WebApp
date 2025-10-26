import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/ParentDashboard/Header';
import { useAuth } from '../services/auth';
import { getPatientsByUserId, deletePatient, updateUser } from '../services/database';
import '../styles/medical-theme.css';

const MyProfile = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: ''
  });
  const [totalScreenings, setTotalScreenings] = useState(0);

  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Load user profile data
        setProfileData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || '',
          emergencyContact: user.emergency_contact || '',
          emergencyPhone: user.emergency_phone || ''
        });

        // Load children
        const patientsResult = await getPatientsByUserId(user.id);
        if (patientsResult && patientsResult.success && patientsResult.patients) {
          setChildren(patientsResult.patients);
        }
        
        // Load user-specific screening count
        const storageKey = `screeningResults_${user.id}`;
        const savedResults = localStorage.getItem(storageKey);
        if (savedResults) {
          const results = JSON.parse(savedResults);
          // Filter to ensure we only count this user's results
          const userResults = results.filter(r => r.userId === user.id);
          setTotalScreenings(userResults.length);
        } else {
          setTotalScreenings(0);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!user) {
      console.error('No user found');
      alert('❌ No user session found. Please log in again.');
      return;
    }
    
    try {
      setSaving(true);
      
      console.log('Saving profile for user:', user.id);
      console.log('Profile data:', profileData);
      
      // Update user in database
      const result = await updateUser(user.id, {
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        address: profileData.address,
        emergency_contact: profileData.emergencyContact,
        emergency_phone: profileData.emergencyPhone
      });
      
      console.log('Update result:', result);
      
      if (result.success) {
        // Refresh the user context to update the header
        refreshUser();
        setIsEditing(false);
        alert('✅ Profile updated successfully!');
      } else {
        alert(`❌ Failed to update profile: ${result.error || 'Unknown error'}`);
        console.error('Update failed:', result.error);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert(`❌ An error occurred: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteChild = async (childId, childName) => {
    if (!user) return;
    
    // Count how many screening results will be deleted from user-specific storage
    const storageKey = `screeningResults_${user.id}`;
    const saved = localStorage.getItem(storageKey);
    let screeningCount = 0;
    if (saved) {
      const results = JSON.parse(saved);
      screeningCount = results.filter(r => r.childId === childId.toString() || r.childId === childId).length;
    }

    const confirmed = window.confirm(
      `⚠️ DELETE ${childName.toUpperCase()}?\n\n` +
      `This will PERMANENTLY delete:\n` +
      `• Child profile: ${childName}\n` +
      `• ${screeningCount} screening result(s)\n` +
      `• All PDF reports\n` +
      `• All historical data\n\n` +
      `❌ THIS ACTION CANNOT BE UNDONE!\n\n` +
      `Are you absolutely sure?`
    );

    if (confirmed) {
      try {
        console.log(`Deleting child ID: ${childId}, Name: ${childName}`);
        
        // Delete from database
        const result = await deletePatient(childId);
        
        if (result.success) {
          console.log('Child deleted from database successfully');
          
          // Remove from local state
          setChildren(prev => prev.filter(c => c.id !== childId));
          
          // Delete ALL associated screening results from user-specific localStorage
          const storageKey = `screeningResults_${user.id}`;
          const saved = localStorage.getItem(storageKey);
          if (saved) {
            const results = JSON.parse(saved);
            const beforeCount = results.length;
            
            // Filter out all results for this child (check both string and number IDs)
            const filteredResults = results.filter(r => {
              const resultChildId = r.childId?.toString();
              const targetChildId = childId?.toString();
              return resultChildId !== targetChildId;
            });
            
            const afterCount = filteredResults.length;
            const deletedCount = beforeCount - afterCount;
            
            localStorage.setItem(storageKey, JSON.stringify(filteredResults));
            console.log(`Deleted ${deletedCount} screening results from user-specific localStorage`);
            
            // Update the total screenings count
            setTotalScreenings(afterCount);
          }
          
          // Also clear any cached data for this child
          sessionStorage.removeItem(`child_${childId}_data`);
          
          // Trigger a page reload to ensure all components update
          alert(
            `✅ ${childName} has been deleted successfully!\n\n` +
            `Deleted:\n` +
            `• Child profile\n` +
            `• ${screeningCount} screening result(s)\n\n` +
            `The page will refresh to update all data.`
          );
          
          // Reload the page to ensure all components are updated
          window.location.reload();
        } else {
          alert('❌ Failed to delete child from database. Please try again.');
          console.error('Delete failed:', result);
        }
      } catch (error) {
        console.error('Error deleting child:', error);
        alert('❌ An error occurred while deleting the child. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Header />
        <main className="dashboard-main">
          <div className="medical-spinner"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container" style={{ background: 'var(--medical-gray-50)', minHeight: '100vh' }}>
      <Header />
      <main className="dashboard-main" style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--spacing-xl)' }}>
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
                  👤
                </div>
                <div>
                  <h1 style={{ 
                    fontSize: '36px', 
                    fontWeight: '700', 
                    margin: 0,
                    letterSpacing: '-0.5px'
                  }}>
                    My Profile
                  </h1>
                  <p style={{ 
                    fontSize: '16px', 
                    margin: '8px 0 0 0',
                    opacity: 0.95,
                    fontWeight: '500'
                  }}>
                    Manage your guardian profile and registered children
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
                  <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>{children.length}</div>
                  <div style={{ fontSize: '13px', opacity: 0.9 }}>Registered Children</div>
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>{user?.name || 'Guardian'}</div>
                  <div style={{ fontSize: '13px', opacity: 0.9 }}>Account Name</div>
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>Active</div>
                  <div style={{ fontSize: '13px', opacity: 0.9 }}>Account Status</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-xl)' }}>
          {/* Main Profile Section */}
          <div>
            {/* Guardian Information */}
            <div className="medical-card" style={{ marginBottom: 'var(--spacing-xl)' }}>
              <div className="medical-card-header">
                <div className="medical-card-title">
                  <div className="medical-card-icon">👤</div>
                  Guardian Information
                </div>
                <button
                  className={`medical-btn ${isEditing ? 'medical-btn-success' : 'medical-btn-primary'}`}
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  disabled={saving}
                >
                  {saving ? '⏳ Saving...' : (isEditing ? '💾 Save Changes' : '✏️ Edit Profile')}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
                <div className="medical-form-group">
                  <label className="medical-label">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    className="medical-input"
                    value={profileData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="medical-form-group">
                  <label className="medical-label">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    className="medical-input"
                    value={profileData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="your.email@example.com"
                  />
                </div>

                <div className="medical-form-group">
                  <label className="medical-label">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    className="medical-input"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="medical-form-group">
                  <label className="medical-label">Address</label>
                  <input
                    type="text"
                    name="address"
                    className="medical-input"
                    value={profileData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="123 Main St, City, State"
                  />
                </div>

                <div className="medical-form-group">
                  <label className="medical-label">Emergency Contact Name</label>
                  <input
                    type="text"
                    name="emergencyContact"
                    className="medical-input"
                    value={profileData.emergencyContact}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Emergency contact person"
                  />
                </div>

                <div className="medical-form-group">
                  <label className="medical-label">Emergency Contact Phone</label>
                  <input
                    type="tel"
                    name="emergencyPhone"
                    className="medical-input"
                    value={profileData.emergencyPhone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="+1 (555) 987-6543"
                  />
                </div>
              </div>
            </div>

            {/* Registered Children */}
            <div className="medical-card">
              <div className="medical-card-header">
                <div className="medical-card-title">
                  <div className="medical-card-icon">👶</div>
                  Registered Children ({children.length})
                </div>
                <button
                  className="medical-btn medical-btn-primary"
                  onClick={() => navigate('/add-child')}
                >
                  ➕ Add New Child
                </button>
              </div>

              {children.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)', color: 'var(--medical-gray-500)' }}>
                  <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-md)' }}>👶</div>
                  <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>No Children Registered</h3>
                  <p style={{ marginBottom: 'var(--spacing-lg)' }}>Add your first child to start screening</p>
                  <button
                    className="medical-btn medical-btn-primary"
                    onClick={() => navigate('/add-child')}
                  >
                    Add Child
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                  {children.map((child) => (
                    <div
                      key={child.id}
                      style={{
                        padding: 'var(--spacing-lg)',
                        background: 'var(--medical-gray-50)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--medical-gray-200)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: 'var(--radius-full)',
                          background: 'linear-gradient(135deg, var(--medical-primary), var(--medical-secondary))',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '24px'
                        }}>
                          {child.gender === 'Male' ? '👦' : '👧'}
                        </div>
                        <div>
                          <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--medical-gray-900)', marginBottom: '4px' }}>
                            {child.name}
                          </h4>
                          <p style={{ fontSize: '14px', color: 'var(--medical-gray-600)' }}>
                            {child.age_months ? `${child.age_months} months` : 'Age not specified'} • {child.gender || 'Not specified'}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                        <button
                          className="medical-btn medical-btn-secondary"
                          style={{ padding: '8px 16px', fontSize: '14px' }}
                          onClick={() => navigate('/new-screening')}
                        >
                          🎯 Start Screening
                        </button>
                        <button
                          className="medical-btn medical-btn-danger"
                          style={{ padding: '8px 16px', fontSize: '14px' }}
                          onClick={() => handleDeleteChild(child.id, child.name)}
                          title="Delete child and all associated screenings"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Account Summary */}
            <div className="medical-card" style={{ marginBottom: 'var(--spacing-lg)' }}>
              <div className="medical-card-header">
                <div className="medical-card-title">
                  <div className="medical-card-icon">📊</div>
                  Account Summary
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                <div className="medical-stat-card" style={{ borderLeftColor: 'var(--medical-primary)' }}>
                  <div className="medical-stat-label">Total Children</div>
                  <div className="medical-stat-value">{children.length}</div>
                </div>
                <div className="medical-stat-card" style={{ borderLeftColor: 'var(--medical-secondary)' }}>
                  <div className="medical-stat-label">Total Screenings</div>
                  <div className="medical-stat-value">
                    {totalScreenings}
                  </div>
                </div>
                <div className="medical-stat-card" style={{ borderLeftColor: 'var(--medical-success)' }}>
                  <div className="medical-stat-label">Member Since</div>
                  <div className="medical-stat-value" style={{ fontSize: '16px' }}>
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="medical-card">
              <div className="medical-card-header">
                <div className="medical-card-title">
                  <div className="medical-card-icon">⚡</div>
                  Quick Actions
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                <button
                  className="medical-btn medical-btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => navigate('/new-screening')}
                >
                  New Screening
                </button>
                <button
                  className="medical-btn medical-btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => navigate('/all-results')}
                >
                  View All Results
                </button>
                <button
                  className="medical-btn medical-btn-secondary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => navigate('/add-child')}
                >
                  Add New Child
                </button>
                <button
                  className="medical-btn medical-btn-secondary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => navigate('/help')}
                >
                  Get Help
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyProfile;
