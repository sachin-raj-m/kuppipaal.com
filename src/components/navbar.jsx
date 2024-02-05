// Navbar.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Navbar.module.css';

const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link to="/">
          <img src="/path/to/your/logo.png" alt="Logo" className={styles.logoImg} />
        </Link>
      </div>
      <div className={styles.links}>
        <Link to="/contact" className={styles.link}>Contact Us</Link>
        <Link to="/admin" className={styles.link}>Login</Link>
      </div>
    </nav>
  );
};

export default Navbar;
