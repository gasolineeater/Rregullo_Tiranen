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
});