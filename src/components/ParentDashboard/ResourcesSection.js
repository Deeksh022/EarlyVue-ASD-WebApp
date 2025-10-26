import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/medical-theme.css';

const ResourcesSection = ({ resources, horizontal = false }) => {
  const navigate = useNavigate();

  // Handle case when resources is not provided or is empty
  const resourcesArray = Array.isArray(resources) ? resources : [
    {
      title: 'Understanding ASD Screening',
      description: 'Learn about what the screening results mean for your child',
      icon: '📚',
      color: 'var(--medical-primary)'
    },
    {
      title: 'Developmental Milestones',
      description: 'Track your child\'s development against typical milestones',
      icon: '📈',
      color: 'var(--medical-secondary)'
    },
    {
      title: 'Find a Specialist',
      description: 'Connect with healthcare professionals in your area',
      icon: '👨‍⚕️',
      color: 'var(--medical-info)'
    },
    {
      title: 'Support Groups',
      description: 'Connect with other parents and share experiences',
      icon: '👥',
      color: 'var(--medical-success)'
    }
  ];

  return (
    <div className="medical-card" style={{ height: 'fit-content' }}>
      <div className="medical-card-header" style={{ marginBottom: horizontal ? 'var(--spacing-lg)' : 'var(--spacing-md)' }}>
        <div className="medical-card-title">
          <div className="medical-card-icon">💡</div>
          Helpful Resources
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: horizontal ? 'repeat(auto-fit, minmax(280px, 1fr))' : '1fr',
        gap: horizontal ? 'var(--spacing-lg)' : 'var(--spacing-md)'
      }}>
        {resourcesArray.map((resource, index) => (
          <div
            key={index}
            style={{
              padding: horizontal ? 'var(--spacing-lg)' : 'var(--spacing-md)',
              background: 'var(--medical-gray-50)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--medical-gray-200)',
              transition: 'var(--transition-base)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: horizontal ? 'column' : 'row',
              gap: 'var(--spacing-md)',
              alignItems: horizontal ? 'center' : 'flex-start',
              textAlign: horizontal ? 'center' : 'left',
              height: '100%'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--medical-white)';
              e.currentTarget.style.borderColor = resource.color || 'var(--medical-primary)';
              e.currentTarget.style.transform = horizontal ? 'translateY(-4px)' : 'translateX(4px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--medical-gray-50)';
              e.currentTarget.style.borderColor = 'var(--medical-gray-200)';
              e.currentTarget.style.transform = horizontal ? 'translateY(0)' : 'translateX(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onClick={() => navigate(`/resources/${index + 1}`)}
          >
            <div
              style={{
                width: horizontal ? '64px' : '48px',
                height: horizontal ? '64px' : '48px',
                minWidth: horizontal ? '64px' : '48px',
                borderRadius: 'var(--radius-md)',
                background: resource.color ? `${resource.color}15` : 'var(--medical-primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: horizontal ? '32px' : '24px'
              }}
            >
              {resource.icon || '📄'}
            </div>
            <div style={{ flex: 1, width: '100%' }}>
              <h4 style={{
                fontSize: horizontal ? '16px' : '14px',
                fontWeight: '700',
                color: 'var(--medical-gray-900)',
                marginBottom: 'var(--spacing-xs)'
              }}>
                {resource.title || 'Resource'}
              </h4>
              <p style={{
                fontSize: horizontal ? '14px' : '13px',
                color: 'var(--medical-gray-600)',
                lineHeight: '1.5',
                marginBottom: 'var(--spacing-sm)'
              }}>
                {resource.description || 'Learn more about this topic'}
              </p>
              <span style={{
                fontSize: '12px',
                color: resource.color || 'var(--medical-primary)',
                fontWeight: '600',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                justifyContent: horizontal ? 'center' : 'flex-start'
              }}>
                Learn More →
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Emergency Contact Section - Only show in vertical mode */}
      {!horizontal && (
        <div
          className="medical-alert medical-alert-info"
          style={{
            marginTop: 'var(--spacing-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
            <span style={{ fontSize: '20px' }}>🚨</span>
            <h4 style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>
              Need Immediate Help?
            </h4>
          </div>
          <p style={{ fontSize: '13px', margin: 0, lineHeight: '1.5' }}>
            If you have concerns about your child's development, contact a healthcare professional.
          </p>
          <button
            className="medical-btn medical-btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 'var(--spacing-sm)' }}
            onClick={() => navigate('/find-specialist')}
          >
            Find a Specialist
          </button>
        </div>
      )}
    </div>
  );
};

export default ResourcesSection;