/* load_tc.js */

async function readExcel() {
    const response = await fetch('/tc/data.xlsx');
    const data = await response.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    return jsonData;
}

async function loadMarkdown() {
    const response = await fetch('/tc/data.md');
    const text = await response.text();
    const lines = text.split('\n');
    
    document.getElementById('pageTitle').textContent = lines[0].replace(/^#\s*/, '');
    document.getElementById('introduction').textContent = lines.slice(1).join('\n').split('## Citations')[0].trim();
    
    const citationStart = lines.join('\n').indexOf('## Citations');
    document.getElementById('citations').textContent = citationStart !== -1 ? lines.slice(citationStart + 1).join('\n').trim() : '';
}

function generateTable(data) {
    const table = $('#dataTable').DataTable({
        data: data.slice(2),
        columns: data[0].map((header, index) => ({
            title: header,
            width: data[1][index] + 'vw'
        })),
        paging: true,
        searching: true,
    });

    // Adjust column widths based on second row
    table.columns().every(function (index) {
        this.header().style.width = data[1][index] + 'vw';
    });
}

async function init() {
    const excelData = await readExcel();
    const markdownData = await loadMarkdown();
    generateTable(excelData);
}

$(document).ready(init);
