import React from 'react';

export const AppHeader = () => {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="logo">VideoStream</h1>
        </div>
        <div className="header-center">
          <nav className="main-nav">
            <ul>
              <li><a href="/" className="active">Home</a></li>
              <li><a href="/library">Library</a></li>
              <li><a href="/favorites">Favorites</a></li>
            </ul>
          </nav>
        </div>
        <div className="header-right">
          <div className="search-bar">
            <input type="text" placeholder="Search videos..." />
            <button className="search-button">
              <svg viewBox="0 0 24 24" className="search-icon">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}; 