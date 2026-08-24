import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function About() {
  return (
    <>
      <Navbar />

      {/* page header */}
      <section className="page-hero">
        <h1 className="page-hero-title">About Kisan Space Tech</h1>
        <p className="page-hero-subtitle">Satellite intelligence for smarter farming</p>
      </section>

      <section className="page-content">
        <div className="content-card">
          <h2>🌾 What is Kisan Space Tech?</h2>
          <div className="dual-lang">
            <div className="lang-block">
              <span className="lang-tag">English</span>
              <p>
                Kisan Space Tech is an open-source precision agriculture platform that uses 
                real-time satellite imagery from the European Space Agency's Sentinel-2 mission 
                to monitor crop health across Indian farmlands. The system calculates NDVI 
                (Normalized Difference Vegetation Index) scores using near-infrared and red band 
                data, providing farmers with an accurate, science-backed health report for their fields.
              </p>
            </div>
            <div className="lang-block">
              <span className="lang-tag">हिंदी</span>
              <p>
                किसान स्पेस टेक एक ओपन-सोर्स कृषि प्लेटफ़ॉर्म है जो यूरोपीय अंतरिक्ष एजेंसी 
                के सेंटिनल-2 उपग्रह से वास्तविक समय की सैटेलाइट तस्वीरों का उपयोग करके भारतीय 
                खेतों में फसल की सेहत की निगरानी करता है। यह प्रणाली NDVI (नॉर्मलाइज़्ड डिफरेंस 
                वेजिटेशन इंडेक्स) स्कोर की गणना करती है, जिससे किसानों को उनके खेतों की 
                वैज्ञानिक और सटीक स्वास्थ्य रिपोर्ट मिलती है।
              </p>
            </div>
          </div>
        </div>

        <div className="content-card">
          <h2>🛰️ How Does It Work?</h2>
          <div className="dual-lang">
            <div className="lang-block">
              <span className="lang-tag">English</span>
              <p>
                The farmer draws a boundary of their field on the satellite map. Our backend 
                then fetches the most recent cloud-free Sentinel-2 image for that area, runs 
                the NDVI algorithm (which measures how much near-infrared light plants reflect 
                versus red light they absorb), and returns a health score between -1.0 and +1.0. 
                Higher scores mean greener, healthier vegetation. The AI then classifies the 
                result into categories — from barren land to excellent crop health — with 
                thresholds specifically calibrated for the soil and crop patterns of western 
                Uttar Pradesh.
              </p>
            </div>
            <div className="lang-block">
              <span className="lang-tag">हिंदी</span>
              <p>
                किसान सैटेलाइट मानचित्र पर अपने खेत की सीमा बनाता है। इसके बाद हमारा सर्वर 
                उस क्षेत्र की सबसे हालिया बादल-रहित सेंटिनल-2 तस्वीर लाता है, NDVI एल्गोरिदम 
                चलाता है (जो मापता है कि पौधे कितनी नज़दीकी-अवरक्त रोशनी परावर्तित करते हैं 
                बनाम कितनी लाल रोशनी सोखते हैं), और -1.0 से +1.0 के बीच एक स्वास्थ्य स्कोर 
                देता है। जितना ज़्यादा स्कोर, उतनी हरी और स्वस्थ फसल। फिर AI परिणाम को 
                श्रेणियों में बाँटता है — बंजर ज़मीन से लेकर उत्कृष्ट फसल स्वास्थ्य तक — 
                जिसकी सीमाएँ पश्चिमी उत्तर प्रदेश की मिट्टी और फसल के अनुसार तैयार की गई हैं।
              </p>
            </div>
          </div>
        </div>

        <div className="content-card">
          <h2>🔧 Tech Stack</h2>
          <div className="tech-grid">
            <div className="tech-item">
              <h4>Frontend</h4>
              <p>React + Vite, Leaflet Maps, Geoman Drawing Tools</p>
            </div>
            <div className="tech-item">
              <h4>Backend</h4>
              <p>Python Flask, Google Earth Engine API, Gunicorn</p>
            </div>
            <div className="tech-item">
              <h4>Satellite Data</h4>
              <p>ESA Sentinel-2 (10m resolution, multispectral)</p>
            </div>
            <div className="tech-item">
              <h4>Deployment</h4>
              <p>Vercel (Frontend) + Render (Backend)</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default About;
