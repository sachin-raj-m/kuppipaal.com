// Dashboard.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import "./Dashboard.css";

const Dashboard = ({ sheetLink }) => {
  const [data, setData] = useState([]);
  const [customTitles, setCustomTitles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchedData, setSearchedData] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const rowsPerPage = 69; // Display 70 rows per page

  useEffect(() => {
    if (showResults) {
      fetchData();
    }
  }, [currentPage, searchTerm, showResults]);

  const fetchData = async () => {
    try {
      const response = await axios.get(sheetLink, {
        responseType: "arraybuffer",
        transformResponse: [(data) => new Uint8Array(data)],
      });

      const arrayBuffer = response.data;
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      // Set custom titles
      setCustomTitles(jsonData[1]);

      // Exclude the title row from data
      setData(jsonData.slice(2));

      // If the search term is show, display all original data
      if (searchTerm === "showall") {
        setSearchedData(jsonData.slice(2));
        setShowResults(true);
      } else {
        // Filter data based on search term
        const filteredRows = jsonData
          .slice(2)
          .filter((row) => rowContainsSearchTerm(row, searchTerm));

        // Create a new array containing the filtered row and the next two consecutive rows
        const resultRows = [];
        for (let i = 0; i < filteredRows.length; i++) {
          resultRows.push(filteredRows[i]);

          const rowIndex = jsonData.indexOf(filteredRows[i]) + 1;
          if (rowIndex < jsonData.length) {
            resultRows.push(jsonData[rowIndex]);
          }

          if (rowIndex + 1 < jsonData.length) {
            resultRows.push(jsonData[rowIndex + 1]);
          }
        }

        setSearchedData(resultRows);
        setShowResults(true);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const rowContainsSearchTerm = (row, searchTerm) => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return row.some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(lowerSearchTerm)
    );
  };

  const handleSearch = () => {
    if (searchTerm.trim() === "") {
      // If the search term is empty, show an alert message
      alert("Please enter a value to search");
    } else {
      setShowResults(true);
      setCurrentPage(1);
    }
  };

  const handleReset = () => {
    setShowResults(false);
    setSearchTerm("");
  };

  const start = (currentPage - 1) * rowsPerPage;
  const end = Math.min(start + rowsPerPage, searchedData.length);
  const displayedRows = searchedData.slice(start, end);
  const totalPages = Math.ceil(searchedData.length / rowsPerPage);

  return (
    <div className="container">
      <header>
        <h1>Dashboard</h1>
      </header>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by consumer name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
        <button onClick={handleReset}>Reset</button>
      </div>
      {showResults && searchedData.length > 0 ? (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                {customTitles.map((title, columnIndex) => (
                  <th key={columnIndex}>{title}</th>
                ))}
              </tr>
            </thead>
            <tbody>
  {displayedRows.map((row, rowIndex) => (
    <React.Fragment key={rowIndex}>
      <tr className={rowIndex % 3 === 2 && rowIndex !== displayedRows.length - 1 ? 'border-row' : ''}>
        {row.map((value, columnIndex) => (
          <td key={columnIndex}>{value}</td>
        ))}
      </tr>
    </React.Fragment>
  ))}
</tbody>
          </table>
        </div>
      ) : showResults ? (
        <div className="no-results-message">No details found.</div>
      ) : null}
      {showResults && searchedData.length > rowsPerPage && (
        <div className="pagination">
          <button
            className="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>
          <span>{`Page ${currentPage} of ${totalPages}`}</span>
          <button
            className="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
      <div className="icons-container">
        <div className="icon">🐄</div>
      </div>
    </div>
  );
};

export default Dashboard;
