import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { VideoPage } from './pages/VideoPage';

export const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<VideoPage />} />
      </Routes>
    </Router>
  );
}; 