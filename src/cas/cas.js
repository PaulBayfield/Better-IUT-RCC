const { Client } = require("./client.js");
const cookie = require("cookie");
const cheerio = require("cheerio");

exports.CAS = class CAS extends Client {
    constructor(serviceUrl) {
        super();

        /**
         * The base URL
         * @type {String}
         */
        this.BASE_URL = "https://cas.univ-reims.fr/cas/login";

        /**
         * The service URL
         * @type {String}
         */
        this.SERVICE_URL = serviceUrl;
    }

    async getAdditionalData() {
        let url = new URL(this.BASE_URL);
        url.search = new URLSearchParams({ service: this.SERVICE_URL });

        const resp = await this.request({
            method: "GET",
            url: url,
            raw: true,
        });

        const $ = cheerio.load(resp.data);
        let res = $("section.cas-field")
            .filter((_, section) => {
                return $(section).children(`input[type="hidden"]`).length > 0;
            })
            .children(`input[type="hidden"]`)
            .map((_, input) => {
                const el = {};
                el[$(input).attr().name] = $(input).val() ?? "";
                return el;
            })
            .get()
            .reduce((prev, curr) => {
                return Object.assign(prev, curr);
            }, {});

        if (Object.keys(res).length === 0) {
            return {
                ok: true,
                data: resp.data
            };
        } else {
            return {
                ok: Object.keys(res).length > 0,
                res: res,
            };
        }
    }

    async init(username, password) {
        let url = new URL(this.BASE_URL);
        url.search = new URLSearchParams({ service: this.SERVICE_URL });

        const additional = await this.getAdditionalData();

        if (additional.ok) {
            if (additional.data) {
                return {
                    ok: true,
                    data: additional.data,
                };
            }

            const res = await this.request({
                method: "POST",
                url: url,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "User-Agent": "Better IUT RCC - Recherche de nouvelles notes (https://github.com/PaulBayfield/Better-IUT-RCC)"
                },
                data: new URLSearchParams({
                    username: username,
                    password: password,
                    ...additional.res,
                }),
                // We are handling the redirection ourselves
                maxRedirects: 0,
                raw: true,
            });

            if (
                res.headers["location"] &&
                res.headers["location"].includes("ticket")
            ) {
                return {
                    ok: true,
                    res: res.headers["location"],
                };
            } else {
                return {
                    ok: false,
                    data: res.data
                };
            }
        } else {
            return {
                ok: false,
                err: "Could not find additional data (execution, _eventId, geolocation)!",
            };
        }
    }

    async login(redirectURL) {
        if (redirectURL.ok) {
            const res = await this.request({
                method: "GET",
                url: redirectURL.res,
                // Prevents a redirection to the login page
                maxRedirects: 0,
                raw: true,
            });

            let { PHPSESSID } = cookie.parse(
                res.response.headers["set-cookie"]
                    .filter((c) => c.startsWith("PHPSESSID="))
                    .reduce((prev, curr) => {
                        // HACK: iut-rcc-infoapi.univ-reims.fr/signature/login
                        // sends 2 PHPSESSID (short + long) instead of 1 long
                        return prev.length > curr.lengt ? prev : curr;
                    })
            );

            if (PHPSESSID) {
                const res2 = await this.request({
                    method: "GET",
                    url: this.SERVICE_URL,
                    headers: {
                        Cookie: `PHPSESSID=${PHPSESSID}`,
                    },
                    // Prevents a redirection to the login page
                    maxRedirects: 0,
                    raw: true,
                });

                ({ PHPSESSID } = cookie.parse(
                    res2.response.headers["set-cookie"].filter((c) => c.startsWith("PHPSESSID="))[0]
                ));

                if (PHPSESSID) {
                    return {
                        ok: true,
                        res: PHPSESSID,
                    };
                } else {
                    return {
                        ok: false,
                        err: "No PHPSESSID at 2nd login step!",
                    };
                }
            } else {
                return {
                    ok: false,
                    err: "No PHPSESSID at 1st login step!",
                };
            }
        } else {
            return {
                ok: false,
                err: redirectURL.err,
            };
        }
    }
};
