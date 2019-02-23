@ECHO OFF

SET /P CONFIRM=Publish Nano Defender [Y/N]?
IF "%CONFIRM%" NEQ "Y" GOTO END

NODE . --chromium --defender --pack --publish

REM NODE . --edge --defender --pack --publish
NODE . --edge --defender --pack
ECHO Publishing for Edge is disabled

:END
PAUSE
