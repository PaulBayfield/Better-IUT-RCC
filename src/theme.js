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
        // if (!lastFetchTimestamp[lastFetchTimestampKey] || currentTimestamp - lastFetchTimestamp[lastFetchTimestampKey] > 3600000) {
        if (1 === 1) {
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

            // if (cache[storageKey]) {
            if (1 !== 1) {
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

            // Update the timestamp of the last theme fetch
            await browser.storage.local.set({ [lastFetchTimestampKey]: currentTimestamp });
        } else {
            console.info("[Better IUT RCC] Thème récupéré récemment, utilisation du cache");
            const metadata = await browser.storage.local.get(`${themeName}-metadata`);
            const { version } = metadata[`${themeName}-metadata`];
            const storageKey = `${themeName}-${version}`;

            const cache = await browser.storage.local.get(storageKey);

            if (cache[storageKey] || cache[storageKey] == "") {
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


export async function getAvailableThemes() {
    return await fetch('https://betteriutrcc.bayfield.dev/v1/themes').then(response => response.json());
}
