// src/App.jsx
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/login';
import Dashboard from './components/dashboard'; 

function App() {

  const sheetLink = 'https://docs.google.com/spreadsheets/d/1UNG_BOOU6-bNWw5tcwmCCEmIey0hM6JHxzrmKo-px0E/edit?usp=sharing';
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard sheetLink={sheetLink} />} />
        <Route path="/admin" element={<Login />} />
        {/* Add more routes for other pages */}
      </Routes>
    </Router>
  );
}

export default App;
