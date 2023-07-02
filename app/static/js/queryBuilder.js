export function buildQuery() {
    const selectedNodes = getSelectedNodes();

    if (!selectedNodes.length) return false;

    const { fields, tagKeys, tagValues, table } = getQueryComponents(selectedNodes);

    const selectVals = getSelectString(fields, tagKeys);
    const tagWheres = getTagWheres(tagValues);
    const timeClause = getTimeClause(tagWheres);
    const query = generateQuery(selectVals, table, tagWheres, timeClause);

    editor.setValue(query);
}


function getSelectedNodes() {
    return $('#treeview').jstree('get_selected', true);
}

function getQueryComponents(selectedNodes) {
    let fields = [];
    let tagKeys = [];
    let tagValues = [];
    let table = "";
    selectedNodes.forEach(node => {
        switch (node.original.type) {
            case 'tag_key':
                tagKeys.push(node.original.text);
                table = node.original.table;
                break;
            case 'tag_value':
                tagValues.push({ [node.original.key]: node.original.text });
                table = node.original.table;
                break;
            case 'field':
                fields.push(node.original.text);
                table = node.original.table;
                break;
            case 'table':
                table = node.original.table;
                break;
            default:
                break;
        }
    });

    return { fields, tagKeys, tagValues, table };
}

function getSelectString(fields, tagKeys) {
    let mergedFieldsAndTagKeys = fields.concat(tagKeys);
    let selectVals = "*";

    if (mergedFieldsAndTagKeys.length > 0) {
        selectVals = mergedFieldsAndTagKeys.join(", ") + ', "time"';
    }

    return selectVals;
}

function getTagWheres(tagValues) {
    let tagWheres = "";

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

    return tagWheres;
}

function getTimeClause(tagWheres) {
    let timeClause = "";

    if (tagWheres != "") {
        timeClause += "\nAND\n";
    }

    let interval = document.getElementById("durationSelect").value;
    timeClause += `\t"time" > now() - interval '${interval}'`;

    return timeClause;
}

function generateQuery(selectVals, table, tagWheres, timeClause) {
    return `SELECT
${selectVals}
FROM
"${table}"
WHERE
${tagWheres}
${timeClause}
ORDER BY 
"time" desc`;
}




