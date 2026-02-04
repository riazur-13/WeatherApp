import React, { useState } from "react";
import "./App.css";

const App = () => {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState([]);

  const getWeather = async (e) => {
    if (e) e.preventDefault(); // Prevents page refresh
    if (!city.trim()) return;

    setLoading(true);
    const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      const resCurrent = await fetch(url);
      const resForcast = await fetch(forecastUrl);

      const dataCurrent = await resCurrent.json();
      const dataForecast = await resForcast.json();

      if (resCurrent.ok && resForcast.ok) {
        setWeatherData(dataCurrent);

        const dailyData = dataForecast.list.filter((reading) =>
          reading.dt_txt.includes("12:00:00")
        );

        setForecast(dailyData);
      }

      if (response.ok) {
        setWeatherData(data);
      } else {
        alert("City not found! Please try again.");
      }
    } catch (error) {
      console.error("Error fetching weather:", error);
    } finally {
      setLoading(false);
    }
  };
  // This function returns a CSS gradient based on the temperature
  const getBackground = () => {
    if (!weatherData)
      return "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)"; // Default Blue

    const temp = weatherData.main.temp;

    if (temp > 30) return "linear-gradient(135deg, #f83600 0%, #f9d423 100%)"; // Hot (Orange/Red)
    if (temp > 15) return "linear-gradient(135deg, #2980b9 0%, #6dd5fa 100%)"; // Warm (Light Blue)
    if (temp <= 15) return "linear-gradient(135deg, #83a4d4 0%, #b6fbff 100%)"; // Cold (Icy Blue)

    return "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)";
  };

  return (
    <div
      className="app-container"
      style={{
        background: getBackground(),
        transition: "background 0.5s ease",
      }}
    >
      <form className="search-box" onSubmit={getWeather}>
        <input
          type="text"
          placeholder="Enter city..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {loading && <div className="loader">Loading...</div>}

      {!loading && weatherData && (
        <div className="weather-container">
          {forecast.length > 0 && (
            <div className="forecast-container">
              <h3>5-Day Forecast</h3>
              <div className="forecast-grid">
                {forecast.map((day, index) => (
                  <div key={index} className="forecast-item">
                    <p className="day-name">
                      {new Date(day.dt_txt).toLocaleDateString("en-US", {
                        weekday: "short",
                      })}
                    </p>
                    <img
                      src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
                      alt="forecast icon"
                    />
                    <p className="forecast-temp">
                      {Math.round(day.main.temp)}°C
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="weather-main">
            <h2>
              {weatherData.name}, {weatherData.sys.country}
            </h2>
            <img
              src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png`}
              alt="weather icon"
            />
            <h1 className="temp">{Math.round(weatherData.main.temp)}°C</h1>
            <p className="description">{weatherData.weather[0].description}</p>
          </div>

          <div className="weather-details">
            <div className="detail-box">
              <span>Feels Like</span>
              <strong>{Math.round(weatherData.main.feels_like)}°C</strong>
            </div>
            <div className="detail-box">
              <span>Humidity</span>
              <strong>{weatherData.main.humidity}%</strong>
            </div>
            <div className="detail-box">
              <span>Wind</span>
              <strong>{weatherData.wind.speed} m/s</strong>
            </div>
            <div className="detail-box">
              <span>Pressure</span>
              <strong>{weatherData.main.pressure} hPa</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
