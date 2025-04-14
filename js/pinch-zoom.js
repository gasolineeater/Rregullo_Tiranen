/**
 * Pinch Zoom for Rregullo Tiranen
 * Implements pinch-to-zoom functionality for maps
 */

document.addEventListener('DOMContentLoaded', function() {
    // Only initialize on touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        console.log('Touch device detected, initializing pinch zoom');
        initPinchZoom();
    }
});

/**
 * Initialize pinch zoom
 */
function initPinchZoom() {
    // Find map elements
    const mapElements = document.querySelectorAll('#map, .map-container, .leaflet-container');
    
    // Skip if no map elements found
    if (mapElements.length === 0) {
        console.log('No map elements found');
        return;
    }
    
    // For each map element
    mapElements.forEach(mapElement => {
        // Variables to track touch position and scale
        let initialDistance = 0;
        let initialScale = 1;
        let currentScale = 1;
        let isScaling = false;
        
        // Add touch event listeners
        mapElement.addEventListener('touchstart', handleTouchStart, { passive: false });
        mapElement.addEventListener('touchmove', handleTouchMove, { passive: false });
        mapElement.addEventListener('touchend', handleTouchEnd, { passive: false });
        
        /**
         * Handle touch start event
         * @param {TouchEvent} event - Touch event
         */
        function handleTouchStart(event) {
            // Skip if not two fingers
            if (event.touches.length !== 2) {
                return;
            }
            
            // Prevent default behavior (page zoom)
            event.preventDefault();
            
            // Calculate initial distance between fingers
            initialDistance = getDistance(
                event.touches[0].clientX,
                event.touches[0].clientY,
                event.touches[1].clientX,
                event.touches[1].clientY
            );
            
            // Set initial scale
            initialScale = currentScale;
            
            // Set scaling flag
            isScaling = true;
            
            console.log('Pinch zoom started');
        }
        
        /**
         * Handle touch move event
         * @param {TouchEvent} event - Touch event
         */
        function handleTouchMove(event) {
            // Skip if not scaling
            if (!isScaling) {
                return;
            }
            
            // Skip if not two fingers
            if (event.touches.length !== 2) {
                return;
            }
            
            // Prevent default behavior (page zoom)
            event.preventDefault();
            
            // Calculate current distance between fingers
            const currentDistance = getDistance(
                event.touches[0].clientX,
                event.touches[0].clientY,
                event.touches[1].clientX,
                event.touches[1].clientY
            );
            
            // Calculate scale factor
            const scaleFactor = currentDistance / initialDistance;
            
            // Calculate new scale
            currentScale = initialScale * scaleFactor;
            
            // Limit scale
            currentScale = Math.max(0.5, Math.min(3, currentScale));
            
            // Apply scale to map
            applyScaleToMap(currentScale);
        }
        
        /**
         * Handle touch end event
         * @param {TouchEvent} event - Touch event
         */
        function handleTouchEnd(event) {
            // Skip if not scaling
            if (!isScaling) {
                return;
            }
            
            // Reset scaling flag
            isScaling = false;
            
            console.log('Pinch zoom ended');
            
            // Normalize scale
            normalizeScale();
        }
        
        /**
         * Calculate distance between two points
         * @param {number} x1 - First point X coordinate
         * @param {number} y1 - First point Y coordinate
         * @param {number} x2 - Second point X coordinate
         * @param {number} y2 - Second point Y coordinate
         * @returns {number} - Distance between points
         */
        function getDistance(x1, y1, x2, y2) {
            return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        }
        
        /**
         * Apply scale to map
         * @param {number} scale - Scale factor
         */
        function applyScaleToMap(scale) {
            // Check if we have a Leaflet map instance
            if (window.myMap && typeof window.myMap.setZoom === 'function') {
                // Get current zoom
                const currentZoom = window.myMap.getZoom();
                
                // Calculate new zoom
                const newZoom = Math.round(currentZoom + Math.log2(scale));
                
                // Set zoom
                window.myMap.setZoom(newZoom);
            } else {
                // Apply CSS transform
                mapElement.style.transform = `scale(${scale})`;
            }
        }
        
        /**
         * Normalize scale
         */
        function normalizeScale() {
            // Check if we have a Leaflet map instance
            if (window.myMap && typeof window.myMap.setZoom === 'function') {
                // No need to normalize, Leaflet handles it
                return;
            }
            
            // Reset transform
            mapElement.style.transform = '';
            
            // Reset scale
            currentScale = 1;
        }
    });
}
