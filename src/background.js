import { CAS } from './cas/cas';
import * as browser from 'webextension-polyfill';

const cheerio = require("cheerio");

console.log("Better IUT RCC background task started!");


// Ajout d'un listener pour ouvrir la popup/paramètres
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.openOptions) {
        try {
            chrome.action.openPopup(); // Google Chrome 127+
        } catch (e) {
            chrome.runtime.openOptionsPage(); // Ouverture de la popup/paramètres en passant par la page d'options
        }
    }
})

// Ajout d'un listener pour les changements de paramètres
chrome.storage.onChanged.addListener(async function(changes, namespace) {
    if (changes.enableNotifications) {
        if (changes.enableNotifications.newValue) {
            console.info("[Better IUT RCC] Notifications activées !");

            await refreshNotes();
            
            setInterval(
                async () => {
                    await refreshNotes();
                },
                3600 * 1000 // 1 heure
            )
        } else {
            console.info("[Better IUT RCC] Notifications désactivées !");
        }
    }
});

async function refreshNotes() {
    chrome.storage.sync.get("enableNotifications", async function(data) {
        if (!data.enableNotifications) {
            console.info("[Better IUT RCC] Notifications désactivées !");
            return;
        } else {
            console.info("[Better IUT RCC] Rafraîchissement des notes...");

            const secret_0 = await browser.storage.sync.get("secret_0");
            const secret_1 = await browser.storage.sync.get("secret_1");

            if (!secret_0.secret_0 || !secret_1.secret_1) {
                console.warn("[Better IUT RCC] Les notifications sont activées mais les identifiants ne sont pas renseignés !");
                return;
            }

            const lastRequest = await browser.storage.sync.get("lastRequest");

            if (lastRequest.lastRequest && new Date().getTime() - lastRequest.lastRequest < 3600 * 1000) {
                console.info(`[Better IUT RCC] Dernière requête effectuée il y a moins d'une heure (${new Date(lastRequest.lastRequest).toLocaleTimeString()})`);

                return new Promise((resolve) => setTimeout(resolve, 3600 * 1000));
            }

            browser.storage.sync.set({lastRequest: new Date().getTime()}).then(() => {
                console.info(`[Better IUT RCC] Dernière requête effectuée à ${new Date().toLocaleTimeString()}`);
            });

            const cas = new CAS("https://iut-rcc-intranet.univ-reims.fr/sso/cas")

            console.info("[Better IUT RCC] Initialisation de la connexion...");

            const casInit = await cas.init(secret_0, secret_1);

            console.info("[Better IUT RCC] Connexion initialisée !");

            let data = null;
            if (casInit.ok && !casInit.data) {
                const casLogin = await cas.login(casInit);
                if (casLogin.ok && !casLogin.data) {
                    data = await cas.notes();
                } else {
                    data = casLogin.data;
                }
            } else {
                data = casInit.data;
            }

            const $ = cheerio.load(data);
            let notes = [];

            $("#mainContent > div.row > div:nth-child(5) > div > div > table > tbody > tr").toArray().map(
                element => notes.push({
                    id: $(element).find('td:nth-child(7) > button').attr('data-modal-modal-url-value').split('/').pop(),
                    subject: $(element).find('td:nth-child(1)').text(),
                    subjectDescription: $(element).find('td:nth-child(1)').find('abbr').attr('title'),
                    evaluation: $(element).find('td:nth-child(2)').text(),
                    date: $(element).find('td:nth-child(3)').text(),
                    comment: $(element).find('td:nth-child(4)').text(),
                    grade: parseFloat($(element).find('td:nth-child(5) .badge').text().replace(',', '.')),
                    coefficient: parseFloat($(element).find('td:nth-child(6)').text())
                }
            ));

            notes.sort((a, b) => a.subject.localeCompare(b.subject));

            let ids = [];
            notes.forEach((note) => {
                ids.push(note.id);
            });

            console.log(ids);

            let newNotes = [];
            let notesAlreadyKnow = await browser.storage.sync.get("allNotes");
            if (notesAlreadyKnow.allNotes) {
                notesAlreadyKnow.allNotes.forEach((note) => {
                    if (!ids.includes(note)) {
                        newNotes.push(note);
                    }
                });
            }

            browser.storage.sync.set({allNotes: ids}).then(() => {
                console.info(`[Better IUT RCC] ${ids.length} notes sauvegardées !`);
            });

            if (newNotes.length > 0) {
                console.info(`[Better IUT RCC] ${newNotes.length} nouvelles notes disponibles !`);
                sendNotification(newNotes.length);
            }
        }
    });
}

function sendNotification(total) {
    let message = "Une nouvelle note est disponible, cliquez ici pour la consulter 👀"
    if (total > 1) {
        message = `${total} nouvelles notes sont disponibles, cliquez ici pour les consulter 👀`;
    }

    chrome.notifications.create(
        "nouvelle-note",
        {
            type: "basic",
            iconUrl: "assets/img/logo_128.png",
            title: "Better IUT RCC • 🗒️ Nouvelle note !",
            message: message,
        },
        function() {
            chrome.notifications.onClicked.addListener(function() {
                chrome.tabs.create({ url: "https://iut-rcc-intranet.univ-reims.fr/fr/tableau-de-bord" });
            });
        }
    );
};

// Get sync storage
chrome.storage.sync.get("enableNotifications", async function(data) {
    console.info("[Better IUT RCC] Paramètre de notification : " + data.enableNotifications);
    if (data.enableNotifications) {
        await refreshNotes();
        
        setInterval(
            async () => {
                await refreshNotes();
            },
            3600 * 1000 // 1 heure
        )
    }
});
