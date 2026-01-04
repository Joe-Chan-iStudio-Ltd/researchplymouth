/* invoke_pdfviewer.js */

document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('a.pdfviewer-link');

    links.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            
            const trackingUrl = `/static/html/pdfviewer.html?file=${encodeURIComponent(this.href)}&text=${encodeURIComponent(this.innerText)}`;
            console.log(trackingUrl);  
            window.open(trackingUrl, '_blank');

        });
    });
});