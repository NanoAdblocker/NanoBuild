/**
 * Find credentials for publishing extensions.
 */
"use strict";


/**
 * Load modules.
 * @const {Module}
 */
const assert = require("assert");

/**
 * Local credentials.
 * @const {Object}
 */
const local = (() => {
    try {
        return require("../../Prototype/NanoBuild/credentials.js");
    } catch (err) {
        return {};
    }
})();
/**
 * All expected credentials.
 * @const {Array.<string>}
 */
const expected = [
    "WebStoreClient", // Google API app client
    "WebStoreSecret", // Google API app secret
    "WebStoreAccount", // Google account refresh token

    "AddonsServerIssuer", // Firefox extension store API issuer
    "AddonsServerSecret", // Firefox extension store API secret

    // "DefenderVersionKey", // Not used for now
];

/**
 * Find one credential.
 * @function
 * @param {string} name - The name of the credential.
 */
const findOne = (name) => {
    if (typeof local[name] === "string") {
        exports[name] = local[name];
    } else {
        exports[name] = process.env[name]
    }
    assert(typeof exports[name] === "string");
};


for (const name of expected) {
    findOne(name);
}
