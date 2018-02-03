/**
 * Generate browser specific manifest file for Nano Adblocker.
 */
"use strict";

/**
 * Load modules.
 * @const {Module}
 */
const assert = require("assert");

/**
 * The based on string.
 * @const {string}
 */
exports.basedOn = "uBlock Origin Version/1.15.4 Commit/43eab7a Sidebar/disabled";
/**
 * Generate manifest.
 * @function
 * @param {Enum} browser - One of "chromium", "firefox", "edge".
 * @return {string} The manifest
 */
exports.manifest = (browser) => {
    assert(browser === "chromium" || browser === "firefox" || browser === "edge");

    let manifest = {
        "manifest_version": 2,

        "name": "Nano Adblocker",
        "short_name": "Nano",
        "description": "Just another adblocker",
        "author": "All Nano Adblocker and uBlock Origin contributors",
        "version": "1.0.0.29",

        "default_locale": "en",

        "commands": {
            "launch-element-zapper": {
                "description": "__MSG_popupTipZapper__"
            },
            "launch-element-picker": {
                "description": "__MSG_popupTipPicker__"
            },
            "launch-logger": {
                "description": "__MSG_popupTipLog__"
            }
        },

        "icons": {
            "128": "img/128_on.png"
        },
        "browser_action": {
            "default_icon": {
                "128": "img/128_on.png"
            },
            "default_title": "Nano Adblocker",
            "default_popup": "popup.html"
        },
        "options_page": "dashboard.html",
        "options_ui": {
            "page": "options_ui.html"
        },

        "background": {
            "page": "background.html"
        },
        "content_scripts": [
            {
                "matches": ["http://*/*", "https://*/*"],
                "js": ["/js/vapi.js", "/js/vapi-client.js", "/js/vapi-usercss.js", "/js/contentscript.js"],
                "run_at": "document_start",
                "all_frames": true
            },
            {
                "matches": ["http://*/*", "https://*/*"],
                "js": ["/js/scriptlets/subscriber.js"],
                "run_at": "document_idle",
                "all_frames": false
            }
        ],

        "optional_permissions": ["file:///*"],
        "permissions": [
            "contextMenus",
            "privacy",
            "storage",
            "tabs",
            "unlimitedStorage",
            "webNavigation",
            "webRequest",
            "webRequestBlocking",
            "<all_urls>"
        ],

        "incognito": "split",
        "storage": {
            "managed_schema": "managed_storage.json"
        },
        "minimum_chrome_version": "45.0"
    };

    if (browser === "chromium") {
        return JSON.stringify(manifest, null, 2);
    } else if (browser === "firefox") {
        delete manifest.options_page;
        manifest.options_ui = {
            "open_in_tab": true,
            "page": "dashboard.html"
        };

        manifest.incognito = "spanning";
        delete manifest.storage;
        delete manifest.minimum_chrome_version;

        manifest.applications = {
            "gecko": {
                "strict_min_version": "52.0"
            }
        };

        // TODO 2018-01-13: The side bar feels really quirky,
        // disable it for now
        /*
        manifest.sidebar_action = {
            "default_title": "__MSG_statsPageName__",
            "default_panel": "logger-ui.html",
            "default_icon": {
                "128": "img/128_on.png"
            }
        };
        */

        return JSON.stringify(manifest, null, 2);
    } else if (browser === "edge") {
        // Edge does not care if the size is actually right
        // but do care if the key name is right
        manifest.icons = {
            "16": "img/128_on.png",
            "128": "img/128_on.png"
        };
        manifest.browser_action.default_icon = {
            "38": "img/128_on.png"
        };

        manifest.background.persistent = true;

        delete manifest.minimum_chrome_version;
        manifest.minimum_edge_version = "40.15063.674.0";

        manifest.browser_specific_settings = {
            "edge": {
                "browser_action_next_to_addressbar": true
            }
        };
        manifest["-ms-preload"] = {
            "backgroundScript": "js/edgyfy.js",
            "contentScript": "js/edgyfy.js"
        };

        return JSON.stringify(manifest, null, 2);
    }
};
