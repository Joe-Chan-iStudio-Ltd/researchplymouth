/* load_ajg.js */

$(document).ready(function() {
    // Load the Excel file
    fetch('cabs_ajg_2024.xlsx')
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

            if (json.length === 0) {
                throw new Error('The Excel file is empty or not formatted correctly.');
            }

            // Clear previous data
            $('#tableBody').empty();

            // Populate table with data
            json.forEach((row, index) => {
                if (index > 0) { // Skip header row
                    const tr = $('<tr></tr>');
                    row.forEach(cell => {
                        tr.append($('<td></td>').text(cell || '')); // Handle undefined cells
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