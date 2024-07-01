const axios = require("axios").default;
const cheerio = require("cheerio");

exports.Client = class Client {
    constructor() {
        /**
         * The base URL
         * @type {String}
         */
        this.BASE_URL = "https://iut-rcc-intranet.univ-reims.fr";
    }

    #headers = {
        "User-Agent": "Better IUT RCC - Recherche de nouvelles notes (https://github.com/PaulBayfield/Better-IUT-RCC)",
    };

    /**
     * Make request against the API
     * @private
     * @param  {Object} [reqOptions] request options
     * @private
     * @returns {Promise<Object>} promise
     */
    request(reqOptions = {}) {
        let options = {
            headers: {
                ...this.#headers,
            },
            mode: "no-cors",
            ...reqOptions,
        };

        return axios(options)
            .then((response) => {
                if (reqOptions.raw) return response;

                if (typeof response.data === "object") {
                    return response.data;
                } else {
                    return response.data;
                }
            })
            .catch((error) => {
                if (reqOptions.raw) return error;

                console.error("[Better IUT RCC] Error during request : ", error);
            });
    }

    /**
     * Login to the website.
     * @param {String} PHPSessId
     * @example login("PHPSESSID")
     * @return {Object}
     */
    async login(PHPSessId) {
        this.#headers = {
            ...this.#headers,
            Cookie: `PHPSESSID=${PHPSessId}`,
        };

        return { ok: true };
    }

    /**
     * Get your notes.
     * @example notes()
     * @return {Object}
     */
    async notes() {
        let url = new URL(`/tableau-de-bord`, this.BASE_URL);

        const res = await this.request({
            method: "GET",
            url: url,
        });

        if (res) {
            return cheerio.load(res);
        } else {
            return null;
        }
    }
};
