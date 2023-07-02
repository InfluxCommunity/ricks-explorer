export function renderTable(data) {
        if ($.fn.DataTable.isDataTable('#myTable')) {
            $('#myTable').DataTable().destroy();
        }
        $('#myTable').empty(); 
        let columns = Object.keys(data[0]).map(key => {
            if (key === 'time') {
                return {
                    data: key,
                    title: key,
                    render: function(data, type, row) {
                        // Create a new Date object from the timestamp
                        let date = new Date(data);
                        // Return the formatted date string
                        return date.toLocaleString();
                    }
                };
            }
            return {
                data: key,
                title: key
            };
        });
        $('#myTable').DataTable({
            data: data,
            columns: columns,
            paging: true,
            searching: true,
            ordering: true,
            info: true,
            autoWidth: false,
        });
}
