#!/bin/bash

echo "🚀 Starting Monic Laundry POS in development mode..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start Tauri in development mode
echo "🔨 Starting Tauri development server..."
npm run tauri:dev
