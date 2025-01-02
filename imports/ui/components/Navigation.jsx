import React from 'react';
import { Link } from 'react-router-dom';

export const Navigation = () => (
  <nav className="navigation">
    <ul>
      <li><Link to="/">Videos</Link></li>
      {/* Add more navigation items here */}
    </ul>
  </nav>
); 