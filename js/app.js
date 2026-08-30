
// ========================================
// WEATHERLY — SMART WEATHER DASHBOARD
// COMPLETE JAVASCRIPT
// ========================================


// ========================================
// 1. DOM ELEMENTS
// ========================================

// Search
const searchForm = document.querySelector("#searchForm");
const cityInput = document.querySelector("#cityInput");

// Header controls
const locationButton = document.querySelector("#locationButton");
const unitToggle = document.querySelector("#unitToggle");
const themeToggle = document.querySelector("#themeToggle");

// Current weather
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

// Date and time
const currentTime = document.querySelector("#currentTime");
const currentDate = document.querySelector("#currentDate");

// Sunrise / Sunset
const sunrise = document.querySelector("#sunrise");
const sunset = document.querySelector("#sunset");

// Forecast
const hourlyContainer = document.querySelector("#hourlyContainer");
const forecastContainer = document.querySelector("#forecastContainer");

// Air quality
const airQuality = document.querySelector("#airQuality");

// Application states
const initialState = document.querySelector("#initialState");
const loadingState = document.querySelector("#loadingState");
const errorState = document.querySelector("#errorState");
const errorMessage = document.querySelector("#errorMessage");


// ========================================
// 2. APPLICATION VARIABLES
// ========================================

let currentWeatherData = null;
let currentLocationData = null;

let currentUnit = "C";

let currentTimezone = "auto";


// ========================================
// 3. TEST
// ========================================

console.log("Weatherly Smart Dashboard loaded!");


// ========================================
// 4. WEATHER CODE MAPPING
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
            condition: "Rime Fog",
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

        56: {
            condition: "Freezing Drizzle",
            icon: "🌧️"
        },

        57: {
            condition: "Heavy Freezing Drizzle",
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

        66: {
            condition: "Light Freezing Rain",
            icon: "🌧️"
        },

        67: {
            condition: "Heavy Freezing Rain",
            icon: "🌧️"
        },

        71: {
            condition: "Light Snow",
            icon: "🌨️"
        },

        73: {
            condition: "Moderate Snow",
            icon: "❄️"
        },

        75: {
            condition: "Heavy Snow",
            icon: "❄️"
        },

        77: {
            condition: "Snow Grains",
            icon: "❄️"
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

        85: {
            condition: "Light Snow Showers",
            icon: "🌨️"
        },

        86: {
            condition: "Heavy Snow Showers",
            icon: "❄️"
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


// ========================================
// 5. SEARCH CITY
// ========================================

searchForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const city = cityInput.value.trim();


    if (city === "") {

        showError("Please enter a city name.");

        return;

    }


    try {

        showLoading();


        // Find city coordinates
        const location = await getCoordinates(city);

        console.log("Location:", location);


        // Fetch weather
        const weatherData =
            await fetchWeather(
                location.latitude,
                location.longitude
            );


        // Fetch air quality
        const airData =
            await fetchAirQuality(
                location.latitude,
                location.longitude
            );


        currentLocationData = location;
        currentWeatherData = weatherData;


        displayWeather(
            location,
            weatherData,
            airData
        );


        cityInput.value = location.name;


    } catch (error) {

        console.error("Search Error:", error);

        showError(error.message);

    }

});


// ========================================
// 6. GET CITY COORDINATES
// ========================================

async function getCoordinates(city) {

    const url =
        "https://geocoding-api.open-meteo.com/v1/search" +
        `?name=${encodeURIComponent(city)}` +
        "&count=1" +
        "&language=en" +
        "&format=json";


    const response = await fetch(url);


    if (!response.ok) {

        throw new Error(
            "Location search failed."
        );

    }


    const data = await response.json();


    if (
        !data.results ||
        data.results.length === 0
    ) {

        throw new Error(
            "City not found. Please try another city."
        );

    }


    const location = data.results[0];


    return {

        name: location.name,

        latitude: location.latitude,

        longitude: location.longitude,

        country: location.country,

        timezone: location.timezone || "auto"

    };

}


// ========================================
// 7. FETCH CURRENT WEATHER + FORECAST
// ========================================

async function fetchWeather(
    latitude,
    longitude
) {

    const url =
        "https://api.open-meteo.com/v1/forecast" +

        `?latitude=${latitude}` +

        `&longitude=${longitude}` +

        "&current=" +
        "temperature_2m," +
        "relative_humidity_2m," +
        "apparent_temperature," +
        "weather_code," +
        "pressure_msl," +
        "wind_speed_10m," +
        "visibility" +

        "&hourly=" +
        "temperature_2m," +
        "weather_code," +
        "relative_humidity_2m," +
        "wind_speed_10m" +

        "&daily=" +
        "weather_code," +
        "temperature_2m_max," +
        "temperature_2m_min," +
        "sunrise," +
        "sunset" +

        "&forecast_days=5" +

        "&timezone=auto";


    const response = await fetch(url);


    if (!response.ok) {

        throw new Error(
            "Weather data could not be fetched."
        );

    }


    const data = await response.json();


    console.log("Weather API:", data);


    return data;

}


// ========================================
// 8. FETCH AIR QUALITY
// ========================================

async function fetchAirQuality(
    latitude,
    longitude
) {

    try {

        const url =
            "https://air-quality-api.open-meteo.com/v1/air-quality" +

            `?latitude=${latitude}` +

            `&longitude=${longitude}` +

            "&current=pm2_5" +

            "&timezone=auto";


        const response = await fetch(url);


        if (!response.ok) {

            throw new Error(
                "Air quality unavailable."
            );

        }


        const data = await response.json();


        return data;


    } catch (error) {

        console.warn(
            "Air Quality Error:",
            error
        );


        return null;

    }

}


// ========================================
// 9. DISPLAY CURRENT WEATHER
// ========================================

function displayWeather(
    location,
    weatherData,
    airData
) {

    const current =
        weatherData.current;


    // Location
    cityName.textContent =
        location.name;

    country.textContent =
        location.country;


    // Store timezone
    currentTimezone =
        location.timezone ||
        weatherData.timezone ||
        "auto";


    // Temperature
    const tempC =
        current.temperature_2m;


    const feelsC =
        current.apparent_temperature;


    temperature.textContent =
        formatTemperature(tempC);


    feelsLike.textContent =
        `Feels like ${formatTemperature(feelsC)}`;


    // Weather condition
    const weatherInfo =
        getWeatherInfo(
            current.weather_code
        );


    weatherIcon.textContent =
        weatherInfo.icon;


    weatherCondition.textContent =
        weatherInfo.condition;


    // Statistics
    humidity.textContent =
        `${current.relative_humidity_2m}%`;


    windSpeed.textContent =
        `${Math.round(current.wind_speed_10m)} km/h`;


    pressure.textContent =
        `${Math.round(current.pressure_msl)} hPa`;


    visibility.textContent =
        `${Math.round(
            current.visibility / 1000
        )} km`;


    // Sunrise / Sunset
    if (
        weatherData.daily &&
        weatherData.daily.sunrise &&
        weatherData.daily.sunset
    ) {

        sunrise.textContent =
            formatTime(
                weatherData.daily.sunrise[0]
            );


        sunset.textContent =
            formatTime(
                weatherData.daily.sunset[0]
            );

    }


    // Air quality
    if (
        airData &&
        airData.current &&
        airData.current.pm2_5 !== undefined
    ) {

        airQuality.textContent =
            `${Math.round(
                airData.current.pm2_5
            )} µg/m³`;

    } else {

        airQuality.textContent =
            "Unavailable";

    }


    // Forecasts
    displayHourlyForecast(
        weatherData
    );


    displayFiveDayForecast(
        weatherData
    );


    // Update time immediately
    updateDateTime();


    // Hide states
    hideAllStates();

}


// ========================================
// 10. TEMPERATURE FORMAT
// ========================================

function formatTemperature(
    celsius
) {

    if (celsius === null || celsius === undefined) {

        return "--°";

    }


    if (currentUnit === "F") {

        const fahrenheit =
            (celsius * 9 / 5) + 32;


        return `${Math.round(
            fahrenheit
        )}°F`;

    }


    return `${Math.round(
        celsius
    )}°C`;

}


// ========================================
// 11. HOURLY FORECAST
// ========================================

function displayHourlyForecast(
    weatherData
) {

    hourlyContainer.innerHTML = "";


    if (!weatherData.hourly) {

        return;

    }


    const hourly =
        weatherData.hourly;


    const currentHour =
        new Date(
            weatherData.current.time
        ).getTime();


    let count = 0;


    for (
        let i = 0;
        i < hourly.time.length &&
        count < 8;
        i++
    ) {

        const time =
            new Date(
                hourly.time[i]
            ).getTime();


        if (time < currentHour) {

            continue;

        }


        const info =
            getWeatherInfo(
                hourly.weather_code[i]
            );


        const card =
            document.createElement("div");


        card.className =
            "hourly-card";


        const timeElement =
            document.createElement("div");


        timeElement.className =
            "hourly-time";


        timeElement.textContent =
            formatTime(
                hourly.time[i]
            );


        const iconElement =
            document.createElement("div");


        iconElement.className =
            "hourly-icon";


        iconElement.textContent =
            info.icon;


        const tempElement =
            document.createElement("div");


        tempElement.className =
            "hourly-temperature";


        tempElement.textContent =
            formatTemperature(
                hourly.temperature_2m[i]
            );


        card.appendChild(
            timeElement
        );


        card.appendChild(
            iconElement
        );


        card.appendChild(
            tempElement
        );


        hourlyContainer.appendChild(
            card
        );


        count++;

    }

}


// ========================================
// 12. FIVE DAY FORECAST
// ========================================

function displayFiveDayForecast(
    weatherData
) {

    forecastContainer.innerHTML = "";


    if (!weatherData.daily) {

        return;

    }


    const daily =
        weatherData.daily;


    for (
        let i = 0;
        i < daily.time.length;
        i++
    ) {

        const info =
            getWeatherInfo(
                daily.weather_code[i]
            );


        const card =
            document.createElement("div");


        card.className =
            "forecast-card";


        const day =
            document.createElement("div");


        day.className =
            "forecast-day";


        day.textContent =
            formatDay(
                daily.time[i],
                i
            );


        const icon =
            document.createElement("div");


        icon.className =
            "forecast-icon";


        icon.textContent =
            info.icon;


        const temp =
            document.createElement("div");


        temp.className =
            "forecast-temp";


        const maxTemp =
            formatTemperature(
                daily.temperature_2m_max[i]
            );


        const minTemp =
            formatTemperature(
                daily.temperature_2m_min[i]
            );


        temp.textContent =
            `${maxTemp} / ${minTemp}`;


        const condition =
            document.createElement("div");


        condition.className =
            "forecast-condition";


        condition.textContent =
            info.condition;


        card.appendChild(day);

        card.appendChild(icon);

        card.appendChild(temp);

        card.appendChild(condition);


        forecastContainer.appendChild(
            card
        );

    }

}


// ========================================
// 13. FORMAT DAY
// ========================================

function formatDay(
    dateString,
    index
) {

    if (index === 0) {

        return "Today";

    }


    const date =
        new Date(
            dateString + "T12:00:00"
        );


    return date.toLocaleDateString(
        "en-US",
        {
            weekday: "short"
        }
    );

}


// ========================================
// 14. FORMAT TIME
// ========================================

function formatTime(
    dateString
) {

    const date =
        new Date(dateString);


    if (isNaN(date.getTime())) {

        return "--:--";

    }


    return date.toLocaleTimeString(
        "en-US",
        {
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        }
    );

}


// ========================================
// 15. DATE & TIME
// ========================================

function updateDateTime() {

    if (
        !currentWeatherData ||
        !currentWeatherData.timezone
    ) {

        return;

    }


    const now =
        new Date();


    const timeString =
        now.toLocaleTimeString(
            "en-US",
            {
                timeZone:
                    currentWeatherData.timezone,

                hour: "numeric",

                minute: "2-digit",

                second: "2-digit",

                hour12: true
            }
        );


    const dateString =
        now.toLocaleDateString(
            "en-US",
            {
                timeZone:
                    currentWeatherData.timezone,

                weekday: "long",

                year: "numeric",

                month: "long",

                day: "numeric"
            }
        );


    currentTime.textContent =
        timeString;


    currentDate.textContent =
        dateString;

}


// Update clock every second

setInterval(
    updateDateTime,
    1000
);


// ========================================
// 16. CURRENT LOCATION
// ========================================

locationButton.addEventListener(
    "click",
    function () {

        if (!navigator.geolocation) {

            showError(
                "Geolocation is not supported by your browser."
            );

            return;

        }


        showLoading();


        navigator.geolocation.getCurrentPosition(

            async function (position) {

                try {

                    const latitude =
                        position.coords.latitude;


                    const longitude =
                        position.coords.longitude;


                    console.log(
                        "Current Location:",
                        latitude,
                        longitude
                    );


                    const location =
                        await getLocationFromCoordinates(
                            latitude,
                            longitude
                        );


                    const weatherData =
                        await fetchWeather(
                            latitude,
                            longitude
                        );


                    const airData =
                        await fetchAirQuality(
                            latitude,
                            longitude
                        );


                    currentLocationData =
                        location;


                    currentWeatherData =
                        weatherData;


                    displayWeather(
                        location,
                        weatherData,
                        airData
                    );


                    cityInput.value =
                        location.name;


                } catch (error) {

                    console.error(
                        error
                    );


                    showError(
                        "Unable to get weather for your current location."
                    );

                }

            },


            function (error) {

                console.error(
                    "Geolocation Error:",
                    error
                );


                showError(
                    "Location access was denied. Please allow location permission."
                );

            }

        );

    }
);


// ========================================
// 17. REVERSE GEOCODING
// ========================================

async function getLocationFromCoordinates(
    latitude,
    longitude
) {

    const url =
        "https://geocoding-api.open-meteo.com/v1/reverse" +

        `?latitude=${latitude}` +

        `&longitude=${longitude}` +

        "&language=en";


    try {

        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "Location lookup failed."
            );

        }


        const data =
            await response.json();


        if (
            data.results &&
            data.results.length > 0
        ) {

            const location =
                data.results[0];


            return {

                name:
                    location.name ||
                    "Current Location",

                country:
                    location.country ||
                    "",

                latitude:
                    latitude,

                longitude:
                    longitude,

                timezone:
                    location.timezone ||
                    "auto"

            };

        }


    } catch (error) {

        console.warn(
            "Reverse geocoding failed:",
            error
        );

    }


    return {

        name: "Current Location",

        country: "",

        latitude: latitude,

        longitude: longitude,

        timezone: "auto"

    };

}


// ========================================
// 18. CELSIUS / FAHRENHEIT
// ========================================

unitToggle.addEventListener(
    "click",
    function () {

        if (currentUnit === "C") {

            currentUnit = "F";

            unitToggle.textContent =
                "°C";

            unitToggle.setAttribute(
                "aria-label",
                "Switch to Celsius"
            );

        } else {

            currentUnit = "C";

            unitToggle.textContent =
                "°F";

            unitToggle.setAttribute(
                "aria-label",
                "Switch to Fahrenheit"
            );

        }


        if (currentWeatherData) {

            refreshTemperatureDisplay();

        }

    }
);


// ========================================
// 19. REFRESH TEMPERATURES
// ========================================

function refreshTemperatureDisplay() {

    if (!currentWeatherData) {

        return;

    }


    const current =
        currentWeatherData.current;


    temperature.textContent =
        formatTemperature(
            current.temperature_2m
        );


    feelsLike.textContent =
        `Feels like ${formatTemperature(
            current.apparent_temperature
        )}`;


    displayHourlyForecast(
        currentWeatherData
    );


    displayFiveDayForecast(
        currentWeatherData
    );

}


// ========================================
// 20. DARK / LIGHT THEME
// ========================================

themeToggle.addEventListener(
    "click",
    function () {

        document.body.classList.toggle(
            "light-mode"
        );


        const isLight =
            document.body.classList.contains(
                "light-mode"
            );


        if (isLight) {

            themeToggle.textContent =
                "☀️";

            themeToggle.setAttribute(
                "aria-label",
                "Switch to dark mode"
            );

            themeToggle.setAttribute(
                "title",
                "Switch to dark mode"
            );

        } else {

            themeToggle.textContent =
                "🌙";

            themeToggle.setAttribute(
                "aria-label",
                "Switch to light mode"
            );

            themeToggle.setAttribute(
                "title",
                "Switch to light mode"
            );

        }

    }
);


// ========================================
// 21. APPLICATION STATES
// ========================================

function showLoading() {

    initialState.hidden = true;

    loadingState.hidden = false;

    errorState.hidden = true;

}


function showError(message) {

    initialState.hidden = true;

    loadingState.hidden = true;

    errorState.hidden = false;

    errorMessage.textContent =
        message;

}


function hideAllStates() {

    initialState.hidden = true;

    loadingState.hidden = true;

    errorState.hidden = true;

}


// ========================================
// 22. LOAD DEFAULT CITY
// ========================================

async function loadDefaultCity() {

    try {

        showLoading();


        const location =
            await getCoordinates(
                "New Delhi"
            );


        const weatherData =
            await fetchWeather(
                location.latitude,
                location.longitude
            );


        const airData =
            await fetchAirQuality(
                location.latitude,
                location.longitude
            );


        currentLocationData =
            location;


        currentWeatherData =
            weatherData;


        displayWeather(
            location,
            weatherData,
            airData
        );


        cityInput.value =
            location.name;


    } catch (error) {

        console.error(
            "Default City Error:",
            error
        );


        showError(
            "Unable to load default weather."
        );

    }

}


// ========================================
// 23. START APPLICATION
// ========================================
loadDefaultCity();