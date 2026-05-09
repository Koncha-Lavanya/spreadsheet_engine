// components/Grid.js
import React, { useState, useCallback, useEffect, useRef } from 'react';
import Cell from './Cell';
import { COLS, ROWS, cellKey } from '../utils/formulaEngine';

export default function Grid({ rawValues, computed, setCellValue }) {
  const [selected, setSelected] = useState('A1');
  const tableRef = useRef(null);

  // Focus the selected cell td so keyboard events work
  useEffect(() => {
    if (tableRef.current) {
      const el = tableRef.current.querySelector(`[data-cell="${selected}"]`);
      if (el) el.focus();
    }
  }, [selected]);

  const navigate = useCallback((direction) => {
    const col = selected[0];
    const row = parseInt(selected.slice(1));
    const colIdx = COLS.indexOf(col);

    let newCol = col;
    let newRow = row;

    if (direction === 'up') newRow = Math.max(1, row - 1);
    else if (direction === 'down') newRow = Math.min(10, row + 1);
    else if (direction === 'left') newCol = COLS[Math.max(0, colIdx - 1)];
    else if (direction === 'right') newCol = COLS[Math.min(COLS.length - 1, colIdx + 1)];

    setSelected(cellKey(newCol, newRow));
  }, [selected]);

  return (
    <div className="grid-wrapper">
      <table className="spreadsheet-table" ref={tableRef}>
        <thead>
          <tr>
            <th className="corner-header"></th>
            {COLS.map(col => (
              <th key={col} className={`col-header ${selected.startsWith(col) ? 'header-active' : ''}`}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map(row => (
            <tr key={row}>
              <td className={`row-header ${selected.endsWith(String(row)) && selected.length === (row >= 10 ? 3 : 2) ? 'header-active' : ''}`}>
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
                    onSelect={setSelected}
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
