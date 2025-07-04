/* load_datatable.js */

let dataTable; // Declare dataTable in a wider scope

function showStatus(elementId, message, isError = false) {
    const statusDiv = document.getElementById(elementId);
    if (statusDiv) {
        statusDiv.textContent = message;
        statusDiv.className = isError ? 'error' : 'success'; // Add classes for styling (optional)
    }
}

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
  
function processParagraphs(text) {
    const paragraphs = text.split('\n'); // Split into paragraphs based on double newlines
    const processedParagraphs = paragraphs.map(paragraph => {
        paragraph = paragraph.replace(/\n/g, '').trim();
        // Skip if already enclosed in tags
        if (/^<(ul|ol|li|p|div|h[1-6]|blockquote)/i.test(paragraph)) {
            return paragraph;
        } else {
            return `<p>${paragraph.replace(/\n/g, '<br>')}</p>`; // Wrap in <p> tags and allow line breaks within paragraphs
        }
    });
    return processedParagraphs.join('');
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

        // Process Introduction
        let introductionContent = lines.slice(introductionStart, citationStart !== -1 ? citationStart : undefined).join('\n').trim();


        introductionContent = processParagraphs(introductionContent); 
        document.getElementById('introduction').innerHTML = italicize(introductionContent, "et al.");
        
        // Process Citations
        let citationsContent = citationStart !== -1 ? lines.slice(citationStart + 1).join('\n').trim() : '';
        const citationsArray = citationsContent.split('\n').filter(line => line.trim() !== '');
        citationsArray.sort((a, b) => a.localeCompare(b));
        const sortedCitationsContent = processParagraphs(citationsArray.join('\n'));

        document.getElementById('citation').innerHTML = italicize(sortedCitationsContent, "et al.");

    } catch (error) {
        console.error('Error loading Markdown:', error);
        showStatus('statusMessage', `Error loading Markdown: ${error.message}`, true);
    }
}

async function loadExcel(excelFile = null, defaultExcelFilePath, columnsToItalicize = {}) {
    try {
        const excelFilename = excelFile ? excelFile.name : 'Default file';
        showStatus('statusMessage', `Loading Excel data from ${excelFilename}...`);

        let data;
        if (excelFile) {
            showStatus('statusMessage', `Processing uploaded file ${excelFilename}...`);
            data = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = (error) => reject(error);
                reader.readAsArrayBuffer(excelFile);
            });
            $('#dataTable').empty();
        } else {
            const response = await fetch(defaultExcelFilePath);
            if (!response.ok) {
                throw new Error(`Failed to load default Excel: ${response.status} ${response.statusText}`);
            }
            data = await response.arrayBuffer();
        }

        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" }); // Handle empty cells

        if (!Array.isArray(jsonData) || jsonData.length < 1) { // Minimum 1 row (header)
            throw new Error('Excel file must contain at least a header row.');
        }

        // Check if headers are defined in HTML
        const htmlHeaders = Array.from(document.querySelectorAll('#dataTable thead th')).map(th => th.textContent.trim());
        const tooltips = Array.from(document.querySelectorAll('#dataTable thead th')).map(th => th.title.trim());
        const headers = htmlHeaders.length > 0 ? htmlHeaders : jsonData[0]; // Use HTML headers if available

        let columnWidths = null;
        let dataStartRow = 1; // Default data starts from row 1 (after header)

        // Check if the second row exists and contains only numbers (column widths)
        if (jsonData.length > 1) {
            const secondRow = jsonData[1];
            const allNumbers = secondRow.every(value => {
                const num = Number(value);
                return !isNaN(num) && isFinite(num);
            });

            if (allNumbers && secondRow.length === headers.length) {
                columnWidths = secondRow;
                dataStartRow = 2; // Data starts from row 2 (after header and widths)
            }
        }

        // Validation based on whether column widths are present
        if (columnWidths === null && jsonData.length < 2) {
            throw new Error('Excel file must contain at least a header row and a data row when no column widths are provided.');
        }

        if (columnWidths && headers.length !== columnWidths.length) {
            throw new Error('Number of column widths must match the number of headers.');
        }

        // Destroy existing DataTable
        if ($.fn.DataTable.isDataTable('#dataTable')) {
            dataTable.destroy();
        }
        $('#dataTable').empty();

        const scrollYHeight = `calc(100vh-400px)`;

        dataTable = $('#dataTable').DataTable({
            data: jsonData.slice(dataStartRow),
            columns: headers.map((header, index) => {
                let columnDefinition = {
                    title: (tooltips && tooltips[index]) ? `<abbr title="${tooltips[index]}">${header}</abbr>` : header,
                    width: columnWidths === null ? null : (columnWidths[index] !== undefined && columnWidths[index] !== -1) ? columnWidths[index] + 'vw' : null,
                    visible: columnWidths === null ? true : (columnWidths[index] !== undefined && columnWidths[index] !== -1) // Hide column if width is -1
                };
                columnDefinition.render = function (data, type, row) {
                    if (type === 'display' && data) {
                        let italicizeValue = columnsToItalicize[header]; // Specific column value
                
                        if (columnsToItalicize['*'] !== undefined) { // Wildcard exists
                            italicizeValue = columnsToItalicize['*']; // Override with wildcard
                        }
                
                        if (italicizeValue) {
                            return italicize(data, italicizeValue);
                        }
                    }
                    return data;
                };

                return columnDefinition;
            }),
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
        showStatus('statusMessage', excelFilename + (excelFile ? ' is loaded successfully.' : ' is loaded for demonstration purposes.'), false);

    } catch (error) {
        console.error('Error loading Excel:', error);
        showStatus('statusMessage', `Error loading Excel: ${error.message}`, true);
    }
}

async function loadExcelWithSpinner(file = null, defaultExcelFilePath) {
    showSpinner(true);
    try {
        await loadExcel(file, defaultExcelFilePath, {
            "*": "et al.",
            "Author": "et al."
        });
    } finally {
        showSpinner(false);
    }
}

function showSpinner(isDisplay = false) {
    document.getElementById('spinner').style.display = isDisplay ? 'block' : 'none';
    document.getElementById('dataTable').style.opacity = isDisplay ? '0.5' : '1';
}

async function init() {
    const defaultExcelFilePath = `${basePath}/data.xlsx`;
    await loadMarkdown();
    await loadExcelWithSpinner(null, defaultExcelFilePath);

    const excelUpload = document.getElementById('excelUpload'); // Get the element here

    if (excelUpload) { // Check if the element exists
        excelUpload.addEventListener('change', function (event) {
            const file = event.target.files[0];
            if (file) {
                loadExcelWithSpinner(file, defaultExcelFilePath);
            } else {
                showStatus('No file selected.', true);
            }
        });
    } 
}

document.addEventListener('DOMContentLoaded', function() {
    init(); // Call init() when the DOM is ready
});