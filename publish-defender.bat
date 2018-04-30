@ECHO OFF

SET /P CONFIRM=Publish Nano Defender [Y/N]?
IF "%CONFIRM%" NEQ "Y" GOTO END

NODE . --chromium --defender --pack --publish
NODE . --edge --defender --pack --publish

:END
PAUSE
