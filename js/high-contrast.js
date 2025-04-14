/**
 * High Contrast Mode for Rregullo Tiranen
 * Implements high contrast mode for users with visual impairments
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize high contrast mode
    initHighContrastMode();
});

/**
 * Initialize high contrast mode
 */
function initHighContrastMode() {
    // Check if high contrast mode is enabled
    const isHighContrastEnabled = localStorage.getItem('highContrast') === 'true';
    
    // Apply high contrast mode if enabled
    if (isHighContrastEnabled) {
        document.documentElement.classList.add('high-contrast');
    }
    
    // Add high contrast toggle to accessibility menu if it exists
    const accessibilityDropdown = document.querySelector('.accessibility-dropdown');
    
    if (accessibilityDropdown) {
        // Check if high contrast option already exists
        if (!accessibilityDropdown.querySelector('#high-contrast-toggle')) {
            // Create high contrast option
            const highContrastOption = document.createElement('div');
            highContrastOption.className = 'accessibility-option';
            highContrastOption.innerHTML = `
                <input type="checkbox" id="high-contrast-toggle" ${isHighContrastEnabled ? 'checked' : ''}>
                <label for="high-contrast-toggle">Kontrast i lartë</label>
            `;
            
            // Add to accessibility dropdown
            accessibilityDropdown.appendChild(highContrastOption);
            
            // Add event listener
            const highContrastToggle = highContrastOption.querySelector('#high-contrast-toggle');
            highContrastToggle.addEventListener('change', function() {
                toggleHighContrastMode(this.checked);
            });
        }
    } else {
        // Create high contrast toggle if accessibility dropdown doesn't exist
        createHighContrastToggle();
    }
}

/**
 * Create high contrast toggle
 */
function createHighContrastToggle() {
    // Check if high contrast toggle already exists
    if (document.querySelector('.high-contrast-toggle')) {
        return;
    }
    
    // Check if high contrast mode is enabled
    const isHighContrastEnabled = localStorage.getItem('highContrast') === 'true';
    
    // Create high contrast toggle
    const highContrastToggle = document.createElement('div');
    highContrastToggle.className = 'high-contrast-toggle';
    highContrastToggle.innerHTML = `
        <button class="high-contrast-button" aria-label="Aktivizo/Çaktivizo kontrast të lartë" aria-pressed="${isHighContrastEnabled ? 'true' : 'false'}">
            <span class="high-contrast-icon">👁️</span>
            <span class="high-contrast-text">Kontrast i lartë</span>
        </button>
    `;
    
    // Add to header
    const header = document.querySelector('.main-header .container');
    
    if (header) {
        // Find a good position to insert the toggle
        const themeToggle = header.querySelector('.theme-toggle');
        
        if (themeToggle) {
            // Insert before theme toggle
            header.insertBefore(highContrastToggle, themeToggle);
        } else {
            // Append to header
            header.appendChild(highContrastToggle);
        }
        
        // Add event listener
        const highContrastButton = highContrastToggle.querySelector('.high-contrast-button');
        highContrastButton.addEventListener('click', function() {
            const isHighContrastEnabled = document.documentElement.classList.contains('high-contrast');
            toggleHighContrastMode(!isHighContrastEnabled);
            this.setAttribute('aria-pressed', (!isHighContrastEnabled).toString());
        });
        
        // Add styles
        addHighContrastStyles();
    }
}

/**
 * Toggle high contrast mode
 * @param {boolean} enable - Whether to enable high contrast mode
 */
function toggleHighContrastMode(enable) {
    if (enable) {
        document.documentElement.classList.add('high-contrast');
        localStorage.setItem('highContrast', 'true');
    } else {
        document.documentElement.classList.remove('high-contrast');
        localStorage.setItem('highContrast', 'false');
    }
    
    // Update toggle button
    const highContrastButton = document.querySelector('.high-contrast-button');
    if (highContrastButton) {
        highContrastButton.setAttribute('aria-pressed', enable.toString());
    }
    
    // Update checkbox
    const highContrastToggle = document.querySelector('#high-contrast-toggle');
    if (highContrastToggle) {
        highContrastToggle.checked = enable;
    }
}

/**
 * Add high contrast styles
 */
function addHighContrastStyles() {
    // Check if styles already exist
    if (document.getElementById('high-contrast-styles')) {
        return;
    }
    
    // Create styles
    const styles = document.createElement('style');
    styles.id = 'high-contrast-styles';
    styles.textContent = `
        .high-contrast-toggle {
            position: relative;
            margin-right: 1rem;
        }
        
        .high-contrast-button {
            background: none;
            border: none;
            color: var(--color-text);
            cursor: pointer;
            display: flex;
            align-items: center;
            padding: 0.5rem;
            font-size: 0.9rem;
            border-radius: 4px;
            transition: background-color 0.2s ease;
        }
        
        .high-contrast-button:hover {
            background-color: rgba(0, 0, 0, 0.05);
        }
        
        :root.dark-theme .high-contrast-button:hover {
            background-color: rgba(255, 255, 255, 0.1);
        }
        
        .high-contrast-button:focus {
            outline: 2px solid var(--color-primary);
            outline-offset: 2px;
        }
        
        .high-contrast-icon {
            margin-right: 0.5rem;
            font-size: 1.2rem;
        }
        
        .high-contrast-text {
            display: none;
        }
        
        @media (min-width: 768px) {
            .high-contrast-text {
                display: inline;
            }
        }
        
        /* RTL Support */
        [dir="rtl"] .high-contrast-icon {
            margin-right: 0;
            margin-left: 0.5rem;
        }
    `;
    
    // Add to document
    document.head.appendChild(styles);
}
