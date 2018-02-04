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
exports.zip = async (inputDirectory, outputFile) => {
    const output = fs.createWriteStream(outputFile);

    const archive = archiver.create("zip", {});
    archive.pipe(output);
    archive.directory(inputDirectory, false);
    archive.finalize();

    archive.on("warning", (err) => {
        throw err;
    });
    archive.on("error", (err) => {
        throw err;
    });
};
