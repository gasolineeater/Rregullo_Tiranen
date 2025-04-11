/**
 * Admin API Service
 * Handles all API calls for the admin dashboard
 */
const AdminAPI = (function() {
    /**
     * Get admin dashboard statistics
     */
    async function getStats() {
        try {
            const response = await fetch(`${ApiService.getBaseUrl()}/admin/stats`, {
                method: 'GET',
                headers: ApiService.getHeaders()
            });
            
            const data = await ApiService.handleResponse(response);
            return data.data;
        } catch (error) {
            console.error('Error fetching admin stats:', error);
            throw error;
        }
    }
    
    /**
     * Get all reports with pagination and filters
     */
    async function getReports(page = 1, limit = 10, filters = {}) {
        try {
            // Build query string
            let queryParams = `page=${page}&limit=${limit}`;
            
            // Add filters
            if (filters.status) queryParams += `&status=${filters.status}`;
            if (filters.category) queryParams += `&category=${filters.category}`;
            if (filters.neighborhood) queryParams += `&neighborhood=${filters.neighborhood}`;
            if (filters.search) queryParams += `&search=${encodeURIComponent(filters.search)}`;
            
            const response = await fetch(`${ApiService.getBaseUrl()}/admin/reports?${queryParams}`, {
                method: 'GET',
                headers: ApiService.getHeaders()
            });
            
            return await ApiService.handleResponse(response);
        } catch (error) {
            console.error('Error fetching admin reports:', error);
            throw error;
        }
    }
    
    /**
     * Get all users with pagination and filters
     */
    async function getUsers(page = 1, limit = 10, filters = {}) {
        try {
            // For now, we'll fetch all users and filter client-side
            // In a real implementation, we would add pagination and filtering to the backend
            const response = await fetch(`${ApiService.getBaseUrl()}/admin/users`, {
                method: 'GET',
                headers: ApiService.getHeaders()
            });
            
            const data = await ApiService.handleResponse(response);
            
            // Apply filters client-side
            let filteredUsers = data.data;
            
            if (filters.role) {
                filteredUsers = filteredUsers.filter(user => user.role === filters.role);
            }
            
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                filteredUsers = filteredUsers.filter(user => 
                    user.fullname.toLowerCase().includes(searchTerm) || 
                    user.email.toLowerCase().includes(searchTerm)
                );
            }
            
            // Calculate pagination
            const total = filteredUsers.length;
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;
            const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
            
            // Create pagination object
            const pagination = {};
            if (endIndex < total) {
                pagination.next = {
                    page: page + 1,
                    limit
                };
            }
            
            if (startIndex > 0) {
                pagination.prev = {
                    page: page - 1,
                    limit
                };
            }
            
            return {
                success: true,
                count: paginatedUsers.length,
                pagination,
                total,
                data: paginatedUsers
            };
        } catch (error) {
            console.error('Error fetching admin users:', error);
            throw error;
        }
    }
    
    /**
     * Get a single user by ID
     */
    async function getUser(userId) {
        try {
            const response = await fetch(`${ApiService.getBaseUrl()}/admin/users/${userId}`, {
                method: 'GET',
                headers: ApiService.getHeaders()
            });
            
            const data = await ApiService.handleResponse(response);
            return data.data;
        } catch (error) {
            console.error(`Error fetching user ${userId}:`, error);
            throw error;
        }
    }
    
    /**
     * Update a user
     */
    async function updateUser(userId, userData) {
        try {
            const response = await fetch(`${ApiService.getBaseUrl()}/admin/users/${userId}`, {
                method: 'PUT',
                headers: ApiService.getHeaders(),
                body: JSON.stringify(userData)
            });
            
            const data = await ApiService.handleResponse(response);
            return data.data;
        } catch (error) {
            console.error(`Error updating user ${userId}:`, error);
            throw error;
        }
    }
    
    /**
     * Delete a user
     */
    async function deleteUser(userId) {
        try {
            const response = await fetch(`${ApiService.getBaseUrl()}/admin/users/${userId}`, {
                method: 'DELETE',
                headers: ApiService.getHeaders()
            });
            
            await ApiService.handleResponse(response);
            return true;
        } catch (error) {
            console.error(`Error deleting user ${userId}:`, error);
            throw error;
        }
    }
    
    /**
     * Update report status
     */
    async function updateReportStatus(reportId, status, comment) {
        try {
            const response = await fetch(`${ApiService.getBaseUrl()}/reports/${reportId}/status`, {
                method: 'PUT',
                headers: ApiService.getHeaders(),
                body: JSON.stringify({ status, comment })
            });
            
            await ApiService.handleResponse(response);
            return true;
        } catch (error) {
            console.error(`Error updating report ${reportId} status:`, error);
            throw error;
        }
    }
    
    /**
     * Delete a report
     */
    async function deleteReport(reportId) {
        try {
            const response = await fetch(`${ApiService.getBaseUrl()}/reports/${reportId}`, {
                method: 'DELETE',
                headers: ApiService.getHeaders()
            });
            
            await ApiService.handleResponse(response);
            return true;
        } catch (error) {
            console.error(`Error deleting report ${reportId}:`, error);
            throw error;
        }
    }
    
    /**
     * Send a global notification to all users
     */
    async function sendGlobalNotification(notification) {
        try {
            const response = await fetch(`${ApiService.getBaseUrl()}/admin/notifications`, {
                method: 'POST',
                headers: ApiService.getHeaders(),
                body: JSON.stringify(notification)
            });
            
            const data = await ApiService.handleResponse(response);
            return data;
        } catch (error) {
            console.error('Error sending global notification:', error);
            throw error;
        }
    }
    
    // Public API
    return {
        getStats,
        getReports,
        getUsers,
        getUser,
        updateUser,
        deleteUser,
        updateReportStatus,
        deleteReport,
        sendGlobalNotification
    };
})();
