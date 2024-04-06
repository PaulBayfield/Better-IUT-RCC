import 'apexcharts/dist/apexcharts.css';
import './css/animation.css';
import './css/custom.css';

import { addButtons, addSaveButton, ajouterBoutonSauvegarde, applyStyle, cleanCards, createBilanCard, generateHtml, getAverage, orderCards, recreerTableau, recupererToutesLesNotesTriees } from "./functions";
import { Utils } from './utils';
import * as browser from 'webextension-polyfill';

// Récupération des notes connues
browser.storage.sync.get('notesAlreadyKnow').then((result) => {
    const notesConnues = result.notesAlreadyKnow || []

    const tableau = document.querySelector("#mainContent > div.row > div:nth-child(4) > div > div > table")
    let notes = recupererToutesLesNotesTriees(tableau)

    let tableauTrie = recreerTableau(notes, notesConnues)

    tableau.replaceWith(tableauTrie)


    const boutonSauvegarde = ajouterBoutonSauvegarde()
    // Quand le bouton est cliqué, on sauvegarder les notes, puis en recrée le tableau
    boutonSauvegarde.addEventListener('click', (e) => {
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
createBilanCard();

// Ajout des styles et des boutons
applyStyle();
addButtons();