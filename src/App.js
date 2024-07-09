import React, { useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import './App.css';

function App() {
  const [data, setData] = useState({});
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [dailyForecast, setDailyForecast] = useState([]);
  const [city, setCity] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchWeatherData(city);
    fetchForecast(city);
  };

  const fetchWeatherData = async (city) => {
    const api_key = process.env.REACT_APP_API_KEY;
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${api_key}`;

    try {
      const response = await axios.get(apiUrl);
      setData(response.data);
      console.log(response.data);
      toast.success('Weather data fetched successfully!');
    } catch (error) {
      console.error('Error fetching weather data:', error);
      toast.error('Failed to fetch weather data. Please check the location entered.');
    }
  };

  const fetchForecast = async (city) => {
    const api_key = process.env.REACT_APP_API_KEY;
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${api_key}`;

    try {
      const response = await axios.get(apiUrl);
      setHourlyForecast(response.data.list.slice(0, 9));
      setDailyForecast(processDailyForecast(response.data.list));
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching forecast data:', error);
    }
  };

  const processDailyForecast = (list) => {
    const dailyData = {};
    list.forEach(item => {
      const date = new Date(item.dt * 1000).toLocaleDateString(); // Get only the date part
      if (!dailyData[date]) {
        dailyData[date] = { 
          ...item, 
          temp_min: item.main.temp_min, 
          temp_max: item.main.temp_max, 
          pop: item.pop // precipitation probability
        };
      } else {
        dailyData[date].temp_min = Math.min(dailyData[date].temp_min, item.main.temp_min);
        dailyData[date].temp_max = Math.max(dailyData[date].temp_max, item.main.temp_max);
        dailyData[date].pop = Math.max(dailyData[date].pop, item.pop); // Use max probability of precipitation
      }
    });
    return Object.values(dailyData);
  };

  const convertTimestampToDate = (timestamp) => {
    const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
    return date.toLocaleString(); // Returns a human-readable string
  };

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-gradient-to-r from-gray-800 to-gray-900 text-gray-100 flex flex-col justify-center items-center">
        <h1 className='text-center font-bold text-5xl mb-8'>Weatheryze</h1>
        <div className="w-full max-w-lg p-8 space-y-6 bg-gray-800 rounded-xl shadow-lg">
          <h2 className="text-center text-gray-100 text-3xl font-bold">Weather Report</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Enter city name"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="p-3 rounded-md w-full border border-gray-600 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <div className="text-center">
              <button className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition" type="submit">Submit</button>
            </div>
          </form>

          {data.main && (
            <div className="space-y-6">
              <div className="flex justify-between items-center p-4 rounded-md bg-gray-700 shadow-md">
                <div className="text-center">
                  <h1 className="text-4xl text-gray-100 font-bold">{Math.round(data.main.temp - 273.15)}°C</h1>
                  <p className="text-gray-400">Temperature</p>
                </div>
                <div className="text-center">
                  {data.weather && data.weather[0] && (
                    <>
                      <img
                        src={`http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`}
                        alt={data.weather[0].description}
                        className="w-20 h-20"
                      />
                      <p className="text-gray-400">{data.weather[0].description}</p>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-md bg-gray-700 shadow-md text-center">
                  <h1 className="text-2xl text-gray-100">{Math.floor(data.main.feels_like - 273.15)}°C</h1>
                  <p className="text-gray-400">Feels Like</p>
                </div>
                <div className="p-4 rounded-md bg-gray-700 shadow-md text-center">
                  <h1 className="text-2xl text-gray-100">{data.wind.speed} m/s</h1>
                  <p className="text-gray-400">Wind Speed</p>
                </div>
                <div className="p-4 rounded-md bg-gray-700 shadow-md text-center">
                  <h1 className="text-2xl text-gray-100">{data.main.humidity}%</h1>
                  <p className="text-gray-400">Humidity</p>
                </div>
                <div className="p-4 rounded-md bg-gray-700 shadow-md text-center">
                  <h1 className="text-2xl text-gray-100">{data.main.pressure} hPa</h1>
                  <p className="text-gray-400">Pressure</p>
                </div>
              </div>

              <div className="p-4 rounded-md bg-gray-700 shadow-md">
                <h1 className="text-center text-gray-100">Date and Time: {convertTimestampToDate(data.dt)}</h1>
              </div>
            </div>
          )}

          {hourlyForecast.length > 0 && (
            <div>
              <h2 className="text-center text-gray-100 text-2xl font-bold mb-4">Hourly Forecast</h2>
              <div className="flex space-x-4 overflow-x-auto p-4 bg-gray-700 rounded-md shadow-md">
                {hourlyForecast.map((item, index) => (
                  <div key={index} className="flex-shrink-0 p-4 text-center rounded-md bg-gray-800 shadow-md">
                    <h1 className="text-xl text-gray-100">{Math.floor(item.main.temp - 273.15)}°C</h1>
                    <img
                      src={`http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                      alt={item.weather[0].description}
                      className="w-16 h-16 mx-auto"
                    />
                    <p className="text-gray-300">{convertTimestampToDate(item.dt)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {dailyForecast.length > 0 && (
            <div>
              <h2 className="text-center text-gray-100 text-2xl font-bold mb-4">6-Day Forecast</h2>
              <div className="space-y-4">
                {dailyForecast.map((item, index) => (
                  <div key={index} className="p-4 rounded-md bg-gray-700 shadow-md text-center">
                    <h1 className="text-xl text-gray-100">{Math.floor(item.main.temp_min - 273.15)}°C</h1>
                    <img
                      src={`http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                      alt={item.weather[0].description}
                      className="w-16 h-16 mx-auto"
                    />
                    <p className="text-gray-300">{new Date(item.dt * 1000).toLocaleDateString()}</p>
                    <p className="text-gray-300">Chance of Rain: {(item.pop * 100).toFixed(0)}%</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
