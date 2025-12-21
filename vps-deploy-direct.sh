#!/bin/bash
# Deploy directo al VPS
set -e

VPS_USER="root"
VPS_HOST="200.54.30.175"
VPS_PORT="22022"

echo "🍞 Deploy al VPS"
echo "================"

# Build
echo "📦 Building..."
rm -rf .next
npm run build

# Package
echo "📁 Packaging..."
mkdir -p deploy_temp
cp -r .next deploy_temp/
cp -r public deploy_temp/
cp -r src deploy_temp/
cp package*.json deploy_temp/
cp next.config.ts deploy_temp/
tar -czf deploy.tar.gz deploy_temp

# Upload
echo "📤 Uploading..."
scp -P $VPS_PORT deploy.tar.gz $VPS_USER@$VPS_HOST:/tmp/

# Deploy on VPS
echo "🚀 Deploying..."
ssh -p $VPS_PORT $VPS_USER@$VPS_HOST << 'ENDSSH'
    cd /tmp
    [ -f /var/www/panificadora-web/src/data/db.json ] && cp /var/www/panificadora-web/src/data/db.json /tmp/db_backup.json
    rm -rf deploy_temp
    tar -xzf deploy.tar.gz
    pm2 stop panificadora || true
    cp -r deploy_temp/.next /var/www/panificadora-web/
    cp -r deploy_temp/public /var/www/panificadora-web/
    cp -r deploy_temp/src /var/www/panificadora-web/
    cp deploy_temp/package*.json /var/www/panificadora-web/
    cp deploy_temp/next.config.ts /var/www/panificadora-web/
    [ -f /tmp/db_backup.json ] && cp /tmp/db_backup.json /var/www/panificadora-web/src/data/db.json
    cd /var/www/panificadora-web
    npm install --production
    pm2 restart panificadora || pm2 start npm --name "panificadora" -- start
    rm -rf /tmp/deploy_temp /tmp/deploy.tar.gz
    pm2 list
ENDSSH

# Cleanup
rm -rf deploy_temp deploy.tar.gz

echo "✅ Deploy completado!"
echo "Verifica: https://www.pansansebastian.cl"
