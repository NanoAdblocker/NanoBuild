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
    console.log("Performing maintenance for Nano Defender...");

    const source = "https://raw.githubusercontent.com/gorhill/uBO-Extra/master/contentscript.js";
    const output = "../uBlockProtector/src/content/5-ubo-extra.js";

    const stream = fs.createWriteStream(output);
    stream.write(
        "(() => {\n" +
        "    if (a.uBOExtraExcluded) {\n" +
        "        return;\n" +
        "    }\n" +
        "\n"
    );

    return new Promise((resolve, reject) => {
        const options = url.parse(source);
        const req = https.request(options, (res) => {
            res.pipe(writeStream, {
                end: false,
            });

            res.on("end", () => {
                writeStream.end(
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
