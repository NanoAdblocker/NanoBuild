@ECHO OFF

NODE . --chromium --defender --pack
NODE . --edge --defender --pack

NODE . --firefox --defender --pack

PAUSE
