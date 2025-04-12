document.addEventListener('DOMContentLoaded', async function() {
    console.log('Rregullo Tiranen application initialized');

    // Initialize performance utilities if available
    if (typeof PerformanceUtils !== 'undefined') {
        PerformanceUtils.initialize();
    }

    // Initialize accessibility module if available
    if (typeof AccessibilityModule !== 'undefined') {
        AccessibilityModule.initialize();
    }

    // Initialize localization module if available
    if (typeof LocalizationModule !== 'undefined') {
        await LocalizationModule.initialize();
    }

    // Check if notifications module is available and initialize it
    if (typeof NotificationsModule !== 'undefined') {
        try {
            // Wait for AuthStore to initialize before initializing notifications
            await AuthStore.initialize();

            // Only initialize notifications if user is logged in
            if (AuthStore.isLoggedIn()) {
                NotificationsModule.initialize();
            }
        } catch (error) {
            console.error('Error initializing notifications:', error);
        }
    }

    // Show loading indicator
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = '<div class="loading-spinner"></div><p>Duke ngarkuar aplikacionin...</p>';
    document.body.appendChild(loadingOverlay);

    try {
        // Initialize backend connection
        console.log('Initializing backend connection...');

        // Wait for both auth and data stores to initialize
        await Promise.all([
            AuthStore.initialize(),
            DataStore.initialize()
        ]);

        console.log('Backend connection initialized');

        // Update navigation based on authentication status
        updateNavigation();

        // Update statistics on the homepage
        updateStatistics();
    } catch (error) {
        console.error('Error initializing application:', error);
    } finally {
        // Remove loading overlay
        document.body.removeChild(loadingOverlay);
    }

    // Update the report button to link to the report page
    const reportButtons = document.querySelectorAll('.btn-primary');
    reportButtons.forEach(button => {
        if (button.textContent.includes('Raporto') && !button.getAttribute('href')) {
            button.setAttribute('href', 'report.html');
        }
    });

    // Initialize mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', function() {
            mobileMenuToggle.classList.toggle('active');
            mainNav.classList.toggle('active');
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!mainNav.contains(event.target) && !mobileMenuToggle.contains(event.target) && mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
            }
        });
    }

    // Function to update navigation based on authentication status
    async function updateNavigation() {
        // Check if AuthStore is available
        if (typeof AuthStore === 'undefined') {
            console.error('AuthStore not available');
            return;
        }

        const navContainer = document.querySelector('.main-nav ul');
        if (!navContainer) return;

        try {
            const isLoggedIn = await AuthStore.isLoggedIn();
            const userRole = isLoggedIn ? await AuthStore.getUserRole() : null;

            // Update navigation based on authentication status
            if (isLoggedIn) {
                // Add profile link if not exists
                if (!document.querySelector('.nav-profile')) {
                    const profileLi = document.createElement('li');
                    profileLi.className = 'nav-profile';
                    profileLi.innerHTML = `<a href="html/profile.html">Profili Im</a>`;
                    navContainer.appendChild(profileLi);
                }

                // Add admin link if user is admin and link doesn't exist
                if (userRole === 'admin' && !document.querySelector('.nav-admin')) {
                    const adminLi = document.createElement('li');
                    adminLi.className = 'nav-admin';
                    adminLi.innerHTML = `<a href="html/admin/dashboard.html">Admin</a>`;
                    navContainer.appendChild(adminLi);
                }

                // Add logout button if not exists
                if (!document.querySelector('.nav-logout')) {
                    const logoutLi = document.createElement('li');
                    logoutLi.className = 'nav-logout';
                    const logoutBtn = document.createElement('button');
                    logoutBtn.className = 'btn-link';
                    logoutBtn.textContent = 'Dilni';
                    logoutBtn.addEventListener('click', async () => {
                        await AuthStore.logout();
                        window.location.href = 'index.html';
                    });
                    logoutLi.appendChild(logoutBtn);
                    navContainer.appendChild(logoutLi);
                }

                // Remove login/register links if they exist
                const loginLi = document.querySelector('.nav-login');
                if (loginLi) navContainer.removeChild(loginLi);

                const registerLi = document.querySelector('.nav-register');
                if (registerLi) navContainer.removeChild(registerLi);
            } else {
                // Add login link if not exists
                if (!document.querySelector('.nav-login')) {
                    const loginLi = document.createElement('li');
                    loginLi.className = 'nav-login';
                    loginLi.innerHTML = `<a href="html/login.html">Hyrje</a>`;
                    navContainer.appendChild(loginLi);
                }

                // Add register link if not exists
                if (!document.querySelector('.nav-register')) {
                    const registerLi = document.createElement('li');
                    registerLi.className = 'nav-register';
                    registerLi.innerHTML = `<a href="html/register.html">Regjistrohu</a>`;
                    navContainer.appendChild(registerLi);
                }

                // Remove profile, admin, and logout links if they exist
                const profileLi = document.querySelector('.nav-profile');
                if (profileLi) navContainer.removeChild(profileLi);

                const adminLi = document.querySelector('.nav-admin');
                if (adminLi) navContainer.removeChild(adminLi);

                const logoutLi = document.querySelector('.nav-logout');
                if (logoutLi) navContainer.removeChild(logoutLi);
            }
        } catch (error) {
            console.error('Error updating navigation:', error);
        }
    }

    // Function to update statistics on the homepage
    function updateStatistics() {
        const totalReportsElement = document.querySelector('.stat-card:nth-child(1) h3');
        const resolvedReportsElement = document.querySelector('.stat-card:nth-child(2) h3');
        const inProgressReportsElement = document.querySelector('.stat-card:nth-child(3) h3');

        if (totalReportsElement && resolvedReportsElement && inProgressReportsElement) {
            DataStore.getAllReports().then(reports => {
                const resolvedReports = reports.filter(report => report.status === 'resolved');
                const inProgressReports = reports.filter(report => report.status === 'in-progress');

                totalReportsElement.textContent = reports.length;
                resolvedReportsElement.textContent = resolvedReports.length;
                inProgressReportsElement.textContent = inProgressReports.length;
            }).catch(error => {
                console.error('Error updating statistics:', error);
            });
        }
    }
});
