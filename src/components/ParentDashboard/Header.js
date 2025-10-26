import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../services/auth';
import Logo from '../Logo';
import { DashboardIcon, NewScreeningIcon, AllResultsIcon, MyProfileIcon, HelpIcon, LogoutIcon } from '../NavigationIcons';
import '../../styles/medical-theme.css';

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <header className="medical-header">
      <div className="medical-header-container">
        <div onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
          <Logo size="large" showText={true} />
        </div>
        
        <nav className="medical-nav">
          <button className="medical-nav-link" onClick={() => navigate('/dashboard')}>
            <div className="nav-icon-wrapper">
              <DashboardIcon size={28} />
              <span className="nav-label">Dashboard</span>
            </div>
          </button>
          <button className="medical-nav-link" onClick={() => navigate('/new-screening')}>
            <div className="nav-icon-wrapper">
              <NewScreeningIcon size={28} />
              <span className="nav-label">New Screening</span>
            </div>
          </button>
          <button className="medical-nav-link" onClick={() => navigate('/all-results')}>
            <div className="nav-icon-wrapper">
              <AllResultsIcon size={28} />
              <span className="nav-label">All Results</span>
            </div>
          </button>
          <button className="medical-nav-link" onClick={() => navigate('/my-profile')}>
            <div className="nav-icon-wrapper">
              <MyProfileIcon size={28} />
              <span className="nav-label">My Profile</span>
            </div>
          </button>
        </nav>
        
        <div className="medical-user-menu">
          <div className="medical-user-info">
            <div className="medical-user-name">{user?.name || 'Parent'}</div>
            <div className="medical-user-role">Guardian</div>
          </div>
          <div className="medical-user-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
          </div>
          <button
            className="medical-btn medical-btn-secondary"
            style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={() => navigate('/help')}
          >
            <HelpIcon size={16} />
            <span>Help</span>
          </button>
          <button 
            className="medical-btn medical-btn-danger"
            style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={logout}
          >
            <LogoutIcon size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;