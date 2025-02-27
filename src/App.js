import React, { useState } from "react";


const Spreadsheet = () => {
  const [formula, setFormula] = useState("");
  const [cells, setCells] = useState({});
  const [selectedCell, setSelectedCell] = useState("A1");
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [columns, setColumns] = useState(5);
  const [rows, setRows] = useState(["A", "B", "C", "D", "E"]);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");

  const handleFormulaChange = (e) => setFormula(e.target.value);

  const applyFormula = () => {
    if (formula.startsWith("=")) {
      try {
        let result = eval(formula.slice(1));
        saveHistory();
        setCells((prev) => ({ ...prev, [selectedCell]: result }));
      } catch (error) {
        alert("Invalid formula");
      }
    }
  };

  const handleInputChange = (cell, value) => {
    saveHistory();
    setCells((prev) => ({ ...prev, [cell]: value }));
  };

  const applyFunction = (func) => {
    saveHistory();
    let value = cells[selectedCell] || "";
    let updatedValue = value;
    switch (func) {
      case "TRIM":
        updatedValue = value.trim();
        break;
      case "UPPER":
        updatedValue = value.toUpperCase();
        break;
      case "LOWER":
        updatedValue = value.toLowerCase();
        break;
      default:
        return;
    }
    setCells((prev) => ({ ...prev, [selectedCell]: updatedValue }));
  };

  const removeDuplicates = () => {
    saveHistory();
    const uniqueValues = {};
    Object.entries(cells).forEach(([key, value]) => {
      if (!Object.values(uniqueValues).includes(value)) {
        uniqueValues[key] = value;
      }
    });
    setCells(uniqueValues);
  };

  const findAndReplace = () => {
    saveHistory();
    const updatedCells = {};
    Object.entries(cells).forEach(([key, value]) => {
      updatedCells[key] = value.replace(findText, replaceText);
    });
    setCells(updatedCells);
  };

  const saveHistory = () => {
    setHistory([...history, cells]);
    setRedoStack([]);
  };

  const undo = () => {
    if (history.length > 0) {
      setRedoStack([cells, ...redoStack]);
      setCells(history[history.length - 1]);
      setHistory(history.slice(0, -1));
    }
  };

  const redo = () => {
    if (redoStack.length > 0) {
      setHistory([...history, cells]);
      setCells(redoStack[0]);
      setRedoStack(redoStack.slice(1));
    }
  };

  const addColumn = () => {
    setColumns(columns + 1);
  };

  const addRow = () => {
    setRows([...rows, String.fromCharCode(rows[rows.length - 1].charCodeAt(0) + 1)]);
  };

  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += ["", ...Array(columns).keys()].join(",") + "\n";
    rows.forEach((row) => {
      let rowData = [row];
      for (let col = 1; col <= columns; col++) {
        let cellId = `${row}${col}`;
        rowData.push(cells[cellId] || "");
      }
      csvContent += rowData.join(",") + "\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "spreadsheet.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div>
      <div>
        <span>{selectedCell}</span>
        <input type="text" value={formula} onChange={handleFormulaChange} placeholder="Enter formula" />
        <button onClick={applyFormula}>Apply</button>
      </div>
      <div>
        <input type="text" placeholder="Find" value={findText} onChange={(e) => setFindText(e.target.value)} />
        <input type="text" placeholder="Replace" value={replaceText} onChange={(e) => setReplaceText(e.target.value)} />
        <button onClick={findAndReplace}>Find & Replace</button>
      </div>
      <div>
        <button onClick={() => applyFunction("TRIM")}>Trim</button>
        <button onClick={() => applyFunction("UPPER")}>Upper</button>
        <button onClick={() => applyFunction("LOWER")}>Lower</button>
        <button onClick={removeDuplicates}>Remove Duplicates</button>
        <button onClick={undo}>Undo</button>
        <button onClick={redo}>Redo</button>
        <button onClick={addColumn}>Add Column</button>
        <button onClick={addRow}>Add Row</button>
        <button onClick={exportToCSV}>Export to CSV</button>
      </div>
      <div>
        <input type="file" />
      </div>
      <table border="1">
        <thead>
          <tr>
            <th></th>
            {[...Array(columns)].map((_, i) => (
              <th key={i}>{i + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row}>
              <th>{row}</th>
              {[...Array(columns)].map((_, col) => {
                const cellId = `${row}${col + 1}`;
                return (
                  <td
                    key={cellId}
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleInputChange(cellId, e.target.innerText)}
                    onClick={() => setSelectedCell(cellId)}
                    style={{ width: 100, height: 30, textAlign: "center", cursor: "pointer" }}
                  >
                    {cells[cellId] || ""}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Spreadsheet;