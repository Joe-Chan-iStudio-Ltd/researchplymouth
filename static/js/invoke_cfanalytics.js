/* invoke_cfanalytics.js */

document.addEventListener('DOMContentLoaded', function() {
    const analyticsToken = "c4399dd2cc0740109ff1533e34ec9a73"; 

    // Select all links with the class 'analytic-link'
    const links = document.querySelectorAll('a.analytic-link');

    links.forEach(link => {
        link.addEventListener('click', function(event) {
            // Prevent the default action for a brief moment
            event.preventDefault();
            
            // Track the click event with Cloudflare Analytics
            if (window.cfAnalytics) {
                window.cfAnalytics.trackEvent('link_click', {
                    url: this.href,
                    text: this.innerText,
                    token: analyticsToken 
                });
            }

            // Use a timeout to ensure the tracking is recorded before navigating
            setTimeout(() => {
                // Navigate to the PDF after a short delay
                window.open(this.href, '_blank');
            }, 100); // Adjust the timing as needed
        });
    });
});