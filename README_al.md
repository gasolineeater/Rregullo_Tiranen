# Rregullo Tiranen

Një aplikacion web për raportimin e problemeve urbane në Tiranë, Shqipëri, me veçori të avancuara për celular dhe aftësi të Aplikacionit Web Progresiv (PWA).

## Veçoritë

- Raportimi i problemeve urbane në katër kategori kryesore:
  - Probleme infrastrukture
  - Shqetësime mjedisore
  - Probleme të shërbimeve publike
  - Përmirësime komunitare
- Hartë interaktive për të treguar vendndodhjen e problemeve
- Formular për raportimin e detajuar të problemeve
- Shikimi i të gjitha problemeve të raportuara në hartë
- Filtrimi i problemeve sipas kategorisë, statusit dhe datës
- Aplikacion Web Progresiv (PWA) me aftësi offline
- Veçori të avancuara për celular dhe gjeste me prekje
- Përmirësime të aksesueshmërisë për të gjithë përdoruesit
- Integrim i analizave për gjurmimin e përdorimit
- Sistem i mbledhjes së reagimeve nga përdoruesit

## Teknologjitë

- HTML5, CSS3, JavaScript
- Leaflet.js për harta interaktive
- Local storage për ruajtjen e të dhënave
- Service Workers për funksionalitetin offline
- Web Vitals për monitorimin e performancës
- Intersection Observer API për ngarkimin e vonuar

## Përmirësimet për Celular

Kemi implementuar një set gjithëpërfshirës përmirësimesh për celular për të përmirësuar përvojën e përdoruesit në pajisjet mobile:

### Veçoritë e Aplikacionit Web Progresiv (PWA)

- **Service Worker i Përmirësuar**: Strategji e përmirësuar e ruajtjes për akses offline në burimet kritike
- **Modaliteti Offline**: Faqe gjithëpërfshirëse offline që tregon përmbajtjen e disponueshme të ruajtur
- **Instalimi i Aplikacionit**: Përmirësim i kërkesës për instalim dhe përvojës "Shto në Ekranin Kryesor"
- **Treguesi i Statusit të Rrjetit**: Reagim vizual kur përdoruesi shkon offline ose kthehet online
- **Përditësimet e Aplikacionit**: Sistem njoftimesh kur një version i ri është i disponueshëm

### Optimizimi i Performancës

- **Ndarja e Kodit**: Ngarkimi dinamik i skedarëve JavaScript bazuar në nevojat e faqes aktuale
- **Ngarkuesi i Skripteve**: Ngarkimi me prioritet i skripteve kritike përpara atyre jo-thelbësore
- **Imazhe Responsive**: Ngarkimi i optimizuar i imazheve me dimensionim të duhur dhe ngarkimin e vonuar
- **Prioritizimi i Burimeve**: Optimizimi i ngarkimit të CSS kritike dhe përmbajtjes mbi palosje
- **Monitorimi i Performancës**: Integrim me Web Vitals për gjurmimin e performancës në kohë reale

### Veçoritë Specifike për Celular

- **Gjeste me Rrëshqitje**: Navigim përmes gjesteve me rrëshqitje (majtas/djathtas për navigim, lart/poshtë për lëvizje)
- **Zmadhimi me Gishta**: Funksionalitet i përmirësuar i zmadhimit për hartat me gjeste shumë-prekje
- **Reagim Haptik**: Reagim me dridhje për ndërveprimet me prekje në pajisjet e mbështetura
- **Animacione për Celular**: Animacione dhe tranzicione të optimizuara për ndërfaqet me prekje
- **UI Miqësore për Prekje**: Objektiva më të mëdha për prekje dhe formularë të optimizuar për celular

### Përmirësimet e Aksesueshmërisë

- **Atributet ARIA**: Mbështetje e përmirësuar për lexuesit e ekranit me role dhe etiketa ARIA të duhura
- **Navigimi me Tastierë**: Navigim i përmirësuar me tastierë për të gjithë elementët interaktivë
- **Kalo te Përmbajtja**: Lidhje për të kaluar për përdoruesit e tastierës për të anashkaluar navigimin
- **Modaliteti me Kontrast të Lartë**: Modalitet opsional me kontrast të lartë për përdoruesit me dëmtime vizuale
- **Stilet e Fokusit**: Tregues të përmirësuar të fokusit për navigimin me tastierë
- **Lëvizje e Reduktuar**: Mbështetje për përdoruesit që preferojnë lëvizje të reduktuar

### Integrimi i Analizave

- **Analiza Specifike për Celular**: Gjurmimi i ndërveprimeve dhe sjelljeve specifike për celular
- **Metrika të Performancës**: Mbledhja e Web Vitals dhe metrikave të tjera të performancës
- **Gjurmimi i Udhëtimit të Përdoruesit**: Analiza e rrjedhave dhe modeleve të navigimit të përdoruesit
- **Gjurmimi i Gabimeve**: Monitorimi i gabimeve JavaScript dhe problemeve të rrjetit
- **Informacioni i Pajisjes**: Mbledhja e informacionit të pajisjes dhe shfletuesit për debugging

### Korniza e Testimit të Përdoruesit

- **Mbledhja e Reagimeve**: Mekanizëm brenda aplikacionit për përdoruesit për të dhënë reagime mbi veçoritë mobile
- **Paneli i Administratorit**: Ndërfaqe administrative për shikimin dhe menaxhimin e reagimeve
- **Informacioni i Pajisjes**: Mbledhja automatike e të dhënave të pajisjes me dorëzimet e reagimeve
- **Funksionaliteti i Eksportimit**: Eksportimi CSV i të dhënave të reagimeve për analiza të mëtejshme
- **Filtrimi dhe Kërkimi**: Mjete për filtrimin dhe kërkimin në reagime

## Si të Përdoret

### Për Përdoruesit

1. **Vizitoni Aplikacionin**: Hapni aplikacionin në një shfletues celulari
2. **Instaloni si PWA** (opsionale): Përdorni opsionin "Shto në Ekranin Kryesor" ose kërkesën për instalim
3. **Raportoni Probleme**: Përdorni formularin e raportimit për të dorëzuar probleme urbane
4. **Shikoni Problemet**: Eksploroni hartën për të parë problemet e raportuara
5. **Jepni Reagime**: Përdorni butonin e reagimeve për të ndarë përvojën tuaj

### Për Administratorët

1. **Aksesoni Panelin e Administratorit**: Navigoni te `/admin/index.html`
2. **Shikoni Reagimet**: Kontrolloni panelin e reagimeve te `/admin/feedback-dashboard.html`
3. **Analizoni të Dhënat**: Përdorni mjetet e filtrimit dhe eksportimit për të analizuar reagimet
4. **Menaxhoni Përmbajtjen**: Rishikoni dhe menaxhoni problemet e raportuara

## Aftësitë Offline

Aplikacioni funksionon offline me veçoritë e mëposhtme:

- **Faqet e Ruajtura**: Faqet kryesore janë të disponueshme offline
- **Treguesi Offline**: Tregues vizual kur punoni offline
- **Të Dhënat e Ruajtura**: Raportet e ngarkuara më parë janë të disponueshme offline
- **Dorëzimi Offline**: Formularët mund të plotësohen offline dhe të dorëzohen kur jeni online

## Përputhshmëria me Shfletuesit

- **Shfletuesit Modernë**: Mbështetje e plotë në Chrome, Firefox, Safari, Edge
- **Shfletuesit e Celularit**: Optimizuar për Chrome dhe Safari në Android dhe iOS
- **Shfletuesit e Vjetër**: Degradim i hijshëm me funksionalitet bazë

## Planet për të Ardhmen

- Integrim i backend për ruajtjen e përhershme të të dhënave
- Autentifikimi i përdoruesit dhe gjurmimi i problemeve
- Njoftime në kohë reale për përditësimet e problemeve
- Veçori të avancuara të analizave dhe raportimit
- Mjete të angazhimit të komunitetit

## Kontributi

Kontributet janë të mirëpritura! Ju lutemi mos hezitoni të dorëzoni një Pull Request.

## Licenca

Ky projekt është i licencuar nën Licencën MIT - shikoni skedarin LICENSE për detaje.
