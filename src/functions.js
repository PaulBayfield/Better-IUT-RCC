import ApexCharts from 'apexcharts'
import { Utils } from "./utils";
import * as browser from 'webextension-polyfill';


/**
 * Fonction pour mettre à jour le menu
 * 
 * @returns {void}
 */
export function updateMenu() {
    const menu = document.querySelector("nav.sidebar-navigation > ul");
    if (!menu) return;

    const li = document.createElement('li');
    li.classList.add('menu-item');
    li.id = 'menu-crous';

    const a = document.createElement('a');
    a.classList.add('menu-link');
    a.href = '/fr/crous';

    const i = document.createElement('i');
    i.classList.add('fas', 'fa-utensils', 'fa-2x');

    const span = document.createElement('span');
    span.classList.add('title');
    span.textContent = 'Restaurants';

    a.append(i, span);
    li.append(a);

    menu.insertBefore(li, menu.childNodes[2]);
}

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
    button.classList.add('btn', 'btn-sm', `btn-${color}`);
    button.innerHTML = `<i class="fa-solid fa-${icon}"></i> ${text}`;
    return button;
}

/**
 * Fonction pour ajouter les boutons
 * 
 * @returns {Promise<void>}
 */
export async function addButtons() {
    const userAvatar = document.querySelector('.topbar-right .topbar-btn-avatar img');
    const userId = /.*\/(\d*)\.jpg/g.exec(userAvatar.src)[1];

    const headerInfo = document.querySelector('.header-info');
    const cardHeader = document.createElement('div');
    const col1 = document.querySelector("#mainContent > div:first-child > div:nth-child(2)");
    const col2 = document.querySelector("#mainContent > div:first-child > div:nth-child(3)");

    cardHeader.classList.add('right', 'card-header-actions');
    cardHeader.style.display = 'flex';

    // Create buttons
    const buttonMoyennes = createButton("Vos notes & moyennes", "success", "graduation-cap");
    buttonMoyennes.addEventListener('click', () => {
        const notes = col1.style.display === 'none' ? document.getElementById("notes") : document.getElementById("moyennes");
        if (notes) notes.scrollIntoView({ behavior: "smooth" });
    });
    cardHeader.append(buttonMoyennes);

    const buttonAbsences = createButton("Vos absences", "warning", "calendar");
    buttonAbsences.addEventListener('click', () => {
        const absences = document.getElementById("absences");
        if (absences) absences.scrollIntoView({ behavior: "smooth" });
    });
    cardHeader.append(buttonAbsences);

    const buttonDetails = createButton("Informations utiles", "info", "eye");
    buttonDetails.addEventListener('click', () => {
        const details = document.getElementById("details");
        if (details) {
            details.open = true;
            details.scrollIntoView({ behavior: "smooth" });
        }
    });
    cardHeader.append(buttonDetails);

    const toggleMoreDetails = createButton("Minimal", "purple", "window-minimize");
    toggleMoreDetails.addEventListener('click', async () => {
        const showMore = col1.style.display === 'none';
        col1.style.display = showMore ? 'block' : 'none';
        col2.style.display = showMore ? 'block' : 'none';
        toggleMoreDetails.innerHTML = showMore 
            ? '<i class="fa-solid fa-window-minimize"></i> Minimal' 
            : '<i class="fa-solid fa-window-restore"></i> Maximal';
        if (!showMore) document.getElementById("details").open = false;
        await browser.storage.local.set({ showMoreDetails: { [userId]: showMore } });
    });
    cardHeader.append(toggleMoreDetails);

    const github = createButton("Code", "dark", "code-fork");
    github.addEventListener('click', () => {
        window.open("https://github.com/PaulBayfield/Better-IUT-RCC", "_blank");
    });
    cardHeader.append(github);

    const cache = await browser.storage.local.get('showMoreDetails');
    const showMore = cache.showMoreDetails?.[userId];
    col1.style.display = col2.style.display = showMore ? 'block' : 'none';
    toggleMoreDetails.innerHTML = showMore 
        ? '<i class="fa-solid fa-window-minimize"></i> Minimal' 
        : '<i class="fa-solid fa-window-restore"></i> Maximal';

    headerInfo.append(cardHeader);
}

/**
 * Fonction pour appliquer le style
 * 
 * @returns {void}
 */
export function applyStyle() {
    const addStyles = (elements, styles) => {
        elements.forEach(el => {
            Object.assign(el.style, styles);
        });
    };

    addStyles(document.querySelectorAll('.card'), {
        borderRadius: '10px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    });
    addStyles(document.querySelectorAll('.alert'), { borderRadius: '10px' });
    addStyles(document.querySelectorAll('.btn'), { borderRadius: '10px' });
    addStyles(document.querySelectorAll('.modal-content'), { borderRadius: '10px' });
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
 * @param {String|HTMLElement} content 
 * @param {String} title 
 * @param {Number} colLength
 * @param {String} id
 * @returns {HTMLElement}
 */
function createCardBody(content, title, colLength = 6, id = "") {
    const col = document.createElement('div');
    col.classList.add('col-sm-12', `col-md-${colLength}`, 'fade-in');
    col.style.margin = "0 auto";

    const card = document.createElement('div');
    card.classList.add('card');
    if (id) {
        card.id = id;
        card.style.scrollMarginTop = '90px';
    }
    col.append(card);

    const header = document.createElement('header');
    header.classList.add('card-header');
    header.innerHTML = `<h4 class="card-title">${title}</h4>`;

    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');
    cardBody.style.overflow = 'auto';
    card.append(header, cardBody);

    if (content instanceof HTMLElement)
        cardBody.appendChild(content);
    else
        cardBody.innerHTML = content;

    return col;
}

/**
 * Fonction pour créer un graphique
 * 
 * @param {Array} data 
 * @param {String} type 
 * @param {Array} xaxiscategories 
 * @returns {Promise<void>}
 */
function createChart(data, type, xaxiscategories) {
    const options = {
        series: [{ data }],
        chart: { type, height: 245 },
        colors: [
            ({ value }) => (value < 8 ? "#f96868" : value <= 10 ? "#faa64b" : "#15c377"),
        ],
        plotOptions: { bar: { borderRadius: 4, horizontal: false } },
        dataLabels: { enabled: false },
        xaxis: { categories: xaxiscategories },
    };

    const chart = new ApexCharts(document.querySelector("#chart"), options);
    return chart.render();
}

/**
 * Fonction pour créer la carte du bilan
 * 
 * @returns {Promise<void>}
 */
export async function createBilanCard() {
    const userAvatar = document.querySelector('.topbar-right .topbar-btn-avatar img');
    const userId = /.*\/(\d*)\.jpg/g.exec(userAvatar.src)[1];
    
    const cache = await browser.storage.local.get('userBilanCache');
    let user = null;

    if(cache.userBilanCache !== undefined && cache.userBilanCache[userId] !== undefined) {
        user = cache.userBilanCache[userId];
    } else {
        const profileRequest = await fetch("https://iut-rcc-intranet.univ-reims.fr/fr/utilisateur/mon-profil");
        const data = await profileRequest.text();
        const page = document.createElement('div');
        page.innerHTML = data.trim();
        const nav = page.querySelector(".nav");

        user = nav.children[0].getAttribute('href').split('/')[4].split('/')[0];

        await browser.storage.local.set({
            userBilanCache: {
                [userId]: user,
            }
        })
    }

    if (!user) return;

    const bilanRequest = await fetch('https://iut-rcc-intranet.univ-reims.fr/fr/etudiant/profil/' + user + '/apc_notes');
    const bilanData = await bilanRequest.text();
    const content = document.querySelector("#mainContent > div:first-child");
    const before = document.querySelector("#mainContent > div:first-child > div:nth-child(5)");

    var card = document.createElement('div');
    card.innerHTML = bilanData.trim();
    card.querySelector(".card-header-actions").remove();
    content.insertBefore(card, before);
    applyStyle();
}

/**
 * Fonction pour récupérer et trier toutes les notes d'un tableau HTML.
 * 
 * @param {HTMLTableElement} htmlTable - Le tableau HTML contenant les notes.
 * @returns {Array} - Tableau trié d'objets de note.
 */
export function fetchAllSortedGrades(htmlTable) {
    const tbody = htmlTable.querySelector("tbody");
    let grades = [];

    const rows = tbody.querySelectorAll('tr');
    rows.forEach(row => {
        let buttonUrl = row.querySelector('td:nth-child(7) > button').getAttribute('data-modal-modal-url-value').split('/');
        let gradeId = parseInt(buttonUrl[buttonUrl.length - 1]);
        let gradeSubject = row.querySelector("td:nth-child(1)").textContent;
        let gradeEvaluation = row.querySelector("td:nth-child(2)").textContent;
        let gradeDate = row.querySelector("td:nth-child(3)").textContent;
        let gradeComment = row.querySelector("td:nth-child(4)").textContent;
        let gradeValue = Number(row.querySelector('td:nth-child(5) .badge').textContent.replace(',', '.'));
        gradeValue = isNaN(gradeValue) ? -1 : gradeValue;
        let gradeCoefficient = Number(row.querySelector('td:nth-child(6)').textContent);

        let grade = {
            id: gradeId,
            subject: gradeSubject,
            evaluation: gradeEvaluation,
            date: gradeDate,
            comment: gradeComment,
            grade: gradeValue,
            coefficient: gradeCoefficient
        };

        grades.push(grade);
    });

    grades.sort((a, b) => a.subject.localeCompare(b.subject));

    return grades;
}

/**
 * Fonction pour calculer les moyennes par matière.
 * 
 * @returns {Object} Un objet contenant les moyennes par UE (Unité d'Enseignement).
 */
export function getAverage() {
    const lignesNotes = document.querySelectorAll("#mainContent > div.row > div:nth-child(5) > div > div > table > tbody tr");
    const lignesModalites = document.querySelectorAll("#mainContent > div.row > div:nth-child(6) > div > div > table > tbody tr");

    const donneesNotes = {};
    for (const ligne of lignesNotes) {
        let nomUE = ligne.children[0].textContent.trim();
        let note = Number.parseFloat(ligne.children[4].children[0].textContent.replace(',', '.'));
        let coef = Number.parseFloat(ligne.children[5].textContent.replace(',', '.'));

        if (!donneesNotes[nomUE]) {
            donneesNotes[nomUE] = [];
        };
        donneesNotes[nomUE].push({ note: note, coef: coef });
    };

    const donneesMatieres = {};
    lignesModalites.forEach(ligne => {
        let nomMatiere = ligne.children[0].textContent.split('|')[0].trim();
        for (const ue of ligne.children[1].children) {
            let nomUE = ue.textContent.split('(')[0].trim();
            let coefUE = ue.textContent.match(/\((.*?)\)/)[1];

            if (!donneesMatieres[nomMatiere]) {
                donneesMatieres[nomMatiere] = [];
            };
            donneesMatieres[nomMatiere].push({
                nomUE: nomUE,
                coefUE: parseFloat(coefUE)
            });
        };
    });

    const donneesResultatsParUE = {};
    for (const idUE in donneesNotes) {
        if (donneesMatieres.hasOwnProperty(idUE)) {
            const infosMatiere = donneesMatieres[idUE];
            const infoNote = Utils.calculateAverageWeight(donneesNotes[idUE]);
            if (!Number.isNaN(infoNote)) {
                infosMatiere.forEach(matiere => {
                    const nomUE = matiere.nomUE;
                    const coefUE = matiere.coefUE;

                    if (!donneesResultatsParUE.hasOwnProperty(nomUE)) {
                        donneesResultatsParUE[nomUE] = {
                            totalNote: 0,
                            totalCoefficient: 0
                        };
                    }
                    
                    donneesResultatsParUE[nomUE].totalNote += infoNote * coefUE;
                    donneesResultatsParUE[nomUE].totalCoefficient += coefUE;
                });
            };
        }
    }

    const moyennesParUE = {};

    for (const nomUE in donneesResultatsParUE) {
        const donneesUE = donneesResultatsParUE[nomUE];
        const moyenne = donneesUE.totalNote / donneesUE.totalCoefficient;
        if (!Number.isNaN(moyenne)) {
            moyennesParUE[nomUE] = moyenne;
        };
    }
    return moyennesParUE;
}

/**
 * Fonction pour générer le code HTML des moyennes.
 * 
 * @param {Object} moyennesParUE Les moyennes par UE.
 * @returns {void}
 */
export function generateHtml(moyennesParUE) {
    const sortedDomaines = Object.keys(moyennesParUE).sort();

    let estValide = true;
    for (const domaine of sortedDomaines) {
        if (Number.parseFloat(moyennesParUE[domaine]) < 10) {
            estValide = false;
        };
    }

    // Génération du code HTML
    const contenu = document.querySelector("#mainContent > div:nth-child(2)");
    const premierElement = document.querySelector("#mainContent > div:nth-child(2) > div:nth-child(5)");

    // Tableau des moyennes
    const tableau = document.createElement('table');
    tableau.classList.add('table', 'table-border', 'table-striped');

    const entete = document.createElement('thead');
    const ligneEntete = document.createElement('tr');

    for (const domaine of sortedDomaines) {
        const enteteCellule = document.createElement('th');
        enteteCellule.classList.add('text-center');
        enteteCellule.innerHTML = domaine;
        ligneEntete.append(enteteCellule);
    };
    entete.append(ligneEntete);

    const corps = document.createElement('tbody');
    const ligneCorps = document.createElement('tr');

    for (const domaine of sortedDomaines) {
        const cellule = document.createElement('td');
        cellule.classList.add('text-center');
        cellule.innerHTML = `<span class="fs-11 badge ${parseFloat(moyennesParUE[domaine]) < 8 ? "bg-danger" : parseFloat(moyennesParUE[domaine]) <= 10 ? "bg-warning" : "bg-success"}">${Utils.roundValue(moyennesParUE[domaine], 2)}</span>`;
        ligneCorps.append(cellule);
    }
    corps.append(ligneCorps);
    tableau.append(entete, corps);

    const htmlTableauMoyennes = createCardBody(tableau, 'Vos moyennes', 12, 'moyennes');

    // Carte de validation
    const listeValidation = document.createElement('ol')
    listeValidation.className = 'timeline timeline-activity timeline-point-sm timeline-content-right text-left w-100';
    const elementValidation = document.createElement('li');
    elementValidation.className = 'alert alert-' + (estValide ? 'success' : 'danger');
    elementValidation.innerHTML = '<strong class="fw-semibold">Validation : </strong> ' + Utils.boolToValue(estValide);
    listeValidation.append(elementValidation);
    const htmlValidation = createCardBody(listeValidation, 'Validation du semestre', 12);

    // Carte du graphique
    const divGraphique = document.createElement('div')
    divGraphique.id = "chart";
    divGraphique.style.scrollMarginTop = '90px';

    const colonneGauche = document.createElement('div');
    colonneGauche.classList.add('col-sm-12', 'col-md-6', 'fade-in');
    colonneGauche.append(htmlTableauMoyennes, htmlValidation);

    contenu.insertBefore(colonneGauche, premierElement);
    contenu.insertBefore(createCardBody(divGraphique, 'Aperçu de vos moyennes', 6, 'graph'), premierElement);

    let donneesNotes = [];
    let domaines = [];

    for (const domaine of sortedDomaines) {
        donneesNotes.push(Utils.roundValue(moyennesParUE[domaine], 2));
        domaines.push(domaine);
    };

    createChart(donneesNotes, 'bar', domaines);
}

/**
 * Fonction pour ordonner les cartes sur la page principale.
 * 
 * @returns {void}
 */
export function orderCards() {
    // Sélection des éléments HTML à réorganiser
    const content = document.querySelector("#mainContent > div:first-child");
    const absences = document.querySelector("#mainContent > div:first-child > div:nth-child(2)");
    const statut = document.querySelector("#mainContent > div:first-child > div:nth-child(3)");
    const graph = document.querySelector("#mainContent > div:first-child > div:nth-child(4)");
    const notes = document.querySelector("#mainContent > div:first-child > div:nth-child(5)");
    notes.id = "notes"; // Ajout de l'ID "notes" pour identifier cet élément
    notes.style.scrollMarginTop = '90px'; // Ajout d'une marge supérieure pour la navigation
    const competences = document.querySelector("#mainContent > div:first-child > div:nth-child(6)");
    const liens = document.querySelector("#mainContent > div:first-child > div:nth-child(7)");
    const contact = document.querySelector("#mainContent > div:first-child > div:nth-child(8)");

    // Modification de l'ID et de la marge supérieure pour les éléments "absences" et "statut"
    absences.id = "absences";
    absences.style.scrollMarginTop = '90px';

    // Réorganisation des éléments
    content.insertBefore(statut, absences);
    content.insertBefore(graph, absences);
    content.insertBefore(notes, absences);

    // Suppression de la classe "col-md-6" des éléments "liens" et "contact"
    liens.classList.remove('col-md-6');
    contact.classList.remove('col-md-6');

    // Création d'un élément "details" pour regrouper les compétences, contacts et liens utiles
    const details = document.createElement("details");
    details.id = "details"; // Ajout de l'ID "details" pour identifier cet élément
    details.style.scrollMarginTop = '90px'; // Ajout d'une marge supérieure pour la navigation
    details.innerHTML = '<summary class="card"><div class="card-header">Compétences, contacts et liens utiles. Voir plus... <i class="fa-solid fa-chevron-down"></i></div></summary>';
    details.append(competences, contact, liens);
    content.append(details);
}

/**
 * Fonction pour recréer le tableau avec les notes triées.
 * 
 * @param {Array} sortedGrades - Tableau d'objets de notes triées.
 * @param {Array} knownGrades - Tableau d'identifiants de notes connues.
 * @returns {HTMLTableElement} - Élément de tableau HTML recréé.
 */
export function recreateTable(sortedGrades, knownGrades) {
    let table = document.createElement('table');
    table.classList.add('table', 'table-border', 'table-striped');

    let thead = document.createElement('thead');
    table.appendChild(thead);

    let trHead = document.createElement('tr');
    thead.appendChild(trHead);

    const headers = ['Matière', 'Évaluation', 'Date', 'Commentaire de l\'évaluation', 'Note', 'Coefficient', 'Informations'];
    headers.forEach(header => {
        let th = document.createElement('th');
        th.textContent = header;
        trHead.appendChild(th);
    });

    let tbody = document.createElement('tbody');
    table.appendChild(tbody);

    sortedGrades.forEach((grade, i) => {
        let isNew = !knownGrades.includes(grade.id);
        let tr = createRow(grade, false, isNew);
        tbody.appendChild(tr);

        if (i === sortedGrades.length - 1 || sortedGrades[i + 1].subject !== grade.subject) {
            let trAverage = createRow({
                subject: grade.subject,
                evaluation: 'Moyenne',
                grade: calculateSubjectAverage(sortedGrades, grade.subject)
            }, true);
            tbody.appendChild(trAverage);
        }
    });

    let trGeneralAverage = createRow({
        subject: '',
        evaluation: 'Moyenne Générale',
        grade: calculateOverallAverage(sortedGrades)
    }, true);
    tbody.appendChild(trGeneralAverage);

    return table;
}

/**
 * Fonction pour calculer la moyenne pondérée des notes.
 * 
 * @param {Array} grades - Tableau des valeurs de notes.
 * @param {Array} coefficients - Tableau des coefficients correspondants.
 * @returns {number} - Moyenne calculée ou -1 si aucune note valide.
 */
export function calculateAverage(grades, coefficients) {
    let numerator = 0;
    let denominator = 0;
    let hasValidGrade = false;

    grades.forEach((grade, index) => {
        if (grade >= 0) {
            numerator += grade * coefficients[index];
            denominator += coefficients[index];
            hasValidGrade = true;
        }
    });

    return hasValidGrade ? (numerator / denominator) : -1;
}

/**
 * Fonction pour calculer la moyenne des notes pour une matière spécifique.
 * 
 * @param {Array} allGrades - Tableau de tous les objets de notes.
 * @param {string} subject - La matière pour laquelle calculer la moyenne.
 * @returns {number} - Moyenne calculée pour la matière.
 */
export function calculateSubjectAverage(allGrades, subject) {
    let grades = [];
    let coefficients = [];

    allGrades.forEach(grade => {
        if (grade.subject === subject) {
            grades.push(grade.grade);
            coefficients.push(grade.coefficient);
        }
    });

    return calculateAverage(grades, coefficients);
}

/**
 * Fonction pour calculer la moyenne générale des notes toutes matières confondues.
 * 
 * @param {Array} allGrades - Tableau de tous les objets de notes.
 * @returns {number} - Moyenne générale calculée.
 */
export function calculateOverallAverage(allGrades) {
    let subjectAverages = [];
    let coefficients = [];

    let previousSubject = '';
    allGrades.forEach(grade => {
        if (previousSubject !== grade.subject) {
            let average = calculateSubjectAverage(allGrades, grade.subject);
            if (average >= 0) {
                subjectAverages.push(average);
                coefficients.push(1);
                previousSubject = grade.subject;
            }
        }
    });

    return calculateAverage(subjectAverages, coefficients);
}

/**
 * Fonction pour créer une ligne de tableau.
 * 
 * @param {Object} grade - Objet de note.
 * @param {boolean} isAverage - Indique si la ligne représente une moyenne.
 * @param {boolean} isNew - Indique si la note est nouvelle.
 * @returns {HTMLTableRowElement} - Élément de ligne de tableau HTML créé.
 */
export function createRow(grade, isAverage, isNew = false) {
    let tr = document.createElement('tr');
    if (isAverage) tr.classList.add('moyenne');
    if (isNew) tr.classList.add('new-note');

    const columns = [
        grade.subject, 
        grade.evaluation, 
        isAverage ? '' : grade.date, 
        isAverage ? '' : grade.comment, 
        formatGrade(grade.grade), 
        isAverage ? '' : grade.coefficient.toString(), 
        isAverage ? '' : createInfoButton(grade.id)
    ];

    columns.forEach(content => {
        let td = document.createElement('td');
        if (typeof content === 'string' || content instanceof String) {
            td.textContent = content;
        } else {
            td.appendChild(content);
        }
        tr.appendChild(td);
    });

    return tr;
}

/**
 * Fonction pour formater une note en ajoutant un badge HTML.
 * 
 * @param {number} grade - La note à formater.
 * @returns {HTMLElement} - Élément span HTML avec le badge de note.
 */
function formatGrade(grade) {
    let span = document.createElement('span');
    if (grade >= 10) {
        span.classList.add('badge', 'bg-success');
        span.textContent = grade.toPrecision(4).toString();
    } else if (grade == -1) {
        span.classList.add('badge', 'bg-warning');
        span.textContent = 'Pas de note ou pas de saisie ?';
    } else {
        span.classList.add('badge', 'bg-warning');
        span.textContent = grade.toPrecision(4).toString();
    }
    return span;
}

/**
 * Fonction pour créer un bouton d'information pour une note.
 * 
 * @param {number} gradeId - L'identifiant de la note.
 * @returns {HTMLButtonElement} - Élément de bouton HTML avec les informations sur la note.
 */
function createInfoButton(gradeId) {
    let button = document.createElement('button');
    button.classList.add('btn', 'btn-info', 'btn-outline', 'btn-square', 'btn-xs');
    button.setAttribute('data-controller', 'modal');
    button.setAttribute('data-modal-modal-title-value', 'Détails de la note');
    button.setAttribute('data-modal-modal-url-value', '/fr/application/etudiant/note/details/' + gradeId);
    button.setAttribute('data-action', 'click->modal#openModal');
    button.setAttribute('data-bs-toggle', 'tooltip');
    button.setAttribute('data-bs-placement', 'bottom');
    button.setAttribute('data-bs-original-title', 'Détails');

    let icon = document.createElement('i');
    icon.classList.add('fas', 'fa-info');
    button.appendChild(icon);

    return button;
}

/**
 * Fonction pour ajouter un bouton de sauvegarde.
 * 
 * @returns {HTMLButtonElement} - Élément de bouton HTML créé.
 */
export function addSaveButton() {
    let button = createButton('Sauvegarder les notes connues', 'pink', 'save')
    let actions = document.querySelector("#mainContent > div > div:nth-child(4) > div > header > div")
    actions.prepend(button)

    return button;
}

/**
 * Fonction pour ajouter un bouton de réinitialisation.
 * 
 * @returns {HTMLButtonElement} - Élément de bouton HTML créé.
 */
export function addResetButton() {
    let button = createButton("Réinitialiser les notes connues", "danger", "trash-can")
    let actions = document.querySelector("#mainContent > div > div:nth-child(4) > div > header > div")
    actions.prepend(button)

    return button;
}
