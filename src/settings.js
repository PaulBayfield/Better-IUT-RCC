import * as browser from 'webextension-polyfill';
import { getAvailableThemes } from './theme';


window.addEventListener('load', async () => {
    const manifest = browser.runtime.getManifest();
    const version = document.querySelector('#version');
    version.textContent = manifest.version;
});


document.addEventListener('DOMContentLoaded', async function () {
    var openOptionsBtn = document.getElementById('clearCacheBtn');
    openOptionsBtn.addEventListener('click', function () {
        var r = confirm("Êtes-vous sûr de vouloir réinitialiser les données de l'extension ? Cela supprimera toutes les données enregistrées par l'extension, y compris les identifiants et les notes enregistrées.\n\n⚠️ Cette action est irréversible !");
        if (!r) {
            return;
        }

        browser.storage.sync.clear().then(() => {
            console.info("[Better IUT RCC] SYNC Cache nettoyé !");
        });
        browser.storage.local.clear().then(() => {
            console.info("[Better IUT RCC] LOCAL Cache nettoyé !");
        });

        alert("Les données de l'extension ont été réinitialisées avec succès !\n\n⚠️ Veuillez recharger toutes les pages de l'intranet pour appliquer les modifications.");

        window.close();
    });


    // Récupère les thèmes disponibles
    console.info("[Better IUT RCC] Récupération des thèmes disponibles...");
    const themes = await getAvailableThemes();


    // Récupère le thème actif
    const themeResult = await browser.storage.sync.get('theme');
    console.info("[Better IUT RCC] Récupération du thème actif...", themeResult);
    const activeTheme = themeResult.theme;


    // Chargement des meta-données du thème
    const metadata = await browser.storage.local.get(`${activeTheme}-metadata`);

    if (!metadata[`${activeTheme}-metadata`]) {
        console.warn("[Better IUT RCC] Aucun métadonnées trouvées pour le thème actif");
        const currentTheme = document.getElementById('current-theme');
        currentTheme.textContent = '?';
    } else {
        console.info("[Better IUT RCC] Récupération des métadonnées du thème actif...", metadata);
        const currentTheme = document.getElementById('current-theme');
        currentTheme.textContent = metadata[`${activeTheme}-metadata`].name;
    }

    const themesContainer = document.getElementById('themes-list');
    themes.forEach((theme) => {
        const card = document.createElement('div');
        card.classList.add('card');

        const title = document.createElement('h3');
        title.classList.add('title');
        title.textContent = theme.name;
        const version = document.createElement('span');
        version.classList.add('version');
        version.textContent = `v${theme.version}`;
        title.appendChild(version);
        card.appendChild(title);

        const content1 = document.createElement('div');
        content1.classList.add('content');
        const quote = document.createElement('i');
        quote.classList.add('fas', 'fa-quote-left');
        content1.appendChild(quote);
        const text = document.createElement('p');
        text.classList.add('text');
        text.textContent = theme.description;
        content1.appendChild(text);
        card.appendChild(content1);

        const content2 = document.createElement('div');
        content2.classList.add('content');
        const user = document.createElement('i');
        user.classList.add('fas', 'fa-user');
        content2.appendChild(user);
        const author = document.createElement('p');
        author.textContent = `Réalisé par : ${theme.author}`;
        content2.appendChild(author);
        card.appendChild(content2);

        const preview = document.createElement('div');
        preview.classList.add('preview');
        const imageLight = document.createElement('img');
        imageLight.src = `https://betteriutrcc.bayfield.dev${theme['preview-light']}`;
        imageLight.alt = "Thème actif, version claire";
        imageLight.classList.add('image');
        preview.appendChild(imageLight);
        const imageDark = document.createElement('img');
        imageDark.src = `https://betteriutrcc.bayfield.dev${theme['preview-dark']}`;
        imageDark.alt = "Thème actif, version sombre";
        imageDark.classList.add('image');
        preview.appendChild(imageDark);
        card.appendChild(preview);

        if (activeTheme === theme.id) {
            const button = document.createElement('button');
            button.classList.add('button');
            button.textContent = "Thème actif";
            button.disabled = true;
            card.appendChild(button);
        } else {
            const button = document.createElement('button');
            button.classList.add('button');
            button.textContent = "Activer";

            button.addEventListener('click', async () => {
                console.info(`[Better IUT RCC] Activation du thème : ${theme.id} (${theme.version})`);

                alert("🔄️ Veuillez recharger toutes les pages de l'intranet pour appliquer les modifications.\n\n📝 Dû à des limitations techniques, l'extension ne peut pas rafraîchir automatiquement la/les page(s) ouverte(s) de l'intranet.");

                await browser.storage.sync.set({ theme: theme.id });
                window.location.reload();
            });
            card.appendChild(button);
        }
    
        themesContainer.appendChild(card);
    });
});
