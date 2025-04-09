/**
 * Report detail page functionality for Rregullo Tiranen
 * Handles displaying and updating individual reports
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Report detail page initialized');
    
    // Get report ID from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const reportId = urlParams.get('id');
    
    if (!reportId) {
        // No report ID provided, redirect to map page
        alert('Nuk u gjet asnjë raport me këtë ID.');
        window.location.href = 'map.html';
        return;
    }
    
    // Get report data
    const report = DataStore.getReportById(reportId);
    
    if (!report) {
        // Report not found, redirect to map page
        alert('Nuk u gjet asnjë raport me këtë ID.');
        window.location.href = 'map.html';
        return;
    }
    
    // Populate report details
    populateReportDetails(report);
    
    // Initialize map
    initializeMap(report);
    
    // Set up status update functionality
    setupStatusUpdate(report);
});

/**
 * Populate the page with report details
 */
function populateReportDetails(report) {
    // Set page title
    document.title = `${report.title} - Rregullo Tiranen`;
    
    // Basic info
    document.getElementById('report-title').textContent = report.title;
    document.getElementById('report-date').textContent = `Raportuar më: ${formatDate(report.timestamp)}`;
    
    const statusElement = document.getElementById('report-status');
    statusElement.textContent = getStatusName(report.status);
    statusElement.className = `report-status ${report.status}`;
    
    // General information
    document.getElementById('report-category').textContent = getCategoryName(report.category);
    document.getElementById('report-subcategory').textContent = getSubcategoryName(report.subcategory);
    document.getElementById('report-type').textContent = report.type || 'N/A';
    document.getElementById('report-severity').textContent = getSeverityName(report.severity);
    
    // Location information
    document.getElementById('report-address').textContent = report.address || 'N/A';
    document.getElementById('report-neighborhood').textContent = getNeighborhoodName(report.neighborhood);
    document.getElementById('report-coordinates').textContent = `${report.lat.toFixed(6)}, ${report.lng.toFixed(6)}`;
    
    // Description
    document.getElementById('report-description-text').textContent = report.description || 'Nuk ka përshkrim të disponueshëm.';
    
    // Timeline
    updateTimeline(report);
}

/**
 * Initialize the map with the report location
 */
function initializeMap(report) {
    const mapContainer = document.getElementById('report-location-map');
    if (!mapContainer) return;
    
    const reportMap = L.map('report-location-map').setView([report.lat, report.lng], 15);
    
    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(reportMap);
    
    // Add marker for report location
    const markerColor = getMarkerColor(report.category);
    const markerIcon = L.divIcon({
        className: `custom-marker ${report.category} ${report.status}`,
        html: `<div style="background-color: ${markerColor};"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });
    
    const marker = L.marker([report.lat, report.lng], { icon: markerIcon }).addTo(reportMap);
    marker.bindPopup(`<div class="map-marker-popup"><strong>${report.title}</strong></div>`);
    
    // Refresh map when it becomes visible (fixes rendering issues)
    setTimeout(() => {
        reportMap.invalidateSize();
    }, 100);
}

/**
 * Update the status timeline based on report status
 */
function updateTimeline(report) {
    // Reported date
    document.getElementById('reported-date').textContent = formatDate(report.timestamp);
    document.getElementById('status-reported').classList.add('active');
    
    // In progress date
    if (report.status === 'in-progress' || report.status === 'resolved') {
        document.getElementById('status-in-progress').classList.add('active');
        const inProgressDate = report.statusUpdates?.inProgress?.date || report.lastUpdated || '';
        document.getElementById('in-progress-date').textContent = inProgressDate ? formatDate(inProgressDate) : 'Data e papërcaktuar';
    }
    
    // Resolved date
    if (report.status === 'resolved') {
        document.getElementById('status-resolved').classList.add('active');
        const resolvedDate = report.statusUpdates?.resolved?.date || report.lastUpdated || '';
        document.getElementById('resolved-date').textContent = resolvedDate ? formatDate(resolvedDate) : 'Data e papërcaktuar';
    }
}

/**
 * Set up the status update functionality
 */
function setupStatusUpdate(report) {
    const modal = document.getElementById('status-modal');
    const updateBtn = document.getElementById('update-status-btn');
    const closeBtn = document.querySelector('.close-modal');
    const cancelBtn = document.querySelector('.cancel-modal');
    const statusForm = document.getElementById('status-update-form');
    const statusSelect = document.getElementById('new-status');
    
    // Set current status as selected
    if (statusSelect) {
        const options = statusSelect.querySelectorAll('option');
        options.forEach(option => {
            if (option.value === report.status) {
                option.selected = true;
            }
        });
    }
    
    // Open modal
    if (updateBtn) {
        updateBtn.addEventListener('click', function() {
            modal.style.display = 'block';
        });
    }
    
    // Close modal
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Handle form submission
    if (statusForm) {
        statusForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const newStatus = statusSelect.value;
            const comment = document.getElementById('status-comment').value;
            
            if (newStatus && newStatus !== report.status) {
                // Update report status
                const success = DataStore.updateReportStatus(report.id, newStatus, comment);
                
                if (success) {
                    alert('Statusi i raportit u përditësua me sukses!');
                    // Reload page to show updated status
                    window.location.reload();
                } else {
                    alert('Ndodhi një gabim gjatë përditësimit të statusit. Ju lutemi provoni përsëri.');
                }
            } else if (newStatus === report.status) {
                alert('Ju zgjodhët të njëjtin status. Nuk u bë asnjë ndryshim.');
                modal.style.display = 'none';
            }
        });
    }
}

/**
 * Helper functions
 */
function getCategoryName(category) {
    switch(category) {
        case 'infrastructure': return 'Infrastrukturë';
        case 'environment': return 'Mjedis';
        case 'public-services': return 'Shërbime Publike';
        case 'community': return 'Komunitet';
        default: return category || 'E papërcaktuar';
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

function getSeverityName(severity) {
    switch(severity) {
        case 'low': return 'I ulët';
        case 'medium': return 'Mesatar';
        case 'high': return 'I lartë';
        case 'urgent': return 'Urgjent';
        default: return severity || 'I papërcaktuar';
    }
}

function getNeighborhoodName(neighborhood) {
    const neighborhoodMap = {
        'njesia1': 'Njësia Administrative 1',
        'njesia2': 'Njësia Administrative 2',
        'njesia3': 'Njësia Administrative 3',
        'njesia4': 'Njësia Administrative 4',
        'njesia5': 'Njësia Administrative 5',
        'njesia6': 'Njësia Administrative 6',
        'njesia7': 'Njësia Administrative 7',
        'njesia8': 'Njësia Administrative 8',
        'njesia9': 'Njësia Administrative 9',
        'njesia10': 'Njësia Administrative 10',
        'njesia11': 'Njësia Administrative 11'
    };
    
    return neighborhoodMap[neighborhood] || neighborhood || 'E papërcaktuar';
}

function getMarkerColor(category) {
    switch(category) {
        case 'infrastructure': return '#e74c3c';
        case 'environment': return '#2ecc71';
        case 'public-services': return '#3498db';
        case 'community': return '#f39c12';
        default: return '#95a5a6';
    }
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('sq-AL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
