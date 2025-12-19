#!/bin/bash
# package.sh

# Exit on error
set -e

echo "📦 Packaging for deployment..."

# Clean previous build
rm -rf dist deploy.zip
mkdir -p dist

# Copy standalone build (use . to include hidden .next folder)
cp -R .next/standalone/. dist/

# Copy static assets (required for standalone)
mkdir -p dist/.next/static
cp -r .next/static/* dist/.next/static/

# Copy public folder
cp -r public dist/public

# Zip it
echo "🤐 Zipping..."
cd dist
zip -r ../deploy.zip .
cd ..

echo "✅ Ready to deploy: deploy.zip"
