/**
 * Nano Adblocker build script.
 */
"use strict";

/**
 * Load modules.
 * @const {Module}
 */
const addonsServer = require("../lib/addons-server.js");
const assert = require("assert");
const checkSyntax = require("../lib/check-syntax.js");
const childProcess = require("../lib/promise-child.js");
const data = require("./nano-adblocker-data.js");
const del = require("del");
const forge = require("node-forge");
const fs = require("../lib/promise-fs.js");
const makeArchive = require("../lib/make-archive.js");
let packEdge; // Optional module for creating .appx package for Edge
const smartBuild = require("../lib/smart-build.js");
const webStore = require("../lib/web-store.js");

/**
 * Source repositories and files.
 * @const {string}
 */
const srcRepo = "../NanoCore";
const assetsRepo = "../NanoFilters";
const edgeShim = "../Edgyfy/edgyfy.js";

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

    await smartBuild.copyDirectory(srcRepo + "/src/css", outputPath + "/css");
    await smartBuild.copyDirectory(srcRepo + "/src/nano-img", outputPath + "/img");
    await smartBuild.copyDirectory(srcRepo + "/src/js", outputPath + "/js");
    await smartBuild.copyDirectory(srcRepo + "/src/lib", outputPath + "/lib");
    await smartBuild.copyDirectory(srcRepo + "/src", outputPath, false);
    await smartBuild.copyDirectory(srcRepo + "/platform/chromium", outputPath + "/js", false);
    await Promise.all([
        smartBuild.copyDirectory(srcRepo + "/platform/chromium/other", outputPath, false),
        smartBuild.copyFile(srcRepo + "/LICENSE", outputPath + "/LICENSE"),
    ]);
    await smartBuild.buildFile(
        ["./src/nano-adblocker-data.js"],
        outputPath + "/manifest.json",
        async () => {
            await fs.writeFile(outputPath + "/manifest.json", data.manifest(browser), "utf8");
        },
    );

    if (browser === "firefox") {
        await smartBuild.copyDirectory(srcRepo + "/platform/firefox", outputPath + "/js", false, true);
        // TODO: uBO concat vapi-usercss.js vapi-usercss.real.js into contentscript.js and eliminate them.
        await del(outputPath + "/js/vapi-usercss.pseudo.js");
        await del(outputPath + "/options_ui.html");
        await del(outputPath + "/js/options_ui.js");

    } else if (browser === "edge") {
        await Promise.all([
            smartBuild.copyDirectory(srcRepo + "/platform/edge", outputPath + "/js", false, true),
            smartBuild.copyFile(edgeShim, outputPath + "/js/edgyfy.js"),
        ]);
    }
};
/**
 * Build filters, requires the core to be already built.
 * @async @function
 * @param {Enum} browser - One of "chromium", "firefox", "edge".
 */
exports.buildFilter = async (browser) => {
    console.log("Building Nano Adblocker Assets...");
    assert(browser === "chromium" || browser === "firefox" || browser === "edge");

    const outputPath = "./dist/nano_adblocker_" + browser + "/assets";
    await smartBuild.createDirectory(outputPath);

    await Promise.all([
        smartBuild.copyFile(srcRepo + "/assets/assets.json", outputPath + "/assets.json"),
        smartBuild.copyDirectory(assetsRepo + "/NanoFilters", outputPath + "/NanoFilters"),
    ]);
    await smartBuild.copyDirectory(assetsRepo + "/ThirdParty", outputPath + "/ThirdParty");
};
/**
 * Build web accessible resources, requires the core to be already built.
 * @async @function
 * @param {Enum} browser - One of "chromium", "firefox", "edge".
 */
exports.buildResources = async (browser) => {
    console.log("Building Nano Adblocker Resources...");
    assert(browser === "chromium" || browser === "firefox" || browser === "edge");

    const outputPath = "./dist/nano_adblocker_" + browser + "/web_accessible_resources";
    await smartBuild.createDirectory(outputPath);

    const metaFile = srcRepo + "/src/web_accessible_resources/to-import.txt";
    const recordFile = srcRepo + "/src/web_accessible_resources/imported.txt";
    const buildRecordFile = outputPath + "/imported.txt";

    const parseOneDatabase = (data) => {
        const reNonEmptyLine = /\S/;
        const reSplitFields = /\s+/;

        data = data.split("\n");

        let fields = null;
        let encoded = null;
        let database = {};
        const registerEntry = () => {
            const [name, mime] = fields.splice(0, 2);
            let content;
            if (encoded) {
                content = fields.join("");
            } else {
                content = fields.join("\n");
            }

            database[name] = {
                mime: mime,
                content: content,
            };

            fields = null;
            encoded = null;
        };

        for (let line of data) {
            if (line.startsWith("#")) {
                continue;
            }

            if (fields === null) {
                line = line.trim();
                if (!line) {
                    continue;
                }
                fields = line.split(reSplitFields);
                assert(fields.length === 2);
                encoded = fields[1].includes(";");
                continue;
            }

            if (reNonEmptyLine.test(line)) {
                if (encoded) {
                    fields.push(line.trim());
                } else {
                    fields.push(line);
                }
                continue;
            }

            registerEntry();
        }
        if (fields) {
            registerEntry();
        }

        return database;
    };

    const processOne = async (name, dbEntry, recordStream) => {
        const reExtractMime = /^[^/]+\/([^\s;]+)/;

        recordStream.write(name);
        recordStream.write("\n");

        let md5 = forge.md.md5.create();
        md5.update(name);
        name = md5.digest().toHex();

        let suffix = reExtractMime.exec(dbEntry.mime);
        assert(suffix);
        name += "." + suffix[1];

        recordStream.write(name);
        recordStream.write("\n");

        const isBinay = dbEntry.mime.endsWith(";base64");
        if (isBinay) {
            await fs.writeFile(outputPath + "/" + name, Buffer.from(dbEntry.content, "base64"), "binary");
        } else {
            await fs.writeFile(outputPath + "/" + name, dbEntry.content + "\n", "utf8");
        }
    };
    const processAll = async () => {
        let data = await fs.readFile(metaFile, "utf8");
        data = data.split("\n");
        let toImport = [];
        for (let d of data) {
            d = d.trim();
            if (!d) {
                continue;
            }
            if (d.startsWith("#")) {
                continue;
            }
            toImport.push(d);
        }

        let [ublock, nano] = await Promise.all([
            fs.readFile(assetsRepo + "/ThirdParty/uBlockResources.txt", "utf8"),
            fs.readFile(assetsRepo + "/NanoFilters/NanoResources.txt", "utf8"),
        ]);
        ublock = parseOneDatabase(ublock);
        nano = parseOneDatabase(nano);

        await fs.copyFile(recordFile, buildRecordFile);
        let recordStream = fs.createWriteStream(buildRecordFile, {
            flags: "a",
            encoding: "utf8",
        });

        for (const file of toImport) {
            if (file in nano) {
                await processOne(file, nano[file], recordStream);
            } else if (file in ublock) {
                await processOne(file, ublock[file], recordStream);
            } else {
                assert(false);
            }
        }

        await new Promise((resolve) => {
            recordStream.end("\n", resolve);
        });
    };

    await smartBuild.buildFile([metaFile, recordFile], buildRecordFile, processAll);
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
        fs.readFile(srcRepo + "/src/_locales/en/messages.json", "utf8"),
        fs.readFile(srcRepo + "/src/_nano-locales/en/messages.nano.js", "utf8"),
    ]);
    enOriginal = JSON.parse(enOriginal);
    enExtra = eval(enExtra); // Trust me, it will be fine

    assert(enOriginal && typeof enOriginal === "object");
    assert(enExtra && typeof enExtra === "object");

    for (const key in enOriginal) {
        if (key === "dummy") {
            continue;
        }

        if (enOriginal.hasOwnProperty(key)) {
            assert(!allKeys.includes(key));
            assert(enOriginal[key] && typeof enOriginal[key] === "object" && typeof enOriginal[key].message === "string");
            allKeys.push(key);
        }
    }
    for (const key in enExtra) {
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
                fs.readFile(srcRepo + "/src/_locales/" + lang + "/messages.json", "utf8"),
                fs.readFile(srcRepo + "/src/_nano-locales/" + lang + "/messages.nano.js", "utf8"),
            ]);
        } else {
            original = await fs.readFile(srcRepo + "/src/_locales/" + lang + "/messages.json", "utf8");
            extra = "(() => { 'use strict'; return { }; })();";
        }
        original = JSON.parse(original);
        extra = eval(extra);

        let result = {};
        for (const key of allKeys) {
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
            if (key === "1pResourcesOriginal") {
                result[key].message = result[key].message.replace("Nano", "uBlock Origin");
            }
            if (key === "aboutBasedOn") {
                // Modded 2018-06-21, Firefox always have UserCSS enabled, modded based on message here.
                data.basedOn = data.basedOn.replace((browser === "firefox" ? " UserCSS/disabled" : ""), "");
                result[key].message = result[key].message.replace("{{@data}}", data.basedOn);
            }
        }

        await fs.writeFile(outputPath + "/" + lang + "/messages.json", JSON.stringify(result, null, 2), "utf8");
    };

    const [langsOriginal, langsExtra] = await Promise.all([
        fs.readdir(srcRepo + "/src/_locales"),
        fs.readdir(srcRepo + "/src/_nano-locales"),
    ]);
    let tasks = [];
    for (const lang of langsOriginal) {
        if (langsExtra.includes(lang)) {
            tasks.push(smartBuild.buildFile([
                "./src/nano-adblocker-data.js",
                srcRepo + "/src/_locales/" + lang + "/messages.json",
                srcRepo + "/src/_nano-locales/" + lang + "/messages.nano.js",
            ], outputPath + "/" + lang + "/messages.json", processOne, lang, true));
        } else {
            tasks.push(smartBuild.buildFile([
                "./src/nano-adblocker-data.js",
                srcRepo + "/src/_locales/" + lang + "/messages.json",
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
    const outputPath = inputPath + ".zip";
    await makeArchive.zip(inputPath, outputPath);
};
/**
 * Publish package to extension store.
 * @async @function
 * @param {Enum} browser - One of "chromium", "firefox", "edge".
 */
exports.publish = async (browser) => {
    console.log("Publishing Nano Adblocker...");
    assert(browser === "chromium" || browser === "firefox" || browser === "edge");

    const inputPath = "./dist/nano_adblocker_" + browser + ".zip";

    if (browser === "chromium") {
        await webStore.publish(inputPath, data.chromium.id);
    } else if (browser === "firefox") {
        await addonsServer.publish(inputPath, data.version, data.firefox.id, "./dist/");
    } else if (browser === "edge") {
        if (packEdge === undefined) {
            packEdge = require("../../Prototype/NanoBuild/pack-edge.js");
        }

        // The packaging module can break the directory structure
        await del("./dist/nano_adblocker_edge_appx");
        await del("./dist/NanoAdblocker");
        await smartBuild.copyDirectory(
            "./dist/nano_adblocker_" + browser,
            "./dist/nano_adblocker_" + browser + "_appx",
        );

        await packEdge.packAdblocker(
            fs, childProcess,
            srcRepo + "/platform/edge/package-img",
            "./dist",
            "./nano_adblocker_" + browser + "_appx",
        );

        console.warn(".appx package created, automatic upload is NOT yet implemented");
    }
};
