#!/bin/bash

echo "🚀 Building Monic Laundry POS for all platforms..."

# Build web application
echo "📦 Building web application..."
npm run build

# Build Electron desktop app
echo "🖥️ Building Electron desktop app..."
npm run electron-build

# Build Android app
echo "📱 Building Android app..."
cd android
./gradlew assembleRelease
cd ..

echo "✅ All builds completed!"
echo ""
echo "📁 Build outputs:"
echo "   - Web: ./out/"
echo "   - Desktop: ./dist-electron/"
echo "   - Android: ./android/app/build/outputs/apk/release/"
