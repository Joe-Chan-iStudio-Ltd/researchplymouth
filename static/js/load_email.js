/* load_email.js */

document.addEventListener("DOMContentLoaded", function() {
    // Split the email to confuse basic scrapers
    var user = "research";
    var domain = "researchplymouth.com";
    var email = user + "@" + domain;
    
    // Find the placeholder span
    var span = document.getElementById("contact-email");
    
    // Create a clickable mailto link dynamically
    var link = document.createElement("a");
    link.href = "mailto:" + email;
    link.textContent = email;
    
    // Append the link into the paragraph
    span.appendChild(link);
});
