@ECHO OFF

NODE . --chromium --adblocker --pack
REM NODE . --firefox --adblocker --pack
NODE . --edge --adblocker --pack

PAUSE
