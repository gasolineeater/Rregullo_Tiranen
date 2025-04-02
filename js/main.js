document.addEventListener('DOMContentLoaded', function() {
    console.log('Rregullo Tiranen application initialized');
    
    const mapContainer = document.getElementById('map-container');
    if (mapContainer) {
        console.log('Map container found, map will be initialized in future updates');
        // Map initialization will go here in future commits
    }
    
    const reportButton = document.querySelector('.btn-primary');
    if (reportButton) {
        reportButton.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Forma e raportimit do të implementohet në përditësimet e ardhshme!');
        });
    }
    
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('.icon');
    const themeLabel = themeToggle.querySelector('.theme-label');
    
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        updateThemeToggle(true);
    }
    
    themeToggle.addEventListener('click', function() {
        const isDarkMode = document.body.classList.toggle('dark-mode');
        
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        
        updateThemeToggle(isDarkMode);
    });
    
    function updateThemeToggle(isDarkMode) {
        if (isDarkMode) {
            themeIcon.textContent = '☀️';
            themeLabel.textContent = 'Tema e Ndritshme';
        } else {
            themeIcon.textContent = '🌓';
            themeLabel.textContent = 'Tema e Errët';
        }
    }
});