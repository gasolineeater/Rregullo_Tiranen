document.addEventListener('DOMContentLoaded', function() {
    console.log('Report form initialized');
    
    const reportForm = document.getElementById('issue-report-form');
    const photoInput = document.getElementById('issue-photos');
    const photoPreview = document.getElementById('photo-preview');
    const anonymousCheckbox = document.getElementById('reporter-anonymous');
    const reporterNameField = document.getElementById('reporter-name');
    const reporterEmailField = document.getElementById('reporter-email');
    
    if (reportForm) {
        reportForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(reportForm);
            
            console.log('Form submitted with the following data:');
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }
            
            alert('Faleminderit për raportimin! Problemi juaj është regjistruar dhe do të shqyrtohet së shpejti.');
            
            reportForm.reset();
            photoPreview.innerHTML = '';
        });
    }
    
    if (photoInput) {
        photoInput.addEventListener('change', function() {
            photoPreview.innerHTML = '';
            
            if (this.files) {
                Array.from(this.files).forEach(file => {
                    if (!file.type.match('image.*')) {
                        return;
                    }
                    
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        img.alt = 'Photo preview';
                        photoPreview.appendChild(img);
                    };
                    
                    reader.readAsDataURL(file);
                });
            }
        });
    }
    
    if (anonymousCheckbox) {
        toggleReporterFields();
        
        anonymousCheckbox.addEventListener('change', toggleReporterFields);
        
        function toggleReporterFields() {
            const isAnonymous = anonymousCheckbox.checked;
            
            reporterNameField.disabled = isAnonymous;
            reporterEmailField.disabled = isAnonymous;
            
            if (isAnonymous) {
                reporterNameField.value = '';
                reporterEmailField.value = '';
                reporterNameField.parentElement.classList.add('disabled-field');
                reporterEmailField.parentElement.classList.add('disabled-field');
            } else {
                reporterNameField.parentElement.classList.remove('disabled-field');
                reporterEmailField.parentElement.classList.remove('disabled-field');
            }
        }
    }
    
    const reportMap = document.getElementById('report-map');
    const selectedCoordinates = document.getElementById('selected-coordinates');
    const latInput = document.getElementById('location-lat');
    const lngInput = document.getElementById('location-lng');
    
    if (reportMap) {
        reportMap.addEventListener('click', function(e) {
            const lat = 41.3275 + (Math.random() * 0.05 - 0.025);
            const lng = 19.8187 + (Math.random() * 0.05 - 0.025);
            
            latInput.value = lat.toFixed(6);
            lngInput.value = lng.toFixed(6);
            
            selectedCoordinates.textContent = `Vendndodhja e zgjedhur: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            
            console.log(`Selected location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        });
        
        reportMap.querySelector('.map-placeholder').textContent = 
            'Kliko këtu për të simuluar zgjedhjen e një vendndodhje (në implementimin e plotë do të shfaqet një hartë e vërtetë)';
    }
});
