/**
 * Nano Defender build data.
 */
"use strict";

/**
 * Load modules.
 * @const {Module}
 */
const assert = require("assert");
const fs = require("../lib/promise-fs.js");

/**
 * Extra information specific to Chromium.
 * @const {Object}
 */
exports.chromium = {
    id: "ggolfgbegefeeoocgjbmkembbncoadlb",
};
/**
 * Extra information specific to Firefox.
 * @const {Object}
 */
exports.firefox = {
    id: "{6ea144f3-db99-47f4-9a1d-815e8b3944d1}",
};

/**
 * Patch manifest.
 * @async @function
 * @param {Enum} browser - One of "chromium", "firefox", "edge".
 * @return {string} The manifest
 */
exports.patchManifest = async (browser) => {
    assert(browser === "chromium" || browser === "firefox" || browser === "edge");

    if (browser === "chromium") {
        return;
    }

    const path = "./dist/nano_defender_" + browser + "/manifest.json";
    let manifest = await fs.readFile(path, "utf8");
    manifest = JSON.parse(manifest);

    if (browser === "firefox") {
        manifest.applications = {
            "gecko": {
                "id": exports.firefox.id,
                "strict_min_version": "58.0"
            }
        };
        manifest.background.scripts = [
            "common.js",
            "platform/firefox-vars.js",
            "background/core.js",
            "platform/firefox-background.js",
            "background/rules.js",
            "background/debug.js"
        ];
        manifest.content_scripts[0].js = [
            "common.js",
            "libdom.js",
            "content/core.js",
            "platform/firefox-content.js",
            "content/rules-common.js",
            "content/rules-specific.js",
            "content/rules-sticky.js",
            "content/debug.js"
        ];
        delete manifest.minimum_chrome_version;
    } else if (browser === "edge") {
        manifest["-ms-preload"] = {
            "backgroundScript": "edgyfy.js",
            "contentScript": "edgyfy.js"
        };
        manifest.background.persistent = true;
        manifest.background.scripts = [
            "common.js",
            "platform/edge-vars.js",
            "background/core.js",
            "background/rules.js",
            "background/debug.js"
        ];
        // Edge does not care if the size is actually right but do care if the
        // key name is right
        manifest.browser_action.default_icon = {
            "38": "icon128.png"
        };
        manifest.browser_specific_settings = {
            "edge": {
                "browser_action_next_to_addressbar": true
            }
        };
        manifest.content_scripts[0].js = [
            "common.js",
            "libdom.js",
            "content/core.js",
            "platform/edge-content.js",
            "content/rules-common.js",
            "content/rules-specific.js",
            "content/rules-sticky.js",
            "content/debug.js"
        ];
        manifest.description = "An anti-adblock defuser for Nano Adblocker";
        manifest.icons = {
            "128": "icon128.png",
            "16": "icon128.png"
        };
        // TODO: Remove when Edge properly support split mode
        manifest.incognito = "spanning";
        delete manifest.minimum_chrome_version;
        manifest.minimum_edge_version = "41.16299.248.0";
        {
            const i = manifest.version.indexOf(".");
            manifest.version = manifest.version.substring(i + 1) + ".0";
        }
    }

    await fs.writeFile(path, JSON.stringify(manifest, null, 2), "utf8");
};
