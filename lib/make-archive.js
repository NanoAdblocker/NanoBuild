/**
 * Create zip archive.
 */
"use strict";

/**
 * Load modules.
 * @const {Module}
 */
const archiver = require("archiver");
const fs = require("fs");

/**
 * Create a zip archive that contains files in one directory.
 * @async @function
 * @param {string} inputDirectory - The path to the directory to zip.
 * @param {string} outputFile - The path to the zip file to create.
 */
exports.zip = (inputDirectory, outputFile) => {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outputFile);
        const input = archiver.create("zip", {});

        input.pipe(output);
        input.on("end", () => {
            resolve();
        });

        input.directory(inputDirectory, false);
        input.finalize();

        input.on("warning", reject);
        input.on("error", reject);
    });
};
