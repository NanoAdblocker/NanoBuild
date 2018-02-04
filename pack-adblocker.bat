@ECHO OFF
NODE . --chromium --adblocker --pack
NODE . --firefox --adblocker --pack
NODE . --edge --adblocker --pack
PAUSE
