import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './login.module.css';

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loginUsername = import.meta.env.VITE_REACT_APP_USERNAME;
  const loginPassword = import.meta.env.VITE_REACT_APP_PASSWORD;

  const handleLogin = () => {
    // Check credentials
    if (username === loginUsername && password === loginPassword) {
      onLogin(username);
      navigate('/admin-dashboard');
      setError('');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <h1>Login Page</h1>
      <div>
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div>
        <button className={styles.loginButton} onClick={handleLogin}>
          Login
        </button>
      </div>
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
};

export default LoginPage;
