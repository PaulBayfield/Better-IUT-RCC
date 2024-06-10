import 'apexcharts/dist/apexcharts.css';
import './css/animation.css';
import './css/custom.css';

import { addButtons, applyStyle, cleanCards, createBilanCard, generateHtml, getAverage, orderCards, fetchAllSortedGrades, recreateTable, updateMenu, addSaveButton, addResetButton } from "./functions";
import { Utils } from './utils';
import * as browser from 'webextension-polyfill';

(async () => {
    // Mise à jour de la sidebar dès le chargement de la page pour que le menu soit toujours à jour
    await updateMenu();

    if (window.location.pathname === "/fr/tableau-de-bord") {
        // Récupération des notes connues
        browser.storage.sync.get('notesAlreadyKnow').then((result) => {
            const tableau = document.querySelector("#mainContent > div.row > div:nth-child(4) > div > div > table")
            let notes = fetchAllSortedGrades(tableau)
        
            tableau.replaceWith(recreateTable(notes, result.notesAlreadyKnow || []))

            addResetButton().addEventListener('click', async (e) => {
                e.preventDefault();
                await browser.storage.sync.clear();
                location.reload();
            })

            addSaveButton().addEventListener('click', (e) => {
                e.preventDefault();
        
                let ids = []
                notes.forEach((note) => {
                    ids.push(note.id)
                })
        
                browser.storage.sync.set({notesAlreadyKnow: ids}).then(() => {
                    location.reload()
                })
            })
        })
        
        // Récupération des données et génération du graphique
        const averageDataByUE = getAverage();
        const title = document.querySelector("#mainContent > div > div:nth-child(6) > div > h4");
        
        if (!Utils.isEmpty(title, averageDataByUE) && title.textContent === "Modalités de Contrôle des Connaissances") {
            generateHtml(averageDataByUE);
        }
        
        // Nettoyage des cartes et réorganisation
        cleanCards();
        orderCards();

        // Création de la carte de bilan
        await createBilanCard();

        // Ajout des styles et des boutons
        await addButtons();
        applyStyle();
    } else if (window.location.pathname === "/fr/crous") {
        const request = await fetch("https://croustillant.bayfield.dev/api/intranet/menu");
        let data = await request.text();
        data = data.trim();

        const parser = new DOMParser();
        const doc = parser.parseFromString(data, "text/html");
        const html = doc.querySelector("html");

        document.documentElement.innerHTML = html.innerHTML;

        document.getElementById("restaurant").addEventListener("change", function () {
            var restaurant = this.value;
            var img = document.getElementById("image-menu");
            img.src ="https://croustillant.bayfield.dev/api/intranet?restaurant=" + restaurant;
        });
    }
})();