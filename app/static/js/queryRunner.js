import { currentDatabase } from './treeview.js';

export function runQuery() {
    const query = editor.getValue();
    const language = document.getElementById('languageSelect').value;
    const requestData = JSON.stringify({ query, language, database: currentDatabase });

    $.ajax({
        url: '/api/query',  
        type: 'POST',
        contentType: 'application/json',
        data: requestData,
        success: handleResponse,
        error: handleError
    });
}

function handleResponse(response) {
    const data = JSON.parse(response);
    const times = data.map(item => new Date(item.time));
    const valueArrays = extractValueArrays(data);
    const datasets = generateDatasets(valueArrays);

    renderChart(times, datasets);
}

function handleError(error) {
    console.log(error);
}

// Extract value arrays from the data
function extractValueArrays(data) {
    let valueArrays = {};

    for (let item of data) {
        for (let key in item) {
            if (key !== "time") {
                if (!(key in valueArrays)) {
                    valueArrays[key] = [];
                }
                valueArrays[key].push(item[key]);
            }
        }
    }

    return valueArrays;
}

// Generate datasets from value arrays
function generateDatasets(valueArrays) {
    let datasets = [];

    for (let key in valueArrays) {
        datasets.push({
            label: key,
            data: valueArrays[key],
            fill: false,
            borderColor: '#' + Math.floor(Math.random() * 16777215).toString(16),
            tension: 0.1
        });
    }

    return datasets;
}

// Render chart using the provided times and datasets
function renderChart(times, datasets) {
    if (window.myChart instanceof Chart) {
        window.myChart.destroy();
    }
    
    const ctx = document.getElementById('lineChart').getContext('2d');
    window.myChart = new Chart(ctx, {
        type: 'line',
        data: { labels: times, datasets },
        options: getChartOptions()
    });
}

// Get options for the chart
function getChartOptions() {
    return {
        scales: {
            x: {
                type: 'time',
                time: { unit: 'minute' },
                display: true,
                title: { display: true, text: 'Time' }
            },
            y: { beginAtZero: true }
        }
    }
}