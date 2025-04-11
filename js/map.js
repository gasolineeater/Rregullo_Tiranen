/**
 * Map page functionality for Rregullo Tiranen
 * Handles the full map view with filtering capabilities
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Map page initialized');

    // Initialize map
    const mapContainer = document.getElementById('full-map');
    if (!mapContainer) return;

    // Initialize the map centered on Tirana
    const tiranaCenterLat = 41.3275;
    const tiranaCenterLng = 19.8187;

    const fullMap = L.map('full-map').setView([tiranaCenterLat, tiranaCenterLng], 13);

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(fullMap);

    // Get filter elements
    const categoryFilter = document.getElementById('category-filter');
    const statusFilter = document.getElementById('status-filter');
    const dateFilter = document.getElementById('date-filter');
    const applyFiltersBtn = document.getElementById('apply-filters');
    const resetFiltersBtn = document.getElementById('reset-filters');

    // Stats elements
    const visibleIssuesElement = document.getElementById('visible-issues');
    const totalIssuesElement = document.getElementById('total-issues');

    // Store all markers for filtering
    let allMarkers = [];

    // Load and display all reports
    async function loadReports() {
        // Clear existing markers
        allMarkers.forEach(marker => marker.remove());
        allMarkers = [];

        // Show loading indicator
        const mapContainer = document.getElementById('full-map');
        if (mapContainer) {
            mapContainer.classList.add('loading');
            const loadingIndicator = document.createElement('div');
            loadingIndicator.className = 'map-loading-indicator';
            loadingIndicator.innerHTML = '<div class="spinner"></div><p>Duke ngarkuar të dhënat...</p>';
            mapContainer.appendChild(loadingIndicator);
        }

        try {
            // Get all reports
            const reports = await DataStore.getAllReports();

            // Update total count
            if (totalIssuesElement) {
                totalIssuesElement.textContent = reports.length;
            }

            // Remove loading indicator
            if (mapContainer) {
                mapContainer.classList.remove('loading');
                const loadingIndicator = mapContainer.querySelector('.map-loading-indicator');
                if (loadingIndicator) {
                    mapContainer.removeChild(loadingIndicator);
                }
            }

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
                const marker = L.marker([report.lat, report.lng], {
                    icon: markerIcon,
                    reportData: report // Store report data with the marker for filtering
                }).addTo(fullMap);

                // Add popup with report details
                marker.bindPopup(`
                    <div class="map-marker-popup">
                        <strong>${report.title}</strong>
                        <span>Kategoria: ${getCategoryName(report.category)}</span>
                        <span>Nënkategoria: ${getSubcategoryName(report.subcategory)}</span>
                        <span>Statusi: ${getStatusName(report.status)}</span>
                        <span>Data: ${formatDate(report.timestamp)}</span>
                        <p>${report.description.substring(0, 100)}${report.description.length > 100 ? '...' : ''}</p>
                        <span>Adresa: ${report.address}</span>
                        <div class="popup-actions">
                            <a href="report-detail.html?id=${report.id}" class="popup-link">Shiko detajet e plota</a>
                        </div>
                    </div>
                `);

                // Store marker for filtering
                allMarkers.push(marker);
            });

            // Update visible count
            updateVisibleCount();
        } catch (error) {
            console.error('Error loading reports:', error);

            // Remove loading indicator and show error message
            if (mapContainer) {
                mapContainer.classList.remove('loading');
                const loadingIndicator = mapContainer.querySelector('.map-loading-indicator');
                if (loadingIndicator) {
                    mapContainer.removeChild(loadingIndicator);
                }

                const errorMessage = document.createElement('div');
                errorMessage.className = 'map-error-message';
                errorMessage.innerHTML = '<p>Ndodhi një gabim gjatë ngarkimit të të dhënave. Ju lutemi provoni përsëri.</p>';
                mapContainer.appendChild(errorMessage);

                // Remove error message after 5 seconds
                setTimeout(() => {
                    if (errorMessage.parentNode === mapContainer) {
                        mapContainer.removeChild(errorMessage);
                    }
                }, 5000);
            }
        }
    }

    // Apply filters to markers
    function applyFilters() {
        const categoryValue = categoryFilter.value;
        const statusValue = statusFilter.value;
        const dateValue = dateFilter.value;

        // Show loading indicator
        const mapContainer = document.getElementById('full-map');
        if (mapContainer) {
            mapContainer.classList.add('filtering');
        }

        // Clear all markers from map
        allMarkers.forEach(marker => marker.remove());

        // Helper function to check if a report matches the filters
        function matchesFilters(report) {
            // Category filter
            if (categoryValue !== 'all' && report.category !== categoryValue) {
                return false;
            }

            // Status filter
            if (statusValue !== 'all' && report.status !== statusValue) {
                return false;
            }

            // Date filter
            if (dateValue !== 'all') {
                const reportDate = new Date(report.timestamp);
                const now = new Date();

                if (dateValue === 'today') {
                    // Check if report is from today
                    if (reportDate.toDateString() !== now.toDateString()) {
                        return false;
                    }
                } else if (dateValue === 'week') {
                    // Check if report is from the last 7 days
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    if (reportDate < weekAgo) {
                        return false;
                    }
                } else if (dateValue === 'month') {
                    // Check if report is from the last 30 days
                    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    if (reportDate < monthAgo) {
                        return false;
                    }
                }
            }

            return true;
        }

        // Add back markers that match criteria
        allMarkers.forEach(marker => {
            const report = marker.options.reportData;
            if (matchesFilters(report)) {
                marker.addTo(fullMap);
            }
        });

        // Remove filtering indicator
        if (mapContainer) {
            mapContainer.classList.remove('filtering');
        }

        // Update visible count
        updateVisibleCount();
    }

    // Update the visible issues count
    function updateVisibleCount() {
        if (visibleIssuesElement) {
            const visibleCount = allMarkers.filter(marker => fullMap.hasLayer(marker)).length;
            visibleIssuesElement.textContent = visibleCount;
        }
    }

    // Reset all filters
    function resetFilters() {
        categoryFilter.value = 'all';
        statusFilter.value = 'all';
        dateFilter.value = 'all';

        // Add all markers back to the map
        allMarkers.forEach(marker => marker.addTo(fullMap));

        // Update visible count
        updateVisibleCount();
    }

    // Event listeners for filter controls
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyFilters);
    }

    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', resetFilters);
    }

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

    function getStatusName(status) {
        switch(status) {
            case 'pending': return 'Në pritje';
            case 'in-progress': return 'Në proces';
            case 'resolved': return 'I zgjidhur';
            default: return 'I panjohur';
        }
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

    // Initialize the map
    loadReports();

    // Refresh map when it becomes visible (fixes rendering issues)
    setTimeout(() => {
        fullMap.invalidateSize();
    }, 100);
});
