/**
 * Fonction pour créer un bouton
 * 
 * @param {String} text 
 * @param {String} color
 * @param {String} icon
 * @returns {HTMLElement}
 */
function createButton(text, color, icon) {
    const button = document.createElement('a');
    button.classList.add('btn', 'btn-sm', 'btn-'+color);
    button.innerHTML = `<i class="fa-solid fa-${icon}"></i> ${text}`
    return button;
}

/**
 * Fonction pour ajouter les boutons
 * 
 * @returns {void}
 */
function addButtons() {
    const headerInfo = document.querySelector('.header-info');
    const card_header = document.createElement('div');
    card_header.classList.add('right', 'card-header-actions');
    card_header.style.display = 'flex';

    // Création des boutons
    const buttonMoyennes = createButton("Vos notes & moyennes", "success", "graduation-cap");
    buttonMoyennes.addEventListener('click', () => {
        const moyennes = document.getElementById("moyennes");
        if (moyennes) {
            moyennes.scrollIntoView({ behavior: "smooth" });
        }
    });
    card_header.append(buttonMoyennes);

    const buttonAbsences = createButton("Vos absences", "warning", "ban");
    buttonAbsences.addEventListener('click', () => {
        const absences = document.getElementById("absences");
        if (absences) {
            absences.scrollIntoView({ behavior: "smooth" });
        }
    });
    card_header.append(buttonAbsences);

    const buttonDetails = createButton("Informations utiles", "info", "eye");
    buttonDetails.addEventListener('click', () => {
        const details = document.getElementById("details");
        if (details) {
            details.open = true;
            details.scrollIntoView({ behavior: "smooth" });
        }
    });
    card_header.append(buttonDetails);


    // Ajout des boutons
    headerInfo.append(card_header);
}

/**
 * Fonction pour appliquer le style
 * 
 * @returns {void}
 */
function applyStyle() {
    // Ajout des styles pour les cartes
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.style.borderRadius = '10px';
        card.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
    });

    // Ajout des styles pour les alertes
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        alert.style.borderRadius = '10px';
    });

    // Ajout des styles pour les boutons
    const btns = document.querySelectorAll('.btn');
    btns.forEach(btn => {
        btn.style.borderRadius = '10px';
    });

    // Ajout des styles pour les modals
    const modals = document.querySelectorAll('.modal-content');
    modals.forEach(modal => {
        modal.style.borderRadius = '10px';
    });
}

/**
 * Fonction pour nettoyer les cartes
 * 
 * @returns {void}
 */
function cleanCards() {
    const content = document.querySelector("#mainContent");
    const row = document.querySelector("#mainContent > div:first-child");
    const contentRow = document.querySelector("#mainContent > div:nth-child(2)");
    const firstChild = document.querySelector("#mainContent > div:nth-child(2) > div:first-child");
    const secondChild = document.querySelector("#mainContent > div:nth-child(2) > div:nth-child(2)");

    content.removeChild(row);
    contentRow.removeChild(firstChild);
    contentRow.removeChild(secondChild);
}

/**
 * Fonction pour créer un carte
 * 
 * @param {String} content 
 * @param {String} title 
 * @param {Number} colLength
 * @param {String} id
 * @returns {HTMLElement}
 */
function createCardBody(content, title, colLength = 6, id = "") {
    const col = document.createElement('div');
    col.classList.add('col-sm-12', 'col-md-' + colLength, 'fade-in');
    col.style.margin = "0 auto";

    const card = document.createElement('div');
    card.classList.add('card');
    if (id !== "") {
        card.id = id;
        card.style.scrollMarginTop = '90px';
    }
    col.append(card);

    const header = document.createElement('header');
    header.classList.add('card-header');
    header.innerHTML = '<h4 class="card-title">' + title + '</h4>';

    const card_body = document.createElement('div');
    card_body.classList.add('card-body');
    card_body.style.overflow = 'auto';
    card.append(header, card_body);

    if (content instanceof HTMLElement)
        card_body.appendChild(content);
    else
        card_body.innerHTML = content;

    return col;
}

/**
 * Fonction pour créer un graphique
 * 
 * @param {String} data 
 * @param {String} type 
 * @param {String} xaxiscategories 
 * @returns {void}
 */
function createChart(data, type, xaxiscategories) {
    const options = {
        series: [{
            data: data
        }],
        chart: {
            type: type,
            height: 245
        },
        colors: [
            function ({ value }) {
                if (value < 8)
                    return "#f96868"
                else if (value <= 10)
                    return "#faa64b";
                else
                    return "#15c377";
            }
        ],
        plotOptions: {
            bar: {
                borderRadius: 4,
                horizontal: false,
            }
        },
        dataLabels: {
            enabled: false
        },
        xaxis: {
            categories: xaxiscategories
        },
    };

    const chart = new ApexCharts(document.querySelector("#chart"), options);
    return chart.render();
}

/**
 * Fonction pour créer la carte du bilan
 * 
 * @returns {void}
 */
function createBilanCard() {
    fetch("https://iut-rcc-intranet.univ-reims.fr/fr/utilisateur/mon-profil")
    .then(response => response.text())
    .then(data => {
        const page = document.createElement('div');
        page.innerHTML = data.trim();
        const nav = page.querySelector(".nav");
        const href = nav.children[2].getAttribute('href');

        if (!href) return;

        fetch('https://iut-rcc-intranet.univ-reims.fr/' + href)
        .then(response => response.text())
        .then(data => {
            const content = document.querySelector("#mainContent > div:first-child");
            const before = document.querySelector("#mainContent > div:first-child > div:nth-child(5)");

            var card = document.createElement('div');
            card.innerHTML = data.trim();
            card.querySelector(".card-header-actions").remove();
            content.insertBefore(card, before);
            applyStyle();
        })
    })
}

/**
 * Fonction pour ordonner les cartes
 * 
 * @returns {void}
 */
function orderCards() {
    const content = document.querySelector("#mainContent > div:first-child");
    const absences = document.querySelector("#mainContent > div:first-child > div:nth-child(2)");
    const statut = document.querySelector("#mainContent > div:first-child > div:nth-child(3)");
    const graph = document.querySelector("#mainContent > div:first-child > div:nth-child(4)");
    const notes = document.querySelector("#mainContent > div:first-child > div:nth-child(5)");

    const competences = document.querySelector("#mainContent > div:first-child > div:nth-child(6)");
    const liens = document.querySelector("#mainContent > div:first-child > div:nth-child(7)");
    const contact = document.querySelector("#mainContent > div:first-child > div:nth-child(8)");

    absences.id = "absences";
    absences.style.scrollMarginTop = '90px';
    content.insertBefore(statut, absences);
    content.insertBefore(graph, absences);
    content.insertBefore(notes, absences);

    liens.classList.remove('col-md-6');
    contact.classList.remove('col-md-6');

    const details = document.createElement("details");
    details.id = "details";
    details.style.scrollMarginTop = '90px';
    details.innerHTML = '<summary class="card"><div class="card-header">Compétences, contacts et liens utiles. Voir plus... <i class="fa-solid fa-chevron-down"></i></div></summary>';
    details.append(competences, contact, liens);
    content.append(details);
}

/**
 * Fonction qui calcule la moyenne
 * 
 * @returns {Object}
 */
function getAverage() {
    const listNote = document.querySelectorAll("#mainContent > div.row > div:nth-child(5) > div > div > table > tbody tr");
    const listModal = document.querySelectorAll("#mainContent > div.row > div:nth-child(6) > div > div > table > tbody tr");

    const notesData = {}
    for (const elt of listNote) {
        let nameMoy = elt.children[0].textContent.trim();
        let note = Number.parseFloat(elt.children[4].children[0].textContent.replace(',', '.'));
        let coef = Number.parseFloat(elt.children[5].textContent.replace(',', '.'));

        if (!notesData[nameMoy]) {
            notesData[nameMoy] = [];
        };
        notesData[nameMoy].push({ note: note, coef: coef });
    };

    const coursesData = {};
    listModal.forEach(elt => {
        let name = elt.children[0].textContent.split('|')[0].trim();
        for (const ue of elt.children[1].children) {
            let nameUe = ue.textContent.split('(')[0].trim();
            let coefUe = ue.textContent.match(/\((.*?)\)/)[1];

            if (!coursesData[name]) {
                coursesData[name] = [];
            };
            coursesData[name].push({
                nameUe: nameUe,
                coefUe: Number.parseFloat(coefUe)
            });
        };
    });
    // Créez un objet pour stocker les résultats par UE
    const resultDataByUE = {};
    // Parcourez les clés du deuxième objet (notesData)
    for (const courseId in notesData) {
        // Vérifiez si le cours existe dans le premier objet (coursesData)
        if (coursesData.hasOwnProperty(courseId)) {
            // Obtenez les données du cours du premier objet
            const courseInfo = coursesData[courseId];

            // Obtenez les données de notes du deuxième objet
            const noteInfo = Utils.calculateAverageWeight(notesData[courseId]);

            // Regarde si la note est bien un entier (et non une phrase)
            if (!Number.isNaN(noteInfo)) {
                // Parcourez les cours du premier objet pour regrouper par UE
                courseInfo.forEach(course => {
                    const ueName = course.nameUe;
                    const ueCoefficient = course.coefUe;

                    // Vérifiez si l'UE existe dans le résultat par UE
                    if (!resultDataByUE.hasOwnProperty(ueName)) {
                        // Si elle n'existe pas, initialisez-la avec un objet vide
                        resultDataByUE[ueName] = {
                            totalNote: 0,
                            totalCoefficient: 0
                        };
                    }
                    
                    // Ajoutez la note pondérée et le coefficient de ce cours à l'UE correspondante
                    resultDataByUE[ueName].totalNote += noteInfo * ueCoefficient;
                    resultDataByUE[ueName].totalCoefficient += ueCoefficient;
                });
            };
        }
    }

    // Maintenant, calculez la moyenne pour chaque UE
    const averageDataByUE = {};

    for (const ueName in resultDataByUE) {
        const ueData = resultDataByUE[ueName];
        const average = ueData.totalNote / ueData.totalCoefficient;
        if (!Number.isNaN(average)) {
            averageDataByUE[ueName] = average;
        };
    }
    return averageDataByUE;
}

/**
 * Fonction pour générer le code HTML
 * 
 * @param {Object} averageDataByUE
 * @returns {void}
 */
function generateHtml(averageDataByUE) {
    let isAccepted = true;
    for (const [domaine, note] of Object.entries(averageDataByUE)) {
        if (Number.parseFloat(note) < 10) {
            isAccepted = false;
        };
    };

    // Generation du code HTML
    const content = document.querySelector("#mainContent > div:nth-child(2)");
    const firstChild = document.querySelector("#mainContent > div:nth-child(2) > div:nth-child(5)");

    // Carte des moyennes
    const table = document.createElement('table');
    table.classList.add('table', 'table-border', 'table-striped');

    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');

    for (const [domaine] of Object.entries(averageDataByUE)) {
        const th = document.createElement('th');
        th.classList.add('text-center');
        th.innerHTML = domaine;
        trHead.append(th);
    };
    thead.append(trHead);

    const tbody = document.createElement('tbody');
    const trBody = document.createElement('tr');
    for (const [domaine, note] of Object.entries(averageDataByUE)) {
        const td = document.createElement('td');
        td.classList.add('text-center');
        td.innerHTML = `<span class="fs-11 badge ${parseFloat(note) < 8 ? "bg-danger" : parseFloat(note) <= 10 ? "bg-warning" : "bg-success"}">${Utils.roundValue(note, 2)}</span>`;
        trBody.append(td);
    };
    tbody.append(trBody);
    table.append(thead, tbody);

    const tableMarkHtml = createCardBody(table, 'Vos moyennes', 12, 'moyennes');

    // Carte de validation
    const olIsAccepted = document.createElement('ol')
    olIsAccepted.className = 'timeline timeline-activity timeline-point-sm timeline-content-right text-left w-100';
    const liIsAccepted = document.createElement('li');
    liIsAccepted.className = 'alert alert-' + (isAccepted ? 'success' : 'danger');
    liIsAccepted.innerHTML = '<strong class="fw-semibold">Validation : </strong> ' + Utils.boolToValue(isAccepted);
    olIsAccepted.append(liIsAccepted);
    const isAcceptedHtml = createCardBody(olIsAccepted, 'Validation du semestre', 12);

    // Carte du graphique
    const divChart = document.createElement('div')
    divChart.id = "chart";
    divChart.style.scrollMarginTop = '90px';

    const colLeft = document.createElement('div');
    colLeft.classList.add('col-sm-12', 'col-md-6', 'fade-in');
    colLeft.append(tableMarkHtml, isAcceptedHtml);

    content.insertBefore(colLeft, firstChild);
    content.insertBefore(createCardBody(divChart, 'Aperçu de vos moyennes', 6, 'graph'), firstChild);

    let dataMarks = [];
    let dataDomain = [];
    for (const [domaine, note] of Object.entries(averageDataByUE)) {
        dataMarks.push(Utils.roundValue(note, 2));
        dataDomain.push(domaine);
    };

    createChart(dataMarks, 'bar', dataDomain);
}
