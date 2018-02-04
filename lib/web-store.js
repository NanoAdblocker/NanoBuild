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
const request = require("request");

