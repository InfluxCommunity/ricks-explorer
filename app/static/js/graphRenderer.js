// Generate datasets from value arrays
export function generateDatasets(valueArrays) {
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
export function renderChart(times, datasets) {
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