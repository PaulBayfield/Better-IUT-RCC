import * as browser from 'webextension-polyfill';


console.log("Better IUT RCC background task started!");


// Ajout d'un listener pour ouvrir la popup/paramètres
browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.openOptions) {
        const url = browser.runtime.getURL("popup.html");
        if (url.includes("chrome-extension://")) {
            try {
                console.log("[Better IUT RCC] Opening options page...");
                chrome.action.openPopup(); // Google Chrome 127+
            } catch (e) {
                console.log("[Better IUT RCC] Opening options page... (fallback)");
                chrome.browserAction.openPopup(); // Google Chrome 126-
            }
        } else {
            alert("L'ouverture de la page des paramètres n'est pas supportée sur Firefox pour le moment. Veuillez ouvrir la page des paramètres manuellement.");
        }
    }
})
