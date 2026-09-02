import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';

import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';
import './App.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WeatherAQI from './components/WeatherAQI';

// average the polygon's ring coordinates to get a representative point for the field
function getCentroid(geometry) {
  if (!geometry?.coordinates?.length) return null;
  const ring = geometry.coordinates[0];
  const total = ring.reduce((acc, [lng, lat]) => ({ lat: acc.lat + lat, lng: acc.lng + lng }), { lat: 0, lng: 0 });
  return { lat: total.lat / ring.length, lng: total.lng / ring.length };
}

// single Flask backend serving all API routes (check_fasal, live-rgb, predict_crop)
const API_BASE_URL = "http://127.0.0.1:5000";

// human-friendly labels for the Model M4 feature breakdown
const M4_FEATURE_LABELS = {
  NDVI: { label: "NDVI (Vegetation)", group: "Spectral" },
  MNDWI: { label: "MNDWI (Water Mask)", group: "Spectral" },
  elevation: { label: "Elevation (m)", group: "Terrain" },
  slope: { label: "Slope (°)", group: "Terrain" },
  aspect: { label: "Aspect (°)", group: "Terrain" },
  clay: { label: "Clay Content", group: "SoilGrids" },
  sand: { label: "Sand Content", group: "SoilGrids" },
  soc: { label: "Soil Organic Carbon", group: "SoilGrids" },
  bdod: { label: "Bulk Density", group: "SoilGrids" },
};

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
      searchLabel: '🔍 Search Village, City, or Pincode...' 
    });

    map.addControl(searchControl);
    return () => map.removeControl(searchControl);
  }, [map]);

  return null;
}

// polygon draw tools for marking field boundaries
function DrawTools({ setFarmCoords }) {
  const map = useMap();
  const activeLayerRef = useRef(null);

  useEffect(() => {
    map.pm.addControls({
      position: 'topleft',
      drawMarker: false, drawCircleMarker: false, drawPolyline: false,
      drawRectangle: false, drawCircle: false, drawText: false,
      editControls: true, drawPolygon: true,
    });

    const handleCreate = (e) => {
      // only one active polygon at a time — remove the previous one before storing the new one
      // (guard against removing the layer we just created, in case this handler ever double-fires)
      if (activeLayerRef.current && activeLayerRef.current !== e.layer) {
        map.removeLayer(activeLayerRef.current);
      }
      activeLayerRef.current = e.layer;

      const geojson = e.layer.toGeoJSON();
      setFarmCoords(geojson.geometry);
    };

    map.on('pm:create', handleCreate);

    // StrictMode double-invokes this effect in dev — without this cleanup, the listener
    // stacks and every newly drawn polygon gets immediately removed by the duplicate call
    return () => {
      map.off('pm:create', handleCreate);
      map.pm.removeControls();
    };
  }, [map, setFarmCoords]);

  return null;
}

// home page with hero video + interactive map
function Home() {
  // Tajpura, Behat Road, Saharanpur — my village coordinates
  const mapCenter = [29.967, 77.555];
  const [farmCoords, setFarmCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [cropLoading, setCropLoading] = useState(false);
  const [cropResult, setCropResult] = useState(null);
  const centroid = getCentroid(farmCoords);

  const checkHealth = async () => {
    if (!farmCoords) {
      alert("⚠️ Please draw your field boundary on the map first!");
      return;
    }

    setLoading(true);
    setReport(null);

    try {
      const response = await fetch(`${API_BASE_URL}/check_fasal`, {
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

  // sends the drawn polygon to the XGBoost Model M4 endpoint for a crop prediction
  const predictCrop = async () => {
    if (!farmCoords) {
      alert("⚠️ Please draw your field boundary on the map first!");
      return;
    }

    setCropLoading(true);
    setCropResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/predict_crop`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ geometry: farmCoords })
      });

      const data = await response.json();

      if (data.status === "success") {
        setCropResult(data);
      } else {
        alert("❌ Error: " + data.message);
      }
    } catch (error) {
      alert("⚠️ Backend se connection nahi ho paya. Thodi der baad try karo.");
      console.error(error);
    }
    setCropLoading(false);
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
                url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
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
            {loading ? "⏳ Fetching live satellite data..." : "Analyze Crop Health 🚀"}
          </button>

          {/* Model M4 button — only shown once a field boundary has been drawn */}
          {farmCoords && (
            <button
              onClick={predictCrop}
              disabled={cropLoading}
              className="futuristic-btn ai-btn"
            >
              {cropLoading ? "🤖 Running XGBoost + Earth Engine..." : "Analyze Crop with AI 🤖"}
            </button>
          )}

          {/* NDVI report card — shows up after satellite analysis is done */}
          {report && (
            <div className="report-card">
              <h2>📊 Live Satellite Report</h2>
              <p className="score-text">NDVI Score: <span>{report.score}</span></p>
              <hr />
              <h3>🤖 AI Health Analysis:</h3>
              {report.is_water ? (
                <p className="advice-text">💧 Water Body Detected (MNDWI &gt; 0). Crop analysis is not applicable here.</p>
              ) : (
                <p className="advice-text">{report.advice}</p>
              )}
            </div>
          )}

          {/* Model M4 crop prediction card — XGBoost result + feature breakdown */}
          {cropResult && (
            <div className="report-card crop-card">
              <h2>🌾 AI Crop Prediction (Model M4)</h2>
              <p className="crop-predicted">
                Predicted Crop: <span>{cropResult.predicted_crop}</span>
              </p>
              <hr />
              <h3>🔬 Feature Breakdown:</h3>
              <div className="feature-grid">
                {Object.entries(cropResult.features).map(([key, value]) => {
                  const meta = M4_FEATURE_LABELS[key] || { label: key, group: "Other" };
                  return (
                    <div className="feature-item" key={key}>
                      <span className="feature-group">{meta.group}</span>
                      <span className="feature-label">{meta.label}</span>
                      <span className="feature-value">
                        {typeof value === "number" ? value.toFixed(3) : String(value)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* weather + AQI for the drawn field's centroid */}
          {centroid && <WeatherAQI lat={centroid.lat} lon={centroid.lng} />}
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Home;