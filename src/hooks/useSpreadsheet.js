// hooks/useSpreadsheet.js
import { useState, useCallback } from 'react';
import { COLS, ROWS, cellKey, recalcAll } from '../utils/formulaEngine';

function buildInitialRaw() {
  const raw = {};
  for (const col of COLS) {
    for (const row of ROWS) {
      raw[cellKey(col, row)] = '';
    }
  }
  return raw;
}

export function useSpreadsheet() {
  const [rawValues, setRawValues] = useState(buildInitialRaw);
  const [computed, setComputed] = useState(() => recalcAll(buildInitialRaw()));
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);

  const setCellValue = useCallback((cell, value) => {
    setRawValues(prev => {
      const next = { ...prev, [cell]: value };
      const newComputed = recalcAll(next);
      setComputed(newComputed);
      setHistory(h => [...h, prev]);
      setFuture([]);
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    setHistory(h => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      const rest = h.slice(0, -1);
      setFuture(f => [rawValues, ...f]);
      setRawValues(prev);
      setComputed(recalcAll(prev));
      return rest;
    });
  }, [rawValues]);

  const redo = useCallback(() => {
    setFuture(f => {
      if (f.length === 0) return f;
      const next = f[0];
      const rest = f.slice(1);
      setHistory(h => [...h, rawValues]);
      setRawValues(next);
      setComputed(recalcAll(next));
      return rest;
    });
  }, [rawValues]);

  const clearAll = useCallback(() => {
    const fresh = buildInitialRaw();
    setHistory(h => [...h, rawValues]);
    setFuture([]);
    setRawValues(fresh);
    setComputed(recalcAll(fresh));
  }, [rawValues]);

  return {
    rawValues,
    computed,
    setCellValue,
    undo,
    redo,
    canUndo: history.length > 0,
    canRedo: future.length > 0,
    clearAll,
  };
}
