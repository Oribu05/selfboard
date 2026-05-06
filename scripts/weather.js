async function getCity(lat, lon) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=es`;
    const res = await fetch(url);
    const data = await res.json();

    return data.address.city || data.address.town || data.address.village || "Ubicación Desconocida";
}

async function getWeather(lat, lon) {
    // Añadimos parámetros para sensación térmica, humedad, índice UV y temperaturas extremas
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day&daily=temperature_2m_max,temperature_2m_min,uv_index_max&timezone=auto`;

    const res = await fetch(url);
    const data = await res.json();

    return data;
}

function getWeatherText(code) {
    if (code === 0) return "Clear Sky ☀️";
    if (code <= 3) return "Partly Cloudy ⛅";
    if (code <= 48) return "Fog 🌫️";
    if (code <= 67) return "Light Rain 🌧️";
    if (code <= 77) return "Snow ❄️";
    if (code <= 82) return "Showers 🌦️";
    if (code <= 99) return "Thunderstorm ⚡";
    return "Unknown";
}

function startClock() {
    function update() {
        const el = document.getElementById("card-time");
        if (!el) return;
        const now = new Date();
        el.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    update();
    setInterval(update, 1000);
}

async function localWeather() {
    navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        const [city, data] = await Promise.all([
            getCity(lat, lon),
            getWeather(lat, lon)
        ]);

        const current = data.current;
        const daily = data.daily;
        const text = getWeatherText(current.weather_code);

        document.getElementById("weather").innerHTML = `
            <div class="h-full bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20 rounded-3xl p-5 flex flex-col justify-between text-white font-sans">
                
                <div class="flex justify-between items-start">
                    <div class="flex flex-col">
                        <span class="text-sm font-medium">📍 ${city}</span>
                    </div>
                    <span id="card-time" class="bg-white/10 px-2 py-1 rounded-md text-xs font-mono"></span>
                </div>

                <div class="my-4">
                    <div class="flex items-baseline gap-1">
                        <span class="text-6xl font-bold tracking-tighter">${Math.round(current.temperature_2m)}°</span>
                        <span class="text-xl font-light text-white/60">C</span>
                    </div>
                    <div class="text-lg font-medium text-white/90 flex items-center gap-2">
                        ${text}
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
                    <div class="flex flex-col">
                        <span class="text-[10px] uppercase text-white/40 font-bold">Feels like</span>
                        <span class="text-sm">${Math.round(current.apparent_temperature)}°C</span>
                    </div>
                    <div class="flex flex-col">
                        <span class="text-[10px] uppercase text-white/40 font-bold">Humidity</span>
                        <span class="text-sm">${current.relative_humidity_2m}%</span>
                    </div>
                    <div class="flex flex-col">
                        <span class="text-[10px] uppercase text-white/40 font-bold">Wind</span>
                        <span class="text-sm">${current.wind_speed_10m} <small>km/h</small></span>
                    </div>
                    <div class="flex flex-col">
                        <span class="text-[10px] uppercase text-white/40 font-bold">UV Index</span>
                        <span class="text-sm">${daily.uv_index_max[0]}</span>
                    </div>
                </div>

                <div class="mt-4 flex justify-between items-center bg-black/20 rounded-xl px-3 py-2 text-xs">
                    <span class="text-blue-300">Min: ${Math.round(daily.temperature_2m_min[0])}°</span>
                    <div class="h-1 w-12 bg-gradient-to-r from-blue-400 to-orange-400 rounded-full"></div>
                    <span class="text-orange-300">Max: ${Math.round(daily.temperature_2m_max[0])}°</span>
                </div>

            </div>`;

        startClock();
    }, (error) => {
        document.getElementById("weather").textContent = "Error al obtener ubicación";
        console.error(error);
    });
}

export default localWeather;