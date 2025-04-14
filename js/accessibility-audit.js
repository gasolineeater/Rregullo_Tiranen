/**
 * Accessibility Audit Script for Rregullo Tiranen
 * Performs automated accessibility checks and provides recommendations
 */

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Only run in development mode
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('Accessibility audit initialized');
        
        // Run audit
        runAccessibilityAudit();
    }
});

/**
 * Run accessibility audit
 */
function runAccessibilityAudit() {
    // Create audit results container
    const auditResults = {
        errors: [],
        warnings: [],
        notices: []
    };
    
    // Run checks
    checkImagesWithoutAlt(auditResults);
    checkHeadingHierarchy(auditResults);
    checkColorContrast(auditResults);
    checkFormLabels(auditResults);
    checkARIAAttributes(auditResults);
    checkKeyboardNavigation(auditResults);
    checkFocusStyles(auditResults);
    checkTextSize(auditResults);
    
    // Log results
    console.group('Accessibility Audit Results');
    console.log(`Errors: ${auditResults.errors.length}`);
    console.log(`Warnings: ${auditResults.warnings.length}`);
    console.log(`Notices: ${auditResults.notices.length}`);
    
    if (auditResults.errors.length > 0) {
        console.group('Errors');
        auditResults.errors.forEach(error => {
            console.error(`${error.message}`, error.element);
        });
        console.groupEnd();
    }
    
    if (auditResults.warnings.length > 0) {
        console.group('Warnings');
        auditResults.warnings.forEach(warning => {
            console.warn(`${warning.message}`, warning.element);
        });
        console.groupEnd();
    }
    
    if (auditResults.notices.length > 0) {
        console.group('Notices');
        auditResults.notices.forEach(notice => {
            console.info(`${notice.message}`, notice.element);
        });
        console.groupEnd();
    }
    
    console.groupEnd();
    
    // Show audit results UI
    showAuditResultsUI(auditResults);
}

/**
 * Check images without alt attributes
 * @param {Object} auditResults - Audit results object
 */
function checkImagesWithoutAlt(auditResults) {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        if (!img.hasAttribute('alt')) {
            auditResults.errors.push({
                message: 'Image missing alt attribute',
                element: img,
                fix: 'Add alt attribute to image'
            });
        } else if (img.alt === '') {
            // Empty alt is valid for decorative images, but let's add a notice
            auditResults.notices.push({
                message: 'Image has empty alt attribute (valid for decorative images)',
                element: img,
                fix: 'Ensure this image is decorative'
            });
        }
    });
}

/**
 * Check heading hierarchy
 * @param {Object} auditResults - Audit results object
 */
function checkHeadingHierarchy(auditResults) {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const headingLevels = [];
    
    headings.forEach(heading => {
        const level = parseInt(heading.tagName.substring(1));
        headingLevels.push({ level, element: heading });
    });
    
    // Check if there's an h1
    if (!document.querySelector('h1')) {
        auditResults.errors.push({
            message: 'Page missing h1 heading',
            element: document.body,
            fix: 'Add an h1 heading to the page'
        });
    }
    
    // Check for skipped heading levels
    for (let i = 0; i < headingLevels.length - 1; i++) {
        const current = headingLevels[i];
        const next = headingLevels[i + 1];
        
        if (next.level > current.level && next.level > current.level + 1) {
            auditResults.warnings.push({
                message: `Skipped heading level: h${current.level} to h${next.level}`,
                element: next.element,
                fix: `Change h${next.level} to h${current.level + 1}`
            });
        }
    }
}

/**
 * Check color contrast
 * @param {Object} auditResults - Audit results object
 */
function checkColorContrast(auditResults) {
    // This is a simplified check - a real implementation would need to calculate contrast ratios
    const elements = document.querySelectorAll('*');
    
    elements.forEach(element => {
        const style = window.getComputedStyle(element);
        const color = style.color;
        const backgroundColor = style.backgroundColor;
        
        // Skip elements with transparent background
        if (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
            return;
        }
        
        // Skip elements without text
        if (!element.textContent.trim()) {
            return;
        }
        
        // Check if color is very light on light background or very dark on dark background
        // This is a very simplified check - a real implementation would calculate contrast ratios
        if (isLightColor(color) && isLightColor(backgroundColor)) {
            auditResults.warnings.push({
                message: 'Potential low contrast: light text on light background',
                element: element,
                fix: 'Increase contrast between text and background'
            });
        } else if (isDarkColor(color) && isDarkColor(backgroundColor)) {
            auditResults.warnings.push({
                message: 'Potential low contrast: dark text on dark background',
                element: element,
                fix: 'Increase contrast between text and background'
            });
        }
    });
}

/**
 * Check if a color is light
 * @param {string} color - CSS color value
 * @returns {boolean} - Whether the color is light
 */
function isLightColor(color) {
    // Convert color to RGB
    const rgb = colorToRgb(color);
    
    if (!rgb) {
        return false;
    }
    
    // Calculate brightness
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    
    // Return true if brightness is high (light color)
    return brightness > 200;
}

/**
 * Check if a color is dark
 * @param {string} color - CSS color value
 * @returns {boolean} - Whether the color is dark
 */
function isDarkColor(color) {
    // Convert color to RGB
    const rgb = colorToRgb(color);
    
    if (!rgb) {
        return false;
    }
    
    // Calculate brightness
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    
    // Return true if brightness is low (dark color)
    return brightness < 50;
}

/**
 * Convert CSS color to RGB
 * @param {string} color - CSS color value
 * @returns {Object|null} - RGB object or null if conversion failed
 */
function colorToRgb(color) {
    // Create a temporary element
    const tempElement = document.createElement('div');
    tempElement.style.color = color;
    document.body.appendChild(tempElement);
    
    // Get computed style
    const computedColor = window.getComputedStyle(tempElement).color;
    
    // Remove temporary element
    document.body.removeChild(tempElement);
    
    // Parse RGB values
    const match = computedColor.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
    
    if (match) {
        return {
            r: parseInt(match[1]),
            g: parseInt(match[2]),
            b: parseInt(match[3])
        };
    }
    
    // Parse RGBA values
    const matchRgba = computedColor.match(/^rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([0-9.]+)\s*\)$/i);
    
    if (matchRgba) {
        return {
            r: parseInt(matchRgba[1]),
            g: parseInt(matchRgba[2]),
            b: parseInt(matchRgba[3]),
            a: parseFloat(matchRgba[4])
        };
    }
    
    return null;
}

/**
 * Check form labels
 * @param {Object} auditResults - Audit results object
 */
function checkFormLabels(auditResults) {
    const formElements = document.querySelectorAll('input, select, textarea');
    
    formElements.forEach(element => {
        // Skip hidden inputs
        if (element.type === 'hidden') {
            return;
        }
        
        // Check if element has an id
        if (!element.id) {
            auditResults.errors.push({
                message: 'Form element missing id attribute',
                element: element,
                fix: 'Add id attribute to form element'
            });
            return;
        }
        
        // Check if element has a label
        const label = document.querySelector(`label[for="${element.id}"]`);
        
        if (!label) {
            // Check if element is inside a label
            const parentLabel = element.closest('label');
            
            if (!parentLabel) {
                auditResults.errors.push({
                    message: 'Form element missing label',
                    element: element,
                    fix: `Add label with for="${element.id}" attribute`
                });
            }
        }
        
        // Check if element has aria-label or aria-labelledby if no visible label
        if (!label && !element.closest('label')) {
            if (!element.hasAttribute('aria-label') && !element.hasAttribute('aria-labelledby')) {
                auditResults.errors.push({
                    message: 'Form element missing accessible label',
                    element: element,
                    fix: 'Add aria-label or aria-labelledby attribute'
                });
            }
        }
    });
}

/**
 * Check ARIA attributes
 * @param {Object} auditResults - Audit results object
 */
function checkARIAAttributes(auditResults) {
    // Check for invalid ARIA roles
    const elementsWithRole = document.querySelectorAll('[role]');
    
    elementsWithRole.forEach(element => {
        const role = element.getAttribute('role');
        
        // Check if role is valid
        const validRoles = [
            'alert', 'alertdialog', 'application', 'article', 'banner', 'button', 'cell', 'checkbox',
            'columnheader', 'combobox', 'complementary', 'contentinfo', 'definition', 'dialog',
            'directory', 'document', 'feed', 'figure', 'form', 'grid', 'gridcell', 'group', 'heading',
            'img', 'link', 'list', 'listbox', 'listitem', 'log', 'main', 'marquee', 'math', 'menu',
            'menubar', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'navigation', 'none',
            'note', 'option', 'presentation', 'progressbar', 'radio', 'radiogroup', 'region',
            'row', 'rowgroup', 'rowheader', 'scrollbar', 'search', 'searchbox', 'separator',
            'slider', 'spinbutton', 'status', 'switch', 'tab', 'table', 'tablist', 'tabpanel',
            'term', 'textbox', 'timer', 'toolbar', 'tooltip', 'tree', 'treegrid', 'treeitem'
        ];
        
        if (!validRoles.includes(role)) {
            auditResults.errors.push({
                message: `Invalid ARIA role: ${role}`,
                element: element,
                fix: 'Use a valid ARIA role or remove the role attribute'
            });
        }
    });
    
    // Check for required ARIA attributes
    const elementsWithRequiredAttributes = {
        'aria-expanded': ['button', 'link'],
        'aria-controls': ['button', 'link'],
        'aria-selected': ['option', 'tab'],
        'aria-checked': ['checkbox', 'radio', 'switch', 'menuitemcheckbox', 'menuitemradio'],
        'aria-labelledby': ['dialog', 'alertdialog']
    };
    
    Object.entries(elementsWithRequiredAttributes).forEach(([attribute, roles]) => {
        roles.forEach(role => {
            const elements = document.querySelectorAll(`[role="${role}"]`);
            
            elements.forEach(element => {
                if (!element.hasAttribute(attribute)) {
                    auditResults.warnings.push({
                        message: `Element with role="${role}" should have ${attribute} attribute`,
                        element: element,
                        fix: `Add ${attribute} attribute to element`
                    });
                }
            });
        });
    });
}

/**
 * Check keyboard navigation
 * @param {Object} auditResults - Audit results object
 */
function checkKeyboardNavigation(auditResults) {
    // Check for elements with click handlers but no keyboard handlers
    const clickableElements = document.querySelectorAll('a, button, [role="button"], [role="link"]');
    
    clickableElements.forEach(element => {
        // Check if element has tabindex
        if (element.hasAttribute('tabindex') && element.getAttribute('tabindex') === '-1') {
            auditResults.warnings.push({
                message: 'Interactive element not keyboard accessible (tabindex="-1")',
                element: element,
                fix: 'Remove tabindex="-1" or ensure element is not interactive'
            });
        }
        
        // Check if element has keyboard event handlers
        const hasClickHandler = element.onclick || element.addEventListener;
        const hasKeyboardHandler = element.onkeydown || element.onkeyup || element.onkeypress;
        
        if (hasClickHandler && !hasKeyboardHandler) {
            auditResults.warnings.push({
                message: 'Element has click handler but no keyboard handler',
                element: element,
                fix: 'Add keyboard event handlers (keydown, keyup) to element'
            });
        }
    });
}

/**
 * Check focus styles
 * @param {Object} auditResults - Audit results object
 */
function checkFocusStyles(auditResults) {
    // Check for elements with outline: none or outline: 0
    const elements = document.querySelectorAll('*');
    
    elements.forEach(element => {
        const style = window.getComputedStyle(element);
        
        if (style.outline === 'none' || style.outline === '0px') {
            // Check if element has a focus style
            const hasFocusStyle = element.classList.contains('focus') || 
                                 element.querySelector(':focus') || 
                                 element.matches(':focus');
            
            if (!hasFocusStyle) {
                auditResults.warnings.push({
                    message: 'Element has outline: none but no visible focus style',
                    element: element,
                    fix: 'Add visible focus style or remove outline: none'
                });
            }
        }
    });
}

/**
 * Check text size
 * @param {Object} auditResults - Audit results object
 */
function checkTextSize(auditResults) {
    // Check for text smaller than 16px
    const textElements = document.querySelectorAll('p, span, a, button, h1, h2, h3, h4, h5, h6, li, td, th, label, input, select, textarea');
    
    textElements.forEach(element => {
        const style = window.getComputedStyle(element);
        const fontSize = parseFloat(style.fontSize);
        
        if (fontSize < 16) {
            auditResults.notices.push({
                message: `Text size smaller than 16px: ${fontSize}px`,
                element: element,
                fix: 'Increase text size to at least 16px for better readability on mobile'
            });
        }
    });
}

/**
 * Show audit results UI
 * @param {Object} auditResults - Audit results object
 */
function showAuditResultsUI(auditResults) {
    // Create audit results UI if it doesn't exist
    let auditResultsUI = document.getElementById('accessibility-audit-results');
    
    if (!auditResultsUI) {
        auditResultsUI = document.createElement('div');
        auditResultsUI.id = 'accessibility-audit-results';
        auditResultsUI.className = 'accessibility-audit-results';
        auditResultsUI.innerHTML = `
            <div class="audit-header">
                <h3>Accessibility Audit Results</h3>
                <button class="audit-close">&times;</button>
            </div>
            <div class="audit-summary">
                <div class="audit-count errors">
                    <span class="count">${auditResults.errors.length}</span>
                    <span class="label">Errors</span>
                </div>
                <div class="audit-count warnings">
                    <span class="count">${auditResults.warnings.length}</span>
                    <span class="label">Warnings</span>
                </div>
                <div class="audit-count notices">
                    <span class="count">${auditResults.notices.length}</span>
                    <span class="label">Notices</span>
                </div>
            </div>
            <div class="audit-tabs">
                <button class="audit-tab active" data-tab="errors">Errors</button>
                <button class="audit-tab" data-tab="warnings">Warnings</button>
                <button class="audit-tab" data-tab="notices">Notices</button>
            </div>
            <div class="audit-content">
                <div class="audit-tab-content active" data-tab="errors">
                    ${auditResults.errors.length === 0 ? '<p>No errors found.</p>' : ''}
                    <ul class="audit-list">
                        ${auditResults.errors.map((error, index) => `
                            <li class="audit-item" data-index="${index}">
                                <div class="audit-item-header">
                                    <span class="audit-item-title">${error.message}</span>
                                    <button class="audit-item-highlight">Highlight</button>
                                </div>
                                <div class="audit-item-fix">
                                    <strong>Fix:</strong> ${error.fix}
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                </div>
                <div class="audit-tab-content" data-tab="warnings">
                    ${auditResults.warnings.length === 0 ? '<p>No warnings found.</p>' : ''}
                    <ul class="audit-list">
                        ${auditResults.warnings.map((warning, index) => `
                            <li class="audit-item" data-index="${index}">
                                <div class="audit-item-header">
                                    <span class="audit-item-title">${warning.message}</span>
                                    <button class="audit-item-highlight">Highlight</button>
                                </div>
                                <div class="audit-item-fix">
                                    <strong>Fix:</strong> ${warning.fix}
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                </div>
                <div class="audit-tab-content" data-tab="notices">
                    ${auditResults.notices.length === 0 ? '<p>No notices found.</p>' : ''}
                    <ul class="audit-list">
                        ${auditResults.notices.map((notice, index) => `
                            <li class="audit-item" data-index="${index}">
                                <div class="audit-item-header">
                                    <span class="audit-item-title">${notice.message}</span>
                                    <button class="audit-item-highlight">Highlight</button>
                                </div>
                                <div class="audit-item-fix">
                                    <strong>Fix:</strong> ${notice.fix}
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .accessibility-audit-results {
                position: fixed;
                bottom: 0;
                right: 0;
                width: 400px;
                max-height: 500px;
                background-color: #fff;
                border: 1px solid #ccc;
                border-radius: 4px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                z-index: 9999;
                overflow: hidden;
                font-family: sans-serif;
                font-size: 14px;
                line-height: 1.5;
            }
            
            .audit-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px;
                background-color: #f5f5f5;
                border-bottom: 1px solid #ccc;
            }
            
            .audit-header h3 {
                margin: 0;
                font-size: 16px;
            }
            
            .audit-close {
                background: none;
                border: none;
                font-size: 20px;
                cursor: pointer;
                color: #666;
            }
            
            .audit-summary {
                display: flex;
                justify-content: space-around;
                padding: 10px;
                background-color: #f9f9f9;
                border-bottom: 1px solid #ccc;
            }
            
            .audit-count {
                text-align: center;
            }
            
            .audit-count .count {
                display: block;
                font-size: 24px;
                font-weight: bold;
            }
            
            .audit-count .label {
                display: block;
                font-size: 12px;
                color: #666;
            }
            
            .audit-count.errors .count {
                color: #d9534f;
            }
            
            .audit-count.warnings .count {
                color: #f0ad4e;
            }
            
            .audit-count.notices .count {
                color: #5bc0de;
            }
            
            .audit-tabs {
                display: flex;
                border-bottom: 1px solid #ccc;
            }
            
            .audit-tab {
                flex: 1;
                padding: 10px;
                background-color: #f5f5f5;
                border: none;
                border-right: 1px solid #ccc;
                cursor: pointer;
                font-size: 14px;
                font-weight: bold;
                color: #666;
            }
            
            .audit-tab:last-child {
                border-right: none;
            }
            
            .audit-tab.active {
                background-color: #fff;
                color: #333;
                border-bottom: 2px solid #337ab7;
            }
            
            .audit-content {
                max-height: 300px;
                overflow-y: auto;
            }
            
            .audit-tab-content {
                display: none;
                padding: 10px;
            }
            
            .audit-tab-content.active {
                display: block;
            }
            
            .audit-list {
                list-style: none;
                margin: 0;
                padding: 0;
            }
            
            .audit-item {
                margin-bottom: 10px;
                padding: 10px;
                background-color: #f9f9f9;
                border-radius: 4px;
                border-left: 3px solid #ccc;
            }
            
            .audit-tab-content[data-tab="errors"] .audit-item {
                border-left-color: #d9534f;
            }
            
            .audit-tab-content[data-tab="warnings"] .audit-item {
                border-left-color: #f0ad4e;
            }
            
            .audit-tab-content[data-tab="notices"] .audit-item {
                border-left-color: #5bc0de;
            }
            
            .audit-item-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 5px;
            }
            
            .audit-item-title {
                font-weight: bold;
            }
            
            .audit-item-highlight {
                background-color: #337ab7;
                color: #fff;
                border: none;
                border-radius: 4px;
                padding: 5px 10px;
                font-size: 12px;
                cursor: pointer;
            }
            
            .audit-item-fix {
                font-size: 12px;
                color: #666;
            }
            
            /* Highlight styles */
            .accessibility-highlight {
                outline: 2px solid #d9534f !important;
                outline-offset: 2px !important;
                position: relative;
                z-index: 9998;
            }
            
            /* Mobile styles */
            @media (max-width: 768px) {
                .accessibility-audit-results {
                    width: 100%;
                    max-height: 50vh;
                    bottom: 0;
                    right: 0;
                    border-radius: 0;
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(auditResultsUI);
        
        // Add event listeners
        auditResultsUI.querySelector('.audit-close').addEventListener('click', function() {
            auditResultsUI.remove();
        });
        
        // Tab switching
        const tabs = auditResultsUI.querySelectorAll('.audit-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Remove active class from all tabs
                tabs.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tab
                tab.classList.add('active');
                
                // Hide all tab content
                const tabContents = auditResultsUI.querySelectorAll('.audit-tab-content');
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Show clicked tab content
                const tabName = tab.getAttribute('data-tab');
                const tabContent = auditResultsUI.querySelector(`.audit-tab-content[data-tab="${tabName}"]`);
                tabContent.classList.add('active');
            });
        });
        
        // Highlight buttons
        const highlightButtons = auditResultsUI.querySelectorAll('.audit-item-highlight');
        highlightButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Get issue type and index
                const item = button.closest('.audit-item');
                const index = parseInt(item.getAttribute('data-index'));
                const tabContent = button.closest('.audit-tab-content');
                const tabName = tabContent.getAttribute('data-tab');
                
                // Get element to highlight
                const element = auditResults[tabName][index].element;
                
                // Remove highlight from all elements
                document.querySelectorAll('.accessibility-highlight').forEach(el => {
                    el.classList.remove('accessibility-highlight');
                });
                
                // Add highlight to element
                element.classList.add('accessibility-highlight');
                
                // Scroll to element
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Remove highlight after 3 seconds
                setTimeout(() => {
                    element.classList.remove('accessibility-highlight');
                }, 3000);
            });
        });
    }
}
