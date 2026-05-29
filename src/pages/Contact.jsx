import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function Contact() {
  return (
    <>
      <Navbar />

      <section className="page-hero">
        <h1 className="page-hero-title">Contact</h1>
        <p className="page-hero-subtitle">Get in touch for collaboration or queries</p>
      </section>

      <section className="page-content">
        <div className="content-card contact-card">
          <h2>👨‍💻 Ayaan Ali</h2>
          <p className="contact-role">Developer — Kisan Space Tech</p>

          <div className="contact-links">
            <a href="https://linkedin.com/in/ayaanali9" target="_blank" rel="noopener noreferrer" className="contact-link-item">
              <span className="contact-icon">🔗</span>
              <div>
                <strong>LinkedIn</strong>
                <p>linkedin.com/in/ayaanali9</p>
              </div>
            </a>

            <a href="mailto:ayaan@zuradocs.tech" className="contact-link-item">
              <span className="contact-icon">📧</span>
              <div>
                <strong>Email</strong>
                <p>ayaan@zuradocs.tech</p>
              </div>
            </a>

            <a href="https://github.com/ayaanali9" target="_blank" rel="noopener noreferrer" className="contact-link-item">
              <span className="contact-icon">💻</span>
              <div>
                <strong>GitHub</strong>
                <p>github.com/ayaanali9</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Contact;
