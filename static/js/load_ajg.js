/* load_ajg.js */

$(document).ready(function() {
    // Load the Excel file
    fetch('/static/xlsx/cabs_ajg_2024.xlsx')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.arrayBuffer();
        })
        .then(data => {
            const workbook = XLSX.read(data, {type: 'array'});
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json(worksheet, {header: 1});

            // Check if there's valid data
            if (json.length < 2) {
                throw new Error('The Excel file is empty or not formatted correctly.');
            }

            // Clear previous data
            $('#tableBody').empty();

            // Skip the first header row and get the expected number of columns
            const expectedColumns = json[0].length;

            // Populate table with valid data
            json.slice(1).forEach(row => { // Skip the first row
                // Replace empty cells with a dash and ensure row length matches expected columns
                const processedRow = row.map(cell => (cell === "" || cell === undefined) ? '-' : cell);

                // Check if the row length matches expected columns
                if (processedRow.length === expectedColumns) {
                    const tr = $('<tr></tr>');
                    processedRow.forEach(cell => {
                        tr.append($('<td></td>').text(cell)); // Append the processed cell
                    });
                    $('#tableBody').append(tr);
                }
            });

            // Initialize DataTable
            $('#journalTable').DataTable().destroy(); // Destroy if already initialized
            $('#journalTable').show();
            $('#journalTable').DataTable({
                "paging": true,
                "searching": true
            });
        })
        .catch(error => {
            console.error('Error loading the Excel file:', error);
            alert('Error loading the Excel file: ' + error.message);
        });
});