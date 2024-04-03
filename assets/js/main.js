// Add header
const styleElement = document.createElement('link');
styleElement.href = 'https://cdn.jsdelivr.net/npm/apexcharts@3.40.0/dist/apexcharts.min.css';
document.head.appendChild(styleElement);


// Lancement du script une fois la page chargée
window.addEventListener('load', () => {
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
});
