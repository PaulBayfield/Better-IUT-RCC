import ApexCharts from 'apexcharts'
import { Utils } from "./utils";
import * as browser from 'webextension-polyfill';
import { Average } from './average';

/**
 * Fonction pour ajouter une carte pour les avis.
 * 
 * @returns {HTMLElement}
 */
export function addAvisNotification() {
    console.info("[Better IUT RCC] Ajout d'une carte les avis...");

    // HTML generation
    const content = document.querySelector("#mainContent > div:first-child");
    const firstElement = document.querySelector("#mainContent > div:first-child > div:first-child");

    const notificationList = document.createElement('ol');
    notificationList.className = 'timeline timeline-activity timeline-point-sm timeline-content-right text-left w-100';
    const notificationElement = document.createElement('li');
    notificationElement.className = 'alert alert-success';
    notificationElement.innerHTML = '<strong class="fw-semibold">📑 Aidez-nous à améliorer l\'extension...</strong><br>Si vous aimez cette extension, n\'hésitez pas à donner votre avis sur le Chrome Store, disponible ici : <a href="https://chromewebstore.google.com/detail/better-iut-rcc/jofahdhjofjoackgkaodimfhnbfkgnbj" target="_blank" class="link">chromewebstore.google.com/detail/better-iut-rcc/jofahdhjofjoackgkaodimfhnbfkgnbj</a>.<br><br><strong class="fw-semibold">Merci d\'utiliser Better IUT RCC !</strong>';
    notificationList.append(notificationElement);

    const buttonsListe = document.createElement('div');
    buttonsListe.classList.add('card-header-actions', 'right-end');
    buttonsListe.style.display = 'flex';

    const bouttonReject = createButton("Ne plus voir ce message", "danger", "trash");
    bouttonReject.addEventListener('click', async () => {
        console.info("[Better IUT RCC] Notification cachée !");

        await browser.storage.local.set({hideAvisNotification: true});

        const notification = document.querySelector('#notif');
        notification.remove();
    });
    buttonsListe.append(bouttonReject);

    notificationList.append(buttonsListe);

    const htmlnotification = createCardBody(notificationList, 'Better IUT RCC • Votre avis nous intéresse !', 12, 'notif');
    htmlnotification.style.scrollMarginTop = '90px';

    content.insertBefore(htmlnotification, firstElement);

    return htmlnotification;
}


/**
 * Fonction pour ajouter une carte concernant les nouveautés.
 * 
 * @returns {HTMLElement}
 */
export function addUpdateNotification() {
    console.info("[Better IUT RCC] Ajout d'une carte pour les nouveautés...");

    // HTML generation
    const content = document.querySelector("#mainContent > div:first-child");
    const firstElement = document.querySelector("#mainContent > div:first-child > div:first-child");

    const notificationList = document.createElement('ol');
    notificationList.className = 'timeline timeline-activity timeline-point-sm timeline-content-right text-left w-100';
    const notificationElement = document.createElement('li');
    notificationElement.className = 'alert alert-warning';
    notificationElement.innerHTML = "<strong class='fw-bold'>📑 Nouveautés de la dernière mise à jour...</strong><br><br>🎨 Les thèmes sont désormais disponibles ! Changez le thème de l'intranet dès maintenant dans la nouvel onglet \"Thèmes\"<br>🔧 Diverses améliorations et corrections de bugs ont été apportées.<br><br><i>📦 Pour plus d'informations, consultez la page des <a href='https://github.com/PaulBayfield/Better-IUT-RCC/releases/latest' target='_blank'>dernières mises à jour</a>.</i><br><br><strong class='fw-bold'>Merci d'utiliser Better IUT RCC !</strong>";
    notificationList.append(notificationElement);

    const buttonsListe = document.createElement('div');
    buttonsListe.classList.add('card-header-actions', 'right-end');
    buttonsListe.style.display = 'flex';

    const bouttonReject = createButton("Voir les thèmes et faire disparaître ce message", "light", "trash");
    bouttonReject.addEventListener('click', async () => {
        console.info("[Better IUT RCC] Notification cachée !");

        await browser.storage.sync.set({hideUpdateNotification23: true});

        // Ouvre les paramètres
        browser.runtime.sendMessage({openOptions: true});

        const notification = document.querySelector('#updateNotif');
        notification.remove();
    });
    buttonsListe.append(bouttonReject);

    notificationList.append(buttonsListe);

    const manifest = browser.runtime.getManifest();

    const htmlnotification = createCardBody(notificationList, `Better IUT RCC • v${manifest.version}`, 12, 'updateNotif');
    htmlnotification.style.scrollMarginTop = '90px';

    content.insertBefore(htmlnotification, firstElement);

    return htmlnotification;
}


/**
 * Fonction pour mettre à jour le menu
 * 
 * @returns {void}
 */
export function updateMenu() {
    console.info("[Better IUT RCC] Mise à jour du menu...");

    const menu = document.querySelector("nav.sidebar-navigation > ul");
    if (!menu) return;

    // Création du bouton "Restaurants"
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


    // Création du bouton "Themes"
    const li2 = document.createElement('li');
    li2.classList.add('menu-item');
    li2.id = 'menu-theme';

    const a2 = document.createElement('a');
    a2.classList.add('menu-link');
    a2.href = '#';
    a2.addEventListener('click', async () => {
        browser.runtime.sendMessage({openOptions: true});
    });

    const i2 = document.createElement('i');
    i2.classList.add('fas', 'fa-palette', 'fa-2x');

    const span2 = document.createElement('span');
    span2.classList.add('title');
    span2.textContent = 'Thèmes';

    a2.append(i2, span2);
    li2.append(a2);
    menu.append(li2);
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
    console.info("[Better IUT RCC] Ajout des boutons...");

    const userAvatar = document.querySelector('.topbar-right .topbar-btn-avatar img');
    const photoName = userAvatar.src.split('/').pop();

    const headerInfo = document.querySelector('.header-info');
    const firstChild = headerInfo.querySelector('.left');
    const cardHeader = document.createElement('div');
    const col1 = document.querySelector("#mainContent > div:first-child > div:nth-child(1)");
    const col2 = document.querySelector("#mainContent > div:first-child > div:nth-child(2)");
    const col3 = document.querySelector("#mainContent > div:first-child > div:nth-child(3)");

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
        var showMore = col1.style.display === 'none';
        col1.style.display = col2.style.display = col3.style.display = showMore ? 'block' : 'none';
        toggleMoreDetails.innerHTML = showMore 
            ? '<i class="fa-solid fa-window-minimize"></i> Minimal' 
            : '<i class="fa-solid fa-window-restore"></i> Maximal';
        if (!showMore) document.getElementById("details").open = false;
        await browser.storage.local.set({ showMoreDetails: { [photoName]: showMore } });
    });
    cardHeader.append(toggleMoreDetails);

    const github = createButton("Code", "dark", "code-fork");
    github.addEventListener('click', () => {
        window.open("https://github.com/PaulBayfield/Better-IUT-RCC", "_blank");
    });
    cardHeader.append(github);

    const extensionParametres = createButton("Paramètres", "secondary", "gears");
    extensionParametres.addEventListener('click', () => {
        browser.runtime.sendMessage({openOptions: true});
    });
    cardHeader.append(extensionParametres);

    var manifestData = chrome.runtime.getManifest();

    const version = createButton(`v${manifestData.version}`, "brown", "");
    version.addEventListener('click', () => {
        window.open("https://github.com/PaulBayfield/Better-IUT-RCC/releases", "_blank");
    });
    cardHeader.append(version);

    const cache = await browser.storage.local.get('showMoreDetails');
    var showMore = cache.showMoreDetails?.[photoName];

    if (showMore === undefined) {
        showMore = true;
        await browser.storage.local.set({ showMoreDetails: { [photoName]: showMore } });
    }

    col1.style.display = col2.style.display = col3.style.display = showMore ? 'block' : 'none';
    toggleMoreDetails.innerHTML = showMore 
        ? '<i class="fa-solid fa-window-minimize"></i> Minimal' 
        : '<i class="fa-solid fa-window-restore"></i> Maximal';

    headerInfo.append(cardHeader);

    const credits = document.createElement('div');

    const firstElement = document.createElement('span');
    firstElement.innerHTML = "✨ Proposé par deux étudiants de l'IUT de Reims, Better IUT RCC est l'extension 100% gratuite qui ne vous réclame pas des dons !<br>"
   
    const secondElement = document.createElement('span');
    secondElement.innerHTML = "💡 Une suggestion, un problème ? Contactez nous par mail : ";
    const email = document.createElement('a');
    email.href = "mailto:betteriutrrc@bayfield.dev";
    email.target = "_blank";
    email.textContent = "betteriutrrc@bayfield.dev";
    secondElement.append(email);
    const subSecondElement = document.createElement('span');
    subSecondElement.innerHTML = " ou sur LinkedIn : ";
    const linkedin = document.createElement('a');
    linkedin.href = "https://www.linkedin.com/in/PaulBayfield/";
    linkedin.target = "_blank";
    linkedin.textContent = "@PaulBayfield";
    subSecondElement.append(linkedin);
    secondElement.append(subSecondElement);

    credits.append(firstElement);
    credits.append(secondElement);
    firstChild.append(credits);
}

/**
 * Fonction pour nettoyer les cartes
 * 
 * @returns {void}
 */
export function cleanCards() {
    console.info("[Better IUT RCC] Nettoyage des cartes...");

    const contentRow = document.querySelector("#mainContent > div:first-child");
    const firstChild = document.querySelector("#mainContent > div:first-child > div:first-child");

    contentRow.removeChild(firstChild);
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
    console.info("[Better IUT RCC] Création d'une carte : " + title);

    const col = document.createElement('div');
    col.classList.add('col-sm-12', `col-md-${colLength}`);
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
    cardBody.style.overflowX = 'auto';
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
 * @param {String} id
 * @param {Number} height
 * @param {Boolean} horizontal
 * @returns {Promise<void>}
 */
function createChart(data, type, xaxiscategories, id, height = 245, horizontal = false) {
    console.info("[Better IUT RCC] Création d'un graphique : " + id);

    data = data.map(value => value < 0 ? 0 : value);

    const options = {
        id: id,
        series: [{ data }],
        chart : { type, height: height},
        colors: [
            ({ value }) => (value < 8 ? "#f96868" : value < 10 ? "#faa64b" : "#15c377"),
        ],
        plotOptions: { bar: { borderRadius: 4, horizontal: horizontal } },
        dataLabels: { enabled: false },
        xaxis: {
            labels: {
                show: true,
            },
            categories: xaxiscategories
        },
        yaxis: {
            labels: {
                show: true,
                align: 'left',
                style: {
                    fontSize: '12px',
                    fontWeight: 400,
                },
            }
        },
            
    };

    const chart = new ApexCharts(document.querySelector("#" + id), options);
    return chart.render();
}

/**
 * Fonction pour créer la carte du bilan
 * 
 * @returns {Promise<void>}
 */
export async function createBilanCard() {
    console.info("[Better IUT RCC] Création de la carte de bilan...");

    const userAvatar = document.querySelector('.topbar-right .topbar-btn-avatar img');
    const photoName = userAvatar.src.split('/').pop();
    const cache = await browser.storage.local.get('userBilanCache');
    let user = null;

    if(cache.userBilanCache !== undefined && cache.userBilanCache[photoName] !== undefined) {
        console.info("[Better IUT RCC] Récupération de l'utilisateur en cache...");
        user = cache.userBilanCache[photoName];
        console.info("[Better IUT RCC] > " + user);
    } else {
        console.info("[Better IUT RCC] Récupération de l'utilisateur depuis l'intranet...");
        const profileRequest = await fetch("https://iut-rcc-intranet.univ-reims.fr/fr/utilisateur/mon-profil");
        console.info("[Better IUT RCC] > " + profileRequest.status);
        const data = await profileRequest.text();
        const page = document.createElement('div');
        page.innerHTML = data.trim();
        const nav = page.querySelector(".nav");

        user = nav.children[0].getAttribute('href').split('/')[4].split('/')[0];

        await browser.storage.local.set({
            userBilanCache: {
                [photoName]: user,
            }
        })
    }

    if (!user) return;

    console.info("[Better IUT RCC] Récupération du bilan de l'utilisateur...");
    const bilanRequest = await fetch('https://iut-rcc-intranet.univ-reims.fr/fr/etudiant/profil/' + user + '/apc_notes');
    console.info("[Better IUT RCC] > " + bilanRequest.status);
    const bilanData = await bilanRequest.text();
    const content = document.querySelector("#mainContent > div:first-child");
    const before = document.querySelector("#mainContent > div:first-child > div:nth-child(5)");

    var card = document.createElement('div');
    card.innerHTML = bilanData.trim();
    card.querySelector(".card-header-actions").remove();
    content.insertBefore(card, before);
}

/**
 * Fonction pour récupérer et trier toutes les notes d'un tableau HTML.
 * 
 * @param {HTMLTableElement} htmlTable - Le tableau HTML contenant les notes.
 * @returns {Array} - Tableau trié d'objets de note.
 */
export function fetchAllSortedGrades(htmlTable) {
    console.info("[Better IUT RCC] Récupération et tri des notes...");

    const tbody = htmlTable.querySelector("tbody");
    let grades = [];

    const rows = tbody.querySelectorAll('tr');
    rows.forEach(row => {
        if  (row.querySelector('td:nth-child(7) > button')) {
            let buttonUrl = row.querySelector('td:nth-child(7) > button').getAttribute('data-modal-modal-url-value').split('/');
            let gradeId = parseInt(buttonUrl[buttonUrl.length - 1]);
            let gradeSubject = row.querySelector("td:nth-child(1)").textContent;
            let gradeSubjectDescription = row.querySelector("td:nth-child(1)").querySelector('abbr')?.getAttribute('title');
            let gradeEvaluation = row.querySelector("td:nth-child(2)").textContent;
            let gradeDate = row.querySelector("td:nth-child(3)").textContent;
            let gradeComment = row.querySelector("td:nth-child(4)").textContent;
            let gradeValue = Number(row.querySelector('td:nth-child(5) .badge').textContent.replace(',', '.'));
            gradeValue = isNaN(gradeValue) ? -1 : gradeValue;
            let gradeCoefficient = Number(row.querySelector('td:nth-child(6)').textContent);

            let grade = {
                id: gradeId,
                subject: gradeSubject,
                subjectDescription: gradeSubjectDescription,
                evaluation: gradeEvaluation,
                date: gradeDate,
                comment: gradeComment,
                grade: gradeValue,
                coefficient: gradeCoefficient
            };

            grades.push(grade);
        } else {
            console.warn("[Better IUT RCC] Aucune note n'a été saisie");
        }
    });

    grades.sort((a, b) => a.subject.localeCompare(b.subject));

    return grades;
}

/**
 * Fonction pour mettre à jour la barre de navigation
 * 
 * @returns {void}
 */
export function updateTopBar() {
    console.info("[Better IUT RCC] Mise à jour de la barre de navigation...");

    const searchButton = document.querySelector('div[data-controller="lookup-search"]');
    if (!searchButton) return;
    const searchLink = searchButton.querySelector('a');
    if (!searchLink) return;
    searchLink.setAttribute('data-bs-original-title', 'Rechercher dans l\'intranet');
    const spawTwo = searchButton.querySelector('span:nth-child(3)');
    if (!spawTwo) return;
    spawTwo.innerHTML = 'Rechercher <kbd>CTRL</kbd>+<kbd>K</kbd>';

    console.info("[Better IUT RCC] Mise à jour de la barre de navigation terminée !");
}

/**
 * Function to generate the HTML code for averages.
 * 
 * @param {Average} average The averages per UE.
 * @returns {void}
 */
export function generateHtml(average) {
    console.info("[Better IUT RCC] Génération de l'HTML pour les moyennes...");

    // HTML generation
    const content = document.querySelector("#mainContent > div:first-child");
    const firstElement = document.querySelector("#mainContent > div:first-child > div:first-child");

    // Averages table
    const table = document.createElement('table');
    table.classList.add('table', 'table-border', 'table-striped');

    const header = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const body = document.createElement('tbody');
    const bodyRow = document.createElement('tr');

    for (const [subject, avg] of Object.entries(average.averageSubjectData)) {
        const headerCell = document.createElement('th');
        headerCell.classList.add('text-center');
        headerCell.innerHTML = subject;
        headerRow.append(headerCell);

        const cell = document.createElement('td');
        cell.classList.add('text-center');
        cell.innerHTML = `<span class="fs-11 badge ${avg < 8 ? "bg-danger" :avg < 10 ? "bg-warning" : "bg-success"}">${avg}</span>`;
        bodyRow.append(cell);
    }

    header.append(headerRow);
    body.append(bodyRow);
    table.append(header, body);

    const htmlAveragesTable = createCardBody(table, 'Vos moyennes', 12, 'moyennes');

    // Validation ou non du semestre
    const validationList = document.createElement('ol');
    validationList.className = 'timeline timeline-activity timeline-point-sm timeline-content-right text-left w-100';
    const validationElement = document.createElement('li');
    validationElement.className = 'alert alert-' + (average.isValidSemester() ? 'success' : 'danger');
    validationElement.innerHTML = '<strong class="fw-semibold">Validation : </strong> ' + Utils.boolToString(average.isValidSemester());
    validationList.append(validationElement);
    const htmlValidation = createCardBody(validationList, 'Validation du semestre', 12);

    const leftColumn = document.createElement('div');
    leftColumn.classList.add('col-sm-12', 'col-md-6');
    leftColumn.append(htmlAveragesTable, htmlValidation);
    content.insertBefore(leftColumn, firstElement);

    // Chart card
    const chartDiv = document.createElement('div');
    chartDiv.id = "chart";

    // Create container for first chart
    const chartDiv1 = document.createElement('div');
    chartDiv1.id = "chart1";
    chartDiv1.style.scrollMarginTop = '90px';
    content.insertBefore(createCardBody(chartDiv1, 'Moyennes par Compétences', 6, 'graph1'), firstElement);

    // Render first chart
    createChart(
        Object.values(average.averageSubjectData), 
        'bar', 
        Object.keys(average.averageSubjectData),
        "chart1"
    );

    // Create container for second chart
    const chartDiv2 = document.createElement('div');
    chartDiv2.id = "chart2";
    content.insertBefore(createCardBody(chartDiv2, 'Moyennes par Matières', 12, 'graph2'), firstElement);

    // Render second chart
    createChart(
        Object.values(average.averageGradeData), 
        'bar', 
        Object.keys(average.averageGradeData).map(key => average.subjectName(key)),
        "chart2",
        500,
        true
    );
}

/**
 * Fonction pour ordonner les cartes sur la page principale.
 * 
 * @returns {void}
 */
export function orderCards() {
    console.info("[Better IUT RCC] Tri des cartes...");

    // Sélection des éléments HTML à réorganiser
    const content = document.querySelector("#mainContent > div:first-child");
    const absences = document.querySelector("#mainContent > div:first-child > div:nth-child(1)");
    const notes = document.querySelector("#mainContent > div:first-child > div:nth-child(2)");
    notes.id = "notes"; // Ajout de l'ID "notes" pour identifier cet élément
    notes.style.scrollMarginTop = '90px'; // Ajout d'une marge supérieure pour la navigation
    const competences = document.querySelector("#mainContent > div:first-child > div:nth-child(3)");
    const liens = document.querySelector("#mainContent > div:first-child > div:nth-child(4)");
    const contact = document.querySelector("#mainContent > div:first-child > div:nth-child(5)");

    // Modification de l'ID et de la marge supérieure pour les éléments "absences" et "statut"
    absences.id = "absences";
    absences.style.scrollMarginTop = '90px';

    // Réorganisation des éléments
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
 * @param {Average} average - Objet de moyenne.
 * @param {Array} sortedGrades - Tableau d'objets de notes triées.
 * @param {Array} knownGrades - Tableau d'identifiants de notes connues.
 * @returns {HTMLTableElement} - Élément de tableau HTML recréé.
 */
export function recreateTable(average, sortedGrades, knownGrades) {
    console.info("[Better IUT RCC] Recréation du tableau...");

    let table = document.createElement('table');
    table.classList.add('table', 'table-border', 'table-striped');

    let thead = document.createElement('thead');
    table.appendChild(thead);

    let trHead = document.createElement('tr');
    thead.appendChild(trHead);

    const headers = ['', 'Matière', 'Évaluation', 'Date', 'Commentaire de l\'évaluation', 'Note', 'Coefficient', 'Informations'];
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
                subject: `<i class="fa-solid fa-calculator"></i> ${grade.subject}`,
                subjectDescription: average.subjectDescription,
                evaluation: '━ Moyenne ━━━━',
                grade: average.subjectAverage(grade.subject.trim()),
            }, true);
            tbody.appendChild(trAverage);
        }
    });

    let trGeneralAverage = createRow({
        subject: '',
        evaluation: '━ Moyenne Générale',
        grade: average.overallAverage()
    }, true);
    tbody.appendChild(trGeneralAverage);

    return table;
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
    console.info("[Better IUT RCC] - Création d'une ligne de tableau : " + grade.evaluation);

    let tr = document.createElement('tr');
    if (isAverage) tr.classList.add('moyenne');
    if (isNew) tr.classList.add('new-note');

    let subject = grade.subject;
    if (grade.subjectDescription) {
        subject = [grade.subject, grade.subjectDescription]
    };

    const columns = [
        null,
        subject,
        grade.evaluation, 
        isAverage ? '' : grade.date, 
        isAverage ? '' : grade.comment, 
        formatGrade(parseFloat(grade.grade)),
        isAverage ? '' : grade.coefficient.toString(), 
        isAverage ? '' : createInfoButton(grade.id)
    ];

    columns.forEach(content => {
        if (content === null) {
            if (isNew) {
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = 'note-' + grade.id;
                checkbox.value = grade.id;
                let td = document.createElement('td');
                td.appendChild(checkbox);
                tr.appendChild(td);
                return;
            } else {
                let td = document.createElement('td');
                tr.appendChild(td);
                return;
            }
        }

        let td = document.createElement('td');
        if (Array.isArray(content)) {
            let abbr = document.createElement('abbr');
            abbr.textContent = content[0];
            abbr.title = content[1];
            td.appendChild(abbr);
        } else
            if (typeof content === 'string' || content instanceof String) {
                td.innerHTML = content;
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
    console.info("[Better IUT RCC]   - Formatage de la note : " + grade);

    let span = document.createElement('span');

    if (grade >= 10) {
        span.classList.add('badge', 'bg-success');
        span.textContent = grade.toPrecision(4).toString();
    } else if (grade >= 8 ) {
        span.classList.add('badge', 'bg-warning');
        span.textContent = grade.toPrecision(4).toString();
    } else if (grade == -1) {
        span.classList.add('badge', 'bg-brown');
        span.textContent = 'Pas de note ou pas de saisie ?';
    } else {
        span.classList.add('badge', 'bg-danger');
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
 * Fonction pour ajouter une barre de recherche.
 * 
 * @returns {HTMLButtonElement} - Élément de barre de recherche HTML créé.
 */
export function addSearchBar() {
    const label = document.createElement('label');
    label.for = 'search';
    label.classList.add('search-label');
    label.textContent = 'Rechercher une matière...';

    const input = document.createElement('input');
    input.id = 'search';
    input.type = 'search';
    input.placeholder = 'Rechercher une matière...';

    const div = document.createElement('div');
    div.classList.add('search-bar', 'btn', 'btn-sm');
    div.appendChild(label);
    div.appendChild(input);

    let actions = document.querySelector("#mainContent > div:first-child > div:nth-child(4) > div > header > div")
    actions.prepend(div)

    return input;
}

/**
 * Fonction pour créer l'entête du tableau.
 * 
 * @returns {HTMLDivElement} - Élément de div HTML créé.
 */
export function createCardHead() {
    console.info("[Better IUT RCC] Création de l'entête du tableau...");

    const head = document.createElement('div');
    head.classList.add('card-header');
    head.style.display = 'flex';
    head.style.justifyContent = 'space-between';

    const card = document.querySelector("#mainContent > div:first-child > div:nth-child(4) > div > header");
    card.append(head);

    return head;
}

/**
 * Fonction pour ajouter un bouton de réinitialisation.
 * 
 * @returns {HTMLButtonElement} - Élément de bouton HTML créé.
 */
export function addResetButton(head) {
    let button = createButton("Réinitialiser les notes connues", "danger", "trash-can")
    head.prepend(button)

    return button;
}

/**
 * Fonction pour ajouter un bouton de sauvegarde.
 * 
 * @returns {HTMLButtonElement} - Élément de bouton HTML créé.
 */
export function addSaveButton(head) {
    let button = createButton('Sauvegarder les notes connues', 'pink', 'save')
    head.prepend(button)

    return button;
}
