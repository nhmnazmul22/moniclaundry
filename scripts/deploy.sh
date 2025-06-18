#!/bin/bash

echo "🚀 Deploying Monic Laundry POS..."

# Deploy web app to Vercel
echo "🌐 Deploying web app to Vercel..."
vercel --prod

# Upload Android APK to release
echo "📱 Preparing Android APK..."
cp android/app/build/outputs/apk/release/app-release.apk ./releases/monic-laundry-android-v1.0.0.apk

# Upload Electron builds
echo "🖥️ Preparing desktop builds..."
cp dist-electron/*.exe ./releases/ 2>/dev/null || true
cp dist-electron/*.dmg ./releases/ 2>/dev/null || true
cp dist-electron/*.AppImage ./releases/ 2>/dev/null || true

echo "✅ Deployment completed!"
echo ""
echo "🔗 Access your applications:"
echo "   - Web: https://your-app.vercel.app"
echo "   - Desktop: Check ./releases/ folder"
echo "   - Android: Install APK from ./releases/ folder"
