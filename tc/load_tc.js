/* load_tc.js */

async function readExcel() {
    try {
        const response = await fetch('data.xlsx');
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.arrayBuffer();
        const workbook = XLSX.read(data);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        console.log('Excel Data:', jsonData); // Log the processed data
        return jsonData;
    } catch (error) {
        console.error('Error reading Excel file:', error);
        return undefined; // Explicitly return undefined on error
    }
}

async function loadMarkdown() {
    console.log("loadMarkdown...");
    const response = await fetch('data.md');
    const text = await response.text();
    const lines = text.split('\n');
    
    if (typeof lines[0] === 'string') {
        document.getElementById('pageTitle').textContent = lines[0].replace(/^#\s*/, '');
    } else {
        console.error('First line is not a string:', lines[0]);
    }
    
    document.getElementById('introduction').textContent = lines.slice(1).join('\n').split('## Citations')[0].trim();
    
    const citationStart = lines.join('\n').indexOf('## Citations');
    document.getElementById('citations').textContent = citationStart !== -1 ? lines.slice(citationStart + 1).join('\n').trim() : '';
}

function generateTable(data) {
    console.log("generateTable...");
    if (data.length < 2 || !Array.isArray(data[1])) {
        console.error('Invalid data for DataTable:', data);
        return;
    }

    const table = $('#dataTable').DataTable({
        data: data.slice(2),
        columns: data[0].map((header, index) => ({
            title: header,
            width: data[1][index] + 'vw'
        })),
        paging: true,
        searching: true,
    });

    table.columns().every(function (index) {
        this.header().style.width = data[1][index] + 'vw';
    });
}

async function init() {
    const excelData = await readExcel();
    console.log('Excel Data:', excelData); // Log the data structure
    if (excelData) {
        await loadMarkdown();
        generateTable(excelData);
    }
}

$(document).ready(init);