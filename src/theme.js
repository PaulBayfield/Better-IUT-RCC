import * as browser from 'webextension-polyfill';


/**
 * Fonction pour charger le thème
 *
 * @returns {void}
 */
export async function applyTheme() {
    let t = "light";

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        t = "dark";
    }

    const cache = await browser.storage.local.get('darkTheme');

    if (cache.darkTheme !== undefined) {
        t = cache.darkTheme ? "dark" : "light";
    }

    if (t === "dark") {
        console.info("[Better IUT RCC] Application du thème sombre...");
        document.querySelector('body').classList.add('dark-theme');
    } else {
        console.info("[Better IUT RCC] Application du thème clair...");
        document.querySelector('body').classList.remove('dark-theme');
    }

    // Applique le thème personnalisé
    await getCustomTheme();
}


/**
 * Fonction pour récupérer le thème personnalisé
 * 
 * @returns {void}
 * @async
 */
async function getCustomTheme() {
    let themeName = "default";
    const themeResult = await browser.storage.sync.get('theme');
    
    // Si le thème est 'custom', ne pas charger de thème personnalisé (juste le fond)
    if (themeResult.theme === 'custom') {
        console.info("[Better IUT RCC] Mode fond personnalisé actif, thème désactivé");
        await applyCustomBackground();
        return;
    }
    if (themeResult.theme) {
        console.info("[Better IUT RCC] Thème personnalisé trouvé :", themeResult.theme);
        themeName = themeResult.theme;
    } else {
        console.warn("[Better IUT RCC] Aucun thème personnalisé trouvé, utilisation du thème par défaut");
        await browser.storage.sync.set({ theme: themeName });
    }

    console.info(`[Better IUT RCC] Récupération du thème personnalisé : ${themeName}`);

    const fallbackCSSKey = 'fallback-css';
    const lastFetchTimestampKey = `${themeName}-last-fetch`;

    try {
        const currentTimestamp = Date.now();
        const lastFetchTimestamp = await browser.storage.local.get(lastFetchTimestampKey);

        // Récupère le thème personnalisé toutes les heures
        if (!lastFetchTimestamp[lastFetchTimestampKey] || currentTimestamp - lastFetchTimestamp[lastFetchTimestampKey] > 3600000) {
            console.info("[Better IUT RCC] 📑 Récupération du thème personnalisé...");
            const metadataResponse = await fetch(`https://betteriutrcc.bayfield.dev/v1/themes/${themeName}`);

            if (!metadataResponse.ok) {
                throw new Error("Erreur lors de la récupération des métadonnées du thème");
            }

            const metadata = await metadataResponse.json();
            const { version } = metadata;
            const storageKey = `${themeName}-${version}`;

            await browser.storage.local.set({ [`${themeName}-metadata`]: metadata });

            const cache = await browser.storage.local.get(storageKey);

            if (cache[storageKey]) {
                console.info(`[Better IUT RCC] Thème trouvé en cache (${storageKey})`);
                injectCSS(cache[storageKey]);
            } else {
                console.info("[Better IUT RCC] 🎨 Récupération du CSS du thème personnalisé...");
                const cssResponse = await fetch(`https://betteriutrcc.bayfield.dev/v1/themes/${themeName}/style.css`);

                if (!cssResponse.ok) {
                    throw new Error("Erreur lors de la récupération du CSS du thème");
                }

                const cssContent = await cssResponse.text();
                await browser.storage.local.set({ [storageKey]: cssContent });
                console.info(`[Better IUT RCC] Thème enregistré en cache (${storageKey})`);
                injectCSS(cssContent);
            }

            await browser.storage.local.set({ [lastFetchTimestampKey]: currentTimestamp });
        } else {
            console.info("[Better IUT RCC] Thème récupéré récemment, utilisation du cache");
            const metadata = await browser.storage.local.get(`${themeName}-metadata`);
            const { version } = metadata[`${themeName}-metadata`];
            const storageKey = `${themeName}-${version}`;

            const cache = await browser.storage.local.get(storageKey);

            if (cache[storageKey]) {
                console.info(`[Better IUT RCC] Thème trouvé en cache (${storageKey})`);
                injectCSS(cache[storageKey]);
            } else {
                throw new Error("Erreur lors de la récupération du thème en cache");
            }
        }
    } catch (error) {
        console.error("[Better IUT RCC] Erreur lors de la récupération des données du thème", error);

        // Utiliser le style local en cas d'erreur
        const fallback = await browser.storage.local.get(fallbackCSSKey);
        if (fallback[fallbackCSSKey]) {
            console.warn("[Better IUT RCC] Utilisation du CSS local en tant que secours");
            injectCSS(fallback[fallbackCSSKey]);
        } else {
            console.warn("[Better IUT RCC] Aucun CSS local trouvé pour le secours");
            // Get extension CSS file located at src/css/style.css
            const cssURL = browser.runtime.getURL('style.css');
            console.log("Fetching CSS from:", cssURL);
            const cssResponse = await fetch(cssURL);
            const cssContent = await cssResponse.text();

            await browser.storage.local.set({ [fallbackCSSKey]: cssContent });
            console.info("[Better IUT RCC] CSS local enregistré en cache");
            injectCSS(cssContent);
        }
    }

    // Appliquer l'image de fond personnalisée APRÈS l'injection du CSS du thème
    await applyCustomBackground();
}

/**
 * Fonction pour injecter le CSS
 *
 * @param {string} cssContent
 * @returns {void}
 */
function injectCSS(cssContent) {
    const existingStyle = document.querySelector('#custom-theme-style');
    if (existingStyle) {
        existingStyle.textContent = cssContent;
    } else {
        const style = document.createElement('style');
        style.id = 'custom-theme-style';
        style.textContent = cssContent;
        document.head.appendChild(style);
    }
}

/**
 * Applique l'image de fond stockée dans browser.storage.local (clé: customBackground)
 * - Crée une DIV fixe en arrière-plan pour la photo de l'utilisateur
 */
async function applyCustomBackground() {
    try {
        const result = await browser.storage.local.get('customBackground');
        const imgData = result.customBackground;

        // retire l'observer précédent si existant (sécurité)
        if (window.__BETTER_IUT_RCC_BG_OBSERVER) {
            try { window.__BETTER_IUT_RCC_BG_OBSERVER.disconnect(); } catch (e) {}
            window.__BETTER_IUT_RCC_BG_OBSERVER = null;
        }

        // Si pas d'image, supprimer ce qu'on a créé avant
        if (!imgData) {
            const el = document.getElementById('extension-custom-bg');
            if (el) el.remove();
            const style = document.getElementById('custom-bg-style');
            if (style) style.remove();
            document.body.classList.remove('extension-custom-bg-active');
            return;
        }

        // Ajouter la classe pour activer le style semi-transparent
        document.body.classList.add('extension-custom-bg-active');

        // Créer ou mettre à jour l'overlay
        let overlay = document.getElementById('extension-custom-bg');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'extension-custom-bg';
            document.body.insertBefore(overlay, document.body.firstChild);
        }
        Object.assign(overlay.style, {
            position: 'fixed',
            inset: '0',
            width: '100%',
            height: '100%',
            backgroundImage: `url("${imgData.replace(/"/g, '\\"')}")`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundAttachment: 'fixed',
            pointerEvents: 'none',
            zIndex: '-1',
            opacity: '1',
        });

        // Récupérer le CSS depuis l'API pour le thème "custom"
        await applyCustomBackgroundCSS();

        // Observer simple pour réappliquer l'overlay si nécessaire
        const observer = new MutationObserver(() => {
            const curOverlay = document.getElementById('extension-custom-bg');
            if (!curOverlay || !curOverlay.style.backgroundImage) {
                const overlay = document.getElementById('extension-custom-bg');
                if (overlay) {
                    overlay.style.backgroundImage = `url("${imgData.replace(/"/g, '\\"')}")`;
                }
            }
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: false,
        });

        window.__BETTER_IUT_RCC_BG_OBSERVER = observer;

        console.info("[Better IUT RCC] Image de fond appliquée");
    } catch (err) {
        console.error("[Better IUT RCC] Erreur lors de l'application de l'image de fond :", err);
    }
}

/**
 * Applique le CSS pour les fonds personnalisés depuis l'API
 * 
 * @returns {void}
 * @async
 */
async function applyCustomBackgroundCSS() {
    const customBgCSSKey = 'custom-bg-css';
    const lastFetchTimestampKey = 'custom-bg-css-last-fetch';

    try {
        const currentTimestamp = Date.now();
        const lastFetchTimestamp = await browser.storage.local.get(lastFetchTimestampKey);

        // Récupère le CSS toutes les heures
        if (!lastFetchTimestamp[lastFetchTimestampKey] || currentTimestamp - lastFetchTimestamp[lastFetchTimestampKey] > 3600000) {
            console.info("[Better IUT RCC] 🎨 Récupération du CSS pour fond personnalisé depuis l'API...");
            
            // Utiliser le thème "valorant" comme base car il a les styles de transparence
            const cssResponse = await fetch('https://betteriutrcc.bayfield.dev/v1/themes/valorant/style.css');

            if (!cssResponse.ok) {
                throw new Error("Erreur lors de la récupération du CSS depuis l'API");
            }

            const cssContent = await cssResponse.text();
            await browser.storage.local.set({ [customBgCSSKey]: cssContent });
            console.info("[Better IUT RCC] CSS pour fond personnalisé enregistré en cache");
            injectCustomBackgroundCSS(cssContent);

            // Update the timestamp
            await browser.storage.local.set({ [lastFetchTimestampKey]: currentTimestamp });
        } else {
            console.info("[Better IUT RCC] CSS récupéré récemment, utilisation du cache");
            const cache = await browser.storage.local.get(customBgCSSKey);

            if (cache[customBgCSSKey]) {
                console.info("[Better IUT RCC] CSS trouvé en cache");
                injectCustomBackgroundCSS(cache[customBgCSSKey]);
            } else {
                throw new Error("Erreur lors de la récupération du CSS en cache");
            }
        }
    } catch (error) {
        console.error("[Better IUT RCC] Erreur lors de la récupération du CSS pour fond personnalisé", error);
        // En cas d'erreur, utiliser un CSS minimal de secours
        injectCustomBackgroundCSS(getMinimalCustomBackgroundCSS());
    }
}

/**
 * Injecte le CSS dans la page HTML pour les fonds personnalisés
 * 
 * @param {string} cssContent
 * @returns {void}
 */
function injectCustomBackgroundCSS(cssContent) {
    let bgStyle = document.getElementById('custom-bg-style');
    if (!bgStyle) {
        bgStyle = document.createElement('style');
        bgStyle.id = 'custom-bg-style';
        document.head.appendChild(bgStyle);
    }

    // Filtrer le CSS pour retirer les règles de background-image sur .main-container
    // qui écraseraient le fond personnalisé de l'utilisateur
    const filteredCSS = filterBackgroundImageRules(cssContent);

    // Ajouter le CSS de base pour l'overlay + le CSS du thème filtré
    const baseCSS = `
        /* Overlay derrière tout */
        #extension-custom-bg {
            position: fixed !important;
            inset: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background-repeat: no-repeat !important;
            background-size: cover !important;
            background-position: center center !important;
            background-attachment: fixed !important;
            pointer-events: none !important;
            z-index: -1 !important;
        }
    `;

    bgStyle.textContent = baseCSS + '\n' + filteredCSS;
}

/**
 * Permet d'injecter le CSS de Valorant sans le fond d'écran pour laisser le fond personnalisé apparaître
 *
 * @param {string} cssContent
 * @returns {string}
 */
function filterBackgroundImageRules(cssContent) {
    // Retirer les blocs CSS qui définissent background-image pour .main-container
    // Exemple: body.rcc:not(dark-theme) .main-container { background-image: url(...); ... }
    
    // Remplacer les règles de background-image sur .main-container par rien
    let filtered = cssContent.replace(
        /body\.rcc(?::not\(\.?dark-theme\))?(?:\.dark-theme)?\s+\.main-container\s*\{[^}]*background-image:[^;]*;[^}]*\}/gi,
        ''
    );

    // Aussi retirer juste les lignes background-image si elles sont seules
    filtered = filtered.replace(
        /\.main-container\s*\{[^}]*background-image:[^;]*;[^}]*\}/gi,
        ''
    );

    return filtered;
}

/**
 * Injecte un CSS minimal de secours en cas d'innaccessibilité de l'API de Paul
 *
 * @returns {string}
 */
function getMinimalCustomBackgroundCSS() {
    const isDarkTheme = document.querySelector('body').classList.contains('dark-theme');
    const themePrefix = isDarkTheme ? 'body.rcc.dark-theme' : 'body.rcc:not(.dark-theme)';
    
    return `
        .new-note {
            background-color: #ea9d34 !important;
        }

        .new-note td {
            background-color: #ea9d34 !important;
        }

        ${themePrefix} .card,
        ${themePrefix} .media-list,
        ${themePrefix} .code-preview {
            background-color: ${isDarkTheme ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.8)'} !important;
            border-radius: 10px !important;
            box-shadow: -5px 5px 5px ${isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'} !important;
        }

        ${themePrefix} .header {
            background-color: ${isDarkTheme ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.3)'} !important;
        }

        ${themePrefix} .site-footer {
            background-color: ${isDarkTheme ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.8)'} !important;
        }
    `;
}

export async function getAvailableThemes() {
    return await fetch('https://betteriutrcc.bayfield.dev/v1/themes').then(response => response.json());
}