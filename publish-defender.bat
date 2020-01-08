@ECHO OFF

SET /P CONFIRM=Publish Nano Defender [Y/N]?
IF "%CONFIRM%" NEQ "Y" GOTO END

NODE . --chromium --defender --pack --publish

REM Pro version cannot be published
NODE . --chromium --defender --pro --pack

REM NODE . --edge --defender --pro --pack --publish

:END
PAUSE
