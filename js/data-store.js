/**
 * Data storage module for Rregullo Tiranen
 * Handles storing and retrieving reports using localStorage
 */

const DataStore = (function() {
    // Storage keys
    const REPORTS_KEY = 'rregullo_tiranen_reports';
    
    // Get all reports from localStorage
    function getAllReports() {
        const reportsJson = localStorage.getItem(REPORTS_KEY);
        return reportsJson ? JSON.parse(reportsJson) : [];
    }
    
    // Save a new report
    function saveReport(reportData) {
        const reports = getAllReports();
        
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
        localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
        
        return newReport;
    }
    
    // Get a report by ID
    function getReportById(reportId) {
        const reports = getAllReports();
        return reports.find(report => report.id === reportId);
    }
    
    // Update a report's status
    function updateReportStatus(reportId, newStatus) {
        const reports = getAllReports();
        const reportIndex = reports.findIndex(report => report.id === reportId);
        
        if (reportIndex !== -1) {
            reports[reportIndex].status = newStatus;
            reports[reportIndex].lastUpdated = new Date().toISOString();
            localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
            return true;
        }
        
        return false;
    }
    
    // Get reports filtered by category, status, or both
    function getFilteredReports(filters = {}) {
        const reports = getAllReports();
        
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
            
            return matches;
        });
    }
    
    // Clear all reports (for testing)
    function clearAllReports() {
        localStorage.removeItem(REPORTS_KEY);
    }
    
    // Add some sample reports if none exist
    function initializeSampleData() {
        const reports = getAllReports();
        
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
            
            localStorage.setItem(REPORTS_KEY, JSON.stringify(sampleReports));
            console.log('Sample reports initialized');
            return sampleReports;
        }
        
        return reports;
    }
    
    // Public API
    return {
        getAllReports,
        saveReport,
        getReportById,
        updateReportStatus,
        getFilteredReports,
        clearAllReports,
        initializeSampleData
    };
})();

// Initialize sample data when the script loads
document.addEventListener('DOMContentLoaded', function() {
    DataStore.initializeSampleData();
});
