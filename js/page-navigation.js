/**
 * Page Navigation for Rregullo Tiranen
 * Handles highlighting active sections in the navigation
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize page navigation
    initPageNavigation();

    // Add smooth scrolling for anchor links
    addSmoothScrolling();
});

/**
 * Initialize page navigation
 */
function initPageNavigation() {
    // Get all sections with IDs
    const sections = document.querySelectorAll('section[id]');

    // Get all navigation links
    const navLinks = document.querySelectorAll('.page-navigation a');

    // If there are no sections or navigation links, return
    if (!sections.length || !navLinks.length) return;

    // Add scroll event listener
    window.addEventListener('scroll', function() {
        // Get current scroll position
        const scrollPosition = window.scrollY + 100; // Add offset for better UX

        // Loop through sections to find the current active section
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                // Remove active class from all links
                navLinks.forEach(link => {
                    link.classList.remove('active');
                });

                // Add active class to current link
                const currentLink = document.querySelector(`.page-navigation a[href="#${sectionId}"]`);
                if (currentLink) {
                    currentLink.classList.add('active');
                }
            }
        });
    });

    // Trigger scroll event on page load
    window.dispatchEvent(new Event('scroll'));
}

/**
 * Add smooth scrolling for anchor links
 */
function addSmoothScrolling() {
    // Get all anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    // Add click event listener to each anchor link
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Get the target element
            const targetId = this.getAttribute('href');

            // If the target is just "#", do nothing
            if (targetId === '#') return;

            // Get the target element
            const targetElement = document.querySelector(targetId);

            // If the target element exists, scroll to it
            if (targetElement) {
                e.preventDefault();

                // Scroll to the target element
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Update URL hash without scrolling
                history.pushState(null, null, targetId);

                // Update active class
                const navLinks = document.querySelectorAll('.page-navigation a');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                });
                this.classList.add('active');
            }
        });
    });
}
