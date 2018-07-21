# Nano Build [![Dependencies](https://david-dm.org/NanoAdblocker/NanoBuild.svg)](https://david-dm.org/NanoAdblocker/NanoBuild)

The centralized build center

An automated build center for streamlined build, test, and publish development
cycles. Requires latest current branch of [Node.js](https://nodejs.org/en/).

Although the build engine reads credentials from environment variables, it is
not safe to use it in continuous integration servers where the output console
is publicly viewable.

Credentials that you need are documented [here](/lib/find-credentials.js).

The packaging tools for Edge is proprietary, but you can find everything you
need to know
[here](https://docs.microsoft.com/en-us/microsoft-edge/extensions/guides/packaging/using-manifoldjs-to-package-extensions).

## Usage

Depending on what is being built, these repositories may be required to be in
the same parent directory: `NanoAdblocker/NanoCore`,
`NanoAdblocker/NanoFilters`, `jspenguin2017/uBlockProtector`,
`jspenguin2017/Edgyfy`.

The private repository `Prototype` is required for publishing.

```
node . <action> [<target>] [--upstream] [--pack] [--publish] [--trace-fs]

<action>            One of:
    --chromium      Build for Chromium
    --firefox       Build for Firefox
    --edge          Build for Edge
    --maintenance   Run source maintenance scripts
    --clean         Delete all build files, implicitly disable <target>, "--pack", and "--publish"
<target>            One of:
    --both          (Default) Build both Nano Adblocker and Nano Defender
    --adblocker     Build Nano Adblocker
    --defender      Build Nano Defender
--pack              Create .zip packages
--publish           Publish build packages, implicitly apply "--pack"
--list-only         When building Nano Defender, only build the integration filter list
--trace-fs          Log file system access, excludes streams and other NPM packages
```
