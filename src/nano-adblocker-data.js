/**
 * Nano Adblocker build data.
 */
"use strict";

/**
 * Load modules.
 * @const {Module}
 */
const assert = require("assert");

/**
 * The version number.
 * @const {string}
 */
exports.version = "1.0.0.54";
/**
 * The based on string.
 * @const {string}
 */
exports.basedOn = "uBlock Origin Version/1.16.11rc0 Commit/847f146 UserCSS/disabled";

/**
 * Extra information specific to Chromium.
 * @const {Object}
 */
exports.chromium = {
    id: "gabbbocakeomblphkmmnoamkioajlkfo",
};
/**
 * Extra information specific to Firefox.
 * @const {Object}
 */
exports.firefox = {
    id: "{acf5b849-adb0-4004-b4ff-7f5332f48567}",
};

/**
 * Generate manifest.
 * @function
 * @param {Enum} browser - One of "chromium", "firefox", "edge".
 * @return {string} The manifest
 */
exports.manifest = (browser) => {
    assert(browser === "chromium" || browser === "firefox" || browser === "edge");

    let manifest = {
        "author": "All Nano Adblocker and uBlock Origin contributors",
        "background": {
            "page": "background.html"
        },
        "browser_action": {
            "default_icon": {
                "128": "img/128_on.png"
            },
            "default_popup": "popup.html",
            "default_title": "Nano Adblocker"
        },
        "commands": {
            "launch-element-picker": {
                "description": "__MSG_popupTipPicker__"
            },
            "launch-element-zapper": {
                "description": "__MSG_popupTipZapper__"
            },
            "launch-logger": {
                "description": "__MSG_popupTipLog__"
            }
        },
        "content_scripts": [
            {
                "all_frames": true,
                "js": [
                    "js/vapi.js",
                    "js/vapi-client.js",
                    "js/vapi-usercss.js",
                    "js/vapi-usercss.real.js",
                    "js/vapi-usercss.pseudo.js",
                    "js/contentscript.js"
                ],
                "matches": [
                    "http://*/*",
                    "https://*/*"
                ],
                "run_at": "document_start"
            },
            {
                "all_frames": false,
                "js": [
                    "js/scriptlets/subscriber.js"
                ],
                "matches": [
                    "http://*/*",
                    "https://*/*"
                ],
                "run_at": "document_idle"
            }
        ],
        "default_locale": "en",
        "description": "Just another adblocker",
        "icons": {
            "128": "img/128_on.png"
        },
        "incognito": "split",
        "manifest_version": 2,
        "minimum_chrome_version": "45.0",
        "name": "Nano Adblocker",
        "optional_permissions": [
            "file:///*"
        ],
        "options_page": "dashboard.html",
        "options_ui": {
            "page": "options_ui.html"
        },
        "permissions": [
            "<all_urls>",
            "contextMenus",
            "privacy",
            "storage",
            "tabs",
            "unlimitedStorage",
            "webNavigation",
            "webRequest",
            "webRequestBlocking"
        ],
        "storage": {
            "managed_schema": "managed_storage.json"
        },
        "version": exports.version,
        "web_accessible_resources": [
            "web_accessible_resources/*"
        ]
    };

    if (browser === "firefox") {
        manifest.applications = {
            "gecko": {
                "id": exports.firefox.id,
                "strict_min_version": "52.0"
            }
        };
        manifest.incognito = "spanning";

        // Modded 2018-06-20: Follow manifest of firefox platform from uBO (webext rename to firefox on Apr 28)
        // source: https://github.com/gorhill/uBlock/blob/master/platform/firefox/manifest.json
        let remove = (array, element) => {
            const index = array.indexOf(element);
            array.splice(index, 1);
        }
        manifest.browser_action.browser_style = false;
        // TODO: concat two usercss into contenscript.js and also remove them just as uBO?
        remove(manifest.content_scripts[0].js, "js/vapi-usercss.pseudo.js");
        remove(manifest.permissions, "unlimitedStorage");
        manifest.content_scripts[0].matches.push("file://*/*");
        delete manifest.optional_permissions;
        delete manifest.minimum_chrome_version;
        delete manifest.options_page;
        manifest.options_ui = {
            "open_in_tab": true,
            "page": "dashboard.html",
            "browser_style": true   
        };
        // Stable release of uBo remove sidebar_action
        /*
        manifest.sidebar_action = {
            "default_icon": {
                "128": "img/128_on.png"
            },
            "default_panel": "logger-ui.html",
            "default_title": "__MSG_statsPageName__"
        };
        */
        delete manifest.storage;
    } else if (browser === "edge") {
        // Edge does not care if the size is actually right but do care if the
        // key name is right
        manifest["-ms-preload"] = {
            "backgroundScript": "js/edgyfy.js",
            "contentScript": "js/edgyfy.js"
        };
        manifest.background.persistent = true;
        manifest.browser_action.default_icon = {
            "38": "img/128_on.png"
        };
        manifest.browser_specific_settings = {
            "edge": {
                "browser_action_next_to_addressbar": true
            }
        };
        manifest.icons = {
            "128": "img/128_on.png",
            "16": "img/128_on.png"
        };
        delete manifest.minimum_chrome_version;
        manifest.minimum_edge_version = "41.16299.248.0";
        {
            const i = manifest.version.indexOf(".");
            manifest.version = manifest.version.substring(i + 1) + ".0";
        }
    }

    return JSON.stringify(manifest, null, 2);
};
