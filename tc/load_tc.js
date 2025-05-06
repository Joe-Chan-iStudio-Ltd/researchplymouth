/* load_tc.js */

async function loadMarkdown() {
    try {
        const response = await fetch('data.md');
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

document.addEventListener('DOMContentLoaded', loadMarkdown);

