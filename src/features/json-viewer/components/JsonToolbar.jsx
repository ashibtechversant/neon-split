import React from 'react';

export default function JsonToolbar({ children, className = '' }) {
  return (
    <div
      className={`controls ${className}`}
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '0.5rem',
        marginTop: '0.5rem', // Add some spacing from the panel
      }}
    >
      {children}
    </div>
  );
}
