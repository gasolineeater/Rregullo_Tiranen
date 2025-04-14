/**
 * Native Sharing for Rregullo Tiranen
 * Implements native sharing capabilities for mobile devices
 */

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize native sharing
    initNativeSharing();
});

/**
 * Initialize native sharing
 */
function initNativeSharing() {
    // Find all share buttons
    const shareButtons = document.querySelectorAll('[data-share]');
    
    // For each share button, add a click event listener
    shareButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get share data
            const shareData = {
                title: button.getAttribute('data-share-title') || document.title,
                text: button.getAttribute('data-share-text') || '',
                url: button.getAttribute('data-share-url') || window.location.href
            };
            
            // If Web Share API is supported, use it
            if (navigator.share) {
                navigator.share(shareData)
                    .then(() => {
                        console.log('Shared successfully');
                    })
                    .catch(error => {
                        console.error('Error sharing:', error);
                        // Fallback to custom share dialog
                        showShareDialog(shareData);
                    });
            } else {
                // Fallback to custom share dialog
                showShareDialog(shareData);
            }
        });
    });
    
    // Add share buttons to report detail pages
    addShareButtonsToReportDetails();
}

/**
 * Show custom share dialog
 * @param {Object} shareData - Share data
 */
function showShareDialog(shareData) {
    // Create dialog if it doesn't exist
    let dialog = document.getElementById('share-dialog');
    
    if (!dialog) {
        dialog = document.createElement('div');
        dialog.id = 'share-dialog';
        dialog.className = 'share-dialog';
        dialog.innerHTML = `
            <div class="share-dialog-content">
                <div class="share-dialog-header">
                    <h3>Ndaj me të tjerët</h3>
                    <button class="share-dialog-close">&times;</button>
                </div>
                <div class="share-dialog-body">
                    <div class="share-options">
                        <a href="#" class="share-option" data-platform="facebook">
                            <span class="share-icon">📘</span>
                            <span class="share-name">Facebook</span>
                        </a>
                        <a href="#" class="share-option" data-platform="twitter">
                            <span class="share-icon">🐦</span>
                            <span class="share-name">Twitter</span>
                        </a>
                        <a href="#" class="share-option" data-platform="whatsapp">
                            <span class="share-icon">📱</span>
                            <span class="share-name">WhatsApp</span>
                        </a>
                        <a href="#" class="share-option" data-platform="email">
                            <span class="share-icon">✉️</span>
                            <span class="share-name">Email</span>
                        </a>
                        <a href="#" class="share-option" data-platform="copy">
                            <span class="share-icon">📋</span>
                            <span class="share-name">Kopjo linkun</span>
                        </a>
                    </div>
                </div>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .share-dialog {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: flex-end;
                justify-content: center;
                z-index: 1000;
                animation: share-dialog-fade-in 0.3s ease;
            }
            
            .share-dialog-content {
                background-color: var(--color-card-bg, #FFFFFF);
                border-radius: 16px 16px 0 0;
                width: 100%;
                max-width: 500px;
                padding: 1.5rem;
                animation: share-dialog-slide-up 0.3s ease;
            }
            
            .share-dialog-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1.5rem;
            }
            
            .share-dialog-header h3 {
                margin: 0;
                font-size: 1.2rem;
                color: var(--color-text, #333333);
            }
            
            .share-dialog-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: var(--color-text-light, #666666);
            }
            
            .share-options {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 1rem;
            }
            
            .share-option {
                display: flex;
                flex-direction: column;
                align-items: center;
                text-decoration: none;
                color: var(--color-text, #333333);
                padding: 0.5rem;
                border-radius: 8px;
                transition: background-color 0.3s ease;
            }
            
            .share-option:hover {
                background-color: rgba(0, 0, 0, 0.05);
            }
            
            .share-icon {
                font-size: 2rem;
                margin-bottom: 0.5rem;
            }
            
            .share-name {
                font-size: 0.8rem;
                text-align: center;
            }
            
            @keyframes share-dialog-fade-in {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }
            
            @keyframes share-dialog-slide-up {
                from {
                    transform: translateY(100%);
                }
                to {
                    transform: translateY(0);
                }
            }
            
            /* Dark theme styles */
            :root.dark-theme .share-dialog-content {
                background-color: var(--color-card-bg-dark, #1E1E1E);
            }
            
            :root.dark-theme .share-dialog-header h3 {
                color: var(--color-text-dark, #E0E0E0);
            }
            
            :root.dark-theme .share-dialog-close {
                color: var(--color-text-light-dark, #AAAAAA);
            }
            
            :root.dark-theme .share-option {
                color: var(--color-text-dark, #E0E0E0);
            }
            
            :root.dark-theme .share-option:hover {
                background-color: rgba(255, 255, 255, 0.05);
            }
            
            /* Mobile styles */
            @media (max-width: 768px) {
                .share-options {
                    grid-template-columns: repeat(3, 1fr);
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(dialog);
        
        // Add event listeners
        dialog.querySelector('.share-dialog-close').addEventListener('click', function() {
            dialog.remove();
        });
        
        // Close dialog when clicking outside
        dialog.addEventListener('click', function(e) {
            if (e.target === dialog) {
                dialog.remove();
            }
        });
        
        // Add event listeners to share options
        const shareOptions = dialog.querySelectorAll('.share-option');
        
        shareOptions.forEach(option => {
            option.addEventListener('click', function(e) {
                e.preventDefault();
                
                const platform = option.getAttribute('data-platform');
                
                switch (platform) {
                    case 'facebook':
                        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}&quote=${encodeURIComponent(shareData.text)}`, '_blank');
                        break;
                    case 'twitter':
                        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`, '_blank');
                        break;
                    case 'whatsapp':
                        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareData.text + ' ' + shareData.url)}`, '_blank');
                        break;
                    case 'email':
                        window.open(`mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(shareData.text + ' ' + shareData.url)}`, '_blank');
                        break;
                    case 'copy':
                        navigator.clipboard.writeText(shareData.url).then(() => {
                            // Show success message
                            const copySuccess = document.createElement('div');
                            copySuccess.className = 'copy-success';
                            copySuccess.textContent = 'Linku u kopjua!';
                            copySuccess.style.cssText = `
                                position: fixed;
                                bottom: 20px;
                                left: 50%;
                                transform: translateX(-50%);
                                background-color: var(--color-success, #27AE60);
                                color: white;
                                padding: 0.5rem 1rem;
                                border-radius: 4px;
                                font-size: 0.9rem;
                                z-index: 1001;
                                animation: fade-in 0.3s ease;
                            `;
                            
                            document.body.appendChild(copySuccess);
                            
                            // Remove after 3 seconds
                            setTimeout(() => {
                                copySuccess.remove();
                            }, 3000);
                        });
                        break;
                }
                
                // Close dialog
                dialog.remove();
            });
        });
    }
}

/**
 * Add share buttons to report detail pages
 */
function addShareButtonsToReportDetails() {
    // Check if we're on a report detail page
    const reportDetailContainer = document.querySelector('.report-detail-container');
    
    if (reportDetailContainer) {
        // Get report title and ID
        const reportTitle = document.querySelector('.report-detail-title')?.textContent || 'Raport';
        const reportId = window.location.pathname.split('/').pop().replace('.html', '');
        
        // Create share button if it doesn't exist
        if (!document.querySelector('.report-share-button')) {
            const shareButton = document.createElement('button');
            shareButton.className = 'btn btn-secondary report-share-button';
            shareButton.setAttribute('data-share', 'true');
            shareButton.setAttribute('data-share-title', `${reportTitle} - Rregullo Tiranen`);
            shareButton.setAttribute('data-share-text', `Shiko raportin "${reportTitle}" në Rregullo Tiranen:`);
            shareButton.innerHTML = '<span class="share-icon">📤</span> Ndaj';
            
            // Add to report actions
            const reportActions = document.querySelector('.report-actions');
            
            if (reportActions) {
                reportActions.appendChild(shareButton);
            } else {
                // Create report actions if they don't exist
                const reportActions = document.createElement('div');
                reportActions.className = 'report-actions';
                reportActions.appendChild(shareButton);
                
                // Add to report detail container
                reportDetailContainer.appendChild(reportActions);
            }
        }
    }
}
