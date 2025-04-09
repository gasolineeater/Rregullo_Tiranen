/**
 * Authentication functionality for Rregullo Tiranen
 * Handles login, registration, and password management
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Auth page initialized');
    
    // Check if user is already logged in
    if (AuthStore.isLoggedIn()) {
        // Redirect to profile page if on login or register page
        const currentPath = window.location.pathname;
        if (currentPath.includes('login.html') || currentPath.includes('register.html')) {
            window.location.href = 'profile.html';
        }
    }
    
    // Login form handling
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember').checked;
            
            const result = AuthStore.loginUser(email, password, remember);
            
            const messageElement = document.getElementById('login-message');
            if (result.success) {
                messageElement.textContent = result.message;
                messageElement.className = 'auth-message success';
                
                // Redirect to homepage after successful login
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 1500);
            } else {
                messageElement.textContent = result.message;
                messageElement.className = 'auth-message error';
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
        
        registerForm.addEventListener('submit', function(e) {
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
            
            // Register user
            const result = AuthStore.registerUser({
                fullname,
                email,
                phone,
                password
            });
            
            if (result.success) {
                messageElement.textContent = result.message;
                messageElement.className = 'auth-message success';
                
                // Automatically log in the user
                AuthStore.loginUser(email, password);
                
                // Redirect to homepage after successful registration
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 1500);
            } else {
                messageElement.textContent = result.message;
                messageElement.className = 'auth-message error';
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
