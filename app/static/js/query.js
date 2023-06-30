import { currentDatabase } from './treeview.js';

export var selectColmns = []
export var whereColumnConditions = [{}]
export var whereTimeConditions = [{}]
export var database = ""
export var table = "*"


export function runQuery(){
    var query = editor.getValue();
    var language = document.getElementById('languageSelect').value;
    $.ajax({
        url: '/api/query',  // URL of your Flask route
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({query: query, language: language, database: currentDatabase}),
        success: function(response) {
            console.log(response);
            // TODO: Handle the response data here
        },
        error: function(error) {
            console.log(error);
        }
    });   
}

export function buildQuery() {
    console.log("let's build this query!")
    // var language = document.getElementById("languageSelect").value;
    // var selected_nodes = $('#treeView').jstree('get_selected', true);
    // if (selected_nodes.length == 0) { return false; }
    // table = selected_nodes[0].original.table;
    // var selected_columns = selected_nodes
    //     .filter(function (node) {
    //         return node.original.type === 'column';
    //     })
    //     .map(function (node) {
    //         return node.text;
    //     })
    //     .join(', ');
    // query = "";
    // if (language == "sql") {
    //     var interval = document.getElementById("durationSelect").value;
    //     var query = `SELECT\n\t${selected_columns}\nFROM\n\t${table}\nWHERE\n\ttime > now() - interval '${interval}'`;
    // }
    // else if (language == "influxql") {
    //     interval = $("#durationSelect option:selected").text();
    //     var query = `SELECT\n\t${selected_columns}\nFROM\n\t${table}\nWHERE\n\ttime > now() - ${interval}`;
    // }
    // editor.setValue("");
    // editor.setValue(query);
}