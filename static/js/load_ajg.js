/* load_ajg.js */

$(document).ready(function() {
    function italicize(text, findString) {
        // Check if either text or findString is null or undefined
        if (!text || !findString || typeof text !== 'string') {
            return text || ""; // Return the original text (or an empty string if text is also null)
        }
      
        // Escape special characters in findString for use in a regular expression
        const escapedFindString = findString.replace(/[-/\\^$*+?.()|[]{}]/g, '\\$&');
      
        // Construct a regular expression to find the findString (case-insensitive and global)
        const regex = new RegExp(escapedFindString, 'gi');
      
        // Replace all occurrences of findString with <i>findString</i>
        return text.replace(regex, "<em>$&</em>");
    }
      
    // Load the Excel file
    fetch('/static/xlsx/ajg2024.xlsx')
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
                // Process each cell
                const processedRow = row.map((cell, index) => {
                    // Replace 0 with dash
                    if (cell === 0) return '—';
                    // Format last four columns as percentage, but skip the last column
                    if (index >= expectedColumns - 6 && index < expectedColumns - 3 && typeof cell === 'number') {
                        return (cell * 100).toFixed(0) + '%'; // Convert to percentage
                    }
                    // Format last column to 3 decimal places
                    if (index === expectedColumns - 3 && typeof cell === 'number') {
                        return cell.toFixed(3);
                    }
                    // Replace empty cells with a dash
                    return (cell === "" || cell === undefined) ? '—' : italicize(cell, "et al.");
                });

                // Check if the row length matches expected columns
                if (processedRow.length === expectedColumns) {
                    const tr = $('<tr></tr>').addClass('ajgTableRow'); // Add ajgTableRow class
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
                "searching": true,
                "pageLength": 50, // Default entries to show
                "lengthMenu": [
                    [50, 100, 500, -1], 
                    [50, 100, 500, "All"] // Display entries options with "All" for -1
                ],            });
        })
        .catch(error => {
            console.error('Error loading the Excel file:', error);
            alert('Error loading the Excel file: ' + error.message);
        });
});

