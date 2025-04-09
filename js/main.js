document.addEventListener('DOMContentLoaded', function() {
    console.log('Rregullo Tiranen application initialized');

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
});