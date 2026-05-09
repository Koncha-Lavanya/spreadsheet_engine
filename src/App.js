// App.js
import React, { useEffect, useCallback } from 'react';
import { useSpreadsheet } from './hooks/useSpreadsheet';
import Grid from './components/Grid';
import FormulaBar from './components/FormulaBar';
import Toolbar from './components/Toolbar';
import StatusBar from './components/StatusBar';
import './App.css';

// We lift selected cell to App so FormulaBar can read raw value
function App() {
  const { rawValues, computed, setCellValue, undo, redo, canUndo, canRedo, clearAll } = useSpreadsheet();
  const [selectedCell, setSelectedCell] = React.useState('A1');

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  // Intercept setCellValue to also track which cell was last modified
  const handleCellChange = useCallback((cell, value) => {
    setCellValue(cell, value);
  }, [setCellValue]);

  return (
    <div className="app">
      <div className="app-bg" />
      <Toolbar
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onClear={clearAll}
      />
      <FormulaBar
        selectedCell={selectedCell}
        rawValue={rawValues[selectedCell] || ''}
        onCommit={handleCellChange}
      />
      <main className="app-main">
        <GridWithSelection
          rawValues={rawValues}
          computed={computed}
          setCellValue={handleCellChange}
          onSelectionChange={setSelectedCell}
        />
      </main>
      <StatusBar computed={computed} />
    </div>
  );
}

// Wrapper to lift selection state
function GridWithSelection({ rawValues, computed, setCellValue, onSelectionChange }) {
  const [selected, setSelected] = React.useState('A1');

  const handleSelect = useCallback((cell) => {
    setSelected(cell);
    onSelectionChange(cell);
  }, [onSelectionChange]);

  return (
    <GridControlled
      rawValues={rawValues}
      computed={computed}
      setCellValue={setCellValue}
      selected={selected}
      onSelect={handleSelect}
    />
  );
}

// Controlled grid with external selected state
import { COLS, ROWS, cellKey } from './utils/formulaEngine';
import Cell from './components/Cell';

function GridControlled({ rawValues, computed, setCellValue, selected, onSelect }) {
  const tableRef = React.useRef(null);

  React.useEffect(() => {
    if (tableRef.current) {
      const el = tableRef.current.querySelector(`[data-cell="${selected}"]`);
      if (el) el.focus();
    }
  }, [selected]);

  const navigate = useCallback((direction) => {
    const col = selected[0];
    const row = parseInt(selected.slice(1));
    const colIdx = COLS.indexOf(col);
    let newCol = col, newRow = row;
    if (direction === 'up') newRow = Math.max(1, row - 1);
    else if (direction === 'down') newRow = Math.min(10, row + 1);
    else if (direction === 'left') newCol = COLS[Math.max(0, colIdx - 1)];
    else if (direction === 'right') newCol = COLS[Math.min(COLS.length - 1, colIdx + 1)];
    onSelect(cellKey(newCol, newRow));
  }, [selected, onSelect]);

  return (
    <div className="grid-wrapper">
      <table className="spreadsheet-table" ref={tableRef}>
        <thead>
          <tr>
            <th className="corner-header"></th>
            {COLS.map(col => (
              <th key={col} className={`col-header ${selected[0] === col ? 'header-active' : ''}`}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map(row => (
            <tr key={row}>
              <td className={`row-header ${parseInt(selected.slice(1)) === row ? 'header-active' : ''}`}>
                {row}
              </td>
              {COLS.map(col => {
                const id = cellKey(col, row);
                return (
                  <Cell
                    key={id}
                    cellId={id}
                    rawValue={rawValues[id] || ''}
                    computedValue={computed[id]}
                    isSelected={selected === id}
                    onSelect={onSelect}
                    onChange={setCellValue}
                    onNavigate={navigate}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
