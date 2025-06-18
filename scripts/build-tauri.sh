#!/bin/bash

echo "🚀 Building Monic Laundry POS with Tauri..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build Next.js app
echo "🔨 Building Next.js application..."
npm run build

# Build Tauri app
echo "🦀 Building Tauri application..."
npm run tauri build

echo "✅ Build completed! Check src-tauri/target/release/bundle/ for the executable."
