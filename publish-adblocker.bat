@ECHO OFF

SET /P CONFIRM=Publish Nano Adblocker [Y/N]?
IF "%CONFIRM%" NEQ "Y" GOTO END

NODE . --chromium --adblocker --pack --publish
NODE . --edge --adblocker --pack --publish

:END
PAUSE
