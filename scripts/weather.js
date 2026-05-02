async function getCity(lat, lon) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=es`;

    const res = await fetch(url);
    const data = await res.json();

    return data.address.city ||
        data.address.town ||
        data.address.village ||
        "Unknown Location";
}

async function getWeather(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;

    const res = await fetch(url);
    const data = await res.json();

    return data.current_weather;
}

function getWeatherText(code) {
    if (code === 0) return "Mostly Sunny ☀️";
    if (code <= 3) return "Partly Cloudy ⛅";
    if (code <= 48) return "Fog 🌫️";
    if (code <= 67) return "Rain 🌧️";
    if (code <= 77) return "Snow ❄️";
    if (code <= 82) return "Showers 🌦️";
    return "Desconocido";
}

function startClock() {
    function update() {
        const el = document.getElementById("card-time");
        if (!el) return;

        const now = new Date();
        el.textContent = now.toLocaleTimeString();
    }

    update();
    setInterval(update, 1000);
}

async function localWeather() {
    navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        const [city, weather] = await Promise.all([
            getCity(lat, lon),
            getWeather(lat, lon)
        ]);

        const text = getWeatherText(weather.weathercode);

        document.getElementById("weather").innerHTML = `
<div class="h-full 
            bg-white/5 
            backdrop-blur-xl 
            border border-white/10 
            shadow-lg shadow-black/20
            rounded-2xl 
            p-6 flex flex-col justify-between">
    
    <div class="flex justify-between text-sm text-white/70">
        <span>📍 ${city}</span>
        <span id="card-time"></span>
    </div>

    <div class="text-5xl font-bold text-white">
        ${weather.temperature}°C
    </div>

    <div class="text-lg text-white/80">
        ${text}
    </div>

    <div class="flex justify-between text-sm text-white/70 pt-2 border-t border-white/10">
        <span>💨 ${weather.windspeed} km/h</span>
        <span>Now</span>
    </div>

</div>
`;

        startClock();
    }, (error) => {
        document.getElementById("weather").textContent =
            "Cant get location";
        console.error(error);
    });
}

export default localWeather;