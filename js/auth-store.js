/**
 * Authentication module for Rregullo Tiranen
 * Handles user registration, login, and profile management
 * Uses the API service for backend communication
 */

const AuthStore = (function() {
    // Storage key for current user
    const CURRENT_USER_KEY = 'rregullo_tiranen_current_user';

    // Local cache of current user
    let currentUser = null;

    // Initialize current user from localStorage
    function initCurrentUser() {
        if (!currentUser) {
            const userJson = localStorage.getItem(CURRENT_USER_KEY);
            if (userJson) {
                try {
                    currentUser = JSON.parse(userJson);
                } catch (e) {
                    console.error('Error parsing user data:', e);
                    localStorage.removeItem(CURRENT_USER_KEY);
                }
            }
        }
        return currentUser;
    }

    // Get current user (from cache or localStorage)
    function getCurrentUser() {
        return currentUser || initCurrentUser();
    }

    // Save current user to localStorage
    function saveCurrentUser(user) {
        if (user) {
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
            currentUser = user;
        } else {
            localStorage.removeItem(CURRENT_USER_KEY);
            currentUser = null;
        }
    }

    // Check if user is logged in
    function isLoggedIn() {
        return getCurrentUser() !== null;
    }

    // Register a new user
    async function registerUser(userData) {
        try {
            const result = await ApiService.register(userData);

            if (result.success && result.user) {
                saveCurrentUser(result.user);
            }

            return result;
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                message: 'Ndodhi një gabim gjatë regjistrimit. Ju lutemi provoni përsëri.'
            };
        }
    }

    // Login user
    async function loginUser(email, password, remember = false) {
        try {
            const result = await ApiService.login(email, password);

            if (result.success && result.user) {
                saveCurrentUser(result.user);
            }

            return result;
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: 'Ndodhi një gabim gjatë hyrjes. Ju lutemi provoni përsëri.'
            };
        }
    }

    // Logout user
    async function logoutUser() {
        try {
            const result = await ApiService.logout();

            // Clear current user regardless of API result
            saveCurrentUser(null);

            return {
                success: true,
                message: 'Dalja u krye me sukses!'
            };
        } catch (error) {
            console.error('Logout error:', error);

            // Still clear current user even if API fails
            saveCurrentUser(null);

            return {
                success: true,
                message: 'Dalja u krye me sukses!'
            };
        }
    }

    // Update user profile
    async function updateUserProfile(userData) {
        try {
            const result = await ApiService.updateProfile(userData);

            if (result.success && result.user) {
                saveCurrentUser(result.user);
            }

            return result;
        } catch (error) {
            console.error('Update profile error:', error);
            return {
                success: false,
                message: 'Ndodhi një gabim gjatë përditësimit të profilit. Ju lutemi provoni përsëri.'
            };
        }
    }

    // Change user password
    async function changePassword(currentPassword, newPassword) {
        try {
            const result = await ApiService.updatePassword({
                currentPassword,
                newPassword
            });

            return result;
        } catch (error) {
            console.error('Change password error:', error);
            return {
                success: false,
                message: 'Ndodhi një gabim gjatë ndryshimit të fjalëkalimit. Ju lutemi provoni përsëri.'
            };
        }
    }

    // Delete user account
    async function deleteAccount(password) {
        // This would need to be implemented in the API
        console.warn('Account deletion not implemented in API yet');
        return {
            success: false,
            message: 'Fshirja e llogarisë nuk është e disponueshme aktualisht.'
        };
    }

    // Update notification settings
    async function updateNotificationSettings(settings) {
        try {
            const result = await ApiService.updateNotificationSettings(settings);

            if (result.success && result.user) {
                // Update current user with new notification settings
                const updatedUser = getCurrentUser();
                if (updatedUser) {
                    updatedUser.notifications = {
                        ...updatedUser.notifications,
                        ...settings
                    };
                    saveCurrentUser(updatedUser);
                }
            }

            return result;
        } catch (error) {
            console.error('Update notification settings error:', error);
            return {
                success: false,
                message: 'Ndodhi një gabim gjatë përditësimit të cilësimeve të njoftimeve. Ju lutemi provoni përsëri.'
            };
        }
    }

    // Get user reports
    async function getUserReports() {
        try {
            return await ApiService.getUserReports();
        } catch (error) {
            console.error('Get user reports error:', error);
            return [];
        }
    }

    // Get user notifications
    async function getUserNotifications() {
        try {
            return await ApiService.getUserNotifications();
        } catch (error) {
            console.error('Get user notifications error:', error);
            return [];
        }
    }

    // Mark notification as read
    async function markNotificationAsRead(notificationId) {
        try {
            return await ApiService.markNotificationAsRead(notificationId);
        } catch (error) {
            console.error('Mark notification as read error:', error);
            return false;
        }
    }

    // Delete notification
    async function deleteNotification(notificationId) {
        try {
            return await ApiService.deleteNotification(notificationId);
        } catch (error) {
            console.error('Delete notification error:', error);
            return false;
        }
    }

    // Mark all notifications as read
    async function markAllNotificationsAsRead() {
        try {
            return await ApiService.markAllNotificationsAsRead();
        } catch (error) {
            console.error('Mark all notifications as read error:', error);
            return false;
        }
    }

    // Check if backend is available
    async function checkBackendAvailability() {
        try {
            // Try to get current user from API
            const user = await ApiService.getCurrentUser();

            if (user) {
                // Update local user data if API returned a user
                saveCurrentUser(user);
                return true;
            }

            return false;
        } catch (error) {
            console.error('Backend availability check failed:', error);
            return false;
        }
    }

    // Initialize - check if backend is available and sync user data
    async function initialize() {
        const backendAvailable = await checkBackendAvailability();

        if (backendAvailable) {
            console.log('Backend is available, using API for authentication');
        } else {
            console.warn('Backend is not available, using localStorage fallback');

            // If we have a token but backend is not available, clear user data
            if (localStorage.getItem('rregullo_tiranen_token')) {
                localStorage.removeItem('rregullo_tiranen_token');
                saveCurrentUser(null);
            }
        }
    }

    // Public API
    return {
        getCurrentUser,
        isLoggedIn,
        registerUser,
        loginUser,
        logoutUser,
        updateUserProfile,
        changePassword,
        deleteAccount,
        updateNotificationSettings,
        getUserReports,
        getUserNotifications,
        markNotificationAsRead,
        deleteNotification,
        markAllNotificationsAsRead,
        initialize
    };
})();

// Initialize auth store when the script loads
document.addEventListener('DOMContentLoaded', function() {
    AuthStore.initialize().then(() => {
        console.log('AuthStore initialized');
    });
});
