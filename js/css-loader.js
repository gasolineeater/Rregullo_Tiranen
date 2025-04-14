/**
 * CSS Loader for Rregullo Tiranen
 * Handles asynchronous loading of CSS files for better performance
 */

// Fallback function for browsers that don't support preload
(function() {
    // If the browser doesn't support preload, load the CSS files normally
    if (!('onload' in document.createElement('link'))) {
        const links = document.querySelectorAll('link[rel="preload"][as="style"]');
        links.forEach(link => {
            const newLink = document.createElement('link');
            newLink.rel = 'stylesheet';
            newLink.href = link.href;
            document.head.appendChild(newLink);
        });
    }
})();
