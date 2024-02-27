import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./dashboard.module.css";

const Dashboard = ({ sheetId, apiKey, dashboardSheet }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [customTitles, setCustomTitles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchedData, setSearchedData] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const rowsPerPage = 69;

  useEffect(() => {
    if (showResults) {
      setLoading(true);
      fetchData().finally(() => setLoading(false));
    }
  }, [currentPage, searchTerm, showResults]);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${dashboardSheet}?key=${apiKey}`
      );

      const sheetData = response.data.values;

      if (!sheetData || sheetData.length === 0) {
        console.log("No data found in the sheet");
        return;
      }

      setCustomTitles(sheetData[0]);

      if (searchTerm === "showall") {
        setSearchedData(sheetData.slice(1).map((row, index) => [index + 1, ...row]));
        setShowResults(true);
      } else {
        const filteredRows = sheetData
          .slice(1)
          .filter((row) => rowContainsSearchTerm(row, searchTerm));

        const resultRows = [];
        for (let i = 0; i < filteredRows.length; i++) {
          const rowIndex = sheetData.indexOf(filteredRows[i]) + 1;
          resultRows.push([rowIndex, ...filteredRows[i]]);

          if (rowIndex < sheetData.length) {
            resultRows.push([rowIndex + 1, ...sheetData[rowIndex]]);
          }

          if (rowIndex + 1 < sheetData.length) {
            resultRows.push([rowIndex + 2, ...sheetData[rowIndex + 1]]);
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
    <div className={styles.container}>
      <header>
        <h1>Milk Supply Dashboard</h1>
      </header>
      <div className={styles["search-bar"]}>
        <input
          type="text"
          placeholder="Search by consumer name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
        <button onClick={handleReset} className={styles.button} disabled={loading}>
          Reset
        </button>
      </div>
      {showResults && searchedData.length > 0 ? (
        <div className={styles["table-container"]}>
          <table>
            <thead>
              <tr>
                <th className={styles.header}>Sl. No</th>
                {customTitles.map((title, columnIndex) => (
                  <th key={columnIndex} className={styles.header}>
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayedRows.map((row, rowIndex) => (
                <React.Fragment key={rowIndex}>
                  <tr
                    className={
                      rowIndex % 3 === 2 &&
                      rowIndex !== displayedRows.length - 1
                        ? styles["border-row"]
                        : ""
                    }
                  >
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
        <div className={styles["no-results-message"]}>No details found.</div>
      ) : null}
      {showResults && searchedData.length > rowsPerPage && (
        <div className={styles.pagination}>
          <button
            className={styles.button}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>
          <span>{`Page ${currentPage} of ${totalPages}`}</span>
          <button
            className={styles.button}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
      <div className={styles["icons-container"]}>
        <div className={styles.icon}>🐄</div>
      </div>
    </div>
  );
};

export default Dashboard;
