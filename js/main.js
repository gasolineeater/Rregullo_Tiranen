document.addEventListener('DOMContentLoaded', function() {
    console.log('Rregullo Tiranen application initialized');

    // Update navigation based on authentication status
    updateNavigation();

    // Update statistics on the homepage
    updateStatistics();

    // Initialize the map on the homepage
    const mapContainer = document.getElementById('map-container');
    if (mapContainer) {
        console.log('Initializing map on homepage');

        // Initialize the map centered on Tirana
        const tiranaCenterLat = 41.3275;
        const tiranaCenterLng = 19.8187;

        const homeMap = L.map('map-container').setView([tiranaCenterLat, tiranaCenterLng], 12);

        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(homeMap);

        // Get reports from DataStore
        const reports = DataStore.getAllReports();

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
            const marker = L.marker([report.lat, report.lng], { icon: markerIcon }).addTo(homeMap);

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
            homeMap.invalidateSize();
        }, 100);
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

    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('.icon');
    const themeLabel = themeToggle.querySelector('.theme-label');

    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        updateThemeToggle(true);
    }

    themeToggle.addEventListener('click', function() {
        const isDarkMode = document.body.classList.toggle('dark-mode');

        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');

        updateThemeToggle(isDarkMode);
    });

    function updateThemeToggle(isDarkMode) {
        if (isDarkMode) {
            themeIcon.textContent = '☀️';
            themeLabel.textContent = 'Tema e Ndritshme';
        } else {
            themeIcon.textContent = '🌓';
            themeLabel.textContent = 'Tema e Errët';
        }
    }

    // Function to update navigation based on authentication status
    function updateNavigation() {
        // Check if AuthStore is available and user is logged in
        if (typeof AuthStore !== 'undefined' && AuthStore.isLoggedIn && AuthStore.isLoggedIn()) {
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
                    logoutLink.addEventListener('click', function(e) {
                        e.preventDefault();

                        if (typeof AuthStore !== 'undefined' && AuthStore.logoutUser) {
                            const result = AuthStore.logoutUser();
                            if (result.success) {
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
        } else {
            // User is not logged in, make sure login/register links are present
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
});