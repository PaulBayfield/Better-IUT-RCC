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

        window.close();

        // TODO: On pourrait peut être le faire automatiquement puisque l'extension utilise la permission "tabs".
        alert("Veuillez rafraîchir toutes les pages de l'Intranet de l'IUT RCC pour que les modifications prennent effet.");
    });

    var toggleNotifications = document.getElementById('toggleNotifications');
    var toggleNotificationsIcon = document.getElementById('toggleNotificationsIcon');

    toggleNotifications.addEventListener('click', function () {
        if (toggleNotifications.classList.contains("active")) {
            toggleNotifications.innerHTML = '<i class="fa-solid fa-bell-slash" id="toggleNotificationsIcon"></i>Les notifications sont désactivées'

            toggleNotifications.classList.remove("active");
            toggleNotifications.classList.add("inactive");

            toggleNotificationsIcon.classList.remove("fa-check");
            toggleNotificationsIcon.classList.add("fa-xmark");

            chrome.runtime.sendMessage({ enableNotifications: false });
        } else {
            toggleNotifications.innerHTML = '<i class="fa-solid fa-bell" id="toggleNotificationsIcon"></i>Les notifications sont activées'

            toggleNotifications.classList.remove("inactive");
            toggleNotifications.classList.add("active");

            toggleNotificationsIcon.classList.remove("fa-cross");
            toggleNotificationsIcon.classList.add("fa-xmark");

            chrome.runtime.sendMessage({ enableNotifications: true });
        }
    });
});
