/* load_tc.js */

async function loadMarkdown() {
    try {
        const markdownFilePath = `${basePath}/data.md`; // Use basePath to construct the path
        const response = await fetch(markdownFilePath);
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        
        const text = await response.text();
        const lines = text.split('\n');

        // Extract title (first line)
        const title = lines[0].replace(/^#\s*/, '');
        document.getElementById('pageTitle').innerHTML = title;

        // Extract introduction (lines between title and citation)
        const introductionStart = 1; // Start after title
        const citationStart = lines.findIndex(line => line.startsWith('## citation'));

        // Get introduction content
        let introductionContent = lines.slice(introductionStart, citationStart !== -1 ? citationStart : undefined).join('\n').trim();
        document.getElementById('introduction').innerHTML = introductionContent;

        // Extract citation content
        if (citationStart !== -1) {
            const citationContent = lines.slice(citationStart + 1).join('\n').trim();
            document.getElementById('citations').innerHTML = citationContent;
        } else {
            document.getElementById('citations').innerHTML = ''; // No citations found
        }

    } catch (error) {
        console.error('Error loading the Markdown file:', error);
        alert('Error loading the Markdown file: ' + error.message);
    }
}

async function loadExcel() {
    try {
        const excelFilePath = `${basePath}/data.xlsx`;
        const response = await fetch(excelFilePath);
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }

        const data = await response.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });

        if (!workbook.SheetNames.length) {
            throw new Error('No sheets found in the Excel file.');
        }

        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Check if jsonData is defined and has at least 3 rows
        if (!Array.isArray(jsonData) || jsonData.length < 3) {
            throw new Error('The Excel file does not contain enough data or is not valid.');
        }

        // Clear previous data
        $('#dataTable').empty();

        // Extract headers and column widths
        const headers = jsonData[0];
        const columnWidths = jsonData[1];

        // Check if headers and columnWidths are defined
        if (!headers || !columnWidths || headers.length !== columnWidths.length) {
            throw new Error('Invalid header or width data in the Excel file.');
        }

        // Populate table with headers
        const thead = $('<thead></thead>');
        const headerRow = $('<tr></tr>');
        headers.forEach((header, index) => {
            const th = $('<th></th>').text(header);
            
            // Check if columnWidths[index] is a valid number
            if (typeof columnWidths[index] === 'number' && !isNaN(columnWidths[index])) {
                th.css('width', columnWidths[index] + 'vw'); // Apply width if valid
            }
            headerRow.append(th);
        });
        thead.append(headerRow);
        $('#dataTable').append(thead);

        // Populate table with data
        const tbody = $('<tbody></tbody>');
        jsonData.slice(2).forEach(row => { // Skip header and width rows
            const tr = $('<tr></tr>').addClass('dataTableRow');
            row.forEach(cell => {
                // Check if the cell is empty or not
                if (cell === null || cell === undefined || cell === '') {
                    tr.append($('<td></td>')); // Append an empty cell
                } else {
                    tr.append($('<td></td>').text(cell)); // Append cell content
                }
            });
            tbody.append(tr);
        });
        $('#dataTable').append(tbody);

        // Initialize DataTable
        $('#dataTable').DataTable({
            paging: true,
            searching: true,
            pageLength: 50,
            lengthMenu: [
                [25, 50, 100, -1],
                [25, 50, 100, "All"]
            ]
        });

    } catch (error) {
        console.error('Error loading the Excel file:', error);
        alert('Error loading the Excel file: ' + error.message);
    }
}

async function init() {
    await loadMarkdown();
    await loadExcel();
}

document.addEventListener('DOMContentLoaded', init);