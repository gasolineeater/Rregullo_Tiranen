/**
 * Mobile Testing Script for Rregullo Tiranen
 * Helps with testing mobile features and gathering feedback
 */

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Only run in development mode
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('Mobile testing script initialized');
        
        // Initialize mobile testing
        initMobileTesting();
    }
});

/**
 * Initialize mobile testing
 */
function initMobileTesting() {
    // Add testing toolbar
    addTestingToolbar();
    
    // Add device simulation
    addDeviceSimulation();
    
    // Add network simulation
    addNetworkSimulation();
    
    // Add feedback form
    addFeedbackForm();
    
    // Add performance monitoring
    addPerformanceMonitoring();
}

/**
 * Add testing toolbar
 */
function addTestingToolbar() {
    // Create toolbar if it doesn't exist
    let toolbar = document.getElementById('mobile-testing-toolbar');
    
    if (!toolbar) {
        toolbar = document.createElement('div');
        toolbar.id = 'mobile-testing-toolbar';
        toolbar.className = 'mobile-testing-toolbar';
        toolbar.innerHTML = `
            <div class="toolbar-header">
                <h3>Mobile Testing</h3>
                <button class="toolbar-toggle">▼</button>
            </div>
            <div class="toolbar-content">
                <div class="toolbar-section">
                    <h4>Device Simulation</h4>
                    <select id="device-select">
                        <option value="none">No Simulation</option>
                        <option value="iphone-se">iPhone SE</option>
                        <option value="iphone-xr">iPhone XR</option>
                        <option value="iphone-12">iPhone 12</option>
                        <option value="pixel-5">Pixel 5</option>
                        <option value="samsung-s20">Samsung S20</option>
                        <option value="ipad">iPad</option>
                    </select>
                </div>
                <div class="toolbar-section">
                    <h4>Network Simulation</h4>
                    <select id="network-select">
                        <option value="none">No Simulation</option>
                        <option value="fast-3g">Fast 3G</option>
                        <option value="slow-3g">Slow 3G</option>
                        <option value="offline">Offline</option>
                    </select>
                </div>
                <div class="toolbar-section">
                    <h4>Actions</h4>
                    <button id="clear-cache-btn">Clear Cache</button>
                    <button id="reload-btn">Reload Page</button>
                    <button id="feedback-btn">Give Feedback</button>
                </div>
                <div class="toolbar-section">
                    <h4>Performance</h4>
                    <div id="performance-metrics">
                        <div class="metric">
                            <span class="metric-label">FCP:</span>
                            <span id="fcp-value" class="metric-value">-</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">LCP:</span>
                            <span id="lcp-value" class="metric-value">-</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">CLS:</span>
                            <span id="cls-value" class="metric-value">-</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .mobile-testing-toolbar {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background-color: rgba(0, 0, 0, 0.8);
                color: white;
                z-index: 10000;
                font-family: monospace;
                font-size: 12px;
                transition: transform 0.3s ease;
            }
            
            .mobile-testing-toolbar.collapsed .toolbar-content {
                display: none;
            }
            
            .mobile-testing-toolbar.collapsed .toolbar-toggle {
                transform: rotate(180deg);
            }
            
            .toolbar-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 16px;
                background-color: #333;
                cursor: pointer;
            }
            
            .toolbar-header h3 {
                margin: 0;
                font-size: 14px;
            }
            
            .toolbar-toggle {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                font-size: 12px;
                transition: transform 0.3s ease;
            }
            
            .toolbar-content {
                padding: 16px;
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 16px;
            }
            
            .toolbar-section {
                margin-bottom: 16px;
            }
            
            .toolbar-section h4 {
                margin: 0 0 8px 0;
                font-size: 12px;
                color: #ccc;
            }
            
            .toolbar-section select,
            .toolbar-section button {
                width: 100%;
                padding: 8px;
                margin-bottom: 8px;
                background-color: #444;
                color: white;
                border: none;
                border-radius: 4px;
                font-family: monospace;
                font-size: 12px;
            }
            
            .toolbar-section button {
                cursor: pointer;
                transition: background-color 0.3s ease;
            }
            
            .toolbar-section button:hover {
                background-color: #555;
            }
            
            .metric {
                display: flex;
                justify-content: space-between;
                margin-bottom: 4px;
            }
            
            .metric-label {
                color: #ccc;
            }
            
            .metric-value {
                font-weight: bold;
            }
            
            .metric-value.good {
                color: #4caf50;
            }
            
            .metric-value.average {
                color: #ff9800;
            }
            
            .metric-value.poor {
                color: #f44336;
            }
            
            /* Device frames */
            .device-frame {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                pointer-events: none;
                z-index: 9999;
                display: none;
            }
            
            .device-frame.active {
                display: block;
            }
            
            .device-frame img {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: contain;
                pointer-events: none;
            }
            
            /* Feedback form */
            .feedback-form {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.8);
                z-index: 10001;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 16px;
                display: none;
            }
            
            .feedback-form.active {
                display: flex;
            }
            
            .feedback-form-content {
                background-color: #333;
                color: white;
                padding: 16px;
                border-radius: 8px;
                width: 100%;
                max-width: 500px;
                font-family: monospace;
            }
            
            .feedback-form-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
            }
            
            .feedback-form-header h3 {
                margin: 0;
                font-size: 16px;
            }
            
            .feedback-form-close {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                font-size: 16px;
            }
            
            .feedback-form-field {
                margin-bottom: 16px;
            }
            
            .feedback-form-field label {
                display: block;
                margin-bottom: 8px;
                font-size: 12px;
                color: #ccc;
            }
            
            .feedback-form-field input,
            .feedback-form-field textarea,
            .feedback-form-field select {
                width: 100%;
                padding: 8px;
                background-color: #444;
                color: white;
                border: none;
                border-radius: 4px;
                font-family: monospace;
                font-size: 12px;
            }
            
            .feedback-form-field textarea {
                min-height: 100px;
            }
            
            .feedback-form-actions {
                display: flex;
                justify-content: flex-end;
                gap: 8px;
            }
            
            .feedback-form-actions button {
                padding: 8px 16px;
                background-color: #444;
                color: white;
                border: none;
                border-radius: 4px;
                font-family: monospace;
                font-size: 12px;
                cursor: pointer;
                transition: background-color 0.3s ease;
            }
            
            .feedback-form-actions button:hover {
                background-color: #555;
            }
            
            .feedback-form-actions button.submit {
                background-color: #4caf50;
            }
            
            .feedback-form-actions button.submit:hover {
                background-color: #3e8e41;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(toolbar);
        
        // Add event listeners
        toolbar.querySelector('.toolbar-header').addEventListener('click', function() {
            toolbar.classList.toggle('collapsed');
        });
        
        // Initially collapsed on mobile
        if (window.innerWidth < 768) {
            toolbar.classList.add('collapsed');
        }
        
        // Device select
        const deviceSelect = document.getElementById('device-select');
        deviceSelect.addEventListener('change', function() {
            const device = deviceSelect.value;
            simulateDevice(device);
        });
        
        // Network select
        const networkSelect = document.getElementById('network-select');
        networkSelect.addEventListener('change', function() {
            const network = networkSelect.value;
            simulateNetwork(network);
        });
        
        // Clear cache button
        const clearCacheBtn = document.getElementById('clear-cache-btn');
        clearCacheBtn.addEventListener('click', function() {
            clearCache();
        });
        
        // Reload button
        const reloadBtn = document.getElementById('reload-btn');
        reloadBtn.addEventListener('click', function() {
            window.location.reload();
        });
        
        // Feedback button
        const feedbackBtn = document.getElementById('feedback-btn');
        feedbackBtn.addEventListener('click', function() {
            showFeedbackForm();
        });
    }
}

/**
 * Add device simulation
 */
function addDeviceSimulation() {
    // Create device frames container if it doesn't exist
    let deviceFrames = document.getElementById('device-frames');
    
    if (!deviceFrames) {
        deviceFrames = document.createElement('div');
        deviceFrames.id = 'device-frames';
        
        // Add device frames
        const devices = [
            { id: 'iphone-se', src: '../images/testing/iphone-se-frame.png' },
            { id: 'iphone-xr', src: '../images/testing/iphone-xr-frame.png' },
            { id: 'iphone-12', src: '../images/testing/iphone-12-frame.png' },
            { id: 'pixel-5', src: '../images/testing/pixel-5-frame.png' },
            { id: 'samsung-s20', src: '../images/testing/samsung-s20-frame.png' },
            { id: 'ipad', src: '../images/testing/ipad-frame.png' }
        ];
        
        devices.forEach(device => {
            const frame = document.createElement('div');
            frame.id = `${device.id}-frame`;
            frame.className = 'device-frame';
            frame.innerHTML = `<img src="${device.src}" alt="${device.id} frame">`;
            deviceFrames.appendChild(frame);
        });
        
        document.body.appendChild(deviceFrames);
    }
}

/**
 * Simulate device
 * @param {string} device - Device to simulate
 */
function simulateDevice(device) {
    // Remove active class from all device frames
    const deviceFrames = document.querySelectorAll('.device-frame');
    deviceFrames.forEach(frame => {
        frame.classList.remove('active');
    });
    
    // If no simulation, return
    if (device === 'none') {
        return;
    }
    
    // Add active class to selected device frame
    const selectedFrame = document.getElementById(`${device}-frame`);
    if (selectedFrame) {
        selectedFrame.classList.add('active');
    }
    
    // Set viewport size based on device
    const viewportSizes = {
        'iphone-se': { width: 375, height: 667 },
        'iphone-xr': { width: 414, height: 896 },
        'iphone-12': { width: 390, height: 844 },
        'pixel-5': { width: 393, height: 851 },
        'samsung-s20': { width: 360, height: 800 },
        'ipad': { width: 768, height: 1024 }
    };
    
    // Log viewport size
    if (viewportSizes[device]) {
        console.log(`Simulating ${device} with viewport size ${viewportSizes[device].width}x${viewportSizes[device].height}`);
    }
}

/**
 * Simulate network
 * @param {string} network - Network to simulate
 */
function simulateNetwork(network) {
    // If no simulation, return
    if (network === 'none') {
        // Remove any existing network simulation
        if (window.networkSimulation) {
            clearTimeout(window.networkSimulation.timeout);
            window.networkSimulation = null;
        }
        
        console.log('Network simulation disabled');
        return;
    }
    
    // Network simulation settings
    const networkSettings = {
        'fast-3g': {
            latency: 100,
            downloadSpeed: 1.5 * 1024 * 1024 / 8, // 1.5 Mbps
            uploadSpeed: 750 * 1024 / 8 // 750 Kbps
        },
        'slow-3g': {
            latency: 300,
            downloadSpeed: 400 * 1024 / 8, // 400 Kbps
            uploadSpeed: 300 * 1024 / 8 // 300 Kbps
        },
        'offline': {
            latency: 0,
            downloadSpeed: 0,
            uploadSpeed: 0
        }
    };
    
    // Get network settings
    const settings = networkSettings[network];
    
    if (!settings) {
        console.error(`Unknown network type: ${network}`);
        return;
    }
    
    // Log network simulation
    console.log(`Simulating ${network} network with latency ${settings.latency}ms, download speed ${settings.downloadSpeed} bytes/s, upload speed ${settings.uploadSpeed} bytes/s`);
    
    // Simulate network
    if (network === 'offline') {
        // Simulate offline
        window.dispatchEvent(new Event('offline'));
    } else {
        // Simulate online with throttling
        window.dispatchEvent(new Event('online'));
        
        // Override fetch and XMLHttpRequest
        const originalFetch = window.fetch;
        const originalXHROpen = XMLHttpRequest.prototype.open;
        const originalXHRSend = XMLHttpRequest.prototype.send;
        
        // Override fetch
        window.fetch = function(input, init) {
            return new Promise((resolve, reject) => {
                // Simulate latency
                setTimeout(() => {
                    // If offline, reject
                    if (network === 'offline') {
                        reject(new Error('Network request failed'));
                        return;
                    }
                    
                    // Otherwise, call original fetch
                    originalFetch(input, init)
                        .then(response => {
                            // Simulate download speed
                            const originalJson = response.json;
                            const originalText = response.text;
                            
                            response.json = function() {
                                return originalJson.call(this).then(data => {
                                    // Simulate download speed
                                    const size = JSON.stringify(data).length;
                                    const delay = size / settings.downloadSpeed * 1000;
                                    
                                    return new Promise(resolve => {
                                        setTimeout(() => {
                                            resolve(data);
                                        }, delay);
                                    });
                                });
                            };
                            
                            response.text = function() {
                                return originalText.call(this).then(text => {
                                    // Simulate download speed
                                    const size = text.length;
                                    const delay = size / settings.downloadSpeed * 1000;
                                    
                                    return new Promise(resolve => {
                                        setTimeout(() => {
                                            resolve(text);
                                        }, delay);
                                    });
                                });
                            };
                            
                            resolve(response);
                        })
                        .catch(reject);
                }, settings.latency);
            });
        };
        
        // Override XMLHttpRequest
        XMLHttpRequest.prototype.open = function() {
            this._networkSimulation = {
                startTime: Date.now()
            };
            
            return originalXHROpen.apply(this, arguments);
        };
        
        XMLHttpRequest.prototype.send = function() {
            const xhr = this;
            
            // Simulate latency
            setTimeout(() => {
                // If offline, trigger error
                if (network === 'offline') {
                    xhr.dispatchEvent(new Event('error'));
                    return;
                }
                
                // Otherwise, call original send
                originalXHRSend.apply(xhr, arguments);
            }, settings.latency);
        };
        
        // Store simulation for cleanup
        window.networkSimulation = {
            originalFetch,
            originalXHROpen,
            originalXHRSend,
            timeout: setTimeout(() => {
                // Restore original functions after 1 hour
                window.fetch = originalFetch;
                XMLHttpRequest.prototype.open = originalXHROpen;
                XMLHttpRequest.prototype.send = originalXHRSend;
                
                window.networkSimulation = null;
                
                console.log('Network simulation disabled after 1 hour');
            }, 60 * 60 * 1000)
        };
    }
}

/**
 * Clear cache
 */
function clearCache() {
    // Clear localStorage
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear cookies
    document.cookie.split(';').forEach(cookie => {
        const name = cookie.split('=')[0].trim();
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
    
    // Clear cache
    if ('caches' in window) {
        caches.keys().then(cacheNames => {
            cacheNames.forEach(cacheName => {
                caches.delete(cacheName);
            });
        });
    }
    
    console.log('Cache cleared');
    
    // Show confirmation
    alert('Cache cleared. Reloading page...');
    
    // Reload page
    window.location.reload();
}

/**
 * Add feedback form
 */
function addFeedbackForm() {
    // Create feedback form if it doesn't exist
    let feedbackForm = document.getElementById('feedback-form');
    
    if (!feedbackForm) {
        feedbackForm = document.createElement('div');
        feedbackForm.id = 'feedback-form';
        feedbackForm.className = 'feedback-form';
        feedbackForm.innerHTML = `
            <div class="feedback-form-content">
                <div class="feedback-form-header">
                    <h3>Give Feedback</h3>
                    <button class="feedback-form-close">&times;</button>
                </div>
                <div class="feedback-form-field">
                    <label for="feedback-type">Feedback Type</label>
                    <select id="feedback-type">
                        <option value="bug">Bug Report</option>
                        <option value="feature">Feature Request</option>
                        <option value="usability">Usability Issue</option>
                        <option value="performance">Performance Issue</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div class="feedback-form-field">
                    <label for="feedback-title">Title</label>
                    <input type="text" id="feedback-title" placeholder="Brief description of the issue">
                </div>
                <div class="feedback-form-field">
                    <label for="feedback-description">Description</label>
                    <textarea id="feedback-description" placeholder="Detailed description of the issue"></textarea>
                </div>
                <div class="feedback-form-field">
                    <label for="feedback-steps">Steps to Reproduce (if applicable)</label>
                    <textarea id="feedback-steps" placeholder="1. Go to...\n2. Click on...\n3. Observe..."></textarea>
                </div>
                <div class="feedback-form-field">
                    <label for="feedback-device">Device Information</label>
                    <input type="text" id="feedback-device" readonly>
                </div>
                <div class="feedback-form-actions">
                    <button class="cancel">Cancel</button>
                    <button class="submit">Submit Feedback</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(feedbackForm);
        
        // Add event listeners
        feedbackForm.querySelector('.feedback-form-close').addEventListener('click', function() {
            feedbackForm.classList.remove('active');
        });
        
        feedbackForm.querySelector('.feedback-form-actions .cancel').addEventListener('click', function() {
            feedbackForm.classList.remove('active');
        });
        
        feedbackForm.querySelector('.feedback-form-actions .submit').addEventListener('click', function() {
            submitFeedback();
        });
        
        // Set device information
        const deviceInfo = document.getElementById('feedback-device');
        deviceInfo.value = `${navigator.userAgent} - ${window.innerWidth}x${window.innerHeight}`;
    }
}

/**
 * Show feedback form
 */
function showFeedbackForm() {
    const feedbackForm = document.getElementById('feedback-form');
    
    if (feedbackForm) {
        feedbackForm.classList.add('active');
    }
}

/**
 * Submit feedback
 */
function submitFeedback() {
    // Get form values
    const type = document.getElementById('feedback-type').value;
    const title = document.getElementById('feedback-title').value;
    const description = document.getElementById('feedback-description').value;
    const steps = document.getElementById('feedback-steps').value;
    const device = document.getElementById('feedback-device').value;
    
    // Validate form
    if (!title) {
        alert('Please enter a title');
        return;
    }
    
    if (!description) {
        alert('Please enter a description');
        return;
    }
    
    // Create feedback object
    const feedback = {
        type,
        title,
        description,
        steps,
        device,
        url: window.location.href,
        timestamp: new Date().toISOString()
    };
    
    // Log feedback
    console.log('Feedback submitted:', feedback);
    
    // Store feedback in localStorage
    const feedbackList = JSON.parse(localStorage.getItem('feedback') || '[]');
    feedbackList.push(feedback);
    localStorage.setItem('feedback', JSON.stringify(feedbackList));
    
    // Show confirmation
    alert('Thank you for your feedback!');
    
    // Close form
    const feedbackForm = document.getElementById('feedback-form');
    
    if (feedbackForm) {
        feedbackForm.classList.remove('active');
    }
    
    // Reset form
    document.getElementById('feedback-title').value = '';
    document.getElementById('feedback-description').value = '';
    document.getElementById('feedback-steps').value = '';
}

/**
 * Add performance monitoring
 */
function addPerformanceMonitoring() {
    // Check if Performance API is supported
    if (!('performance' in window) || !('PerformanceObserver' in window)) {
        console.log('Performance API not supported');
        return;
    }
    
    // First Contentful Paint (FCP)
    const fcpObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        
        if (entries.length > 0) {
            const fcp = entries[0];
            const fcpValue = document.getElementById('fcp-value');
            
            if (fcpValue) {
                const fcpTime = Math.round(fcp.startTime);
                fcpValue.textContent = `${fcpTime} ms`;
                
                // Add color based on performance
                if (fcpTime < 1000) {
                    fcpValue.className = 'metric-value good';
                } else if (fcpTime < 3000) {
                    fcpValue.className = 'metric-value average';
                } else {
                    fcpValue.className = 'metric-value poor';
                }
            }
        }
    });
    
    fcpObserver.observe({ type: 'paint', buffered: true });
    
    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        
        if (entries.length > 0) {
            const lcp = entries[entries.length - 1];
            const lcpValue = document.getElementById('lcp-value');
            
            if (lcpValue) {
                const lcpTime = Math.round(lcp.startTime);
                lcpValue.textContent = `${lcpTime} ms`;
                
                // Add color based on performance
                if (lcpTime < 2500) {
                    lcpValue.className = 'metric-value good';
                } else if (lcpTime < 4000) {
                    lcpValue.className = 'metric-value average';
                } else {
                    lcpValue.className = 'metric-value poor';
                }
            }
        }
    });
    
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    
    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    let clsEntries = [];
    
    const clsObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        
        entries.forEach(entry => {
            // Only count layout shifts without recent user input
            if (!entry.hadRecentInput) {
                clsEntries.push(entry);
                clsValue += entry.value;
            }
        });
        
        const clsValueElement = document.getElementById('cls-value');
        
        if (clsValueElement) {
            clsValueElement.textContent = clsValue.toFixed(3);
            
            // Add color based on performance
            if (clsValue < 0.1) {
                clsValueElement.className = 'metric-value good';
            } else if (clsValue < 0.25) {
                clsValueElement.className = 'metric-value average';
            } else {
                clsValueElement.className = 'metric-value poor';
            }
        }
    });
    
    clsObserver.observe({ type: 'layout-shift', buffered: true });
}
