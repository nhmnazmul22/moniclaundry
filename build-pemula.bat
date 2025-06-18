@echo off
echo ========================================
echo     BUILD MONIC LAUNDRY POS - PEMULA
echo ========================================
echo.

echo Pilih yang ingin di-build:
echo 1. Web Application
echo 2. Desktop Application (Electron)
echo 3. Android Application
echo 4. Semua (Web + Desktop + Android)
echo.
set /p choice="Masukkan pilihan (1-4): "

if "%choice%"=="1" goto build_web
if "%choice%"=="2" goto build_desktop
if "%choice%"=="3" goto build_android
if "%choice%"=="4" goto build_all
goto invalid

:build_web
echo.
echo 🌐 Building Web Application...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Build web gagal!
    pause
    exit /b 1
)
echo ✅ Web app berhasil di-build!
echo 📁 Hasil: folder 'out'
goto end

:build_desktop
echo.
echo 🖥️ Building Desktop Application...
npm run electron-build
if %errorlevel% neq 0 (
    echo ❌ Build desktop gagal!
    pause
    exit /b 1
)
echo ✅ Desktop app berhasil di-build!
echo 📁 Hasil: folder 'dist-electron'
goto end

:build_android
echo.
echo 📱 Building Android Application...
cd android
call gradlew assembleRelease
if %errorlevel% neq 0 (
    echo ❌ Build Android gagal!
    echo Pastikan Android Studio sudah terinstall
    pause
    exit /b 1
)
cd ..
echo ✅ Android app berhasil di-build!
echo 📁 Hasil: android/app/build/outputs/apk/
goto end

:build_all
echo.
echo 🚀 Building semua aplikasi...
call :build_web
call :build_desktop
call :build_android
echo.
echo 🎉 Semua aplikasi berhasil di-build!
goto end

:invalid
echo ❌ Pilihan tidak valid!
pause
exit /b 1

:end
echo.
echo Build selesai! 
echo Cek folder hasil build untuk file installer/APK
pause
