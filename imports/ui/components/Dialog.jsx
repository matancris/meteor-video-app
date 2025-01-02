import React from 'react';

export const Dialog = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="dialog-actions">
          <button className="dialog-button cancel" onClick={onCancel}>Cancel</button>
          <button className="dialog-button confirm" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}; 