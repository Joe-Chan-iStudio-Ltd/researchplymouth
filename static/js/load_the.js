/* load_the.js */

let dataTable; 

function showStatus(elementId, message, isError = false) {
    const statusDiv = document.getElementById(elementId);
    if (statusDiv) {
        statusDiv.textContent = message;
        statusDiv.className = isError ? 'error' : 'success';
    }
}

function italicize(text, findString) {
    if (!text || !findString || typeof text !== 'string') {
      return text || "";
    }
    const escapedFindString = findString.replace(/[-/\\^$*+?.()|[]{}]/g, '\\$&');
    const regex = new RegExp(escapedFindString, 'gi');
    return text.replace(regex, "<em>$&</em>");
}
  
function processParagraphs(text) {
    const paragraphs = text.split('\n');
    const processedParagraphs = paragraphs.map(paragraph => {
        paragraph = paragraph.replace(/\n/g, '').trim();
        if (/^<(ul|ol|li|p|div|h[1-6]|blockquote)/i.test(paragraph)) {
            return paragraph;
        } else {
            return `<p>${paragraph.replace(/\n/g, '<br>')}</p>`;
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
        citationsContent = processParagraphs(citationsContent); 
        document.getElementById('citation').innerHTML = italicize(citationsContent, "et al.");

    } catch (error) {
        console.error('Error loading Markdown:', error);
        showStatus('statusMessage', `Error loading Markdown: ${error.message}`, true);
    }
}

// Optimized File Scanner: Scans from the latest year backward to 2011
async function scanAvailableRankingYears() {
    const selector = document.getElementById('yearSelector');
    if (!selector) return null;
    
    selector.innerHTML = ''; // Clear status message

    const currentYear = new Date().getFullYear(); // Dynamic baseline (e.g., 2026)
    const startYear = 2011;
    let validYearsFound = [];

    // Scan backwards from the future down to 2011 to find available matrices instantly
    for (let year = currentYear + 1; year >= startYear; year--) {
        const checkUrl = `/static/xlsx/the/${year}.xlsx`;
        try {
            // Lightweight HEAD request to check file existence without downloading the data
            const checkResponse = await fetch(checkUrl, { method: 'HEAD' });
            if (checkResponse.ok) {
                validYearsFound.push(year);
            }
        } catch (e) {
            console.warn(`File check skipped for year ${year}:`, e);
        }
    }

    // Populate dropdown options (ordered latest year first)
    validYearsFound.forEach(y => {
        const option = document.createElement('option');
        option.value = `/static/xlsx/the/${y}.xlsx`;
        option.textContent = `${y} Rankings`;
        selector.appendChild(option);
    });

    // Activate the interactive dropdown menu controls
    selector.disabled = false;
    
    // Bind selection change event to refresh the table with the new file target
    selector.removeEventListener('change', handleYearChange); // Prevent duplicate bindings
    selector.addEventListener('change', handleYearChange);

    return selector.value; // Returns the latest available file path (first option)
}

// Named event handler for clean binder state tracking
async function handleYearChange(e) {
    if (e.target.value) {
        await loadExcelWithSpinner(null, e.target.value);
    }
}

// Enhanced init configuration structure execution chain
async function init() {
    await loadMarkdown();
    
    // 1. Scan repository files and identify the latest active spreadsheet path
    const latestAvailableFile = await scanAvailableRankingYears();
    
    // 2. Initialize DataTable using the newest available year discovered
    if (latestAvailableFile) {
        await loadExcelWithSpinner(null, latestAvailableFile);
    }
    
    await loadTooltips();
}

document.addEventListener('DOMContentLoaded', function() {
    init();
});

async function loadExcel(excelFile = null, defaultExcelFilePath, columnsToItalicize = {}) {
    try {
        const excelFilename = excelFile ? excelFile.name : defaultExcelFilePath.substring(defaultExcelFilePath.lastIndexOf('/') + 1);

        // Dynamic Dependency Guard: Injects SheetJS automatically if missing from HTML
        if (typeof XLSX === 'undefined') {
            console.warn("XLSX library not detected in memory. Injecting dynamically via CDN...");
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = "https://cloudflare.com";
                script.onload = () => resolve();
                script.onerror = () => reject(new Error("Critical: Failed to fetch SheetJS."));
                document.head.appendChild(script);
            });
        }        
        
        let data;
        if (excelFile) {
            data = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = (error) => reject(error);
                reader.readAsArrayBuffer(excelFile);
            });
        } else {
            const response = await fetch(defaultExcelFilePath);
            if (!response.ok) {
                throw new Error(`Failed to load target data: ${response.status} ${response.statusText}`);
            }
            data = await response.arrayBuffer();
        }

        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Use raw: true to cleanly get raw numeric inputs without evaluation string failures
        let jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true, defval: "" });

        if (!Array.isArray(jsonData) || jsonData.length < 1) {
            throw new Error('Spreadsheet format invalid.');
        }

        const htmlHeaders = Array.from(document.querySelectorAll('#dataTable thead th')).map(th => th.textContent.trim());
        const tooltips = Array.from(document.querySelectorAll('#dataTable thead th')).map(th => th.title.trim());
        const headers = htmlHeaders.length > 0 ? htmlHeaders : jsonData[0];

        let columnWidths = null;
        let dataStartRow = 1; 

        if (jsonData.length > 1) {
            const secondRow = jsonData[1];
            const allNumbers = secondRow.every(value => {
                const num = Number(value);
                return value !== "" && !isNaN(num) && isFinite(num);
            });

            if (allNumbers && secondRow.length === headers.length) {
                columnWidths = secondRow.map(Number);
                dataStartRow = 2; 
            }
        }

        // --- ENHANCEMENT: DYNAMIC EQUAL SIGN STRATEGY ---
        // Extract only the raw data rows
        let dataRows = jsonData.slice(dataStartRow);

        // Find the index of the Rank column (usually index 1)
        const rankIndex = headers.findIndex(h => h.toLowerCase() === 'rank');

        if (rankIndex !== -1) {
            // First loop: Clean up values and parse them to standardized strings/numbers
            dataRows = dataRows.map(row => {
                if (row[rankIndex] !== undefined && row[rankIndex] !== null) {
                    // Remove any existing '=' signs or white spaces to establish clean baselines
                    let cleanRank = String(row[rankIndex]).replace(/=/g, '').trim();
                    row[rankIndex] = cleanRank;
                }
                return row;
            });

            // Second loop: Compare with neighboring rows to detect ties and prepend '='
            for (let i = 0; i < dataRows.length; i++) {
                let currentRank = dataRows[i][rankIndex];
                if (!currentRank || currentRank.toLowerCase() === 'reporter') continue;

                let isTie = false;

                // Check previous row
                if (i > 0 && dataRows[i - 1][rankIndex] && dataRows[i - 1][rankIndex].replace(/=/g, '') === currentRank) {
                    isTie = true;
                }
                // Check next row
                if (i < dataRows.length - 1 && dataRows[i + 1][rankIndex] && String(dataRows[i + 1][rankIndex]).replace(/=/g, '') === currentRank) {
                    isTie = true;
                }

                // Prepend the equal sign if a tie is detected
                if (isTie) {
                    dataRows[i][rankIndex] = `=` + currentRank;
                }
            }
        }

        // Destroy existing instance gracefully
        if ($.fn.DataTable.isDataTable('#dataTable')) {
            dataTable.destroy();
        }
        $('#dataTable').empty();

        // Ensure left-alignment overrides remain locked down
        const styleId = 'dt-left-alignment-override';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.innerHTML = `
                .dt-container, .dt-scroll, .dt-scroll-head, .dt-scroll-body, table.dataTable { 
                    margin-left: 0 !important; 
                    margin-right: auto !important; 
                }
                table.dataTable th, table.dataTable td { 
                    text-align: left !important; 
                }
            `;
            document.head.appendChild(style);
        }

        const scrollYHeight = `calc(100vh - 420px)`;

        dataTable = $('#dataTable').DataTable({
            // Pass the pre-processed data rows containing resolved equal signs
            data: dataRows,
            order: [[0, 'asc']],
            columns: headers.map((header, index) => {
                let isColumnVisible = columnWidths === null ? true : (columnWidths[index] !== undefined && columnWidths[index] !== -1);
                let targetDataType = (index === 0) ? "num" : "string";

                let columnDefinition = {
                    title: (tooltips && tooltips[index]) ? `<abbr title="${tooltips[index]}">${header}</abbr>` : header,
                    width: columnWidths === null ? null : (columnWidths[index] !== undefined && columnWidths[index] !== -1) ? columnWidths[index] + 'vw' : null,
                    visible: isColumnVisible,
                    type: targetDataType, 
                    className: "dt-left text-left"
                };
                
                columnDefinition.render = function (data, type, row) {
                    if (type === 'display' && data) {
                        let italicizeValue = columnsToItalicize[header];
                        if (columnsToItalicize['*'] !== undefined) { 
                            italicizeValue = columnsToItalicize['*']; 
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
            language: { 
                emptyTable: "No data found matching selection metrics"
            },
            // --- ENHANCEMENT: FIX FOR THE AUTO-WIDTH CHANGES RE-ALIGNMENT BUG ---
            // Forces headers and body structural boxes to recalculate widths cleanly on file updates
            initComplete: function() {
                setTimeout(() => {
                    this.api().columns.adjust().draw(false);
                }, 50);
            }
        });

    } catch (error) {
        console.error('Error loading Excel:', error);
        showStatus('statusMessage', `Error updating matrix parameters: ${error.message}`, true);
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
    const spinner = document.getElementById('spinner');
    const table = document.getElementById('dataTable');
    if(spinner) spinner.style.display = isDisplay ? 'block' : 'none';
    if(table) table.style.opacity = isDisplay ? '0.5' : '1';
}

async function loadTooltips() {
    const headers = document.querySelectorAll('#dataTable th[title]');
    let tooltip = null;

    headers.forEach(header => {
        // Create tooltip element on mouseover
        header.addEventListener('mouseover', function (e) {
            // Remove existing tooltip if any
            if (tooltip) tooltip.remove();

            // Create new tooltip
            tooltip = document.createElement('div');
            tooltip.className = 'custom-tooltip';
            tooltip.textContent = header.getAttribute('title');
            document.body.appendChild(tooltip);

            // Position tooltip near the mouse
            const rect = header.getBoundingClientRect();
            tooltip.style.top = (rect.bottom + window.scrollY + 5) + 'px';
            tooltip.style.left = (rect.left + window.scrollX + (rect.width / 2) - (tooltip.offsetWidth / 2)) + 'px';

            // Show tooltip
            setTimeout(() => tooltip.classList.add('visible'), 10);
        });

        // Remove tooltip on mouseout
        header.addEventListener('mouseout', function () {
            if (tooltip) {
                tooltip.remove();
                tooltip = null;
            }
        });

        // Adjust tooltip position on scroll or resize
        window.addEventListener('scroll', function () {
            if (tooltip) {
                const rect = header.getBoundingClientRect();
                tooltip.style.top = (rect.bottom + window.scrollY + 5) + 'px';
                tooltip.style.left = (rect.left + window.scrollX + (rect.width / 2) - (tooltip.offsetWidth / 2)) + 'px';
            }
        });
        window.addEventListener('resize', function () {
            if (tooltip) {
                const rect = header.getBoundingClientRect();
                tooltip.style.top = (rect.bottom + window.scrollY + 5) + 'px';
                tooltip.style.left = (rect.left + window.scrollX + (rect.width / 2) - (tooltip.offsetWidth / 2)) + 'px';
            }
        });
    });
}
