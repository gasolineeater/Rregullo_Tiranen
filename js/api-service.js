/**
 * API Service for Rregullo Tiranen
 * Handles communication with the backend API
 */

const ApiService = (function() {
    // API base URL
    const API_BASE_URL = 'http://localhost:5000/api';

    // Get token from localStorage
    function getToken() {
        return localStorage.getItem('rregullo_tiranen_token');
    }

    // Set token to localStorage
    function setToken(token) {
        localStorage.setItem('rregullo_tiranen_token', token);
    }

    // Remove token from localStorage
    function removeToken() {
        localStorage.removeItem('rregullo_tiranen_token');
    }

    // Create headers with authorization token
    function getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        const token = getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    // Handle API response
    async function handleResponse(response) {
        const data = await response.json();

        if (!response.ok) {
            const error = data.message || response.statusText;
            return Promise.reject(error);
        }

        return data;
    }

    // Register a new user
    async function register(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(userData)
            });

            const data = await handleResponse(response);

            if (data.token) {
                setToken(data.token);
            }

            return {
                success: true,
                message: 'Regjistrimi u krye me sukses!',
                user: data.data
            };
        } catch (error) {
            return {
                success: false,
                message: error
            };
        }
    }

    // Login user
    async function login(email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ email, password })
            });

            const data = await handleResponse(response);

            if (data.token) {
                setToken(data.token);
            }

            return {
                success: true,
                message: 'Hyrja u krye me sukses!',
                user: data.data
            };
        } catch (error) {
            return {
                success: false,
                message: error
            };
        }
    }

    // Logout user
    async function logout() {
        try {
            await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'GET',
                headers: getHeaders()
            });

            removeToken();

            return {
                success: true,
                message: 'Dalja u krye me sukses!'
            };
        } catch (error) {
            // Still remove token even if API call fails
            removeToken();

            return {
                success: true,
                message: 'Dalja u krye me sukses!'
            };
        }
    }

    // Get current user
    async function getCurrentUser() {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/me`, {
                method: 'GET',
                headers: getHeaders()
            });

            const data = await handleResponse(response);

            return data.data;
        } catch (error) {
            // If unauthorized, remove token
            if (error === 'Not authorized to access this route') {
                removeToken();
            }

            return null;
        }
    }

    // Check if user is logged in
    async function isLoggedIn() {
        const token = getToken();
        if (!token) {
            return false;
        }

        const user = await getCurrentUser();
        return !!user;
    }

    // Update user profile
    async function updateUserProfile(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/updatedetails`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(userData)
            });

            const data = await handleResponse(response);

            return {
                success: true,
                message: 'Profili u përditësua me sukses!',
                user: data.data
            };
        } catch (error) {
            return {
                success: false,
                message: error
            };
        }
    }

    // Change user password
    async function changePassword(currentPassword, newPassword) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/updatepassword`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const data = await handleResponse(response);

            if (data.token) {
                setToken(data.token);
            }

            return {
                success: true,
                message: 'Fjalëkalimi u ndryshua me sukses!'
            };
        } catch (error) {
            return {
                success: false,
                message: error
            };
        }
    }

    // Update notification settings
    async function updateNotificationSettings(settings) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/notifications`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(settings)
            });

            const data = await handleResponse(response);

            return {
                success: true,
                message: 'Cilësimet e njoftimeve u përditësuan me sukses!',
                notifications: data.data
            };
        } catch (error) {
            return {
                success: false,
                message: error
            };
        }
    }

    // Get all reports
    async function getAllReports(params = {}) {
        try {
            // Build query string from params
            const queryString = Object.keys(params)
                .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
                .join('&');

            const url = `${API_BASE_URL}/reports${queryString ? `?${queryString}` : ''}`;

            // Check if we have a cached response
            if (typeof PerformanceUtils !== 'undefined') {
                const cachedResponse = PerformanceUtils.getCachedApiResponse(url);
                if (cachedResponse) {
                    console.log('Using cached reports data');
                    return cachedResponse;
                }
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: getHeaders()
            });

            const data = await handleResponse(response);
            const reports = data.data;

            // Cache the response
            if (typeof PerformanceUtils !== 'undefined') {
                PerformanceUtils.cacheApiResponse(url, reports);
            }

            return reports;
        } catch (error) {
            console.error('Error fetching reports:', error);
            return [];
        }
    }

    // Get a report by ID
    async function getReportById(reportId) {
        try {
            const url = `${API_BASE_URL}/reports/${reportId}`;

            // Check if we have a cached response
            if (typeof PerformanceUtils !== 'undefined') {
                const cachedResponse = PerformanceUtils.getCachedApiResponse(url);
                if (cachedResponse) {
                    console.log(`Using cached data for report ${reportId}`);
                    return cachedResponse;
                }
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: getHeaders()
            });

            const data = await handleResponse(response);
            const report = data.data;

            // Cache the response
            if (typeof PerformanceUtils !== 'undefined') {
                PerformanceUtils.cacheApiResponse(url, report);
            }

            return report;
        } catch (error) {
            console.error(`Error fetching report ${reportId}:`, error);
            return null;
        }
    }

    // Create a new report
    async function createReport(reportData) {
        try {
            const response = await fetch(`${API_BASE_URL}/reports`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(reportData)
            });

            const data = await handleResponse(response);

            return {
                success: true,
                report: data.data
            };
        } catch (error) {
            return {
                success: false,
                message: error
            };
        }
    }

    // Update a report
    async function updateReport(reportId, reportData) {
        try {
            const response = await fetch(`${API_BASE_URL}/reports/${reportId}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(reportData)
            });

            const data = await handleResponse(response);

            return {
                success: true,
                report: data.data
            };
        } catch (error) {
            return {
                success: false,
                message: error
            };
        }
    }

    // Update a report's status
    async function updateReportStatus(reportId, status, comment = '') {
        try {
            const response = await fetch(`${API_BASE_URL}/reports/${reportId}/status`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify({ status, comment })
            });

            const data = await handleResponse(response);

            return {
                success: true,
                report: data.data
            };
        } catch (error) {
            return {
                success: false,
                message: error
            };
        }
    }

    // Add a comment to a report
    async function addComment(reportId, text) {
        try {
            const response = await fetch(`${API_BASE_URL}/reports/${reportId}/comments`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ text })
            });

            const data = await handleResponse(response);

            return {
                success: true,
                comments: data.data
            };
        } catch (error) {
            return {
                success: false,
                message: error
            };
        }
    }

    // Get reports within a radius
    async function getReportsInRadius(lat, lng, distance) {
        try {
            const response = await fetch(`${API_BASE_URL}/reports/radius/${lat}/${lng}/${distance}`, {
                method: 'GET',
                headers: getHeaders()
            });

            const data = await handleResponse(response);

            return data.data;
        } catch (error) {
            console.error('Error fetching reports in radius:', error);
            return [];
        }
    }

    // Get user reports
    async function getUserReports() {
        try {
            const response = await fetch(`${API_BASE_URL}/reports/user`, {
                method: 'GET',
                headers: getHeaders()
            });

            const data = await handleResponse(response);

            return data.data;
        } catch (error) {
            console.error('Error fetching user reports:', error);
            return [];
        }
    }

    // Get user notifications
    async function getUserNotifications() {
        try {
            const response = await fetch(`${API_BASE_URL}/notifications`, {
                method: 'GET',
                headers: getHeaders()
            });

            const data = await handleResponse(response);

            return data.data;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    }

    // Mark notification as read
    async function markNotificationAsRead(notificationId) {
        try {
            const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
                method: 'PUT',
                headers: getHeaders()
            });

            await handleResponse(response);

            return true;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            return false;
        }
    }

    // Delete notification
    async function deleteNotification(notificationId) {
        try {
            const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
                method: 'DELETE',
                headers: getHeaders()
            });

            await handleResponse(response);

            return true;
        } catch (error) {
            console.error('Error deleting notification:', error);
            return false;
        }
    }

    // Mark all notifications as read
    async function markAllNotificationsAsRead() {
        try {
            const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
                method: 'PUT',
                headers: getHeaders()
            });

            await handleResponse(response);

            return true;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            return false;
        }
    }

    // Upload photo for a report
    async function uploadReportPhoto(reportId, photoFile) {
        try {
            // Create FormData object
            const formData = new FormData();
            formData.append('photo', photoFile);

            // Custom headers for file upload (without Content-Type)
            const headers = {};
            const token = getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_BASE_URL}/reports/${reportId}/photos`, {
                method: 'POST',
                headers: headers,
                body: formData
            });

            const data = await handleResponse(response);

            return {
                success: true,
                photo: data.data
            };
        } catch (error) {
            return {
                success: false,
                message: error
            };
        }
    }

    // Delete photo from a report
    async function deleteReportPhoto(reportId, photoName) {
        try {
            const response = await fetch(`${API_BASE_URL}/reports/${reportId}/photos/${photoName}`, {
                method: 'DELETE',
                headers: getHeaders()
            });

            await handleResponse(response);

            return {
                success: true
            };
        } catch (error) {
            return {
                success: false,
                message: error
            };
        }
    }

    // Get all photos for a report
    async function getReportPhotos(reportId) {
        try {
            const response = await fetch(`${API_BASE_URL}/reports/${reportId}/photos`, {
                method: 'GET',
                headers: getHeaders()
            });

            const data = await handleResponse(response);

            return {
                success: true,
                photos: data.data
            };
        } catch (error) {
            return {
                success: false,
                message: error,
                photos: []
            };
        }
    }

    // Public API
    return {
        register,
        login,
        logout,
        getCurrentUser,
        isLoggedIn,
        updateUserProfile,
        changePassword,
        updateNotificationSettings,
        getAllReports,
        getReportById,
        createReport,
        updateReport,
        updateReportStatus,
        addComment,
        getReportsInRadius,
        getUserReports,
        getUserNotifications,
        markNotificationAsRead,
        deleteNotification,
        markAllNotificationsAsRead,
        uploadReportPhoto,
        deleteReportPhoto,
        getReportPhotos
    };
})();
