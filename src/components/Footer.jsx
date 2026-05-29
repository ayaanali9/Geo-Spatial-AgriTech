import React from 'react';
import { Link } from 'react-router-dom';

// minimal footer — just copyright and quick links
function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <p className="footer-copy">© 2026 Kisan Space Tech — Satellite AI for Indian Agriculture</p>
        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/blog">Blog</Link>
          <Link to="/contact">Contact</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
