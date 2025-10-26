import React from 'react';

const Logo = ({ size = 'medium', showText = true }) => {
  const sizes = {
    small: { container: 40, icon: 32, text: 14 },
    medium: { container: 48, icon: 40, text: 16 },
    large: { container: 56, icon: 46, text: 18 }
  };

  const s = sizes[size];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      {/* Logo Icon - Simplified version of the brain/child illustration */}
      <div style={{
        width: `${s.container}px`,
        height: `${s.container}px`,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #0066CC 0%, #00A896 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0, 102, 204, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Brain icon representation */}
        <svg width={s.icon} height={s.icon} viewBox="0 0 24 24" fill="none">
          <path d="M12 2C10.3431 2 9 3.34315 9 5C9 5.55228 9.44772 6 10 6C10.5523 6 11 5.55228 11 5C11 4.44772 11.4477 4 12 4C12.5523 4 13 4.44772 13 5C13 5.55228 13.4477 6 14 6C14.5523 6 15 5.55228 15 5C15 3.34315 13.6569 2 12 2Z" fill="white"/>
          <path d="M7 8C6.44772 8 6 8.44772 6 9C6 9.55228 6.44772 10 7 10C7.55228 10 8 9.55228 8 9C8 8.44772 7.55228 8 7 8Z" fill="white"/>
          <path d="M17 8C16.4477 8 16 8.44772 16 9C16 9.55228 16.4477 10 17 10C17.5523 10 18 9.55228 18 9C18 8.44772 17.5523 8 17 8Z" fill="white"/>
          <path d="M12 12C10.8954 12 10 12.8954 10 14C10 15.1046 10.8954 16 12 16C13.1046 16 14 15.1046 14 14C14 12.8954 13.1046 12 12 12Z" fill="white"/>
          <circle cx="12" cy="18" r="2" fill="white" opacity="0.7"/>
          <path d="M8 14C7.44772 14 7 14.4477 7 15C7 15.5523 7.44772 16 8 16C8.55228 16 9 15.5523 9 15C9 14.4477 8.55228 14 8 14Z" fill="white" opacity="0.5"/>
          <path d="M16 14C15.4477 14 15 14.4477 15 15C15 15.5523 15.4477 16 16 16C16.5523 16 17 15.5523 17 15C17 14.4477 16.5523 14 16 14Z" fill="white" opacity="0.5"/>
        </svg>
      </div>
      
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{
            fontSize: `${s.text}px`,
            fontWeight: '700',
            color: '#0066CC',
            letterSpacing: '-0.5px',
            lineHeight: '1'
          }}>
            EARLYVUE
          </div>
          <div style={{
            fontSize: `${s.text * 0.6}px`,
            color: '#64748B',
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginTop: '2px'
          }}>
            ASD Screening
          </div>
        </div>
      )}
    </div>
  );
};

export default Logo;
