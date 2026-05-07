import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';

import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';
import './App.css';

// Navbar Component
function Navbar() {
  return (
    <nav className="glass-navbar">
      <div className="nav-logo">🌾 Kisan Space Tech</div>
      <ul className="nav-links">
        <li><a href="#home">Home</a></li>
        <li><a href="#blog">Blog</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </nav>
  );
}

// 1. Search Box
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

// 2. Draw Tools
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

// 3. Main App Component
function App() {
  const mapCenter = [29.9695, 77.5510]; // Tajpura, Saharanpur
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
      const apiUrl = "https://geo-spatial-agritech.onrender.com/check_fasal";
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Bypass-Tunnel-Reminder": "true" 
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
      alert("⚠️ API se connection nahi hua. Check kar Colab chal raha hai ya nahi.");
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Navbar */}
      <Navbar />

      {/* Background Video (Fixed) */}
      <video autoPlay loop muted playsInline className="background-video">
        <source src="/satellite-bg.mp4" type="video/mp4" />
      </video>

      {/* Main Content with top margin to showcase video */}
      <div className="main-container" id="home">
        <div className="spacer">
           {/* Space to show the video */}
           <h1>Scroll Down to Explore <br/>⬇️</h1>
        </div>

        <div className="glass-card">
          <h1 className="main-title">🌾 Kisan Space Tech</h1>
          <p className="subtitle">
            Map par apne khet ki boundary banayein aur live health check karein.
          </p>

          <div className="map-wrapper">
            <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
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

          {report && (
            <div className="report-card">
              <h2>📊 Asli Data Report</h2>
              <p className="score-text">NDVI Score: <span>{report.score}</span></p>
              <hr />
              <h3>🤖 AI Health Analysis:</h3>
              <p className="advice-text">{report.advice}</p>
            </div>
          )}
        </div>

        {/* Blog Section */}
        <div className="glass-card blog-section" id="blog">
          <h2>About Kisan Space Tech & NDVI</h2>
          <p><strong>English:</strong> NDVI measures crop health using satellite infrared data.</p>
          <p><strong>Hindi:</strong> NDVI satellite data ka use karke fasal ki kheti aur swasthya ka pata lagata hai.</p>
        </div>

        {/* Footer / Contact */}
        <footer className="glass-footer" id="contact">
          <h3>Contact Details</h3>
          <p>LinkedIn: <a href="https://linkedin.com/in/ayaanali9" target="_blank" rel="noopener noreferrer">ayaanali9</a></p>
          <p>Email: <a href="mailto:ayaan@zuradocs.tech">ayaan@zuradocs.tech</a></p>
        </footer>

      </div>
    </>
  );
}

export default App;