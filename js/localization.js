/**
 * Localization Module for Rregullo Tiranen
 * Handles translations and language switching
 */
const LocalizationModule = (function() {
    // Private variables
    let currentLanguage = 'sq'; // Default language: Albanian
    let translations = {};
    let languageChangeCallbacks = [];

    // Supported languages
    const supportedLanguages = {
        'sq': {
            name: 'Shqip',
            nativeName: 'Shqip',
            direction: 'ltr'
        },
        'en': {
            name: 'English',
            nativeName: 'English',
            direction: 'ltr'
        }
    };

    /**
     * Initialize the localization module
     */
    async function initialize() {
        console.log('Initializing localization module');

        // Load saved language preference
        const savedLanguage = localStorage.getItem('language');
        if (savedLanguage && supportedLanguages[savedLanguage]) {
            currentLanguage = savedLanguage;
        } else {
            // Try to detect browser language
            const browserLanguage = detectBrowserLanguage();
            if (browserLanguage && supportedLanguages[browserLanguage]) {
                currentLanguage = browserLanguage;
            }
        }

        // Set HTML lang attribute
        document.documentElement.lang = currentLanguage;

        // Set text direction
        document.documentElement.dir = supportedLanguages[currentLanguage].direction;

        // Load translations for current language
        await loadTranslations(currentLanguage);

        // Translate the page
        translatePage();

        // Add language switcher if it doesn't exist
        addLanguageSwitcher();
    }

    /**
     * Detect browser language
     * @returns {string} Language code
     */
    function detectBrowserLanguage() {
        const browserLanguage = navigator.language || navigator.userLanguage;
        if (!browserLanguage) return null;

        // Get the primary language code (e.g., 'en-US' -> 'en')
        const primaryLanguage = browserLanguage.split('-')[0].toLowerCase();

        // Check if it's supported
        return supportedLanguages[primaryLanguage] ? primaryLanguage : null;
    }

    /**
     * Load translations for a specific language
     * @param {string} language - Language code
     */
    async function loadTranslations(language) {
        try {
            // Check if translations are already loaded
            if (translations[language]) {
                return translations[language];
            }

            // Fetch translations from JSON file
            const response = await fetch(`locales/${language}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load translations for ${language}`);
            }

            const data = await response.json();
            translations[language] = data;

            return data;
        } catch (error) {
            console.error(`Error loading translations for ${language}:`, error);

            // Fallback to empty translations object
            translations[language] = {};
            return {};
        }
    }

    /**
     * Translate the entire page
     */
    function translatePage() {
        // Get all elements with data-i18n attribute
        const elements = document.querySelectorAll('[data-i18n]');

        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            translateElement(element, key);
        });

        // Get all elements with data-i18n-placeholder attribute
        const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');

        placeholderElements.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const translation = getTranslation(key);
            if (translation) {
                element.placeholder = translation;
            }
        });

        // Get all elements with data-i18n-aria-label attribute
        const ariaLabelElements = document.querySelectorAll('[data-i18n-aria-label]');

        ariaLabelElements.forEach(element => {
            const key = element.getAttribute('data-i18n-aria-label');
            const translation = getTranslation(key);
            if (translation) {
                element.setAttribute('aria-label', translation);
            }
        });

        // Get all elements with data-i18n-title attribute
        const titleElements = document.querySelectorAll('[data-i18n-title]');

        titleElements.forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            const translation = getTranslation(key);
            if (translation) {
                element.title = translation;
            }
        });
    }

    /**
     * Translate a specific element
     * @param {HTMLElement} element - Element to translate
     * @param {string} key - Translation key
     */
    function translateElement(element, key) {
        const translation = getTranslation(key);
        if (!translation) return;

        // Check if element has HTML content
        if (element.getAttribute('data-i18n-html') === 'true') {
            element.innerHTML = translation;
        } else {
            element.textContent = translation;
        }
    }

    /**
     * Get translation for a key
     * @param {string} key - Translation key
     * @returns {string|null} Translation or null if not found
     */
    function getTranslation(key) {
        if (!key) return null;

        // Split key by dots to support nested objects
        const keys = key.split('.');
        let result = translations[currentLanguage];

        // Navigate through nested objects
        for (const k of keys) {
            if (!result || typeof result !== 'object') {
                return null;
            }
            result = result[k];
        }

        return result || null;
    }

    /**
     * Change the current language
     * @param {string} language - Language code
     */
    async function changeLanguage(language) {
        // Check if language is supported
        if (!supportedLanguages[language]) {
            console.error(`Language ${language} is not supported`);
            return;
        }

        // Save current scroll position
        const scrollPosition = window.scrollY;

        // Set current language
        currentLanguage = language;

        // Save language preference
        localStorage.setItem('language', language);

        // Set HTML lang attribute
        document.documentElement.lang = language;

        // Set text direction
        document.documentElement.dir = supportedLanguages[language].direction;

        // Load translations
        await loadTranslations(language);

        // Translate the page
        translatePage();

        // Update language switcher
        updateLanguageSwitcher();

        // Restore scroll position
        window.scrollTo(0, scrollPosition);

        // Notify callbacks
        languageChangeCallbacks.forEach(callback => {
            try {
                callback(language);
            } catch (error) {
                console.error('Error in language change callback:', error);
            }
        });
    }

    /**
     * Add language switcher to the page
     */
    function addLanguageSwitcher() {
        // Check if language switcher already exists
        if (document.getElementById('language-switcher')) return;

        // Create language switcher container
        const languageSwitcher = document.createElement('div');
        languageSwitcher.id = 'language-switcher';
        languageSwitcher.className = 'language-switcher';
        languageSwitcher.setAttribute('aria-label', 'Language selection');
        languageSwitcher.setAttribute('role', 'navigation');

        // Create language switcher button
        const languageButton = document.createElement('button');
        languageButton.className = 'language-button';
        languageButton.setAttribute('aria-haspopup', 'true');
        languageButton.setAttribute('aria-expanded', 'false');
        languageButton.innerHTML = `
            <span class="current-language">${supportedLanguages[currentLanguage].nativeName}</span>
            <span class="language-icon">🌐</span>
        `;

        // Create language dropdown
        const languageDropdown = document.createElement('ul');
        languageDropdown.className = 'language-dropdown';
        languageDropdown.setAttribute('role', 'menu');

        // Add language options
        Object.keys(supportedLanguages).forEach(langCode => {
            const language = supportedLanguages[langCode];
            const languageOption = document.createElement('li');
            languageOption.setAttribute('role', 'menuitem');

            const languageLink = document.createElement('button');
            languageLink.className = `language-option ${langCode === currentLanguage ? 'active' : ''}`;
            languageLink.setAttribute('data-language', langCode);
            languageLink.textContent = language.nativeName;

            // Add click event
            languageLink.addEventListener('click', function() {
                changeLanguage(langCode);
                languageDropdown.classList.remove('active');
                languageButton.setAttribute('aria-expanded', 'false');
            });

            languageOption.appendChild(languageLink);
            languageDropdown.appendChild(languageOption);
        });

        // Add click event to toggle dropdown
        languageButton.addEventListener('click', function() {
            languageDropdown.classList.toggle('active');
            const isExpanded = languageDropdown.classList.contains('active');
            languageButton.setAttribute('aria-expanded', isExpanded.toString());
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(event) {
            if (!languageSwitcher.contains(event.target)) {
                languageDropdown.classList.remove('active');
                languageButton.setAttribute('aria-expanded', 'false');
            }
        });

        // Add keyboard navigation
        languageDropdown.addEventListener('keydown', function(event) {
            const options = languageDropdown.querySelectorAll('.language-option');
            const activeOption = languageDropdown.querySelector('.language-option:focus');
            const activeIndex = Array.from(options).indexOf(activeOption);

            if (event.key === 'ArrowDown') {
                event.preventDefault();
                const nextIndex = activeIndex < options.length - 1 ? activeIndex + 1 : 0;
                options[nextIndex].focus();
            } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                const prevIndex = activeIndex > 0 ? activeIndex - 1 : options.length - 1;
                options[prevIndex].focus();
            } else if (event.key === 'Escape') {
                event.preventDefault();
                languageDropdown.classList.remove('active');
                languageButton.setAttribute('aria-expanded', 'false');
                languageButton.focus();
            }
        });

        // Append elements
        languageSwitcher.appendChild(languageButton);
        languageSwitcher.appendChild(languageDropdown);

        // Find the right place to insert the language switcher
        const mainNav = document.querySelector('.main-nav');
        if (mainNav) {
            // Insert before theme toggle if it exists
            const themeToggle = mainNav.querySelector('.theme-toggle');
            if (themeToggle) {
                mainNav.insertBefore(languageSwitcher, themeToggle);
            } else {
                mainNav.appendChild(languageSwitcher);
            }
        } else {
            // Fallback: append to body
            document.body.appendChild(languageSwitcher);
        }
    }

    /**
     * Update language switcher
     */
    function updateLanguageSwitcher() {
        const languageSwitcher = document.getElementById('language-switcher');
        if (!languageSwitcher) return;

        // Update current language display
        const currentLanguageElement = languageSwitcher.querySelector('.current-language');
        if (currentLanguageElement) {
            currentLanguageElement.textContent = supportedLanguages[currentLanguage].nativeName;
        }

        // Update active state in dropdown
        const languageOptions = languageSwitcher.querySelectorAll('.language-option');
        languageOptions.forEach(option => {
            const langCode = option.getAttribute('data-language');
            if (langCode === currentLanguage) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
    }

    /**
     * Register a callback for language changes
     * @param {Function} callback - Function to call when language changes
     */
    function onLanguageChange(callback) {
        if (typeof callback === 'function') {
            languageChangeCallbacks.push(callback);
        }
    }

    /**
     * Translate a specific key
     * @param {string} key - Translation key
     * @param {Object} params - Parameters for interpolation
     * @returns {string} Translated text
     */
    function translate(key, params = {}) {
        let translation = getTranslation(key);

        // Return key if translation not found
        if (!translation) return key;

        // Replace parameters
        if (params && typeof params === 'object') {
            Object.keys(params).forEach(param => {
                const regex = new RegExp(`{{\\s*${param}\\s*}}`, 'g');
                translation = translation.replace(regex, params[param]);
            });
        }

        return translation;
    }

    /**
     * Get current language
     * @returns {string} Current language code
     */
    function getCurrentLanguage() {
        return currentLanguage;
    }

    /**
     * Get supported languages
     * @returns {Object} Supported languages
     */
    function getSupportedLanguages() {
        return { ...supportedLanguages };
    }

    /**
     * Update all translations on the page
     * This is useful when dynamically adding content to the page
     */
    function updatePageTranslations() {
        // Use the existing translatePage function
        translatePage();
    }

    // Public API
    return {
        initialize,
        translate,
        changeLanguage,
        getCurrentLanguage,
        getSupportedLanguages,
        updatePageTranslations,
        onLanguageChange,

        // Helper functions (these will be available through LocalizationHelper)
        helper: function() {
            return window.LocalizationHelper || null;
        }
    };
})();
