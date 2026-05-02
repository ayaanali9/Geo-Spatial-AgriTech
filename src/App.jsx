import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';

// Nayi Search Library Imports
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';

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
      // Tera live Colab API Link
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
    <div style={{ textAlign: 'center', fontFamily: 'sans-serif', padding: '20px', backgroundColor: '#f0fdf4', minHeight: '100vh' }}>
      
      <h1 style={{ color: '#166534', margin: '0 0 10px 0' }}>🌾 Kisan Space Tech</h1>
      <p style={{ color: '#4b5563', marginBottom: '20px', fontSize: '18px' }}>
        Map par apne khet ki boundary banayein aur live health check karein.
      </p>

      {/* MAP BOX */}
      <div style={{ height: '55vh', width: '90%', maxWidth: '800px', margin: '0 auto', border: '4px solid #22c55e', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }}>
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
        style={{ marginTop: '25px', padding: '15px 40px', fontSize: '20px', fontWeight: 'bold', color: 'white', background: loading ? '#86efac' : '#22c55e', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.2)' }}
      >
        {loading ? "⏳ Satellite data nikal raha hai..." : "Fasal Check Karein 🚀"}
      </button>

      {/* AI REPORT CARD */}
      {report && (
        <div style={{ marginTop: '30px', padding: '20px', maxWidth: '600px', margin: '30px auto', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', borderLeft: '8px solid #16a34a', textAlign: 'left' }}>
          <h2 style={{ margin: '0 0 10px 0', color: '#15803d' }}>📊 Asli Data Report</h2>
          <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#374151' }}>NDVI Score: <span style={{ color: '#047857' }}>{report.score}</span></p>
          <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '15px 0' }} />
          <h3 style={{ margin: '0 0 5px 0', color: '#1f2937' }}>🤖 AI Health Analysis:</h3>
          <p style={{ fontSize: '16px', color: '#4b5563', lineHeight: '1.5' }}>{report.advice}</p>
        </div>
      )}

    </div>
  );
}

export default App;