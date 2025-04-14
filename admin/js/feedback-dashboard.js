/**
 * Feedback Dashboard for Rregullo Tiranen
 * Manages the feedback dashboard for administrators
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize feedback dashboard
    initFeedbackDashboard();
});

/**
 * Initialize feedback dashboard
 */
function initFeedbackDashboard() {
    // Load feedback data
    const feedbackData = loadFeedbackData();
    
    // Initialize dashboard
    initFilters(feedbackData);
    initStats(feedbackData);
    initFeedbackList(feedbackData);
    initPagination(feedbackData);
    initModals();
    initActions();
    
    // Check for admin authentication
    checkAdminAuth();
}

/**
 * Load feedback data from localStorage
 * @returns {Array} - Feedback data
 */
function loadFeedbackData() {
    // Get feedback data from localStorage
    const feedbackData = JSON.parse(localStorage.getItem('mobileFeedback') || '[]');
    
    // Sort by timestamp (newest first)
    feedbackData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return feedbackData;
}

/**
 * Initialize filters
 * @param {Array} feedbackData - Feedback data
 */
function initFilters(feedbackData) {
    // Get filter elements
    const filterType = document.getElementById('filter-type');
    const filterFeature = document.getElementById('filter-feature');
    const filterRating = document.getElementById('filter-rating');
    const searchFeedback = document.getElementById('search-feedback');
    
    // Add event listeners
    filterType.addEventListener('change', applyFilters);
    filterFeature.addEventListener('change', applyFilters);
    filterRating.addEventListener('change', applyFilters);
    searchFeedback.addEventListener('input', applyFilters);
    
    /**
     * Apply filters to feedback data
     */
    function applyFilters() {
        // Get filter values
        const typeFilter = filterType.value;
        const featureFilter = filterFeature.value;
        const ratingFilter = filterRating.value;
        const searchFilter = searchFeedback.value.toLowerCase();
        
        // Filter feedback data
        const filteredData = feedbackData.filter(feedback => {
            // Type filter
            if (typeFilter && feedback['feedback-type'] !== typeFilter) {
                return false;
            }
            
            // Feature filter
            if (featureFilter && feedback['feedback-feature'] !== featureFilter) {
                return false;
            }
            
            // Rating filter
            if (ratingFilter && feedback['feedback-rating'] !== ratingFilter) {
                return false;
            }
            
            // Search filter
            if (searchFilter) {
                const description = (feedback['feedback-description'] || '').toLowerCase();
                const email = (feedback['feedback-email'] || '').toLowerCase();
                const type = (feedback['feedback-type'] || '').toLowerCase();
                const feature = (feedback['feedback-feature'] || '').toLowerCase();
                
                return description.includes(searchFilter) || 
                       email.includes(searchFilter) || 
                       type.includes(searchFilter) || 
                       feature.includes(searchFilter);
            }
            
            return true;
        });
        
        // Update stats
        updateStats(filteredData);
        
        // Update feedback list
        updateFeedbackList(filteredData);
        
        // Update pagination
        updatePagination(filteredData);
    }
}

/**
 * Initialize stats
 * @param {Array} feedbackData - Feedback data
 */
function initStats(feedbackData) {
    updateStats(feedbackData);
}

/**
 * Update stats based on filtered data
 * @param {Array} filteredData - Filtered feedback data
 */
function updateStats(filteredData) {
    // Get stat elements
    const totalFeedback = document.getElementById('total-feedback');
    const avgRating = document.getElementById('avg-rating');
    const bugCount = document.getElementById('bug-count');
    const featureCount = document.getElementById('feature-count');
    
    // Calculate stats
    const total = filteredData.length;
    
    // Calculate average rating
    let ratingSum = 0;
    let ratingCount = 0;
    
    filteredData.forEach(feedback => {
        if (feedback['feedback-rating']) {
            ratingSum += parseInt(feedback['feedback-rating']);
            ratingCount++;
        }
    });
    
    const average = ratingCount > 0 ? (ratingSum / ratingCount).toFixed(1) : '0.0';
    
    // Count bugs and feature requests
    const bugs = filteredData.filter(feedback => feedback['feedback-type'] === 'bug').length;
    const features = filteredData.filter(feedback => feedback['feedback-type'] === 'feature').length;
    
    // Update stat elements
    totalFeedback.textContent = total;
    avgRating.textContent = average;
    bugCount.textContent = bugs;
    featureCount.textContent = features;
}

/**
 * Initialize feedback list
 * @param {Array} feedbackData - Feedback data
 */
function initFeedbackList(feedbackData) {
    // Set current page
    window.currentPage = 1;
    window.itemsPerPage = 10;
    
    // Update feedback list
    updateFeedbackList(feedbackData);
}

/**
 * Update feedback list based on filtered data
 * @param {Array} filteredData - Filtered feedback data
 */
function updateFeedbackList(filteredData) {
    // Get feedback list element
    const feedbackList = document.getElementById('feedback-list');
    
    // Clear feedback list
    feedbackList.innerHTML = '';
    
    // Check if there's no feedback
    if (filteredData.length === 0) {
        feedbackList.innerHTML = `
            <tr class="no-feedback-message">
                <td colspan="7">Nuk ka reagime për të shfaqur.</td>
            </tr>
        `;
        return;
    }
    
    // Calculate pagination
    const startIndex = (window.currentPage - 1) * window.itemsPerPage;
    const endIndex = startIndex + window.itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);
    
    // Add feedback items
    paginatedData.forEach((feedback, index) => {
        // Create feedback item
        const feedbackItem = document.createElement('tr');
        feedbackItem.className = 'feedback-item';
        feedbackItem.dataset.index = startIndex + index;
        
        // Format date
        const date = new Date(feedback.timestamp);
        const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        
        // Format rating
        const rating = feedback['feedback-rating'] ? '★'.repeat(parseInt(feedback['feedback-rating'])) : '';
        
        // Format type
        const typeLabels = {
            'bug': 'Problem teknik',
            'feature': 'Kërkesë për veçori',
            'usability': 'Problem përdorimi',
            'performance': 'Problem performance',
            'other': 'Tjetër'
        };
        
        const type = typeLabels[feedback['feedback-type']] || feedback['feedback-type'] || '';
        
        // Format feature
        const featureLabels = {
            'swipe': 'Gjestet e rrëshqitjes',
            'pinch': 'Zmadhimi me gishta',
            'haptic': 'Reagimi haptik',
            'animations': 'Animacionet',
            'other': 'Tjetër'
        };
        
        const feature = featureLabels[feedback['feedback-feature']] || feedback['feedback-feature'] || '';
        
        // Format device
        const device = getDeviceInfo(feedback);
        
        // Set feedback item HTML
        feedbackItem.innerHTML = `
            <td>${formattedDate}</td>
            <td>${type}</td>
            <td>${feature}</td>
            <td><span class="rating-stars">${rating}</span></td>
            <td class="feedback-description">${feedback['feedback-description'] || ''}</td>
            <td>${device}</td>
            <td class="feedback-actions">
                <button class="btn btn-primary btn-view-feedback" data-index="${startIndex + index}">Shiko</button>
                <button class="btn btn-danger btn-delete-feedback" data-index="${startIndex + index}">Fshi</button>
            </td>
        `;
        
        // Add to feedback list
        feedbackList.appendChild(feedbackItem);
    });
    
    // Add event listeners to view buttons
    const viewButtons = document.querySelectorAll('.btn-view-feedback');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            viewFeedback(filteredData[index]);
        });
    });
    
    // Add event listeners to delete buttons
    const deleteButtons = document.querySelectorAll('.btn-delete-feedback');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            confirmDeleteFeedback(filteredData[index]);
        });
    });
}

/**
 * Get device info from feedback
 * @param {Object} feedback - Feedback data
 * @returns {string} - Device info
 */
function getDeviceInfo(feedback) {
    // Check if device info exists
    if (!feedback['device-userAgent']) {
        return 'N/A';
    }
    
    // Get device info
    const userAgent = feedback['device-userAgent'] || '';
    
    // Check if mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    // Get device type
    let deviceType = 'Desktop';
    
    if (isMobile) {
        if (/iPad/i.test(userAgent)) {
            deviceType = 'Tablet (iPad)';
        } else if (/Android/i.test(userAgent) && !/Mobile/i.test(userAgent)) {
            deviceType = 'Tablet (Android)';
        } else if (/iPhone/i.test(userAgent)) {
            deviceType = 'Mobile (iPhone)';
        } else if (/Android/i.test(userAgent)) {
            deviceType = 'Mobile (Android)';
        } else {
            deviceType = 'Mobile';
        }
    }
    
    return deviceType;
}

/**
 * Initialize pagination
 * @param {Array} feedbackData - Feedback data
 */
function initPagination(feedbackData) {
    // Get pagination elements
    const prevPage = document.getElementById('prev-page');
    const nextPage = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');
    
    // Add event listeners
    prevPage.addEventListener('click', function() {
        if (window.currentPage > 1) {
            window.currentPage--;
            updateFeedbackList(feedbackData);
            updatePagination(feedbackData);
        }
    });
    
    nextPage.addEventListener('click', function() {
        const totalPages = Math.ceil(feedbackData.length / window.itemsPerPage);
        
        if (window.currentPage < totalPages) {
            window.currentPage++;
            updateFeedbackList(feedbackData);
            updatePagination(feedbackData);
        }
    });
    
    // Update pagination
    updatePagination(feedbackData);
}

/**
 * Update pagination based on filtered data
 * @param {Array} filteredData - Filtered feedback data
 */
function updatePagination(filteredData) {
    // Get pagination elements
    const prevPage = document.getElementById('prev-page');
    const nextPage = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');
    
    // Calculate total pages
    const totalPages = Math.ceil(filteredData.length / window.itemsPerPage);
    
    // Update page info
    pageInfo.textContent = `Faqja ${window.currentPage} nga ${totalPages || 1}`;
    
    // Update button states
    prevPage.disabled = window.currentPage <= 1;
    nextPage.disabled = window.currentPage >= totalPages;
}

/**
 * Initialize modals
 */
function initModals() {
    // Get modal elements
    const feedbackModal = document.getElementById('feedback-modal');
    const confirmModal = document.getElementById('confirm-modal');
    
    // Get close buttons
    const closeButtons = document.querySelectorAll('.modal-close');
    
    // Add event listeners to close buttons
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get parent modal
            const modal = this.closest('.modal');
            
            // Close modal
            modal.classList.remove('active');
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === feedbackModal) {
            feedbackModal.classList.remove('active');
        }
        
        if (event.target === confirmModal) {
            confirmModal.classList.remove('active');
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            feedbackModal.classList.remove('active');
            confirmModal.classList.remove('active');
        }
    });
}

/**
 * Initialize actions
 */
function initActions() {
    // Get action elements
    const exportCsv = document.getElementById('export-csv');
    const clearFeedback = document.getElementById('clear-feedback');
    
    // Add event listeners
    exportCsv.addEventListener('click', exportFeedbackToCsv);
    clearFeedback.addEventListener('click', confirmClearFeedback);
}

/**
 * View feedback details
 * @param {Object} feedback - Feedback data
 */
function viewFeedback(feedback) {
    // Get modal elements
    const feedbackModal = document.getElementById('feedback-modal');
    const feedbackDetails = document.getElementById('feedback-details');
    const deleteFeedback = document.getElementById('delete-feedback');
    
    // Format date
    const date = new Date(feedback.timestamp);
    const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    
    // Format rating
    const rating = feedback['feedback-rating'] ? '★'.repeat(parseInt(feedback['feedback-rating'])) : 'N/A';
    
    // Format type
    const typeLabels = {
        'bug': 'Problem teknik',
        'feature': 'Kërkesë për veçori',
        'usability': 'Problem përdorimi',
        'performance': 'Problem performance',
        'other': 'Tjetër'
    };
    
    const type = typeLabels[feedback['feedback-type']] || feedback['feedback-type'] || 'N/A';
    
    // Format feature
    const featureLabels = {
        'swipe': 'Gjestet e rrëshqitjes',
        'pinch': 'Zmadhimi me gishta',
        'haptic': 'Reagimi haptik',
        'animations': 'Animacionet',
        'other': 'Tjetër'
    };
    
    const feature = featureLabels[feedback['feedback-feature']] || feedback['feedback-feature'] || 'N/A';
    
    // Get device details
    const deviceDetails = [];
    
    Object.entries(feedback).forEach(([key, value]) => {
        if (key.startsWith('device-')) {
            const label = key.replace('device-', '');
            deviceDetails.push({ label, value });
        }
    });
    
    // Set feedback details HTML
    feedbackDetails.innerHTML = `
        <div class="feedback-detail">
            <div class="feedback-detail-label">Data:</div>
            <div class="feedback-detail-value">${formattedDate}</div>
        </div>
        <div class="feedback-detail">
            <div class="feedback-detail-label">Lloji:</div>
            <div class="feedback-detail-value">${type}</div>
        </div>
        <div class="feedback-detail">
            <div class="feedback-detail-label">Veçoria:</div>
            <div class="feedback-detail-value">${feature}</div>
        </div>
        <div class="feedback-detail">
            <div class="feedback-detail-label">Vlerësimi:</div>
            <div class="feedback-detail-value"><span class="rating-stars">${rating}</span></div>
        </div>
        <div class="feedback-detail">
            <div class="feedback-detail-label">Përshkrimi:</div>
            <div class="feedback-detail-value feedback-detail-description">${feedback['feedback-description'] || 'N/A'}</div>
        </div>
        <div class="feedback-detail">
            <div class="feedback-detail-label">Email:</div>
            <div class="feedback-detail-value">${feedback['feedback-email'] || 'N/A'}</div>
        </div>
        <div class="feedback-detail">
            <div class="feedback-detail-label">Faqja:</div>
            <div class="feedback-detail-value">${feedback.pageUrl || 'N/A'}</div>
        </div>
        
        <div class="device-details">
            <h4>Informacione për Pajisjen</h4>
            <div class="device-details-grid">
                ${deviceDetails.map(detail => `
                    <div class="device-detail">
                        <div class="device-detail-label">${formatLabel(detail.label)}:</div>
                        <div class="device-detail-value">${detail.value}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // Set delete button data
    deleteFeedback.dataset.timestamp = feedback.timestamp;
    
    // Add event listener to delete button
    deleteFeedback.addEventListener('click', function() {
        // Close modal
        feedbackModal.classList.remove('active');
        
        // Confirm delete
        confirmDeleteFeedback(feedback);
    });
    
    // Show modal
    feedbackModal.classList.add('active');
}

/**
 * Format label
 * @param {string} label - Label to format
 * @returns {string} - Formatted label
 */
function formatLabel(label) {
    // Capitalize first letter
    return label.charAt(0).toUpperCase() + label.slice(1);
}

/**
 * Confirm delete feedback
 * @param {Object} feedback - Feedback data
 */
function confirmDeleteFeedback(feedback) {
    // Get modal elements
    const confirmModal = document.getElementById('confirm-modal');
    const confirmMessage = document.getElementById('confirm-message');
    const confirmAction = document.getElementById('confirm-action');
    
    // Set confirm message
    confirmMessage.textContent = 'A jeni të sigurt që dëshironi të fshini këtë reagim?';
    
    // Set confirm action
    confirmAction.dataset.timestamp = feedback.timestamp;
    
    // Add event listener to confirm action
    confirmAction.addEventListener('click', function() {
        // Delete feedback
        deleteFeedback(feedback);
        
        // Close modal
        confirmModal.classList.remove('active');
    }, { once: true });
    
    // Show modal
    confirmModal.classList.add('active');
}

/**
 * Delete feedback
 * @param {Object} feedback - Feedback data
 */
function deleteFeedback(feedback) {
    // Get feedback data
    const feedbackData = loadFeedbackData();
    
    // Find feedback index
    const index = feedbackData.findIndex(item => item.timestamp === feedback.timestamp);
    
    // Remove feedback
    if (index !== -1) {
        feedbackData.splice(index, 1);
        
        // Save feedback data
        localStorage.setItem('mobileFeedback', JSON.stringify(feedbackData));
        
        // Reload dashboard
        initFeedbackDashboard();
    }
}

/**
 * Confirm clear all feedback
 */
function confirmClearFeedback() {
    // Get modal elements
    const confirmModal = document.getElementById('confirm-modal');
    const confirmMessage = document.getElementById('confirm-message');
    const confirmAction = document.getElementById('confirm-action');
    
    // Set confirm message
    confirmMessage.textContent = 'A jeni të sigurt që dëshironi të fshini të gjitha reagimet? Ky veprim nuk mund të kthehet.';
    
    // Add event listener to confirm action
    confirmAction.addEventListener('click', function() {
        // Clear all feedback
        clearAllFeedback();
        
        // Close modal
        confirmModal.classList.remove('active');
    }, { once: true });
    
    // Show modal
    confirmModal.classList.add('active');
}

/**
 * Clear all feedback
 */
function clearAllFeedback() {
    // Clear feedback data
    localStorage.removeItem('mobileFeedback');
    
    // Reload dashboard
    initFeedbackDashboard();
}

/**
 * Export feedback to CSV
 */
function exportFeedbackToCsv() {
    // Get feedback data
    const feedbackData = loadFeedbackData();
    
    // Check if there's no feedback
    if (feedbackData.length === 0) {
        alert('Nuk ka reagime për të eksportuar.');
        return;
    }
    
    // Create CSV content
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // Add headers
    csvContent += 'Data,Lloji,Veçoria,Vlerësimi,Përshkrimi,Email,Faqja,Pajisja\n';
    
    // Add rows
    feedbackData.forEach(feedback => {
        // Format date
        const date = new Date(feedback.timestamp);
        const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        
        // Format type
        const typeLabels = {
            'bug': 'Problem teknik',
            'feature': 'Kërkesë për veçori',
            'usability': 'Problem përdorimi',
            'performance': 'Problem performance',
            'other': 'Tjetër'
        };
        
        const type = typeLabels[feedback['feedback-type']] || feedback['feedback-type'] || '';
        
        // Format feature
        const featureLabels = {
            'swipe': 'Gjestet e rrëshqitjes',
            'pinch': 'Zmadhimi me gishta',
            'haptic': 'Reagimi haptik',
            'animations': 'Animacionet',
            'other': 'Tjetër'
        };
        
        const feature = featureLabels[feedback['feedback-feature']] || feedback['feedback-feature'] || '';
        
        // Format device
        const device = getDeviceInfo(feedback);
        
        // Add row
        csvContent += `"${formattedDate}","${type}","${feature}","${feedback['feedback-rating'] || ''}","${(feedback['feedback-description'] || '').replace(/"/g, '""')}","${feedback['feedback-email'] || ''}","${feedback.pageUrl || ''}","${device}"\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reagime-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    
    // Click link
    link.click();
    
    // Remove link
    document.body.removeChild(link);
}

/**
 * Check admin authentication
 */
function checkAdminAuth() {
    // Check if user is authenticated as admin
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    // If not admin, redirect to login page
    if (!isAdmin) {
        // For demo purposes, set admin flag
        localStorage.setItem('isAdmin', 'true');
        
        // In a real application, you would redirect to login page
        // window.location.href = 'login.html';
    }
}
