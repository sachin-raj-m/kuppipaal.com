import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./admindashboard.module.css";

const AdminDashboard = ({ sheetId, adminSheet, apiKey, onLogout }) => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []); // Fetch data on component mount

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${adminSheet}?key=${apiKey}`
      );

      const sheetData = response.data.values;

      if (sheetData && sheetData.length > 0) {
        const headers = sheetData[0];

        const formattedData = sheetData.slice(1).map((row) => {
          const rowData = {};
          row.forEach((value, index) => {
            rowData[headers[index]] = value;
          });
          return rowData;
        });

        setData(formattedData);
        setFilteredData(formattedData); // Set filteredData initially to full data
      }

      setLoading(false); // Set loading to false after data is fetched
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false); // Set loading to false on error
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate("/admin");
  };

  const handleSearch = () => {
    const searchTermLowerCase = searchTerm.toLowerCase();
    const filtered = data.filter((row) =>
      Object.values(row).some((value) =>
        value.toString().toLowerCase().includes(searchTermLowerCase)
      )
    );
    setFilteredData(filtered);
  };

  const handleReset = () => {
    setSearchTerm("");
    setFilteredData(data); // Reset filteredData to full data
  };

  const handleGenerateInvoice = (rowData) => {
    // Get current date
    const currentDate = new Date();

    // Load your bill model image
    const img = new Image();
    img.onload = function () {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Set canvas dimensions to match the image dimensions
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw the bill model image on the canvas
        ctx.drawImage(img, 0, 0);

        // Overlay text onto the bill model image
        ctx.font = "25px Helvetica";
        ctx.fillStyle = "black";

        // Customize positions for each entry
        ctx.fillText(
          `${currentDate.toLocaleString("default", {
            month: "long",
          })} ${currentDate.getFullYear()}`,
          1060,
          405
        ); // Month and year
        ctx.fillText(
          `Date: ${currentDate.toLocaleDateString("en-GB")}`,
          1140,
          50
        ); // Date
        ctx.fillText(`${rowData.Invoice}`, 1100, 458); // Invoice number

        // Draw other invoice details
        // Customize positions for each entry based on column name
      Object.entries(rowData).forEach(([key, value]) => {
        switch (key) {
          case "Consumer Name":
            ctx.font = "bold 37px Arial"
            ctx.fillText(`${value}`, 125, 715);
            break;
          case "Milk Quantity (litres)":
            ctx.font = "25px Helvetica";
            ctx.fillText(`${value} ltr - `, 670, 820);
            break;
          case "Days":
            ctx.fillText(`${value}`, 750, 820);
            break;
          case "ExtraMilk (Days)":
            ctx.fillText(`${value}`, 700, 875);
            break;
          case "Curd (Days)":
            ctx.fillText(`${value}`, 700, 940);
            break;
          case "Individual Bill - Milk":
            ctx.fillText(`${value}`, 930, 820);
            break;
          case "Individual Bill -  Extra Milk":
            ctx.fillText(`${value}`, 930, 875);
            break;  
          case "Individual Bill - Curd":
            ctx.fillText(`${value}`, 930, 940);
            break;
          case "Total Bill":
            ctx.font = "bold 32px Helvetica";
            ctx.fillText(`${value}`, 1170, 875);
            break;
          case "Advance":
            ctx.fillText(`${value}`, 930, 1030);
            break;
          case "Final Bill":
            ctx.fillText(`${value}`, 930, 1100);
            break;
          default:
            break;
        }
        });

        // Convert canvas to PNG image data URL
        const pngDataUrl = canvas.toDataURL("image/png");

        // Save or download the PNG image
        savePngInvoice(pngDataUrl, rowData.ConsumerName);
      } catch (error) {
        console.error("Error generating invoice:", error);
      }
    };
    img.onerror = function () {
      console.error("Error loading image:", img.src);
    };
    img.src = "src/components/Admin_Dashboard/bill_format.png"; // Replace with the path to your bill model image
  };

  const savePngInvoice = (dataUrl, consumerName) => {
    // Create a link element
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `invoice_${consumerName}.png`;

    // Append the link to the body
    document.body.appendChild(link);

    // Trigger a click event on the link to initiate download
    link.click();

    // Remove the link from the body
    document.body.removeChild(link);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Admin Dashboard</h2>
        <div className={styles.userInfo}>
          <p>Welcome, Admin!</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
        <button onClick={handleReset}>Reset</button>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              {data.length > 0 &&
                Object.keys(data[0]).map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {Object.values(row).map((value, index) => (
                  <td key={index}>{value}</td>
                ))}
                <td>
                  <button onClick={() => handleGenerateInvoice(row)}>
                    Generate Invoice
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminDashboard;
