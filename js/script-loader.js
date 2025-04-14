/**
 * Script Loader for Rregullo Tiranen
 * Handles dynamic loading of JavaScript files for better performance
 */

// Script loading queue
const ScriptLoader = {
    // Queue of scripts to load
    queue: [],

    // Scripts that have been loaded
    loaded: {},

    // Load a script
    load: function(src, callback) {
        // If script is already loaded, call callback immediately
        if (this.loaded[src]) {
            if (callback) callback();
            return Promise.resolve();
        }

        // Return a promise that resolves when the script is loaded
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = true;

            // When script loads, mark as loaded and call callback
            script.onload = () => {
                this.loaded[src] = true;
                if (callback) callback();
                resolve();

                // Load next script in queue
                this.loadNext();
            };

            // If script fails to load, reject promise
            script.onerror = (error) => {
                console.error(`Failed to load script: ${src}`, error);
                reject(error);

                // Load next script in queue
                this.loadNext();
            };

            // Add to queue if we're already loading scripts
            if (this.queue.length > 0) {
                this.queue.push({ script, resolve, reject });
            } else {
                // Otherwise, start loading immediately
                document.head.appendChild(script);
                this.queue.push({ script, resolve, reject });
            }
        });
    },

    // Load multiple scripts in sequence
    loadSequence: function(scripts, finalCallback) {
        // If no scripts, call callback immediately
        if (!scripts || scripts.length === 0) {
            if (finalCallback) finalCallback();
            return Promise.resolve();
        }

        // Load scripts in sequence
        return scripts.reduce((promise, script) => {
            return promise.then(() => this.load(script));
        }, Promise.resolve()).then(() => {
            if (finalCallback) finalCallback();
        });
    },

    // Load multiple scripts in parallel
    loadParallel: function(scripts, finalCallback) {
        // If no scripts, call callback immediately
        if (!scripts || scripts.length === 0) {
            if (finalCallback) finalCallback();
            return Promise.resolve();
        }

        // Load scripts in parallel
        return Promise.all(scripts.map(script => this.load(script))).then(() => {
            if (finalCallback) finalCallback();
        });
    },

    // Load next script in queue
    loadNext: function() {
        // If queue is empty, return
        if (this.queue.length === 0) return;

        // Get next script in queue
        const next = this.queue[0];

        // If script is already in document, remove from queue
        if (document.querySelector(`script[src="${next.script.src}"]`)) {
            this.queue.shift();
            next.resolve();
            this.loadNext();
            return;
        }

        // Add script to document
        document.head.appendChild(next.script);
    },

    // Load scripts based on current page
    loadPageScripts: function() {
        // Get current page
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        // Common scripts for all pages
        const commonScripts = [
            'js/data-store.js',
            'js/auth-store.js',
            'js/theme-manager.js',
            'js/auth-ui.js',
            'js/network-status.js',
            'js/responsive-images.js'
        ];

        // Page-specific scripts
        const pageScripts = {
            'index.html': [
                'js/home-map.js'
            ],
            'report.html': [
                'js/report.js'
            ],
            'about.html': [
                'js/about.js'
            ],
            'map.html': [
                'js/map.js'
            ],
            'how-it-works.html': [
                'js/image-lazy-loader.js'
            ]
        };

        // Load common scripts first, then page-specific scripts
        this.loadSequence(commonScripts, () => {
            // Load page-specific scripts
            if (pageScripts[currentPage]) {
                this.loadParallel(pageScripts[currentPage]);
            }

            // Load non-critical scripts last
            setTimeout(() => {
                this.loadParallel([
                    'js/touch-gestures.js',
                    'js/native-sharing.js',
                    'js/pwa.js'
                ]);
            }, 1000);
        });
    }
};

// Initialize script loader when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Load API service first (many scripts depend on it)
    ScriptLoader.load('js/api-service.js', () => {
        // Then load main.js (core functionality)
        ScriptLoader.load('js/main.js', () => {
            // Then load page-specific scripts
            ScriptLoader.loadPageScripts();
        });
    });
});
