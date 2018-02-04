/**
 * Find extension store access credentials.
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
    "WebStoreClient",
    "WebStoreSecret",
    "WebStoreAccount",

    "DefenderVersionKey",
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


for (let name of expected) {
    findOne(name);
}
