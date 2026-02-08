#!/bin/bash

echo "🚀 Building for Vercel deployment..."

# Ensure we're in the frontend directory
cd "$(dirname "$0")"

# Install dependencies with legacy peer deps to resolve conflicts
npm install --legacy-peer-deps

# Build the application
npm run build

echo "✅ Build completed successfully!"