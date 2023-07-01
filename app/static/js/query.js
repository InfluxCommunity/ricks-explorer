import { currentDatabase } from './treeview.js';

export function runQuery() {
    var query = editor.getValue();
    var language = document.getElementById('languageSelect').value;

    $.ajax({
        url: '/api/query',  // URL of your Flask route
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ query: query, language: language, database: currentDatabase }),
        success: function (response) {
            var data = JSON.parse(response);
            var times = [];
            var valueArrays = {};

            // Populate the times and valueArrays
            for (var i = 0; i < data.length; i++) {
                times.push(new Date(data[i].time));
                for (var key in data[i]) {
                    if (key !== "time") {
                        if (!(key in valueArrays)) {
                            valueArrays[key] = [];
                        }
                        valueArrays[key].push(data[i][key]);
                    }
                }
            }

            var datasets = [];
            for (var key in valueArrays) {
                datasets.push({
                    label: key,
                    data: valueArrays[key],
                    fill: false,
                    borderColor: '#' + Math.floor(Math.random() * 16777215).toString(16),  // Generate a random color
                    tension: 0.1
                });
            }

            if (window.myChart instanceof Chart) {
                window.myChart.destroy();
            }
            var ctx = document.getElementById('lineChart').getContext('2d');
            window.myChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: times,
                    datasets: datasets
                },
                options: {
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                unit: 'day'
                            },
                            display: true,
                            title: {
                                display: true,
                                text: 'Time'
                            }
                        },
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        },
        error: function (error) {
            console.log(error);
        }
    });
}

export function buildQuery() {
    console.log("Building Query");
    var fields = [];
    var tagKeys = [];
    var tagValues = [];
    var tag_node_selected = false;
    var field_node_selected = false;

    var selected_nodes = $('#treeview').jstree('get_selected', true);
    if (selected_nodes.length == 0) { return false; }
    selected_nodes.forEach(function(node) {
        var type = node.original.type;
        console.log(type);
        switch (type) {
            case 'tag_node':
                tag_node_selected = true;
                break;
            case 'tag_key':
                tagKeys.push(node.original.text);
                break;
            case 'tag_value':
                tagValues.push({[node.original.key]:node.original.text});
                break;
            case 'field_node':
                field_node_selected = true;
                break;
            case 'field':
                fields.push(node.original.text);
                break;
            default:
                // Code to be executed if nodeType is different from all cases
                console.log('Node type is different from all cases');
        }
        var mergedFieldsAndTagKeys = fields.concat(tagKeys);
        var selectVals = "*";
        if(mergedFieldsAndTagKeys.length > 0){
            selectVals = mergedFieldsAndTagKeys.join(", ")
        }
        var tagWheres = {};
        if(tagValues.length > 0){
            let tagWheres = tagValues.reduce((acc, obj) => {
                let key = Object.keys(obj)[0];
                let value = obj[key];
              
                if (!acc[key]) {
                  acc[key] = [];
                }
              
                acc[key].push(value);
                
                return acc;
              }, {});
        console.log(mergedFieldsAndTagKeys);
        console.log(tagWheres);
              
        }

    });
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