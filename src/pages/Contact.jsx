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
        <div className="team-grid">
          <div className="content-card contact-card team-card">
            <h2>👨‍💻 Ayaan Ali</h2>
            <p className="contact-role">Lead Developer &amp; AI Researcher</p>

            <div className="contact-links">
              <a href="mailto:mohdayan1162@gmail.com" className="contact-link-item">
                <span className="contact-icon">📧</span>
                <div>
                  <strong>Email</strong>
                  <p>mohdayan1162@gmail.com</p>
                </div>
              </a>

              <a href="https://linkedin.com/in/ayaanali9" target="_blank" rel="noopener noreferrer" className="contact-link-item">
                <span className="contact-icon">🔗</span>
                <div>
                  <strong>LinkedIn</strong>
                  <p>linkedin.com/in/ayaanali9</p>
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

          <div className="content-card contact-card team-card">
            <h2>🎓 Mohd Firoj, PhD</h2>
            <p className="contact-role">Geotechnical &amp; Structural Engineer | IIT Roorkee</p>

            <div className="contact-links">
              <a href="mailto:mohdfiroj2493@gmail.com" className="contact-link-item">
                <span className="contact-icon">📧</span>
                <div>
                  <strong>Email</strong>
                  <p>mohdfiroj2493@gmail.com</p>
                </div>
              </a>

              <a href="https://linkedin.com/in/mohd-firoj-phd-2535a5114" target="_blank" rel="noopener noreferrer" className="contact-link-item">
                <span className="contact-icon">🔗</span>
                <div>
                  <strong>LinkedIn</strong>
                  <p>linkedin.com/in/mohd-firoj-phd-2535a5114</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Contact;
