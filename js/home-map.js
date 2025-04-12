/**
 * Home Map Module for Rregullo Tiranen
 * Handles the map display on the main page
 */

const HomeMap = (function() {
    // Map instance
    let map = null;
    
    // Map configuration
    const config = {
        center: [41.3275, 19.8187], // Tirana center coordinates
        zoom: 12,
        minZoom: 10,
        maxZoom: 18
    };
    
    // Category colors for markers
    const categoryColors = {
        'infrastructure': '#e74c3c',
        'environment': '#2ecc71',
        'public-services': '#3498db',
        'community': '#f39c12',
        'default': '#95a5a6'
    };
    
    // Category names for display
    const categoryNames = {
        'infrastructure': 'Infrastrukturë',
        'environment': 'Mjedis',
        'public-services': 'Shërbime Publike',
        'community': 'Komunitet',
        'default': 'Tjetër'
    };
    
    // Status names for display
    const statusNames = {
        'pending': 'Në pritje',
        'in-progress': 'Në proces',
        'resolved': 'I zgjidhur',
        'default': 'I panjohur'
    };
    
    /**
     * Initialize the map
     */
    function initialize() {
        console.log('Initializing home map...');
        
        // Get map container
        const mapContainer = document.getElementById('map-container');
        if (!mapContainer) {
            console.error('Map container not found');
            return false;
        }
        
        try {
            // Create map instance
            map = L.map('map-container', {
                center: config.center,
                zoom: config.zoom,
                minZoom: config.minZoom,
                maxZoom: config.maxZoom,
                zoomControl: true,
                attributionControl: true
            });
            
            // Store map in window object for theme manager
            window.homeMap = map;
            
            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: config.maxZoom
            }).addTo(map);
            
            // Add legend
            addLegend(mapContainer);
            
            // Load reports
            loadReports();
            
            // Fix map rendering issues
            setTimeout(() => {
                if (map) {
                    map.invalidateSize();
                    console.log('Map size invalidated');
                }
            }, 500);
            
            console.log('Home map initialized successfully');
            return true;
        } catch (error) {
            console.error('Error initializing map:', error);
            return false;
        }
    }
    
    /**
     * Add legend to the map
     * @param {HTMLElement} mapContainer - The map container element
     */
    function addLegend(mapContainer) {
        // Create legend container
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
        
        // Insert legend before map container
        mapContainer.parentNode.insertBefore(legendContainer, mapContainer);
    }
    
    /**
     * Load reports from DataStore
     */
    function loadReports() {
        if (!map) {
            console.error('Map not initialized');
            return;
        }
        
        // Get reports from DataStore
        if (typeof DataStore !== 'undefined') {
            DataStore.getAllReports()
                .then(reports => {
                    console.log(`Loaded ${reports.length} reports`);
                    addReportsToMap(reports);
                })
                .catch(error => {
                    console.error('Error loading reports:', error);
                });
        } else {
            console.error('DataStore not available');
        }
    }
    
    /**
     * Add reports to the map
     * @param {Array} reports - The reports to add to the map
     */
    function addReportsToMap(reports) {
        if (!map || !reports || !reports.length) {
            return;
        }
        
        // Add markers for each report
        reports.forEach(report => {
            try {
                // Skip reports without coordinates
                if (!report.lat || !report.lng) {
                    return;
                }
                
                // Create marker icon
                const markerIcon = createMarkerIcon(report);
                
                // Create marker
                const marker = L.marker([report.lat, report.lng], { 
                    icon: markerIcon,
                    title: report.title
                }).addTo(map);
                
                // Add popup
                marker.bindPopup(createPopupContent(report));
            } catch (error) {
                console.error('Error adding marker for report:', error, report);
            }
        });
    }
    
    /**
     * Create marker icon for a report
     * @param {Object} report - The report
     * @returns {L.DivIcon} The marker icon
     */
    function createMarkerIcon(report) {
        const category = report.category || 'default';
        const status = report.status || 'default';
        const color = categoryColors[category] || categoryColors.default;
        
        return L.divIcon({
            className: `custom-marker ${category} ${status}`,
            html: `<div style="background-color: ${color};"></div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });
    }
    
    /**
     * Create popup content for a report
     * @param {Object} report - The report
     * @returns {string} The popup HTML content
     */
    function createPopupContent(report) {
        const category = categoryNames[report.category] || categoryNames.default;
        const subcategory = getSubcategoryName(report.subcategory) || 'E papërcaktuar';
        const status = statusNames[report.status] || statusNames.default;
        const date = formatDate(report.timestamp);
        
        return `
            <div class="map-marker-popup">
                <strong>${report.title || 'Pa titull'}</strong>
                <span>Kategoria: ${category}</span>
                <span>Nënkategoria: ${subcategory}</span>
                <span>Statusi: ${status}</span>
                <span>Data: ${date}</span>
                <div class="popup-actions">
                    <a href="html/report-detail.html?id=${report.id}" class="popup-link">Shiko detajet</a>
                </div>
            </div>
        `;
    }
    
    /**
     * Get subcategory name
     * @param {string} subcategory - The subcategory code
     * @returns {string} The subcategory name
     */
    function getSubcategoryName(subcategory) {
        if (!subcategory) return 'E papërcaktuar';
        
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

        return subcategoryMap[subcategory] || subcategory;
    }
    
    /**
     * Format date for display
     * @param {string} dateString - The date string
     * @returns {string} The formatted date
     */
    function formatDate(dateString) {
        if (!dateString) return 'Pa datë';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('sq-AL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateString;
        }
    }
    
    /**
     * Refresh the map
     * This is useful when the map container becomes visible or changes size
     */
    function refresh() {
        if (map) {
            map.invalidateSize();
        }
    }
    
    /**
     * Clean up resources
     */
    function cleanup() {
        if (map) {
            map.remove();
            map = null;
            window.homeMap = null;
        }
    }
    
    // Public API
    return {
        initialize,
        refresh,
        cleanup
    };
})();

// Initialize the map when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the homepage
    if (document.getElementById('map-container')) {
        // Wait a short time to ensure all resources are loaded
        setTimeout(() => {
            HomeMap.initialize();
        }, 300);
    }
});
