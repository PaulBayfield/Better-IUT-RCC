import * as browser from 'webextension-polyfill';

window.addEventListener('load', async () => {
    const requestPermissionBtn = document.querySelector('#requestPermissionBtn');

    const manifest = browser.runtime.getManifest();
    const permissions = { "origins": manifest.host_permissions };
    if (!await browser.permissions.contains(permissions)) {
        requestPermissionBtn.style.display = 'block';
        requestPermissionBtn.addEventListener('click', async () => {
            const result = await browser.permissions.request(permissions);

            if (result) {
                requestPermissionBtn.style.display = 'none';
            }
        });
    }

    const version = document.querySelector('#version');
    version.textContent = manifest.version;
});

document.addEventListener('DOMContentLoaded', function () {
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

        browser.tabs.query({}).then(function(tabs) {
            tabs.forEach(function(tab) {
                if (tab.url && tab.url.includes('iut-rcc-intranet.univ-reims.fr')) {
                    browser.tabs.reload(tab.id);
                }
            });
        });

        window.close();
    });
});
