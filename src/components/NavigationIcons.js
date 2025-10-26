import React from 'react';

export const DashboardIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <rect x="6" y="6" width="16" height="16" rx="2" fill="#9B59B6" opacity="0.8"/>
    <rect x="26" y="6" width="16" height="10" rx="2" fill="#3498DB" opacity="0.8"/>
    <rect x="6" y="26" width="16" height="16" rx="2" fill="#E74C3C" opacity="0.8"/>
    <rect x="26" y="20" width="16" height="22" rx="2" fill="#F39C12" opacity="0.8"/>
    <path d="M10 18L14 14L18 18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <rect x="30" y="24" width="8" height="2" fill="white" opacity="0.8"/>
    <rect x="30" y="28" width="8" height="2" fill="white" opacity="0.8"/>
    <rect x="30" y="32" width="8" height="2" fill="white" opacity="0.8"/>
  </svg>
);

export const NewScreeningIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="18" fill="#A8D5E2" opacity="0.9"/>
    <circle cx="24" cy="24" r="14" fill="#6CB4D8" opacity="0.7"/>
    {/* Brain illustration */}
    <path d="M20 18C20 18 18 20 18 22C18 24 19 25 20 26C21 27 22 27 23 27" stroke="#4A90A4" strokeWidth="2" fill="none"/>
    <path d="M28 18C28 18 30 20 30 22C30 24 29 25 28 26C27 27 26 27 25 27" stroke="#4A90A4" strokeWidth="2" fill="none"/>
    <circle cx="21" cy="21" r="1.5" fill="#4A90A4"/>
    <circle cx="27" cy="21" r="1.5" fill="#4A90A4"/>
    <path d="M24 24C24 24 22 26 24 28C26 26 24 24 24 24Z" fill="#4A90A4"/>
    {/* Target/Focus circle */}
    <circle cx="34" cy="34" r="8" fill="#E74C3C" opacity="0.9"/>
    <circle cx="34" cy="34" r="5" fill="white"/>
    <circle cx="34" cy="34" r="2" fill="#E74C3C"/>
  </svg>
);

export const AllResultsIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <rect x="10" y="8" width="28" height="34" rx="2" fill="#D4A574" opacity="0.9"/>
    <rect x="12" y="10" width="24" height="30" fill="white"/>
    {/* Document lines */}
    <rect x="16" y="14" width="16" height="2" fill="#3498DB" opacity="0.6"/>
    <rect x="16" y="18" width="16" height="2" fill="#3498DB" opacity="0.6"/>
    <rect x="16" y="22" width="12" height="2" fill="#3498DB" opacity="0.6"/>
    <rect x="16" y="26" width="16" height="2" fill="#3498DB" opacity="0.6"/>
    <rect x="16" y="30" width="10" height="2" fill="#3498DB" opacity="0.6"/>
    {/* Magnifying glass */}
    <circle cx="32" cy="32" r="6" stroke="#5A4A3A" strokeWidth="2" fill="none"/>
    <line x1="36" y1="36" x2="40" y2="40" stroke="#5A4A3A" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const MyProfileIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="20" fill="#4A5568" opacity="0.9"/>
    <circle cx="24" cy="24" r="18" fill="#5A6B7D"/>
    {/* User silhouette */}
    <circle cx="24" cy="20" r="6" fill="white"/>
    <path d="M12 38C12 32 17 28 24 28C31 28 36 32 36 38" fill="white"/>
    {/* Settings gear */}
    <circle cx="34" cy="14" r="6" fill="#E74C3C" opacity="0.9"/>
    <circle cx="34" cy="14" r="3" fill="white"/>
    <rect x="33" y="9" width="2" height="2" fill="#E74C3C"/>
    <rect x="33" y="17" width="2" height="2" fill="#E74C3C"/>
    <rect x="29" y="13" width="2" height="2" fill="#E74C3C"/>
    <rect x="37" y="13" width="2" height="2" fill="#E74C3C"/>
  </svg>
);

export const HelpIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M12 16V16.5M12 8C10.3431 8 9 9.34315 9 11C9 11.5523 9.44772 12 10 12C10.5523 12 11 11.5523 11 11C11 10.4477 11.4477 10 12 10C12.5523 10 13 10.4477 13 11C13 11.5523 12.5523 12 12 12V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const LogoutIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
