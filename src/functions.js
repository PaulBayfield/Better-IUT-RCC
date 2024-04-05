import ApexCharts from 'apexcharts'
import { Utils } from "./utils";

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
export function addButtons() {
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
export function applyStyle() {
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
export function cleanCards() {
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
export function createBilanCard() {
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
export function orderCards() {
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
export function getAverage() {
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
                coefUe: parseFloat(coefUe)
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
export function generateHtml(averageDataByUE) {
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

export function recupererToutesLesNotesTriees(tableauHtml) {
    const tbody = tableauHtml.querySelector("tbody")
    let notes = []

    const lignes = tbody.querySelectorAll('tr')
    lignes.forEach(ligne => {
        let buttonUrl = ligne.querySelector('td:nth-child(7) > button').getAttribute('data-modal-modal-url-value').split('/')
        let noteId = parseInt(buttonUrl[buttonUrl.length-1])
        let noteMatiere = ligne.querySelector("td:nth-child(1)").textContent
        let noteEvaluation = ligne.querySelector("td:nth-child(2)").textContent
        let noteDate = ligne.querySelector("td:nth-child(3)").textContent
        let noteCommentaire = ligne.querySelector("td:nth-child(4)").textContent
        let noteNote = Number(ligne.querySelector('td:nth-child(5) .badge').textContent.replace(',', '.'))
        noteNote = isNaN(noteNote) ? -1 : noteNote
        let noteCoefficient = Number(ligne.querySelector('td:nth-child(6)').textContent)


        let note = {
            id: noteId,
            matiere: noteMatiere,
            evaluation: noteEvaluation,
            date: noteDate,
            commentaire: noteCommentaire,
            note: noteNote,
            coefficient: noteCoefficient
        }

        notes.push(note)
    })

    notes.sort((a, b) => (a.matiere > b.matiere) ? 1 : -1)

    return notes
}

export function recreerTableau(notesTriees, notesConnues) {
    let table = document.createElement('table')
    table.classList.add('table', 'table-border', 'table-striped')


    let thead = document.createElement('thead')
    table.appendChild(thead)


    let trHead = document.createElement('tr')
    thead.appendChild(trHead)


    let thMatiere = document.createElement('th')
    thMatiere.textContent = 'Matière'
    trHead.appendChild(thMatiere)
    
    let thEvaluation = document.createElement('th')
    thEvaluation.textContent = 'Evaluation'
    trHead.appendChild(thEvaluation)

    let thDate = document.createElement('th')
    thDate.textContent = 'date'
    trHead.appendChild(thDate)

    let thCommentaire = document.createElement('th')
    thCommentaire.textContent = 'Commentaire de l\'évaluation'
    trHead.appendChild(thCommentaire)

    let thNote = document.createElement('th')
    thNote.textContent = 'Note'
    trHead.appendChild(thNote)

    let thCoefficient = document.createElement('th')
    thCoefficient.textContent = 'coefficient'
    trHead.appendChild(thCoefficient)
    
    let thInformation = document.createElement('th')
    thInformation.textContent = 'Informations'
    trHead.appendChild(thInformation)


    let tbody = document.createElement('tbody')
    table.appendChild(tbody)


    notesTriees.forEach((note, i) => {
        let estNouveau = !notesConnues.includes(note.id)
        let tr = creerLigne(note, false, estNouveau)
        tbody.appendChild(tr)

        // Si on a atteint la fin des notes d'une matière
        if(i == notesTriees.length-1 || notesTriees[i+1].matiere != note.matiere) {
            let tr = creerLigne({
                matiere: note.matiere,
                evaluation: 'Moyenne',
                note: calculerMoyenneMatiere(notesTriees, note.matiere)
            }, true)

            tbody.appendChild(tr)

        }
    })


    // Ajout de la moyenne générale
    let tr = creerLigne({
        matiere: '',
        evaluation: 'Moyenne Générale',
        note: calculerMoyenneGenerale(notesTriees)
    }, true)
    tbody.appendChild(tr)

    return table
}

export function ajouterBoutonSauvegarde() {
    let button = document.createElement("button");
    button.classList.add('btn', 'btn-sm', 'btn-danger');

    button.innerHTML = `
        <i class="fas fa-save"></i>
        Sauvegarder les notes connues
    `;

    let actions = document.querySelector("#mainContent > div > div:nth-child(4) > div > header > div")
    actions.prepend(button)

    return button;
}

export function calculerMoyenne(notes, coefficients) {
    // numérateur : n1*c1 + n2*c2 + n3*c3
    let numerateur = 0
    let denominateur = 0
    let change = false
    for (let i = 0; i < notes.length; i++) {
        if(notes[i] >= 0){
            numerateur += notes[i] * coefficients[i]
            denominateur += coefficients[i]
            change = true
        }
    }

    // dénominateur : c1 + c2 + c3
    let moyenne = -1
    if(change) {
        if(numerateur != -1) {    
            moyenne = numerateur / denominateur
        }
    }

    return moyenne
}

export function calculerMoyenneMatiere(toutesLesNotes, matiere) {
    let notes = []
    let coefficients = []
    
    // récupération des notes et coefficients de toutes les notes de la matière
    toutesLesNotes.forEach((note) => {
        if(note.matiere == matiere){
            notes.push(note.note)
            coefficients.push(note.coefficient)
        }
    })

    let moyenne = calculerMoyenne(notes, coefficients)
    
    return moyenne
}

export function calculerMoyenneGenerale(toutesLesNotes) {
    let notes = []
    let coefficients = []

    // récupération des notes et coefficients de toutes les notes
    let oldMatiere = ''
    toutesLesNotes.forEach((note) => {
        if(oldMatiere != note.matiere){
            let moyenne = calculerMoyenneMatiere(toutesLesNotes, note.matiere)
            if(moyenne >= 0){
                notes.push(calculerMoyenneMatiere(toutesLesNotes, note.matiere))
                coefficients.push(1)
                oldMatiere = note.matiere
            }
        }
    })

    let moyenne = calculerMoyenne(notes, coefficients)

    return moyenne
}

export function creerLigne(note, estUneMoyenne, nouveau = false) {
    let tr = document.createElement('tr')
    if(estUneMoyenne) tr.classList.add('moyenne')
    if(nouveau) tr.classList.add('new-note')

    let tdMatiere = document.createElement('td')
    tdMatiere.textContent = note.matiere
    tr.appendChild(tdMatiere)

    let tdEvaluation = document.createElement('td')
    tdEvaluation.textContent = note.evaluation
    tr.appendChild(tdEvaluation)

    let tdDate = document.createElement('td')
    tdDate.classList.add('hide')
    if(!estUneMoyenne) tdDate.textContent = note.date
    tr.appendChild(tdDate)

    let tdCommentaire = document.createElement('td')
    tdCommentaire.classList.add('hide')
    if(!estUneMoyenne) tdCommentaire.textContent = note.commentaire
    tr.appendChild(tdCommentaire)

    let tdNote = document.createElement('td')
    let span = document.createElement('span')
    if(note.note >= 10) {
        span.classList.add('badge', 'bg-success')
        span.textContent = note.note.toPrecision(4).toString()
    } else if(note.note == -1) {
        span.classList.add('badge', 'bg-warning')
        span.textContent = 'Pas de note ou pas de saisie ?'
    } else {
        span.classList.add('badge', 'bg-warning')
        if(note.note < 0) {
            span.textContent = note.note.toString()
        } else {
            span.textContent = note.note.toPrecision(4).toString()
        }
    }
    tdNote.appendChild(span)
    tr.appendChild(tdNote)

    let tdCoefficient = document.createElement('td')
    tdCoefficient.classList.add('hide')
    if(!estUneMoyenne) tdCoefficient.textContent = note.coefficient.toString()
    tr.appendChild(tdCoefficient)

    let tdInformation = document.createElement('td')
    if(!estUneMoyenne) {
        let buttonInformation = document.createElement('button')
        buttonInformation.classList.add('btn', 'btn-info', 'btn-outline', 'btn-square', 'btn-xs')
        buttonInformation.setAttribute('data-controller', 'modal')
        buttonInformation.setAttribute('data-modal-modal-title-value', 'Détails d\'une note')
        buttonInformation.setAttribute('data-modal-modal-url-value', '/fr/application/etudiant/note/details/' + note.id)
        buttonInformation.setAttribute('data-action', 'click->modal#openModal')
        buttonInformation.setAttribute('data-bs-toggle', 'tooltip')
        buttonInformation.setAttribute('data-bs-placement', 'bottom')
        buttonInformation.setAttribute('data-bs-original-title', 'Détails')
        let iButtonInformation = document.createElement('i')
        iButtonInformation.classList.add('fas', 'fa-info')
        buttonInformation.appendChild(iButtonInformation)
        tdInformation.appendChild(buttonInformation)
    }
    tr.appendChild(tdInformation)

    return tr
}