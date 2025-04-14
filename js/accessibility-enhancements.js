/**
 * Accessibility Enhancements for Rregullo Tiranen
 * Improves accessibility with ARIA attributes and keyboard navigation
 */

document.addEventListener('DOMContentLoaded', function() {
    // Add ARIA attributes to improve screen reader support
    addAriaAttributes();
    
    // Initialize keyboard navigation enhancements
    initKeyboardNavigation();
});

/**
 * Add ARIA attributes to improve screen reader support
 */
function addAriaAttributes() {
    // Add landmark roles to main sections
    addLandmarkRoles();
    
    // Add ARIA labels to form elements
    addFormAriaLabels();
    
    // Add ARIA attributes to interactive elements
    addInteractiveAriaAttributes();
    
    // Add ARIA attributes to navigation
    addNavigationAriaAttributes();
}

/**
 * Add landmark roles to main sections
 */
function addLandmarkRoles() {
    // Add role="banner" to header
    const header = document.querySelector('header.main-header');
    if (header && !header.hasAttribute('role')) {
        header.setAttribute('role', 'banner');
        header.setAttribute('aria-label', 'Header');
    }
    
    // Add role="navigation" to nav
    const navs = document.querySelectorAll('nav, .main-nav');
    navs.forEach(nav => {
        if (!nav.hasAttribute('role')) {
            nav.setAttribute('role', 'navigation');
            nav.setAttribute('aria-label', 'Main Navigation');
        }
    });
    
    // Add role="main" to main content
    const main = document.querySelector('main, .main-content, section.main-section');
    if (main && !main.hasAttribute('role')) {
        main.setAttribute('role', 'main');
    }
    
    // Add role="contentinfo" to footer
    const footer = document.querySelector('footer');
    if (footer && !footer.hasAttribute('role')) {
        footer.setAttribute('role', 'contentinfo');
        footer.setAttribute('aria-label', 'Footer');
    }
    
    // Add role="search" to search forms
    const searchForms = document.querySelectorAll('form[action*="search"], .search-form');
    searchForms.forEach(form => {
        if (!form.hasAttribute('role')) {
            form.setAttribute('role', 'search');
            form.setAttribute('aria-label', 'Search');
        }
    });
    
    // Add role="complementary" to sidebars and asides
    const asides = document.querySelectorAll('aside, .sidebar');
    asides.forEach(aside => {
        if (!aside.hasAttribute('role')) {
            aside.setAttribute('role', 'complementary');
            aside.setAttribute('aria-label', 'Sidebar');
        }
    });
}

/**
 * Add ARIA labels to form elements
 */
function addFormAriaLabels() {
    // Add aria-required to required form fields
    const requiredFields = document.querySelectorAll('input[required], select[required], textarea[required]');
    requiredFields.forEach(field => {
        if (!field.hasAttribute('aria-required')) {
            field.setAttribute('aria-required', 'true');
        }
    });
    
    // Add aria-invalid to invalid form fields
    const invalidFields = document.querySelectorAll('input:invalid, select:invalid, textarea:invalid');
    invalidFields.forEach(field => {
        if (!field.hasAttribute('aria-invalid')) {
            field.setAttribute('aria-invalid', 'true');
        }
    });
    
    // Add aria-describedby for form fields with descriptions
    const formFields = document.querySelectorAll('input, select, textarea');
    formFields.forEach(field => {
        // Check if field has an id
        if (field.id) {
            // Look for description elements
            const description = document.querySelector(`#${field.id}-description, #${field.id}-help, #${field.id}-error`);
            if (description && !field.hasAttribute('aria-describedby')) {
                field.setAttribute('aria-describedby', description.id);
            }
        }
    });
    
    // Add missing labels or aria-label for form fields
    const unlabeledFields = document.querySelectorAll('input:not([type="hidden"]), select, textarea');
    unlabeledFields.forEach(field => {
        // Skip if field already has a label
        if (field.id && document.querySelector(`label[for="${field.id}"]`)) {
            return;
        }
        
        // Skip if field is inside a label
        if (field.closest('label')) {
            return;
        }
        
        // Skip if field has aria-label or aria-labelledby
        if (field.hasAttribute('aria-label') || field.hasAttribute('aria-labelledby')) {
            return;
        }
        
        // Add aria-label based on placeholder or name
        if (field.hasAttribute('placeholder')) {
            field.setAttribute('aria-label', field.getAttribute('placeholder'));
        } else if (field.name) {
            // Convert name to label (e.g., "first_name" to "First Name")
            const label = field.name
                .replace(/_/g, ' ')
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase());
            
            field.setAttribute('aria-label', label);
        }
    });
}

/**
 * Add ARIA attributes to interactive elements
 */
function addInteractiveAriaAttributes() {
    // Add role="button" to elements that look like buttons but aren't
    const buttonLikes = document.querySelectorAll('.btn, .button, [class*="btn-"], [class*="button-"]');
    buttonLikes.forEach(element => {
        // Skip actual buttons and links
        if (element.tagName === 'BUTTON' || element.tagName === 'A' || element.hasAttribute('role')) {
            return;
        }
        
        element.setAttribute('role', 'button');
        element.setAttribute('tabindex', '0');
    });
    
    // Add aria-expanded to dropdown toggles
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle, [data-toggle="dropdown"], .accordion-toggle, [data-toggle="collapse"]');
    dropdownToggles.forEach(toggle => {
        if (!toggle.hasAttribute('aria-expanded')) {
            // Check if dropdown is open
            const target = document.querySelector(toggle.getAttribute('data-target') || toggle.getAttribute('href'));
            const isExpanded = target ? target.classList.contains('show') || target.classList.contains('open') || target.style.display !== 'none' : false;
            
            toggle.setAttribute('aria-expanded', isExpanded.toString());
        }
    });
    
    // Add aria-current to current navigation items
    const currentNavItems = document.querySelectorAll('.active, .current, .current-menu-item');
    currentNavItems.forEach(item => {
        if (!item.hasAttribute('aria-current')) {
            item.setAttribute('aria-current', 'page');
        }
    });
    
    // Add aria-hidden to decorative elements
    const decorativeElements = document.querySelectorAll('.decorative, .decoration, .bg-image, .background-image');
    decorativeElements.forEach(element => {
        if (!element.hasAttribute('aria-hidden')) {
            element.setAttribute('aria-hidden', 'true');
        }
    });
}

/**
 * Add ARIA attributes to navigation
 */
function addNavigationAriaAttributes() {
    // Add aria-label to navigation
    const mainNav = document.querySelector('.main-nav, nav.primary-navigation');
    if (mainNav && !mainNav.hasAttribute('aria-label')) {
        mainNav.setAttribute('aria-label', 'Main Navigation');
    }
    
    // Add aria-label to secondary navigation
    const secondaryNav = document.querySelector('.secondary-nav, nav.secondary-navigation');
    if (secondaryNav && !secondaryNav.hasAttribute('aria-label')) {
        secondaryNav.setAttribute('aria-label', 'Secondary Navigation');
    }
    
    // Add aria-label to footer navigation
    const footerNav = document.querySelector('footer nav, .footer-nav');
    if (footerNav && !footerNav.hasAttribute('aria-label')) {
        footerNav.setAttribute('aria-label', 'Footer Navigation');
    }
    
    // Add aria-label to mobile navigation
    const mobileNav = document.querySelector('.mobile-nav, .mobile-menu, .responsive-menu');
    if (mobileNav && !mobileNav.hasAttribute('aria-label')) {
        mobileNav.setAttribute('aria-label', 'Mobile Navigation');
    }
    
    // Add aria-controls to mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle, #mobile-menu-toggle, .menu-toggle');
    if (mobileMenuToggle) {
        const mobileMenu = document.querySelector('.main-nav, .mobile-nav, .mobile-menu');
        if (mobileMenu && !mobileMenuToggle.hasAttribute('aria-controls')) {
            // Add id to mobile menu if it doesn't have one
            if (!mobileMenu.id) {
                mobileMenu.id = 'mobile-menu';
            }
            
            mobileMenuToggle.setAttribute('aria-controls', mobileMenu.id);
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
            mobileMenuToggle.setAttribute('aria-label', 'Toggle Navigation Menu');
        }
    }
}

/**
 * Initialize keyboard navigation enhancements
 */
function initKeyboardNavigation() {
    // Add keyboard support for custom buttons
    addKeyboardSupportForButtons();
    
    // Add keyboard support for dropdowns
    addKeyboardSupportForDropdowns();
    
    // Add keyboard support for tabs
    addKeyboardSupportForTabs();
    
    // Add keyboard support for mobile menu toggle
    addKeyboardSupportForMobileMenu();
}

/**
 * Add keyboard support for custom buttons
 */
function addKeyboardSupportForButtons() {
    // Find elements with role="button" that aren't actual buttons
    const customButtons = document.querySelectorAll('[role="button"]:not(button):not(a)');
    
    customButtons.forEach(button => {
        // Add tabindex if not present
        if (!button.hasAttribute('tabindex')) {
            button.setAttribute('tabindex', '0');
        }
        
        // Add keyboard event listeners
        button.addEventListener('keydown', function(event) {
            // Handle Enter and Space keys
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                button.click();
            }
        });
    });
}

/**
 * Add keyboard support for dropdowns
 */
function addKeyboardSupportForDropdowns() {
    // Find dropdown toggles
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle, [data-toggle="dropdown"]');
    
    dropdownToggles.forEach(toggle => {
        // Add keyboard event listeners
        toggle.addEventListener('keydown', function(event) {
            // Handle Enter, Space, Down keys
            if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
                event.preventDefault();
                
                // Get dropdown menu
                const target = document.querySelector(toggle.getAttribute('data-target') || toggle.getAttribute('href'));
                
                if (target) {
                    // Toggle dropdown
                    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
                    toggle.setAttribute('aria-expanded', (!isExpanded).toString());
                    
                    // Show/hide dropdown
                    target.classList.toggle('show');
                    target.classList.toggle('open');
                    
                    // Focus first item in dropdown
                    if (!isExpanded) {
                        const firstItem = target.querySelector('a, button, [tabindex="0"]');
                        if (firstItem) {
                            firstItem.focus();
                        }
                    }
                }
            }
        });
    });
    
    // Find dropdown menus
    const dropdownMenus = document.querySelectorAll('.dropdown-menu, .sub-menu');
    
    dropdownMenus.forEach(menu => {
        // Add keyboard event listeners
        menu.addEventListener('keydown', function(event) {
            // Handle Escape key
            if (event.key === 'Escape') {
                event.preventDefault();
                
                // Find toggle button
                const toggle = document.querySelector(`[aria-controls="${menu.id}"], [data-target="#${menu.id}"], [href="#${menu.id}"]`);
                
                if (toggle) {
                    // Close dropdown
                    toggle.setAttribute('aria-expanded', 'false');
                    menu.classList.remove('show');
                    menu.classList.remove('open');
                    
                    // Focus toggle
                    toggle.focus();
                }
            }
        });
    });
}

/**
 * Add keyboard support for tabs
 */
function addKeyboardSupportForTabs() {
    // Find tab lists
    const tabLists = document.querySelectorAll('[role="tablist"]');
    
    tabLists.forEach(tabList => {
        // Find tabs
        const tabs = tabList.querySelectorAll('[role="tab"]');
        
        // Add keyboard event listeners
        tabList.addEventListener('keydown', function(event) {
            // Get current tab
            const currentTab = document.activeElement;
            
            // Skip if current element is not a tab
            if (!currentTab.matches('[role="tab"]')) {
                return;
            }
            
            // Convert tabs to array for easier navigation
            const tabsArray = Array.from(tabs);
            const currentIndex = tabsArray.indexOf(currentTab);
            
            // Handle arrow keys
            if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                event.preventDefault();
                
                // Focus next tab
                const nextIndex = (currentIndex + 1) % tabsArray.length;
                tabsArray[nextIndex].focus();
                
                // Activate tab
                activateTab(tabsArray[nextIndex]);
            } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                event.preventDefault();
                
                // Focus previous tab
                const prevIndex = (currentIndex - 1 + tabsArray.length) % tabsArray.length;
                tabsArray[prevIndex].focus();
                
                // Activate tab
                activateTab(tabsArray[prevIndex]);
            } else if (event.key === 'Home') {
                event.preventDefault();
                
                // Focus first tab
                tabsArray[0].focus();
                
                // Activate tab
                activateTab(tabsArray[0]);
            } else if (event.key === 'End') {
                event.preventDefault();
                
                // Focus last tab
                tabsArray[tabsArray.length - 1].focus();
                
                // Activate tab
                activateTab(tabsArray[tabsArray.length - 1]);
            }
        });
    });
    
    /**
     * Activate a tab
     * @param {HTMLElement} tab - Tab to activate
     */
    function activateTab(tab) {
        // Get tab panel
        const tabPanel = document.getElementById(tab.getAttribute('aria-controls'));
        
        if (!tabPanel) {
            return;
        }
        
        // Get all tabs in the same tablist
        const tabList = tab.closest('[role="tablist"]');
        const tabs = tabList.querySelectorAll('[role="tab"]');
        
        // Get all tab panels
        const tabPanels = [];
        tabs.forEach(t => {
            const panel = document.getElementById(t.getAttribute('aria-controls'));
            if (panel) {
                tabPanels.push(panel);
            }
        });
        
        // Deactivate all tabs and hide all tab panels
        tabs.forEach(t => {
            t.setAttribute('aria-selected', 'false');
            t.setAttribute('tabindex', '-1');
        });
        
        tabPanels.forEach(panel => {
            panel.setAttribute('hidden', '');
        });
        
        // Activate selected tab and show tab panel
        tab.setAttribute('aria-selected', 'true');
        tab.setAttribute('tabindex', '0');
        tabPanel.removeAttribute('hidden');
    }
}

/**
 * Add keyboard support for mobile menu toggle
 */
function addKeyboardSupportForMobileMenu() {
    // Find mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle, #mobile-menu-toggle, .menu-toggle');
    
    if (mobileMenuToggle) {
        // Add keyboard event listeners
        mobileMenuToggle.addEventListener('keydown', function(event) {
            // Handle Enter and Space keys
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                mobileMenuToggle.click();
            }
        });
        
        // Add click event listener
        mobileMenuToggle.addEventListener('click', function() {
            // Toggle aria-expanded
            const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
            mobileMenuToggle.setAttribute('aria-expanded', (!isExpanded).toString());
            
            // Get mobile menu
            const mobileMenuId = mobileMenuToggle.getAttribute('aria-controls');
            const mobileMenu = mobileMenuId ? document.getElementById(mobileMenuId) : document.querySelector('.main-nav, .mobile-nav, .mobile-menu');
            
            if (mobileMenu) {
                // Toggle mobile menu
                mobileMenu.classList.toggle('active');
                mobileMenu.classList.toggle('show');
                mobileMenu.classList.toggle('open');
                
                // Focus first item in mobile menu when opened
                if (!isExpanded) {
                    const firstItem = mobileMenu.querySelector('a, button, [tabindex="0"]');
                    if (firstItem) {
                        firstItem.focus();
                    }
                }
            }
        });
    }
}
