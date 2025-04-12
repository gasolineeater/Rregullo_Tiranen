/**
 * Localization Helper Functions
 * Provides utility functions for working with translations
 */

const LocalizationHelper = (function() {
    /**
     * Translates a string with variable interpolation
     * @param {string} key - The translation key
     * @param {Object} variables - Object containing variables to interpolate
     * @param {string} fallback - Fallback text if translation is not found
     * @returns {string} - The translated string with variables replaced
     * 
     * Example usage:
     * translateWithVars('common.welcome', { name: 'John' }, 'Welcome, {name}!')
     * If the translation for 'common.welcome' is 'Mirë se vini, {name}!', 
     * this will return 'Mirë se vini, John!'
     */
    function translateWithVars(key, variables = {}, fallback = '') {
        // Get the translation using the LocalizationModule
        let translation = '';
        
        if (typeof LocalizationModule !== 'undefined') {
            translation = LocalizationModule.translate(key, fallback);
        } else {
            translation = fallback;
        }
        
        // Replace variables in the translation
        if (variables && typeof variables === 'object') {
            Object.keys(variables).forEach(varName => {
                const value = variables[varName];
                translation = translation.replace(new RegExp(`{${varName}}`, 'g'), value);
            });
        }
        
        return translation;
    }
    
    /**
     * Formats a date according to the current locale
     * @param {string|Date} date - Date to format
     * @param {Object} options - Formatting options (same as toLocaleDateString)
     * @returns {string} - Formatted date string
     */
    function formatDate(date, options = {}) {
        if (!date) {
            return translateWithVars('common.notAvailable', {}, 'N/A');
        }
        
        const dateObj = date instanceof Date ? date : new Date(date);
        
        // Default options
        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        
        // Merge default options with provided options
        const mergedOptions = { ...defaultOptions, ...options };
        
        // Get current language for date formatting
        const language = typeof LocalizationModule !== 'undefined' ? 
            LocalizationModule.getCurrentLanguage() : 'sq';
        
        // Map language code to locale
        const localeMap = {
            'sq': 'sq-AL',
            'en': 'en-US'
        };
        
        const locale = localeMap[language] || 'sq-AL';
        
        return dateObj.toLocaleDateString(locale, mergedOptions);
    }
    
    /**
     * Formats a time according to the current locale
     * @param {string|Date} date - Date to format
     * @param {Object} options - Formatting options (same as toLocaleTimeString)
     * @returns {string} - Formatted time string
     */
    function formatTime(date, options = {}) {
        if (!date) {
            return translateWithVars('common.notAvailable', {}, 'N/A');
        }
        
        const dateObj = date instanceof Date ? date : new Date(date);
        
        // Default options
        const defaultOptions = {
            hour: '2-digit',
            minute: '2-digit'
        };
        
        // Merge default options with provided options
        const mergedOptions = { ...defaultOptions, ...options };
        
        // Get current language for time formatting
        const language = typeof LocalizationModule !== 'undefined' ? 
            LocalizationModule.getCurrentLanguage() : 'sq';
        
        // Map language code to locale
        const localeMap = {
            'sq': 'sq-AL',
            'en': 'en-US'
        };
        
        const locale = localeMap[language] || 'sq-AL';
        
        return dateObj.toLocaleTimeString(locale, mergedOptions);
    }
    
    /**
     * Formats a date and time according to the current locale
     * @param {string|Date} date - Date to format
     * @param {Object} options - Formatting options
     * @returns {string} - Formatted date and time string
     */
    function formatDateTime(date, options = {}) {
        if (!date) {
            return translateWithVars('common.notAvailable', {}, 'N/A');
        }
        
        const dateObj = date instanceof Date ? date : new Date(date);
        
        // Default options
        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        // Merge default options with provided options
        const mergedOptions = { ...defaultOptions, ...options };
        
        // Get current language for date/time formatting
        const language = typeof LocalizationModule !== 'undefined' ? 
            LocalizationModule.getCurrentLanguage() : 'sq';
        
        // Map language code to locale
        const localeMap = {
            'sq': 'sq-AL',
            'en': 'en-US'
        };
        
        const locale = localeMap[language] || 'sq-AL';
        
        return dateObj.toLocaleString(locale, mergedOptions);
    }
    
    /**
     * Formats a number according to the current locale
     * @param {number} number - Number to format
     * @param {Object} options - Formatting options (same as toLocaleString)
     * @returns {string} - Formatted number string
     */
    function formatNumber(number, options = {}) {
        if (number === null || number === undefined) {
            return translateWithVars('common.notAvailable', {}, 'N/A');
        }
        
        // Get current language for number formatting
        const language = typeof LocalizationModule !== 'undefined' ? 
            LocalizationModule.getCurrentLanguage() : 'sq';
        
        // Map language code to locale
        const localeMap = {
            'sq': 'sq-AL',
            'en': 'en-US'
        };
        
        const locale = localeMap[language] || 'sq-AL';
        
        return number.toLocaleString(locale, options);
    }
    
    /**
     * Translates a category name
     * @param {string} category - Category ID
     * @returns {string} - Translated category name
     */
    function translateCategory(category) {
        if (!category) {
            return translateWithVars('common.undefined', {}, 'E papërcaktuar');
        }
        
        const translationKey = `reportDetail.category.${category.replace(/-/g, '')}`;
        
        // Map of fallback values
        const fallbackMap = {
            'infrastructure': 'Infrastrukturë',
            'environment': 'Mjedis',
            'public-services': 'Shërbime Publike',
            'community': 'Komunitet'
        };
        
        const fallback = fallbackMap[category] || category;
        
        return translateWithVars(translationKey, {}, fallback);
    }
    
    /**
     * Translates a subcategory name
     * @param {string} subcategory - Subcategory ID
     * @returns {string} - Translated subcategory name
     */
    function translateSubcategory(subcategory) {
        if (!subcategory) {
            return translateWithVars('common.undefined', {}, 'E papërcaktuar');
        }
        
        const translationKey = `reportDetail.subcategory.${subcategory.replace(/-/g, '')}`;
        
        // Map of fallback values
        const fallbackMap = {
            'road-damage': 'Dëmtime të rrugëve',
            'sidewalk-damage': 'Dëmtime të trotuareve',
            'street-lighting': 'Ndriçimi rrugor',
            'public-facilities': 'Objekte publike',
            'traffic-signals': 'Sinjalistika',
            'littering': 'Mbeturina',
            'green-space': 'Hapësira të gjelbra',
            'pollution': 'Ndotje',
            'tree-planting': 'Mbjellje pemësh',
            'waste-collection': 'Grumbullimi i mbeturinave',
            'public-transport': 'Transporti publik',
            'water-utilities': 'Ujë dhe shërbime',
            'public-building': 'Ndërtesa publike',
            'beautification': 'Zbukurim i lagjes',
            'public-safety': 'Siguria publike',
            'accessibility': 'Aksesueshmria',
            'cultural-preservation': 'Trashëgimia kulturore'
        };
        
        const fallback = fallbackMap[subcategory] || subcategory;
        
        return translateWithVars(translationKey, {}, fallback);
    }
    
    /**
     * Translates a status name
     * @param {string} status - Status ID
     * @returns {string} - Translated status name
     */
    function translateStatus(status) {
        if (!status) {
            return translateWithVars('common.undefined', {}, 'E papërcaktuar');
        }
        
        const translationKey = `reportDetail.status.${status.replace(/-/g, '')}`;
        
        // Map of fallback values
        const fallbackMap = {
            'pending': 'Në pritje',
            'in-progress': 'Në proces',
            'resolved': 'I zgjidhur'
        };
        
        const fallback = fallbackMap[status] || status;
        
        return translateWithVars(translationKey, {}, fallback);
    }
    
    /**
     * Translates a severity level
     * @param {string} severity - Severity ID
     * @returns {string} - Translated severity name
     */
    function translateSeverity(severity) {
        if (!severity) {
            return translateWithVars('common.undefined', {}, 'E papërcaktuar');
        }
        
        const translationKey = `reportDetail.severity.${severity}`;
        
        // Map of fallback values
        const fallbackMap = {
            'low': 'I ulët',
            'medium': 'Mesatar',
            'high': 'I lartë',
            'urgent': 'Urgjent'
        };
        
        const fallback = fallbackMap[severity] || severity;
        
        return translateWithVars(translationKey, {}, fallback);
    }
    
    /**
     * Translates a neighborhood name
     * @param {string} neighborhood - Neighborhood ID
     * @returns {string} - Translated neighborhood name
     */
    function translateNeighborhood(neighborhood) {
        if (!neighborhood) {
            return translateWithVars('common.undefined', {}, 'E papërcaktuar');
        }
        
        const translationKey = `reportDetail.neighborhood.${neighborhood}`;
        
        // Map of fallback values
        const fallbackMap = {
            'njesia1': 'Njësia Administrative Nr. 1',
            'njesia2': 'Njësia Administrative Nr. 2',
            'njesia3': 'Njësia Administrative Nr. 3',
            'njesia4': 'Njësia Administrative Nr. 4',
            'njesia5': 'Njësia Administrative Nr. 5',
            'njesia6': 'Njësia Administrative Nr. 6',
            'njesia7': 'Njësia Administrative Nr. 7',
            'njesia8': 'Njësia Administrative Nr. 8',
            'njesia9': 'Njësia Administrative Nr. 9',
            'njesia10': 'Njësia Administrative Nr. 10',
            'njesia11': 'Njësia Administrative Nr. 11'
        };
        
        const fallback = fallbackMap[neighborhood] || neighborhood;
        
        return translateWithVars(translationKey, {}, fallback);
    }
    
    /**
     * Updates all elements with data-i18n attributes on the page
     * This is useful when dynamically adding content to the page
     */
    function updatePageTranslations() {
        if (typeof LocalizationModule !== 'undefined') {
            LocalizationModule.updatePageTranslations();
        }
    }
    
    // Public API
    return {
        translateWithVars,
        formatDate,
        formatTime,
        formatDateTime,
        formatNumber,
        translateCategory,
        translateSubcategory,
        translateStatus,
        translateSeverity,
        translateNeighborhood,
        updatePageTranslations
    };
})();

// Make sure the helper is available globally
window.LocalizationHelper = LocalizationHelper;
