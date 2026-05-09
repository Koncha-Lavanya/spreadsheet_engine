// components/Cell.js
import React, { useState, useRef, useEffect, useCallback } from 'react';

function getDisplayClass(val) {
  if (typeof val === 'string') {
    if (val === '#CIRCULAR') return 'cell-circular';
    if (val.startsWith('#')) return 'cell-error';
    if (val === 'TRUE') return 'cell-bool-true';
    if (val === 'FALSE') return 'cell-bool-false';
  }
  return '';
}

function getAlignClass(val) {
  if (val === '' || val === null || val === undefined) return '';
  if (typeof val === 'number') return 'align-right';
  if (typeof val === 'string') {
    if (val === 'TRUE' || val === 'FALSE') return 'align-center';
    if (val.startsWith('#')) return 'align-center';
    if (!isNaN(Number(val)) && val !== '') return 'align-right';
    return 'align-left';
  }
  return 'align-right';
}

function formatDisplay(val) {
  if (val === '' || val === null || val === undefined) return '';
  if (typeof val === 'number') {
    return parseFloat(val.toFixed(10)).toString();
  }
  return String(val);
}

export default function Cell({
  cellId,
  rawValue,
  computedValue,
  isSelected,
  onSelect,
  onChange,
  onNavigate,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const startEdit = useCallback(() => {
    setDraft(rawValue || '');
    setEditing(true);
  }, [rawValue]);

  const commitEdit = useCallback(() => {
    setEditing(false);
    onChange(cellId, draft);
  }, [cellId, draft, onChange]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      commitEdit();
      onNavigate('down');
    } else if (e.key === 'Escape') {
      setEditing(false);
      setDraft(rawValue || '');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      commitEdit();
      onNavigate(e.shiftKey ? 'left' : 'right');
    } else if (e.key === 'ArrowUp') {
      commitEdit();
      onNavigate('up');
    } else if (e.key === 'ArrowDown') {
      commitEdit();
      onNavigate('down');
    }
  }, [commitEdit, onNavigate, rawValue]);

  const handleCellKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === 'F2') {
      startEdit();
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      onChange(cellId, '');
    } else if (e.key === 'ArrowUp') onNavigate('up');
    else if (e.key === 'ArrowDown') onNavigate('down');
    else if (e.key === 'ArrowLeft') onNavigate('left');
    else if (e.key === 'ArrowRight') onNavigate('right');
    else if (e.key === 'Tab') {
      e.preventDefault();
      onNavigate(e.shiftKey ? 'left' : 'right');
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      setDraft(e.key);
      setEditing(true);
    }
  }, [startEdit, onChange, cellId, onNavigate]);

  const displayClass = getDisplayClass(computedValue);
  const alignClass = getAlignClass(computedValue);
  const displayVal = formatDisplay(computedValue);

  return (
    <td
      className={`cell ${isSelected ? 'cell-selected' : ''} ${displayClass}`}
      onClick={() => onSelect(cellId)}
      onDoubleClick={startEdit}
      onKeyDown={handleCellKeyDown}
      tabIndex={isSelected ? 0 : -1}
      data-cell={cellId}
    >
      {editing ? (
        <input
          ref={inputRef}
          className="cell-input"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          spellCheck={false}
        />
      ) : (
        <span className={`cell-display ${alignClass}`}>{displayVal}</span>
      )}
    </td>
  );
}
