process.on("unhandledRejection", (e) => {
        throw e;
    });
    
//    todo: assert cwd

global.baseBuildPath = () => {
    global.isChromium = global.isFirefox = global.isEdge = false;

    let buildPath;
    switch (process.argv[2]) {
        case "--chromium":
            buildPath = "dist/build/Nano_Chromium";
            global.isChromium = true;
            break;
        case "--firefox":
            buildPath = "dist/build/Nano_Firefox";
            global.isFirefox = true;
            break;
        case "--edge":
            buildPath = "dist/build/Nano_Edge";
            global.isEdge = true;
            break;
    }
    assert(buildPath !== undefined);

    return buildPath;
};