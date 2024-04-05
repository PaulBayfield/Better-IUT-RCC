import * as browser from 'webextension-polyfill';

window.addEventListener('load', () => {
    const resetbtn = document.querySelector('#resetbtn');

    resetbtn.addEventListener('click', async () => {
        await browser.storage.sync.clear();
    });
});