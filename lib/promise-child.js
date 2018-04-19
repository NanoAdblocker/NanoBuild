/**
 * Promisified child process module.
 */
"use strict";


/**
 * Load modules.
 * @const {Module}
 */
const childProcess = require("child-process");


exports.exec = (...args) => {
    return new Promise((resolve, reject) => {
        console.log("childProcess.exec", ...args);

        childProcess.exec(...args, (err, stdout, stderr) => {
            if (err) {
                reject(err);
            } else {
                stdout = stdout.trim();
                stderr = stderr.trim();

                console.log("childProcess.exec stdout");
                if (stdout) {
                    console.log(stdout);
                }

                console.log("childProcess.exec stderr");
                if (stderr) {
                    console.log(stderr);
                }

                resolve();
            }
        });
    });
};
