import { currentDatabase } from './treeview.js';
import { generateDatasets, renderGraph } from './graphRenderer.js';

let valueArrays = {};
let times = [];

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

export function toggleView() {
    let view = $('#visualizationSelect').val();
    if(view == "graph"){
        $('#graphDiv').show();
        $('#tableDiv').hide();
        if(valueArrays != {}) {
            const datasets = generateDatasets(valueArrays);
            renderGraph(times, datasets); 
        }
    } else {
        $('#graphDiv').hide();
        $('#tableDiv').show();
    }
}
function handleResponse(response) {
    const data = JSON.parse(response);
    times = data.map(item => new Date(item.time));
    valueArrays = extractValueArrays(data);
    if ($('#visualizationSelect').val() == "graph") {
        const datasets = generateDatasets(valueArrays);
        renderGraph(times, datasets);
    } else {
        console.log("make a table")
    }
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

