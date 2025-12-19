#!/bin/bash
# vps-setup-rpm.sh

# Exit on error
set -e

echo "🚀 Starting VPS Setup (AlmaLinux 9)..."

# Update system
echo "📦 Updating system packages..."
dnf update -y

# Install Tools
echo "🛠 Installing basics..."
dnf install -y curl git unzip tar make gcc-c++ nginx policycoreutils-python-utils

# Enable Nginx
echo "🌐 Enabling Nginx..."
systemctl enable --now nginx

# Install Node.js 20
echo "🟢 Installing Node.js 20..."
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
dnf install -y nodejs

# Install PM2
echo "⚙️ Installing PM2..."
npm install -g pm2

# Configure Firewall (firewalld)
echo "🛡 Configuring Firewall..."
# Ensure firewalld is running
systemctl enable --now firewalld

# Allow SSH custom port 22022 provided by HostGator
firewall-cmd --permanent --add-port=22022/tcp
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload

# SELinux Configuration for Nginx Proxy
echo "🔐 Configuring SELinux..."
# Allow Nginx to connect to upstream (Node.js)
setsebool -P httpd_can_network_connect 1

echo "✅ VPS Setup Complete!"
node -v
npm -v
nginx -v
