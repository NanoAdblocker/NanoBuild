/**
 * Nano Defender maintenance tools.
 */
"use strict";

/**
 * Load modules.
 * @const {Module}
 */
const https = require("https");
const url = require("url");
const fs = require("../lib/promise-fs.js");

/**
 * Perform maintenance of Nano Defender, update dependencies.
 * @async @function
 */
exports.performMaintenance = () => {
    console.log("Performing Maintenance for Nano Defender...");

    const source = "https://raw.githubusercontent.com/gorhill/uBO-Extra/master/contentscript.js";
    const output = "../uBlockProtector/src/content/5-ubo-extra.js";

    const stream = fs.createWriteStream(output);
    stream.write(
        "(() => {\n" +
        "    if (a.uBOExtraExcluded) {\n" +
        "        return;\n" +
        "    }\n" +
        "\n" +
        "\n" +
        "\n"
    );

    return new Promise((resolve, reject) => {
        const options = url.parse(source);
        const req = https.request(options, (res) => {
            res.pipe(stream, {
                end: false,
            });

            res.on("end", () => {
                stream.end(
                    "\n" +
                    "\n" +
                    "\n" +
                    "})();\n"
                );
                resolve();
            });

            res.on("error", reject);
        });
        req.on("error", reject);
        req.end();
    });
};
