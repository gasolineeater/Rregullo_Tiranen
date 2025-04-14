/**
 * Responsive Images for Rregullo Tiranen
 * Handles responsive image loading and optimization
 */

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize responsive images
    initResponsiveImages();
    
    // Initialize lazy loading
    initLazyLoading();
    
    // Initialize image compression for uploads
    initImageCompression();
});

/**
 * Initialize responsive images
 */
function initResponsiveImages() {
    // Find all images with data-srcset attribute
    const images = document.querySelectorAll('img[data-srcset]');
    
    // For each image, set the srcset attribute based on screen size
    images.forEach(img => {
        // Get the srcset attribute
        const srcset = img.getAttribute('data-srcset');
        
        // Set the srcset attribute
        img.setAttribute('srcset', srcset);
        
        // Remove the data-srcset attribute
        img.removeAttribute('data-srcset');
    });
    
    // Find all images with data-src attribute (for browsers that don't support srcset)
    const fallbackImages = document.querySelectorAll('img[data-src]:not([data-srcset])');
    
    // For each image, set the src attribute
    fallbackImages.forEach(img => {
        // Get the src attribute
        const src = img.getAttribute('data-src');
        
        // Set the src attribute
        img.setAttribute('src', src);
        
        // Remove the data-src attribute
        img.removeAttribute('data-src');
    });
}

/**
 * Initialize lazy loading
 */
function initLazyLoading() {
    // Use native lazy loading if supported
    if ('loading' in HTMLImageElement.prototype) {
        // Find all images with data-lazy attribute
        const lazyImages = document.querySelectorAll('img[data-lazy]');
        
        // For each image, set the loading attribute
        lazyImages.forEach(img => {
            // Set the loading attribute
            img.setAttribute('loading', 'lazy');
            
            // Remove the data-lazy attribute
            img.removeAttribute('data-lazy');
        });
    } else {
        // Fallback for browsers that don't support native lazy loading
        // Use Intersection Observer API
        if ('IntersectionObserver' in window) {
            // Create an observer
            const observer = new IntersectionObserver((entries, observer) => {
                // For each entry
                entries.forEach(entry => {
                    // If the image is in the viewport
                    if (entry.isIntersecting) {
                        // Get the image
                        const img = entry.target;
                        
                        // If the image has a data-src attribute, set the src attribute
                        if (img.getAttribute('data-src')) {
                            img.setAttribute('src', img.getAttribute('data-src'));
                            img.removeAttribute('data-src');
                        }
                        
                        // If the image has a data-srcset attribute, set the srcset attribute
                        if (img.getAttribute('data-srcset')) {
                            img.setAttribute('srcset', img.getAttribute('data-srcset'));
                            img.removeAttribute('data-srcset');
                        }
                        
                        // Stop observing the image
                        observer.unobserve(img);
                    }
                });
            }, {
                // Options
                rootMargin: '0px 0px 200px 0px', // 200px below viewport
                threshold: 0.01 // 1% of the image is visible
            });
            
            // Find all images with data-lazy attribute
            const lazyImages = document.querySelectorAll('img[data-lazy]');
            
            // For each image, observe it
            lazyImages.forEach(img => {
                observer.observe(img);
                
                // Remove the data-lazy attribute
                img.removeAttribute('data-lazy');
            });
        } else {
            // Fallback for browsers that don't support Intersection Observer API
            // Load all images immediately
            const lazyImages = document.querySelectorAll('img[data-lazy]');
            
            // For each image, set the src attribute
            lazyImages.forEach(img => {
                // If the image has a data-src attribute, set the src attribute
                if (img.getAttribute('data-src')) {
                    img.setAttribute('src', img.getAttribute('data-src'));
                    img.removeAttribute('data-src');
                }
                
                // If the image has a data-srcset attribute, set the srcset attribute
                if (img.getAttribute('data-srcset')) {
                    img.setAttribute('srcset', img.getAttribute('data-srcset'));
                    img.removeAttribute('data-srcset');
                }
                
                // Remove the data-lazy attribute
                img.removeAttribute('data-lazy');
            });
        }
    }
}

/**
 * Initialize image compression for uploads
 */
function initImageCompression() {
    // Find all file inputs for images
    const fileInputs = document.querySelectorAll('input[type="file"][accept*="image"]');
    
    // For each file input, add a change event listener
    fileInputs.forEach(input => {
        input.addEventListener('change', function(e) {
            // Get the files
            const files = e.target.files;
            
            // If no files, return
            if (!files.length) return;
            
            // For each file
            Array.from(files).forEach(file => {
                // If not an image, skip
                if (!file.type.match('image.*')) return;
                
                // Create a FileReader
                const reader = new FileReader();
                
                // When the file is loaded
                reader.onload = function(e) {
                    // Create an image
                    const img = new Image();
                    
                    // When the image is loaded
                    img.onload = function() {
                        // Create a canvas
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        
                        // Set canvas dimensions
                        let width = img.width;
                        let height = img.height;
                        
                        // If image is too large, resize it
                        const maxWidth = 1200;
                        const maxHeight = 1200;
                        
                        if (width > maxWidth) {
                            height = Math.round(height * maxWidth / width);
                            width = maxWidth;
                        }
                        
                        if (height > maxHeight) {
                            width = Math.round(width * maxHeight / height);
                            height = maxHeight;
                        }
                        
                        // Set canvas dimensions
                        canvas.width = width;
                        canvas.height = height;
                        
                        // Draw image on canvas
                        ctx.drawImage(img, 0, 0, width, height);
                        
                        // Get compressed image data
                        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
                        
                        // Create a preview if a preview element exists
                        const previewId = input.getAttribute('data-preview');
                        if (previewId) {
                            const preview = document.getElementById(previewId);
                            if (preview) {
                                preview.src = compressedDataUrl;
                                preview.style.display = 'block';
                            }
                        }
                        
                        // Store compressed image data
                        const dataField = input.getAttribute('data-field');
                        if (dataField) {
                            const dataInput = document.getElementById(dataField);
                            if (dataInput) {
                                dataInput.value = compressedDataUrl;
                            }
                        }
                    };
                    
                    // Set image source
                    img.src = e.target.result;
                };
                
                // Read the file
                reader.readAsDataURL(file);
            });
        });
    });
}
