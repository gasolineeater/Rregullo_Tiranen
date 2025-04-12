/**
 * Report detail page functionality for Rregullo Tiranen
 * Handles displaying and updating individual reports
 */

document.addEventListener('DOMContentLoaded', async function() {
    console.log('Report detail page initialized');

    // Show loading indicator
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = `<div class="loading-spinner"></div><p>${LocalizationHelper.translateWithVars('common.loading', {}, 'Duke ngarkuar të dhënat...')}</p>`;
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
            alert(LocalizationHelper.translateWithVars('reportDetail.notFound', {}, 'Nuk u gjet asnjë raport me këtë ID.'));
            window.location.href = 'map.html';
            return;
        }

        // Load report details
        await loadReportDetails(reportId);
    } catch (error) {
        console.error('Error loading report details:', error);
        alert(LocalizationHelper.translateWithVars('common.loadingError', {}, 'Ndodhi një gabim gjatë ngarkimit të të dhënave. Ju lutemi provoni përsëri.'));
    } finally {
        // Remove loading overlay
        document.body.removeChild(loadingOverlay);
    }
});

/**
 * Load report details from API or local storage
 */
async function loadReportDetails(reportId) {
    try {
        // Get report details
        const report = await DataStore.getReportById(reportId);

        if (!report) {
            alert(LocalizationHelper.translateWithVars('reportDetail.notFound', {}, 'Nuk u gjet asnjë raport me këtë ID.'));
            window.location.href = 'map.html';
            return;
        }

        // Populate page with report details
        populateReportDetails(report);

        // Display photos if available
        await displayPhotos(report);

        // Display comments if available
        displayComments(report);

        // Set up status update functionality
        setupStatusUpdate(report);
    } catch (error) {
        console.error('Error loading report details:', error);
        alert(LocalizationHelper.translateWithVars('common.loadingError', {}, 'Ndodhi një gabim gjatë ngarkimit të të dhënave. Ju lutemi provoni përsëri.'));
    }
}

/**
 * Populate the page with report details
 */
function populateReportDetails(report) {
    // Set page title
    document.title = `${report.title} - ${LocalizationHelper.translateWithVars('app.name', {}, 'Rregullo Tiranen')}`;

    // Basic info
    document.getElementById('report-title').textContent = report.title;
    document.getElementById('report-date').textContent = `${LocalizationHelper.translateWithVars('reportDetail.reportedOn', {}, 'Raportuar më')}: ${LocalizationHelper.formatDateTime(report.timestamp)}`;

    const statusElement = document.getElementById('report-status');
    statusElement.textContent = getStatusName(report.status);
    statusElement.className = `report-status ${report.status}`;

    // Category and location
    document.getElementById('report-category').textContent = getCategoryName(report.category);
    document.getElementById('report-subcategory').textContent = getSubcategoryName(report.subcategory);
    document.getElementById('report-severity').textContent = getSeverityName(report.severity);
    document.getElementById('report-address').textContent = report.address;
    document.getElementById('report-neighborhood').textContent = getNeighborhoodName(report.neighborhood);
    document.getElementById('report-coordinates').textContent = `${report.lat.toFixed(6)}, ${report.lng.toFixed(6)}`;

    // Description
    document.getElementById('report-description-text').textContent = report.description || LocalizationHelper.translateWithVars('reportDetail.noDescription', {}, 'Nuk ka përshkrim të disponueshëm.');

    // Timeline
    updateTimeline(report);
}

/**
 * Update the timeline with status changes
 */
function updateTimeline(report) {
    const timelineContainer = document.getElementById('report-timeline');
    if (!timelineContainer) return;

    // Clear existing timeline
    timelineContainer.innerHTML = '';

    // Create timeline items
    const timelineItems = [];

    // Add creation event
    timelineItems.push({
        date: report.timestamp,
        status: 'created',
        text: 'Raporti u krijua'
    });

    // Add status updates if available
    if (report.statusUpdates) {
        for (const [status, update] of Object.entries(report.statusUpdates)) {
            timelineItems.push({
                date: update.date,
                status: status,
                text: `Statusi u ndryshua në "${getStatusName(status)}"`,
                comment: update.comment
            });
        }
    }

    // Sort timeline items by date (newest first)
    timelineItems.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Create timeline HTML
    timelineItems.forEach(item => {
        const timelineItem = document.createElement('div');
        timelineItem.className = `timeline-item ${item.status}`;

        const timelineDate = document.createElement('div');
        timelineDate.className = 'timeline-date';
        timelineDate.textContent = formatDate(item.date);

        const timelineContent = document.createElement('div');
        timelineContent.className = 'timeline-content';

        const timelineText = document.createElement('p');
        timelineText.textContent = item.text;
        timelineContent.appendChild(timelineText);

        if (item.comment) {
            const timelineComment = document.createElement('p');
            timelineComment.className = 'timeline-comment';
            timelineComment.textContent = `"${item.comment}"`;
            timelineContent.appendChild(timelineComment);
        }

        timelineItem.appendChild(timelineDate);
        timelineItem.appendChild(timelineContent);
        timelineContainer.appendChild(timelineItem);
    });
}

/**
 * Display photos if available
 */
async function displayPhotos(report) {
    const photosGrid = document.getElementById('photos-grid');
    const noPhotosMessage = document.getElementById('no-photos-message');
    const photosContainer = document.getElementById('report-photos-container');

    if (!photosGrid || !photosContainer) return;

    try {
        // Check if report has photos
        if (report.photos && report.photos.length > 0) {
            // Show photos container
            photosContainer.style.display = 'block';
            
            // Hide no photos message
            if (noPhotosMessage) {
                noPhotosMessage.style.display = 'none';
            }

            // Clear existing photos
            photosGrid.innerHTML = '';

            // Add each photo to the grid
            for (const photo of report.photos) {
                const photoItem = document.createElement('div');
                photoItem.className = 'photo-item';

                const img = document.createElement('img');
                img.alt = 'Report photo';
                img.dataset.src = photo; // Store original photo path

                // Determine photo URL (local or API)
                let photoUrl;
                if (photo.startsWith('http')) {
                    photoUrl = photo;
                } else {
                    // Assume photo is stored in uploads folder on server
                    photoUrl = `http://localhost:5000/uploads/${photo}`;
                }

                // Use PerformanceUtils if available
                if (typeof PerformanceUtils !== 'undefined') {
                    PerformanceUtils.loadImage(img, photoUrl);
                } else {
                    img.src = photoUrl;
                }

                // Add click event to open photo in modal
                img.addEventListener('click', function() {
                    openPhotoModal(photo);
                });

                photoItem.appendChild(img);
                photosGrid.appendChild(photoItem);
            }
        } else {
            // No photos to display
            if (noPhotosMessage) {
                // Update the message text with localized version
                noPhotosMessage.textContent = LocalizationHelper.translateWithVars('reportDetail.noPhotos', {}, 'Nuk ka foto të disponueshme për këtë raport.');
                noPhotosMessage.style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Error displaying photos:', error);
    }
}

/**
 * Open photo in modal
 */
function openPhotoModal(photo) {
    const modal = document.getElementById('photo-modal');
    const modalImg = document.getElementById('photo-modal-img');
    const closeBtn = document.querySelector('.close-photo-modal');

    if (!modal || !modalImg) return;

    // Show modal
    modal.style.display = 'flex';

    // Determine photo URL (local or API)
    let photoUrl;
    if (photo.startsWith('http')) {
        photoUrl = photo;
    } else {
        // Assume photo is stored in uploads folder on server
        photoUrl = `http://localhost:5000/uploads/${photo}`;
    }

    // Show loading indicator in modal with localized text
    const loadingText = LocalizationHelper.translateWithVars('common.loading', {}, 'Duke ngarkuar...');
    modalImg.src = `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"%3E%3Crect width="300" height="200" fill="%23333333"%3E%3C/rect%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%23ffffff"%3E${encodeURIComponent(loadingText)}%3C/text%3E%3C/svg%3E`;

    // Use PerformanceUtils if available
    if (typeof PerformanceUtils !== 'undefined') {
        PerformanceUtils.loadImage(modalImg, photoUrl);
    } else {
        modalImg.src = photoUrl;
    }

    // Close modal when clicking close button
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    };

    // Close modal when clicking outside the image
    modal.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}

/**
 * Display comments if available
 */
function displayComments(report) {
    const commentsContainer = document.getElementById('comments-container');
    const noCommentsMessage = document.getElementById('no-comments-message');

    if (!commentsContainer) return;

    // Clear existing comments
    commentsContainer.innerHTML = '';

    // Check if report has comments
    if (report.comments && report.comments.length > 0) {
        // Hide no comments message
        if (noCommentsMessage) {
            noCommentsMessage.style.display = 'none';
        }

        // Sort comments by date (newest first)
        const sortedComments = [...report.comments].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Add each comment to the container
        sortedComments.forEach(comment => {
            const commentElement = document.createElement('div');
            commentElement.className = 'comment';
            commentElement.innerHTML = `
                <div class="comment-header">
                    <div class="comment-user">
                        <span>${comment.user?.name || LocalizationHelper.translateWithVars('common.anonymous', {}, 'Anonim')}</span>
                    </div>
                    <div class="comment-date">
                        <span>${formatDate(comment.timestamp)}</span>
                    </div>
                </div>
                <div class="comment-body">
                    <p>${comment.text}</p>
                </div>
            `;
            commentsContainer.appendChild(commentElement);
        });
    } else {
        // Show no comments message
        if (noCommentsMessage) {
            // Update the message text with localized version
            noCommentsMessage.textContent = LocalizationHelper.translateWithVars('reportDetail.noComments', {}, 'Nuk ka komente për këtë raport.');
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
            alert(LocalizationHelper.translateWithVars('reportDetail.emptyCommentError', {}, 'Ju lutemi shkruani një koment përpara se ta dërgoni.'));
            return;
        }

        // Show loading state
        const submitBtn = commentForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = LocalizationHelper.translateWithVars('common.sending', {}, 'Duke dërguar...');

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
                alert(LocalizationHelper.translateWithVars('reportDetail.commentSuccess', {}, 'Komenti u shtua me sukses!'));
            } else {
                alert(LocalizationHelper.translateWithVars('reportDetail.commentError', {}, 'Ndodhi një gabim gjatë shtimit të komentit. Ju lutemi provoni përsëri.'));
            }
        } catch (error) {
            console.error('Error adding comment:', error);
            alert(LocalizationHelper.translateWithVars('reportDetail.commentError', {}, 'Ndodhi një gabim gjatë shtimit të komentit. Ju lutemi provoni përsëri.'));
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    });
}

/**
 * Set up status update functionality
 */
function setupStatusUpdate(report) {
    const statusBtn = document.getElementById('update-status-btn');
    const modal = document.getElementById('status-modal');
    const closeBtn = document.querySelector('.close-modal');
    const cancelBtn = document.querySelector('.cancel-modal');
    const statusForm = document.getElementById('status-update-form');
    const statusSelect = document.getElementById('new-status');

    if (!statusBtn || !modal || !statusForm || !statusSelect) return;

    // Only show status update button for authenticated users
    if (AuthStore.isLoggedIn()) {
        statusBtn.style.display = 'block';
    } else {
        statusBtn.style.display = 'none';
        return;
    }

    // Open modal when clicking status update button
    statusBtn.addEventListener('click', function() {
        modal.style.display = 'block';
        
        // Set current status as selected
        if (statusSelect) {
            statusSelect.value = report.status;
        }
    });

    // Close modal when clicking close button or cancel button
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

    // Close modal when clicking outside the modal content
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
                submitBtn.textContent = LocalizationHelper.translateWithVars('common.updating', {}, 'Duke përditësuar...');

                try {
                    // Update report status
                    const success = await DataStore.updateReportStatus(report.id, newStatus, comment);

                    if (success) {
                        alert(LocalizationHelper.translateWithVars('reportDetail.statusUpdateSuccess', {}, 'Statusi i raportit u përditësua me sukses!'));
                        // Reload page to show updated status
                        window.location.reload();
                    } else {
                        alert(LocalizationHelper.translateWithVars('reportDetail.statusUpdateError', {}, 'Ndodhi një gabim gjatë përditësimit të statusit. Ju lutemi provoni përsëri.'));
                    }
                } catch (error) {
                    console.error('Error updating status:', error);
                    alert(LocalizationHelper.translateWithVars('reportDetail.statusUpdateError', {}, 'Ndodhi një gabim gjatë përditësimit të statusit. Ju lutemi provoni përsëri.'));
                } finally {
                    // Reset button state
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                }
            } else if (newStatus === report.status) {
                alert(LocalizationHelper.translateWithVars('reportDetail.sameStatus', {}, 'Ju zgjodhët të njëjtin status. Nuk u bë asnjë ndryshim.'));
                modal.style.display = 'none';
            }
        });
    }
}

/**
 * Helper functions
 */
function getCategoryName(category) {
    // Use the LocalizationHelper function for category translation
    return LocalizationHelper.translateCategory(category);
}

function getSubcategoryName(subcategory) {
    // Use the LocalizationHelper function for subcategory translation
    return LocalizationHelper.translateSubcategory(subcategory);
}

function getStatusName(status) {
    // Use the LocalizationHelper function for status translation
    return LocalizationHelper.translateStatus(status);
}

function getSeverityName(severity) {
    // Use the LocalizationHelper function for severity translation
    return LocalizationHelper.translateSeverity(severity);
}

function getNeighborhoodName(neighborhood) {
    // Use the LocalizationHelper function for neighborhood translation
    return LocalizationHelper.translateNeighborhood(neighborhood);
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
    // Use the LocalizationHelper function for date formatting
    return LocalizationHelper.formatDateTime(dateString);
}
