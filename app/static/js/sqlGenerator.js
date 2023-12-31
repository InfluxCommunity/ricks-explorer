export function generateSQLQuery(fields, tagKeys, tagValues, table) {
    const selectString = getSelectString(fields, tagKeys);
    const tagWheres = getTagWheres(tagValues);
    const timeClause = getTimeClause(tagWheres);
    const groupClause = getGroupClause();
    const query = assembleQuery(selectString, table, tagWheres, timeClause, groupClause);
    return query;
}

function getSelectString(fields, tagKeys) {
    let aggregator = $('#aggregationSelect').val();
    if ( aggregator == "none") {
        return unAggregatedSelect();
    }
    else {
        return aggregatedSelect();
    }
    
    function aggregatedSelect() {
        let bin = getDateBin();
        let q = `\t${bin} AS time,\n`;
        let f = fields.map(field => `${aggregator}("${field}") as ${field}`).join(", ");
        return q + "\t" + f;
    }

    function unAggregatedSelect() {
        let mergedFieldsAndTagKeys = fields.concat(tagKeys);
        let selectString = "*";
        if (mergedFieldsAndTagKeys.length > 0) {
            selectString = mergedFieldsAndTagKeys.join(", ") + ', "time"';
        }
        return selectString;
    }
}

function getDateBin(){
    let interval = $('#intervalSelect').val();
    return `date_bin(interval'${interval}', time, TIMESTAMP '1970-01-01 00:00:00Z')`;
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
function getGroupClause(){
    let aggregator = $('#aggregationSelect').val();
    let orderBy = `ORDER BY\n\t"time" desc`;
    if ( aggregator == "none") {
        return orderBy;
    } else {

        return `GROUP BY \n\t${getDateBin()}\n${orderBy}`;
    }
}
function assembleQuery(selectString, table, tagWheres, timeClause, groupClause) {
    return `SELECT
${selectString}
FROM
\t"${table}"
WHERE
${tagWheres}
${timeClause}
${groupClause}`
}