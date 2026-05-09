// components/Toolbar.js
import React from 'react';

export default function Toolbar({ onUndo, onRedo, canUndo, canRedo, onClear }) {
  return (
    <div className="toolbar">
      <div className="toolbar-brand">
        <span className="brand-icon">⊞</span>
        <span className="brand-name">GridForge</span>
        <span className="brand-tag">Spreadsheet Engine</span>
      </div>
      <div className="toolbar-actions">
        <button
          className={`toolbar-btn ${canUndo ? '' : 'disabled'}`}
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <span>↩</span> Undo
        </button>
        <button
          className={`toolbar-btn ${canRedo ? '' : 'disabled'}`}
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
        >
          <span>↪</span> Redo
        </button>
        <div className="toolbar-divider" />
        <button className="toolbar-btn toolbar-btn-danger" onClick={onClear} title="Clear all cells">
          <span>⊘</span> Clear All
        </button>
      </div>
      <div className="toolbar-hints">
        <span className="hint"><kbd>=</kbd> formula</span>
        <span className="hint"><kbd>Enter</kbd> confirm</span>
        <span className="hint"><kbd>Esc</kbd> cancel</span>
        <span className="hint"><kbd>↑↓←→</kbd> navigate</span>
      </div>
    </div>
  );
}
