/**
 * Theme Manager for Rregullo Tiranen
 * Handles theme switching between light and dark modes
 */

const ThemeManager = (function() {
    // Theme constants
    const THEME_STORAGE_KEY = 'theme';
    const DARK_THEME = 'dark';
    const LIGHT_THEME = 'light';
    const THEME_CLASS = 'dark-theme';

    // DOM elements
    let themeToggleBtn;
    let themeIcon;
    let themeLabel;

    // Determine the base path for assets based on current page location
    const getBasePath = () => {
        const path = window.location.pathname;
        if (path.includes('/html/admin/')) {
            return '../../';
        } else if (path.includes('/html/')) {
            return '../';
        } else {
            return '';
        }
    };

    /**
     * Initialize the theme manager
     */
    function initialize() {
        console.log('Initializing Theme Manager');

        // Get DOM elements
        themeToggleBtn = document.getElementById('theme-toggle');

        if (!themeToggleBtn) {
            console.error('Theme toggle button not found');
            return;
        }

        themeIcon = themeToggleBtn.querySelector('.icon');
        themeLabel = themeToggleBtn.querySelector('.theme-label');

        if (!themeIcon || !themeLabel) {
            console.error('Theme toggle elements not found', { themeIcon, themeLabel });
            return;
        }

        // Apply current theme
        const currentTheme = getCurrentTheme();
        applyTheme(currentTheme);

        // Add event listener to toggle button
        themeToggleBtn.addEventListener('click', toggleTheme);

        console.log('Theme Manager initialized with theme:', currentTheme);
    }

    /**
     * Get the current theme from localStorage
     * @returns {string} The current theme (light or dark)
     */
    function getCurrentTheme() {
        return localStorage.getItem(THEME_STORAGE_KEY) || LIGHT_THEME;
    }

    /**
     * Toggle between light and dark themes
     */
    function toggleTheme() {
        const currentTheme = getCurrentTheme();
        const newTheme = currentTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME;

        console.log(`Toggling theme from ${currentTheme} to ${newTheme}`);

        // Save the new theme preference
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);

        // Apply the new theme
        applyTheme(newTheme);
    }

    /**
     * Apply the specified theme
     * @param {string} theme - The theme to apply (light or dark)
     */
    function applyTheme(theme) {
        console.log('Applying theme:', theme);

        const isDarkTheme = theme === DARK_THEME;

        // Apply theme class to html element
        if (isDarkTheme) {
            document.documentElement.classList.add(THEME_CLASS);
        } else {
            document.documentElement.classList.remove(THEME_CLASS);
        }

        // Update toggle button appearance
        updateToggleButton(isDarkTheme);

        // Refresh map if it exists
        refreshMap();

        // Update meta theme-color
        updateMetaThemeColor(isDarkTheme);
    }

    /**
     * Update the theme toggle button appearance
     * @param {boolean} isDarkTheme - Whether dark theme is active
     */
    function updateToggleButton(isDarkTheme) {
        if (!themeIcon || !themeLabel) return;

        if (isDarkTheme) {
            themeIcon.textContent = '☀️';
            themeLabel.textContent = 'Tema e Ndritshme';
        } else {
            themeIcon.textContent = '🌓';
            themeLabel.textContent = 'Tema e Errët';
        }
    }

    /**
     * Refresh the map to fix rendering issues after theme change
     */
    function refreshMap() {
        setTimeout(() => {
            if (window.homeMap) {
                console.log('Refreshing map after theme change');
                window.homeMap.invalidateSize();
            }
        }, 200);
    }

    /**
     * Update the meta theme-color for mobile browsers
     * @param {boolean} isDarkTheme - Whether dark theme is active
     */
    function updateMetaThemeColor(isDarkTheme) {
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', isDarkTheme ? '#1a1a1a' : '#C41E3A');
        }

        // Update favicon if needed
        const favicon = document.querySelector('link[rel="icon"]');
        if (favicon) {
            const basePath = getBasePath();
            favicon.href = `${basePath}images/icons/${isDarkTheme ? 'dark-' : ''}favicon.ico`;
        }
    }

    // Public API
    return {
        initialize,
        getCurrentTheme,
        toggleTheme,
        applyTheme
    };
})();

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    ThemeManager.initialize();
});
