import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './admindashboard.module.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';


const AdminDashboard = ({ sheetId, adminSheet, apiKey, onLogout }) => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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

        const formattedData = sheetData.slice(1).map(row => {
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
      console.error('Error fetching data:', error);
      setLoading(false); // Set loading to false on error
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/admin');
  };

  const handleSearch = () => {
    const searchTermLowerCase = searchTerm.toLowerCase();
    const filtered = data.filter(row =>
      Object.values(row).some(value =>
        value.toString().toLowerCase().includes(searchTermLowerCase)
      )
    );
    setFilteredData(filtered);
  };

  const handleReset = () => {
    setSearchTerm('');
    setFilteredData(data); // Reset filteredData to full data
  };

  const handleGenerateInvoice = (rowData) => {
    // Create a new instance of jsPDF
    const pdf = new jsPDF();

    // Draw a border around the entire page
    pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10);

    // Set text alignment to center for headers
    pdf.setFont('helvetica', 'bold');
    pdf.text('Monthly Invoice', pdf.internal.pageSize.width / 2, 15, { align: 'center' });
    pdf.text('Kuppipaal.com Thiruvilwamala', pdf.internal.pageSize.width / 2, 30, { align: 'center' });

    // Add current date to the header
    const currentDate = new Date().toLocaleDateString('en-GB'); // Using 'en-GB' for dd/mm/yyyy format
    pdf.text(`Month: ${currentDate.split('/')[1]}`, 20, 45);
    pdf.text(`Date: ${currentDate}`, pdf.internal.pageSize.width - 20, 45, { align: 'right' }); 
    pdf.text(`Invoice Number: ${rowData.Invoice}`, 20, 55);

    // Add a line for separation
    pdf.setLineWidth(0.3);
    pdf.line(5, 60, pdf.internal.pageSize.width - 5, 60);

    // Set up the invoice format
    const lineHeight = 10;
    let currentY = 75;

    pdf.setFont('helvetica', 'normal');
    Object.entries(rowData).forEach(([key, value]) => {
        // Exclude the "Invoice" column from PDF
        if (key !== 'Invoice') {
            // Handle special cases for alignment
            if (key === 'Milk Quantity' || key === 'Days' || key === 'Extra Milk' || key === 'Curd') {
                pdf.text(`${key}: ${value}`, 20, currentY);
                currentY += lineHeight;
            } else {
                // Print other key-value pairs with left alignment
                pdf.text(`${key}: ${value}`, 20, currentY);
                currentY += lineHeight;
            }
        }
    });

    // Save or download the PDF
    pdf.save(`invoice_${rowData.ConsumerName}.pdf`);
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
