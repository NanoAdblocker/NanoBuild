/**
 * Nano Defender build script.
 */
"use strict";

/**
 * Load modules.
 * @const {Module}
 */
const data = require("./nano-defender-data.js");
const fs = require("../lib/promise-fs.js");
const os = require("os");
const smartBuild = require("../lib/smart-build.js");

/**
 * Source repositories and files.
 * @const {string}
 */
const srcRepo = "../uBlockProtector";

/**
 * Build Nano Defender Integration filter list.
 * @async @function
 */
exports.buildList = async () => {
    console.log("Building Nano Defender Integration List...");

    const buildOne = async (path, outStream, removeComments = true) => {
        let lines = await fs.readFile(path, "utf8");
        lines = lines.split("\n");

        let inPragmaBlock = false;
        let accepting = true;
        let keepNextComment = false;

        for (let line of lines) {
            line = line.trim();
            if (!line) {
                continue;
            }

            if (line === "!@pragma-if-true") {
                if (inPragmaBlock) {
                    throw new Error("A @pragma-if-true directive is enclosed in another @pragma-if-* block");
                }

                inPragmaBlock = true;
                accepting = true;
                continue;
            }
            if (line === "!@pragma-if-false") {
                if (inPragmaBlock) {
                    throw new Error("A @pragma-if-false directive is enclosed in another @pragma-if-* block");
                }

                inPragmaBlock = true;
                accepting = false;
                continue;
            }
            if (line === "!@pragma-else") {
                if (!inPragmaBlock) {
                    throw new Error("A @pragma-else directive does not have a matching @pragma-if-* directive");
                }

                accepting = !accepting;
                continue;
            }
            if (line === "!@pragma-end-if") {
                if (!inPragmaBlock) {
                    throw new Error("A @pragma-end-if directive does not have a matching @pragma-if-* directive");
                }

                inPragmaBlock = false;
                accepting = true;
                continue;
            }

            if (line === "!@pragma-keep-next-comment") {
                if (keepNextComment) {
                    throw new Error("Last @pragma-keep-next-comment directive was not consumed");
                }

                if (accepting) {
                    keepNextComment = true;
                }
                continue;
            }

            if (line.startsWith("!@pragma-")) {
                console.warn("Unrecognized directive: " + line);
            }

            if (removeComments && line.charAt(0) === '!') {
                if (keepNextComment) {
                    keepNextComment = false;
                } else {
                    continue;
                }
            }

            if (accepting) {
                outStream.write(line);
                outStream.write(os.EOL);
            }
        }

        if (inPragmaBlock) {
            throw new Error("A @pragma-if-* directive does not have a matching @pragma-end-if directive");
        }
    };

    const input = srcRepo + "/list";
    const output = srcRepo + "/uBlockProtectorList.txt";

    let outStream = fs.createWriteStream(output, {
        flags: "w",
        encoding: "utf8",
    });

    await buildOne(input + "/1-header.txt", outStream, false);
    await buildOne(input + "/2-integration.txt", outStream);
    await buildOne(input + "/3-rules.txt", outStream);
    await buildOne(input + "/4-generichide.txt", outStream);
    await buildOne(input + "/5-whitelist.txt", outStream);
    await buildOne(input + "/6-other.txt", outStream, false);

    await new Promise((resolve) => {
        outStream.end(os.EOL, resolve);
    });
};

/**
 * Build Nano Defender.
 * @async @function
 * @param {Enum} browser - One of "chromium", "firefox", "edge".
 */
exports.buildExtension = async (browser) => {
    console.log("Building Nano Defender...");
    assert(browser === "chromium" || browser === "firefox" || browser === "edge");

    let outputPath = "./dist";
    await smartBuild.createDirectory(outputPath);
    outputPath += "/nano_defender_" + browser;
    await smartBuild.createDirectory(outputPath);

    await smartBuild.copyDirectory(srcRepo + "/src", outputPath);
    await data.patchManifest(browser);
};

/**
 * Test the build package.
 * @async @function
 * @param {Enum} browser - One of "chromium", "firefox", "edge".
 */
exports.test = async (browser) => {
    console.log("Testing Nano Defender...");
    assert(browser === "chromium" || browser === "firefox" || browser === "edge");

    const inputPath = "./dist/nano_defender_" + browser;
    await checkSyntax.validateDirectory(inputPath);
};
/**
 * Create zip package.
 * @async @function
 * @param {Enum} browser - One of "chromium", "firefox", "edge".
 */
exports.pack = async (browser) => {
    console.log("Packaging Nano Defender...");
    assert(browser === "chromium" || browser === "firefox" || browser === "edge");

    const inputPath = "./dist/nano_defender_" + browser;
    const outputPath = inputPath + ".zip";
    await makeArchive.zip(inputPath, outputPath);
};
/**
 * Publish package to extension store.
 * @async @function
 * @param {Enum} browser - One of "chromium", "firefox", "edge".
 */
exports.publish = async (browser) => {
    console.log("Publishing Nano Defender...");
    assert(browser === "chromium" || browser === "firefox" || browser === "edge");

    const inputPath = "./dist/nano_defender_" + browser + ".zip";

    if (browser === "chromium") {
        await webStore.publish(inputPath, data.chromium.id);
    } else if (browser === "firefox") {
        await addonsServer.publish(inputPath, data.version, data.firefox.id, "./dist/");
    } else if (browser === "edge") {
        if (packEdge === undefined) {
            packEdge = require("../../Prototype/NanoBuild/pack-edge.js");
        }

        // The packaging module can break the directory structure
        await del("./dist/nano_defender_edge_appx");
        await del("./dist/NanoDefender");
        await smartBuild.copyDirectory(
            "./dist/nano_defender_" + browser,
            "./dist/nano_defender_" + browser + "_appx",
        );

        await packEdge.packDefender(
            fs, childProcess,
            "../NanoCore/platform/edge/package-img",
            "./dist",
            "./nano_defender_" + browser + "_appx",
        );

        console.warn(".appx package created, automatic upload is NOT yet implemented");
    }
};
