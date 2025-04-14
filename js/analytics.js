/**
 * Analytics for Rregullo Tiranen
 * Implements analytics tracking for user interactions and performance metrics
 */

// Initialize analytics when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize analytics
    initAnalytics();
});

/**
 * Initialize analytics
 */
function initAnalytics() {
    // Create analytics object
    window.RregulloAnalytics = {
        // Configuration
        config: {
            // Whether to enable analytics
            enabled: true,
            // Whether to enable debug mode
            debug: false,
            // Whether to track performance metrics
            trackPerformance: true,
            // Whether to track user interactions
            trackInteractions: true,
            // Whether to track page views
            trackPageViews: true,
            // Whether to track errors
            trackErrors: true,
            // Whether to track network requests
            trackNetwork: true,
            // Whether to respect Do Not Track
            respectDoNotTrack: true,
            // Endpoint for sending analytics data
            endpoint: '/api/analytics',
            // Session ID
            sessionId: generateSessionId(),
            // User ID (if available)
            userId: getUserId(),
            // Device information
            device: getDeviceInfo()
        },
        
        // Events queue
        events: [],
        
        // Performance metrics
        performance: {},
        
        // Initialize analytics
        init: function(options) {
            // Merge options with default config
            if (options) {
                this.config = { ...this.config, ...options };
            }
            
            // Check if analytics should be enabled
            if (this.shouldEnableAnalytics()) {
                this.debug('Analytics initialized');
                
                // Track page view
                if (this.config.trackPageViews) {
                    this.trackPageView();
                }
                
                // Track performance metrics
                if (this.config.trackPerformance) {
                    this.trackPerformanceMetrics();
                }
                
                // Track user interactions
                if (this.config.trackInteractions) {
                    this.trackUserInteractions();
                }
                
                // Track errors
                if (this.config.trackErrors) {
                    this.trackErrors();
                }
                
                // Track network requests
                if (this.config.trackNetwork) {
                    this.trackNetworkRequests();
                }
                
                // Send events periodically
                this.startEventSending();
            } else {
                this.debug('Analytics disabled');
            }
        },
        
        // Check if analytics should be enabled
        shouldEnableAnalytics: function() {
            // Check if analytics is enabled in config
            if (!this.config.enabled) {
                return false;
            }
            
            // Check if Do Not Track is enabled
            if (this.config.respectDoNotTrack && (
                navigator.doNotTrack === '1' ||
                navigator.doNotTrack === 'yes' ||
                navigator.msDoNotTrack === '1' ||
                window.doNotTrack === '1'
            )) {
                return false;
            }
            
            return true;
        },
        
        // Track page view
        trackPageView: function() {
            this.debug('Tracking page view');
            
            // Get page information
            const page = {
                title: document.title,
                url: window.location.href,
                path: window.location.pathname,
                referrer: document.referrer,
                timestamp: new Date().toISOString()
            };
            
            // Add to events queue
            this.addEvent('page_view', page);
        },
        
        // Track performance metrics
        trackPerformanceMetrics: function() {
            this.debug('Tracking performance metrics');
            
            // Check if Performance API is supported
            if (!('performance' in window) || !('PerformanceObserver' in window)) {
                this.debug('Performance API not supported');
                return;
            }
            
            // Track navigation timing
            this.trackNavigationTiming();
            
            // Track First Contentful Paint (FCP)
            this.trackFCP();
            
            // Track Largest Contentful Paint (LCP)
            this.trackLCP();
            
            // Track Cumulative Layout Shift (CLS)
            this.trackCLS();
            
            // Track First Input Delay (FID)
            this.trackFID();
        },
        
        // Track navigation timing
        trackNavigationTiming: function() {
            // Get navigation timing
            const timing = performance.timing || performance.getEntriesByType('navigation')[0];
            
            if (!timing) {
                this.debug('Navigation timing not available');
                return;
            }
            
            // Calculate timing metrics
            const navigationStart = timing.navigationStart || timing.startTime;
            const metrics = {
                dnsLookup: (timing.domainLookupEnd - timing.domainLookupStart) || 0,
                tcpConnection: (timing.connectEnd - timing.connectStart) || 0,
                serverResponse: (timing.responseStart - timing.requestStart) || 0,
                domLoading: (timing.domLoading - navigationStart) || 0,
                domInteractive: (timing.domInteractive - navigationStart) || 0,
                domComplete: (timing.domComplete - navigationStart) || 0,
                loadEvent: (timing.loadEventEnd - timing.loadEventStart) || 0,
                totalPageLoad: (timing.loadEventEnd - navigationStart) || 0
            };
            
            // Store metrics
            this.performance.navigationTiming = metrics;
            
            // Add to events queue
            this.addEvent('performance_navigation', metrics);
        },
        
        // Track First Contentful Paint (FCP)
        trackFCP: function() {
            // Create observer
            const fcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                
                if (entries.length > 0) {
                    const fcp = entries[0];
                    const fcpTime = Math.round(fcp.startTime);
                    
                    // Store metric
                    this.performance.fcp = fcpTime;
                    
                    // Add to events queue
                    this.addEvent('performance_fcp', { value: fcpTime });
                    
                    // Disconnect observer
                    fcpObserver.disconnect();
                }
            });
            
            // Start observing
            fcpObserver.observe({ type: 'paint', buffered: true });
        },
        
        // Track Largest Contentful Paint (LCP)
        trackLCP: function() {
            // Create observer
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                
                if (entries.length > 0) {
                    const lcp = entries[entries.length - 1];
                    const lcpTime = Math.round(lcp.startTime);
                    
                    // Store metric
                    this.performance.lcp = lcpTime;
                    
                    // Add to events queue
                    this.addEvent('performance_lcp', { value: lcpTime });
                }
            });
            
            // Start observing
            lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
            
            // Disconnect observer when page is unloaded
            window.addEventListener('beforeunload', () => {
                lcpObserver.disconnect();
            });
        },
        
        // Track Cumulative Layout Shift (CLS)
        trackCLS: function() {
            let clsValue = 0;
            let clsEntries = [];
            
            // Create observer
            const clsObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                
                entries.forEach(entry => {
                    // Only count layout shifts without recent user input
                    if (!entry.hadRecentInput) {
                        clsEntries.push(entry);
                        clsValue += entry.value;
                    }
                });
                
                // Store metric
                this.performance.cls = clsValue;
                
                // Add to events queue (periodically)
                if (clsEntries.length % 5 === 0) {
                    this.addEvent('performance_cls', { value: clsValue });
                }
            });
            
            // Start observing
            clsObserver.observe({ type: 'layout-shift', buffered: true });
            
            // Disconnect observer when page is unloaded
            window.addEventListener('beforeunload', () => {
                clsObserver.disconnect();
                
                // Add final CLS value to events queue
                this.addEvent('performance_cls_final', { value: clsValue });
            });
        },
        
        // Track First Input Delay (FID)
        trackFID: function() {
            // Create observer
            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                
                entries.forEach(entry => {
                    // First input only
                    if (entry.name === 'first-input') {
                        const fidTime = Math.round(entry.processingStart - entry.startTime);
                        
                        // Store metric
                        this.performance.fid = fidTime;
                        
                        // Add to events queue
                        this.addEvent('performance_fid', { value: fidTime });
                        
                        // Disconnect observer
                        fidObserver.disconnect();
                    }
                });
            });
            
            // Start observing
            fidObserver.observe({ type: 'first-input', buffered: true });
        },
        
        // Track user interactions
        trackUserInteractions: function() {
            this.debug('Tracking user interactions');
            
            // Track clicks
            document.addEventListener('click', (event) => {
                // Get target element
                const target = event.target;
                
                // Skip if target is not an interactive element
                if (!this.isInteractiveElement(target)) {
                    return;
                }
                
                // Get element information
                const element = this.getElementInfo(target);
                
                // Add to events queue
                this.addEvent('user_click', element);
            });
            
            // Track form submissions
            document.addEventListener('submit', (event) => {
                // Get form element
                const form = event.target;
                
                // Get form information
                const formInfo = {
                    id: form.id || '',
                    name: form.name || '',
                    action: form.action || '',
                    method: form.method || '',
                    fields: form.elements.length
                };
                
                // Add to events queue
                this.addEvent('form_submit', formInfo);
            });
            
            // Track page visibility changes
            document.addEventListener('visibilitychange', () => {
                const visibilityState = document.visibilityState;
                
                // Add to events queue
                this.addEvent('visibility_change', { state: visibilityState });
                
                // If page becomes visible again, track as re-engagement
                if (visibilityState === 'visible') {
                    this.addEvent('user_re_engagement', { timestamp: new Date().toISOString() });
                }
            });
            
            // Track mobile-specific interactions
            this.trackMobileInteractions();
        },
        
        // Track mobile-specific interactions
        trackMobileInteractions: function() {
            // Check if device is mobile
            if (!this.config.device.isMobile) {
                return;
            }
            
            // Track touch interactions
            document.addEventListener('touchstart', (event) => {
                // Store touch start time
                this._touchStartTime = Date.now();
            });
            
            document.addEventListener('touchend', (event) => {
                // Skip if no touch start time
                if (!this._touchStartTime) {
                    return;
                }
                
                // Calculate touch duration
                const touchDuration = Date.now() - this._touchStartTime;
                
                // Get target element
                const target = event.target;
                
                // Skip if target is not an interactive element
                if (!this.isInteractiveElement(target)) {
                    return;
                }
                
                // Get element information
                const element = this.getElementInfo(target);
                
                // Add touch duration
                element.touchDuration = touchDuration;
                
                // Add to events queue
                this.addEvent('mobile_touch', element);
                
                // Reset touch start time
                this._touchStartTime = null;
            });
            
            // Track device orientation changes
            window.addEventListener('orientationchange', () => {
                // Get orientation
                const orientation = window.orientation;
                
                // Add to events queue
                this.addEvent('orientation_change', { orientation });
            });
            
            // Track offline/online status
            window.addEventListener('online', () => {
                this.addEvent('connection_change', { status: 'online' });
            });
            
            window.addEventListener('offline', () => {
                this.addEvent('connection_change', { status: 'offline' });
            });
        },
        
        // Track errors
        trackErrors: function() {
            this.debug('Tracking errors');
            
            // Track JavaScript errors
            window.addEventListener('error', (event) => {
                // Get error information
                const error = {
                    message: event.message || '',
                    filename: event.filename || '',
                    lineno: event.lineno || 0,
                    colno: event.colno || 0,
                    stack: event.error ? (event.error.stack || '') : ''
                };
                
                // Add to events queue
                this.addEvent('js_error', error);
            });
            
            // Track unhandled promise rejections
            window.addEventListener('unhandledrejection', (event) => {
                // Get rejection information
                const rejection = {
                    message: event.reason ? (event.reason.message || String(event.reason)) : '',
                    stack: event.reason && event.reason.stack ? event.reason.stack : ''
                };
                
                // Add to events queue
                this.addEvent('promise_rejection', rejection);
            });
        },
        
        // Track network requests
        trackNetworkRequests: function() {
            this.debug('Tracking network requests');
            
            // Check if fetch is supported
            if ('fetch' in window) {
                // Store original fetch
                const originalFetch = window.fetch;
                
                // Override fetch
                window.fetch = (input, init) => {
                    // Get request information
                    const url = typeof input === 'string' ? input : input.url;
                    const method = init && init.method ? init.method : 'GET';
                    
                    // Start time
                    const startTime = Date.now();
                    
                    // Add to events queue
                    const requestId = this.addEvent('network_request_start', {
                        url,
                        method,
                        startTime
                    });
                    
                    // Call original fetch
                    return originalFetch(input, init)
                        .then(response => {
                            // End time
                            const endTime = Date.now();
                            
                            // Add to events queue
                            this.addEvent('network_request_end', {
                                requestId,
                                url,
                                method,
                                status: response.status,
                                duration: endTime - startTime
                            });
                            
                            return response;
                        })
                        .catch(error => {
                            // End time
                            const endTime = Date.now();
                            
                            // Add to events queue
                            this.addEvent('network_request_error', {
                                requestId,
                                url,
                                method,
                                error: error.message,
                                duration: endTime - startTime
                            });
                            
                            throw error;
                        });
                };
            }
            
            // Check if XMLHttpRequest is supported
            if ('XMLHttpRequest' in window) {
                // Store original open and send
                const originalOpen = XMLHttpRequest.prototype.open;
                const originalSend = XMLHttpRequest.prototype.send;
                
                // Override open
                XMLHttpRequest.prototype.open = function(method, url) {
                    // Store request information
                    this._analyticsRequestInfo = {
                        method,
                        url
                    };
                    
                    // Call original open
                    return originalOpen.apply(this, arguments);
                };
                
                // Override send
                XMLHttpRequest.prototype.send = function() {
                    // Skip if no request information
                    if (!this._analyticsRequestInfo) {
                        return originalSend.apply(this, arguments);
                    }
                    
                    // Get request information
                    const { method, url } = this._analyticsRequestInfo;
                    
                    // Start time
                    const startTime = Date.now();
                    
                    // Add to events queue
                    const requestId = window.RregulloAnalytics.addEvent('network_request_start', {
                        url,
                        method,
                        startTime
                    });
                    
                    // Store request ID
                    this._analyticsRequestId = requestId;
                    
                    // Add load event listener
                    this.addEventListener('load', function() {
                        // End time
                        const endTime = Date.now();
                        
                        // Add to events queue
                        window.RregulloAnalytics.addEvent('network_request_end', {
                            requestId: this._analyticsRequestId,
                            url,
                            method,
                            status: this.status,
                            duration: endTime - startTime
                        });
                    });
                    
                    // Add error event listener
                    this.addEventListener('error', function() {
                        // End time
                        const endTime = Date.now();
                        
                        // Add to events queue
                        window.RregulloAnalytics.addEvent('network_request_error', {
                            requestId: this._analyticsRequestId,
                            url,
                            method,
                            error: 'Network error',
                            duration: endTime - startTime
                        });
                    });
                    
                    // Call original send
                    return originalSend.apply(this, arguments);
                };
            }
        },
        
        // Start event sending
        startEventSending: function() {
            // Send events immediately if in debug mode
            if (this.config.debug) {
                this.sendEvents();
            }
            
            // Send events periodically
            setInterval(() => {
                this.sendEvents();
            }, 30000); // Every 30 seconds
            
            // Send events when page is unloaded
            window.addEventListener('beforeunload', () => {
                this.sendEvents(true);
            });
        },
        
        // Send events
        sendEvents: function(sync = false) {
            // Skip if no events
            if (this.events.length === 0) {
                return;
            }
            
            this.debug(`Sending ${this.events.length} events`);
            
            // Get events to send
            const events = [...this.events];
            
            // Clear events queue
            this.events = [];
            
            // Prepare data
            const data = {
                sessionId: this.config.sessionId,
                userId: this.config.userId,
                device: this.config.device,
                events
            };
            
            // Send data
            if (sync) {
                // Use synchronous XMLHttpRequest
                const xhr = new XMLHttpRequest();
                xhr.open('POST', this.config.endpoint, false);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.send(JSON.stringify(data));
            } else {
                // Use asynchronous fetch
                fetch(this.config.endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data),
                    // Don't track this request
                    _analyticsIgnore: true
                }).catch(error => {
                    this.debug(`Error sending events: ${error.message}`);
                    
                    // Add events back to queue
                    this.events = [...events, ...this.events];
                });
            }
        },
        
        // Add event to queue
        addEvent: function(type, data) {
            // Generate event ID
            const eventId = generateId();
            
            // Create event
            const event = {
                id: eventId,
                type,
                timestamp: Date.now(),
                data
            };
            
            // Add to events queue
            this.events.push(event);
            
            // Log event in debug mode
            this.debug(`Event: ${type}`, data);
            
            // Return event ID
            return eventId;
        },
        
        // Check if element is interactive
        isInteractiveElement: function(element) {
            // Get element tag name
            const tagName = element.tagName.toLowerCase();
            
            // Check if element is interactive
            return (
                tagName === 'a' ||
                tagName === 'button' ||
                tagName === 'input' ||
                tagName === 'select' ||
                tagName === 'textarea' ||
                element.hasAttribute('role') ||
                element.hasAttribute('tabindex') ||
                element.classList.contains('btn') ||
                element.classList.contains('button') ||
                element.getAttribute('role') === 'button' ||
                element.getAttribute('role') === 'link'
            );
        },
        
        // Get element information
        getElementInfo: function(element) {
            // Get element tag name
            const tagName = element.tagName.toLowerCase();
            
            // Get element information
            return {
                tagName,
                id: element.id || '',
                className: element.className || '',
                text: element.textContent ? element.textContent.trim().substring(0, 50) : '',
                href: element.href || '',
                role: element.getAttribute('role') || '',
                ariaLabel: element.getAttribute('aria-label') || '',
                path: this.getElementPath(element)
            };
        },
        
        // Get element path
        getElementPath: function(element) {
            // Maximum path length
            const maxPathLength = 5;
            
            // Path elements
            const path = [];
            
            // Current element
            let current = element;
            
            // Build path
            while (current && path.length < maxPathLength) {
                // Get element tag name
                const tagName = current.tagName.toLowerCase();
                
                // Get element ID
                const id = current.id ? `#${current.id}` : '';
                
                // Get element classes
                const classes = current.className ? `.${current.className.trim().replace(/\s+/g, '.')}` : '';
                
                // Add to path
                path.unshift(`${tagName}${id}${classes}`);
                
                // Move to parent element
                current = current.parentElement;
            }
            
            // Return path
            return path.join(' > ');
        },
        
        // Debug log
        debug: function(message, data) {
            // Skip if debug mode is disabled
            if (!this.config.debug) {
                return;
            }
            
            // Log message
            if (data) {
                console.log(`[Analytics] ${message}`, data);
            } else {
                console.log(`[Analytics] ${message}`);
            }
        }
    };
    
    // Initialize analytics
    window.RregulloAnalytics.init();
}

/**
 * Generate session ID
 * @returns {string} - Session ID
 */
function generateSessionId() {
    // Check if session ID exists in session storage
    const sessionId = sessionStorage.getItem('analytics_session_id');
    
    if (sessionId) {
        return sessionId;
    }
    
    // Generate new session ID
    const newSessionId = generateId();
    
    // Store in session storage
    sessionStorage.setItem('analytics_session_id', newSessionId);
    
    return newSessionId;
}

/**
 * Generate ID
 * @returns {string} - Generated ID
 */
function generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Get user ID
 * @returns {string|null} - User ID or null if not available
 */
function getUserId() {
    // Check if user is logged in
    if (window.currentUser && window.currentUser.id) {
        return window.currentUser.id;
    }
    
    // Check if user ID exists in local storage
    const userId = localStorage.getItem('user_id');
    
    if (userId) {
        return userId;
    }
    
    return null;
}

/**
 * Get device information
 * @returns {Object} - Device information
 */
function getDeviceInfo() {
    // Get user agent
    const userAgent = navigator.userAgent;
    
    // Check if device is mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    // Get browser information
    const browser = getBrowserInfo();
    
    // Get operating system information
    const os = getOSInfo();
    
    // Get screen information
    const screen = {
        width: window.screen.width,
        height: window.screen.height,
        orientation: window.screen.orientation ? window.screen.orientation.type : '',
        pixelRatio: window.devicePixelRatio || 1
    };
    
    // Get connection information
    const connection = getConnectionInfo();
    
    return {
        userAgent,
        isMobile,
        browser,
        os,
        screen,
        connection,
        language: navigator.language || navigator.userLanguage || '',
        cookiesEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack === '1' || navigator.doNotTrack === 'yes' || navigator.msDoNotTrack === '1' || window.doNotTrack === '1'
    };
}

/**
 * Get browser information
 * @returns {Object} - Browser information
 */
function getBrowserInfo() {
    // Get user agent
    const userAgent = navigator.userAgent;
    
    // Default browser information
    const browser = {
        name: 'Unknown',
        version: 'Unknown'
    };
    
    // Check for Edge
    if (/Edg/.test(userAgent)) {
        browser.name = 'Edge';
        browser.version = userAgent.match(/Edg\/([\d.]+)/)[1];
    }
    // Check for Chrome
    else if (/Chrome/.test(userAgent)) {
        browser.name = 'Chrome';
        browser.version = userAgent.match(/Chrome\/([\d.]+)/)[1];
    }
    // Check for Firefox
    else if (/Firefox/.test(userAgent)) {
        browser.name = 'Firefox';
        browser.version = userAgent.match(/Firefox\/([\d.]+)/)[1];
    }
    // Check for Safari
    else if (/Safari/.test(userAgent)) {
        browser.name = 'Safari';
        browser.version = userAgent.match(/Safari\/([\d.]+)/)[1];
    }
    // Check for IE
    else if (/MSIE/.test(userAgent) || /Trident/.test(userAgent)) {
        browser.name = 'Internet Explorer';
        browser.version = userAgent.match(/(?:MSIE |rv:)([\d.]+)/)[1];
    }
    
    return browser;
}

/**
 * Get operating system information
 * @returns {Object} - Operating system information
 */
function getOSInfo() {
    // Get user agent
    const userAgent = navigator.userAgent;
    
    // Default OS information
    const os = {
        name: 'Unknown',
        version: 'Unknown'
    };
    
    // Check for Windows
    if (/Windows/.test(userAgent)) {
        os.name = 'Windows';
        os.version = userAgent.match(/Windows NT ([\d.]+)/)[1];
    }
    // Check for macOS
    else if (/Mac OS X/.test(userAgent)) {
        os.name = 'macOS';
        os.version = userAgent.match(/Mac OS X ([\d_.]+)/)[1].replace(/_/g, '.');
    }
    // Check for iOS
    else if (/iPhone|iPad|iPod/.test(userAgent)) {
        os.name = 'iOS';
        os.version = userAgent.match(/OS ([\d_]+)/)[1].replace(/_/g, '.');
    }
    // Check for Android
    else if (/Android/.test(userAgent)) {
        os.name = 'Android';
        os.version = userAgent.match(/Android ([\d.]+)/)[1];
    }
    // Check for Linux
    else if (/Linux/.test(userAgent)) {
        os.name = 'Linux';
        os.version = '';
    }
    
    return os;
}

/**
 * Get connection information
 * @returns {Object} - Connection information
 */
function getConnectionInfo() {
    // Default connection information
    const connection = {
        type: 'Unknown',
        effectiveType: 'Unknown',
        downlink: 0,
        rtt: 0
    };
    
    // Check if Network Information API is supported
    if ('connection' in navigator) {
        const networkInfo = navigator.connection;
        
        connection.type = networkInfo.type || 'Unknown';
        connection.effectiveType = networkInfo.effectiveType || 'Unknown';
        connection.downlink = networkInfo.downlink || 0;
        connection.rtt = networkInfo.rtt || 0;
    }
    
    return connection;
}
