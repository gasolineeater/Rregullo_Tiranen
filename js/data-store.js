/**
 * Data storage module for Rregullo Tiranen
 * Handles storing and retrieving reports using the API service
 * Falls back to localStorage when API is not available
 */

const DataStore = (function() {
    // Storage key for local reports cache
    const REPORTS_KEY = 'rregullo_tiranen_reports';

    // Flag to track if backend is available
    let backendAvailable = false;

    // Local cache of reports
    let reportsCache = null;

    // Initialize reports from localStorage
    function initReportsCache() {
        if (!reportsCache) {
            const reportsJson = localStorage.getItem(REPORTS_KEY);
            if (reportsJson) {
                try {
                    reportsCache = JSON.parse(reportsJson);
                } catch (e) {
                    console.error('Error parsing reports data:', e);
                    reportsCache = [];
                }
            } else {
                reportsCache = [];
            }
        }
        return reportsCache;
    }

    // Save reports to localStorage
    function saveReportsToCache(reports) {
        reportsCache = reports;
        localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
    }

    // Get all reports
    async function getAllReports() {
        try {
            if (backendAvailable) {
                // Try to get reports from API
                const reports = await ApiService.getAllReports();
                if (reports) {
                    // Update local cache
                    saveReportsToCache(reports);
                    return reports;
                }
            }
        } catch (error) {
            console.error('Error fetching reports from API:', error);
        }

        // Fallback to local cache
        return initReportsCache();
    }

    // Get reports with filters
    async function getFilteredReports(filters = {}) {
        try {
            if (backendAvailable) {
                // Try to get filtered reports from API
                const reports = await ApiService.getFilteredReports(filters);
                if (reports) {
                    return reports;
                }
            }
        } catch (error) {
            console.error('Error fetching filtered reports from API:', error);
        }

        // Fallback to filtering local cache
        const reports = initReportsCache();

        return reports.filter(report => {
            let matches = true;

            if (filters.category && report.category !== filters.category) {
                matches = false;
            }

            if (filters.subcategory && report.subcategory !== filters.subcategory) {
                matches = false;
            }

            if (filters.status && report.status !== filters.status) {
                matches = false;
            }

            if (filters.neighborhood && report.neighborhood !== filters.neighborhood) {
                matches = false;
            }

            if (filters.severity && report.severity !== filters.severity) {
                matches = false;
            }

            // Date range filtering
            if (filters.startDate) {
                const startDate = new Date(filters.startDate);
                const reportDate = new Date(report.timestamp);
                if (reportDate < startDate) {
                    matches = false;
                }
            }

            if (filters.endDate) {
                const endDate = new Date(filters.endDate);
                const reportDate = new Date(report.timestamp);
                if (reportDate > endDate) {
                    matches = false;
                }
            }

            return matches;
        });
    }

    // Save a new report
    async function saveReport(reportData) {
        try {
            if (backendAvailable) {
                // Try to save report to API
                const result = await ApiService.createReport(reportData);
                if (result.success && result.report) {
                    // Update local cache
                    const reports = initReportsCache();
                    reports.push(result.report);
                    saveReportsToCache(reports);
                    return result.report;
                }
            }
        } catch (error) {
            console.error('Error saving report to API:', error);
        }

        // Fallback to local storage
        const reports = initReportsCache();

        // Generate a unique ID for the report
        const reportId = Date.now().toString();

        // Add metadata to the report
        const newReport = {
            id: reportId,
            timestamp: new Date().toISOString(),
            status: 'pending',
            ...reportData
        };

        // Add to reports array and save back to localStorage
        reports.push(newReport);
        saveReportsToCache(reports);

        return newReport;
    }

    // Get a report by ID
    async function getReportById(reportId) {
        try {
            if (backendAvailable) {
                // Try to get report from API
                const report = await ApiService.getReportById(reportId);
                if (report) {
                    return report;
                }
            }
        } catch (error) {
            console.error(`Error fetching report ${reportId} from API:`, error);
        }

        // Fallback to local cache
        const reports = initReportsCache();
        return reports.find(report => report.id === reportId);
    }

    // Update a report's status
    async function updateReportStatus(reportId, newStatus, comment = '') {
        try {
            if (backendAvailable) {
                // Try to update report status in API
                const result = await ApiService.updateReportStatus(reportId, newStatus, comment);
                if (result.success && result.report) {
                    // Update local cache
                    const reports = initReportsCache();
                    const reportIndex = reports.findIndex(report => report.id === reportId);
                    if (reportIndex !== -1) {
                        reports[reportIndex] = result.report;
                        saveReportsToCache(reports);
                    }
                    return true;
                }
            }
        } catch (error) {
            console.error(`Error updating report ${reportId} status in API:`, error);
        }

        // Fallback to local storage
        const reports = initReportsCache();
        const reportIndex = reports.findIndex(report => report.id === reportId);

        if (reportIndex !== -1) {
            const report = reports[reportIndex];
            const currentDate = new Date().toISOString();

            // Update status
            report.status = newStatus;
            report.lastUpdated = currentDate;

            // Initialize statusUpdates if it doesn't exist
            if (!report.statusUpdates) {
                report.statusUpdates = {};
            }

            // Add status update entry
            report.statusUpdates[newStatus] = {
                date: currentDate,
                comment: comment || ''
            };

            saveReportsToCache(reports);
            return true;
        }

        return false;
    }

    // Add a comment to a report
    async function addComment(reportId, text) {
        try {
            if (backendAvailable) {
                // Try to add comment in API
                const result = await ApiService.addComment(reportId, text);
                if (result.success) {
                    return result.comments;
                }
            }
        } catch (error) {
            console.error(`Error adding comment to report ${reportId} in API:`, error);
        }

        // Fallback to local storage
        const reports = initReportsCache();
        const reportIndex = reports.findIndex(report => report.id === reportId);

        if (reportIndex !== -1) {
            const report = reports[reportIndex];

            // Initialize comments array if it doesn't exist
            if (!report.comments) {
                report.comments = [];
            }

            // Create new comment
            const newComment = {
                id: Date.now().toString(),
                text,
                timestamp: new Date().toISOString(),
                user: AuthStore.getCurrentUser() ? {
                    id: AuthStore.getCurrentUser().id,
                    name: AuthStore.getCurrentUser().fullname
                } : {
                    id: 'anonymous',
                    name: 'Anonim'
                }
            };

            // Add comment to report
            report.comments.push(newComment);
            saveReportsToCache(reports);

            return report.comments;
        }

        return [];
    }

    // Get reports within a radius
    async function getReportsInRadius(lat, lng, radius) {
        try {
            if (backendAvailable) {
                // Try to get reports in radius from API
                const reports = await ApiService.getReportsInRadius(lat, lng, radius);
                if (reports) {
                    return reports;
                }
            }
        } catch (error) {
            console.error('Error fetching reports in radius from API:', error);
        }

        // Fallback to filtering local cache
        // This is a simplified version that doesn't actually calculate distance properly
        const reports = initReportsCache();

        // Convert radius from km to degrees (very rough approximation)
        const radiusDegrees = radius / 111;

        return reports.filter(report => {
            const latDiff = Math.abs(report.lat - lat);
            const lngDiff = Math.abs(report.lng - lng);
            return latDiff < radiusDegrees && lngDiff < radiusDegrees;
        });
    }

    // Clear all reports (for testing)
    function clearAllReports() {
        reportsCache = [];
        localStorage.removeItem(REPORTS_KEY);
    }

    // Add some sample reports if none exist
    function initializeSampleData() {
        const reports = initReportsCache();

        if (reports.length === 0) {
            const sampleReports = [
                {
                    category: 'infrastructure',
                    subcategory: 'road-damage',
                    type: 'Gropë e thellë',
                    title: 'Gropë e madhe në rrugën "Myslym Shyri"',
                    description: 'Gropë e thellë që shkakton probleme për makinat dhe këmbësorët',
                    address: 'Rruga Myslym Shyri, pranë kryqëzimit me Rrugën e Kavajës',
                    neighborhood: 'njesia5',
                    lat: 41.3275 + 0.015,
                    lng: 19.8187 - 0.02,
                    severity: 'high',
                    status: 'pending',
                    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
                },
                {
                    category: 'infrastructure',
                    subcategory: 'street-lighting',
                    type: 'Ndriçim i prishur',
                    title: 'Ndriçim i dëmtuar në Bulevardin Zhan D\'Ark',
                    description: 'Disa llamba të rrugës janë të prishura duke krijuar një zonë të errët dhe të pasigurt natën',
                    address: 'Bulevardi Zhan D\'Ark, afër shkollës "Petro Nini Luarasi"',
                    neighborhood: 'njesia10',
                    lat: 41.3275 - 0.01,
                    lng: 19.8187 + 0.015,
                    severity: 'medium',
                    status: 'in-progress',
                    timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days ago
                },
                {
                    category: 'environment',
                    subcategory: 'littering',
                    type: 'Grumbullim mbeturinash',
                    title: 'Mbeturina të papastruara në Parkun e Liqenit',
                    description: 'Grumbull mbeturinash pranë zonës së piknikut që nuk është pastruar për disa ditë',
                    address: 'Parku i Liqenit Artificial, zona e piknikut',
                    neighborhood: 'njesia6',
                    lat: 41.3275 + 0.008,
                    lng: 19.8187 + 0.01,
                    severity: 'medium',
                    status: 'pending',
                    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
                },
                {
                    category: 'public-services',
                    subcategory: 'water-utilities',
                    type: 'Mungesë uji',
                    title: 'Problem me furnizimin me ujë në Rrugën Pjetër Budi',
                    description: 'Mungesa e ujit për më shumë se 48 orë në të gjithë pallatet e zonës',
                    address: 'Rruga Pjetër Budi, Pallati 7',
                    neighborhood: 'njesia7',
                    lat: 41.3275 - 0.02,
                    lng: 19.8187 - 0.01,
                    severity: 'urgent',
                    status: 'resolved',
                    timestamp: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString() // 21 days ago
                },
                {
                    category: 'community',
                    subcategory: 'tree-planting',
                    type: 'Kërkesë për gjelbërim',
                    title: 'Kërkesë për mbjellje pemësh në Bulevardin Bajram Curri',
                    description: 'Zona ka nevojë për më shumë gjelbërim për të përmirësuar cilësinë e ajrit dhe estetikën',
                    address: 'Bulevardi Bajram Curri, përballë Gjimnazit "Sami Frashëri"',
                    neighborhood: 'njesia2',
                    lat: 41.3275 + 0.005,
                    lng: 19.8187 - 0.008,
                    severity: 'low',
                    status: 'pending',
                    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
                }
            ];

            // Add IDs to sample reports
            sampleReports.forEach((report, index) => {
                report.id = (Date.now() - index * 1000000).toString();
            });

            saveReportsToCache(sampleReports);
            console.log('Sample reports initialized');
            return sampleReports;
        }

        return reports;
    }

    // Check if backend is available
    async function checkBackendAvailability() {
        try {
            // Try to get reports from API
            const reports = await ApiService.getAllReports();
            if (reports) {
                backendAvailable = true;
                console.log('Backend is available, using API for data storage');
                // Update local cache with reports from API
                saveReportsToCache(reports);
                return true;
            }
        } catch (error) {
            console.error('Backend availability check failed:', error);
            backendAvailable = false;
        }

        console.warn('Backend is not available, using localStorage fallback');
        return false;
    }

    // Initialize - check if backend is available and sync data
    async function initialize() {
        await checkBackendAvailability();

        if (!backendAvailable) {
            // If backend is not available, initialize sample data
            initializeSampleData();
        }
    }

    // Public API
    return {
        getAllReports,
        getFilteredReports,
        saveReport,
        getReportById,
        updateReportStatus,
        addComment,
        getReportsInRadius,
        clearAllReports,
        initializeSampleData,
        initialize
    };
})();

// Initialize data store when the script loads
document.addEventListener('DOMContentLoaded', function() {
    DataStore.initialize().then(() => {
        console.log('DataStore initialized');
    });
});
