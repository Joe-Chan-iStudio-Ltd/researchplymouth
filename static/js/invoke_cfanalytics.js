/* invoke_cfanalytics.js */

document.addEventListener('DOMContentLoaded', function() {
    // Select all links with the class 'analytic-link'
    const links = document.querySelectorAll('a.analytic-link');

    links.forEach(link => {
        link.addEventListener('click', function() {
            // Track the click event
            if (window.cfAnalytics) {
                window.cfAnalytics.trackEvent('link_click', {
                    url: this.href,
                    text: this.innerText
                });
            }
        });
    });
});