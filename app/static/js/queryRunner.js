import { currentDatabase } from './treeview.js';
import { renderGraph } from './graphRenderer.js';
import {renderTable} from './tableRenderer.js';

let data = [];

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
        if(data.length > 0) {
            renderGraph(data);
        }
    } else {
        $('#graphDiv').hide();
        $('#tableDiv').show();
        if(data.length > 0){
            renderTable(data);}
    }
}

function handleResponse(response) {
    data = JSON.parse(response);

    if ($('#visualizationSelect').val() == "graph") {
        renderGraph(data);
    } else {
        renderTable(data);
    }
}

function handleError(error) {
    console.log(error);
}



