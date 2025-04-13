/**
 * Image Handler for Rregullo Tiranen
 * Handles image loading and fallbacks
 */

document.addEventListener('DOMContentLoaded', function() {
    // Find all images on the page
    const images = document.querySelectorAll('img');
    
    // Add error handler to each image
    images.forEach(img => {
        img.addEventListener('error', function() {
            // Check if this is a profile image
            if (img.src.includes('founder-')) {
                this.src = 'images/placeholder-profile.jpg';
            } else {
                this.src = 'images/placeholder.jpg';
            }
        });
    });
});
