/**
 * Touch Gestures for Rregullo Tiranen
 * Implements mobile-specific touch gestures for better mobile experience
 */

document.addEventListener('DOMContentLoaded', function() {
    // Only initialize on touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        console.log('Touch device detected, initializing touch gestures');
        initTouchGestures();
    }
});

/**
 * Initialize touch gestures
 */
function initTouchGestures() {
    // Pull to refresh functionality
    initPullToRefresh();
    
    // Swipe navigation for image galleries
    initSwipeGalleries();
    
    // Double tap to zoom on maps
    initMapDoubleTap();
}

/**
 * Initialize pull to refresh functionality
 */
function initPullToRefresh() {
    let startY = 0;
    let pullDistance = 0;
    const threshold = 150; // Minimum pull distance to trigger refresh
    let isPulling = false;
    let refreshIndicator;
    
    // Create refresh indicator if it doesn't exist
    if (!document.getElementById('pull-to-refresh')) {
        refreshIndicator = document.createElement('div');
        refreshIndicator.id = 'pull-to-refresh';
        refreshIndicator.style.cssText = `
            position: fixed;
            top: -60px;
            left: 0;
            right: 0;
            height: 60px;
            background-color: var(--color-primary, #C41E3A);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.3s ease;
            z-index: 1000;
        `;
        refreshIndicator.innerHTML = '<span>Tërhiqni për të rifreskuar</span>';
        document.body.appendChild(refreshIndicator);
    } else {
        refreshIndicator = document.getElementById('pull-to-refresh');
    }
    
    // Touch start event
    document.addEventListener('touchstart', function(e) {
        // Only enable pull to refresh at the top of the page
        if (window.scrollY <= 0) {
            startY = e.touches[0].clientY;
            isPulling = true;
        }
    }, { passive: true });
    
    // Touch move event
    document.addEventListener('touchmove', function(e) {
        if (!isPulling) return;
        
        const currentY = e.touches[0].clientY;
        pullDistance = currentY - startY;
        
        // Only allow pulling down
        if (pullDistance > 0 && window.scrollY <= 0) {
            // Calculate how far to show the indicator (with resistance)
            const pullProgress = Math.min(pullDistance / threshold, 1);
            const indicatorPosition = Math.min(pullDistance * 0.4, 60);
            
            refreshIndicator.style.transform = `translateY(${indicatorPosition}px)`;
            
            // Update text based on progress
            if (pullProgress >= 1) {
                refreshIndicator.querySelector('span').textContent = 'Lëshoni për të rifreskuar';
            } else {
                refreshIndicator.querySelector('span').textContent = 'Tërhiqni për të rifreskuar';
            }
            
            // Prevent default scrolling when pulling
            if (e.cancelable) {
                e.preventDefault();
            }
        }
    }, { passive: false });
    
    // Touch end event
    document.addEventListener('touchend', function() {
        if (!isPulling) return;
        
        if (pullDistance >= threshold) {
            // Show loading state
            refreshIndicator.querySelector('span').textContent = 'Duke rifreskuar...';
            
            // Reload the page after a short delay
            setTimeout(() => {
                window.location.reload();
            }, 500);
        } else {
            // Reset indicator position
            refreshIndicator.style.transform = 'translateY(-60px)';
        }
        
        // Reset variables
        isPulling = false;
        pullDistance = 0;
    }, { passive: true });
}

/**
 * Initialize swipe gestures for image galleries
 */
function initSwipeGalleries() {
    // Find all galleries
    const galleries = document.querySelectorAll('.gallery, .image-slider, .carousel');
    
    galleries.forEach(gallery => {
        let startX = 0;
        let currentIndex = 0;
        const items = gallery.querySelectorAll('.gallery-item, .slide, .carousel-item');
        if (!items.length) return;
        
        // Add navigation dots if they don't exist
        if (!gallery.querySelector('.gallery-dots')) {
            const dotsContainer = document.createElement('div');
            dotsContainer.className = 'gallery-dots';
            
            for (let i = 0; i < items.length; i++) {
                const dot = document.createElement('span');
                dot.className = i === 0 ? 'dot active' : 'dot';
                dot.addEventListener('click', () => {
                    goToSlide(i);
                });
                dotsContainer.appendChild(dot);
            }
            
            gallery.appendChild(dotsContainer);
        }
        
        // Function to go to a specific slide
        function goToSlide(index) {
            // Ensure index is within bounds
            if (index < 0) index = items.length - 1;
            if (index >= items.length) index = 0;
            
            // Update current index
            currentIndex = index;
            
            // Update slides
            items.forEach((item, i) => {
                item.style.transform = `translateX(${(i - index) * 100}%)`;
                item.style.transition = 'transform 0.3s ease';
            });
            
            // Update dots
            const dots = gallery.querySelectorAll('.gallery-dots .dot');
            dots.forEach((dot, i) => {
                dot.className = i === index ? 'dot active' : 'dot';
            });
        }
        
        // Initialize slide positions
        items.forEach((item, i) => {
            item.style.position = 'absolute';
            item.style.left = 0;
            item.style.top = 0;
            item.style.width = '100%';
            item.style.transform = `translateX(${i * 100}%)`;
        });
        
        // Touch start event
        gallery.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
        }, { passive: true });
        
        // Touch end event
        gallery.addEventListener('touchend', function(e) {
            const endX = e.changedTouches[0].clientX;
            const diffX = endX - startX;
            
            // Determine if it was a swipe (minimum 50px)
            if (Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    // Swipe right, go to previous
                    goToSlide(currentIndex - 1);
                } else {
                    // Swipe left, go to next
                    goToSlide(currentIndex + 1);
                }
            }
        }, { passive: true });
    });
}

/**
 * Initialize double tap to zoom on maps
 */
function initMapDoubleTap() {
    // Find all map containers
    const maps = document.querySelectorAll('.map-container, #map');
    
    maps.forEach(map => {
        let lastTap = 0;
        let tapTimeout;
        
        map.addEventListener('touchend', function(e) {
            // Clear any existing timeout
            clearTimeout(tapTimeout);
            
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            
            // Check if it's a double tap (within 300ms)
            if (tapLength < 300 && tapLength > 0) {
                // Double tap detected
                e.preventDefault();
                
                // Get tap position
                const touch = e.changedTouches[0];
                const x = touch.clientX;
                const y = touch.clientY;
                
                // Check if we have a Leaflet map instance
                if (window.myMap && typeof window.myMap.setZoom === 'function') {
                    // Get current zoom
                    const currentZoom = window.myMap.getZoom();
                    
                    // Convert screen coordinates to map coordinates
                    const point = window.myMap.containerPointToLatLng([x, y]);
                    
                    // Zoom in or out based on current zoom
                    if (currentZoom >= window.myMap.getMaxZoom()) {
                        // If at max zoom, zoom out
                        window.myMap.setView(point, currentZoom - 2);
                    } else {
                        // Otherwise zoom in
                        window.myMap.setView(point, currentZoom + 1);
                    }
                }
                
                // Reset last tap
                lastTap = 0;
            } else {
                // First tap
                lastTap = currentTime;
                
                // Set a timeout to reset last tap if second tap doesn't happen
                tapTimeout = setTimeout(function() {
                    lastTap = 0;
                }, 300);
            }
        }, { passive: false });
    });
}
