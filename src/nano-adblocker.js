/**
 * Build Nano Adblocker.
 */
"use strict";

/**
 * Load modules.
 * @const {Module}
 */
const assert = require("assert");
const checkSyntax = require("../lib/check-syntax.js");
const data = require("./nano-adblocker-data.js");
const fs = require("../lib/promise-fs.js");
const makeArchive = require("../lib/make-archive.js");
const smartBuild = require("../lib/smart-build.js");
const webStore = require("../lib/web-store.js");

/**
 * Build Nano Adblocker core.
 * @function
 * @param {Enum} browser - One of "chromium", "firefox", "edge".
 */
exports.buildCore = async (browser) => {
    console.log("Building Nano Adblocker Core...");
    assert(browser === "chromium" || browser === "firefox" || browser === "edge");

    let outputPath = "./dist";
    await smartBuild.createDirectory(outputPath);
    outputPath += "/nano_adblocker_" + browser;
    await smartBuild.createDirectory(outputPath);

    await smartBuild.copyDirectory("../NanoCore/src/css", outputPath + "/css");
    await smartBuild.copyDirectory("../NanoCore/src/nano-img", outputPath + "/img");
    await smartBuild.copyDirectory("../NanoCore/src/js", outputPath + "/js");
    await smartBuild.copyDirectory("../NanoCore/src/lib", outputPath + "/lib");
    await smartBuild.copyDirectory("../NanoCore/src", outputPath, false);
    await smartBuild.copyDirectory("../NanoCore/platform/chromium", outputPath + "/js", false);
    await Promise.all([
        smartBuild.copyDirectory("../NanoCore/platform/chromium/other", outputPath, false),
        smartBuild.copyFile("../NanoCore/LICENSE", outputPath + "/LICENSE"),
    ]);
    await smartBuild.buildFile(["./src/nano-adblocker-data.js"], outputPath + "/manifest.json", async () => {
        await fs.writeFile(outputPath + "/manifest.json", data.manifest(browser), "utf8");
    });

    if (browser === "firefox") {
        await smartBuild.copyDirectory("../NanoCore/platform/webext", outputPath + "/js", false, true);
    } else if (browser === "edge") {
        await Promise.all([
            smartBuild.copyDirectory("../NanoCore/platform/edge", outputPath + "/js", false, true),
            smartBuild.copyFile("../Edgyfy/edgyfy.js", outputPath + "/js/edgyfy.js"),
        ]);
    }
};
/**
 * Copy filters over, requires the core to be already built.
 * @async @function
 * @param {Enum} browser - One of "chromium", "firefox", "edge".
 */
exports.buildFilter = async (browser) => {
    console.log("Building Nano Adblocker Assets...");
    assert(browser === "chromium" || browser === "firefox" || browser === "edge");

    const outputPath = "./dist/nano_adblocker_" + browser + "/assets";
    await smartBuild.createDirectory(outputPath);

    await Promise.all([
        smartBuild.copyFile("../NanoCore/assets/assets.json", outputPath + "/assets.json"),
        smartBuild.copyDirectory("../NanoFilters/NanoFilters", outputPath + "/NanoFilters"),
    ]);
    await smartBuild.copyDirectory("../NanoFilters/ThirdParty", outputPath + "/ThirdParty");
};
/**
 * Build locale files, requires the core to be already built.
 * @async @function
 * @param {Enum} browser - One of "chromium", "firefox", "edge".
 */
exports.buildLocale = async (browser) => {
    console.log("Building Nano Adblocker Locale...");
    assert(browser === "chromium" || browser === "firefox" || browser === "edge");

    const outputPath = "./dist/nano_adblocker_" + browser + "/_locales";
    await smartBuild.createDirectory(outputPath);

    let allKeys = [];
    let [enOriginal, enExtra] = await Promise.all([
        fs.readFile("../NanoCore/src/_locales/en/messages.json", "utf8"),
        fs.readFile("../NanoCore/src/_nano-locales/en/messages.nano.js", "utf8"),
    ]);
    enOriginal = JSON.parse(enOriginal);
    enExtra = eval(enExtra); // Trust me, it will be fine

    assert(enOriginal && typeof enOriginal === "object");
    assert(enExtra && typeof enExtra === "object");

    for (let key in enOriginal) {
        if (key === "dummy") {
            continue;
        }

        if (enOriginal.hasOwnProperty(key)) {
            assert(!allKeys.includes(key));
            assert(enOriginal[key] && typeof enOriginal[key] === "object" && typeof enOriginal[key].message === "string");
            allKeys.push(key);
        }
    }
    for (let key in enExtra) {
        if (enExtra.hasOwnProperty(key)) {
            assert(!allKeys.includes(key));
            assert(enExtra[key] && typeof enExtra[key] === "object" && typeof enExtra[key].message === "string");
            allKeys.push(key);
        }
    }

    const processOne = async (lang, hasExtra) => {
        await smartBuild.createDirectory(outputPath + "/" + lang);

        let original, extra;
        if (hasExtra) {
            [original, extra] = await Promise.all([
                fs.readFile("../NanoCore/src/_locales/" + lang + "/messages.json", "utf8"),
                fs.readFile("../NanoCore/src/_nano-locales/" + lang + "/messages.nano.js", "utf8"),
            ]);
        } else {
            original = await fs.readFile("../NanoCore/src/_locales/" + lang + "/messages.json", "utf8");
            extra = "(() => { 'use strict'; return { }; })();";
        }
        original = JSON.parse(original);
        extra = eval(extra);

        let result = {};
        for (let key of allKeys) {
            const originalHas = original.hasOwnProperty(key);
            const extraHas = extra.hasOwnProperty(key);

            assert(!originalHas || !extraHas);
            if (originalHas) {
                assert(original[key] && typeof original[key] === "object" && typeof original[key].message === "string");
                result[key] = original[key];
            } else if (extraHas) {
                assert(extra[key] && typeof extra[key] === "object" && typeof extra[key].message === "string");
                result[key] = extra[key];
            } else {
                // Fallback to English
                const originalHas = enOriginal.hasOwnProperty(key);
                const extraHas = enExtra.hasOwnProperty(key);

                assert(originalHas !== extraHas);
                if (originalHas) {
                    result[key] = enOriginal[key];
                } else {
                    result[key] = enExtra[key];
                }
            }

            result[key].message = result[key].message.replace(/uBlock Origin|uBlock\u2080|uBlock(?!\/)|uBO/g, "Nano").replace(/ublock/g, "nano");

            // Special cases
            if (key === "1pResourcesOriginal") {
                result[key].message = result[key].message.replace("Nano", "uBlock Origin");
            }
            if (key === "aboutBasedOn") {
                result[key].message = result[key].message.replace("{{@data}}", data.basedOn);
            }
        }

        await fs.writeFile(outputPath + "/" + lang + "/messages.json", JSON.stringify(result, null, 2), "utf8");
    };

    const [langsOriginal, langsExtra] = await Promise.all([
        fs.readdir("../NanoCore/src/_locales"),
        fs.readdir("../NanoCore/src/_nano-locales"),
    ]);
    let tasks = [];
    for (let lang of langsOriginal) {
        if (langsExtra.includes(lang)) {
            tasks.push(smartBuild.buildFile([
                "./src/nano-adblocker-data.js",
                "../NanoCore/src/_locales/" + lang + "/messages.json",
                "../NanoCore/src/_nano-locales/" + lang + "/messages.nano.js",
            ], outputPath + "/" + lang + "/messages.json", processOne, lang, true));
        } else {
            tasks.push(smartBuild.buildFile([
                "./src/nano-adblocker-data.js",
                "../NanoCore/src/_locales/" + lang + "/messages.json",
            ], outputPath + "/" + lang + "/messages.json", processOne, lang, false));
        }
    }
    await Promise.all(tasks);

    if (browser === "chromium") {
        await smartBuild.copyDirectory(outputPath + "/nb", outputPath + "/no");
    }
};

/**
 * Test the build package.
 * @async @function
 * @param {Enum} browser - One of "chromium", "firefox", "edge".
 */
exports.test = async (browser) => {
    console.log("Testing Nano Adblocker...");
    assert(browser === "chromium" || browser === "firefox" || browser === "edge");

    const inputPath = "./dist/nano_adblocker_" + browser;
    await checkSyntax.validateDirectory(inputPath);
};
/**
 * Create zip package.
 * @async @function
 * @param {Enum} browser - One of "chromium", "firefox", "edge".
 */
exports.pack = async (browser) => {
    console.log("Packaging Nano Adblocker...");
    assert(browser === "chromium" || browser === "firefox" || browser === "edge");

    const inputPath = "./dist/nano_adblocker_" + browser;
    const outputPath = "./dist/nano_adblocker_" + browser + ".zip";
    await makeArchive.zip(inputPath, outputPath);
};
/**
 * Publish package to extension store.
 * @async @function
 * @param {Enum} browser - One of "chromium".
 */
exports.publish = async (browser) => {
    console.log("Publishing Nano Adblocker...");
    assert(browser === "chromium");

    const inputPath = "./dist/nano_adblocker_" + browser + ".zip";

    if (browser === "chromium") {
        await webStore.publish(inputPath, "gabbbocakeomblphkmmnoamkioajlkfo");
    }
};
