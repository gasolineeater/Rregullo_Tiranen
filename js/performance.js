/**
 * Performance optimization utilities for Rregullo Tiranen
 * Provides functions for lazy loading, caching, and other performance enhancements
 */

const PerformanceUtils = (function() {
    // Cache storage
    const cache = {
        images: new Map(),
        api: new Map()
    };

    // Cache configuration
    const config = {
        // Cache expiration times in milliseconds
        expiration: {
            images: 24 * 60 * 60 * 1000, // 24 hours
            api: 5 * 60 * 1000 // 5 minutes
        },
        // Maximum cache sizes
        maxSize: {
            images: 100,
            api: 50
        }
    };

    /**
     * Lazy load images that are in the viewport
     * @param {string} selector - CSS selector for images to lazy load
     * @param {number} threshold - Threshold for intersection observer (0-1)
     */
    function lazyLoadImages(selector = 'img[data-src]', threshold = 0.1) {
        // Check if Intersection Observer is supported
        if (!('IntersectionObserver' in window)) {
            // Fallback for browsers that don't support Intersection Observer
            const images = document.querySelectorAll(selector);
            images.forEach(img => {
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
            });
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        // Load image from cache or network
                        loadImage(img, img.dataset.src);
                        // Stop observing the image
                        observer.unobserve(img);
                    }
                }
            });
        }, { threshold });

        // Observe all images with data-src attribute
        const images = document.querySelectorAll(selector);
        images.forEach(img => observer.observe(img));
    }

    /**
     * Load an image from cache or network
     * @param {HTMLImageElement} imgElement - Image element to update
     * @param {string} src - Image source URL
     */
    function loadImage(imgElement, src) {
        // Check if image is in cache and not expired
        if (cache.images.has(src)) {
            const cachedImage = cache.images.get(src);
            if (Date.now() - cachedImage.timestamp < config.expiration.images) {
                // Use cached image data
                if (cachedImage.blob) {
                    imgElement.src = URL.createObjectURL(cachedImage.blob);
                } else {
                    imgElement.src = src;
                }
                imgElement.removeAttribute('data-src');
                return;
            } else {
                // Remove expired cache entry
                cache.images.delete(src);
            }
        }

        // Load image from network
        fetch(src)
            .then(response => response.blob())
            .then(blob => {
                // Cache the image
                cacheImage(src, blob);
                // Set the image source
                imgElement.src = URL.createObjectURL(blob);
                imgElement.removeAttribute('data-src');
            })
            .catch(error => {
                console.error('Error loading image:', error);
                // Fallback to direct src
                imgElement.src = src;
                imgElement.removeAttribute('data-src');
            });
    }

    /**
     * Cache an image blob
     * @param {string} src - Image source URL
     * @param {Blob} blob - Image blob data
     */
    function cacheImage(src, blob) {
        // Ensure cache doesn't exceed maximum size
        if (cache.images.size >= config.maxSize.images) {
            // Remove oldest entry
            const oldestKey = Array.from(cache.images.keys())[0];
            cache.images.delete(oldestKey);
        }

        // Add to cache
        cache.images.set(src, {
            blob,
            timestamp: Date.now()
        });
    }

    /**
     * Cache API response
     * @param {string} key - Cache key (usually the API endpoint)
     * @param {any} data - Data to cache
     */
    function cacheApiResponse(key, data) {
        // Ensure cache doesn't exceed maximum size
        if (cache.api.size >= config.maxSize.api) {
            // Remove oldest entry
            const oldestKey = Array.from(cache.api.keys())[0];
            cache.api.delete(oldestKey);
        }

        // Add to cache
        cache.api.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    /**
     * Get cached API response
     * @param {string} key - Cache key (usually the API endpoint)
     * @returns {any|null} - Cached data or null if not found or expired
     */
    function getCachedApiResponse(key) {
        // Check if response is in cache and not expired
        if (cache.api.has(key)) {
            const cachedResponse = cache.api.get(key);
            if (Date.now() - cachedResponse.timestamp < config.expiration.api) {
                return cachedResponse.data;
            } else {
                // Remove expired cache entry
                cache.api.delete(key);
            }
        }
        return null;
    }

    /**
     * Debounce function to limit function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} - Debounced function
     */
    function debounce(func, wait = 300) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    /**
     * Throttle function to limit function calls
     * @param {Function} func - Function to throttle
     * @param {number} limit - Limit time in milliseconds
     * @returns {Function} - Throttled function
     */
    function throttle(func, limit = 300) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Preload critical images
     * @param {Array<string>} urls - Array of image URLs to preload
     */
    function preloadImages(urls) {
        urls.forEach(url => {
            const img = new Image();
            img.src = url;
        });
    }

    /**
     * Initialize performance optimizations
     */
    function initialize() {
        // Add event listener for page load
        window.addEventListener('load', () => {
            // Lazy load all images with data-src attribute
            lazyLoadImages();
        });

        // Add event listener for scroll to lazy load images
        window.addEventListener('scroll', throttle(() => {
            lazyLoadImages();
        }, 200));
    }

    // Public API
    return {
        initialize,
        lazyLoadImages,
        loadImage,
        cacheApiResponse,
        getCachedApiResponse,
        debounce,
        throttle,
        preloadImages
    };
})();
