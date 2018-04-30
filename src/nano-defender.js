/**
 * Build Nano Defender.
 */
"use strict";

/**
 * Load modules.
 * @const {Module}
 */
const fs = require("../lib/promise-fs.js");
const os = require("os");

/**
 * Build Nano Defender Integration list.
 * @async @function
 */
exports.buildList = async () => {
    console.log("Building Nano Defender Integration list...");

    let out = [];

    const buildOne = async (path, removeComments = true) => {
        let lines = await fs.readFileSync(path, "utf8");
        lines = lines.split("\n");

        let inPragmaBlock = false;
        let accepting = true;
        let keepNextComment = false;

        for (let line of lines) {
            line = line.trim();
            if (!line) {
                continue;
            }

            if (line === "!@pragma-if-true") {
                if (inPragmaBlock) {
                    throw new Error("A @pragma-if-true directive is enclosed in another @pragma-if-* block");
                }

                inPragmaBlock = true;
                accepting = true;
                continue;
            }
            if (line === "!@pragma-if-false") {
                if (inPragmaBlock) {
                    throw new Error("A @pragma-if-false directive is enclosed in another @pragma-if-* block");
                }

                inPragmaBlock = true;
                accepting = false;
                continue;
            }
            if (line === "!@pragma-else") {
                if (!inPragmaBlock) {
                    throw new Error("A @pragma-else directive does not have a matching @pragma-if-* directive");
                }

                accepting = !accepting;
                continue;
            }
            if (line === "!@pragma-end-if") {
                if (!inPragmaBlock) {
                    throw new Error("A @pragma-end-if directive does not have a matching @pragma-if-* directive");
                }

                inPragmaBlock = false;
                accepting = true;
                continue;
            }

            if (line === "!@pragma-keep-next-comment") {
                if (keepNextComment) {
                    throw new Error("Last @pragma-keep-next-comment directive was not consumed");
                }

                if (accepting) {
                    keepNextComment = true;
                }
                continue;
            }

            if (line.startsWith("!@pragma-")) {
                console.warn("Unrecognized directive: " + line);
            }

            if (removeComments && line.charAt(0) === '!') {
                if (keepNextComment) {
                    keepNextComment = false;
                } else {
                    continue;
                }
            }

            if (accepting) {
                out.push(line);
            }
        }

        if (inPragmaBlock) {
            throw new Error("A @pragma-if-* directive does not have a matching @pragma-end-if directive");
        }
    };

    const input = "../uBlockProtector/list";
    const output = "../uBlockProtector/uBlockProtectorList.txt";

    await buildOne(input + "/1-header.txt", false);
    await buildOne(input + "/2-integration.txt");
    await buildOne(input + "/3-rules.txt");
    await buildOne(input + "/4-generichide.txt");
    await buildOne(input + "/5-whitelist.txt");
    await buildOne(input + "/6-other.txt", false);

    out.push("");
    out = out.join(os.EOL);
    await fs.writeFile(output, out, "utf8");
};
