/**
 * Authentication UI for Rregullo Tiranen
 * Handles authentication state in the UI
 */

document.addEventListener('DOMContentLoaded', async function() {
    console.log('Auth UI initialized');

    // Initialize auth store
    try {
        await AuthStore.initialize();
        
        // Update UI based on authentication state
        updateAuthUI();
        
        // Add event listener for logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async function(e) {
                e.preventDefault();
                
                try {
                    const result = await AuthStore.logoutUser();
                    if (result.success) {
                        // Redirect to homepage after logout
                        window.location.href = window.location.pathname.includes('/html/') 
                            ? '../index.html' 
                            : 'index.html';
                    } else {
                        console.error('Logout failed:', result.message);
                    }
                } catch (error) {
                    console.error('Error during logout:', error);
                }
            });
        }
        
        // Initialize user menu toggle
        initUserMenu();
    } catch (error) {
        console.error('Error initializing auth UI:', error);
    }
});

/**
 * Update UI based on authentication state
 */
function updateAuthUI() {
    const isLoggedIn = AuthStore.isLoggedIn();
    const currentUser = AuthStore.getCurrentUser();
    
    const authLinks = document.getElementById('auth-links');
    const userMenuContainer = document.getElementById('user-menu-container');
    
    if (authLinks && userMenuContainer) {
        if (isLoggedIn && currentUser) {
            // User is logged in, show user menu
            authLinks.style.display = 'none';
            userMenuContainer.style.display = 'block';
            
            // Update user menu with user info
            const userInitial = document.getElementById('user-initial');
            const userName = document.getElementById('user-name');
            
            if (userInitial && userName) {
                userInitial.textContent = currentUser.fullname.charAt(0).toUpperCase();
                userName.textContent = currentUser.fullname;
            }
        } else {
            // User is not logged in, show auth links
            authLinks.style.display = 'block';
            userMenuContainer.style.display = 'none';
        }
    }
    
    // Check if we need to protect this page
    const currentPath = window.location.pathname;
    const protectedPaths = [
        '/profile.html',
        '/notifications.html',
        '/report.html'
    ];
    
    // Check if current path ends with any of the protected paths
    const isProtectedPage = protectedPaths.some(path => 
        currentPath.endsWith(path)
    );
    
    if (isProtectedPage && !isLoggedIn) {
        // Redirect to login page with return URL
        const returnUrl = encodeURIComponent(window.location.href);
        window.location.href = currentPath.includes('/html/') 
            ? 'login.html?returnUrl=' + returnUrl 
            : 'html/login.html?returnUrl=' + returnUrl;
    }
}

/**
 * Initialize user menu toggle
 */
function initUserMenu() {
    const userMenuToggle = document.getElementById('user-menu-toggle');
    const userDropdown = document.getElementById('user-dropdown');
    
    if (userMenuToggle && userDropdown) {
        userMenuToggle.addEventListener('click', function() {
            userDropdown.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!userMenuToggle.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('active');
            }
        });
    }
}
