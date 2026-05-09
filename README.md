# GridForge — Spreadsheet Engine

A React-based spreadsheet with formula evaluation, dependency tracking, circular reference detection, and undo/redo.

\---

## &#x20;Setup \& Run

### Prerequisites

* Node.js 16+ installed ([download here](https://nodejs.org))
* npm (comes with Node.js)

### Steps

```bash
# 1. Navigate to the project folder
cd spreadsheet-engine

# 2. Install dependencies
npm install

# 3. Start the development server
npm start
```

The app opens automatically at **http://localhost:3000**

\---

## 🏗️ Build for Production

```bash
npm run build
```

Outputs to the `build/` folder. Deploy to Netlify or Vercel by pointing to that folder.

\---

## ✨ Features

|Feature|Details|
|-|-|
|10×10 grid|Columns A–J, Rows 1–10|
|Formula evaluation|`=A1+B2`, `=A1\*2`, `=(C1+D1)/3`|
|Dependency propagation|Changes cascade automatically|
|Circular detection|Shows `#CIRCULAR`|
|Error handling|Shows `#ERROR`, `#DIV/0!`, `#VALUE`|
|Undo/Redo|Ctrl+Z / Ctrl+Y or toolbar buttons|
|Keyboard navigation|Arrow keys, Tab, Enter, Escape|

\---

## 📋 Usage

* **Click** a cell to select it
* **Type** to enter a value
* **Type `=`** to start a formula (e.g. `=A1+B2`)
* **Enter** to confirm, **Esc** to cancel
* **Arrow keys** or **Tab** to navigate
* **Double-click** or **F2** to edit a selected cell
* **Delete/Backspace** to clear a selected cell

\---

## 🗂️ Project Structure

```
src/
  utils/
    formulaEngine.js     # Parser, evaluator, dependency graph, topo sort
  hooks/
    useSpreadsheet.js    # State management + undo/redo
  components/
    Cell.js              # Individual cell with edit/display modes
    Grid.js              # 10×10 table layout
    FormulaBar.js        # Top formula input bar
    Toolbar.js           # Undo/Redo/Clear buttons
    StatusBar.js         # Error summary at bottom
  App.js                 # Root component
  App.css                # Dark industrial UI styles
```

