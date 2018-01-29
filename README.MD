# Nano Build

Centralized build engine

## Usage

```Bash
node . <action> [<target>] [--upstream] [--pack] [--publish] [--trace-fs]

<action>          One of:
    --chromium    Build for Chromium
    --firefox     Build for Firefox
    --edge        Build for Edge
    --clean       Delete all build files, implicitly disable <target>, --upstream, "--pack", and "--publish"
<target>          One of:
    --both        (Default) Build Nano Adblocker and Nano Defender
    --adblocker   Build Nano Adblocker
    --defender    Build Nano Defender
    --ubo         Build uBlock Origin
--upstream        Prefer upstream repository
--pack            Create .zip packages
--publish         Publish build packages, implicitly apply "--pack"
--trace-fs        Log file system access
```
