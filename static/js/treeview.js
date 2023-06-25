export function initializeTreeview() {
    $('#treeview').jstree({
        'core': {
            'data': fetchDatabaseList(),
            'check_callback': true,  // This is needed to allow adding new nodes dynamically
        }
    }).on('select_node.jstree', function (e, data) {
        var node = data.node;
        var type = node.original.type;
        if (node.a_attr && node.a_attr.class === 'disabled') {
            return false;
        }
        if (type == 'database' && node.children.length === 0) {
            populate_children('/api/get-tables/', node);
        }
        if (type == 'table' && node.children.length === 0) {
            populate_table('/api/get-columns/' + node.original.database + "/", node);
        }
        if (type == 'tag_key' && node.children.length === 0) {
            populate_children(`api/get-tag-values/${node.original.database}/${node.original.table}/`,
                node)
        }
    });

    function populate_table(end_point, node) {
        fetch(end_point + node.text)
            .then(response => response.json())
            .then(objects => {
                populateTagKyes(node, objects);
                populateFields(node, objects);
            })
            .catch(error => console.error('Error:', error));
    }
    function populate_children(end_point, node) {
        fetch(end_point + node.text)
            .then(response => response.json())
            .then(children => {
                // Add each table as a child node to the database node
                children.forEach(child => {
                    $('#treeview').jstree().create_node(node, child, "last");
                });
                $('#treeview').jstree('open_node', node);
            })
            .catch(error => console.error('Error:', error));
    }
    $(function () {
        $("#treeviewWrapper").resizable({
            handles: 'e',
            maxWidth: 600,
            minWidth: 200,
            resize: function (event, ui) {
                $("#treeview").width(ui.size.width);
            }
        });
    });
}

function populateFields(node, objects) {
    var field_node = $('#treeview').jstree().create_node(node, {
        'text': 'Fields',
        'type': 'field_node'
    }, "last");
    objects['fields'].forEach(field => {
        $('#treeview').jstree().create_node(field_node, field, "last");
    });
    $('#treeview').jstree('open_node', field_node);
}

function populateTagKyes(node, objects) {
    var tag_node = $('#treeview').jstree().create_node(node, {
        'text': 'Tags',
        'type': 'tag_node'
    }, "last");
    objects['tags'].forEach(tag => {
        $('#treeview').jstree().create_node(tag_node, tag, "last");
    });
    $('#treeview').jstree('open_node', tag_node);
}

function fetchDatabaseList() {
    return function (node, cb) {
        if (node.id === "#") {
            // This is the root node, load the databases
            fetch('/api/get-databases')
                .then(response => response.json())
                .then(data => cb(data))
                .catch(error => console.error('Error:', error));
        }
    };
}
