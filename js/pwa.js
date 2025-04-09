/**
 * PWA functionality for Rregullo Tiranen
 * Handles service worker registration and installation prompts
 */

document.addEventListener('DOMContentLoaded', function() {
    // Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    console.log('Service Worker update found!');
                    
                    newWorker.addEventListener('statechange', () => {
                        console.log('Service Worker state changed:', newWorker.state);
                    });
                });
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
            
        // Handle service worker updates
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('Service Worker controller changed');
        });
    }
    
    // Add to Home Screen functionality
    let deferredPrompt;
    const addToHomeBtn = document.getElementById('add-to-home');
    
    // Hide the button initially
    if (addToHomeBtn) {
        addToHomeBtn.style.display = 'none';
    }
    
    // Capture the install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        
        // Stash the event so it can be triggered later
        deferredPrompt = e;
        
        // Show the button
        if (addToHomeBtn) {
            addToHomeBtn.style.display = 'block';
            
            addToHomeBtn.addEventListener('click', () => {
                // Show the install prompt
                deferredPrompt.prompt();
                
                // Wait for the user to respond to the prompt
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the install prompt');
                        // Hide the button after installation
                        addToHomeBtn.style.display = 'none';
                    } else {
                        console.log('User dismissed the install prompt');
                    }
                    
                    // Clear the saved prompt
                    deferredPrompt = null;
                });
            });
        }
    });
    
    // Handle successful installation
    window.addEventListener('appinstalled', (evt) => {
        console.log('App was installed to the home screen');
        // Hide the button after installation
        if (addToHomeBtn) {
            addToHomeBtn.style.display = 'none';
        }
    });
    
    // Check if the app is in standalone mode (installed)
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
        console.log('App is running in standalone mode');
        // You could add special behavior for installed app here
    }
});
