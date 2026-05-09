// components/FormulaBar.js
import React from 'react';

export default function FormulaBar({ selectedCell, rawValue, onCommit }) {
  const [draft, setDraft] = React.useState('');
  const [active, setActive] = React.useState(false);

  React.useEffect(() => {
    if (!active) setDraft(rawValue || '');
  }, [rawValue, selectedCell, active]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onCommit(selectedCell, draft);
      setActive(false);
    } else if (e.key === 'Escape') {
      setDraft(rawValue || '');
      setActive(false);
    }
  };

  return (
    <div className="formula-bar">
      <div className="formula-cell-label">{selectedCell}</div>
      <div className="formula-fx">fx</div>
      <input
        className="formula-input"
        value={active ? draft : (rawValue || '')}
        onChange={e => { setActive(true); setDraft(e.target.value); }}
        onFocus={() => { setActive(true); setDraft(rawValue || ''); }}
        onBlur={() => { onCommit(selectedCell, draft); setActive(false); }}
        onKeyDown={handleKeyDown}
        placeholder="Enter value or formula (e.g. =A1+B2)"
        spellCheck={false}
      />
    </div>
  );
}
