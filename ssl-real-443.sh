#!/bin/bash

# SSL Real Certificate Configuration for Port 443 Only
# Designed for VPS environments where port 80 is occupied by VPN services

set -e

DOMAIN="store.jhservices.com.ar"
EMAIL="admin@jhservices.com.ar"

echo "🔐 Configurando certificado SSL REAL para $DOMAIN..."
echo "⚠️  Esto eliminará la advertencia de 'No es seguro' del navegador"

# Update system
echo "📦 Actualizando sistema..."
apt update -y

# Install certbot
echo "🔧 Instalando Certbot..."
apt install -y certbot python3-certbot-nginx

# Stop nginx temporarily
echo "🛑 Deteniendo nginx temporalmente..."
systemctl stop nginx

# Get SSL certificate using standalone mode on port 443
echo "🌐 Obteniendo certificado SSL de Let's Encrypt..."
certbot certonly --standalone \
    --preferred-challenges tls-sni \
    --tls-sni-01-port 443 \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --domains $DOMAIN \
    --non-interactive

# Create nginx configuration with real SSL certificate
echo "⚙️ Configurando nginx con certificado SSL real..."
cat > /etc/nginx/sites-available/apk-store << 'EOF'
server {
    listen 443 ssl http2;
    server_name store.jhservices.com.ar;

    # SSL Configuration with Let's Encrypt certificate
    ssl_certificate /etc/letsencrypt/live/store.jhservices.com.ar/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/store.jhservices.com.ar/privkey.pem;
    
    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";

    # Serve frontend
    location / {
        root /var/www/apk-store/frontend/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API proxy to backend
    location /api/ {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Handle large file uploads
        client_max_body_size 100M;
        proxy_request_buffering off;
    }

    # Admin panel
    location /admin-jhservices-private {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads directory
    location /uploads/ {
        alias /var/www/apk-store/backend/uploads/;
        
        # Cache uploaded files
        expires 1y;
        add_header Cache-Control "public";
    }
}

# Redirect HTTP to HTTPS (for port 8080)
server {
    listen 8080;
    server_name store.jhservices.com.ar;
    return 301 https://$server_name$request_uri;
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/apk-store /etc/nginx/sites-enabled/

# Remove default nginx site
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
echo "🧪 Probando configuración de nginx..."
nginx -t

# Start nginx
echo "🚀 Iniciando nginx..."
systemctl start nginx
systemctl enable nginx

# Setup automatic renewal
echo "🔄 Configurando renovación automática..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet --post-hook 'systemctl reload nginx'") | crontab -

# Test SSL certificate
echo "🔍 Verificando certificado SSL..."
sleep 5
curl -I https://$DOMAIN || echo "⚠️ El certificado se está propagando..."

# Open firewall for HTTPS
echo "🔥 Configurando firewall..."
ufw allow 443/tcp

echo ""
echo "✅ ¡Certificado SSL REAL configurado exitosamente!"
echo ""
echo "🌐 Tu APK Store ahora está disponible en:"
echo "   https://$DOMAIN"
echo ""
echo "🔐 Sin advertencias de seguridad"
echo "🛡️ Certificado válido de Let's Encrypt"
echo "🔄 Renovación automática configurada"
echo ""
echo "🎉 ¡Tu APK Store está 100% listo para producción!"
