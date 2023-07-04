export function generateInfluxQLQuery(fields, tagKeys, tagValues, table) {
    const selectString = getSelectString(fields, tagKeys);
    const tagWheres = getTagWheres(tagValues);
    const timeClause = getTimeClause(tagWheres);
    const groupClause = getGroupClause();
    const query = assembleQuery(selectString, tagWheres, timeClause, groupClause, table);
    return query;
}

function getSelectString(fields, tagKeys) {
    let aggregator = $('#aggregationSelect').val();
    if (aggregator == "none") {
        return unAggregatedSelect();
    }
    else {
        return aggregatedSelect();
    }
    function unAggregatedSelect() {
        let mergedFieldsAndTagKeys = fields.concat(tagKeys);
        let selectString = "*";
        if (mergedFieldsAndTagKeys.length > 0) {
            selectString = mergedFieldsAndTagKeys.join(", ");
        }
        return selectString;
    }
    function aggregatedSelect() {
        let f = fields.map(field => `${aggregator}("${field}") as "${field}"`).join(",\n\t");
        return f;
    }
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
            .map(([key, values]) => `"${key}" =~ /${values.join("'|'")}/`)
            .join("\nAND \n\t");
    }
    return tagWheres;
}

function getTimeClause(tagWheres) {
    let timeClause = "";

    let interval = $("#durationSelect option:selected").text();
    timeClause += `time > now() - ${interval}`;

    if (tagWheres !== "") {
        timeClause = "AND\n\t" + timeClause;
    }

    return timeClause;
}

function getGroupClause(){
    let aggregator = $('#aggregationSelect').val();
    if ( aggregator == "none") {
        return "";
    } else {
        let interval = $('#intervalSelect option:selected').text();
        return `GROUP BY\n\ttime(${interval})`;
    }
}

function assembleQuery(selectString,  tagWheres, timeClause,  groupClause, table) {
    let whereClause = tagWheres;
    if (whereClause !== "" && timeClause !== "") {
        whereClause += "\n";
    }
    whereClause += timeClause;

    return `SELECT
    ${selectString}
FROM
    "${table}"
WHERE
    ${whereClause}
${groupClause}`

}