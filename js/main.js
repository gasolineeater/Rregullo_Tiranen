document.addEventListener('DOMContentLoaded', async function() {
    console.log('Rregullo Tiranen application initialized');

    // Wait a short time to ensure all resources are loaded
    setTimeout(() => {
        // Initialize home map if we're on the homepage
        if (document.getElementById('map-container')) {
            console.log('Found map container, initializing map');
            initializeHomeMap();
        }
    }, 100);

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

    // Initialize the map on the homepage
    function initializeHomeMap() {
        console.log('Initializing home map function called');
        const mapContainer = document.getElementById('map-container');
        if (!mapContainer) {
            console.error('Map container not found');
            return;
        }

        console.log('Map container found, initializing map');

        try {
            // Initialize the map centered on Tirana
            const tiranaCenterLat = 41.3275;
            const tiranaCenterLng = 19.8187;

            // Store map in window object so we can access it later for theme changes
            window.homeMap = L.map('map-container', {
                zoomControl: true,
                attributionControl: true
            }).setView([tiranaCenterLat, tiranaCenterLng], 12);

            console.log('Map object created:', window.homeMap);

            // Add OpenStreetMap tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19
            }).addTo(window.homeMap);

            console.log('Tile layer added to map');

            // Get reports from DataStore
            DataStore.getAllReports().then(reports => {
                console.log('Reports loaded:', reports.length);

                // Add markers for each report
                reports.forEach(report => {
                    // Create custom icon based on category
                    const markerColor = getMarkerColor(report.category);
                    const markerIcon = L.divIcon({
                        className: `custom-marker ${report.category} ${report.status}`,
                        html: `<div style="background-color: ${markerColor};"></div>`,
                        iconSize: [24, 24],
                        iconAnchor: [12, 12]
                    });

                    // Create marker and add to map
                    const marker = L.marker([report.lat, report.lng], { icon: markerIcon }).addTo(window.homeMap);

            // Add popup with report details
            marker.bindPopup(`
                <div class="map-marker-popup">
                    <strong>${report.title}</strong>
                    <span>Kategoria: ${getCategoryName(report.category)}</span>
                    <span>Nënkategoria: ${getSubcategoryName(report.subcategory)}</span>
                    <span>Statusi: ${getStatusName(report.status)}</span>
                    <span>Data: ${formatDate(report.timestamp)}</span>
                    <div class="popup-actions">
                        <a href="html/report-detail.html?id=${report.id}" class="popup-link">Shiko detajet</a>
                    </div>
                </div>
            `);
        });

        // Add legend to the map
        const legendContainer = document.createElement('div');
        legendContainer.className = 'map-legend';
        legendContainer.innerHTML = `
            <div class="legend-item">
                <div class="legend-color infrastructure"></div>
                <span>Infrastrukturë</span>
            </div>
            <div class="legend-item">
                <div class="legend-color environment"></div>
                <span>Mjedis</span>
            </div>
            <div class="legend-item">
                <div class="legend-color public-services"></div>
                <span>Shërbime Publike</span>
            </div>
            <div class="legend-item">
                <div class="legend-color community"></div>
                <span>Komunitet</span>
            </div>
        `;

        // Insert legend before the map container
        mapContainer.parentNode.insertBefore(legendContainer, mapContainer);

        // Helper functions for marker display
        function getMarkerColor(category) {
            switch(category) {
                case 'infrastructure': return '#e74c3c';
                case 'environment': return '#2ecc71';
                case 'public-services': return '#3498db';
                case 'community': return '#f39c12';
                default: return '#95a5a6';
            }
        }

        function getCategoryName(category) {
            switch(category) {
                case 'infrastructure': return 'Infrastrukturë';
                case 'environment': return 'Mjedis';
                case 'public-services': return 'Shërbime Publike';
                case 'community': return 'Komunitet';
                default: return 'Tjetër';
            }
        }

        function getStatusName(status) {
            switch(status) {
                case 'pending': return 'Në pritje';
                case 'in-progress': return 'Në proces';
                case 'resolved': return 'I zgjidhur';
                default: return 'I panjohur';
            }
        }

        function getSubcategoryName(subcategory) {
            const subcategoryMap = {
                // Infrastructure
                'road-damage': 'Dëmtime të rrugëve',
                'sidewalk-damage': 'Dëmtime të trotuareve',
                'street-lighting': 'Ndriçimi rrugor',
                'public-facilities': 'Objekte publike',
                'traffic-signals': 'Sinjalistika',

                // Environment
                'littering': 'Mbeturina',
                'green-space': 'Hapësira të gjelbërta',
                'pollution': 'Ndotje',
                'tree-planting': 'Mbjellje pemësh',

                // Public Services
                'waste-collection': 'Grumbullimi i mbeturinave',
                'public-transport': 'Transporti publik',
                'water-utilities': 'Ujë dhe shërbime',
                'public-building': 'Ndërtesa publike',

                // Community
                'beautification': 'Zbukurim i lagjes',
                'public-safety': 'Siguria publike',
                'accessibility': 'Aksesueshmëria',
                'cultural-preservation': 'Trashëgimia kulturore'
            };

            return subcategoryMap[subcategory] || subcategory || 'E papërcaktuar';
        }

        function formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('sq-AL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }

                    // Refresh map when it becomes visible (fixes rendering issues)
                    setTimeout(() => {
                        if (window.homeMap) {
                            window.homeMap.invalidateSize();
                            console.log('Map size invalidated');
                        }
                    }, 300);
                });

                // Add legend to the map if it doesn't exist
                if (!document.querySelector('.map-legend')) {
                    addMapLegend(mapContainer);
                }
            }).catch(error => {
                console.error('Error loading reports for map:', error);
            });
        } catch (error) {
            console.error('Error initializing map:', error);
        }
    }

    // Function to add map legend
    function addMapLegend(mapContainer) {
        const legendContainer = document.createElement('div');
        legendContainer.className = 'map-legend';
        legendContainer.innerHTML = `
            <div class="legend-item">
                <div class="legend-color infrastructure"></div>
                <span>Infrastrukturë</span>
            </div>
            <div class="legend-item">
                <div class="legend-color environment"></div>
                <span>Mjedis</span>
            </div>
            <div class="legend-item">
                <div class="legend-color public-services"></div>
                <span>Shërbime Publike</span>
            </div>
            <div class="legend-item">
                <div class="legend-color community"></div>
                <span>Komunitet</span>
            </div>
        `;

        // Insert legend before the map container
        mapContainer.parentNode.insertBefore(legendContainer, mapContainer);
    }

    // Update the report button to link to the report page
    const reportButtons = document.querySelectorAll('.btn-primary');
    reportButtons.forEach(button => {
        if (button.textContent.includes('Raporto') && !button.getAttribute('href')) {
            button.setAttribute('href', 'report.html');
        }
    });

    // Function to update statistics on the homepage
    function updateStatistics() {
        const totalReportsElement = document.querySelector('.stat-card:nth-child(1) h3');
        const resolvedReportsElement = document.querySelector('.stat-card:nth-child(2) h3');
        const inProgressReportsElement = document.querySelector('.stat-card:nth-child(3) h3');

        if (totalReportsElement && resolvedReportsElement && inProgressReportsElement) {
            const reports = DataStore.getAllReports();
            const resolvedReports = reports.filter(report => report.status === 'resolved');
            const inProgressReports = reports.filter(report => report.status === 'in-progress');

            totalReportsElement.textContent = reports.length;
            resolvedReportsElement.textContent = resolvedReports.length;
            inProgressReportsElement.textContent = inProgressReports.length;
        }
    }

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

    // Theme toggle is now handled by theme-manager.js

    // Function to update navigation based on authentication status
    async function updateNavigation() {
        // Check if AuthStore is available
        if (typeof AuthStore !== 'undefined') {
            try {
                // Check if user is logged in
                const isLoggedIn = await AuthStore.isLoggedIn();
                if (isLoggedIn) {
                    const currentUser = AuthStore.getCurrentUser();

                    // Get navigation elements
                    const mainNav = document.querySelector('.main-nav');
                    const navList = document.querySelector('.main-nav ul');

                    if (mainNav && navList) {
                        // Check if user menu already exists
                        if (!document.querySelector('.user-menu')) {
                        // Create user menu
                        const userMenu = document.createElement('div');
                        userMenu.className = 'user-menu';

                        // Create user menu toggle button
                        const userMenuToggle = document.createElement('button');
                        userMenuToggle.className = 'user-menu-toggle';
                        userMenuToggle.id = 'user-menu-toggle';

                        // Create user avatar
                        const userAvatar = document.createElement('div');
                        userAvatar.className = 'user-avatar';

                        const userInitial = document.createElement('span');
                        userInitial.className = 'user-initial';
                        userInitial.id = 'user-initial';
                        userInitial.textContent = currentUser.fullname.charAt(0).toUpperCase();

                        userAvatar.appendChild(userInitial);

                        // Create user name
                        const userName = document.createElement('span');
                        userName.className = 'user-name';
                        userName.id = 'user-name';
                        userName.textContent = currentUser.fullname;

                        // Create dropdown icon
                        const dropdownIcon = document.createElement('span');
                        dropdownIcon.className = 'dropdown-icon';
                        dropdownIcon.textContent = '▼';

                        // Assemble user menu toggle
                        userMenuToggle.appendChild(userAvatar);
                        userMenuToggle.appendChild(userName);
                        userMenuToggle.appendChild(dropdownIcon);

                        // Create user dropdown
                        const userDropdown = document.createElement('div');
                        userDropdown.className = 'user-dropdown';
                        userDropdown.id = 'user-dropdown';

                        // Create dropdown list
                        const dropdownList = document.createElement('ul');

                        // Create dropdown items
                        const profileItem = document.createElement('li');
                        const profileLink = document.createElement('a');
                        profileLink.href = 'html/profile.html';
                        profileLink.textContent = 'Profili Im';
                        profileItem.appendChild(profileLink);

                        const notificationsItem = document.createElement('li');
                        const notificationsLink = document.createElement('a');
                        notificationsLink.href = 'html/profile.html#notifications';
                        notificationsLink.textContent = 'Njoftimet';
                        notificationsItem.appendChild(notificationsLink);

                        const logoutItem = document.createElement('li');
                        const logoutLink = document.createElement('a');
                        logoutLink.href = '#';
                        logoutLink.id = 'logout-btn';
                        logoutLink.textContent = 'Dilni';
                        logoutItem.appendChild(logoutLink);

                        // Assemble dropdown list
                        dropdownList.appendChild(profileItem);
                        dropdownList.appendChild(notificationsItem);
                        dropdownList.appendChild(logoutItem);

                        userDropdown.appendChild(dropdownList);

                        // Assemble user menu
                        userMenu.appendChild(userMenuToggle);
                        userMenu.appendChild(userDropdown);

                        // Add user menu to navigation
                        mainNav.insertBefore(userMenu, document.querySelector('.theme-toggle'));

                        // Add event listeners
                        userMenuToggle.addEventListener('click', function() {
                            userDropdown.classList.toggle('active');
                        });

                        // Close dropdown when clicking outside
                        document.addEventListener('click', function(e) {
                            if (!userMenuToggle.contains(e.target) && !userDropdown.contains(e.target)) {
                                userDropdown.classList.remove('active');
                            }
                        });

                        // Handle logout
                        logoutLink.addEventListener('click', async function(e) {
                            e.preventDefault();

                            if (typeof AuthStore !== 'undefined' && AuthStore.logoutUser) {
                                try {
                                    const result = await AuthStore.logoutUser();
                                    if (result.success) {
                                        window.location.reload();
                                    }
                                } catch (error) {
                                    console.error('Error logging out:', error);
                                    window.location.reload();
                                }
                            }
                        });

                        // Update login/register links
                        const loginLink = navList.querySelector('a[href="html/login.html"]');
                        if (loginLink) {
                            const loginItem = loginLink.parentElement;
                            navList.removeChild(loginItem);
                        }

                        const registerLink = navList.querySelector('a[href="html/register.html"]');
                        if (registerLink) {
                            const registerItem = registerLink.parentElement;
                            navList.removeChild(registerItem);
                        }
                    }
                }
            } catch (error) {
                console.error('Error checking authentication status:', error);
            }

            // If we get here and the user is not logged in, make sure login/register links are present
            const isLoggedIn = await AuthStore.isLoggedIn();
            if (!isLoggedIn) {
                const navList = document.querySelector('.main-nav ul');

                if (navList) {
                    // Check if login link already exists
                    const loginLink = navList.querySelector('a[href="html/login.html"]');
                    if (!loginLink) {
                        // Create login link
                        const loginItem = document.createElement('li');
                        const loginLink = document.createElement('a');
                        loginLink.href = 'html/login.html';
                        loginLink.textContent = 'Hyrje';
                        loginItem.appendChild(loginLink);

                        // Add login link to navigation
                        navList.appendChild(loginItem);
                    }

                    // Check if register link already exists
                    const registerLink = navList.querySelector('a[href="html/register.html"]');
                    if (!registerLink) {
                        // Create register link
                        const registerItem = document.createElement('li');
                        const registerLink = document.createElement('a');
                        registerLink.href = 'html/register.html';
                        registerLink.textContent = 'Regjistrim';
                        registerItem.appendChild(registerLink);

                        // Add register link to navigation
                        navList.appendChild(registerItem);
                    }

                    // Remove user menu if it exists
                    const userMenu = document.querySelector('.user-menu');
                    if (userMenu) {
                        userMenu.parentElement.removeChild(userMenu);
                    }
                }
            }
        }
    }
});