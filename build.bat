@echo off
setlocal
title EduSpace APK Builder

cd /d "%~dp0eduspace-mobile"

if "%ANDROID_HOME%"=="" (
  echo [ERROR] ANDROID_HOME is not set.
  echo         Run: setx ANDROID_HOME "D:\Android\Sdk"
  echo         Then close and reopen this terminal and run build.bat again.
  pause
  exit /b 1
)

echo [1/4] Checking dependencies...
call npm install --legacy-peer-deps >nul 2>&1
if errorlevel 1 (
  echo [ERROR] npm install failed.
  pause
  exit /b 1
)

if not exist "android" (
  echo [2/4] Generating native android project (expo prebuild)...
  call npx expo prebuild --platform android --no-install
  if errorlevel 1 (
    echo [ERROR] expo prebuild failed.
    pause
    exit /b 1
  )
) else (
  echo [2/4] Android project already exists, skipping prebuild.
)

echo [3/4] Building release APK with Gradle...
pushd android
call gradlew.bat assembleRelease
set BUILD_STATUS=%errorlevel%
popd

if not "%BUILD_STATUS%"=="0" (
  echo [ERROR] Gradle build failed with code %BUILD_STATUS%.
  pause
  exit /b %BUILD_STATUS%
)

set "APK=android\app\build\outputs\apk\release\app-release.apk"
echo [4/4] Done!
if exist "%APK%" (
  echo.
  echo APK ready at:
  echo   D:\EduSpace\Code-files\eduspace-mobile\%APK%
  echo.
  echo Copy it to your phone, then allow "Install unknown apps" to install it.
) else (
  echo [WARN] Build finished but APK not found at %APK%.
)

echo.
pause
