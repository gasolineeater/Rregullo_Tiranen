/**
 * Image Lazy Loader for Rregullo Tiranen
 * Handles lazy loading of images for better performance on mobile devices
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if the browser supports IntersectionObserver
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                // If the image is in the viewport
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // If the image has a data-src attribute, set the src to the data-src value
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    
                    // If the image has a data-srcset attribute, set the srcset to the data-srcset value
                    if (img.dataset.srcset) {
                        img.srcset = img.dataset.srcset;
                        img.removeAttribute('data-srcset');
                    }
                    
                    // Stop observing the image
                    observer.unobserve(img);
                }
            });
        }, {
            // Options for the observer
            rootMargin: '0px 0px 200px 0px' // Start loading images when they are 200px below the viewport
        });
        
        // Observe all images with the 'lazy' class
        document.querySelectorAll('img[loading="lazy"]').forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        document.querySelectorAll('img[loading="lazy"]').forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            }
            if (img.dataset.srcset) {
                img.srcset = img.dataset.srcset;
                img.removeAttribute('data-srcset');
            }
        });
    }
});
