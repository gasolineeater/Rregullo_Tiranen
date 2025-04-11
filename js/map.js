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

    // Initialize marker cluster group
    const markers = L.markerClusterGroup({
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: true,
        zoomToBoundsOnClick: true,
        iconCreateFunction: function(cluster) {
            const count = cluster.getChildCount();
            let size = 'small';

            if (count > 50) {
                size = 'large';
            } else if (count > 20) {
                size = 'medium';
            }

            return L.divIcon({
                html: `<div><span>${count}</span></div>`,
                className: `marker-cluster marker-cluster-${size}`,
                iconSize: L.point(40, 40)
            });
        }
    });

    // Initialize heat map layer
    let heatLayer = null;
    let heatData = [];

    // Initialize search control
    const searchControl = L.control.search({
        position: 'topleft',
        initial: false,
        zoom: 16,
        marker: false
    });

    // Initialize locate control
    const locateControl = L.control.locate({
        position: 'topleft',
        strings: {
            title: 'Trego vendndodhjen time'
        },
        locateOptions: {
            enableHighAccuracy: true,
            maxZoom: 16
        }
    }).addTo(fullMap);

    // Get filter elements
    const categoryFilter = document.getElementById('category-filter');
    const statusFilter = document.getElementById('status-filter');
    const dateFilter = document.getElementById('date-filter');
    const applyFiltersBtn = document.getElementById('apply-filters');
    const resetFiltersBtn = document.getElementById('reset-filters');

    // Get view toggle buttons
    const markerViewBtn = document.getElementById('marker-view');
    const clusterViewBtn = document.getElementById('cluster-view');
    const heatViewBtn = document.getElementById('heat-view');

    // Get address search elements
    const addressSearchInput = document.getElementById('address-search');
    const addressSearchResults = document.getElementById('address-search-results');

    // Stats elements
    const visibleIssuesElement = document.getElementById('visible-issues');
    const totalIssuesElement = document.getElementById('total-issues');

    // Store all markers for filtering
    let allMarkers = [];
    let currentView = 'marker'; // 'marker', 'cluster', or 'heat'

    // Load and display all reports
    async function loadReports() {
        // Clear existing markers
        allMarkers.forEach(marker => marker.remove());
        allMarkers = [];
        markers.clearLayers();

        if (heatLayer) {
            fullMap.removeLayer(heatLayer);
            heatLayer = null;
        }

        heatData = [];

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

                // Create marker
                const marker = L.marker([report.lat, report.lng], {
                    icon: markerIcon,
                    reportData: report // Store report data with the marker for filtering
                });

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

                // Add to marker cluster group
                markers.addLayer(marker);

                // Add to heat data
                // Adjust intensity based on status and severity
                let intensity = 0.5; // Default intensity

                // Adjust based on status
                if (report.status === 'pending') {
                    intensity = 0.8;
                } else if (report.status === 'in-progress') {
                    intensity = 0.6;
                } else if (report.status === 'resolved') {
                    intensity = 0.3;
                }

                // Adjust based on severity if available
                if (report.severity) {
                    if (report.severity === 'high') {
                        intensity *= 1.5;
                    } else if (report.severity === 'low') {
                        intensity *= 0.7;
                    }
                }

                heatData.push([report.lat, report.lng, intensity]);

                // Add to search control
                searchControl.options.layer = L.layerGroup(allMarkers);
                searchControl.options.propertyName = 'reportData.title';
            });

            // Initialize heat layer
            heatLayer = L.heatLayer(heatData, {
                radius: 25,
                blur: 15,
                maxZoom: 17,
                gradient: {
                    0.4: '#2ecc71',
                    0.6: '#f39c12',
                    0.8: '#e74c3c'
                }
            });

            // Set initial view
            setMapView(currentView);

            // Update visible count
            updateVisibleCount();

            // Add search control after data is loaded
            fullMap.addControl(searchControl);

            // Initialize address search
            initAddressSearch();
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

    // Set map view (marker, cluster, or heat)
    function setMapView(view) {
        // Update current view
        currentView = view;

        // Remove all layers
        fullMap.removeLayer(markers);
        if (heatLayer) {
            fullMap.removeLayer(heatLayer);
        }
        allMarkers.forEach(marker => fullMap.removeLayer(marker));

        // Add appropriate layer based on view
        if (view === 'marker') {
            // Add individual markers
            allMarkers.forEach(marker => {
                const report = marker.options.reportData;
                if (matchesFilters(report)) {
                    marker.addTo(fullMap);
                }
            });

            // Update button states
            markerViewBtn.classList.add('active');
            clusterViewBtn.classList.remove('active');
            heatViewBtn.classList.remove('active');
        } else if (view === 'cluster') {
            // Add marker cluster group
            fullMap.addLayer(markers);

            // Update button states
            markerViewBtn.classList.remove('active');
            clusterViewBtn.classList.add('active');
            heatViewBtn.classList.remove('active');
        } else if (view === 'heat') {
            // Add heat layer
            if (heatLayer) {
                fullMap.addLayer(heatLayer);
            }

            // Update button states
            markerViewBtn.classList.remove('active');
            clusterViewBtn.classList.remove('active');
            heatViewBtn.classList.add('active');
        }

        // Update visible count
        updateVisibleCount();
    }

    // Initialize address search
    function initAddressSearch() {
        if (!addressSearchInput || !addressSearchResults) return;

        // Add event listener for input
        addressSearchInput.addEventListener('input', debounce(async function() {
            const query = addressSearchInput.value.trim();

            // Clear results if query is empty
            if (!query) {
                addressSearchResults.innerHTML = '';
                addressSearchResults.classList.remove('active');
                return;
            }

            try {
                // Show loading state
                addressSearchResults.innerHTML = '<div class="address-search-result">Duke kërkuar...</div>';
                addressSearchResults.classList.add('active');

                // Use Nominatim API to search for addresses
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=al&limit=5`);
                const data = await response.json();

                // Clear results
                addressSearchResults.innerHTML = '';

                // Add results
                if (data.length === 0) {
                    addressSearchResults.innerHTML = '<div class="address-search-result">Nuk u gjet asnjë rezultat</div>';
                } else {
                    data.forEach(result => {
                        const resultElement = document.createElement('div');
                        resultElement.className = 'address-search-result';
                        resultElement.textContent = result.display_name;

                        // Add click event
                        resultElement.addEventListener('click', function() {
                            // Set map view to result location
                            fullMap.setView([result.lat, result.lon], 16);

                            // Clear search input and results
                            addressSearchInput.value = result.display_name;
                            addressSearchResults.innerHTML = '';
                            addressSearchResults.classList.remove('active');
                        });

                        addressSearchResults.appendChild(resultElement);
                    });
                }
            } catch (error) {
                console.error('Error searching for address:', error);
                addressSearchResults.innerHTML = '<div class="address-search-result">Ndodhi një gabim gjatë kërkimit</div>';
            }
        }, 500));

        // Close results when clicking outside
        document.addEventListener('click', function(event) {
            if (!addressSearchInput.contains(event.target) && !addressSearchResults.contains(event.target)) {
                addressSearchResults.classList.remove('active');
            }
        });

        // Show results when focusing on input
        addressSearchInput.addEventListener('focus', function() {
            if (addressSearchResults.children.length > 0) {
                addressSearchResults.classList.add('active');
            }
        });
    }

    // Debounce function to limit API calls
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
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
        markers.clearLayers();

        // Add back markers that match criteria
        allMarkers.forEach(marker => {
            const report = marker.options.reportData;
            if (matchesFilters(report)) {
                if (currentView === 'marker') {
                    marker.addTo(fullMap);
                } else if (currentView === 'cluster') {
                    markers.addLayer(marker);
                }
            }
        });

        // Update heat map if in heat view
        if (currentView === 'heat' && heatLayer) {
            // Filter heat data
            const filteredHeatData = [];
            allMarkers.forEach((marker, index) => {
                const report = marker.options.reportData;
                if (matchesFilters(report) && heatData[index]) {
                    filteredHeatData.push(heatData[index]);
                }
            });

            // Remove old heat layer
            fullMap.removeLayer(heatLayer);

            // Create new heat layer with filtered data
            heatLayer = L.heatLayer(filteredHeatData, {
                radius: 25,
                blur: 15,
                maxZoom: 17,
                gradient: {
                    0.4: '#2ecc71',
                    0.6: '#f39c12',
                    0.8: '#e74c3c'
                }
            });

            // Add new heat layer if in heat view
            if (currentView === 'heat') {
                fullMap.addLayer(heatLayer);
            }
        }

        // Remove filtering indicator
        if (mapContainer) {
            mapContainer.classList.remove('filtering');
        }

        // Update visible count
        updateVisibleCount();
    }

    // Helper function to check if a report matches the filters
    function matchesFilters(report) {
        // Category filter
        if (categoryFilter.value !== 'all' && report.category !== categoryFilter.value) {
            return false;
        }

        // Status filter
        if (statusFilter.value !== 'all' && report.status !== statusFilter.value) {
            return false;
        }

        // Date filter
        if (dateFilter.value !== 'all') {
            const reportDate = new Date(report.timestamp);
            const now = new Date();

            if (dateFilter.value === 'today') {
                // Check if report is from today
                if (reportDate.toDateString() !== now.toDateString()) {
                    return false;
                }
            } else if (dateFilter.value === 'week') {
                // Check if report is from the last 7 days
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                if (reportDate < weekAgo) {
                    return false;
                }
            } else if (dateFilter.value === 'month') {
                // Check if report is from the last 30 days
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                if (reportDate < monthAgo) {
                    return false;
                }
            }
        }

        return true;
    }

    // Update the visible issues count
    function updateVisibleCount() {
        if (visibleIssuesElement) {
            let visibleCount = 0;

            if (currentView === 'marker') {
                visibleCount = allMarkers.filter(marker => fullMap.hasLayer(marker)).length;
            } else if (currentView === 'cluster') {
                visibleCount = markers.getLayers().length;
            } else if (currentView === 'heat') {
                // For heat map, count all markers that match filters
                visibleCount = allMarkers.filter(marker => matchesFilters(marker.options.reportData)).length;
            }

            visibleIssuesElement.textContent = visibleCount;
        }
    }

    // Reset all filters
    function resetFilters() {
        categoryFilter.value = 'all';
        statusFilter.value = 'all';
        dateFilter.value = 'all';

        // Apply filters (which will now show all markers)
        applyFilters();
    }

    // Event listeners for filter controls
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyFilters);
    }

    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', resetFilters);
    }

    // Event listeners for view toggle buttons
    if (markerViewBtn) {
        markerViewBtn.addEventListener('click', function() {
            setMapView('marker');
        });
    }

    if (clusterViewBtn) {
        clusterViewBtn.addEventListener('click', function() {
            setMapView('cluster');
        });
    }

    if (heatViewBtn) {
        heatViewBtn.addEventListener('click', function() {
            setMapView('heat');
        });
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
