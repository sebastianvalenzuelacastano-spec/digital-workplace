#!/bin/bash
# finish-deploy.sh

# Exit on error
set -e

echo "🚀 Finishing Deployment Configuration..."

# 5. Configure Firewall for 8080
echo "🛡 Opening Port 8080..."
# Add port 8080 - using || true to avoid error if already added
firewall-cmd --permanent --add-port=8080/tcp || true
# Reload to apply
firewall-cmd --reload

# 6. Configure Nginx on 8080
echo "🌐 Configuring Nginx on 8080..."
# Remove default config if it conflicts (or just override)
cat > /etc/nginx/conf.d/panificadora.conf <<EOF
server {
    listen 8080;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Restart Nginx
systemctl restart nginx

# 7. Fix PM2 Startup (Safe approach)
echo "🔧 Fixing PM2 Startup..."
# Instead of piping blindly, we just ensure it's saved. The error before wasn't critical for 'now', just for reboot.
# We will try to run the startup command without piping to bash first to see what it says, but actually
# the best way is to just 'pm2 save' which we did. 
# To truly fix startup, we run the command that usually works for systemd:
pm2 startup systemd -u root --hp /root || echo "⚠️ Could not auto-configure startup, please run 'pm2 startup' manually and follow instructions if needed."
pm2 save

echo "✅ DEPLOYMENT FINISHED!"
echo "Access at: http://129.121.33.56:8080"
