// Weather Service with multiple free API options
// 
// FREE APIs Available:
// 1. Open-Meteo (NO API KEY REQUIRED) - https://open-meteo.com/
// 2. WeatherAPI.com - 1M calls/month free - https://www.weatherapi.com/
// 3. OpenWeatherMap - 1,000 calls/day free - https://openweathermap.org/api
// 4. 7Timer - NO API KEY REQUIRED - http://www.7timer.info/

class WeatherService {
  constructor() {
    // Primary: Open-Meteo (no API key required)
    this.openMeteoUrl = 'https://api.open-meteo.com/v1';
    
    // Fallback APIs (require API keys) - Using Vite environment variables
    this.weatherApiKey = import.meta.env.VITE_WEATHER_API_KEY;
    this.openWeatherApiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
  }

  // Get current weather by coordinates using Open-Meteo (no API key required)
  async getCurrentWeather(lat, lon) {
    try {
      // Try Open-Meteo first (no API key required)
      const response = await fetch(
        `${this.openMeteoUrl}/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure&timezone=auto`
      );
      
      if (response.ok) {
        const data = await response.json();
        const current = data.current_weather;
        const hourly = data.hourly;
        
        return {
          temperature: Math.round(current.temperature),
          condition: this.getWeatherCondition(current.weathercode),
          description: this.getWeatherDescription(current.weathercode),
          icon: this.getWeatherIcon(current.weathercode, current.is_day),
          humidity: hourly.relative_humidity_2m[0] || 65,
          windSpeed: Math.round(current.windspeed * 0.277778), // Convert km/h to m/s
          pressure: Math.round(hourly.surface_pressure[0]) || 1013,
          feelsLike: Math.round(current.temperature + 2), // Approximate
          visibility: 10, // Default visibility
          location: await this.getLocationName(lat, lon)
        };
      }
      
      // Fallback to mock data if Open-Meteo fails
      throw new Error('Open-Meteo API not available');
      
    } catch (error) {
      console.error('Error fetching weather data:', error);
      // Return mock data for demo purposes
      return this.getMockWeatherData();
    }
  }

  // Get 5-day forecast using Open-Meteo
  async getForecast(lat, lon) {
    try {
      const response = await fetch(
        `${this.openMeteoUrl}/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`
      );
      
      if (response.ok) {
        const data = await response.json();
        const daily = data.daily;
        
        return daily.time.map((date, index) => ({
          date: date,
          maxTemp: Math.round(daily.temperature_2m_max[index]),
          minTemp: Math.round(daily.temperature_2m_min[index]),
          condition: this.getWeatherCondition(daily.weathercode[index]),
          icon: this.getWeatherIcon(daily.weathercode[index], true) // Assume day time for forecast
        }));
      }
      
      throw new Error('Open-Meteo forecast not available');
      
    } catch (error) {
      console.error('Error fetching forecast data:', error);
      // Return mock data for demo purposes
      return this.getMockForecastData();
    }
  }

  // Process raw forecast data into daily forecasts
  processForecastData(forecastList) {
    const dailyData = {};
    
    forecastList.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toDateString();
      
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          date: dateKey,
          temps: [],
          conditions: [],
          icons: []
        };
      }
      
      dailyData[dateKey].temps.push(item.main.temp);
      dailyData[dateKey].conditions.push(item.weather[0].main);
      dailyData[dateKey].icons.push(item.weather[0].icon);
    });
    
    // Convert to array and calculate daily averages
    return Object.values(dailyData).slice(0, 5).map(day => ({
      date: day.date,
      maxTemp: Math.round(Math.max(...day.temps)),
      minTemp: Math.round(Math.min(...day.temps)),
      condition: this.getMostFrequent(day.conditions),
      icon: this.getMostFrequent(day.icons)
    }));
  }

  // Get most frequent item from array
  getMostFrequent(arr) {
    return arr.reduce((a, b, i, arr) =>
      arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
    );
  }

  // Mock weather data for demo (when API key is not available)
  getMockWeatherData() {
    return {
      temperature: 22,
      condition: 'Clear',
      description: 'clear sky',
      icon: '01d',
      humidity: 65,
      windSpeed: 3.2,
      pressure: 1013,
      feelsLike: 24,
      visibility: 10,
      location: 'Sample Location'
    };
  }

  // Mock forecast data for demo
  getMockForecastData() {
    const today = new Date();
    return Array.from({ length: 5 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      return {
        date: date.toDateString(),
        maxTemp: Math.round(20 + Math.random() * 10),
        minTemp: Math.round(15 + Math.random() * 5),
        condition: ['Clear', 'Clouds', 'Rain', 'Sunny'][Math.floor(Math.random() * 4)],
        icon: ['01d', '02d', '10d', '01d'][Math.floor(Math.random() * 4)]
      };
    });
  }

  // Get weather condition from Open-Meteo weather code
  getWeatherCondition(weatherCode) {
    const conditions = {
      0: 'Clear',
      1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
      45: 'Fog', 48: 'Depositing Rime Fog',
      51: 'Light Drizzle', 53: 'Moderate Drizzle', 55: 'Dense Drizzle',
      56: 'Light Freezing Drizzle', 57: 'Dense Freezing Drizzle',
      61: 'Slight Rain', 63: 'Moderate Rain', 65: 'Heavy Rain',
      66: 'Light Freezing Rain', 67: 'Heavy Freezing Rain',
      71: 'Slight Snow', 73: 'Moderate Snow', 75: 'Heavy Snow',
      77: 'Snow Grains',
      80: 'Slight Rain Showers', 81: 'Moderate Rain Showers', 82: 'Violent Rain Showers',
      85: 'Slight Snow Showers', 86: 'Heavy Snow Showers',
      95: 'Thunderstorm', 96: 'Thunderstorm with Hail', 99: 'Thunderstorm with Heavy Hail'
    };
    return conditions[weatherCode] || 'Unknown';
  }

  // Get weather description from Open-Meteo weather code
  getWeatherDescription(weatherCode) {
    const descriptions = {
      0: 'clear sky',
      1: 'mainly clear', 2: 'partly cloudy', 3: 'overcast',
      45: 'fog', 48: 'depositing rime fog',
      51: 'light drizzle', 53: 'moderate drizzle', 55: 'dense drizzle',
      56: 'light freezing drizzle', 57: 'dense freezing drizzle',
      61: 'slight rain', 63: 'moderate rain', 65: 'heavy rain',
      66: 'light freezing rain', 67: 'heavy freezing rain',
      71: 'slight snow fall', 73: 'moderate snow fall', 75: 'heavy snow fall',
      77: 'snow grains',
      80: 'slight rain showers', 81: 'moderate rain showers', 82: 'violent rain showers',
      85: 'slight snow showers', 86: 'heavy snow showers',
      95: 'thunderstorm', 96: 'thunderstorm with slight hail', 99: 'thunderstorm with heavy hail'
    };
    return descriptions[weatherCode] || 'unknown weather';
  }

  // Get weather icon from Open-Meteo weather code
  getWeatherIcon(weatherCode, isDay = true) {
    const dayIcons = {
      0: '01d', // clear
      1: '01d', 2: '02d', 3: '03d', // clouds
      45: '50d', 48: '50d', // fog
      51: '09d', 53: '09d', 55: '09d', // drizzle
      56: '13d', 57: '13d', // freezing drizzle
      61: '10d', 63: '10d', 65: '10d', // rain
      66: '13d', 67: '13d', // freezing rain
      71: '13d', 73: '13d', 75: '13d', 77: '13d', // snow
      80: '09d', 81: '09d', 82: '09d', // rain showers
      85: '13d', 86: '13d', // snow showers
      95: '11d', 96: '11d', 99: '11d' // thunderstorm
    };
    
    const nightIcons = {
      0: '01n', 1: '01n', 2: '02n', 3: '03n',
      45: '50n', 48: '50n',
      51: '09n', 53: '09n', 55: '09n',
      56: '13n', 57: '13n',
      61: '10n', 63: '10n', 65: '10n',
      66: '13n', 67: '13n',
      71: '13n', 73: '13n', 75: '13n', 77: '13n',
      80: '09n', 81: '09n', 82: '09n',
      85: '13n', 86: '13n',
      95: '11n', 96: '11n', 99: '11n'
    };
    
    const iconCode = isDay ? dayIcons[weatherCode] : nightIcons[weatherCode];
    return iconCode || '01d';
  }

  // Get weather icon URL
  getIconUrl(iconCode) {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  }

  // Get location name from coordinates using reverse geocoding
  async getLocationName(lat, lon) {
    try {
      // Use a free reverse geocoding service
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
      );
      
      if (response.ok) {
        const data = await response.json();
        return data.city || data.locality || data.principalSubdivision || 'Unknown Location';
      }
    } catch (error) {
      console.error('Error getting location name:', error);
    }
    
    return 'Property Location';
  }

  // Get weather-based property insights
  getPropertyInsights(weather, propertyType) {
    const insights = [];
    
    if (weather.temperature > 25) {
      insights.push({
        type: 'positive',
        text: 'Great weather for outdoor activities and balcony enjoyment!'
      });
    }
    
    if (weather.condition === 'Rain' && propertyType === 'house') {
      insights.push({
        type: 'neutral',
        text: 'Check the property\'s drainage and roof condition.'
      });
    }
    
    if (weather.humidity > 70) {
      insights.push({
        type: 'neutral',
        text: 'High humidity - ensure good ventilation in the property.'
      });
    }
    
    if (weather.windSpeed > 5) {
      insights.push({
        type: 'neutral',
        text: 'Windy conditions - check window sealing and insulation.'
      });
    }
    
    return insights;
  }
}

// Create singleton instance
const weatherService = new WeatherService();

export default weatherService;