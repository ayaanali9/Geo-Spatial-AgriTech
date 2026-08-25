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
  const activeLayerRef = useRef(null);

  useEffect(() => {
    map.pm.addControls({
      position: 'topleft',
      drawMarker: false, drawCircleMarker: false, drawPolyline: false,
      drawRectangle: false, drawCircle: false, drawText: false,
      editControls: true, drawPolygon: true,
    });

    map.on('pm:create', (e) => {
      // only one active polygon at a time — remove the previous one before storing the new one
      if (activeLayerRef.current) {
        map.removeLayer(activeLayerRef.current);
      }
      activeLayerRef.current = e.layer;

      const geojson = e.layer.toGeoJSON();
      setFarmCoords(geojson.geometry);
    });
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
  const [liveRgbUrl, setLiveRgbUrl] = useState(null);
  const [liveRgbLoading, setLiveRgbLoading] = useState(false);
  const centroid = getCentroid(farmCoords);

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

  const toggleLiveSatellite = async () => {
    // toggling off just removes the overlay, revealing the Google base map again
    if (liveRgbUrl) {
      setLiveRgbUrl(null);
      return;
    }

    if (!farmCoords) {
      alert("⚠️ Pehle map par apne khet ki boundary draw karein!");
      return;
    }

    setLiveRgbLoading(true);

    try {
      const apiUrl = "https://geo-spatial-agritech.onrender.com/api/live-rgb";

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ geometry: farmCoords })
      });

      const data = await response.json();

      if (data.status === "success") {
        setLiveRgbUrl(data.tile_url);
      } else {
        alert("❌ Error: " + data.message);
      }
    } catch (error) {
      alert("⚠️ Backend se connection nahi ho paya. Thodi der baad try karo.");
      console.error(error);
    }
    setLiveRgbLoading(false);
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
              {liveRgbUrl && (
                <TileLayer url={liveRgbUrl} attribution="Sentinel-2 (Live)" />
              )}
              <SearchField />
              <DrawTools setFarmCoords={setFarmCoords} />
            </MapContainer>
          </div>

          <button
            onClick={toggleLiveSatellite}
            disabled={liveRgbLoading}
            className={`satellite-toggle-btn ${liveRgbUrl ? 'active' : ''}`}
          >
            {liveRgbLoading
              ? "⏳ Live tiles la rahe hain..."
              : liveRgbUrl
                ? "🛰️ Live Satellite ON (10m Res)"
                : "🛰️ Live Satellite (10m Res)"}
          </button>

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
              {report.is_water ? (
                <p className="advice-text">💧 Water Body Detected (MNDWI &gt; 0). Crop analysis is not applicable here.</p>
              ) : (
                <p className="advice-text">{report.advice}</p>
              )}
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