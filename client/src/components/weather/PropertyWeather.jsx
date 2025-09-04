import { useState, useEffect } from 'react';
import weatherService from '../../lib/weatherService';
import './propertyWeather.scss';

function PropertyWeather({ latitude, longitude, property }) {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!latitude || !longitude) return;
      
      try {
        setLoading(true);
        const [weather, forecastData] = await Promise.all([
          weatherService.getCurrentWeather(latitude, longitude),
          weatherService.getForecast(latitude, longitude)
        ]);
        
        setCurrentWeather(weather);
        setForecast(forecastData);
        setError(null);
      } catch (err) {
        setError('Unable to load weather data');
        console.error('Weather fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [latitude, longitude]);

  if (loading) {
    return (
      <div className="weather-container">
        <div className="weather-loading">
          <div className="loading-spinner"></div>
          <p>Loading weather data...</p>
        </div>
      </div>
    );
  }

  if (error || !currentWeather) {
    return (
      <div className="weather-container">
        <div className="weather-error">
          <p>Weather data temporarily unavailable</p>
        </div>
      </div>
    );
  }

  const insights = weatherService.getPropertyInsights(currentWeather, property);

  return (
    <div className="weather-container">
      {/* Current Weather */}
      <div className="current-weather">
        <div className="weather-header">
          <h3>🌤️ Current Weather</h3>
          <span className="location">{currentWeather.location}</span>
        </div>
        
        <div className="weather-main">
          <div className="temperature-section">
            <div className="temp-display">
              <span className="temperature">{currentWeather.temperature}°C</span>
              <span className="feels-like">Feels like {currentWeather.feelsLike}°C</span>
            </div>
            <div className="weather-icon">
              <img 
                src={weatherService.getIconUrl(currentWeather.icon)} 
                alt={currentWeather.description}
              />
            </div>
          </div>
          
          <div className="weather-details">
            <p className="condition">{currentWeather.description}</p>
            <div className="weather-stats">
              <div className="stat-item">
                <span className="label">💧 Humidity</span>
                <span className="value">
                  <span className="number">{currentWeather.humidity}</span>
                  <span className="unit">%</span>
                </span>
              </div>
              <div className="stat-item">
                <span className="label">💨 Wind Speed</span>
                <span className="value">
                  <span className="number">{currentWeather.windSpeed}</span>
                  <span className="unit">m/s</span>
                </span>
              </div>
              <div className="stat-item">
                <span className="label">👁️ Visibility</span>
                <span className="value">
                  <span className="number">{currentWeather.visibility}</span>
                  <span className="unit">km</span>
                </span>
              </div>
              <div className="stat-item">
                <span className="label">📊 Pressure</span>
                <span className="value">
                  <span className="number">{currentWeather.pressure}</span>
                  <span className="unit">hPa</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Day Forecast */}
      <div className="forecast-section">
        <h4>📅 5-Day Forecast</h4>
        <div className="forecast-grid">
          {forecast.map((day, index) => (
            <div key={index} className="forecast-day">
              <div className="day-name">
                {index === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
              </div>
              <img 
                src={weatherService.getIconUrl(day.icon)} 
                alt={day.condition}
                className="forecast-icon"
              />
              <div className="forecast-temps">
                <span className="max-temp">{day.maxTemp}°</span>
                <span className="min-temp">{day.minTemp}°</span>
              </div>
              <div className="forecast-condition">{day.condition}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Property Insights */}
      {insights.length > 0 && (
        <div className="weather-insights">
          <h4>🏠 Property Weather Insights</h4>
          <div className="insights-list">
            {insights.map((insight, index) => (
              <div key={index} className={`insight-item ${insight.type}`}>
                <span className="insight-icon">
                  {insight.type === 'positive' ? '✅' : 
                   insight.type === 'negative' ? '⚠️' : 'ℹ️'}
                </span>
                <span className="insight-text">{insight.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weather Source */}
      <div className="weather-source">
        <p>Weather data provided by OpenWeatherMap</p>
      </div>
    </div>
  );
}

export default PropertyWeather;