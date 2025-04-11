/**
 * Accessibility Module for Rregullo Tiranen
 * Handles accessibility features and preferences
 */
const AccessibilityModule = (function() {
    // Private variables
    let preferences = {
        highContrast: false,
        fontSize: 'normal', // 'normal', 'large', 'xlarge'
        reducedMotion: false
    };
    
    /**
     * Initialize the accessibility module
     */
    function initialize() {
        console.log('Initializing accessibility module');
        
        // Load saved preferences
        loadPreferences();
        
        // Apply preferences
        applyPreferences();
        
        // Add skip to content link
        addSkipToContentLink();
        
        // Add accessibility toggle
        addAccessibilityToggle();
        
        // Add keyboard navigation
        enhanceKeyboardNavigation();
        
        // Add ARIA attributes
        enhanceAriaAttributes();
    }
    
    /**
     * Load saved preferences
     */
    function loadPreferences() {
        try {
            const savedPreferences = localStorage.getItem('accessibility_preferences');
            if (savedPreferences) {
                preferences = JSON.parse(savedPreferences);
            } else {
                // Check for system preferences
                if (window.matchMedia('(prefers-contrast: more)').matches) {
                    preferences.highContrast = true;
                }
                
                if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                    preferences.reducedMotion = true;
                }
            }
        } catch (error) {
            console.error('Error loading accessibility preferences:', error);
        }
    }
    
    /**
     * Save preferences
     */
    function savePreferences() {
        try {
            localStorage.setItem('accessibility_preferences', JSON.stringify(preferences));
        } catch (error) {
            console.error('Error saving accessibility preferences:', error);
        }
    }
    
    /**
     * Apply preferences to the page
     */
    function applyPreferences() {
        // Apply high contrast
        if (preferences.highContrast) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
        
        // Apply font size
        document.body.classList.remove('font-size-large', 'font-size-xlarge');
        if (preferences.fontSize === 'large') {
            document.body.classList.add('font-size-large');
        } else if (preferences.fontSize === 'xlarge') {
            document.body.classList.add('font-size-xlarge');
        }
        
        // Apply reduced motion
        if (preferences.reducedMotion) {
            document.body.classList.add('reduced-motion');
        } else {
            document.body.classList.remove('reduced-motion');
        }
        
        // Update accessibility toggle if it exists
        updateAccessibilityToggle();
    }
    
    /**
     * Add skip to content link
     */
    function addSkipToContentLink() {
        // Check if skip link already exists
        if (document.querySelector('.skip-to-content')) return;
        
        // Create skip link
        const skipLink = document.createElement('a');
        skipLink.className = 'skip-to-content';
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to content';
        
        // Add click event
        skipLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Find main content
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                // Set focus to main content
                mainContent.setAttribute('tabindex', '-1');
                mainContent.focus();
                
                // Scroll to main content
                mainContent.scrollIntoView();
            }
        });
        
        // Add to body
        document.body.insertBefore(skipLink, document.body.firstChild);
        
        // Add id to main content if it doesn't exist
        const mainContent = document.querySelector('main') || document.querySelector('.main-content');
        if (mainContent && !mainContent.id) {
            mainContent.id = 'main-content';
        }
    }
    
    /**
     * Add accessibility toggle
     */
    function addAccessibilityToggle() {
        // Check if accessibility toggle already exists
        if (document.getElementById('accessibility-toggle')) return;
        
        // Create accessibility toggle container
        const accessibilityToggle = document.createElement('div');
        accessibilityToggle.id = 'accessibility-toggle';
        accessibilityToggle.className = 'accessibility-toggle';
        accessibilityToggle.setAttribute('aria-label', 'Accessibility options');
        
        // Create accessibility toggle button
        const accessibilityButton = document.createElement('button');
        accessibilityButton.className = 'accessibility-button';
        accessibilityButton.setAttribute('aria-haspopup', 'true');
        accessibilityButton.setAttribute('aria-expanded', 'false');
        accessibilityButton.innerHTML = `
            <span class="accessibility-label">Accessibility</span>
            <span class="accessibility-icon">♿</span>
        `;
        
        // Create accessibility dropdown
        const accessibilityDropdown = document.createElement('div');
        accessibilityDropdown.className = 'accessibility-dropdown';
        accessibilityDropdown.setAttribute('role', 'menu');
        
        // Add accessibility options
        accessibilityDropdown.innerHTML = `
            <div class="accessibility-option">
                <input type="checkbox" id="high-contrast" ${preferences.highContrast ? 'checked' : ''}>
                <label for="high-contrast">High Contrast</label>
            </div>
            <div class="accessibility-option">
                <input type="checkbox" id="reduced-motion" ${preferences.reducedMotion ? 'checked' : ''}>
                <label for="reduced-motion">Reduced Motion</label>
            </div>
            <div class="accessibility-option">
                <label>Font Size</label>
                <div class="font-size-controls">
                    <button class="font-size-button" id="decrease-font">A-</button>
                    <span class="font-size-label">A</span>
                    <button class="font-size-button" id="increase-font">A+</button>
                </div>
            </div>
        `;
        
        // Add click event to toggle dropdown
        accessibilityButton.addEventListener('click', function() {
            accessibilityDropdown.classList.toggle('active');
            const isExpanded = accessibilityDropdown.classList.contains('active');
            accessibilityButton.setAttribute('aria-expanded', isExpanded.toString());
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(event) {
            if (!accessibilityToggle.contains(event.target)) {
                accessibilityDropdown.classList.remove('active');
                accessibilityButton.setAttribute('aria-expanded', 'false');
            }
        });
        
        // Add event listeners for options
        accessibilityToggle.addEventListener('change', function(event) {
            if (event.target.id === 'high-contrast') {
                preferences.highContrast = event.target.checked;
                applyPreferences();
                savePreferences();
            } else if (event.target.id === 'reduced-motion') {
                preferences.reducedMotion = event.target.checked;
                applyPreferences();
                savePreferences();
            }
        });
        
        // Add event listeners for font size buttons
        accessibilityDropdown.addEventListener('click', function(event) {
            if (event.target.id === 'decrease-font') {
                decreaseFontSize();
            } else if (event.target.id === 'increase-font') {
                increaseFontSize();
            }
        });
        
        // Append elements
        accessibilityToggle.appendChild(accessibilityButton);
        accessibilityToggle.appendChild(accessibilityDropdown);
        
        // Find the right place to insert the accessibility toggle
        const mainNav = document.querySelector('.main-nav');
        if (mainNav) {
            // Insert before language switcher if it exists
            const languageSwitcher = mainNav.querySelector('.language-switcher');
            if (languageSwitcher) {
                mainNav.insertBefore(accessibilityToggle, languageSwitcher);
            } else {
                // Insert before theme toggle if it exists
                const themeToggle = mainNav.querySelector('.theme-toggle');
                if (themeToggle) {
                    mainNav.insertBefore(accessibilityToggle, themeToggle);
                } else {
                    mainNav.appendChild(accessibilityToggle);
                }
            }
        } else {
            // Fallback: append to body
            document.body.appendChild(accessibilityToggle);
        }
    }
    
    /**
     * Update accessibility toggle
     */
    function updateAccessibilityToggle() {
        const highContrastCheckbox = document.getElementById('high-contrast');
        const reducedMotionCheckbox = document.getElementById('reduced-motion');
        
        if (highContrastCheckbox) {
            highContrastCheckbox.checked = preferences.highContrast;
        }
        
        if (reducedMotionCheckbox) {
            reducedMotionCheckbox.checked = preferences.reducedMotion;
        }
    }
    
    /**
     * Increase font size
     */
    function increaseFontSize() {
        if (preferences.fontSize === 'normal') {
            preferences.fontSize = 'large';
        } else if (preferences.fontSize === 'large') {
            preferences.fontSize = 'xlarge';
        }
        
        applyPreferences();
        savePreferences();
    }
    
    /**
     * Decrease font size
     */
    function decreaseFontSize() {
        if (preferences.fontSize === 'xlarge') {
            preferences.fontSize = 'large';
        } else if (preferences.fontSize === 'large') {
            preferences.fontSize = 'normal';
        }
        
        applyPreferences();
        savePreferences();
    }
    
    /**
     * Enhance keyboard navigation
     */
    function enhanceKeyboardNavigation() {
        // Add focus styles to interactive elements
        const interactiveElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
        
        interactiveElements.forEach(element => {
            // Skip elements that already have focus styles
            if (element.classList.contains('has-keyboard-focus')) return;
            
            element.classList.add('has-keyboard-focus');
            
            // Add keydown event for Enter key on non-button/link elements
            if (!['A', 'BUTTON'].includes(element.tagName) && element.getAttribute('role') !== 'button') {
                element.addEventListener('keydown', function(event) {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        element.click();
                    }
                });
            }
        });
        
        // Add keyboard navigation for dropdowns
        const dropdowns = document.querySelectorAll('.dropdown, .menu');
        
        dropdowns.forEach(dropdown => {
            const trigger = dropdown.querySelector('.dropdown-trigger, .menu-trigger');
            const content = dropdown.querySelector('.dropdown-content, .menu-content');
            
            if (!trigger || !content) return;
            
            trigger.addEventListener('keydown', function(event) {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    content.classList.toggle('active');
                    trigger.setAttribute('aria-expanded', content.classList.contains('active').toString());
                } else if (event.key === 'Escape') {
                    content.classList.remove('active');
                    trigger.setAttribute('aria-expanded', 'false');
                }
            });
            
            content.addEventListener('keydown', function(event) {
                if (event.key === 'Escape') {
                    content.classList.remove('active');
                    trigger.setAttribute('aria-expanded', 'false');
                    trigger.focus();
                }
            });
        });
    }
    
    /**
     * Enhance ARIA attributes
     */
    function enhanceAriaAttributes() {
        // Add ARIA attributes to navigation
        const mainNav = document.querySelector('.main-nav');
        if (mainNav) {
            mainNav.setAttribute('role', 'navigation');
            mainNav.setAttribute('aria-label', 'Main Navigation');
        }
        
        // Add ARIA attributes to main content
        const mainContent = document.querySelector('main') || document.querySelector('.main-content');
        if (mainContent) {
            mainContent.setAttribute('role', 'main');
        }
        
        // Add ARIA attributes to search
        const searchForm = document.querySelector('form[role="search"]') || document.querySelector('form.search-form');
        if (searchForm) {
            searchForm.setAttribute('role', 'search');
            
            const searchInput = searchForm.querySelector('input[type="search"], input[type="text"]');
            if (searchInput && !searchInput.getAttribute('aria-label')) {
                searchInput.setAttribute('aria-label', 'Search');
            }
        }
        
        // Add ARIA attributes to buttons without text
        const iconButtons = document.querySelectorAll('button:not([aria-label])');
        
        iconButtons.forEach(button => {
            // Check if button has only icon and no text
            if (button.textContent.trim() === '' || button.querySelector('i, .icon, .fa, .material-icons')) {
                // Try to find a label from title or nearby elements
                const label = button.getAttribute('title') || 
                              button.querySelector('i, .icon, .fa, .material-icons')?.getAttribute('title') || 
                              'Button';
                
                button.setAttribute('aria-label', label);
            }
        });
        
        // Add ARIA attributes to forms
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            // Add required attribute to required fields
            const requiredFields = form.querySelectorAll('[required]');
            requiredFields.forEach(field => {
                const label = document.querySelector(`label[for="${field.id}"]`);
                if (label) {
                    if (!label.querySelector('.required-indicator')) {
                        const requiredIndicator = document.createElement('span');
                        requiredIndicator.className = 'required-indicator';
                        requiredIndicator.setAttribute('aria-hidden', 'true');
                        requiredIndicator.textContent = ' *';
                        label.appendChild(requiredIndicator);
                    }
                }
                
                field.setAttribute('aria-required', 'true');
            });
            
            // Add error message container for each field
            const formFields = form.querySelectorAll('input, select, textarea');
            formFields.forEach(field => {
                if (!field.id) return;
                
                const errorContainer = document.getElementById(`${field.id}-error`);
                if (!errorContainer) {
                    const newErrorContainer = document.createElement('div');
                    newErrorContainer.id = `${field.id}-error`;
                    newErrorContainer.className = 'error-message';
                    newErrorContainer.setAttribute('aria-live', 'polite');
                    
                    // Insert after field or its parent form-group
                    const formGroup = field.closest('.form-group, .form-field');
                    if (formGroup) {
                        formGroup.appendChild(newErrorContainer);
                    } else {
                        field.insertAdjacentElement('afterend', newErrorContainer);
                    }
                    
                    field.setAttribute('aria-describedby', newErrorContainer.id);
                }
            });
        });
    }
    
    /**
     * Toggle high contrast mode
     */
    function toggleHighContrast() {
        preferences.highContrast = !preferences.highContrast;
        applyPreferences();
        savePreferences();
    }
    
    /**
     * Toggle reduced motion
     */
    function toggleReducedMotion() {
        preferences.reducedMotion = !preferences.reducedMotion;
        applyPreferences();
        savePreferences();
    }
    
    /**
     * Set font size
     * @param {string} size - Font size ('normal', 'large', 'xlarge')
     */
    function setFontSize(size) {
        if (['normal', 'large', 'xlarge'].includes(size)) {
            preferences.fontSize = size;
            applyPreferences();
            savePreferences();
        }
    }
    
    /**
     * Get current preferences
     * @returns {Object} Current accessibility preferences
     */
    function getPreferences() {
        return { ...preferences };
    }
    
    // Public API
    return {
        initialize,
        toggleHighContrast,
        toggleReducedMotion,
        setFontSize,
        increaseFontSize,
        decreaseFontSize,
        getPreferences
    };
})();
