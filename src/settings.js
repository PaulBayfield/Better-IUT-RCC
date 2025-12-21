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

    // Helper: crée le bouton "Activer" (ou "Thème actif" désactivé) pour un thème
    function createActivateButton(themeObj, isActive) {
        const button = document.createElement('button');
        button.classList.add('button');
        if (isActive) {
            button.textContent = "Thème actif";
            button.disabled = true;
        } else {
            button.textContent = "Activer";
            button.disabled = false;

            button.addEventListener('click', async () => {
                console.info(`[Better IUT RCC] Activation du thème : ${themeObj.id} (${themeObj.version})`);

                // Vérifie si un fond personnalisé est défini avant de changer de thème
                const { customBackground } = await browser.storage.local.get('customBackground');
                if (customBackground) {
                    const confirmRemove = confirm(
                        "Vous avez actuellement un fond personnalisé.\n\n" +
                        "Changer de thème supprimera ce fond personnalisé.\n\n" +
                        "Êtes-vous sûr de vouloir continuer ?"
                    );
                    if (!confirmRemove) {
                        // L'utilisateur a annulé : ne pas changer le thème ni supprimer le fond personnalisé
                        return;
                    }
                }

                // Supprimer le fond personnalisé quand on change de thème (si présent)
                await browser.storage.local.remove('customBackground');

                // Activer le nouveau thème
                await browser.storage.sync.set({ theme: themeObj.id });

                alert("🔄️ Veuillez recharger toutes les pages de l'intranet pour appliquer les modifications.\n\n📝 Dû à des limitations techniques, l'extension ne peut pas rafraîchir automatiquement la/les page(s) ouverte(s) de l'intranet.");
                window.location.reload();
            });
        }
        // store id so we can find it later if needed
        button.dataset.themeId = themeObj.id;
        return button;
    }

    // When theme becomes 'custom', enable any previously disabled "Thème actif" buttons
    function refreshButtonsForCustomActive() {
        // Update display text
        const currentThemeSpan = document.getElementById('current-theme');
        if (currentThemeSpan) currentThemeSpan.textContent = 'Personnalisé';

        // For each card, if it contains a disabled button (previous active theme), replace by a fresh "Activer" button
        const cards = themesContainer.querySelectorAll('.card');
        cards.forEach(card => {
            const tid = card.dataset.themeId;
            if (!tid) return;
            const btn = card.querySelector('button.button');
            if (btn && btn.disabled) {
                // find theme object from themes array
                const themeObj = themes.find(t => t.id === tid);
                if (!themeObj) return;
                const newBtn = createActivateButton(themeObj, false);
                btn.replaceWith(newBtn);
            }
        });
    }

    themes.forEach((theme) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.themeId = theme.id;

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

        // create the correct button according to activeTheme
        const isActive = (activeTheme === theme.id);
        const button = createActivateButton(theme, isActive);
        card.appendChild(button);

        themesContainer.appendChild(card);
    });

    // Gestion de l'image de fond personnalisée
    try {
        const bgFileInput = document.getElementById('bgFileInput');
        const bgPreview = document.getElementById('bgPreview');
        const bgPreviewContainer = document.getElementById('bgPreviewContainer');
        const bgFileName = document.getElementById('bgFileName');
        const removeBgBtn = document.getElementById('removeBgBtn');
        const changeBgBtn = document.getElementById('changeBgBtn');
        const bgUploadContainer = document.querySelector('.bg-upload-container');

        // Charge l'image existante si présente
        const existingBg = await browser.storage.local.get('customBackground');
        if (existingBg && existingBg.customBackground) {
            bgPreview.src = existingBg.customBackground;
            bgPreviewContainer.style.display = 'flex';
            bgUploadContainer.parentElement.style.display = 'none';

            // If theme is custom, ensure UI reflects that
            const themeSync = await browser.storage.sync.get('theme');
            if (themeSync && themeSync.theme === 'custom') {
                const currentThemeSpan = document.getElementById('current-theme');
                if (currentThemeSpan) currentThemeSpan.textContent = 'Personnalisé';
            }
        } else {
            // Si le thème est "custom" mais qu'il n'y a pas d'image, revenir au thème par défaut
            const themeSync = await browser.storage.sync.get('theme');
            if (themeSync && themeSync.theme === 'custom') {
                console.info("[Better IUT RCC] Thème custom sans image détecté, basculement vers le thème par défaut");
                await browser.storage.sync.set({ theme: 'default' });
                window.location.reload();
            }
        }

        // Gestion du changement de fichier
        bgFileInput.addEventListener('change', (event) => {
            const file = event.target.files && event.target.files[0];
            if (!file) return;
            if (file.type && file.type.startsWith('image/')) {
                handleFileUpload(file);
            } else {
                alert('Veuillez sélectionner une image valide.');
            }
        });

        // Gestion du drag and drop
        bgUploadContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            bgUploadContainer.classList.add('drag-over');
        });

        bgUploadContainer.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            bgUploadContainer.classList.remove('drag-over');
        });

        bgUploadContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            bgUploadContainer.classList.remove('drag-over');

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                if (file.type.startsWith('image/')) {
                    handleFileUpload(file);
                } else {
                    alert('Veuillez sélectionner une image valide.');
                }
            }
        });

        // Fonction de traitement du fichier
        async function handleFileUpload(file) {
            const MAX_BYTES = 4 * 1024 * 1024; // 4MB
            if (file.size > MAX_BYTES) {
                const ok = confirm("Le fichier sélectionné est assez volumineux et pourrait dépasser la limite de stockage de l'extension. Continuer ?");
                if (!ok) {
                    bgFileInput.value = '';
                    return;
                }
            }

            const reader = new FileReader();
            reader.onload = async (e) => {
                const dataUrl = e.target.result;

                try {
                    // Désactiver les autres thèmes en le remplaçant par 'custom'
                    await browser.storage.sync.set({ theme: 'custom' });

                    // Enregistrer l'image
                    await browser.storage.local.set({ customBackground: dataUrl });
                    
                    bgPreview.src = dataUrl;
                    bgFileName.textContent = file.name;
                    bgUploadContainer.parentElement.style.display = 'none';
                    bgPreviewContainer.style.display = 'flex';

                    // Update UI to reflect custom theme is active
                    refreshButtonsForCustomActive();

                    alert("🔄️ Veuillez recharger toutes les pages de l'intranet pour appliquer les modifications.\n\n📝 Dû à des limitations techniques, l'extension ne peut pas rafraîchir automatiquement la/les page(s) ouverte(s) de l'intranet.");
                } catch (error) {
                    console.error("[Better IUT RCC] Erreur lors de la sauvegarde de l'image:", error);
                    
                    // Réinitialiser le thème si la sauvegarde échoue
                    const themeSync = await browser.storage.sync.get('theme');
                    if (themeSync && themeSync.theme === 'custom') {
                        await browser.storage.sync.set({ theme: 'default' });
                    }
                    
                    bgFileInput.value = '';
                    
                    if (error.message && error.message.includes('quota')) {
                        alert("❌ Erreur : Le fichier est trop volumineux et dépasse la limite de stockage de l'extension. Veuillez choisir une image plus petite ou de qualité inférieure.");
                    } else {
                        alert("❌ Erreur lors de l'enregistrement de l'image. Veuillez réessayer avec un fichier différent.");
                    }
                }
            };
            reader.readAsDataURL(file);
        }

        // Bouton "Changer l'image"
        changeBgBtn.addEventListener('click', () => {
            bgFileInput.click();
        });

        // Bouton "Supprimer"
        removeBgBtn.addEventListener('click', async () => {
            const confirmed = confirm("Supprimer l'image de fond personnalisée ?");
            if (!confirmed) return;

            // Supprimer l'image de fond
            await browser.storage.local.remove('customBackground');
            
            // Réappliquer le thème par défaut
            await browser.storage.sync.set({ theme: 'default' });
            
            bgPreview.src = '';
            bgFileName.textContent = 'Aucun fichier sélectionné';
            bgPreviewContainer.style.display = 'none';
            bgUploadContainer.parentElement.style.display = 'flex';
            bgFileInput.value = '';
            alert("Image de fond supprimée. Le thème par défaut a été réactivé. Rechargez les pages de l'intranet pour appliquer le changement.");
            
            // Recharger la page des paramètres pour mettre à jour l'affichage
            window.location.reload();
        });
    } catch (err) {
        console.error("[Better IUT RCC] Erreur UI image de fond :", err);
    }
});