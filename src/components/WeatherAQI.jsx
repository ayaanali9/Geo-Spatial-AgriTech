import React, { useState, useEffect } from 'react';

const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

const AQI_LABELS = {
  1: { label: 'Good', color: '#22c55e' },
  2: { label: 'Fair', color: '#84cc16' },
  3: { label: 'Moderate', color: '#eab308' },
  4: { label: 'Poor', color: '#f97316' },
  5: { label: 'Very Poor', color: '#ef4444' },
};

const COMPASS_DIRS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

function degToCompass(deg) {
  return COMPASS_DIRS[Math.round(deg / 22.5) % 16];
}

// live weather + AQI card for the field's centroid coordinates
function WeatherAQI({ lat, lon }) {
  const [weather, setWeather] = useState(null);
  const [aqi, setAqi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (lat == null || lon == null) return;

    if (!OPENWEATHER_API_KEY) {
      setError('⚠️ OpenWeatherMap API key missing — set VITE_OPENWEATHER_API_KEY in .env');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function fetchWeatherAndAqi() {
      try {
        const [weatherRes, aqiRes] = await Promise.all([
          fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`),
          fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`),
        ]);

        if (!weatherRes.ok || !aqiRes.ok) {
          throw new Error('OpenWeatherMap request failed');
        }

        const weatherData = await weatherRes.json();
        const aqiData = await aqiRes.json();

        if (!cancelled) {
          setWeather(weatherData);
          setAqi(aqiData.list?.[0] ?? null);
        }
      } catch (err) {
        if (!cancelled) setError('⚠️ Weather data laane mein error aayi.');
        console.error('WeatherAQI fetch error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchWeatherAndAqi();
    return () => { cancelled = true; };
  }, [lat, lon]);

  if (lat == null || lon == null) return null;

  const aqiInfo = aqi ? AQI_LABELS[aqi.main.aqi] : null;

  return (
    <div className="weather-card">
      <h2>🌦️ Live Weather & AQI</h2>

      {loading && <p className="weather-status">⏳ Data fetch ho raha hai...</p>}
      {error && <p className="weather-status weather-error">{error}</p>}

      {weather && aqi && !loading && !error && (
        <div className="weather-grid">
          <div className="weather-stat">
            <span className="weather-stat-icon">🌡️</span>
            <span className="weather-stat-value">{Math.round(weather.main.temp)}°C</span>
            <span className="weather-stat-label">Temperature</span>
          </div>

          <div className="weather-stat">
            <span className="weather-stat-icon">💨</span>
            <span className="weather-stat-value">{weather.wind.speed} m/s</span>
            <span className="weather-stat-label">Wind ({degToCompass(weather.wind.deg)})</span>
          </div>

          <div className="weather-stat">
            <span className="weather-stat-icon">💧</span>
            <span className="weather-stat-value">{weather.main.humidity}%</span>
            <span className="weather-stat-label">Humidity</span>
          </div>

          <div className="weather-stat aqi-stat" style={{ '--aqi-color': aqiInfo?.color ?? '#9ca3af' }}>
            <span className="weather-stat-icon">🫁</span>
            <span className="weather-stat-value">{aqiInfo?.label ?? 'N/A'}</span>
            <span className="weather-stat-label">Air Quality (AQI {aqi.main.aqi})</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default WeatherAQI;
