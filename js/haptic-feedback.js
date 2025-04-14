/**
 * Haptic Feedback for Rregullo Tiranen
 * Implements haptic feedback for touch interactions
 */

document.addEventListener('DOMContentLoaded', function() {
    // Only initialize on devices that support vibration
    if ('vibrate' in navigator) {
        console.log('Vibration API supported, initializing haptic feedback');
        initHapticFeedback();
    }
});

/**
 * Initialize haptic feedback
 */
function initHapticFeedback() {
    // Check if haptic feedback is enabled in user preferences
    const isHapticEnabled = localStorage.getItem('hapticFeedback') !== 'false';
    
    // Skip if haptic feedback is disabled
    if (!isHapticEnabled) {
        console.log('Haptic feedback disabled by user');
        return;
    }
    
    // Add haptic feedback to interactive elements
    addHapticFeedbackToButtons();
    addHapticFeedbackToForms();
    addHapticFeedbackToNavigation();
    addHapticFeedbackToMap();
    
    // Add haptic feedback toggle to settings
    addHapticFeedbackToggle();
}

/**
 * Add haptic feedback to buttons
 */
function addHapticFeedbackToButtons() {
    // Find all buttons and button-like elements
    const buttons = document.querySelectorAll('button, .btn, [role="button"], input[type="submit"], input[type="button"]');
    
    // For each button
    buttons.forEach(button => {
        // Add click event listener
        button.addEventListener('click', function() {
            // Trigger short vibration
            triggerHapticFeedback('button');
        });
    });
}

/**
 * Add haptic feedback to forms
 */
function addHapticFeedbackToForms() {
    // Find all form elements
    const formElements = document.querySelectorAll('input, select, textarea');
    
    // For each form element
    formElements.forEach(element => {
        // Add focus event listener
        element.addEventListener('focus', function() {
            // Trigger light vibration
            triggerHapticFeedback('focus');
        });
        
        // Add change event listener
        element.addEventListener('change', function() {
            // Trigger medium vibration
            triggerHapticFeedback('change');
        });
        
        // Add invalid event listener
        element.addEventListener('invalid', function() {
            // Trigger error vibration
            triggerHapticFeedback('error');
        });
    });
    
    // Find all forms
    const forms = document.querySelectorAll('form');
    
    // For each form
    forms.forEach(form => {
        // Add submit event listener
        form.addEventListener('submit', function() {
            // Trigger success vibration
            triggerHapticFeedback('success');
        });
    });
}

/**
 * Add haptic feedback to navigation
 */
function addHapticFeedbackToNavigation() {
    // Find all navigation links
    const navLinks = document.querySelectorAll('nav a, .main-nav a, .footer-links a');
    
    // For each navigation link
    navLinks.forEach(link => {
        // Add click event listener
        link.addEventListener('click', function() {
            // Trigger navigation vibration
            triggerHapticFeedback('navigation');
        });
    });
    
    // Find mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle, #mobile-menu-toggle, .menu-toggle');
    
    // If mobile menu toggle exists
    if (mobileMenuToggle) {
        // Add click event listener
        mobileMenuToggle.addEventListener('click', function() {
            // Trigger menu vibration
            triggerHapticFeedback('menu');
        });
    }
}

/**
 * Add haptic feedback to map
 */
function addHapticFeedbackToMap() {
    // Find map elements
    const mapElements = document.querySelectorAll('#map, .map-container, .leaflet-container');
    
    // For each map element
    mapElements.forEach(mapElement => {
        // Add click event listener
        mapElement.addEventListener('click', function() {
            // Trigger map click vibration
            triggerHapticFeedback('map-click');
        });
        
        // Add marker click event listener
        mapElement.addEventListener('click', function(event) {
            // Check if clicked element is a marker
            if (event.target.classList.contains('leaflet-marker-icon') || 
                event.target.closest('.leaflet-marker-icon')) {
                // Trigger marker click vibration
                triggerHapticFeedback('marker-click');
            }
        });
    });
}

/**
 * Add haptic feedback toggle to settings
 */
function addHapticFeedbackToggle() {
    // Find settings container
    const settingsContainer = document.querySelector('.settings-container, .preferences-container, .accessibility-dropdown');
    
    // Skip if no settings container found
    if (!settingsContainer) {
        return;
    }
    
    // Check if haptic feedback toggle already exists
    if (settingsContainer.querySelector('#haptic-feedback-toggle')) {
        return;
    }
    
    // Check if haptic feedback is enabled
    const isHapticEnabled = localStorage.getItem('hapticFeedback') !== 'false';
    
    // Create haptic feedback toggle
    const hapticFeedbackToggle = document.createElement('div');
    hapticFeedbackToggle.className = 'settings-option';
    hapticFeedbackToggle.innerHTML = `
        <div class="settings-option-label">
            <label for="haptic-feedback-toggle">Reagim haptik</label>
            <p class="settings-option-description">Aktivizo vibrimet e lehta gjatë ndërveprimit me aplikacionin</p>
        </div>
        <div class="settings-option-control">
            <input type="checkbox" id="haptic-feedback-toggle" ${isHapticEnabled ? 'checked' : ''}>
            <label for="haptic-feedback-toggle" class="toggle-switch"></label>
        </div>
    `;
    
    // Add to settings container
    settingsContainer.appendChild(hapticFeedbackToggle);
    
    // Add change event listener
    const toggle = hapticFeedbackToggle.querySelector('#haptic-feedback-toggle');
    toggle.addEventListener('change', function() {
        // Update haptic feedback setting
        localStorage.setItem('hapticFeedback', this.checked ? 'true' : 'false');
        
        // Trigger test vibration if enabled
        if (this.checked) {
            triggerHapticFeedback('test');
        }
    });
}

/**
 * Trigger haptic feedback
 * @param {string} type - Type of haptic feedback
 */
function triggerHapticFeedback(type) {
    // Skip if vibration API is not supported
    if (!('vibrate' in navigator)) {
        return;
    }
    
    // Check if haptic feedback is enabled
    const isHapticEnabled = localStorage.getItem('hapticFeedback') !== 'false';
    
    // Skip if haptic feedback is disabled
    if (!isHapticEnabled) {
        return;
    }
    
    // Vibration patterns (in milliseconds)
    const patterns = {
        'button': [20],
        'focus': [10],
        'change': [15],
        'error': [50, 100, 50],
        'success': [50, 50, 100],
        'navigation': [30],
        'menu': [40],
        'map-click': [20],
        'marker-click': [40, 30],
        'test': [20, 50, 20]
    };
    
    // Get vibration pattern
    const pattern = patterns[type] || [20];
    
    // Trigger vibration
    navigator.vibrate(pattern);
}
