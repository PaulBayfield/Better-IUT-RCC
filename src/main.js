import 'apexcharts/dist/apexcharts.css';
import './css/fix.css'

import { addButtons, cleanCards, createBilanCard, generateHtml, updateTopBar, createCardHead, orderCards, fetchAllSortedGrades, recreateTable, updateMenu, addSearchBar, addSaveButton, addResetButton, addAvisNotification, addUpdateNotification, addInformationButton } from "./functions";
import { applyTheme } from './theme.js';
import { Utils } from './utils.js';
import { Average } from './average.js';
import * as browser from 'webextension-polyfill';

var manifestData = browser.runtime.getManifest();

console.info("[Better IUT RCC] Better IUT RCC lancé !");
console.info(`[Better IUT RCC] Version : ${manifestData.version}`);

const themeResult = await browser.storage.sync.get('theme');
console.info("[Better IUT RCC] Récupération du thème actif...");
let activeTheme = themeResult.theme;
if (!activeTheme) {
    console.warn("[Better IUT RCC] Aucun thème actif trouvé, utilisation du thème par défaut");
    await browser.storage.sync.set({ theme: "default" });
    activeTheme = "default";
}
console.info(`[Better IUT RCC] Thème actif : ${activeTheme}`);

(async () => {
    // Gestion du thème sombre
    applyTheme();

    // Mise à jour de la sidebar dès le chargement de la page pour s'assurer qu'il soit toujours à jour
    updateMenu();
    updateTopBar();

    const darkModeButton = document.getElementById("darkMode");
    if (darkModeButton) {
        darkModeButton.addEventListener("click", function () {
            console.info("[Better IUT RCC] Changement de thème en cours...");

            browser.storage.local.set({ darkTheme: document.querySelector('body').classList.contains('dark-theme') });

            console.info("[Better IUT RCC] Thème actuel : " + (document.querySelector('body').classList.contains('dark-theme') ? "clair" : "sombre"));
            console.info("[Better IUT RCC] Changement de thème terminé !");
        });
    }

    // Listen for class changes on the body element
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.attributeName === "class") {
                if (document.querySelector('body').classList.contains('dark-theme')) {
                    console.info("[Better IUT RCC] Thème sombre détecté !");

                    browser.storage.local.set({ darkTheme: true });
                } else {
                    console.info("[Better IUT RCC] Thème clair détecté !");

                    browser.storage.local.set({ darkTheme: false });
                }
            }
        });
    });

    observer.observe(document.querySelector('body'), {
        attributes: true
    });

    // Vérifie si l'utilisateur est sur la page "tableau de bord"
    if (window.location.pathname === "/fr/tableau-de-bord") {
        console.info("[Better IUT RCC] Page de tableau de bord détectée !");

        const average = new Average();

        // Nettoie les cartes et les réorganise
        cleanCards();
        orderCards();

        // Récupère les données moyennes par UE et génère le graphique
        const title = document.querySelector("#details > div > div > h4");

        // Vérifie si le titre et les données moyennes ne sont pas vides et si le titre est correct, puis génère le HTML
        if (!Utils.isEmpty(title, average.averageGradeData) && title.textContent === "Modalités de Contrôle des Connaissances") {
            generateHtml(average);
        }

        // Crée une carte de bilan
        await createBilanCard();

        // Ajoute des styles et des boutons
        await addButtons();

        browser.storage.sync.get('notesAlreadyKnow').then((result) => {
            const tableau = document.querySelector("#mainContent > div:first-child > div:nth-child(4) > div > div > table");
            const notes = fetchAllSortedGrades(tableau);
            tableau.replaceWith(recreateTable(average, notes, result.notesAlreadyKnow || []));

            const tableHead = createCardHead();

            const checkboxes = document.querySelectorAll("tr.new-note input[type='checkbox']");

            addResetButton(tableHead).addEventListener('click', async (e) => {
                console.warn("[Better IUT RCC] Réinitialisation des notes déjà connues !");

                e.preventDefault();
                await browser.storage.sync.remove('notesAlreadyKnow');
                location.reload();
            });

            addSaveButton(tableHead, checkboxes).addEventListener('click', (e) => {
                console.info("[Better IUT RCC] Sauvegarde des notes déjà connues !");

                e.preventDefault();

                let ids = [];
                const checkboxes = document.querySelectorAll("tr.new-note input[type='checkbox']:checked");
                checkboxes.forEach((checkbox) => {
                    console.info(`[Better IUT RCC] Ajout de la note ${checkbox.value} !`);
                    ids.push(parseInt(checkbox.value));
                });

                if (ids.length === 0) {
                    console.warn("[Better IUT RCC] Aucune note sélectionnée ! Sauvegarde de toutes les notes...");

                    notes.forEach((note) => {
                        console.info(`[Better IUT RCC] Ajout de la note ${note.id} !`);
                        ids.push(note.id);
                    });
                } else {
                    console.info("[Better IUT RCC] Ajout des notes déjà sauvegardées...");

                    const oldNotes = result.notesAlreadyKnow || [];
                    oldNotes.forEach((note) => {
                        if (!ids.includes(note)) {
                            console.info(`[Better IUT RCC] Ajout de la note ${note} !`);
                            ids.push(note);
                        }
                    });
                }

                browser.storage.sync.set({notesAlreadyKnow: ids}).then(() => {
                    location.reload();
                });
            });

            const rows = document.querySelectorAll("#mainContent > div:first-child > div:nth-child(4) > div > div > table > tbody > tr");
            addSearchBar().addEventListener('input', (e) => {
                const search = e.target.value.toLowerCase();

                if (search.length === 0) {
                    console.info("[Better IUT RCC] Recherche supprimée !");
                } else  {
                    console.info(`[Better IUT RCC] Recherche : ${search}`);
                };

                rows.forEach((row) => {
                    const subjectCode = row.querySelector("td:nth-child(1)").textContent.toLowerCase();
                    const subject = row.querySelector("td:nth-child(2)").textContent.toLowerCase();
                    const comment = row.querySelector("td:nth-child(4)").textContent.toLowerCase();
                    const grade = row.querySelector("td:nth-child(5)").textContent.toLowerCase();

                    const isMatch = subjectCode.includes(search) || subject.includes(search) || comment.includes(search) || grade.includes(search);
                
                    row.style.display = isMatch ? "" : "none";
                });
            });

            if (checkboxes.length > 0) {
                addInformationButton(tableHead).addEventListener('click', (e) => {
                    e.preventDefault();

                    alert("Certaines notes sont actuellement en surbrillance. Cela signifie que vous disposez de nouvelles notes que vous n'avez pas encore sauvegardées. Pour les sauvegarder, cochez les cases correspondantes et cliquez sur le bouton \"Sauvegarder\".\n\nSi vous ne cochez aucune case, toutes les notes seront sauvegardées.");

                    console.info("[Better IUT RCC] Informations concernant la surbrillance affichées !");
                });
            }

            console.info("[Better IUT RCC] Vérification des paramètres de notification...");
            browser.storage.local.get('hideAvisNotification').then((result) => {
                console.info(`[Better IUT RCC] Paramètre de notification : ${result.hideAvisNotification}`);
                if (result.hideAvisNotification === undefined || result.hideAvisNotification === false) {
                    addAvisNotification().scrollIntoView({ behavior: "smooth" });
                }
            });

            browser.storage.sync.get('hideUpdateNotification23').then((result) => {
                console.info(`[Better IUT RCC] Paramètre de notification : ${result.hideUpdateNotification23}`);
                if (result.hideUpdateNotification23 === undefined || result.hideUpdateNotification23 === false) {
                    addUpdateNotification().scrollIntoView({ behavior: "smooth" });
                }
            });
        });
    } 
    // Vérifie si l'utilisateur est sur la page "crous"
    else if (window.location.pathname === "/fr/crous") {
        console.info("[Better IUT RCC] Page du CROUS détectée !");

        // Gestion du thème sombre
        applyTheme();

        // Mise à jour de la sidebar dès le chargement de la page pour s'assurer qu'il soit toujours à jour
        updateMenu();

        let theme = '?theme=light';
        const t = await browser.storage.local.get('darkTheme');
        if (t !== undefined && t.darkTheme) {
            theme = '?theme=dark';
        }

        // Effectue une requête pour obtenir le menu du CROUS
        console.info("[Better IUT RCC] Récupération du menu du CROUS...");
        const request = await fetch("https://betteriutrcc.bayfield.dev/v1/menu" + theme);
        console.info("[Better IUT RCC] Menu du CROUS récupéré ! Traitement en cours...");
        let data = await request.text();
        data = data.trim();

        // Parse le HTML reçu de la requête
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, "text/html");
        const html = doc.querySelector("html");

        // Remplace le contenu de la page actuelle par le contenu HTML reçu
        document.documentElement.innerHTML = html.innerHTML;

        const darkModeButton = document.getElementById("darkMode");
        if (darkModeButton) {
            darkModeButton.addEventListener("click", async function () {
                console.info("[Better IUT RCC] Changement de thème en cours...");

                let theme = '?theme=light';
                if (document.querySelector('body').classList.contains('dark-theme')) {
                    document.querySelector('body').classList.remove('dark-theme');
                    darkModeButton.innerHTML = '<i class="fas fa-adjust"></i> Dark Mode Off';
                } else {
                    document.querySelector('body').classList.add('dark-theme');
                    darkModeButton.innerHTML = '<i class="fas fa-adjust"></i> Dark Mode On';
                    theme = '?theme=dark';
                }

                const date = new Date().toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                }).split('/').join('-');

                var restaurant = document.getElementById("restaurant").value;
                var img = document.getElementById("image-menu");

                img.src = "https://api.croustillant.menu/v1/restaurants/" + restaurant + "/menu/" + date + "/image" + theme;

                browser.storage.local.set({ darkTheme: document.querySelector('body').classList.contains('dark-theme') });

                console.info("[Better IUT RCC] Thème actuel : " + (document.querySelector('body').classList.contains('dark-theme') ? "clair" : "sombre"));
                console.info("[Better IUT RCC] Changement de thème terminé !");
            });
        }

        // Gestion du thème sombre
        applyTheme();

        const themeButton = document.getElementById("menu-themes");
        if (themeButton) {
            themeButton.addEventListener('click', async () => {
                browser.runtime.sendMessage({openOptions: true});
            });
        };

        const shareButton = document.getElementById("btn-share");
        if (shareButton) {
            shareButton.addEventListener('click', async () => {
                const link = document.getElementById("image-menu");

                if (navigator.share) {
                    navigator.share({
                        title: "Menu du CROUS",
                        text: "Voici le menu du CROUS de l'IUT de Roanne",
                        url: link.src
                    }).then(() => {
                        console.info("[Better IUT RCC] Partage du menu du CROUS effectué !");
                    }).catch((error) => {
                        console.error("[Better IUT RCC] Erreur lors du partage du menu du CROUS :", error);
                    });
                } else {
                    console.warn("[Better IUT RCC] Partage non supporté !");
                }
            });
        };

        const refreshButton = document.getElementById("btn-refresh");
        if (refreshButton) {
            refreshButton.addEventListener('click', async () => {
                const date = new Date().toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                }).split('/').join('-');

                var restaurant = document.getElementById("restaurant").value;
                var img = document.getElementById("image-menu");

                img.src = "https://api.croustillant.menu/v1/restaurants/" + restaurant + "/menu/" + date + "/image" + theme;

                console.info("[Better IUT RCC] Menu du CROUS actualisé !");

                alert("Le menu du CROUS a été actualisé avec succès !");
            });
        };

        // Ajoute un écouteur d'événement pour changer l'image du menu en fonction du restaurant sélectionné
        document.getElementById("restaurant").addEventListener("change", async function () {
            var restaurant = this.value;
            var img = document.getElementById("image-menu");

            browser.storage.local.set({ restaurant: restaurant });

            let theme = '?theme=light';
            const t = await browser.storage.local.get('darkTheme');
            if (t !== undefined && t.darkTheme) {
                theme = '?theme=dark';
            }

            const date = new Date().toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).split('/').join('-');

            img.src = "https://api.croustillant.menu/v1/restaurants/" + restaurant + "/menu/" + date + "/image" + theme;
        });

        const restaurant = await browser.storage.local.get('restaurant');
        if (restaurant.restaurant && restaurant.restaurant !== document.getElementById("restaurant").value) {
            document.getElementById("restaurant").value = restaurant.restaurant;

            let theme = '?theme=light';
            const t = await browser.storage.local.get('darkTheme');

            if (t !== undefined && t.darkTheme) {
                theme = '?theme=dark';
            }

            const date = new Date().toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).split('/').join('-');

            var img = document.getElementById("image-menu");
            img.src = "https://api.croustillant.menu/v1/restaurants/" + restaurant.restaurant + "/menu/" + date + "/image" + theme;

            console.info("[Better IUT RCC] Menu du CROUS restauré !");
        }
    }
})();
