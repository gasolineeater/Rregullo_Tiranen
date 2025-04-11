/**
 * Admin Utilities
 * Common utility functions for the admin dashboard
 */
const AdminUtils = (function() {
    /**
     * Format date to a readable string
     */
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('sq-AL', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    /**
     * Format status to a readable string with badge
     */
    function formatStatus(status) {
        let statusText = '';
        let statusClass = '';
        
        switch (status) {
            case 'pending':
                statusText = 'Në Pritje';
                statusClass = 'pending';
                break;
            case 'in-progress':
                statusText = 'Në Proces';
                statusClass = 'in-progress';
                break;
            case 'resolved':
                statusText = 'I Zgjidhur';
                statusClass = 'resolved';
                break;
            default:
                statusText = status || 'N/A';
                statusClass = 'pending';
        }
        
        return `<span class="status-badge ${statusClass}">${statusText}</span>`;
    }
    
    /**
     * Format category to a readable string with badge
     */
    function formatCategory(category) {
        let categoryText = '';
        let categoryClass = '';
        
        switch (category) {
            case 'infrastructure':
                categoryText = 'Infrastrukturë';
                categoryClass = 'infrastructure';
                break;
            case 'environment':
                categoryText = 'Mjedis';
                categoryClass = 'environment';
                break;
            case 'public-services':
                categoryText = 'Shërbime Publike';
                categoryClass = 'public-services';
                break;
            case 'community':
                categoryText = 'Komunitet';
                categoryClass = 'community';
                break;
            default:
                categoryText = category || 'N/A';
                categoryClass = 'infrastructure';
        }
        
        return `<span class="category-badge ${categoryClass}">${categoryText}</span>`;
    }
    
    /**
     * Format role to a readable string with badge
     */
    function formatRole(role) {
        let roleText = '';
        let roleClass = '';
        
        switch (role) {
            case 'admin':
                roleText = 'Administrator';
                roleClass = 'admin';
                break;
            case 'user':
                roleText = 'Përdorues';
                roleClass = 'user';
                break;
            default:
                roleText = role || 'N/A';
                roleClass = 'user';
        }
        
        return `<span class="role-badge ${roleClass}">${roleText}</span>`;
    }
    
    /**
     * Format neighborhood to a readable string
     */
    function formatNeighborhood(neighborhood) {
        if (!neighborhood) return 'N/A';
        
        // Replace hyphens with spaces and capitalize first letter of each word
        return neighborhood
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    
    /**
     * Truncate text to a specified length
     */
    function truncateText(text, maxLength = 50) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        
        return text.substring(0, maxLength) + '...';
    }
    
    /**
     * Show confirmation modal
     */
    function showConfirmationModal(title, message, onConfirm) {
        const modal = document.getElementById('confirmation-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalMessage = document.getElementById('modal-message');
        const confirmBtn = document.getElementById('modal-confirm');
        const cancelBtn = document.getElementById('modal-cancel');
        const closeBtn = modal.querySelector('.close-modal');
        
        if (!modal || !modalTitle || !modalMessage || !confirmBtn || !cancelBtn) {
            console.error('Confirmation modal elements not found');
            return;
        }
        
        // Set modal content
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        
        // Show modal
        modal.style.display = 'block';
        
        // Handle confirm button
        const confirmHandler = function() {
            onConfirm();
            modal.style.display = 'none';
            confirmBtn.removeEventListener('click', confirmHandler);
        };
        
        confirmBtn.addEventListener('click', confirmHandler);
        
        // Handle cancel and close buttons
        const closeHandler = function() {
            modal.style.display = 'none';
            confirmBtn.removeEventListener('click', confirmHandler);
        };
        
        cancelBtn.addEventListener('click', closeHandler);
        closeBtn.addEventListener('click', closeHandler);
        
        // Close when clicking outside
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeHandler();
            }
        });
    }
    
    /**
     * Show success notification
     */
    function showSuccessNotification(message = 'Veprimi u krye me sukses!') {
        const notification = document.getElementById('success-notification');
        if (!notification) return;
        
        // Set message
        const messageElement = notification.querySelector('.success-message');
        if (messageElement) {
            messageElement.textContent = message;
        }
        
        // Show notification
        notification.classList.add('show');
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    /**
     * Export table data to CSV
     */
    function exportTableToCSV(tableId, filename) {
        const table = document.getElementById(tableId);
        if (!table) {
            console.error(`Table with ID ${tableId} not found`);
            return;
        }
        
        // Get headers
        const headers = [];
        const headerCells = table.querySelectorAll('thead th');
        headerCells.forEach(cell => {
            headers.push(cell.textContent.trim());
        });
        
        // Get rows
        const rows = [];
        const rowElements = table.querySelectorAll('tbody tr');
        rowElements.forEach(row => {
            if (row.classList.contains('loading-row')) return;
            
            const rowData = [];
            const cells = row.querySelectorAll('td');
            cells.forEach((cell, index) => {
                // Skip the actions column (usually the last column)
                if (index === cells.length - 1 && cell.classList.contains('table-actions-cell')) {
                    return;
                }
                
                // Get text content without HTML
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = cell.innerHTML;
                rowData.push(tempDiv.textContent.trim());
            });
            
            rows.push(rowData);
        });
        
        // Create CSV content
        let csvContent = headers.join(',') + '\\n';
        rows.forEach(row => {
            csvContent += row.join(',') + '\\n';
        });
        
        // Create download link
        const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', filename || 'export.csv');
        document.body.appendChild(link);
        
        // Trigger download
        link.click();
        
        // Clean up
        document.body.removeChild(link);
    }
    
    /**
     * Check if user is admin
     */
    async function checkAdminAccess() {
        try {
            // Initialize auth store
            await AuthStore.initialize();
            
            // Check if user is logged in
            if (!AuthStore.isLoggedIn()) {
                window.location.href = '../../html/login.html?redirect=' + encodeURIComponent(window.location.href);
                return false;
            }
            
            // Get current user
            const currentUser = AuthStore.getCurrentUser();
            
            // Check if user is admin
            if (!currentUser || currentUser.role !== 'admin') {
                alert('Ju nuk keni akses në këtë faqe. Ju lutemi kontaktoni administratorin.');
                window.location.href = '../../index.html';
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Error checking admin access:', error);
            alert('Ndodhi një gabim gjatë kontrollit të aksesit. Ju lutemi provoni përsëri.');
            window.location.href = '../../index.html';
            return false;
        }
    }
    
    // Public API
    return {
        formatDate,
        formatStatus,
        formatCategory,
        formatRole,
        formatNeighborhood,
        truncateText,
        showConfirmationModal,
        showSuccessNotification,
        exportTableToCSV,
        checkAdminAccess
    };
})();
