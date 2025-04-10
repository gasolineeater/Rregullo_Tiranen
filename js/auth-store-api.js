/**
 * Authentication module for Rregullo Tiranen
 * Handles user registration, login, and profile management using the API
 */

const AuthStore = (function() {
    // Storage key for current user
    const CURRENT_USER_KEY = 'rregullo_tiranen_current_user';
    
    // Get current user from localStorage
    function getCurrentUser() {
        const userJson = localStorage.getItem(CURRENT_USER_KEY);
        return userJson ? JSON.parse(userJson) : null;
    }
    
    // Set current user in localStorage
    function setCurrentUser(user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    }
    
    // Remove current user from localStorage
    function removeCurrentUser() {
        localStorage.removeItem(CURRENT_USER_KEY);
    }
    
    // Check if user is logged in
    async function isLoggedIn() {
        // First check localStorage
        const user = getCurrentUser();
        if (!user) {
            return false;
        }
        
        // Then verify with API
        try {
            const isValid = await ApiService.isLoggedIn();
            return isValid;
        } catch (error) {
            return false;
        }
    }
    
    // Register a new user
    async function registerUser(userData) {
        try {
            const result = await ApiService.register(userData);
            
            if (result.success) {
                setCurrentUser(result.user);
            }
            
            return result;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Registration failed'
            };
        }
    }
    
    // Login user
    async function loginUser(email, password) {
        try {
            const result = await ApiService.login(email, password);
            
            if (result.success) {
                setCurrentUser(result.user);
            }
            
            return result;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Login failed'
            };
        }
    }
    
    // Logout user
    async function logoutUser() {
        try {
            const result = await ApiService.logout();
            
            if (result.success) {
                removeCurrentUser();
            }
            
            return result;
        } catch (error) {
            // Still remove current user even if API call fails
            removeCurrentUser();
            
            return {
                success: true,
                message: 'Dalja u krye me sukses!'
            };
        }
    }
    
    // Update user profile
    async function updateUserProfile(userData) {
        try {
            const result = await ApiService.updateUserProfile(userData);
            
            if (result.success) {
                // Update current user in localStorage
                const currentUser = getCurrentUser();
                setCurrentUser({
                    ...currentUser,
                    ...result.user
                });
            }
            
            return result;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Profile update failed'
            };
        }
    }
    
    // Change user password
    async function changePassword(currentPassword, newPassword) {
        try {
            return await ApiService.changePassword(currentPassword, newPassword);
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Password change failed'
            };
        }
    }
    
    // Update notification settings
    async function updateNotificationSettings(settings) {
        try {
            const result = await ApiService.updateNotificationSettings(settings);
            
            if (result.success) {
                // Update current user in localStorage
                const currentUser = getCurrentUser();
                setCurrentUser({
                    ...currentUser,
                    notifications: result.notifications
                });
            }
            
            return result;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Notification settings update failed'
            };
        }
    }
    
    // Get user reports
    async function getUserReports() {
        try {
            return await ApiService.getUserReports();
        } catch (error) {
            console.error('Error getting user reports:', error);
            return [];
        }
    }
    
    // Get user notifications
    async function getUserNotifications() {
        try {
            return await ApiService.getUserNotifications();
        } catch (error) {
            console.error('Error getting user notifications:', error);
            return [];
        }
    }
    
    // Mark notification as read
    async function markNotificationAsRead(notificationId) {
        try {
            return await ApiService.markNotificationAsRead(notificationId);
        } catch (error) {
            console.error('Error marking notification as read:', error);
            return false;
        }
    }
    
    // Delete notification
    async function deleteNotification(notificationId) {
        try {
            return await ApiService.deleteNotification(notificationId);
        } catch (error) {
            console.error('Error deleting notification:', error);
            return false;
        }
    }
    
    // Mark all notifications as read
    async function markAllNotificationsAsRead() {
        try {
            return await ApiService.markAllNotificationsAsRead();
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            return false;
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
        updateNotificationSettings,
        getUserReports,
        getUserNotifications,
        markNotificationAsRead,
        deleteNotification,
        markAllNotificationsAsRead
    };
})();
