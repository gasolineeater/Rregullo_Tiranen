/**
 * Profile page functionality for Rregullo Tiranen
 * Handles user profile, reports, and settings
 */

document.addEventListener('DOMContentLoaded', async function() {
    console.log('Profile page initialized');

    // Show loading indicator
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = '<div class="loading-spinner"></div><p>Duke ngarkuar të dhënat...</p>';
    document.body.appendChild(loadingOverlay);

    try {
        // Initialize data stores
        await AuthStore.initialize();
        await DataStore.initialize();

        // Check if user is logged in
        if (!AuthStore.isLoggedIn()) {
            // Redirect to login page if not logged in
            window.location.href = 'login.html';
            return;
        }

        // Get current user
        const currentUser = AuthStore.getCurrentUser();

        // Initialize user menu
        initUserMenu(currentUser);

        // Initialize profile header
        await initProfileHeader(currentUser);

        // Initialize tabs
        initTabs();

        // Initialize user reports
        await initUserReports(currentUser);

        // Initialize account settings
        initAccountSettings(currentUser);

        // Initialize notifications
        await initNotifications(currentUser);

        // Initialize delete account modal
        initDeleteAccountModal();

        // Handle logout
        document.getElementById('logout-btn').addEventListener('click', async function(e) {
            e.preventDefault();

            try {
                const result = await AuthStore.logoutUser();
                if (result.success) {
                    window.location.href = '../index.html';
                }
            } catch (error) {
                console.error('Error logging out:', error);
                alert('Ndodhi një gabim gjatë daljes. Ju lutemi provoni përsëri.');
            }
        });
    } catch (error) {
        console.error('Error initializing profile page:', error);
        alert('Ndodhi një gabim gjatë ngarkimit të faqes. Ju lutemi provoni përsëri.');
    } finally {
        // Remove loading overlay
        document.body.removeChild(loadingOverlay);
    }
});

/**
 * Initialize user menu
 */
function initUserMenu(user) {
    const userInitial = document.getElementById('user-initial');
    const userName = document.getElementById('user-name');
    const userMenuToggle = document.getElementById('user-menu-toggle');
    const userDropdown = document.getElementById('user-dropdown');

    if (userInitial && userName && user) {
        userInitial.textContent = user.fullname.charAt(0).toUpperCase();
        userName.textContent = user.fullname;
    }

    if (userMenuToggle && userDropdown) {
        userMenuToggle.addEventListener('click', function() {
            userDropdown.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!userMenuToggle.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('active');
            }
        });
    }
}

/**
 * Initialize profile header
 */
async function initProfileHeader(user) {
    const profileInitial = document.getElementById('profile-initial');
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');

    if (profileInitial && profileName && profileEmail && user) {
        profileInitial.textContent = user.fullname.charAt(0).toUpperCase();
        profileName.textContent = user.fullname;
        profileEmail.textContent = user.email;
    }

    // Get user reports for statistics
    try {
        const userReports = await ApiService.getUserReports();
        const reportsCount = document.getElementById('reports-count');
        const resolvedCount = document.getElementById('resolved-count');
        const pendingCount = document.getElementById('pending-count');

        if (reportsCount && resolvedCount && pendingCount) {
            reportsCount.textContent = userReports.length || 0;
            resolvedCount.textContent = userReports.filter(report => report.status === 'resolved').length || 0;
            pendingCount.textContent = userReports.filter(report => report.status === 'pending').length || 0;
        }
    } catch (error) {
        console.error('Error fetching user reports for statistics:', error);
        // Fallback to showing zeros
        const reportsCount = document.getElementById('reports-count');
        const resolvedCount = document.getElementById('resolved-count');
        const pendingCount = document.getElementById('pending-count');

        if (reportsCount && resolvedCount && pendingCount) {
            reportsCount.textContent = '0';
            resolvedCount.textContent = '0';
            pendingCount.textContent = '0';
        }
    }
}

/**
 * Initialize tabs
 */
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');

            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to current button and content
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

/**
 * Initialize user reports
 */
async function initUserReports(user) {
    const reportsList = document.getElementById('reports-list');
    const noReportsMessage = document.getElementById('no-reports-message');

    if (!reportsList) return;

    // Show loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.innerHTML = '<div class="spinner"></div><p>Duke ngarkuar raportet...</p>';
    reportsList.appendChild(loadingIndicator);

    try {
        // Get user reports from API
        const userReports = await ApiService.getUserReports();

        // Remove loading indicator
        reportsList.removeChild(loadingIndicator);

        if (!userReports || userReports.length === 0) {
            if (noReportsMessage) {
                noReportsMessage.style.display = 'block';
            }
            return;
        }

        if (noReportsMessage) {
            noReportsMessage.style.display = 'none';
        }

        // Sort reports by date (newest first)
        userReports.sort((a, b) => new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt));

        // Create report cards
        userReports.forEach(report => {
            const reportCard = createReportCard(report);
            reportsList.appendChild(reportCard);
        });

        // Initialize map with user reports
        initUserReportsMap(userReports);

        // Initialize filters
        initReportFilters(userReports);
    } catch (error) {
        console.error('Error fetching user reports:', error);

        // Remove loading indicator
        if (loadingIndicator.parentNode === reportsList) {
            reportsList.removeChild(loadingIndicator);
        }

        // Show error message
        if (noReportsMessage) {
            noReportsMessage.style.display = 'block';
            noReportsMessage.querySelector('p').textContent = 'Ndodhi një gabim gjatë ngarkimit të raporteve. Ju lutemi provoni përsëri.';
        }
    }
}

/**
 * Create a report card element
 */
function createReportCard(report) {
    const reportCard = document.createElement('div');
    reportCard.className = 'report-card';
    reportCard.dataset.id = report.id;
    reportCard.dataset.category = report.category;
    reportCard.dataset.status = report.status;
    reportCard.dataset.date = report.timestamp;

    const reportDate = new Date(report.timestamp);
    const formattedDate = reportDate.toLocaleDateString('sq-AL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    reportCard.innerHTML = `
        <div class="report-card-header">
            <h3 class="report-title">${report.title}</h3>
            <span class="report-status ${report.status}">${getStatusName(report.status)}</span>
        </div>
        <div class="report-meta">
            <div class="meta-item">
                <span class="meta-icon">📅</span>
                <span>${formattedDate}</span>
            </div>
            <div class="meta-item">
                <span class="meta-icon">🏷️</span>
                <span>${getCategoryName(report.category)}</span>
            </div>
            <div class="meta-item">
                <span class="meta-icon">📍</span>
                <span>${report.address || 'Vendndodhje e papërcaktuar'}</span>
            </div>
        </div>
        <div class="report-description">
            ${report.description || 'Nuk ka përshkrim të disponueshëm.'}
        </div>
        <div class="report-actions">
            <a href="report-detail.html?id=${report.id}" class="btn btn-secondary">Shiko Detajet</a>
        </div>
    `;

    return reportCard;
}

/**
 * Initialize map with user reports
 */
function initUserReportsMap(reports) {
    const mapContainer = document.getElementById('user-reports-map');
    if (!mapContainer) return;

    // Initialize the map centered on Tirana
    const tiranaCenterLat = 41.3275;
    const tiranaCenterLng = 19.8187;

    const userMap = L.map('user-reports-map').setView([tiranaCenterLat, tiranaCenterLng], 13);

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(userMap);

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
        const marker = L.marker([report.lat, report.lng], { icon: markerIcon }).addTo(userMap);

        // Add popup with report details
        marker.bindPopup(`
            <div class="map-marker-popup">
                <strong>${report.title}</strong>
                <span>Kategoria: ${getCategoryName(report.category)}</span>
                <span>Statusi: ${getStatusName(report.status)}</span>
                <span>Data: ${formatDate(report.timestamp)}</span>
                <div class="popup-actions">
                    <a href="report-detail.html?id=${report.id}" class="popup-link">Shiko detajet</a>
                </div>
            </div>
        `);
    });

    // Refresh map when it becomes visible (fixes rendering issues)
    setTimeout(() => {
        userMap.invalidateSize();
    }, 100);
}

/**
 * Initialize report filters
 */
function initReportFilters(reports) {
    const statusFilter = document.getElementById('status-filter');
    const categoryFilter = document.getElementById('category-filter');
    const dateFilter = document.getElementById('date-filter');
    const applyFiltersBtn = document.getElementById('apply-filters');

    if (!statusFilter || !categoryFilter || !dateFilter || !applyFiltersBtn) return;

    applyFiltersBtn.addEventListener('click', function() {
        const statusValue = statusFilter.value;
        const categoryValue = categoryFilter.value;
        const dateValue = dateFilter.value;

        const reportCards = document.querySelectorAll('.report-card');

        reportCards.forEach(card => {
            let visible = true;

            // Status filter
            if (statusValue !== 'all' && card.dataset.status !== statusValue) {
                visible = false;
            }

            // Category filter
            if (categoryValue !== 'all' && card.dataset.category !== categoryValue) {
                visible = false;
            }

            // Date filter
            if (dateValue !== 'all') {
                const reportDate = new Date(card.dataset.date);
                const now = new Date();

                if (dateValue === 'week') {
                    // Check if report is from the last 7 days
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    if (reportDate < weekAgo) {
                        visible = false;
                    }
                } else if (dateValue === 'month') {
                    // Check if report is from the last 30 days
                    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    if (reportDate < monthAgo) {
                        visible = false;
                    }
                } else if (dateValue === 'year') {
                    // Check if report is from the last 365 days
                    const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                    if (reportDate < yearAgo) {
                        visible = false;
                    }
                }
            }

            // Show or hide card
            card.style.display = visible ? 'block' : 'none';
        });

        // Show no reports message if all cards are hidden
        const visibleCards = document.querySelectorAll('.report-card[style="display: block"]');
        const noReportsMessage = document.getElementById('no-reports-message');

        if (visibleCards.length === 0 && noReportsMessage) {
            noReportsMessage.style.display = 'block';
            noReportsMessage.querySelector('p').textContent = 'Nuk u gjet asnjë raport që përputhet me filtrat e zgjedhur.';
        } else if (noReportsMessage) {
            noReportsMessage.style.display = 'none';
        }
    });
}

/**
 * Initialize account settings
 */
function initAccountSettings(user) {
    const profileForm = document.getElementById('profile-form');
    const passwordForm = document.getElementById('password-form');

    if (profileForm && user) {
        // Fill form with user data
        document.getElementById('settings-fullname').value = user.fullname;
        document.getElementById('settings-email').value = user.email;
        document.getElementById('settings-phone').value = user.phone || '';

        if (user.neighborhood) {
            const neighborhoodSelect = document.getElementById('settings-neighborhood');
            const option = neighborhoodSelect.querySelector(`option[value="${user.neighborhood}"]`);
            if (option) {
                option.selected = true;
            }
        }

        // Handle form submission
        profileForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const fullname = document.getElementById('settings-fullname').value;
            const phone = document.getElementById('settings-phone').value;
            const neighborhood = document.getElementById('settings-neighborhood').value;

            // Show loading state
            const submitBtn = profileForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Duke përditësuar...';

            try {
                const result = await ApiService.updateUserProfile({
                    fullname,
                    phone,
                    neighborhood
                });

                if (result.success) {
                    alert('Profili u përditësua me sukses!');

                    // Update profile header
                    const profileName = document.getElementById('profile-name');
                    const userInitial = document.getElementById('user-initial');
                    const profileInitial = document.getElementById('profile-initial');
                    const userName = document.getElementById('user-name');

                    if (profileName) profileName.textContent = fullname;
                    if (profileInitial) profileInitial.textContent = fullname.charAt(0).toUpperCase();
                    if (userInitial) userInitial.textContent = fullname.charAt(0).toUpperCase();
                    if (userName) userName.textContent = fullname;

                    // Update user in AuthStore
                    await AuthStore.initialize();
                } else {
                    alert(result.message || 'Ndodhi një gabim gjatë përditësimit të profilit. Ju lutemi provoni përsëri.');
                }
            } catch (error) {
                console.error('Error updating profile:', error);
                alert('Ndodhi një gabim gjatë përditësimit të profilit. Ju lutemi provoni përsëri.');
            } finally {
                // Reset button state
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    }

    if (passwordForm) {
        const newPasswordInput = document.getElementById('new-password');
        const strengthBar = document.getElementById('new-strength-bar');
        const strengthText = document.getElementById('new-strength-text');

        // Password strength meter
        if (newPasswordInput && strengthBar && strengthText) {
            newPasswordInput.addEventListener('input', function() {
                const password = this.value;
                const strength = checkPasswordStrength(password);

                // Update strength bar
                strengthBar.className = 'strength-bar';
                if (password.length > 0) {
                    strengthBar.classList.add(strength.className);
                }

                // Update strength text
                strengthText.textContent = strength.message;
            });
        }

        // Handle form submission
        passwordForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmNewPassword = document.getElementById('confirm-new-password').value;

            // Validate form
            if (newPassword !== confirmNewPassword) {
                alert('Fjalëkalimet e reja nuk përputhen.');
                return;
            }

            const strength = checkPasswordStrength(newPassword);
            if (strength.score < 2) {
                alert('Fjalëkalimi është shumë i dobët. ' + strength.message);
                return;
            }

            // Show loading state
            const submitBtn = passwordForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Duke përditësuar...';

            try {
                const result = await ApiService.changePassword(currentPassword, newPassword);

                if (result.success) {
                    alert('Fjalëkalimi u ndryshua me sukses!');

                    // Clear form
                    document.getElementById('current-password').value = '';
                    document.getElementById('new-password').value = '';
                    document.getElementById('confirm-new-password').value = '';
                    strengthBar.className = 'strength-bar';
                    strengthText.textContent = 'Fjalëkalimi duhet të ketë të paktën 8 karaktere';
                } else {
                    alert(result.message || 'Ndodhi një gabim gjatë ndryshimit të fjalëkalimit. Ju lutemi provoni përsëri.');
                }
            } catch (error) {
                console.error('Error changing password:', error);
                alert('Ndodhi një gabim gjatë ndryshimit të fjalëkalimit. Ju lutemi provoni përsëri.');
            } finally {
                // Reset button state
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    }
}

/**
 * Initialize notifications
 */
async function initNotifications(user) {
    const notificationsForm = document.getElementById('notifications-form');
    const notificationsContainer = document.getElementById('notifications-container');
    const noNotificationsMessage = document.getElementById('no-notifications-message');

    if (notificationsForm && user.notifications) {
        // Fill form with user notification settings
        document.getElementById('notify-status').checked = user.notifications.status !== false;
        document.getElementById('notify-comments').checked = user.notifications.comments !== false;
        document.getElementById('notify-nearby').checked = user.notifications.nearby !== false;
        document.getElementById('notify-email').checked = user.notifications.email !== false;
        document.getElementById('notify-push').checked = user.notifications.push !== false;

        // Handle form submission
        notificationsForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const settings = {
                status: document.getElementById('notify-status').checked,
                comments: document.getElementById('notify-comments').checked,
                nearby: document.getElementById('notify-nearby').checked,
                email: document.getElementById('notify-email').checked,
                push: document.getElementById('notify-push').checked
            };

            // Show loading state
            const submitBtn = notificationsForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Duke përditësuar...';

            try {
                const result = await ApiService.updateNotificationSettings(settings);

                if (result.success) {
                    alert('Cilësimet e njoftimeve u përditësuan me sukses!');
                } else {
                    alert(result.message || 'Ndodhi një gabim gjatë përditësimit të cilësimeve. Ju lutemi provoni përsëri.');
                }
            } catch (error) {
                console.error('Error updating notification settings:', error);
                alert('Ndodhi një gabim gjatë përditësimit të cilësimeve. Ju lutemi provoni përsëri.');
            } finally {
                // Reset button state
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    }

    if (notificationsContainer) {
        // Show loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.innerHTML = '<div class="spinner"></div><p>Duke ngarkuar njoftimet...</p>';
        notificationsContainer.appendChild(loadingIndicator);

        try {
            // Get user notifications from API
            const notifications = await ApiService.getUserNotifications();

            // Remove loading indicator
            notificationsContainer.removeChild(loadingIndicator);

            if (!notifications || notifications.length === 0) {
                if (noNotificationsMessage) {
                    noNotificationsMessage.style.display = 'block';
                }
                return;
            }

            if (noNotificationsMessage) {
                noNotificationsMessage.style.display = 'none';
            }

            // Sort notifications by date (newest first)
            notifications.sort((a, b) => new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt));

            // Create notification items
            notifications.forEach(notification => {
                const notificationItem = createNotificationItem(notification);
                notificationsContainer.appendChild(notificationItem);
            });
        } catch (error) {
            console.error('Error fetching notifications:', error);

            // Remove loading indicator
            if (loadingIndicator.parentNode === notificationsContainer) {
                notificationsContainer.removeChild(loadingIndicator);
            }

            // Show error message
            if (noNotificationsMessage) {
                noNotificationsMessage.style.display = 'block';
                noNotificationsMessage.querySelector('p').textContent = 'Ndodhi një gabim gjatë ngarkimit të njoftimeve. Ju lutemi provoni përsëri.';
            }
        }
    }
}

/**
 * Create a notification item element
 */
function createNotificationItem(notification) {
    const notificationItem = document.createElement('div');
    notificationItem.className = 'notification-item';
    if (notification.read) {
        notificationItem.classList.add('read');
    }
    notificationItem.dataset.id = notification.id;

    let icon = '📣';
    if (notification.type === 'status') {
        icon = '🔄';
    } else if (notification.type === 'comment') {
        icon = '💬';
    } else if (notification.type === 'nearby') {
        icon = '📍';
    }

    const notificationDate = new Date(notification.timestamp);
    const formattedDate = notificationDate.toLocaleDateString('sq-AL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    notificationItem.innerHTML = `
        <div class="notification-icon">${icon}</div>
        <div class="notification-content">
            <div class="notification-title">${notification.title}</div>
            <div class="notification-message">${notification.message}</div>
            <div class="notification-time">${formattedDate}</div>
            <div class="notification-actions">
                ${notification.reportId ? `<a href="report-detail.html?id=${notification.reportId}">Shiko raportin</a>` : ''}
                ${!notification.read ? '<button class="mark-read-btn">Shëno si të lexuar</button>' : ''}
                <button class="delete-notification-btn">Fshi</button>
            </div>
        </div>
    `;

    // Add event listeners
    const markReadBtn = notificationItem.querySelector('.mark-read-btn');
    if (markReadBtn) {
        markReadBtn.addEventListener('click', async function() {
            try {
                const result = await ApiService.markNotificationAsRead(notification.id);
                if (result.success) {
                    notificationItem.classList.add('read');
                    markReadBtn.remove();
                } else {
                    alert(result.message || 'Ndodhi një gabim. Ju lutemi provoni përsëri.');
                }
            } catch (error) {
                console.error('Error marking notification as read:', error);
                alert('Ndodhi një gabim. Ju lutemi provoni përsëri.');
            }
        });
    }

    const deleteBtn = notificationItem.querySelector('.delete-notification-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', async function() {
            try {
                const result = await ApiService.deleteNotification(notification.id);
                if (result.success) {
                    notificationItem.remove();

                    // Show no notifications message if all notifications are deleted
                    const remainingNotifications = document.querySelectorAll('.notification-item');
                    const noNotificationsMessage = document.getElementById('no-notifications-message');

                    if (remainingNotifications.length === 0 && noNotificationsMessage) {
                        noNotificationsMessage.style.display = 'block';
                    }
                } else {
                    alert(result.message || 'Ndodhi një gabim. Ju lutemi provoni përsëri.');
                }
            } catch (error) {
                console.error('Error deleting notification:', error);
                alert('Ndodhi një gabim. Ju lutemi provoni përsëri.');
            }
        });
    }

    return notificationItem;
}

/**
 * Initialize delete account modal
 */
function initDeleteAccountModal() {
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    const deleteAccountModal = document.getElementById('delete-account-modal');
    const closeModal = document.querySelector('.close-modal');
    const cancelModal = document.querySelector('.cancel-modal');
    const deleteAccountForm = document.getElementById('delete-account-form');

    if (deleteAccountBtn && deleteAccountModal) {
        deleteAccountBtn.addEventListener('click', function() {
            deleteAccountModal.style.display = 'block';
        });
    }

    if (closeModal) {
        closeModal.addEventListener('click', function() {
            deleteAccountModal.style.display = 'none';
        });
    }

    if (cancelModal) {
        cancelModal.addEventListener('click', function() {
            deleteAccountModal.style.display = 'none';
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === deleteAccountModal) {
            deleteAccountModal.style.display = 'none';
        }
    });

    if (deleteAccountForm) {
        deleteAccountForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const password = document.getElementById('delete-password').value;

            if (confirm('Jeni i sigurt që dëshironi të fshini llogarinë tuaj? Ky veprim nuk mund të zhbëhet.')) {
                // Show loading state
                const submitBtn = deleteAccountForm.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.textContent;
                submitBtn.disabled = true;
                submitBtn.textContent = 'Duke fshirë...';

                try {
                    const result = await ApiService.deleteAccount(password);

                    if (result.success) {
                        alert('Llogaria juaj u fshi me sukses!');
                        window.location.href = '../index.html';
                    } else {
                        alert(result.message || 'Ndodhi një gabim gjatë fshirjes së llogarisë. Ju lutemi provoni përsëri.');
                    }
                } catch (error) {
                    console.error('Error deleting account:', error);
                    alert('Ndodhi një gabim gjatë fshirjes së llogarisë. Ju lutemi provoni përsëri.');
                } finally {
                    // Reset button state
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                }
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

function getStatusName(status) {
    switch(status) {
        case 'pending': return 'Në pritje';
        case 'in-progress': return 'Në proces';
        case 'resolved': return 'I zgjidhur';
        default: return 'I panjohur';
    }
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

/**
 * Check password strength
 * @param {string} password - The password to check
 * @returns {Object} - Strength score, class name, and message
 */
function checkPasswordStrength(password) {
    // Initialize score
    let score = 0;

    // Check length
    if (password.length < 8) {
        return {
            score: 0,
            className: 'weak',
            message: 'Fjalëkalimi duhet të ketë të paktën 8 karaktere'
        };
    } else {
        score += 1;
    }

    // Check for lowercase letters
    if (/[a-z]/.test(password)) {
        score += 1;
    }

    // Check for uppercase letters
    if (/[A-Z]/.test(password)) {
        score += 1;
    }

    // Check for numbers
    if (/\d/.test(password)) {
        score += 1;
    }

    // Check for special characters
    if (/[^a-zA-Z0-9]/.test(password)) {
        score += 1;
    }

    // Return result based on score
    if (score < 2) {
        return {
            score,
            className: 'weak',
            message: 'Fjalëkalim i dobët - shtoni shkronja të mëdha, numra ose simbole'
        };
    } else if (score < 3) {
        return {
            score,
            className: 'medium',
            message: 'Fjalëkalim mesatar - shtoni shkronja të mëdha, numra ose simbole'
        };
    } else if (score < 5) {
        return {
            score,
            className: 'strong',
            message: 'Fjalëkalim i fortë'
        };
    } else {
        return {
            score,
            className: 'very-strong',
            message: 'Fjalëkalim shumë i fortë'
        };
    }
}
