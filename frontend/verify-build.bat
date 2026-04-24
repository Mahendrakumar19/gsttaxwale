@echo off
REM Tax Platform Next.js Build Verification Script (Windows)

echo.
echo =================================
echo Tax Platform Build Verification
echo =================================
echo.

echo Step 1: Checking Node.js and npm...
node --version
npm --version
echo.

echo Step 2: Installing dependencies if needed...
if not exist "node_modules" (
    echo Installing npm packages...
    call npm install
)
echo.

echo Step 3: Running build with output capture...
call npm run build > build-output.txt 2>&1
set BUILD_STATUS=%ERRORLEVEL%
echo.

echo Step 4: Checking for errors...
findstr /I "useContext" build-output.txt >nul
if not errorlevel 1 (
    echo ❌ ERROR: useContext errors found in build!
    exit /b 1
)

findstr /I "is not available in Server Components" build-output.txt >nul
if not errorlevel 1 (
    echo ❌ ERROR: Server Component errors found!
    exit /b 1
)

echo.
if %BUILD_STATUS% equ 0 (
    echo ✅ BUILD SUCCESSFUL!
    echo.
    echo Verification Summary:
    echo - No useContext errors
    echo - No Server Component errors  
    echo - All pages compiled successfully
    echo.
    echo Ready for production deployment!
) else (
    echo ❌ BUILD FAILED - Check build-output.txt
    type build-output.txt
    exit /b %BUILD_STATUS%
)
