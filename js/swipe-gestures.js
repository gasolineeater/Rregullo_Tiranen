/**
 * Swipe Gestures for Rregullo Tiranen
 * Implements basic swipe gestures for mobile navigation
 */

document.addEventListener('DOMContentLoaded', function() {
    // Only initialize on touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        console.log('Touch device detected, initializing swipe gestures');
        initSwipeGestures();
    }
});

/**
 * Initialize swipe gestures
 */
function initSwipeGestures() {
    // Variables to track touch position
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    
    // Add touch event listeners
    document.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchend', handleTouchEnd, false);
    
    /**
     * Handle touch start event
     * @param {TouchEvent} event - Touch event
     */
    function handleTouchStart(event) {
        touchStartX = event.changedTouches[0].screenX;
        touchStartY = event.changedTouches[0].screenY;
    }
    
    /**
     * Handle touch end event
     * @param {TouchEvent} event - Touch event
     */
    function handleTouchEnd(event) {
        touchEndX = event.changedTouches[0].screenX;
        touchEndY = event.changedTouches[0].screenY;
        handleSwipe();
    }
    
    /**
     * Handle swipe gesture
     */
    function handleSwipe() {
        // Calculate swipe distance
        const swipeDistanceX = touchEndX - touchStartX;
        const swipeDistanceY = touchEndY - touchStartY;
        
        // Minimum swipe distance (in pixels)
        const minSwipeDistance = 100;
        
        // Check if horizontal swipe is longer than vertical swipe
        if (Math.abs(swipeDistanceX) > Math.abs(swipeDistanceY)) {
            // Horizontal swipe
            if (Math.abs(swipeDistanceX) < minSwipeDistance) {
                // Swipe too short
                return;
            }
            
            if (swipeDistanceX > 0) {
                // Right swipe
                handleRightSwipe();
            } else {
                // Left swipe
                handleLeftSwipe();
            }
        } else {
            // Vertical swipe
            if (Math.abs(swipeDistanceY) < minSwipeDistance) {
                // Swipe too short
                return;
            }
            
            if (swipeDistanceY > 0) {
                // Down swipe
                handleDownSwipe();
            } else {
                // Up swipe
                handleUpSwipe();
            }
        }
    }
    
    /**
     * Handle right swipe
     */
    function handleRightSwipe() {
        console.log('Right swipe detected');
        
        // Check if we're on a page with navigation
        if (isReportDetailPage()) {
            // Navigate back to previous page
            navigateBack();
        }
    }
    
    /**
     * Handle left swipe
     */
    function handleLeftSwipe() {
        console.log('Left swipe detected');
        
        // Check if we're on a page with a list of items
        if (isReportListPage()) {
            // Open first report in list
            openFirstReport();
        }
    }
    
    /**
     * Handle up swipe
     */
    function handleUpSwipe() {
        console.log('Up swipe detected');
        
        // Check if we're at the bottom of the page
        if (isAtBottomOfPage()) {
            // Scroll to top
            scrollToTop();
        }
    }
    
    /**
     * Handle down swipe
     */
    function handleDownSwipe() {
        console.log('Down swipe detected');
        
        // Check if we're at the top of the page
        if (isAtTopOfPage()) {
            // Scroll to bottom
            scrollToBottom();
        }
    }
    
    /**
     * Check if we're on a report detail page
     * @returns {boolean} - Whether we're on a report detail page
     */
    function isReportDetailPage() {
        return window.location.pathname.includes('report-detail') || 
               document.querySelector('.report-detail-container') !== null;
    }
    
    /**
     * Check if we're on a report list page
     * @returns {boolean} - Whether we're on a report list page
     */
    function isReportListPage() {
        return window.location.pathname.includes('report') || 
               document.querySelector('.report-list') !== null;
    }
    
    /**
     * Check if we're at the bottom of the page
     * @returns {boolean} - Whether we're at the bottom of the page
     */
    function isAtBottomOfPage() {
        const scrollPosition = window.scrollY + window.innerHeight;
        const pageHeight = document.documentElement.scrollHeight;
        
        return scrollPosition >= pageHeight - 50;
    }
    
    /**
     * Check if we're at the top of the page
     * @returns {boolean} - Whether we're at the top of the page
     */
    function isAtTopOfPage() {
        return window.scrollY <= 50;
    }
    
    /**
     * Navigate back to previous page
     */
    function navigateBack() {
        // Check if there's a back button
        const backButton = document.querySelector('.back-button, .btn-back, [data-action="back"]');
        
        if (backButton) {
            // Click back button
            backButton.click();
        } else {
            // Use browser history
            window.history.back();
        }
    }
    
    /**
     * Open first report in list
     */
    function openFirstReport() {
        // Find first report link
        const reportLink = document.querySelector('.report-item a, .report-list a');
        
        if (reportLink) {
            // Click report link
            reportLink.click();
        }
    }
    
    /**
     * Scroll to top of page
     */
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    /**
     * Scroll to bottom of page
     */
    function scrollToBottom() {
        window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'smooth'
        });
    }
}
