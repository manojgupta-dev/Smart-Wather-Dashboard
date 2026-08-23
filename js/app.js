// ========================================
// 1. DOM ELEMENTS
// ========================================

// Search elements
const searchForm = document.querySelector("#searchForm");
const cityInput = document.querySelector("#cityInput");

// Header controls
const unitToggle = document.querySelector("#unitToggle");
const themeToggle = document.querySelector("#themeToggle");

// Weather information
const cityName = document.querySelector("#cityName");
const country = document.querySelector("#country");
const weatherIcon = document.querySelector("#weatherIcon");
const temperature = document.querySelector("#temperature");
const weatherCondition = document.querySelector("#weatherCondition");
const feelsLike = document.querySelector("#feelsLike");

// Statistics
const humidity = document.querySelector("#humidity");
const windSpeed = document.querySelector("#windSpeed");
const pressure = document.querySelector("#pressure");
const visibility = document.querySelector("#visibility");

// Application states
const initialState = document.querySelector("#initialState");
const loadingState = document.querySelector("#loadingState");
const errorState = document.querySelector("#errorState");
const errorMessage = document.querySelector("#errorMessage");


// ========================================
// 2. TEST
// ========================================

console.log("Weather Dashboard JavaScript loaded!");
console.log("Search form:", searchForm);
console.log("City input:", cityInput);
// ========================================
// 3. SEARCH FORM EVENT
// ========================================

searchForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const city = cityInput.value.trim();

    // Check empty input
    if (city === "") {
        showError("Please enter a city name.");
        return;
    }

    try {
        // Show loading state
        showLoading();

        // Step 1: Get city coordinates
        const location = await getCoordinates(city);

        console.log("Location:", location);

        // Step 2: Get weather data
        const weatherData = await fetchWeather(
            location.latitude,
            location.longitude
        );

        console.log("Final weather data:", weatherData);
        displayWeather(location, weatherData);

    } catch (error) {
        console.error("Search Error:", error);

        showError(error.message);
    }
});
// ========================================
// 4. APPLICATION STATES
// ========================================

function showLoading() {
    initialState.hidden = true;
    errorState.hidden = true;
    loadingState.hidden = false;
}

function showError(message) {
    initialState.hidden = true;
    loadingState.hidden = true;
    errorState.hidden = false;

    errorMessage.textContent = message;
}
// ========================================
// 5. FETCH WEATHER DATA
// ========================================

async function fetchWeather(latitude, longitude) {
    const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${latitude}` +
        `&longitude=${longitude}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,pressure_msl,wind_speed_10m,visibility` +
        `&timezone=auto`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Weather data could not be fetched.");
        }

        const data = await response.json();

        console.log("Weather data:", data);

        return data;

    } catch (error) {
        console.error("Weather API Error:", error);
    }
}
// ========================================
// 6. GEOCODING
// ========================================

async function getCoordinates(city) {
    const url =
        `https://geocoding-api.open-meteo.com/v1/search` +
        `?name=${encodeURIComponent(city)}` +
        `&count=1` +
        `&language=en` +
        `&format=json`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Location search failed.");
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
        throw new Error("City not found.");
    }

    const location = data.results[0];

    return {
        name: location.name,
        latitude: location.latitude,
        longitude: location.longitude,
        country: location.country
    };
}

// ========================================
// 7. WEATHER CODE MAPPING
// ========================================

function getWeatherInfo(code) {
    const weatherCodes = {
        0: {
            condition: "Clear Sky",
            icon: "☀️"
        },

        1: {
            condition: "Mainly Clear",
            icon: "🌤️"
        },

        2: {
            condition: "Partly Cloudy",
            icon: "⛅"
        },

        3: {
            condition: "Overcast",
            icon: "☁️"
        },

        45: {
            condition: "Fog",
            icon: "🌫️"
        },

        48: {
            condition: "Depositing Rime Fog",
            icon: "🌫️"
        },

        51: {
            condition: "Light Drizzle",
            icon: "🌦️"
        },

        53: {
            condition: "Moderate Drizzle",
            icon: "🌦️"
        },

        55: {
            condition: "Dense Drizzle",
            icon: "🌧️"
        },

        61: {
            condition: "Light Rain",
            icon: "🌦️"
        },

        63: {
            condition: "Moderate Rain",
            icon: "🌧️"
        },

        65: {
            condition: "Heavy Rain",
            icon: "🌧️"
        },

        80: {
            condition: "Light Rain Showers",
            icon: "🌦️"
        },

        81: {
            condition: "Moderate Rain Showers",
            icon: "🌧️"
        },

        82: {
            condition: "Heavy Rain Showers",
            icon: "⛈️"
        },

        95: {
            condition: "Thunderstorm",
            icon: "⛈️"
        },

        96: {
            condition: "Thunderstorm with Hail",
            icon: "⛈️"
        },

        99: {
            condition: "Thunderstorm with Heavy Hail",
            icon: "⛈️"
        }
    };

    return weatherCodes[code] || {
        condition: "Unknown Weather",
        icon: "🌡️"
    };
}

function displayWeather(location, weatherData) {
    const current = weatherData.current;

    // Location
    cityName.textContent = location.name;
    country.textContent = location.country;

    // Weather information
    temperature.textContent = `${Math.round(current.temperature_2m)}°C`;
   feelsLike.textContent = `${Math.round(current.apparent_temperature)}°C`;

    // Weather condition
  const weatherInfo = getWeatherInfo(current.weather_code);

weatherCondition.textContent = weatherInfo.condition;
weatherIcon.textContent = weatherInfo.icon;
    // Statistics
    humidity.textContent = `${current.relative_humidity_2m}%`;
    windSpeed.textContent = `${current.wind_speed_10m} km/h`;
    pressure.textContent = `${Math.round(current.pressure_msl)} hPa`;
    visibility.textContent = `${Math.round(current.visibility / 1000)} km`;

    // Show weather section
    initialState.hidden = true;
    loadingState.hidden = true;
    errorState.hidden = true;
}