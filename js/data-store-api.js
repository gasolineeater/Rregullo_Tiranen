/**
 * Data storage module for Rregullo Tiranen
 * Handles reports data using the API
 */

const DataStore = (function() {
    // Get all reports
    async function getAllReports(params = {}) {
        try {
            return await ApiService.getAllReports(params);
        } catch (error) {
            console.error('Error getting all reports:', error);
            return [];
        }
    }
    
    // Get a report by ID
    async function getReportById(reportId) {
        try {
            return await ApiService.getReportById(reportId);
        } catch (error) {
            console.error(`Error getting report ${reportId}:`, error);
            return null;
        }
    }
    
    // Save a new report
    async function saveReport(reportData) {
        try {
            const result = await ApiService.createReport(reportData);
            
            if (result.success) {
                return result.report;
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Error saving report:', error);
            return null;
        }
    }
    
    // Update a report's status
    async function updateReportStatus(reportId, newStatus, comment = '') {
        try {
            const result = await ApiService.updateReportStatus(reportId, newStatus, comment);
            
            if (result.success) {
                return true;
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error(`Error updating report ${reportId} status:`, error);
            return false;
        }
    }
    
    // Add a comment to a report
    async function addComment(reportId, text) {
        try {
            const result = await ApiService.addComment(reportId, text);
            
            if (result.success) {
                return result.comments;
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error(`Error adding comment to report ${reportId}:`, error);
            return null;
        }
    }
    
    // Get reports within a radius
    async function getReportsInRadius(lat, lng, distance) {
        try {
            return await ApiService.getReportsInRadius(lat, lng, distance);
        } catch (error) {
            console.error('Error getting reports in radius:', error);
            return [];
        }
    }
    
    // Get reports by category
    async function getReportsByCategory(category) {
        try {
            return await ApiService.getAllReports({ category });
        } catch (error) {
            console.error(`Error getting reports by category ${category}:`, error);
            return [];
        }
    }
    
    // Get reports by status
    async function getReportsByStatus(status) {
        try {
            return await ApiService.getAllReports({ status });
        } catch (error) {
            console.error(`Error getting reports by status ${status}:`, error);
            return [];
        }
    }
    
    // Get reports by neighborhood
    async function getReportsByNeighborhood(neighborhood) {
        try {
            return await ApiService.getAllReports({ neighborhood });
        } catch (error) {
            console.error(`Error getting reports by neighborhood ${neighborhood}:`, error);
            return [];
        }
    }
    
    // Public API
    return {
        getAllReports,
        getReportById,
        saveReport,
        updateReportStatus,
        addComment,
        getReportsInRadius,
        getReportsByCategory,
        getReportsByStatus,
        getReportsByNeighborhood
    };
})();
