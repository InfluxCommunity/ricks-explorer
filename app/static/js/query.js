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
    var fields = [];
    var tagKeys = [];
    var tagValues = [];
    var table = "";
    var selected_nodes = $('#treeview').jstree('get_selected', true);
    if (selected_nodes.length == 0) { return false; }
    selected_nodes.forEach(function (node) {
        var type = node.original.type;
        switch (type) {
            case 'tag_node':
                tag_node_selected = true;
                table = node.original.table;
                break;
            case 'tag_key':
                tagKeys.push(node.original.text);
                table = node.original.table;
                break;
            case 'tag_value':
                tagValues.push({ [node.original.key]: node.original.text });
                table = node.original.table;
                break;
            case 'field_node':
                field_node_selected = true;
                table = node.original.table;
                break;
            case 'field':
                fields.push(node.original.text);
                table = node.original.table;
                break;
            case 'table':
                table = node.original.table;
                break;
        }
        var mergedFieldsAndTagKeys = fields.concat(tagKeys);
        var selectVals = "*";
        if (mergedFieldsAndTagKeys.length > 0) {
            selectVals = mergedFieldsAndTagKeys.join(", ") + ', "time"'
        }
        var tagWheres = "";
        if (tagValues.length > 0) {
            let tagsObj = tagValues.reduce((acc, obj) => {
                let key = Object.keys(obj)[0];
                let value = obj[key];

                if (!acc[key]) {
                    acc[key] = [];
                }

                acc[key].push(value);

                return acc;
            }, {});
            tagWheres = Object.entries(tagsObj)
                .map(([key, values]) => `"${key}" in ('${values.join("','")}')`)
                .join("\nAND \n\t");
        }
        var q = `SELECT
    ${selectVals}
FROM
    "${table}"
WHERE
    ${tagWheres}`;

        var timeClause = "";
        if (tagWheres != "") {
            timeClause += "\nAND\n";
        }
        var interval = document.getElementById("durationSelect").value;
        timeClause += `\t"time" > now() - interval '${interval}'`
        q += timeClause;
        q += `\nORDER BY \n\t "time" desc`
        editor.setValue(q);
    });
}