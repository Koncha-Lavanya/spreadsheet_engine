// utils/formulaEngine.js

export const COLS = ['A','B','C','D','E','F','G','H','I','J'];
export const ROWS = [1,2,3,4,5,6,7,8,9,10];

export function cellKey(col, row) {
  return `${col}${row}`;
}

export function parseCellRef(ref) {
  const match = ref.match(/^([A-J])([1-9]|10)$/);
  if (!match) return null;
  return { col: match[1], row: parseInt(match[2]) };
}

// Extract all cell references from a formula string
export function extractRefs(formula) {
  const refs = [];
  const pattern = /[A-J](?:[1-9]|10)/g;
  let m;
  while ((m = pattern.exec(formula)) !== null) {
    const parsed = parseCellRef(m[0]);
    if (parsed) refs.push(m[0]);
  }
  return [...new Set(refs)];
}

// Topological sort using Kahn's algorithm
export function topoSort(allCells, deps) {
  // deps: Map<cellKey, Set<cellKey>> — deps[cell] = set of cells that cell depends on
  // We want to sort so dependencies come before dependents
  const inDegree = {};
  const graph = {}; // graph[a] = cells that depend on a

  for (const cell of allCells) {
    inDegree[cell] = inDegree[cell] || 0;
    graph[cell] = graph[cell] || [];
  }

  for (const [cell, cellDeps] of deps.entries()) {
    for (const dep of cellDeps) {
      graph[dep] = graph[dep] || [];
      graph[dep].push(cell);
      inDegree[cell] = (inDegree[cell] || 0) + 1;
    }
  }

  const queue = allCells.filter(c => (inDegree[c] || 0) === 0);
  const sorted = [];

  while (queue.length > 0) {
    const node = queue.shift();
    sorted.push(node);
    for (const neighbor of (graph[node] || [])) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) queue.push(neighbor);
    }
  }

  return sorted;
}

// Detect circular references using DFS
export function detectCircular(cell, deps, visited = new Set(), stack = new Set()) {
  if (stack.has(cell)) return true;
  if (visited.has(cell)) return false;
  visited.add(cell);
  stack.add(cell);
  for (const dep of (deps.get(cell) || [])) {
    if (detectCircular(dep, deps, visited, stack)) return true;
  }
  stack.delete(cell);
  return false;
}

// Get all cells in a circular chain starting from `cell`
export function getCycleMembers(cell, deps) {
  const members = new Set();
  function dfs(c, path) {
    if (path.includes(c)) {
      const cycleStart = path.indexOf(c);
      path.slice(cycleStart).forEach(x => members.add(x));
      return;
    }
    for (const dep of (deps.get(c) || [])) {
      dfs(dep, [...path, c]);
    }
  }
  dfs(cell, []);
  return members;
}

// Evaluate formula expression with cell values
export function evaluateFormula(formula, getCellValue) {
  if (!formula.startsWith('=')) return formula;

  let expr = formula.slice(1).trim();

  if (expr === '') throw new Error('#ERROR');

  // Replace all cell references with their numeric values
  expr = expr.replace(/[A-J](?:[1-9]|10)/g, (ref) => {
    const val = getCellValue(ref);
    if (val === null || val === undefined || val === '') return '0';
    if (typeof val === 'string' && isNaN(Number(val))) {
      throw new Error(`#VALUE: ${ref} is not a number`);
    }
    return Number(val);
  });

  // Validate expression — allow arithmetic, comparisons (==, !=, <=, >=, <, >), ternary-style, and logical (&&, ||)
  // Only digits, spaces, operators, parentheses, dots, comparison operators
  if (!/^[\d\s\+\-\*\/\(\)\.\=\!\<\>\&\|]+$/.test(expr)) {
    throw new Error('#INVALID');
  }

  // Disallow raw single = (assignment) — must be ==
  // e.g. "=5" alone after stripping is just "5", that's fine
  // But "=A2=B2" becomes "5=5" which is invalid JS — catch it
  if (/(?<![=!<>])=(?!=)/.test(expr)) {
    throw new Error('#ERROR');
  }

  // eslint-disable-next-line no-new-func
  const result = Function('"use strict"; return (' + expr + ')')();

  if (result === null || result === undefined) throw new Error('#ERROR');

  // Comparison results return TRUE/FALSE
  if (typeof result === 'boolean') return result ? 'TRUE' : 'FALSE';

  if (!isFinite(result)) throw new Error('#DIV/0!');
  return result;
}

// Full recalculation engine
export function recalcAll(rawValues) {
  // ── Step 1: Build dependency map ──
  // deps[cell] = Set of cells that `cell` directly references
  const deps = new Map();
  for (const [cell, val] of Object.entries(rawValues)) {
    if (typeof val === 'string' && val.startsWith('=')) {
      deps.set(cell, new Set(extractRefs(val.slice(1))));
    } else {
      deps.set(cell, new Set());
    }
  }

  // ── Step 2: Detect cycle members using DFS with 3-color marking ──
  // WHITE = unvisited, GRAY = in current path, BLACK = done
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = {};
  const cycleNodes = new Set();

  for (const cell of deps.keys()) color[cell] = WHITE;

  function dfs(node) {
    color[node] = GRAY;
    for (const dep of (deps.get(node) || [])) {
      if (!(dep in color)) color[dep] = WHITE; // ref to cell not in rawValues
      if (color[dep] === GRAY) {
        // Found a back edge → both are in a cycle
        cycleNodes.add(dep);
        cycleNodes.add(node);
      } else if (color[dep] === WHITE) {
        dfs(dep);
        // If dep ended up in a cycle, current node is too
        if (cycleNodes.has(dep)) cycleNodes.add(node);
      }
    }
    color[node] = BLACK;
  }

  for (const cell of deps.keys()) {
    if (color[cell] === WHITE) dfs(cell);
  }

  // ── Step 3: Also mark cells that DEPEND ON a cycle node as #CIRCULAR ──
  // Build reverse map: who depends on me?
  const dependents = new Map(); // cell -> Set of cells that reference it
  for (const [cell, refs] of deps.entries()) {
    for (const ref of refs) {
      if (!dependents.has(ref)) dependents.set(ref, new Set());
      dependents.get(ref).add(cell);
    }
  }
  // BFS from known cycle nodes to propagate #CIRCULAR downstream
  const allCircular = new Set(cycleNodes);
  const queue = [...cycleNodes];
  while (queue.length > 0) {
    const node = queue.shift();
    for (const dependent of (dependents.get(node) || [])) {
      if (!allCircular.has(dependent)) {
        allCircular.add(dependent);
        queue.push(dependent);
      }
    }
  }

  // ── Step 4: Compute values in topological order ──
  const computed = {};

  // Seed plain values first
  for (const [cell, val] of Object.entries(rawValues)) {
    const str = String(val);
    if (!str.startsWith('=')) {
      computed[cell] = str === '' ? '' : isNaN(Number(str)) ? str : Number(str);
    }
  }

  // Mark all circular cells immediately
  for (const cell of allCircular) {
    computed[cell] = '#CIRCULAR';
  }

  // Topo sort and evaluate non-circular formula cells
  const allCells = Object.keys(rawValues);
  const sorted = topoSort(allCells, deps);

  for (const cell of sorted) {
    if (allCircular.has(cell)) continue; // already set above

    const raw = rawValues[cell];
    if (typeof raw === 'string' && raw.startsWith('=')) {
      try {
        const val = evaluateFormula(raw, (ref) => {
          if (allCircular.has(ref)) throw new Error('#CIRCULAR');
          return computed[ref] !== undefined ? computed[ref] : '';
        });
        computed[cell] = val;
      } catch (e) {
        computed[cell] = e.message.startsWith('#') ? e.message : '#ERROR';
      }
    }
  }

  return computed;
}
