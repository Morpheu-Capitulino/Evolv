// src/components/Header.jsx
import React from 'react';

export default function Header({ title, subtitle, rightIcon, onRightIconClick }) {
  return (
    <header className="treino-header-modern">
      <div className="header-left">
        <span className="greeting">{subtitle}</span>
        <h1 className="page-title">{title}</h1>
      </div>
      
      {rightIcon && (
        <div className="header-right">
          <div className="calendar-icon-btn" onClick={onRightIconClick}>
            {rightIcon}
          </div>
        </div>
      )}
    </header>
  );
}