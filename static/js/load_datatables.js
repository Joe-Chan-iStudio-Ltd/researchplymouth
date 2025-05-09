/* load_datatable.js */

let dataTable; // Declare dataTable in a wider scope

// --- Helper Functions ---
function showStatus(message, isError = false) {
    const statusDiv = document.getElementById('uploadStatus');
    statusDiv.textContent = message;
    statusDiv.className = isError ? 'error' : 'success'; // Add classes for styling (optional)
}

async function loadMarkdown() {
    try {
        const markdownFilePath = `${basePath}/data.md`;
        const response = await fetch(markdownFilePath);

        if (!response.ok) {
            throw new Error(`Failed to load Markdown: ${response.status} ${response.statusText}`);
        }

        const text = await response.text();
        const lines = text.split('\n');

        const title = lines[0].replace(/^#\s*/, '');
        document.getElementById('pageTitle').innerHTML = title;

        const introductionStart = 1;
        const citationStart = lines.findIndex(line => line.startsWith('## citation'));

        const introductionContent = lines.slice(introductionStart, citationStart !== -1 ? citationStart : undefined).join('\n').trim();
        document.getElementById('introduction').innerHTML = introductionContent;

        const citationsElement = document.getElementById('citations');
        citationsElement.innerHTML = citationStart !== -1 ? lines.slice(citationStart + 1).join('\n').trim() : '';

    } catch (error) {
        console.error('Error loading Markdown:', error);
        showStatus(`Error loading Markdown: ${error.message}`, true);
    }
}

async function loadExcel(excelFile = null) {
    try {
        showStatus('Loading Excel data...'); // Initial status message

        let data;
        if (excelFile) {
            showStatus('Processing uploaded file...');
            data = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = (error) => reject(error);
                reader.readAsArrayBuffer(excelFile);
            });
        } else {
            const excelFilePath = `${basePath}/data.xlsx`;
            const response = await fetch(excelFilePath);
            if (!response.ok) {
                throw new Error(`Failed to load default Excel: ${response.status} ${response.statusText}`);
            }
            data = await response.arrayBuffer();
        }

        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" }); // Handle empty cells

        if (!Array.isArray(jsonData) || jsonData.length < 3) {
            throw new Error('Excel file must contain at least a header row, a width row, and a data row.');
        }

        const headers = jsonData[0];
        const columnWidths = jsonData[1];

        if (!headers || !columnWidths || headers.length !== columnWidths.length) {
            throw new Error('Invalid header or width data in the Excel file.');
        }

        // Destroy existing DataTable
        if ($.fn.DataTable.isDataTable('#dataTable')) {
            dataTable.destroy();
        }
        $('#dataTable').empty();

        const scrollYHeight = `calc(100vh-400px)`;

        dataTable = $('#dataTable').DataTable({
            data: jsonData.slice(2),
            columns: headers.map((header, index) => ({
                title: header,
                width: columnWidths[index] + 'vw'
            })),
            paging: true,
            searching: true,
            pageLength: 10,
            lengthMenu: [
                [10, 25, 50, 100, -1],
                [10, 25, 50, 100, "All"]
            ],
            fixedColumns: true,
            scrollCollapse: true,
            scrollY: scrollYHeight,
            scrollX: true,
            rowClass: 'dataTableRow',
            createdRow: function (row) {
                $(row).addClass('dataTableRow');
            },
            language: {  // Optional: Customize DataTables text
                emptyTable: "No data available in table"
            }
        });

        showStatus('Excel data loaded successfully!', false);

    } catch (error) {
        console.error('Error loading Excel:', error);
        showStatus(`Error loading Excel: ${error.message}`, true);
    }
}

async function init() {
    await loadMarkdown();
    await loadExcel();

    document.getElementById('excelUpload').addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            loadExcel(file);
        } else {
            showStatus('No file selected.', true);
        }
    });
}

document.addEventListener('DOMContentLoaded', init);