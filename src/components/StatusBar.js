// components/StatusBar.js
import React from 'react';

export default function StatusBar({ computed }) {
  const errorCells = Object.entries(computed)
    .filter(([, v]) => typeof v === 'string' && v.startsWith('#'))
    .map(([k, v]) => ({ cell: k, error: v }));

  const formulaCells = Object.values(computed).filter(
    v => v !== '' && v !== null && v !== undefined
  ).length;

  return (
    <div className="status-bar">
      <div className="status-left">
        <span className="status-item">
          <span className="status-dot green" /> {formulaCells} cells active
        </span>
        {errorCells.length > 0 && (
          <span className="status-item error-status">
            <span className="status-dot red" />
            {errorCells.length} error{errorCells.length > 1 ? 's' : ''}:&nbsp;
            {errorCells.slice(0, 4).map(({ cell, error }) => (
              <span key={cell} className="error-badge">{cell}={error}</span>
            ))}
            {errorCells.length > 4 && <span className="error-badge">+{errorCells.length - 4} more</span>}
          </span>
        )}
      </div>
      <div className="status-right">
        <span className="status-item">10×10 grid · 100 cells</span>
      </div>
    </div>
  );
}
