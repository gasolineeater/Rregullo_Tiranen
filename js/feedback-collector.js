/**
 * Feedback Collector for Rregullo Tiranen
 * Implements a simple feedback collection mechanism for mobile features
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize feedback collector
    initFeedbackCollector();
});

/**
 * Initialize feedback collector
 */
function initFeedbackCollector() {
    // Create feedback button
    createFeedbackButton();
    
    // Create feedback form
    createFeedbackForm();
    
    // Add event listeners
    addEventListeners();
}

/**
 * Create feedback button
 */
function createFeedbackButton() {
    // Check if feedback button already exists
    if (document.querySelector('.feedback-button')) {
        return;
    }
    
    // Create button
    const feedbackButton = document.createElement('button');
    feedbackButton.className = 'feedback-button';
    feedbackButton.setAttribute('aria-label', 'Jep reagim');
    feedbackButton.innerHTML = `
        <span class="feedback-icon">💬</span>
        <span class="feedback-text">Reagim</span>
    `;
    
    // Add to document
    document.body.appendChild(feedbackButton);
    
    // Add styles
    addStyles(`
        .feedback-button {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: var(--color-primary, #C41E3A);
            color: white;
            border: none;
            border-radius: 50px;
            padding: 10px 20px;
            font-size: 14px;
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            cursor: pointer;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .feedback-button:hover, .feedback-button:focus {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }
        
        .feedback-button:active {
            transform: translateY(0);
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        }
        
        .feedback-icon {
            font-size: 18px;
        }
        
        @media (max-width: 768px) {
            .feedback-button {
                padding: 10px;
            }
            
            .feedback-text {
                display: none;
            }
        }
        
        /* Dark theme styles */
        :root.dark-theme .feedback-button {
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
        }
        
        :root.dark-theme .feedback-button:hover, :root.dark-theme .feedback-button:focus {
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
        }
    `);
}

/**
 * Create feedback form
 */
function createFeedbackForm() {
    // Check if feedback form already exists
    if (document.querySelector('.feedback-form')) {
        return;
    }
    
    // Create form
    const feedbackForm = document.createElement('div');
    feedbackForm.className = 'feedback-form';
    feedbackForm.setAttribute('aria-hidden', 'true');
    feedbackForm.innerHTML = `
        <div class="feedback-form-content">
            <div class="feedback-form-header">
                <h2>Jep reagim</h2>
                <button class="feedback-form-close" aria-label="Mbyll">&times;</button>
            </div>
            <div class="feedback-form-body">
                <form id="mobile-feedback-form">
                    <div class="feedback-form-field">
                        <label for="feedback-type">Lloji i reagimit</label>
                        <select id="feedback-type" name="feedback-type" required>
                            <option value="">Zgjidhni një opsion</option>
                            <option value="bug">Problem teknik</option>
                            <option value="feature">Kërkesë për veçori</option>
                            <option value="usability">Problem përdorimi</option>
                            <option value="performance">Problem performance</option>
                            <option value="other">Tjetër</option>
                        </select>
                    </div>
                    <div class="feedback-form-field">
                        <label for="feedback-feature">Veçoria</label>
                        <select id="feedback-feature" name="feedback-feature" required>
                            <option value="">Zgjidhni një opsion</option>
                            <option value="swipe">Gjestet e rrëshqitjes</option>
                            <option value="pinch">Zmadhimi me gishta</option>
                            <option value="haptic">Reagimi haptik</option>
                            <option value="animations">Animacionet</option>
                            <option value="other">Tjetër</option>
                        </select>
                    </div>
                    <div class="feedback-form-field">
                        <label for="feedback-rating">Vlerësimi</label>
                        <div class="rating-container">
                            <input type="radio" id="rating-5" name="feedback-rating" value="5" required>
                            <label for="rating-5">⭐</label>
                            <input type="radio" id="rating-4" name="feedback-rating" value="4">
                            <label for="rating-4">⭐</label>
                            <input type="radio" id="rating-3" name="feedback-rating" value="3">
                            <label for="rating-3">⭐</label>
                            <input type="radio" id="rating-2" name="feedback-rating" value="2">
                            <label for="rating-2">⭐</label>
                            <input type="radio" id="rating-1" name="feedback-rating" value="1">
                            <label for="rating-1">⭐</label>
                        </div>
                    </div>
                    <div class="feedback-form-field">
                        <label for="feedback-description">Përshkrimi</label>
                        <textarea id="feedback-description" name="feedback-description" rows="4" required placeholder="Përshkruani reagimin tuaj këtu..."></textarea>
                    </div>
                    <div class="feedback-form-field">
                        <label for="feedback-email">Email (opsionale)</label>
                        <input type="email" id="feedback-email" name="feedback-email" placeholder="email@shembull.com">
                    </div>
                    <div class="feedback-form-actions">
                        <button type="button" class="btn btn-secondary feedback-cancel">Anulo</button>
                        <button type="submit" class="btn btn-primary feedback-submit">Dërgo</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(feedbackForm);
    
    // Add styles
    addStyles(`
        .feedback-form {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1001;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s ease;
        }
        
        .feedback-form.active {
            opacity: 1;
            visibility: visible;
        }
        
        .feedback-form-content {
            background-color: var(--color-card-bg, #FFFFFF);
            border-radius: 8px;
            width: 90%;
            max-width: 500px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }
        
        .feedback-form-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px;
            border-bottom: 1px solid var(--color-border, #E0E0E0);
        }
        
        .feedback-form-header h2 {
            margin: 0;
            font-size: 18px;
            color: var(--color-text, #333333);
        }
        
        .feedback-form-close {
            background: none;
            border: none;
            font-size: 24px;
            color: var(--color-text-light, #666666);
            cursor: pointer;
        }
        
        .feedback-form-body {
            padding: 20px;
        }
        
        .feedback-form-field {
            margin-bottom: 15px;
        }
        
        .feedback-form-field label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
            color: var(--color-text, #333333);
        }
        
        .feedback-form-field input,
        .feedback-form-field select,
        .feedback-form-field textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid var(--color-border, #E0E0E0);
            border-radius: 4px;
            font-size: 14px;
        }
        
        .feedback-form-field textarea {
            resize: vertical;
        }
        
        .rating-container {
            display: flex;
            flex-direction: row-reverse;
            justify-content: flex-end;
        }
        
        .rating-container input {
            display: none;
        }
        
        .rating-container label {
            font-size: 24px;
            color: #ccc;
            cursor: pointer;
            margin-right: 5px;
        }
        
        .rating-container label:hover,
        .rating-container label:hover ~ label,
        .rating-container input:checked ~ label {
            color: #FFD700;
        }
        
        .feedback-form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 20px;
        }
        
        /* Dark theme styles */
        :root.dark-theme .feedback-form-content {
            background-color: var(--color-card-bg-dark, #1E1E1E);
        }
        
        :root.dark-theme .feedback-form-header {
            border-bottom-color: var(--color-border-dark, #333333);
        }
        
        :root.dark-theme .feedback-form-header h2 {
            color: var(--color-text-dark, #E0E0E0);
        }
        
        :root.dark-theme .feedback-form-close {
            color: var(--color-text-light-dark, #AAAAAA);
        }
        
        :root.dark-theme .feedback-form-field label {
            color: var(--color-text-dark, #E0E0E0);
        }
        
        :root.dark-theme .feedback-form-field input,
        :root.dark-theme .feedback-form-field select,
        :root.dark-theme .feedback-form-field textarea {
            background-color: var(--color-card-bg-dark, #1E1E1E);
            border-color: var(--color-border-dark, #333333);
            color: var(--color-text-dark, #E0E0E0);
        }
    `);
}

/**
 * Add event listeners
 */
function addEventListeners() {
    // Feedback button click
    const feedbackButton = document.querySelector('.feedback-button');
    if (feedbackButton) {
        feedbackButton.addEventListener('click', function() {
            openFeedbackForm();
        });
    }
    
    // Feedback form close
    const feedbackFormClose = document.querySelector('.feedback-form-close');
    if (feedbackFormClose) {
        feedbackFormClose.addEventListener('click', function() {
            closeFeedbackForm();
        });
    }
    
    // Feedback cancel button
    const feedbackCancel = document.querySelector('.feedback-cancel');
    if (feedbackCancel) {
        feedbackCancel.addEventListener('click', function() {
            closeFeedbackForm();
        });
    }
    
    // Feedback form submit
    const feedbackForm = document.querySelector('#mobile-feedback-form');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', function(event) {
            event.preventDefault();
            submitFeedback();
        });
    }
    
    // Close form when clicking outside
    const feedbackFormContainer = document.querySelector('.feedback-form');
    if (feedbackFormContainer) {
        feedbackFormContainer.addEventListener('click', function(event) {
            if (event.target === feedbackFormContainer) {
                closeFeedbackForm();
            }
        });
    }
    
    // Close form with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeFeedbackForm();
        }
    });
}

/**
 * Open feedback form
 */
function openFeedbackForm() {
    const feedbackForm = document.querySelector('.feedback-form');
    if (feedbackForm) {
        feedbackForm.classList.add('active');
        feedbackForm.setAttribute('aria-hidden', 'false');
        
        // Focus first field
        setTimeout(function() {
            const firstField = feedbackForm.querySelector('select, input, textarea');
            if (firstField) {
                firstField.focus();
            }
        }, 100);
        
        // Add device information
        addDeviceInformation();
    }
}

/**
 * Close feedback form
 */
function closeFeedbackForm() {
    const feedbackForm = document.querySelector('.feedback-form');
    if (feedbackForm) {
        feedbackForm.classList.remove('active');
        feedbackForm.setAttribute('aria-hidden', 'true');
    }
}

/**
 * Add device information
 */
function addDeviceInformation() {
    // Get device information
    const deviceInfo = {
        userAgent: navigator.userAgent,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        devicePixelRatio: window.devicePixelRatio,
        platform: navigator.platform,
        language: navigator.language,
        cookiesEnabled: navigator.cookieEnabled,
        touchPoints: navigator.maxTouchPoints,
        orientation: window.screen.orientation ? window.screen.orientation.type : '',
        connectionType: navigator.connection ? navigator.connection.effectiveType : 'unknown'
    };
    
    // Add to form as hidden fields
    const form = document.querySelector('#mobile-feedback-form');
    if (form) {
        // Remove existing device info fields
        const existingFields = form.querySelectorAll('.device-info-field');
        existingFields.forEach(field => field.remove());
        
        // Add device info fields
        Object.entries(deviceInfo).forEach(([key, value]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = `device-${key}`;
            input.value = value;
            input.className = 'device-info-field';
            form.appendChild(input);
        });
    }
}

/**
 * Submit feedback
 */
function submitFeedback() {
    // Get form data
    const form = document.querySelector('#mobile-feedback-form');
    if (!form) {
        return;
    }
    
    const formData = new FormData(form);
    const feedbackData = {};
    
    // Convert FormData to object
    for (const [key, value] of formData.entries()) {
        feedbackData[key] = value;
    }
    
    // Add timestamp
    feedbackData.timestamp = new Date().toISOString();
    
    // Add page URL
    feedbackData.pageUrl = window.location.href;
    
    // Log feedback data
    console.log('Feedback submitted:', feedbackData);
    
    // Store feedback in localStorage
    storeFeedback(feedbackData);
    
    // Show success message
    showSuccessMessage();
    
    // Reset form
    form.reset();
    
    // Close form after delay
    setTimeout(function() {
        closeFeedbackForm();
    }, 3000);
}

/**
 * Store feedback in localStorage
 * @param {Object} feedbackData - Feedback data
 */
function storeFeedback(feedbackData) {
    // Get existing feedback
    const existingFeedback = JSON.parse(localStorage.getItem('mobileFeedback') || '[]');
    
    // Add new feedback
    existingFeedback.push(feedbackData);
    
    // Store feedback
    localStorage.setItem('mobileFeedback', JSON.stringify(existingFeedback));
}

/**
 * Show success message
 */
function showSuccessMessage() {
    // Create success message
    const successMessage = document.createElement('div');
    successMessage.className = 'feedback-success-message';
    successMessage.innerHTML = `
        <div class="feedback-success-icon">✓</div>
        <div class="feedback-success-text">
            <h3>Faleminderit për reagimin tuaj!</h3>
            <p>Reagimi juaj do të na ndihmojë të përmirësojmë aplikacionin.</p>
        </div>
    `;
    
    // Add to form
    const formBody = document.querySelector('.feedback-form-body');
    if (formBody) {
        // Hide form
        const form = formBody.querySelector('form');
        if (form) {
            form.style.display = 'none';
        }
        
        // Add success message
        formBody.appendChild(successMessage);
        
        // Add styles
        addStyles(`
            .feedback-success-message {
                text-align: center;
                padding: 20px;
            }
            
            .feedback-success-icon {
                font-size: 48px;
                color: var(--color-success, #27AE60);
                margin-bottom: 20px;
            }
            
            .feedback-success-text h3 {
                margin: 0 0 10px 0;
                color: var(--color-text, #333333);
            }
            
            .feedback-success-text p {
                margin: 0;
                color: var(--color-text-light, #666666);
            }
            
            /* Dark theme styles */
            :root.dark-theme .feedback-success-text h3 {
                color: var(--color-text-dark, #E0E0E0);
            }
            
            :root.dark-theme .feedback-success-text p {
                color: var(--color-text-light-dark, #AAAAAA);
            }
        `);
    }
}

/**
 * Add styles to document
 * @param {string} css - CSS styles
 */
function addStyles(css) {
    // Check if styles already exist
    if (document.getElementById('feedback-collector-styles')) {
        // Append to existing styles
        document.getElementById('feedback-collector-styles').textContent += css;
        return;
    }
    
    // Create style element
    const style = document.createElement('style');
    style.id = 'feedback-collector-styles';
    style.textContent = css;
    
    // Add to document
    document.head.appendChild(style);
}
