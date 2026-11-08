
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");

const weatherContainer =
  document.getElementById("weatherContainer");

const forecastContainer =
  document.getElementById("forecastContainer");

const errorMessage =
  document.getElementById("errorMessage");

const loading =
  document.getElementById("loading");

// Weather code descriptions and icons
function getWeatherInfo(code) {
  const weatherCodes = {
    0: ["Clear Sky", "☀️"],
    1: ["Mainly Clear", "🌤️"],
    2: ["Partly Cloudy", "⛅"],
    3: ["Overcast", "☁️"],
    45: ["Foggy", "🌫️"],
    48: ["Rime Fog", "🌫️"],
    51: ["Light Drizzle", "🌦️"],
    53: ["Drizzle", "🌦️"],
    55: ["Heavy Drizzle", "🌧️"],
    61: ["Light Rain", "🌦️"],
    63: ["Moderate Rain", "🌧️"],
    65: ["Heavy Rain", "🌧️"],
    71: ["Light Snow", "🌨️"],
    73: ["Snow", "❄️"],
    75: ["Heavy Snow", "❄️"],
    80: ["Rain Showers", "🌦️"],
    81: ["Moderate Showers", "🌧️"],
    82: ["Heavy Showers", "⛈️"],
    95: ["Thunderstorm", "⛈️"],
    96: ["Thunderstorm with Hail", "⛈️"],
    99: ["Severe Thunderstorm", "⛈️"]
  };

  return weatherCodes[code] || ["Unknown Weather", "🌡️"];
}

// Search city coordinates
async function getCityCoordinates(city) {
  const url =
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Unable to find city.");
  }

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error("City not found. Please try another city.");
  }

  return data.results[0];
}

// Fetch weather data
async function getWeather(latitude, longitude) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Unable to fetch weather data.");
  }

  return await response.json();
}

// Display current weather
function displayCurrentWeather(city, data) {
  const current = data.current;

  const [description, icon] =
    getWeatherInfo(current.weather_code);

  document.getElementById("cityName").textContent =
    `${city.name}, ${city.country}`;

  document.getElementById("currentDate").textContent =
    new Date(current.time).toLocaleString();

  document.getElementById("temperature").textContent =
    `${Math.round(current.temperature_2m)}°C`;

  document.getElementById("description").textContent =
    description;

  document.getElementById("weatherIcon").textContent =
    icon;

  document.getElementById("humidity").textContent =
    `${current.relative_humidity_2m}%`;

  document.getElementById("wind").textContent =
    `${current.wind_speed_10m} km/h`;

  document.getElementById("feelsLike").textContent =
    `${Math.round(current.apparent_temperature)}°C`;
}

// Display 5-day forecast
function displayForecast(data) {
  forecastContainer.innerHTML = "";

  const daily = data.daily;

  daily.time.forEach((date, index) => {
    const [description, icon] =
      getWeatherInfo(daily.weather_code[index]);

    const day = new Date(date + "T12:00:00")
      .toLocaleDateString("en-US", {
        weekday: "short"
      });

    const card = document.createElement("div");

    card.className = "forecast-card";

    card.innerHTML = `
      <p>${day}</p>
      <div class="forecast-icon">${icon}</div>
      <h3>${Math.round(
        daily.temperature_2m_max[index]
      )}°C</h3>
      <p>Low: ${Math.round(
        daily.temperature_2m_min[index]
      )}°C</p>
      <p>${description}</p>
    `;

    forecastContainer.appendChild(card);
  });
}

// Main weather function
async function searchWeather() {
  const city = cityInput.value.trim();

  // Input validation
  if (!city) {
    errorMessage.textContent =
      "Please enter a city name.";

    weatherContainer.hidden = true;
    return;
  }

  errorMessage.textContent = "";
  loading.textContent = "Fetching weather data...";
  weatherContainer.hidden = true;
  searchBtn.disabled = true;

  try {
    // Step 1: Get city coordinates
    const location = await getCityCoordinates(city);

    // Step 2: Get weather information
    const weather = await getWeather(
      location.latitude,
      location.longitude
    );

    // Step 3: Update the dashboard
    displayCurrentWeather(location, weather);
    displayForecast(weather);

    weatherContainer.hidden = false;

  } catch (error) {
    errorMessage.textContent = error.message;

  } finally {
    loading.textContent = "";
    searchBtn.disabled = false;
  }
}

// Search button
searchBtn.addEventListener("click", searchWeather);

// Enter key support
cityInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    searchWeather();
  }
});

// Load default city
cityInput.value = "London";
searchWeather();
