import React from 'react';
import { Link } from 'react-router-dom';

// shared navbar used on every page
function Navbar() {
  return (
    <nav className="glass-navbar">
      <Link to="/" className="nav-logo">🌾 Kisan Space Tech</Link>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><a href="/#map-section">Map</a></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/blog">Blog</Link></li>
        <li><Link to="/contact">Contact</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
