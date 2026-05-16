import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';

import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';
import './App.css';

// top navigation bar with logo and page links
function Navbar() {
  return (
    <nav className="glass-navbar">
      <div className="nav-logo">🌾 Kisan Space Tech</div>
      <ul className="nav-links">
        <li><a href="#home">Home</a></li>
        <li><a href="#map-section">Map</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </nav>
  );
}

// search bar on the map so users can find any location
function SearchField() {
  const map = useMap();
  
  useEffect(() => {
    const provider = new OpenStreetMapProvider();
    const searchControl = new GeoSearchControl({
      provider: provider,
      style: 'bar',
      showMarker: false,
      showPopup: false,
      autoClose: true,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: false,
      searchLabel: '🔍 Gaon, Shehar ya Pin Code dhoondhein...' 
    });

    map.addControl(searchControl);
    return () => map.removeControl(searchControl);
  }, [map]);

  return null;
}

// polygon draw tools for marking field boundaries
function DrawTools({ setFarmCoords }) {
  const map = useMap();
  
  useEffect(() => {
    map.pm.addControls({
      position: 'topleft',
      drawMarker: false, drawCircleMarker: false, drawPolyline: false,
      drawRectangle: false, drawCircle: false, drawText: false,
      editControls: true, drawPolygon: true,
    });

    map.on('pm:create', (e) => {
      const geojson = e.layer.toGeoJSON();
      setFarmCoords(geojson.geometry);
    });
  }, [map, setFarmCoords]);

  return null;
}

// main app
function App() {
  // Tajpura, Behat Road, Saharanpur — my village coordinates
  const mapCenter = [29.967, 77.555];
  const [farmCoords, setFarmCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  const checkHealth = async () => {
    if (!farmCoords) {
      alert("⚠️ Pehle map par apne khet ki boundary draw karein!");
      return;
    }

    setLoading(true);
    setReport(null);

    try {
      // render backend URL
      const apiUrl = "https://geo-spatial-agritech.onrender.com/check_fasal";
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ geometry: farmCoords })
      });

      const data = await response.json();
      
      if (data.status === "success") {
        setReport(data);
      } else {
        alert("❌ Error: " + data.message);
      }
    } catch (error) {
      alert("⚠️ Backend se connection nahi ho paya. Thodi der baad try karo.");
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <>
      <Navbar />

      {/* hero section — satellite video plays as the landing screen */}
      <section className="hero-section" id="home">
        <video autoPlay loop muted playsInline className="hero-video">
          <source src="/satellite-bg.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay">
          <h1 className="hero-title">Kisan Space Tech</h1>
          <p className="hero-subtitle">Satellite-based AI for Precision Agriculture</p>
          <a href="#map-section" className="hero-btn">Explore Map ↓</a>
        </div>
      </section>

      {/* map section — the actual tool where user draws boundary and checks crop health */}
      <section className="map-section" id="map-section">
        <div className="glass-card">
          <h2 className="section-title">🛰️ Live Crop Health Scanner</h2>
          <p className="section-desc">
            Map par apne khet ki boundary banao aur satellite se real-time health check karo.
          </p>

          <div className="map-wrapper">
            <MapContainer center={mapCenter} zoom={15} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                attribution="Google Satellite"
              />
              <SearchField />
              <DrawTools setFarmCoords={setFarmCoords} />
            </MapContainer>
          </div>

          <button 
            onClick={checkHealth}
            disabled={loading}
            className="futuristic-btn"
          >
            {loading ? "⏳ Satellite data nikal raha hai..." : "Fasal Check Karein 🚀"}
          </button>

          {/* NDVI report card — shows up after satellite analysis is done */}
          {report && (
            <div className="report-card">
              <h2>📊 Live Satellite Report</h2>
              <p className="score-text">NDVI Score: <span>{report.score}</span></p>
              <hr />
              <h3>🤖 AI Health Analysis:</h3>
              <p className="advice-text">{report.advice}</p>
            </div>
          )}
        </div>
      </section>

      {/* footer — about, blog, contact in a clean bottom section like big websites */}
      <footer className="site-footer">
        <div className="footer-grid">

          {/* about column */}
          <div className="footer-col" id="about">
            <h3>About</h3>
            <p>Kisan Space Tech uses real-time Sentinel-2 satellite imagery and NDVI analysis to check crop health from space. Built for the farmers of Tajpura, Saharanpur and beyond.</p>
            <p style={{marginTop: '8px', opacity: 0.7}}>NDVI (Normalized Difference Vegetation Index) infrared data se fasal ki sehat naapne ka tarika hai — jitna zyada hara, utni healthy fasal.</p>
          </div>

          {/* blog / how it works column */}
          <div className="footer-col" id="blog">
            <h3>How It Works</h3>
            <ul>
              <li>🛰️ Sentinel-2 satellite se latest image download hoti hai</li>
              <li>🧠 NDVI algorithm se crop health score nikalta hai</li>
              <li>📊 AI thresholds se report banti hai — Red, Orange, Yellow, Green</li>
              <li>🌾 Tajpura, UP ke local soil conditions ke liye calibrated hai</li>
            </ul>
          </div>

          {/* contact column */}
          <div className="footer-col" id="contact">
            <h3>Contact</h3>
            <p>Built by <strong>Ayaan Ali</strong></p>
            <p>📍 Tajpura, Behat Road, Saharanpur, UP</p>
            <p style={{marginTop: '10px'}}>
              <a href="https://linkedin.com/in/ayaanali9" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              {' • '}
              <a href="mailto:ayaan@zuradocs.tech">ayaan@zuradocs.tech</a>
            </p>
            <p style={{marginTop: '5px'}}>
              <a href="https://github.com/ayaanali9" target="_blank" rel="noopener noreferrer">GitHub</a>
            </p>
          </div>

        </div>

        <div className="footer-bottom">
          <p>© 2026 Kisan Space Tech — Satellite AI for Indian Agriculture</p>
        </div>
      </footer>
    </>
  );
}

export default App;