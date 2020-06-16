/**
 * Publish extensions to Addons Server.
 */
"use strict";

/**
 * Credentials.
 * @const {Object|undefined}
 */
let credentials;
try {
    credentials = require("./find-credentials.js");
} catch (err) { }

/**
 * Load modules.
 * @const {Module}
 */
const assert = require("assert");
let signAddon;
try {
    signAddon = require("sign-addon");
} catch (err) { }

/**
 * Publish an extension package.
 * @async @function
 * @param {string} file - The path to the package file to upload.
 * @param {string} version - The version of the package.
 * @param {string} id - The ID of the extension.
 * @param {string} output - The output directory.
 */
exports.publish = async (file, version, id, output) => {
    assert(credentials && typeof credentials === "object");
    assert(signAddon && typeof signAddon === "object");
    assert(typeof credentials.AddonsServerIssuer === "string");
    assert(typeof credentials.AddonsServerSecret === "string");

    const result = await signAddon.default({
        xpiPath: file,
        version: version,
        apiKey: credentials.AddonsServerIssuer,
        apiSecret: credentials.AddonsServerSecret,
        id: id,
        downloadDir: output,
    });
    console.log("Package uploaded, server response:", result);
};
