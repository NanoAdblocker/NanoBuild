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
        manifest.background.scripts = [
            "common.js",
            "platform/firefox-vars.js",
            "background/1-background-core.js",
            "platform/chromium-background.js", // This is not a mistake
            "platform/firefox-background.js",
            "background/2-background-rules.js",
            "background/3-background-debug.js",
        ];
        manifest.content_scripts.js = [
            "common.js",
            "content/1-content-domlib.js",
            "content/2-content-core.js",
            "platform/firefox-content.js",
            "content/3-content-rules-1-common.js",
            "content/3-content-rules-2-specific.js",
            "content/3-content-rules-3-sticky.js",
            "content/3-content-rules-4-proprietary.js",
            "content/4-content-debug.js",
            "content/5-ubo-extra.js"
        ];
    } else if (browser === "edge") {
        manifest.background.scripts = [
            "common.js",
            "platform/edge-vars.js",
            "background/1-background-core.js",
            "background/2-background-rules.js",
            "background/3-background-debug.js",
        ];
    }

    await fs.writeFile(path, JSON.stringify(manifest, null, 2), "utf8");
};
