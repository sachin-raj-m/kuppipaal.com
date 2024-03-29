import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import JSZip from "jszip";
import styles from "./admindashboard.module.css";

const AdminDashboard = ({ sheetId, adminSheet, apiKey, onLogout }) => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [invoiceUrls, setInvoiceUrls] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

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
        setFilteredData(formattedData);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
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
    setFilteredData(data);
  };

  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (error) => reject(error);
      img.src = src;
    });
  };

  const handleGenerateInvoice = async (rowData) => {
    const currentDate = new Date();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Load bill format image
    const billImg = await loadImage("src/components/Admin_Dashboard/bill_format.png");

    // Set canvas dimensions to match the bill image dimensions
    canvas.width = billImg.width;
    canvas.height = billImg.height;

    try {
      // Draw the bill format image on the canvas first
      ctx.drawImage(billImg, 0, 0, canvas.width, canvas.height);

      // Overlay text onto the bill format image
      ctx.font = "25px Helvetica";
      ctx.fillStyle = "black";
      ctx.fillText(
        `${currentDate.toLocaleString("default", {
          month: "long",
        })} ${currentDate.getFullYear()}`,
        1060,
        405
      );
      ctx.fillText(
        `Date: ${currentDate.toLocaleDateString("en-GB")}`,
        1200,
        50
      );
      ctx.fillText(`${rowData.Invoice}`, 1100, 458);

      Object.entries(rowData).forEach(([key, value]) => {
        switch (key) {
          case "Consumer Name":
            ctx.font = "bold 37px Arial";
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
      return pngDataUrl;
    } catch (error) {
      console.error("Error generating invoice:", error);
      throw error;
    }
  };

const handleDownloadInvoice = async (rowData) => {
    try {
      const url = await handleGenerateInvoice(rowData);
      const fileName = `${rowData.Invoice}_${rowData["Consumer Name"].replace(/\s/g, "_")}.png`;
      downloadInvoice(url, fileName);
    } catch (error) {
      console.error("Error downloading invoice:", error);
    }
};

const downloadInvoice = (url, fileName) => {
    // Create an anchor element to trigger the download
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;

    // Simulate click to trigger the download
    link.click();
};


  const handleDownloadAllInvoices = async () => {
    const zip = new JSZip();
    const errors = [];
  
    try {
      await Promise.all(
        filteredData.map(async (rowData) => {
          try {
            // Check if consumer name and invoice number exist
            const consumerName = rowData["Consumer Name"];
            const invoiceNumber = rowData["Invoice"];
  
            if (!consumerName || !invoiceNumber) {
              // Skip if consumer name or invoice number is missing
              return;
            }
  
            const url = await handleGenerateInvoice(rowData);
            const response = await fetch(url);
            const blob = await response.blob();
  
            // Generate file name with invoice number and consumer name
            const fileName =
              `${invoiceNumber}_` +
              consumerName.replace(/\s/g, "_") +
              ".png";
  
            // Add the invoice image to the zip file
            zip.file(fileName, blob);
          } catch (error) {
            console.error("Error generating invoice:", error);
          }
        })
      );
  
      if (errors.length > 0) {
        console.error(
          "Errors occurred while generating invoices:",
          errors
        );
        console.log(
          "Some invoices could not be generated. Please check the console for details."
        );
      }
  
      // Generate the zip file
      const content = await zip.generateAsync({ type: "blob" });
  
      // Create an anchor element to trigger the download
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = "invoices.zip";
  
      // Simulate click to trigger the download
      link.click();
    } catch (error) {
      console.error("Error downloading invoices:", error);
      console.log(
        "An error occurred while downloading invoices. Please try again later."
      );
    }
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
        <button onClick={handleDownloadAllInvoices}>
          Download All Invoices
        </button>
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
                  <button onClick={() => handleDownloadInvoice(row)}>
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
