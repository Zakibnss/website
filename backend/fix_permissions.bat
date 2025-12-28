@echo off
echo Fixing permissions and creating directories...
echo.

REM Create necessary directories
mkdir data 2>nul
mkdir logs 2>nul
mkdir app 2>nul
mkdir app\controllers 2>nul

echo Created directories:
dir /b

echo.
echo Setting permissions...
icacls data /grant "Users:(OI)(CI)F" 2>nul
icacls logs /grant "Users:(OI)(CI)F" 2>nul

echo.
echo ✅ Permissions fixed!
echo.
pause