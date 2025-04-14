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

                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New content is available, show update notification
                            showUpdateNotification();
                        }
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

        // Check for offline status
        window.addEventListener('offline', showOfflineNotification);
        window.addEventListener('online', hideOfflineNotification);

        // Initial check
        if (!navigator.onLine) {
            showOfflineNotification();
        }
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

        // Show the button after a delay to not overwhelm the user
        setTimeout(() => {
            if (addToHomeBtn && !isAppInstalled()) {
                addToHomeBtn.style.display = 'block';

                // Hide after 10 seconds if not interacted with
                setTimeout(() => {
                    if (addToHomeBtn.style.display === 'block') {
                        addToHomeBtn.style.display = 'none';
                    }
                }, 10000);
            }
        }, 5000);

        // Add click event listener
        if (addToHomeBtn) {
            // Remove any existing listeners to prevent duplicates
            const newBtn = addToHomeBtn.cloneNode(true);
            addToHomeBtn.parentNode.replaceChild(newBtn, addToHomeBtn);

            newBtn.addEventListener('click', () => {
                // Show the install prompt
                deferredPrompt.prompt();

                // Wait for the user to respond to the prompt
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the install prompt');
                        // Hide the button after installation
                        newBtn.style.display = 'none';
                        // Show installation success message
                        showInstallationSuccess();
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
        // Show installation success message
        showInstallationSuccess();

        // Save installation status in localStorage
        localStorage.setItem('appInstalled', 'true');
    });

    // Check if the app is in standalone mode (installed)
    if (isAppInstalled()) {
        console.log('App is running in standalone mode');
        // Add special behavior for installed app
        document.body.classList.add('app-installed');
    }
});

// Function to check if app is installed
function isAppInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true ||
           localStorage.getItem('appInstalled') === 'true';
}

// Function to show offline notification
function showOfflineNotification() {
    let offlineIndicator = document.getElementById('offline-indicator');

    if (!offlineIndicator) {
        offlineIndicator = document.createElement('div');
        offlineIndicator.id = 'offline-indicator';
        offlineIndicator.className = 'offline-indicator';
        offlineIndicator.textContent = 'Ju jeni offline. Disa funksione mund të mos jenë të disponueshme.';
        document.body.appendChild(offlineIndicator);
    }

    offlineIndicator.style.display = 'block';
}

// Function to hide offline notification
function hideOfflineNotification() {
    const offlineIndicator = document.getElementById('offline-indicator');
    if (offlineIndicator) {
        offlineIndicator.style.display = 'none';
    }
}

// Function to show update notification
function showUpdateNotification() {
    // Create update notification if it doesn't exist
    let updateNotification = document.getElementById('update-notification');

    if (!updateNotification) {
        updateNotification = document.createElement('div');
        updateNotification.id = 'update-notification';
        updateNotification.className = 'app-installed-banner';
        updateNotification.innerHTML = 'Një version i ri është i disponueshëm. <button id="update-app" class="btn btn-primary">Përditëso</button>';
        document.body.appendChild(updateNotification);

        // Add click event listener to update button
        document.getElementById('update-app').addEventListener('click', () => {
            // Skip waiting on the service worker
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
            }

            // Hide notification
            updateNotification.style.display = 'none';

            // Reload the page to apply updates
            window.location.reload();
        });

        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (updateNotification.parentNode) {
                updateNotification.style.display = 'none';
            }
        }, 10000);
    }
}

// Function to show installation success message
function showInstallationSuccess() {
    let successBanner = document.getElementById('installation-success');

    if (!successBanner) {
        successBanner = document.createElement('div');
        successBanner.id = 'installation-success';
        successBanner.className = 'app-installed-banner';
        successBanner.textContent = 'Aplikacioni u shtua me sukses në ekranin kryesor!';
        document.body.appendChild(successBanner);
    }

    successBanner.style.display = 'block';

    // Auto-hide after 5 seconds
    setTimeout(() => {
        successBanner.style.display = 'none';
    }, 5000);
}
