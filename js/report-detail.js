/**
 * Report detail page functionality for Rregullo Tiranen
 * Handles displaying and updating individual reports
 */

document.addEventListener('DOMContentLoaded', async function() {
    console.log('Report detail page initialized');

    // Show loading indicator
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = `<div class="loading-spinner"></div><p>${LocalizationModule.translate('common.loading', 'Duke ngarkuar të dhënat...')}</p>`;
    document.body.appendChild(loadingOverlay);

    try {
        // Initialize data store
        await DataStore.initialize();
        await AuthStore.initialize();

        // Register for language changes to update dynamic content
        if (typeof LocalizationModule !== 'undefined') {
            LocalizationModule.onLanguageChange(function(newLanguage) {
                // Reload the current page to update all dynamic content with new language
                const currentReportId = new URLSearchParams(window.location.search).get('id');
                if (currentReportId) {
                    loadReportDetails(currentReportId);
                }
            });
        }

        // Get report ID from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const reportId = urlParams.get('id');

        if (!reportId) {
            // No report ID provided, redirect to map page
            alert(LocalizationModule.translate('reportDetail.notFound', 'Nuk u gjet asnjë raport me këtë ID.'));
            window.location.href = 'map.html';
            return;
        }

        // Get report data from API
        const report = await DataStore.getReportById(reportId);

        if (!report) {
            // Report not found, redirect to map page
            alert(LocalizationModule.translate('reportDetail.notFound', 'Nuk u gjet asnjë raport me këtë ID.'));
            window.location.href = 'map.html';
            return;
        }

        // Populate report details
        populateReportDetails(report);

        // Initialize map
        initializeMap(report);

        // Display photos if available
        displayPhotos(report);

        // Display comments if available
        displayComments(report);

        // Set up comment form
        setupCommentForm(report);

        // Set up status update functionality
        setupStatusUpdate(report);
    } catch (error) {
        console.error('Error loading report details:', error);
        alert(LocalizationModule.translate('common.loadingError', 'Ndodhi një gabim gjatë ngarkimit të të dhënave. Ju lutemi provoni përsëri.'));
    } finally {
        // Remove loading overlay
        document.body.removeChild(loadingOverlay);
    }
});

/**
 * Populate the page with report details
 */
function populateReportDetails(report) {
    // Set page title
    document.title = `${report.title} - ${LocalizationModule.translate('app.name', 'Rregullo Tiranen')}`;

    // Basic info
    document.getElementById('report-title').textContent = report.title;
    document.getElementById('report-date').textContent = `${LocalizationModule.translate('reportDetail.reportedOn', 'Raportuar më')}: ${formatDate(report.timestamp)}`;

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
    document.getElementById('report-description-text').textContent = report.description || LocalizationModule.translate('reportDetail.noDescription', 'Nuk ka përshkrim të disponueshëm.');

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
 * Display photos if available
 */
async function displayPhotos(report) {
    const photosGrid = document.getElementById('photos-grid');
    const noPhotosMessage = document.getElementById('no-photos-message');
    const photosContainer = document.getElementById('report-photos-container');

    if (!photosGrid) return;

    // Show loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.innerHTML = '<div class="spinner"></div><p>Duke ngarkuar fotot...</p>';
    photosGrid.appendChild(loadingIndicator);

    try {
        // Get photos from API if available
        let photos = [];
        if (report.photos && report.photos.length > 0) {
            photos = report.photos;
        } else {
            // Try to fetch photos from API
            try {
                const result = await ApiService.getReportPhotos(report._id || report.id);
                if (result.success && result.photos && result.photos.length > 0) {
                    photos = result.photos;
                }
            } catch (error) {
                console.error('Error fetching photos from API:', error);
            }
        }

        // Remove loading indicator
        if (loadingIndicator.parentNode === photosGrid) {
            photosGrid.removeChild(loadingIndicator);
        }

        // Check if we have photos to display
        if (photos && photos.length > 0) {
            // Hide no photos message
            if (noPhotosMessage) {
                noPhotosMessage.style.display = 'none';
            }

            // Create photo modal container if it doesn't exist
            let photoModal = document.getElementById('photo-modal');
            if (!photoModal) {
                photoModal = document.createElement('div');
                photoModal.id = 'photo-modal';
                photoModal.className = 'photo-modal';
                photoModal.innerHTML = `
                    <span class="photo-modal-close">&times;</span>
                    <img class="photo-modal-content" id="photo-modal-img">
                    <div class="photo-modal-controls">
                        <button class="photo-nav prev">&lsaquo;</button>
                        <button class="photo-nav next">&rsaquo;</button>
                    </div>
                    <div class="photo-modal-counter">1 / ${photos.length}</div>
                `;
                document.body.appendChild(photoModal);

                // Add event listener to close modal
                const closeBtn = photoModal.querySelector('.photo-modal-close');
                if (closeBtn) {
                    closeBtn.addEventListener('click', function() {
                        photoModal.style.display = 'none';
                    });
                }

                // Close modal when clicking outside the image
                photoModal.addEventListener('click', function(event) {
                    if (event.target === photoModal) {
                        photoModal.style.display = 'none';
                    }
                });

                // Add keyboard navigation
                document.addEventListener('keydown', function(e) {
                    if (photoModal.style.display === 'flex') {
                        if (e.key === 'Escape') {
                            photoModal.style.display = 'none';
                        } else if (e.key === 'ArrowLeft') {
                            navigatePhoto(-1);
                        } else if (e.key === 'ArrowRight') {
                            navigatePhoto(1);
                        }
                    }
                });

                // Add navigation buttons
                const prevBtn = photoModal.querySelector('.photo-nav.prev');
                const nextBtn = photoModal.querySelector('.photo-nav.next');

                if (prevBtn) {
                    prevBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        navigatePhoto(-1);
                    });
                }

                if (nextBtn) {
                    nextBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        navigatePhoto(1);
                    });
                }
            }

            // Clear existing photos
            photosGrid.innerHTML = '';

            // Add photos to grid
            photos.forEach((photo, index) => {
                const photoItem = document.createElement('div');
                photoItem.className = 'photo-item';
                photoItem.dataset.index = index;

                // Create image element with lazy loading
                const img = document.createElement('img');

                // Determine the correct URL for the photo
                let photoUrl;
                if (photo.startsWith('http')) {
                    photoUrl = photo;
                } else if (photo.startsWith('/')) {
                    photoUrl = `http://localhost:5000${photo}`;
                } else {
                    photoUrl = `http://localhost:5000/uploads/${photo}`;
                }

                // Use data-src for lazy loading
                img.dataset.src = photoUrl;
                img.alt = `Foto ${index + 1} e raportit`;

                // Add a low-quality placeholder or loading indicator
                img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"%3E%3Crect width="300" height="200" fill="%23cccccc"%3E%3C/rect%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%23555555"%3EDuke ngarkuar...%3C/text%3E%3C/svg%3E';
                img.className = 'lazy-image';

                // Add click event to open modal
                photoItem.addEventListener('click', function() {
                    // Ensure the image is loaded before opening modal
                    if (typeof PerformanceUtils !== 'undefined' && img.dataset.src) {
                        PerformanceUtils.loadImage(img, img.dataset.src);
                    }
                    openPhotoModal(index, photos);
                });

                photoItem.appendChild(img);
                photosGrid.appendChild(photoItem);
            });

            // Initialize lazy loading if PerformanceUtils is available
            if (typeof PerformanceUtils !== 'undefined') {
                PerformanceUtils.lazyLoadImages('.lazy-image');
            }

            // Show photos container
            if (photosContainer) {
                photosContainer.style.display = 'block';
            }
        } else {
            // No photos to display
            if (noPhotosMessage) {
                // Update the message text with localized version
                noPhotosMessage.textContent = LocalizationModule.translate('reportDetail.noPhotos', 'Nuk ka foto të disponueshme për këtë raport.');
                noPhotosMessage.style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Error displaying photos:', error);

        // Remove loading indicator
        if (loadingIndicator.parentNode === photosGrid) {
            photosGrid.removeChild(loadingIndicator);
        }

        // Show error message
        if (noPhotosMessage) {
            noPhotosMessage.style.display = 'block';
            noPhotosMessage.textContent = 'Ndodhi një gabim gjatë ngarkimit të fotove. Ju lutemi provoni përsëri.';
        }
    }
}

/**
 * Open photo modal with the selected photo
 */
function openPhotoModal(index, photos) {
    const photoModal = document.getElementById('photo-modal');
    const modalImg = document.getElementById('photo-modal-img');
    const counter = photoModal.querySelector('.photo-modal-counter');

    if (!photoModal || !modalImg) return;

    // Set current photo index
    photoModal.dataset.currentIndex = index;

    // Update counter
    if (counter) {
        counter.textContent = `${index + 1} / ${photos.length}`;
    }

    // Set image source
    const photo = photos[index];
    let photoUrl;

    if (photo.startsWith('http')) {
        photoUrl = photo;
    } else if (photo.startsWith('/')) {
        photoUrl = `http://localhost:5000${photo}`;
    } else {
        photoUrl = `http://localhost:5000/uploads/${photo}`;
    }

    // Show loading indicator in modal with localized text
    const loadingText = LocalizationModule.translate('common.loading', 'Duke ngarkuar...');
    modalImg.src = `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"%3E%3Crect width="300" height="200" fill="%23333333"%3E%3C/rect%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%23ffffff"%3E${encodeURIComponent(loadingText)}%3C/text%3E%3C/svg%3E`;

    // Use PerformanceUtils if available
    if (typeof PerformanceUtils !== 'undefined') {
        PerformanceUtils.loadImage(modalImg, photoUrl);
    } else {
        modalImg.src = photoUrl;
    }

    // Show modal
    photoModal.style.display = 'flex';
}

/**
 * Navigate to previous or next photo
 */
function navigatePhoto(direction) {
    const photoModal = document.getElementById('photo-modal');
    if (!photoModal) return;

    const currentIndex = parseInt(photoModal.dataset.currentIndex || 0);
    const photosGrid = document.getElementById('photos-grid');
    if (!photosGrid) return;

    const photoItems = photosGrid.querySelectorAll('.photo-item');
    if (!photoItems.length) return;

    // Calculate new index
    let newIndex = currentIndex + direction;
    if (newIndex < 0) newIndex = photoItems.length - 1;
    if (newIndex >= photoItems.length) newIndex = 0;

    // Get photos array
    const photos = Array.from(photoItems).map(item => {
        const img = item.querySelector('img');
        // Use data-src if available (for lazy loaded images)
        return img.dataset.src || img.src;
    });

    // Open modal with new index
    openPhotoModal(newIndex, photos);
}

/**
 * Display comments if available
 */
function displayComments(report) {
    const commentsList = document.getElementById('comments-list');
    const noCommentsMessage = document.getElementById('no-comments-message');

    if (!commentsList) return;

    // Check if report has comments
    if (report.comments && report.comments.length > 0) {
        // Hide no comments message
        if (noCommentsMessage) {
            noCommentsMessage.style.display = 'none';
        }

        // Clear existing comments
        commentsList.innerHTML = '';

        // Add comments to list
        report.comments.forEach(comment => {
            const commentItem = document.createElement('div');
            commentItem.className = 'comment-item';

            // Get user initial for avatar
            const userInitial = comment.user?.name ?
                comment.user.name.charAt(0).toUpperCase() :
                'A';

            // Format comment date
            const commentDate = formatDate(comment.createdAt || comment.timestamp);

            // Create comment HTML
            commentItem.innerHTML = `
                <div class="comment-header">
                    <div class="comment-author">
                        <div class="comment-author-avatar">${userInitial}</div>
                        <span>${comment.user?.name || LocalizationModule.translate('common.anonymous', 'Anonim')}</span>
                    </div>
                    <div class="comment-date">${commentDate}</div>
                </div>
                <div class="comment-text">${comment.text}</div>
            `;

            commentsList.appendChild(commentItem);
        });
    } else {
        // Show no comments message
        if (noCommentsMessage) {
            // Update the message text with localized version
            noCommentsMessage.textContent = LocalizationModule.translate('reportDetail.noComments', 'Nuk ka komente për këtë raport.');
            noCommentsMessage.style.display = 'block';
        }
    }
}

/**
 * Set up comment form
 */
function setupCommentForm(report) {
    const commentForm = document.getElementById('comment-form');

    if (!commentForm) return;

    commentForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const commentText = document.getElementById('comment-text').value.trim();

        if (!commentText) {
            alert(LocalizationModule.translate('reportDetail.emptyCommentError', 'Ju lutemi shkruani një koment përpara se ta dërgoni.'));
            return;
        }

        // Show loading state
        const submitBtn = commentForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = LocalizationModule.translate('common.sending', 'Duke dërguar...');

        try {
            // Add comment via API
            const result = await DataStore.addComment(report.id, commentText);

            if (result) {
                // Clear form
                document.getElementById('comment-text').value = '';

                // Refresh comments
                const updatedReport = await DataStore.getReportById(report.id);
                displayComments(updatedReport);

                // Show success message
                alert(LocalizationModule.translate('reportDetail.commentSuccess', 'Komenti u shtua me sukses!'));
            } else {
                alert(LocalizationModule.translate('reportDetail.commentError', 'Ndodhi një gabim gjatë shtimit të komentit. Ju lutemi provoni përsëri.'));
            }
        } catch (error) {
            console.error('Error adding comment:', error);
            alert(LocalizationModule.translate('reportDetail.commentError', 'Ndodhi një gabim gjatë shtimit të komentit. Ju lutemi provoni përsëri.'));
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    });
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
        statusForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const newStatus = statusSelect.value;
            const comment = document.getElementById('status-comment').value;

            if (newStatus && newStatus !== report.status) {
                // Show loading state
                const submitBtn = statusForm.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.textContent;
                submitBtn.disabled = true;
                submitBtn.textContent = LocalizationModule.translate('common.updating', 'Duke përditësuar...');

                try {
                    // Update report status
                    const success = await DataStore.updateReportStatus(report.id, newStatus, comment);

                    if (success) {
                        alert(LocalizationModule.translate('reportDetail.statusUpdateSuccess', 'Statusi i raportit u përditësua me sukses!'));
                        // Reload page to show updated status
                        window.location.reload();
                    } else {
                        alert(LocalizationModule.translate('reportDetail.statusUpdateError', 'Ndodhi një gabim gjatë përditësimit të statusit. Ju lutemi provoni përsëri.'));
                    }
                } catch (error) {
                    console.error('Error updating status:', error);
                    alert(LocalizationModule.translate('reportDetail.statusUpdateError', 'Ndodhi një gabim gjatë përditësimit të statusit. Ju lutemi provoni përsëri.'));
                } finally {
                    // Reset button state
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
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
        case 'infrastructure': return LocalizationModule.translate('reportDetail.category.infrastructure', 'Infrastrukturë');
        case 'environment': return LocalizationModule.translate('reportDetail.category.environment', 'Mjedis');
        case 'public-services': return LocalizationModule.translate('reportDetail.category.publicServices', 'Shërbime Publike');
        case 'community': return LocalizationModule.translate('reportDetail.category.community', 'Komunitet');
        default: return category || LocalizationModule.translate('common.undefined', 'E papërcaktuar');
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

    // If we have a mapping, use it as a fallback
    const fallbackText = subcategoryMap[subcategory] || subcategory || 'E papërcaktuar';

    // Try to get the translation using a key based on the subcategory ID
    const translationKey = `reportDetail.subcategory.${subcategory ? subcategory.replace(/-/g, '') : 'unknown'}`;
    return LocalizationModule.translate(translationKey, fallbackText);
}

function getStatusName(status) {
    switch(status) {
        case 'pending': return LocalizationModule.translate('reportDetail.status.pending', 'Në pritje');
        case 'in-progress': return LocalizationModule.translate('reportDetail.status.inProgress', 'Në proces');
        case 'resolved': return LocalizationModule.translate('reportDetail.status.resolved', 'I zgjidhur');
        default: return LocalizationModule.translate('common.unknown', 'I panjohur');
    }
}

function getSeverityName(severity) {
    switch(severity) {
        case 'low': return LocalizationModule.translate('reportDetail.severity.low', 'I ulët');
        case 'medium': return LocalizationModule.translate('reportDetail.severity.medium', 'Mesatar');
        case 'high': return LocalizationModule.translate('reportDetail.severity.high', 'I lartë');
        case 'urgent': return LocalizationModule.translate('reportDetail.severity.urgent', 'Urgjent');
        default: return severity || LocalizationModule.translate('common.undefined', 'I papërcaktuar');
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

    // If we have a mapping, use it as a fallback
    const fallbackText = neighborhoodMap[neighborhood] || neighborhood || 'E papërcaktuar';

    // Try to get the translation using a key based on the neighborhood ID
    const translationKey = `reportDetail.neighborhood.${neighborhood || 'unknown'}`;
    return LocalizationModule.translate(translationKey, fallbackText);
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
    if (!dateString) return LocalizationModule.translate('common.notAvailable', 'N/A');

    const date = new Date(dateString);
    // Get current language for date formatting
    const language = LocalizationModule.getCurrentLanguage() || 'sq';

    // Map language code to locale
    const localeMap = {
        'sq': 'sq-AL',
        'en': 'en-US'
    };

    const locale = localeMap[language] || 'sq-AL';

    return date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
