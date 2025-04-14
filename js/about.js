/**
 * About Page JavaScript for Rregullo Tiranen
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize contact form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();

            // Get form data
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            // Simple validation
            if (!name || !email || !message) {
                alert('Ju lutemi plotësoni të gjitha fushat.');
                return;
            }

            // Get form data
            const formData = {
                name: name,
                email: email,
                message: message
            };

            // Get submit button
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;

            // Disable button and show loading state
            submitButton.disabled = true;
            submitButton.textContent = 'Duke dërguar...';

            try {
                // Submit form using API service
                const response = await ApiService.submitContactForm(formData);

                if (response.success) {
                    // Show success message
                    alert('Faleminderit për mesazhin tuaj! Do t\'ju kontaktojmë së shpejti.');

                    // Reset form
                    contactForm.reset();
                } else {
                    // Show error message
                    alert(`Gabim: ${response.message || 'Ndodhi një gabim gjatë dërgimit të formularit.'}`);
                }
            } catch (error) {
                // Show error message
                console.error('Error submitting contact form:', error);
                alert('Ndodhi një gabim gjatë dërgimit të formularit. Ju lutemi provoni përsëri.');
            } finally {
                // Reset button
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        });
    }

    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
