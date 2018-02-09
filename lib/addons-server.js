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
const fs = require("./promise-fs.js");
const https = require("https");
const url = require("url");

/**
 * Publish an extension package.
 * @async @function
 * @param {string} file - The path to the package file to upload.
 */
exports.publish = async (file) => {
    // TODO...
};
