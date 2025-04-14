/**
 * Authentication functionality for Rregullo Tiranen
 * Handles login, registration, and password management
 */

document.addEventListener('DOMContentLoaded', async function() {
    console.log('Auth page initialized');

    // Show loading indicator
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = '<div class="loading-spinner"></div><p>Duke ngarkuar...</p>';
    document.body.appendChild(loadingOverlay);

    try {
        // Initialize auth store
        await AuthStore.initialize();

        // Check if user is already logged in
        const isLoggedIn = await AuthStore.isLoggedIn();
        if (isLoggedIn) {
            // Redirect to profile page if on login or register page
            const currentPath = window.location.pathname;
            if (currentPath.includes('login.html') || currentPath.includes('register.html')) {
                window.location.href = 'profile.html';
                return;
            }
        }
    } catch (error) {
        console.error('Error initializing auth:', error);
    } finally {
        // Remove loading overlay
        document.body.removeChild(loadingOverlay);
    }

    // Login form handling
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember').checked;

            // Show loading indicator
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Duke u identifikuar...';

            const messageElement = document.getElementById('login-message');

            try {
                const result = await AuthStore.loginUser(email, password, remember);

                if (result.success) {
                    messageElement.textContent = result.message;
                    messageElement.className = 'auth-message success';

                    // Get return URL from query parameters if it exists
                    const urlParams = new URLSearchParams(window.location.search);
                    const returnUrl = urlParams.get('returnUrl');

                    // Redirect to return URL or homepage after successful login
                    setTimeout(() => {
                        if (returnUrl) {
                            window.location.href = returnUrl;
                        } else {
                            window.location.href = '../index.html';
                        }
                    }, 1500);
                } else {
                    messageElement.textContent = result.message;
                    messageElement.className = 'auth-message error';
                }
            } catch (error) {
                console.error('Login error:', error);
                messageElement.textContent = 'Ndodhi një gabim gjatë hyrjes. Ju lutemi provoni përsëri.';
                messageElement.className = 'auth-message error';
            } finally {
                // Reset button state
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    }

    // Registration form handling
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirm-password');
        const strengthBar = document.getElementById('strength-bar');
        const strengthText = document.getElementById('strength-text');

        // Password strength meter
        if (passwordInput) {
            passwordInput.addEventListener('input', function() {
                const password = this.value;
                const strength = checkPasswordStrength(password);

                // Update strength bar
                strengthBar.className = 'strength-bar';
                if (password.length > 0) {
                    strengthBar.classList.add(strength.className);
                }

                // Update strength text
                strengthText.textContent = strength.message;
            });
        }

        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const fullname = document.getElementById('fullname').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            const termsAccepted = document.getElementById('terms').checked;

            const messageElement = document.getElementById('register-message');

            // Validate form
            if (password !== confirmPassword) {
                messageElement.textContent = 'Fjalëkalimet nuk përputhen.';
                messageElement.className = 'auth-message error';
                return;
            }

            if (!termsAccepted) {
                messageElement.textContent = 'Ju duhet të pranoni kushtet e përdorimit.';
                messageElement.className = 'auth-message error';
                return;
            }

            const strength = checkPasswordStrength(password);
            if (strength.score < 2) {
                messageElement.textContent = 'Fjalëkalimi është shumë i dobët. ' + strength.message;
                messageElement.className = 'auth-message error';
                return;
            }

            // Show loading indicator
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Duke regjistruar...';

            try {
                // Register user
                const result = await AuthStore.registerUser({
                    fullname,
                    email,
                    phone,
                    password
                });

                if (result.success) {
                    messageElement.textContent = result.message;
                    messageElement.className = 'auth-message success';

                    // Automatically log in the user
                    try {
                        await AuthStore.loginUser(email, password);
                    } catch (loginError) {
                        console.error('Error logging in after registration:', loginError);
                    }

                    // Get return URL from query parameters if it exists
                    const urlParams = new URLSearchParams(window.location.search);
                    const returnUrl = urlParams.get('returnUrl');

                    // Redirect to return URL or homepage after successful registration
                    setTimeout(() => {
                        if (returnUrl) {
                            window.location.href = returnUrl;
                        } else {
                            window.location.href = '../index.html';
                        }
                    }, 1500);
                } else {
                    messageElement.textContent = result.message;
                    messageElement.className = 'auth-message error';
                }
            } catch (error) {
                console.error('Registration error:', error);
                messageElement.textContent = 'Ndodhi një gabim gjatë regjistrimit. Ju lutemi provoni përsëri.';
                messageElement.className = 'auth-message error';
            } finally {
                // Reset button state
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    }

    // Toggle password visibility
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function() {
            const passwordField = this.parentElement.querySelector('input');
            const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordField.setAttribute('type', type);

            // Change the eye icon (optional)
            const eyeIcon = this.querySelector('.eye-icon');
            eyeIcon.style.opacity = type === 'password' ? '0.7' : '1';
        });
    });
});

/**
 * Check password strength
 * @param {string} password - The password to check
 * @returns {Object} - Strength score, class name, and message
 */
function checkPasswordStrength(password) {
    // Initialize score
    let score = 0;

    // Check length
    if (password.length < 8) {
        return {
            score: 0,
            className: 'weak',
            message: 'Fjalëkalimi duhet të ketë të paktën 8 karaktere'
        };
    } else {
        score += 1;
    }

    // Check for lowercase letters
    if (/[a-z]/.test(password)) {
        score += 1;
    }

    // Check for uppercase letters
    if (/[A-Z]/.test(password)) {
        score += 1;
    }

    // Check for numbers
    if (/\d/.test(password)) {
        score += 1;
    }

    // Check for special characters
    if (/[^a-zA-Z0-9]/.test(password)) {
        score += 1;
    }

    // Return result based on score
    if (score < 2) {
        return {
            score,
            className: 'weak',
            message: 'Fjalëkalim i dobët - shtoni shkronja të mëdha, numra ose simbole'
        };
    } else if (score < 3) {
        return {
            score,
            className: 'medium',
            message: 'Fjalëkalim mesatar - shtoni shkronja të mëdha, numra ose simbole'
        };
    } else if (score < 5) {
        return {
            score,
            className: 'strong',
            message: 'Fjalëkalim i fortë'
        };
    } else {
        return {
            score,
            className: 'very-strong',
            message: 'Fjalëkalim shumë i fortë'
        };
    }
}
