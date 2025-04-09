document.addEventListener('DOMContentLoaded', function() {
    console.log('Report form initialized');

    const reportForm = document.getElementById('issue-report-form');
    const photoInput = document.getElementById('issue-photos');
    const photoPreview = document.getElementById('photo-preview');
    const anonymousCheckbox = document.getElementById('reporter-anonymous');
    const reporterNameField = document.getElementById('reporter-name');
    const reporterEmailField = document.getElementById('reporter-email');

    // Category and subcategory handling
    const categorySelect = document.getElementById('issue-category');
    const subcategorySelect = document.getElementById('issue-subcategory');

    // Define subcategories for each main category
    const subcategories = {
        'infrastructure': [
            { value: 'road-damage', label: 'Dëmtime të rrugëve' },
            { value: 'sidewalk-damage', label: 'Dëmtime të trotuareve' },
            { value: 'street-lighting', label: 'Probleme me ndriçimin rrugor' },
            { value: 'public-facilities', label: 'Mirëmbajtje e objekteve publike' },
            { value: 'traffic-signals', label: 'Sinjalistika dhe semaforët' }
        ],
        'environment': [
            { value: 'littering', label: 'Hedhje e mbeturinave dhe depozitim i paligjshëm' },
            { value: 'green-space', label: 'Mirëmbajtje e hapësirave të gjelbërta' },
            { value: 'pollution', label: 'Raportim i ndotjes' },
            { value: 'tree-planting', label: 'Kërkesa për mbjellje pemësh' }
        ],
        'public-services': [
            { value: 'waste-collection', label: 'Probleme me grumbullimin e mbeturinave' },
            { value: 'public-transport', label: 'Probleme me transportin publik' },
            { value: 'water-utilities', label: 'Probleme me ujin dhe shërbimet komunale' },
            { value: 'public-building', label: 'Mirëmbajtje e ndërtesave publike' }
        ],
        'community': [
            { value: 'beautification', label: 'Ide për zbukurimin e lagjes' },
            { value: 'public-safety', label: 'Shqetësime për sigurinë publike' },
            { value: 'accessibility', label: 'Çështje të aksesueshmërisë' },
            { value: 'cultural-preservation', label: 'Nevoja për ruajtjen e trashëgimisë kulturore' }
        ]
    };

    // Update subcategories when main category changes
    if (categorySelect && subcategorySelect) {
        categorySelect.addEventListener('change', function() {
            const selectedCategory = this.value;

            // Clear current options
            subcategorySelect.innerHTML = '';

            if (selectedCategory) {
                // Enable the subcategory select
                subcategorySelect.disabled = false;

                // Add default option
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = 'Zgjidhni një nënkategori';
                defaultOption.disabled = true;
                defaultOption.selected = true;
                subcategorySelect.appendChild(defaultOption);

                // Add options based on selected category
                subcategories[selectedCategory].forEach(subcategory => {
                    const option = document.createElement('option');
                    option.value = subcategory.value;
                    option.textContent = subcategory.label;
                    subcategorySelect.appendChild(option);
                });
            } else {
                // Disable the subcategory select if no category is selected
                subcategorySelect.disabled = true;

                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = 'Zgjidhni fillimisht një kategori';
                defaultOption.disabled = true;
                defaultOption.selected = true;
                subcategorySelect.appendChild(defaultOption);
            }
        });
    }

    if (reportForm) {
        reportForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(reportForm);

            // Convert FormData to a regular object
            const reportData = {};
            for (let [key, value] of formData.entries()) {
                reportData[key] = value;
            }

            // Add coordinates
            reportData.lat = parseFloat(document.getElementById('location-lat').value || 0);
            reportData.lng = parseFloat(document.getElementById('location-lng').value || 0);

            // Validate required fields
            if (!reportData['issue-category'] || !reportData['issue-subcategory'] ||
                !reportData['issue-title'] || !reportData.lat === 0 || reportData.lng === 0) {

                alert('Ju lutemi plotësoni të gjitha fushat e detyrueshme dhe zgjidhni një vendndodhje në hartë.');
                return;
            }

            // Save report to localStorage
            try {
                const savedReport = DataStore.saveReport({
                    category: reportData['issue-category'],
                    subcategory: reportData['issue-subcategory'],
                    type: reportData['issue-type'],
                    title: reportData['issue-title'],
                    description: reportData['issue-description'],
                    address: reportData['location-address'],
                    neighborhood: reportData['location-neighborhood'],
                    lat: reportData.lat,
                    lng: reportData.lng,
                    severity: reportData['issue-severity'],
                    reporter: reportData['reporter-anonymous'] === 'on' ? 'anonymous' : {
                        name: reportData['reporter-name'],
                        email: reportData['reporter-email']
                    }
                });

                console.log('Report saved:', savedReport);

                alert('Faleminderit për raportimin! Problemi juaj është regjistruar dhe do të shqyrtohet së shpejti.');

                // Reset form
                reportForm.reset();
                photoPreview.innerHTML = '';

                // Reset map marker if exists
                if (marker) {
                    marker.remove();
                    marker = null;
                }

                // Reset coordinates display
                document.getElementById('selected-coordinates').textContent = 'Asnjë vendndodhje e zgjedhur';

                // Redirect to homepage after a short delay
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } catch (error) {
                console.error('Error saving report:', error);
                alert('Ndodhi një gabim gjatë ruajtjes së raportit. Ju lutemi provoni përsëri.');
            }
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

    // Map initialization and handling
    const reportMapContainer = document.getElementById('report-map');
    const selectedCoordinates = document.getElementById('selected-coordinates');
    const latInput = document.getElementById('location-lat');
    const lngInput = document.getElementById('location-lng');

    let reportMap;
    let marker;

    if (reportMapContainer) {
        // Initialize the map centered on Tirana
        const tiranaCenterLat = 41.3275;
        const tiranaCenterLng = 19.8187;

        reportMap = L.map('report-map').setView([tiranaCenterLat, tiranaCenterLng], 13);

        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(reportMap);

        // Add click event to the map
        reportMap.on('click', function(e) {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;

            // Update hidden inputs with coordinates
            latInput.value = lat.toFixed(6);
            lngInput.value = lng.toFixed(6);

            // Update the displayed coordinates
            selectedCoordinates.textContent = `Vendndodhja e zgjedhur: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;

            // Add or update marker
            if (marker) {
                marker.setLatLng(e.latlng);
            } else {
                marker = L.marker(e.latlng).addTo(reportMap);
            }

            // Add popup to marker
            marker.bindPopup('<div class="map-marker-popup"><strong>Vendndodhja e zgjedhur</strong>Kliko për të konfirmuar</div>')
                  .openPopup();

            console.log(`Selected location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        });

        // Refresh map when it becomes visible (fixes rendering issues)
        setTimeout(() => {
            reportMap.invalidateSize();
        }, 100);
    }
});
