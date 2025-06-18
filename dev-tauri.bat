@echo off
echo 🚀 Starting Monic Laundry POS in development mode...

if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

echo 🔨 Starting Tauri development server...
npm run tauri:dev
