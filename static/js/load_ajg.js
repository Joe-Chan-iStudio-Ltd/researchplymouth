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

            // Get the expected number of columns from the first row
            const expectedColumns = json[0].length;

            // Populate table with valid data
            json.forEach((row, index) => {
                // Check if the row length matches expected columns
                if (row.length === expectedColumns && row.some(cell => cell !== "" && index < 1800)) {
                    const tr = $('<tr></tr>');
                    row.forEach(cell => {
                        tr.append($('<td></td>').text(cell || '')); // Handle undefined cells
                    });
                    $('#tableBody').append(tr);
                    console.log(index, tr);
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
