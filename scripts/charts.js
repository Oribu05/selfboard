export default function initCharts() {
    setupChart({
        inputId: 'csvInput',
        pathId: 'csvPath1',
        toggleId: 'togglePath1',
        canvasId: 'chartCanvas',
        placeholderId: 'chartPlaceholder',
        titleId: 'chartTitle1',
        storageKey: 'lastCSV',
        titleKey: 'lastTitle1',
        pathKey: 'lastPath1'
    });

    setupChart({
        inputId: 'csvInput2',
        pathId: 'csvPath2',
        toggleId: 'togglePath2',
        canvasId: 'chartCanvas2',
        placeholderId: 'chartPlaceholder2',
        titleId: 'chartTitle2',
        storageKey: 'lastCSV2',
        titleKey: 'lastTitle2',
        pathKey: 'lastPath2'
    });
}

function setupChart(config) {
    const { inputId, pathId, toggleId, canvasId, placeholderId, titleId, storageKey, titleKey, pathKey } = config;

    const csvInput = document.getElementById(inputId);
    const pathInput = document.getElementById(pathId);
    const toggleBtn = document.getElementById(toggleId);
    const canvas = document.getElementById(canvasId);
    const placeholder = document.getElementById(placeholderId);
    const titleEl = document.getElementById(titleId);
    const ctx = canvas.getContext('2d');
    let chartInstance = null;
    let lastFetchedData = '';

    const savedTitle = localStorage.getItem(titleKey);
    if (savedTitle) titleEl.textContent = savedTitle;
    titleEl.addEventListener('input', () => localStorage.setItem(titleKey, titleEl.textContent));


    toggleBtn.addEventListener('click', () => {
        pathInput.classList.toggle('hidden');
    });


    pathInput.addEventListener('change', async () => {
        const path = pathInput.value.trim();
        if (path) {
            localStorage.setItem(pathKey, path);
            await fetchLiveData(path);
        }
    });

    const savedPath = localStorage.getItem(pathKey);
    if (savedPath) {
        pathInput.value = savedPath;
        fetchLiveData(savedPath);
    } else {
        const savedCSV = localStorage.getItem(storageKey);
        if (savedCSV) {
            showChart();
            const data = parseCSV(savedCSV);
            chartInstance = updateChart(ctx, data, chartInstance);
        }
    }

    csvInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const fileName = file.name;
        pathInput.value = fileName;
        localStorage.setItem(pathKey, fileName);

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            localStorage.setItem(storageKey, text);
            showChart();
            const data = parseCSV(text);
            chartInstance = updateChart(ctx, data, chartInstance);

            fetchLiveData(fileName);
        };
        reader.readAsText(file);
    });

    async function fetchLiveData(path) {
        try {
            const response = await fetch(path);
            if (!response.ok) throw new Error('File not found');
            const text = await response.text();

            if (text !== lastFetchedData) {
                lastFetchedData = text;
                showChart();
                const data = parseCSV(text);
                chartInstance = updateChart(ctx, data, chartInstance);
            }
        } catch (err) {
            console.error('Error fetching CSV:', err);
        }
    }

    setInterval(() => {
        const currentPath = pathInput.value.trim();
        if (currentPath) {
            fetchLiveData(currentPath);
        }
    }, 3000);

    function showChart() {
        placeholder.classList.add('hidden');
        canvas.classList.remove('hidden');
    }
}

function parseCSV(text) {
    const lines = text.trim().split('\n');
    if (lines.length === 0) return { labels: [], values: [], header: '' };

    const firstLine = lines[0];
    const separator = firstLine.includes(';') ? ';' : ',';

    const headers = firstLine.split(separator).map(h => h.trim());
    const data = lines.slice(1).map(line => {
        const values = line.split(separator).map(v => v.trim());
        return {
            label: values[0],
            value: parseFloat(values[1]) || 0
        };
    });

    return {
        labels: data.map(d => d.label),
        values: data.map(d => d.value),
        header: headers[1] || 'Value'
    };
}

function updateChart(ctx, { labels, values, header }, existingInstance) {
    if (existingInstance) {
        existingInstance.destroy();
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.5)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: header,
                data: values,
                borderColor: '#3b82f6',
                borderWidth: 3,
                backgroundColor: gradient,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#3b82f6',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.1)', drawBorder: false },
                    ticks: { color: 'rgba(255, 255, 255, 0.6)', font: { family: 'Inter, sans-serif' } }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: 'rgba(255, 255, 255, 0.6)', font: { family: 'Inter, sans-serif' } }
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart'
            }
        }
    });
}