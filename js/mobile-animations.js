/**
 * Mobile Animations for Rregullo Tiranen
 * Implements mobile-specific animations for better user experience
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize mobile animations
    initMobileAnimations();
});

/**
 * Initialize mobile animations
 */
function initMobileAnimations() {
    // Check if reduced motion is preferred
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Check if animations are disabled in user preferences
    const areAnimationsDisabled = localStorage.getItem('disableAnimations') === 'true';
    
    // Skip if reduced motion is preferred or animations are disabled
    if (prefersReducedMotion || areAnimationsDisabled) {
        console.log('Animations disabled due to user preferences');
        return;
    }
    
    // Add animations
    addPageTransitions();
    addButtonAnimations();
    addFormAnimations();
    addListAnimations();
    addMapAnimations();
    
    // Add animation toggle to settings
    addAnimationToggle();
}

/**
 * Add page transitions
 */
function addPageTransitions() {
    // Add CSS for page transitions
    addStyles(`
        /* Page transitions */
        .page-transition-container {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
            z-index: 9999;
            opacity: 0;
            background-color: var(--color-primary);
            transition: opacity 0.3s ease;
        }
        
        .page-transition-container.active {
            opacity: 0.2;
        }
    `);
    
    // Create page transition container
    const transitionContainer = document.createElement('div');
    transitionContainer.className = 'page-transition-container';
    document.body.appendChild(transitionContainer);
    
    // Add click event listener to links
    document.addEventListener('click', function(event) {
        // Get clicked element
        const target = event.target;
        
        // Check if clicked element is a link
        const link = target.closest('a');
        
        if (!link) {
            return;
        }
        
        // Skip if link is external
        if (link.target === '_blank' || link.hostname !== window.location.hostname) {
            return;
        }
        
        // Skip if link is a hash link
        if (link.hash && link.pathname === window.location.pathname) {
            return;
        }
        
        // Skip if link has download attribute
        if (link.hasAttribute('download')) {
            return;
        }
        
        // Skip if link has data-no-transition attribute
        if (link.hasAttribute('data-no-transition')) {
            return;
        }
        
        // Prevent default behavior
        event.preventDefault();
        
        // Show transition
        transitionContainer.classList.add('active');
        
        // Navigate to link after transition
        setTimeout(function() {
            window.location.href = link.href;
        }, 300);
    });
}

/**
 * Add button animations
 */
function addButtonAnimations() {
    // Add CSS for button animations
    addStyles(`
        /* Button animations */
        .btn, button, [role="button"] {
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .btn:active, button:active, [role="button"]:active {
            transform: scale(0.95);
        }
        
        .btn-primary:active {
            box-shadow: 0 0 0 4px rgba(var(--color-primary-rgb), 0.2);
        }
    `);
}

/**
 * Add form animations
 */
function addFormAnimations() {
    // Add CSS for form animations
    addStyles(`
        /* Form animations */
        input, select, textarea {
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        
        input:focus, select:focus, textarea:focus {
            animation: form-focus 0.2s ease;
        }
        
        @keyframes form-focus {
            0% {
                box-shadow: 0 0 0 0 rgba(var(--color-primary-rgb), 0.2);
            }
            50% {
                box-shadow: 0 0 0 6px rgba(var(--color-primary-rgb), 0.2);
            }
            100% {
                box-shadow: 0 0 0 4px rgba(var(--color-primary-rgb), 0.2);
            }
        }
        
        .form-error {
            animation: form-error 0.3s ease;
        }
        
        @keyframes form-error {
            0%, 100% {
                transform: translateX(0);
            }
            20%, 60% {
                transform: translateX(-5px);
            }
            40%, 80% {
                transform: translateX(5px);
            }
        }
        
        .form-success {
            animation: form-success 0.5s ease;
        }
        
        @keyframes form-success {
            0% {
                transform: scale(0.8);
                opacity: 0;
            }
            100% {
                transform: scale(1);
                opacity: 1;
            }
        }
    `);
    
    // Add form submission animation
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            // Skip if form has data-no-animation attribute
            if (form.hasAttribute('data-no-animation')) {
                return;
            }
            
            // Skip if form submission is prevented
            if (event.defaultPrevented) {
                return;
            }
            
            // Add loading animation
            form.classList.add('form-loading');
            
            // Add loading overlay
            const loadingOverlay = document.createElement('div');
            loadingOverlay.className = 'form-loading-overlay';
            loadingOverlay.innerHTML = '<div class="loading-spinner"></div>';
            form.appendChild(loadingOverlay);
            
            // Add CSS for loading animation
            addStyles(`
                .form-loading {
                    position: relative;
                    pointer-events: none;
                }
                
                .form-loading-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(255, 255, 255, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10;
                }
                
                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    border: 3px solid rgba(var(--color-primary-rgb), 0.2);
                    border-top-color: var(--color-primary);
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    0% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                }
            `);
        });
    });
}

/**
 * Add list animations
 */
function addListAnimations() {
    // Add CSS for list animations
    addStyles(`
        /* List animations */
        .report-list .report-item,
        .notification-list .notification-item,
        .list-item {
            animation: list-item-appear 0.3s ease;
            animation-fill-mode: both;
        }
        
        @keyframes list-item-appear {
            0% {
                opacity: 0;
                transform: translateY(10px);
            }
            100% {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `);
    
    // Add staggered animation to list items
    const lists = document.querySelectorAll('.report-list, .notification-list, .list');
    
    lists.forEach(list => {
        const items = list.querySelectorAll('.report-item, .notification-item, .list-item');
        
        items.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.05}s`;
        });
    });
}

/**
 * Add map animations
 */
function addMapAnimations() {
    // Add CSS for map animations
    addStyles(`
        /* Map animations */
        .leaflet-marker-icon {
            transition: transform 0.2s ease;
        }
        
        .leaflet-marker-icon:hover {
            transform: scale(1.2);
        }
        
        .map-popup {
            animation: popup-appear 0.3s ease;
        }
        
        @keyframes popup-appear {
            0% {
                opacity: 0;
                transform: translateY(10px);
            }
            100% {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `);
}

/**
 * Add animation toggle to settings
 */
function addAnimationToggle() {
    // Find settings container
    const settingsContainer = document.querySelector('.settings-container, .preferences-container, .accessibility-dropdown');
    
    // Skip if no settings container found
    if (!settingsContainer) {
        return;
    }
    
    // Check if animation toggle already exists
    if (settingsContainer.querySelector('#animation-toggle')) {
        return;
    }
    
    // Check if animations are disabled
    const areAnimationsDisabled = localStorage.getItem('disableAnimations') === 'true';
    
    // Create animation toggle
    const animationToggle = document.createElement('div');
    animationToggle.className = 'settings-option';
    animationToggle.innerHTML = `
        <div class="settings-option-label">
            <label for="animation-toggle">Animacionet</label>
            <p class="settings-option-description">Aktivizo animacionet në aplikacion</p>
        </div>
        <div class="settings-option-control">
            <input type="checkbox" id="animation-toggle" ${!areAnimationsDisabled ? 'checked' : ''}>
            <label for="animation-toggle" class="toggle-switch"></label>
        </div>
    `;
    
    // Add to settings container
    settingsContainer.appendChild(animationToggle);
    
    // Add change event listener
    const toggle = animationToggle.querySelector('#animation-toggle');
    toggle.addEventListener('change', function() {
        // Update animation setting
        localStorage.setItem('disableAnimations', !this.checked ? 'true' : 'false');
        
        // Reload page to apply changes
        window.location.reload();
    });
}

/**
 * Add styles to document
 * @param {string} css - CSS styles
 */
function addStyles(css) {
    // Check if styles already exist
    if (document.getElementById('mobile-animation-styles')) {
        // Append to existing styles
        document.getElementById('mobile-animation-styles').textContent += css;
        return;
    }
    
    // Create style element
    const style = document.createElement('style');
    style.id = 'mobile-animation-styles';
    style.textContent = css;
    
    // Add to document
    document.head.appendChild(style);
}
