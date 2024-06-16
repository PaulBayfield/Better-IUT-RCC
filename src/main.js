import 'apexcharts/dist/apexcharts.css';
import './css/animation.css';
import './css/custom.scss';

import { addButtons, applyStyle, cleanCards, createBilanCard, generateHtml, getAverage, orderCards, fetchAllSortedGrades, recreateTable, updateMenu, addSaveButton, addResetButton, applyDarkTheme } from "./functions";
import { Utils } from './utils.js';
import { Average } from './average.js';
import * as browser from 'webextension-polyfill';

(async () => {
    // Gestion du thème sombre
    applyDarkTheme();

    // Mise à jour de la sidebar dès le chargement de la page pour s'assurer qu'il soit toujours à jour
    await updateMenu();

    // Vérifie si l'utilisateur est sur la page "tableau de bord"
    if (window.location.pathname === "/fr/tableau-de-bord") {
        document.querySelector('#darkMode').remove();

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

            addResetButton().addEventListener('click', async (e) => {
                e.preventDefault();
                await browser.storage.sync.clear();
                location.reload();
            });

            addSaveButton().addEventListener('click', (e) => {
                e.preventDefault();
        
                let ids = [];
                notes.forEach((note) => {
                    ids.push(note.id);
                });
        
                browser.storage.sync.set({notesAlreadyKnow: ids}).then(() => {
                    location.reload();
                });
            });

            applyStyle();
        });

        applyStyle();
    } 
    // Vérifie si l'utilisateur est sur la page "crous"
    else if (window.location.pathname === "/fr/crous") {
        // Effectue une requête pour obtenir le menu du CROUS
        const request = await fetch("https://croustillant.bayfield.dev/api/intranet/menu");
        let data = await request.text();
        data = data.trim();

        // Parse le HTML reçu de la requête
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, "text/html");
        const html = doc.querySelector("html");

        // Remplace le contenu de la page actuelle par le contenu HTML reçu
        document.documentElement.innerHTML = html.innerHTML;

        // Gestion du thème sombre
        applyDarkTheme();

        // Ajoute un écouteur d'événement pour changer l'image du menu en fonction du restaurant sélectionné
        document.getElementById("restaurant").addEventListener("change", function () {
            var restaurant = this.value;
            var img = document.getElementById("image-menu");
            img.src = "https://croustillant.bayfield.dev/api/intranet?restaurant=" + restaurant;
        });
    }
})();
