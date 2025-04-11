/**
 * Admin Dashboard
 * Handles the admin dashboard functionality
 */
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Admin dashboard initialized');
    
    // Check if user has admin access
    const hasAccess = await AdminUtils.checkAdminAccess();
    if (!hasAccess) return;
    
    // Initialize dashboard
    initDashboard();
    
    // Initialize theme toggle
    initThemeToggle();
});

/**
 * Initialize dashboard
 */
async function initDashboard() {
    try {
        // Fetch dashboard statistics
        const stats = await AdminAPI.getStats();
        
        // Update statistics cards
        updateStatisticsCards(stats);
        
        // Initialize charts
        initCharts(stats);
        
        // Fetch recent reports
        const reportsResponse = await AdminAPI.getReports(1, 5);
        
        // Update recent reports table
        updateRecentReportsTable(reportsResponse.data);
        
        // Fetch recent users
        const usersResponse = await AdminAPI.getUsers(1, 5);
        
        // Update recent users table
        updateRecentUsersTable(usersResponse.data);
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        alert('Ndodhi një gabim gjatë ngarkimit të të dhënave. Ju lutemi provoni përsëri.');
    }
}

/**
 * Update statistics cards
 */
function updateStatisticsCards(stats) {
    // Update total users
    const totalUsersElement = document.getElementById('total-users');
    if (totalUsersElement) {
        totalUsersElement.textContent = stats.totalUsers || 0;
    }
    
    // Update total reports
    const totalReportsElement = document.getElementById('total-reports');
    if (totalReportsElement) {
        totalReportsElement.textContent = stats.totalReports || 0;
    }
    
    // Update pending reports
    const pendingReportsElement = document.getElementById('pending-reports');
    if (pendingReportsElement) {
        pendingReportsElement.textContent = stats.reportsByStatus?.pending || 0;
    }
    
    // Update in-progress reports
    const inProgressReportsElement = document.getElementById('in-progress-reports');
    if (inProgressReportsElement) {
        inProgressReportsElement.textContent = stats.reportsByStatus?.inProgress || 0;
    }
    
    // Update resolved reports
    const resolvedReportsElement = document.getElementById('resolved-reports');
    if (resolvedReportsElement) {
        resolvedReportsElement.textContent = stats.reportsByStatus?.resolved || 0;
    }
    
    // Update recent reports
    const recentReportsElement = document.getElementById('recent-reports');
    if (recentReportsElement) {
        recentReportsElement.textContent = stats.reportsByTime?.lastWeek || 0;
    }
}

/**
 * Initialize charts
 */
function initCharts(stats) {
    // Initialize category chart
    initCategoryChart(stats.reportsByCategory);
    
    // Initialize status chart
    initStatusChart(stats.reportsByStatus);
}

/**
 * Initialize category chart
 */
function initCategoryChart(categoryData) {
    const ctx = document.getElementById('category-chart-canvas');
    if (!ctx) return;
    
    // Prepare data
    const labels = [];
    const data = [];
    const backgroundColors = [
        'rgba(231, 76, 60, 0.7)',  // Red for infrastructure
        'rgba(46, 204, 113, 0.7)',  // Green for environment
        'rgba(52, 152, 219, 0.7)',  // Blue for public services
        'rgba(243, 156, 18, 0.7)'   // Yellow for community
    ];
    
    // Map category IDs to readable names
    const categoryNames = {
        'infrastructure': 'Infrastrukturë',
        'environment': 'Mjedis',
        'public-services': 'Shërbime Publike',
        'community': 'Komunitet'
    };
    
    // Process data
    if (categoryData && categoryData.length > 0) {
        categoryData.forEach(category => {
            labels.push(categoryNames[category._id] || category._id);
            data.push(category.count);
        });
    } else {
        // Default data if no categories found
        labels.push('Nuk ka të dhëna');
        data.push(0);
        backgroundColors[0] = 'rgba(200, 200, 200, 0.7)';
    }
    
    // Create chart
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        boxWidth: 12
                    }
                }
            }
        }
    });
}

/**
 * Initialize status chart
 */
function initStatusChart(statusData) {
    const ctx = document.getElementById('status-chart-canvas');
    if (!ctx) return;
    
    // Prepare data
    const labels = ['Në Pritje', 'Në Proces', 'Të Zgjidhura'];
    const data = [
        statusData?.pending || 0,
        statusData?.inProgress || 0,
        statusData?.resolved || 0
    ];
    const backgroundColors = [
        'rgba(243, 156, 18, 0.7)',  // Yellow for pending
        'rgba(52, 152, 219, 0.7)',   // Blue for in-progress
        'rgba(46, 204, 113, 0.7)'    // Green for resolved
    ];
    
    // Create chart
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Numri i Raporteve',
                data: data,
                backgroundColor: backgroundColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

/**
 * Update recent reports table
 */
function updateRecentReportsTable(reports) {
    const tableBody = document.querySelector('#recent-reports-table tbody');
    if (!tableBody) return;
    
    // Clear loading row
    tableBody.innerHTML = '';
    
    // Check if there are reports
    if (!reports || reports.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="6" class="text-center">Nuk ka raporte për të shfaqur</td>
        `;
        tableBody.appendChild(emptyRow);
        return;
    }
    
    // Add reports to table
    reports.forEach(report => {
        const row = document.createElement('tr');
        
        // Format date
        const formattedDate = AdminUtils.formatDate(report.createdAt);
        
        // Format status
        const formattedStatus = AdminUtils.formatStatus(report.status);
        
        // Format category
        const formattedCategory = AdminUtils.formatCategory(report.category);
        
        row.innerHTML = `
            <td>${report._id}</td>
            <td>${AdminUtils.truncateText(report.title, 30)}</td>
            <td>${formattedCategory}</td>
            <td>${formattedStatus}</td>
            <td>${formattedDate}</td>
            <td class="table-actions-cell">
                <a href="reports.html?id=${report._id}" class="btn-icon view" title="Shiko Detajet">👁️</a>
                <a href="../report-detail.html?id=${report._id}" class="btn-icon edit" title="Shko te Faqja e Raportit">🔗</a>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

/**
 * Update recent users table
 */
function updateRecentUsersTable(users) {
    const tableBody = document.querySelector('#recent-users-table tbody');
    if (!tableBody) return;
    
    // Clear loading row
    tableBody.innerHTML = '';
    
    // Check if there are users
    if (!users || users.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="6" class="text-center">Nuk ka përdorues për të shfaqur</td>
        `;
        tableBody.appendChild(emptyRow);
        return;
    }
    
    // Add users to table
    users.forEach(user => {
        const row = document.createElement('tr');
        
        // Format date
        const formattedDate = AdminUtils.formatDate(user.createdAt);
        
        // Format role
        const formattedRole = AdminUtils.formatRole(user.role);
        
        row.innerHTML = `
            <td>${user._id}</td>
            <td>${user.fullname}</td>
            <td>${user.email}</td>
            <td>${formattedRole}</td>
            <td>${formattedDate}</td>
            <td class="table-actions-cell">
                <a href="users.html?id=${user._id}" class="btn-icon view" title="Shiko Detajet">👁️</a>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

/**
 * Initialize theme toggle
 */
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;
    
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        
        // Save preference to localStorage
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
    });
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
}
