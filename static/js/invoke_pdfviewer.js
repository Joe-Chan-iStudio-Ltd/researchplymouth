/* invoke_pdfviewer.js */

$(document).ready(function() {
    $(document).on('click', 'a.pdfviewer-link', function(event) {
        event.preventDefault();
        const trackingUrl = `/static/html/pdfviewer.html?file=${encodeURIComponent(this.href)}&text=${encodeURIComponent(this.innerText)}`;
        window.open(trackingUrl, '_blank');
    });
});