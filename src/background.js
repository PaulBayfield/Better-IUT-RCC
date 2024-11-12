import * as browser from 'webextension-polyfill';


console.log("[Better IUT RCC] Background script lancé");


// Ajout d'un listener pour ouvrir la popup/paramètres
browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.openOptions) {
        console.info("[Better IUT RCC] Ouverture des paramètres");
        browser.runtime.openOptionsPage()
    }
})
