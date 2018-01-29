/**
 * Main build script.
 */
"use strict";


/**
 * Load modules.
 * @const {Module}
 */
const assert = require("assert");
const del = require("del");
const nanoAdblocker = require("./src/nano-adblocker.js");


(async () => {
    process.on("unhandledRejection", (e) => {
        throw e;
    });
    assert(/[\\/]NanoBuild$/.test(process.cwd()));

    let action = null;
    let target = null;
    let upstream = null;
    let pack = null;
    let publish = null;

    let argv = process.argv.slice(2);
    for (let arg of argv) {
        switch (arg) {
            case "--chromium":
                assert(action === null);
                action = "chromium";
                break;
            case "--firefox":
                assert(action === null);
                action = "firefox";
                break;
            case "--edge":
                assert(action === null);
                action = "edge";
                break;
            case "--clean":
                assert(action === null);
                action = "clean";
                break;

            case "--both":
                assert(target === null);
                target = "both";
                break;
            case "--adblocker":
                assert(target === null);
                target = "adblocker";
                break;
            case "--defender":
                assert(target === null);
                target = "defender";
                break;
            case "--ubo":
                assert(target === null);
                target = "ubo";
                break;

            case "--upstream":
                assert(upstream === null);
                upstream = true;
                break;
            case "--pack":
                assert(pack === null);
                pack = true;
                break;
            case "--publish":
                assert(publish === null);
                publish = true;
                break;

            case "--trace-fs":
                break;
            default:
                assert(false);
                break;
        }
    }
    assert(action !== null);
    if (target === null) {
        target = "both";
    }
    if (upstream === null) {
        upstream = false;
    }
    if (pack === null) {
        pack = false;
    }
    if (publish === null) {
        publish = false;
    }
    if (publish) {
        pack = true;
    }

    switch (action) {
        case "clean":
            await del("./build");
            return;

        default:
            await nanoAdblocker.buildCore(action, upstream);
            await nanoAdblocker.buildFilter(action, upstream);
            await nanoAdblocker.buildLocale(action, upstream);
            break;
    }

    if (pack) {
        //todo validate build result (parse js, json)
        //todo pack
    }

    if (publish) {
        //todo find credentials
        //todo publish
    }
})();
