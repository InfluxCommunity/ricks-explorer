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