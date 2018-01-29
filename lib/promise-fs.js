/**
 * Promisified file system module.
 *
 * Watches for "--trace-fs" command line argument, if exists
 * file system calls are logged.
 */
"use strict";


/**
 * Load modules.
 * @const {Module}
 */
const fs = require("fs");
const util = require("util");

/**
 * The new file system namespace, functions are added as needed.
 * @const {Namespace}
 */
const newfs = {
    appendFile: promisify(ofs.appendFile),
    copyFile: promisify(ofs.copyFile),
    lstat: promisify(ofs.lstat),
    mkdir: promisify(ofs.mkdir),
    readdir: promisify(ofs.readdir),
    readFile: promisify(ofs.readFile),
    writeFile: promisify(ofs.writeFile),
};

/**
 * Print variables, truncate long strings.
 * @function
 * @param {Any} ...args - Variables to print.
 */
const printf = (...args) => {
    let out = [];
    for (let arg of args) {
        if (typeof arg === "string" && arg.length > 200) {
            out.push("<String " + arg.substring(0, 200) + " ... >");
        } else {
            out.push(arg);
        }
    }
    console.log(...out);
};


if (process.argv.includes("--trace-fs")) {
    module.exports = {
        appendFile: (...args) => {
            printf("fs.appendFile", ...args);
            return newfs.appendFile(...args);
        },
        copyFile: (...args) => {
            printf("fs.copyFile", ...args);
            return newfs.copyFile(...args);
        },
        lstat: (...args) => {
            printf("fs.lstat", ...args);
            return newfs.lstat(...args);
        },
        mkdir: (...args) => {
            printf("fs.mkdir", ...args);
            return newfs.mkdir(...args);
        },
        readdir: (...args) => {
            printf("fs.readdir", ...args);
            return newfs.readdir(...args);
        },
        readFile: (...args) => {
            printf("fs.readFile", ...args);
            return newfs.readFile(...args);
        },
        writeFile: (...args) => {
            printf("fs.writeFile", ...args);
            return newfs.writeFile(...args);
        },
    }
} else {
    module.exports = newfs;
}
