import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./components/Dashboard/dashboard";
import Login from "./components/Login/login";
import AdminDashboard from "./components/Admin_Dashboard/admindashboard";
import Navbar from "./components/navbar";

const SHEETID = import.meta.env.VITE_REACT_APP_SHEET_ID;
const APIKEY = import.meta.env.VITE_REACT_APP_GOOGLE_SHEET_API;
const DASHBOARDSHEET = import.meta.env.VITE_REACT_APP_GOOGLE_SHEET_DASHBOARD;
const ADMINSHEET = import.meta.env.VITE_REACT_APP_GOOGLE_SHEET_ADMIN;


const isAuthenticated = () => {
  return localStorage.getItem("userToken") !== null;
};

// ProtectedRoute component to handle authentication
const ProtectedRoute = ({ element, path }) => {
  return isAuthenticated() ? (
    element
  ) : (
    <Navigate to="/admin"/>
  );
};

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem("userToken", "yourAuthToken");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("userToken");
  };

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={<Dashboard sheetId={SHEETID} apiKey={APIKEY} dashboardSheet={DASHBOARDSHEET} />}
        />
        <Route path="/admin" element={<Login onLogin={handleLogin} />} />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute
              element={
                <AdminDashboard
                  sheetId={SHEETID}
                  apiKey={APIKEY}
                  adminSheet={ADMINSHEET}
                  onLogout={handleLogout}
                />
              }
            />
          }
        />
        {/* Add more routes for other pages */}
        {/* If none of the above routes match, redirect to the dashboard */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
