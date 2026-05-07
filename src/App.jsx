import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';

// Nayi Search Library Imports
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';
import './App.css';

// 1. NAYA COMPONENT: Search Box (Map ke upar)
function SearchField() {
  const map = useMap();
  
  useEffect(() => {
    const provider = new OpenStreetMapProvider();
    const searchControl = new GeoSearchControl({
      provider: provider,
      style: 'bar', // Map ke upar ek professional search bar aayegi
      showMarker: false, // Marker nahi chahiye, sirf wahan zoom karna hai
      showPopup: false,
      autoClose: true, // Search ke baad box khud band ho jayega
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

// 2. Draw Tools Component (Tera purana boundary wala tool)
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
  const mapCenter = [29.957, 77.585]; // Default Location
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
      // Tera live Render API Link
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
    <div className="main-container">
      {/* Background Video */}
      <video autoPlay loop muted playsInline className="background-video">
        <source src="/satellite-bg.mp4" type="video/mp4" />
      </video>

      <div className="glass-card">
        <h1 className="main-title">🌾 Kisan Space Tech</h1>
        <p className="subtitle">
          Map par apne khet ki boundary banayein aur live health check karein.
        </p>

        {/* MAP BOX */}
        <div className="map-wrapper">
          <MapContainer center={mapCenter} zoom={15} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
              attribution="Google Satellite"
            />
            
            {/* 🚀 NAYA SEARCH COMPONENT */}
            <SearchField />
            
            <DrawTools setFarmCoords={setFarmCoords} />
          </MapContainer>
        </div>

        {/* RESULT BUTTON */}
        <button 
          onClick={checkHealth}
          disabled={loading}
          className="futuristic-btn"
        >
          {loading ? "⏳ Satellite data nikal raha hai..." : "Fasal Check Karein 🚀"}
        </button>

        {/* AI REPORT CARD */}
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
    </div>
  );
}

export default App;