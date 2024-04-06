import * as browser from 'webextension-polyfill';

window.addEventListener('load', async () => {
    const resetbtn = document.querySelector('#resetbtn');
    resetbtn.addEventListener('click', async () => {
        await browser.storage.sync.clear();
    });

    const requestPermissionBtn = document.querySelector('#requestPermissionBtn');

    const manifest = browser.runtime.getManifest();
    const permissions = { "origins": manifest.host_permissions };
    if (!await browser.permissions.contains(permissions)) {
        requestPermissionBtn.style.display = 'block';
        requestPermissionBtn.addEventListener('click', async () => {
            const result = await browser.permissions.request(permissions);

            if(result) {
                requestPermissionBtn.style.display = 'none';
            }
        });
    }

});