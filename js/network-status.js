/**
 * Network Status Monitor for Rregullo Tiranen
 * Displays a status indicator when the user goes offline or comes back online
 */

document.addEventListener('DOMContentLoaded', function() {
    // Create network status indicator if it doesn't exist
    if (!document.getElementById('network-status')) {
        const networkStatus = document.createElement('div');
        networkStatus.id = 'network-status';
        networkStatus.className = 'network-status';
        networkStatus.style.display = 'none';
        
        const statusIndicator = document.createElement('span');
        statusIndicator.id = 'status-indicator';
        statusIndicator.className = 'status-indicator';
        
        const statusText = document.createElement('span');
        statusText.id = 'status-text';
        
        networkStatus.appendChild(statusIndicator);
        networkStatus.appendChild(statusText);
        document.body.appendChild(networkStatus);
        
        // Add styles if not already present
        if (!document.getElementById('network-status-styles')) {
            const style = document.createElement('style');
            style.id = 'network-status-styles';
            style.textContent = `
                .network-status {
                    position: fixed;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    padding: 0.75rem 1.5rem;
                    background-color: var(--color-card-bg, #FFFFFF);
                    border-radius: 50px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    z-index: 1000;
                    transition: all 0.3s ease;
                    opacity: 0;
                }
                
                .status-indicator {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background-color: #e74c3c;
                }
                
                .status-indicator.online {
                    background-color: #2ecc71;
                }
                
                /* Dark theme styles */
                :root.dark-theme .network-status {
                    background-color: var(--color-card-bg-dark, #1E1E1E);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Get elements
    const networkStatus = document.getElementById('network-status');
    const statusIndicator = document.getElementById('status-indicator');
    const statusText = document.getElementById('status-text');
    
    // Function to update network status UI
    function updateNetworkStatus() {
        if (navigator.onLine) {
            statusIndicator.classList.add('online');
            statusText.textContent = 'Online';
            
            // Show briefly when coming back online
            networkStatus.style.display = 'flex';
            networkStatus.style.opacity = '1';
            
            // Hide after 3 seconds
            setTimeout(() => {
                networkStatus.style.opacity = '0';
                setTimeout(() => {
                    networkStatus.style.display = 'none';
                }, 300);
            }, 3000);
        } else {
            statusIndicator.classList.remove('online');
            statusText.textContent = 'Offline';
            networkStatus.style.display = 'flex';
            networkStatus.style.opacity = '1';
            
            // Show offline page if user tries to navigate while offline
            document.addEventListener('click', function(e) {
                const link = e.target.closest('a');
                if (link && !navigator.onLine) {
                    // Skip if it's an anchor link or javascript link
                    if (link.getAttribute('href').startsWith('#') || 
                        link.getAttribute('href').startsWith('javascript:')) {
                        return;
                    }
                    
                    // Check if the link is to a cached page
                    if ('caches' in window) {
                        e.preventDefault();
                        
                        const url = new URL(link.href);
                        const path = url.pathname;
                        
                        caches.match(path).then(response => {
                            if (response) {
                                // If cached, allow navigation
                                window.location.href = link.href;
                            } else {
                                // If not cached, show offline message
                                alert('Kjo faqe nuk është e disponueshme offline. Ju lutem lidhuni me internetin për të vazhduar.');
                            }
                        });
                    }
                }
            }, { capture: true });
        }
    }
    
    // Initial check
    updateNetworkStatus();
    
    // Listen for online/offline events
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
});
