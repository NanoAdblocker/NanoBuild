@ECHO OFF

SET /P CONFIRM=Publish Nano Adblocker [Y/N]?
IF "%CONFIRM%" NEQ "Y" GOTO END

NODE . --chromium --adblocker --pack --publish
NODE . --firefox --adblocker --pack --publish
REM NODE . --edge --adblocker --pack --publish

:END
PAUSE
