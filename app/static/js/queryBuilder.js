import { generateSQLQuery } from './sqlGenerator.js';
import { generateInfluxQLQuery } from './influxqlGenerator.js';

export function buildQuery() {
    if ($('#editModeSelect').val() != "builder") {
        return;
    }
    const selectedNodes = getSelectedNodes();

    if (!selectedNodes.length) return false;
    const { fields, tagKeys, tagValues, table } = getQueryComponents(selectedNodes);

    if($('#languageSelect').val() == "sql") {
    const query = generateSQLQuery(fields, tagKeys, tagValues, table);
    editor.setValue(query); }
    else {
        const query = generateInfluxQLQuery(fields, tagKeys, tagValues, table);
        editor.setValue(query);
    }
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





