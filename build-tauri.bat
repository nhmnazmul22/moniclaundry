@echo off
echo 🚀 Building Monic Laundry POS with Tauri...

echo 📦 Installing dependencies...
npm install

echo 🔨 Building Next.js application...
npm run build

echo 🦀 Building Tauri application...
npm run tauri build

echo ✅ Build completed! Check src-tauri/target/release/bundle/ for the executable.
pause
