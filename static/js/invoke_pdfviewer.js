/* invoke_pdfviewer.js */

$(document).ready(function() {
    $(document).on('click', 'a.pdfviewer-link', function(event) {
        event.preventDefault(); // Prevent the default link behavior
        
        const trackingUrl = `/static/html/pdfviewer.html?file=${encodeURIComponent(this.href)}&text=${encodeURIComponent(this.innerText)}`;
        console.log(trackingUrl); // Log the tracking URL
        window.open(trackingUrl, '_blank'); // Open the new URL in a new tab
    });
});