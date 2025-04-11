/**
 * Notifications Module
 * Handles fetching, displaying, and managing notifications
 */
const NotificationsModule = (function() {
    // Private variables
    let notifications = [];
    let unreadCount = 0;
    let notificationDropdown;
    let notificationIcon;
    let notificationBadge;
    let notificationList;
    let notificationSound;
    let pollingInterval;
    let lastFetchTime = 0;
    
    // Configuration
    const config = {
        pollingInterval: 30000, // 30 seconds
        toastDuration: 5000,    // 5 seconds
        maxNotifications: 50    // Maximum number of notifications to store locally
    };
    
    /**
     * Initialize the notifications module
     */
    async function initialize() {
        console.log('Initializing notifications module');
        
        // Create notification icon in the header
        createNotificationIcon();
        
        // Create notification sound element
        createNotificationSound();
        
        // Load notifications from localStorage
        loadNotificationsFromStorage();
        
        // Fetch notifications from the server
        await fetchNotifications();
        
        // Start polling for new notifications
        startPolling();
        
        // Add event listeners
        addEventListeners();
    }
    
    /**
     * Create notification icon in the header
     */
    function createNotificationIcon() {
        const mainNav = document.querySelector('.main-nav');
        const themeToggle = document.querySelector('.theme-toggle');
        
        if (!mainNav || !themeToggle) return;
        
        // Check if notification icon already exists
        if (document.querySelector('.notification-icon')) return;
        
        // Create notification icon
        const notificationIconElement = document.createElement('div');
        notificationIconElement.className = 'notification-icon';
        notificationIconElement.id = 'notification-icon';
        notificationIconElement.innerHTML = `
            <span class="icon">🔔</span>
            <span class="notification-badge" id="notification-badge">0</span>
        `;
        
        // Create notification dropdown
        const notificationDropdownElement = document.createElement('div');
        notificationDropdownElement.className = 'notification-dropdown';
        notificationDropdownElement.id = 'notification-dropdown';
        notificationDropdownElement.innerHTML = `
            <div class="notification-header">
                <h3>Njoftimet</h3>
                <div class="notification-actions">
                    <button id="mark-all-read">Shëno të gjitha si të lexuara</button>
                </div>
            </div>
            <div class="notification-loading">
                <div class="notification-spinner"></div>
                <p>Duke ngarkuar njoftimet...</p>
            </div>
            <ul class="notification-list" id="notification-list"></ul>
            <div class="notification-empty" style="display: none;">
                <p>Nuk keni njoftime të reja</p>
            </div>
        `;
        
        // Insert notification icon before theme toggle
        mainNav.insertBefore(notificationIconElement, themeToggle);
        
        // Append notification dropdown to notification icon
        notificationIconElement.appendChild(notificationDropdownElement);
        
        // Store references to elements
        notificationIcon = document.getElementById('notification-icon');
        notificationBadge = document.getElementById('notification-badge');
        notificationDropdown = document.getElementById('notification-dropdown');
        notificationList = document.getElementById('notification-list');
    }
    
    /**
     * Create notification sound element
     */
    function createNotificationSound() {
        // Check if notification sound already exists
        if (document.getElementById('notification-sound')) return;
        
        // Create audio element
        const audioElement = document.createElement('audio');
        audioElement.id = 'notification-sound';
        audioElement.className = 'notification-sound';
        
        // Add notification sound
        audioElement.innerHTML = `
            <source src="sounds/notification.mp3" type="audio/mpeg">
            <source src="sounds/notification.ogg" type="audio/ogg">
        `;
        
        // Append to body
        document.body.appendChild(audioElement);
        
        // Store reference
        notificationSound = document.getElementById('notification-sound');
    }
    
    /**
     * Load notifications from localStorage
     */
    function loadNotificationsFromStorage() {
        try {
            const storedNotifications = localStorage.getItem('notifications');
            if (storedNotifications) {
                notifications = JSON.parse(storedNotifications);
                updateUnreadCount();
                updateNotificationBadge();
            }
        } catch (error) {
            console.error('Error loading notifications from storage:', error);
        }
    }
    
    /**
     * Save notifications to localStorage
     */
    function saveNotificationsToStorage() {
        try {
            // Limit the number of notifications stored
            const limitedNotifications = notifications.slice(0, config.maxNotifications);
            localStorage.setItem('notifications', JSON.stringify(limitedNotifications));
        } catch (error) {
            console.error('Error saving notifications to storage:', error);
        }
    }
    
    /**
     * Fetch notifications from the server
     */
    async function fetchNotifications() {
        try {
            // Check if user is logged in
            if (!AuthStore.isLoggedIn()) return;
            
            // Show loading state
            showLoadingState();
            
            // Fetch notifications from API
            const fetchedNotifications = await ApiService.getUserNotifications();
            
            // Update last fetch time
            lastFetchTime = Date.now();
            
            // Check for new notifications
            const newNotifications = findNewNotifications(fetchedNotifications);
            
            // Update notifications array
            notifications = fetchedNotifications;
            
            // Save to localStorage
            saveNotificationsToStorage();
            
            // Update unread count
            updateUnreadCount();
            
            // Update notification badge
            updateNotificationBadge();
            
            // Render notifications
            renderNotifications();
            
            // Show toast for new notifications
            if (newNotifications.length > 0) {
                playNotificationSound();
                showNotificationToast(newNotifications[0]);
            }
            
            return fetchedNotifications;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            hideLoadingState();
            showErrorState();
            return [];
        }
    }
    
    /**
     * Find new notifications by comparing with current list
     */
    function findNewNotifications(fetchedNotifications) {
        if (!notifications.length) return fetchedNotifications;
        
        return fetchedNotifications.filter(notification => {
            // Check if this notification already exists in our current list
            return !notifications.some(existing => existing._id === notification._id);
        });
    }
    
    /**
     * Update unread count
     */
    function updateUnreadCount() {
        unreadCount = notifications.filter(notification => !notification.read).length;
    }
    
    /**
     * Update notification badge
     */
    function updateNotificationBadge() {
        if (!notificationBadge) return;
        
        notificationBadge.textContent = unreadCount;
        
        if (unreadCount > 0) {
            notificationBadge.style.display = 'flex';
        } else {
            notificationBadge.style.display = 'none';
        }
    }
    
    /**
     * Render notifications in the dropdown
     */
    function renderNotifications() {
        if (!notificationList) return;
        
        // Hide loading state
        hideLoadingState();
        
        // Clear current list
        notificationList.innerHTML = '';
        
        // Check if there are notifications
        if (notifications.length === 0) {
            showEmptyState();
            return;
        }
        
        // Hide empty state
        hideEmptyState();
        
        // Render each notification
        notifications.forEach(notification => {
            const notificationItem = createNotificationItem(notification);
            notificationList.appendChild(notificationItem);
        });
    }
    
    /**
     * Create a notification item element
     */
    function createNotificationItem(notification) {
        const li = document.createElement('li');
        li.className = `notification-item ${notification.read ? '' : 'unread'}`;
        li.dataset.id = notification._id;
        
        // Get icon based on notification type
        const icon = getNotificationIcon(notification.type);
        
        // Format date
        const formattedDate = formatNotificationDate(notification.createdAt);
        
        li.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon-wrapper ${notification.type}">
                    ${icon}
                </div>
                <div class="notification-details">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-meta">
                        <span class="notification-time">${formattedDate}</span>
                        <div class="notification-actions-item">
                            <button class="mark-read-btn" ${notification.read ? 'style="display:none"' : ''}>Shëno si të lexuar</button>
                            <button class="delete-btn">Fshi</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners
        addNotificationItemEventListeners(li, notification);
        
        return li;
    }
    
    /**
     * Add event listeners to notification item
     */
    function addNotificationItemEventListeners(element, notification) {
        // Click on notification
        element.addEventListener('click', function(e) {
            // Don't trigger if clicking on buttons
            if (e.target.tagName === 'BUTTON') return;
            
            // Mark as read
            if (!notification.read) {
                markNotificationAsRead(notification._id);
            }
            
            // Navigate to report if available
            if (notification.report) {
                window.location.href = `html/report-detail.html?id=${notification.report}`;
            }
        });
        
        // Mark as read button
        const markReadBtn = element.querySelector('.mark-read-btn');
        if (markReadBtn) {
            markReadBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                markNotificationAsRead(notification._id);
            });
        }
        
        // Delete button
        const deleteBtn = element.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                deleteNotification(notification._id);
            });
        }
    }
    
    /**
     * Get notification icon based on type
     */
    function getNotificationIcon(type) {
        switch (type) {
            case 'status':
                return '📊';
            case 'comment':
                return '💬';
            case 'nearby':
                return '📍';
            default:
                return '🔔';
        }
    }
    
    /**
     * Format notification date
     */
    function formatNotificationDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);
        
        if (diffSec < 60) {
            return 'Tani';
        } else if (diffMin < 60) {
            return `${diffMin} min më parë`;
        } else if (diffHour < 24) {
            return `${diffHour} orë më parë`;
        } else if (diffDay < 7) {
            return `${diffDay} ditë më parë`;
        } else {
            return date.toLocaleDateString('sq-AL', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
    }
    
    /**
     * Mark notification as read
     */
    async function markNotificationAsRead(notificationId) {
        try {
            // Update UI immediately
            const notificationItem = document.querySelector(`.notification-item[data-id="${notificationId}"]`);
            if (notificationItem) {
                notificationItem.classList.remove('unread');
                const markReadBtn = notificationItem.querySelector('.mark-read-btn');
                if (markReadBtn) {
                    markReadBtn.style.display = 'none';
                }
            }
            
            // Update local data
            const notification = notifications.find(n => n._id === notificationId);
            if (notification) {
                notification.read = true;
                updateUnreadCount();
                updateNotificationBadge();
                saveNotificationsToStorage();
            }
            
            // Send to server
            await ApiService.markNotificationAsRead(notificationId);
            
            return true;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            return false;
        }
    }
    
    /**
     * Mark all notifications as read
     */
    async function markAllNotificationsAsRead() {
        try {
            // Update UI immediately
            const unreadItems = document.querySelectorAll('.notification-item.unread');
            unreadItems.forEach(item => {
                item.classList.remove('unread');
                const markReadBtn = item.querySelector('.mark-read-btn');
                if (markReadBtn) {
                    markReadBtn.style.display = 'none';
                }
            });
            
            // Update local data
            notifications.forEach(notification => {
                notification.read = true;
            });
            
            updateUnreadCount();
            updateNotificationBadge();
            saveNotificationsToStorage();
            
            // Send to server
            await ApiService.markAllNotificationsAsRead();
            
            return true;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            return false;
        }
    }
    
    /**
     * Delete notification
     */
    async function deleteNotification(notificationId) {
        try {
            // Update UI immediately
            const notificationItem = document.querySelector(`.notification-item[data-id="${notificationId}"]`);
            if (notificationItem) {
                notificationItem.remove();
            }
            
            // Update local data
            const index = notifications.findIndex(n => n._id === notificationId);
            if (index !== -1) {
                const wasUnread = !notifications[index].read;
                notifications.splice(index, 1);
                
                if (wasUnread) {
                    updateUnreadCount();
                    updateNotificationBadge();
                }
                
                saveNotificationsToStorage();
                
                // Show empty state if no notifications left
                if (notifications.length === 0) {
                    showEmptyState();
                }
            }
            
            // Send to server
            await ApiService.deleteNotification(notificationId);
            
            return true;
        } catch (error) {
            console.error('Error deleting notification:', error);
            return false;
        }
    }
    
    /**
     * Show loading state
     */
    function showLoadingState() {
        if (!notificationDropdown) return;
        
        const loadingElement = notificationDropdown.querySelector('.notification-loading');
        const listElement = notificationDropdown.querySelector('.notification-list');
        const emptyElement = notificationDropdown.querySelector('.notification-empty');
        
        if (loadingElement) loadingElement.style.display = 'block';
        if (listElement) listElement.style.display = 'none';
        if (emptyElement) emptyElement.style.display = 'none';
    }
    
    /**
     * Hide loading state
     */
    function hideLoadingState() {
        if (!notificationDropdown) return;
        
        const loadingElement = notificationDropdown.querySelector('.notification-loading');
        const listElement = notificationDropdown.querySelector('.notification-list');
        
        if (loadingElement) loadingElement.style.display = 'none';
        if (listElement) listElement.style.display = 'block';
    }
    
    /**
     * Show empty state
     */
    function showEmptyState() {
        if (!notificationDropdown) return;
        
        const emptyElement = notificationDropdown.querySelector('.notification-empty');
        if (emptyElement) emptyElement.style.display = 'block';
    }
    
    /**
     * Hide empty state
     */
    function hideEmptyState() {
        if (!notificationDropdown) return;
        
        const emptyElement = notificationDropdown.querySelector('.notification-empty');
        if (emptyElement) emptyElement.style.display = 'none';
    }
    
    /**
     * Show error state
     */
    function showErrorState() {
        if (!notificationDropdown) return;
        
        const emptyElement = notificationDropdown.querySelector('.notification-empty');
        if (emptyElement) {
            emptyElement.style.display = 'block';
            emptyElement.querySelector('p').textContent = 'Ndodhi një gabim gjatë ngarkimit të njoftimeve';
        }
    }
    
    /**
     * Start polling for new notifications
     */
    function startPolling() {
        if (pollingInterval) {
            clearInterval(pollingInterval);
        }
        
        pollingInterval = setInterval(async () => {
            // Only poll if user is logged in
            if (AuthStore.isLoggedIn()) {
                await fetchNotifications();
            } else {
                stopPolling();
            }
        }, config.pollingInterval);
    }
    
    /**
     * Stop polling for new notifications
     */
    function stopPolling() {
        if (pollingInterval) {
            clearInterval(pollingInterval);
            pollingInterval = null;
        }
    }
    
    /**
     * Play notification sound
     */
    function playNotificationSound() {
        if (!notificationSound) return;
        
        // Check if user has enabled notification sounds
        const soundEnabled = localStorage.getItem('notification_sound') !== 'disabled';
        if (!soundEnabled) return;
        
        // Play sound
        notificationSound.currentTime = 0;
        notificationSound.play().catch(error => {
            console.error('Error playing notification sound:', error);
        });
    }
    
    /**
     * Show notification toast
     */
    function showNotificationToast(notification) {
        // Check if toast container exists
        let toastContainer = document.querySelector('.notification-toast');
        
        // Create toast container if it doesn't exist
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'notification-toast';
            document.body.appendChild(toastContainer);
        }
        
        // Get icon based on notification type
        const icon = getNotificationIcon(notification.type);
        
        // Set toast content
        toastContainer.innerHTML = `
            <button class="notification-toast-close">&times;</button>
            <div class="notification-toast-content">
                <div class="notification-toast-icon">
                    ${icon}
                </div>
                <div class="notification-toast-details">
                    <div class="notification-toast-title">${notification.title}</div>
                    <div class="notification-toast-message">${notification.message}</div>
                </div>
            </div>
        `;
        
        // Add click event to close button
        const closeBtn = toastContainer.querySelector('.notification-toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                hideNotificationToast();
            });
        }
        
        // Add click event to toast
        toastContainer.addEventListener('click', function(e) {
            // Don't trigger if clicking on close button
            if (e.target.className === 'notification-toast-close') return;
            
            // Mark as read
            markNotificationAsRead(notification._id);
            
            // Navigate to report if available
            if (notification.report) {
                window.location.href = `html/report-detail.html?id=${notification.report}`;
            }
            
            // Hide toast
            hideNotificationToast();
        });
        
        // Show toast
        setTimeout(() => {
            toastContainer.classList.add('show');
        }, 10);
        
        // Hide toast after duration
        setTimeout(() => {
            hideNotificationToast();
        }, config.toastDuration);
    }
    
    /**
     * Hide notification toast
     */
    function hideNotificationToast() {
        const toastContainer = document.querySelector('.notification-toast');
        if (!toastContainer) return;
        
        toastContainer.classList.remove('show');
        
        // Remove from DOM after animation
        setTimeout(() => {
            if (toastContainer.parentNode) {
                toastContainer.parentNode.removeChild(toastContainer);
            }
        }, 300);
    }
    
    /**
     * Add event listeners
     */
    function addEventListeners() {
        // Notification icon click
        if (notificationIcon) {
            notificationIcon.addEventListener('click', function(e) {
                // Don't trigger if clicking inside dropdown
                if (notificationDropdown && notificationDropdown.contains(e.target)) return;
                
                // Toggle dropdown
                toggleNotificationDropdown();
            });
        }
        
        // Mark all as read button
        const markAllReadBtn = document.getElementById('mark-all-read');
        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', function() {
                markAllNotificationsAsRead();
            });
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (notificationDropdown && 
                notificationDropdown.classList.contains('active') && 
                !notificationIcon.contains(e.target)) {
                notificationDropdown.classList.remove('active');
            }
        });
    }
    
    /**
     * Toggle notification dropdown
     */
    function toggleNotificationDropdown() {
        if (!notificationDropdown) return;
        
        const isActive = notificationDropdown.classList.toggle('active');
        
        // Fetch notifications when opening dropdown
        if (isActive && Date.now() - lastFetchTime > 10000) { // Only fetch if last fetch was more than 10 seconds ago
            fetchNotifications();
        }
    }
    
    // Public API
    return {
        initialize,
        fetchNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification
    };
})();

// Initialize notifications when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    // Wait for AuthStore to initialize
    if (typeof AuthStore !== 'undefined') {
        try {
            await AuthStore.initialize();
            
            // Only initialize notifications if user is logged in
            if (AuthStore.isLoggedIn()) {
                NotificationsModule.initialize();
            }
        } catch (error) {
            console.error('Error initializing notifications:', error);
        }
    }
});
