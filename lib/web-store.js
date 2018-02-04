/**
 * Publish extensions to Web Store.
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

/**
 * Serialize an object.
 * @function
 * @param {Object} obj - The object to serialize.
 * @return {string} The serialized string.
 */
const serialize = (obj) => {

};

/**
 * Publish an extension package.
 * @async @function
 */
exports.publish = async (file) => {
    assert(credentials && typeof credentials === "object");
    assert(typeof credentials.WebStoreClient === "string");
    assert(typeof credentials.WebStoreSecret === "string");
    assert(typeof credentials.WebStoreAccount === "string");

    assert(file.endsWith(".zip"));
    const fileStat = fs.lstat(file);
    assert(!fileStat.isSymbolicLink() && fileStat.isFile());

    request.post("https://accounts.google.com/o/oauth2/token").form({
        client_id: credentials.WebStoreClient,
        client_secret: credentials.WebStoreSecret,
        refresh_token: credentials.WebStoreAccount,
        grant_type: "refresh_token",
    })
};
