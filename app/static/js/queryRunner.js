import { currentDatabase } from './treeview.js';
import { generateDatasets, renderChart } from './graphRenderer.js';

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

