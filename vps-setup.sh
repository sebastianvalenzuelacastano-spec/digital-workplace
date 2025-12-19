#!/bin/bash
# vps-setup.sh

# Exit on error
set -e

echo "🚀 Starting VPS Setup..."

# Update system
echo "📦 Updating system packages..."
sudo apt-get update && sudo apt-get upgrade -y

# Install Tools
echo "🛠 Installing basics..."
sudo apt-get install -y curl git unzip build-essential nginx

# Install Node.js (Version 20 LTS)
echo "🟢 Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
echo "⚙️ Installing PM2..."
sudo npm install -g pm2

# Setup Firewall (UFW)
echo "🛡 Configuring Firewall..."
# IMPORTANT: Allow custom SSH port 22022 provided by HostGator
sudo ufw allow 22022/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 'Nginx Full'

# Enable UFW
echo "⚠️  Enabling Firewall..."
# Non-interactive enable
sudo ufw --force enable

echo "✅ VPS Setup Complete!"
node -v
npm -v
nginx -v
