/**
 * Build engine entry point.
 */
"use strict";


/**
 * Load modules.
 * @const {Module}
 */
const assert = require("assert");
const del = require("del");
const nanoAdblocker = require("./src/nano-adblocker.js");
const nanoDefender = require("./src/nano-defender.js");
const nanoDefenderMaintenance = require("./src/nano-defender-maintenance.js");


process.on("unhandledRejection", (e) => {
    throw e;
});

assert(/[\\/]NanoBuild$/.test(process.cwd()));

(async () => {
    let action = null;
    let target = null;
    let pack = null;
    let publish = null;
    let capability = "standard";

    const argv = process.argv.slice(2);
    for (const arg of argv) {
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
            case "--maintenance":
                assert(action === null);
                action = "maintenance";
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

            case "--pro":
                assert(capability === "standard");
                capability = "pro";
                break;

            case "--pack":
                assert(pack === null);
                pack = true;
                break;
            case "--publish":
                assert(publish === null);
                publish = true;
                break;

            case "--list-only":
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
    if (pack === null) {
        pack = false;
    }
    if (publish === null) {
        publish = false;
    }

    if (action === "maintenance") {
        if (target === "both" || target === "adblocker") {
            console.log("No Maintenance Needed for Nano Adblocker.");
        }

        if (target === "both" || target === "defender") {
            await nanoDefenderMaintenance.performMaintenance();
        }

    } else if (action === "clean") {
        await del("./dist");
    } else {
        if (target === "both" || target === "adblocker") {
            await nanoAdblocker.buildCore(action);
            await nanoAdblocker.buildFilter(action);
            await nanoAdblocker.buildResources(action);
            await nanoAdblocker.buildLocale(action);

            if (pack || publish) {
                await nanoAdblocker.test(action);
                await nanoAdblocker.pack(action);
            }
            if (publish) {
                await nanoAdblocker.publish(action);
            }
        }

        if (target === "both" || target === "defender") {
            await nanoDefender.buildList(action, capability);
            await nanoDefender.buildExtension(action, capability);

            if (pack || publish) {
                await nanoDefender.test(action, capability);
                await nanoDefender.pack(action, capability);
            }
            if (publish) {
                await nanoDefender.publish(action, capability);
            }
        }

    }
})();
