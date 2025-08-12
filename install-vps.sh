#!/bin/bash

# Script de instalación automática para VPS Ubuntu/Debian
# Ejecutar como root en el VPS

set -e  # Salir si hay errores

echo "🚀 Instalando APK Store en VPS..."
echo "🌐 Dominio: store.jhservices.com.ar"
echo ""

# Verificar que se ejecuta como root
if [ "$EUID" -ne 0 ]; then
  echo "❌ Este script debe ejecutarse como root"
  echo "Usa: sudo bash install-vps.sh"
  exit 1
fi

# Actualizar sistema
echo "📦 Actualizando sistema..."
apt update && apt upgrade -y

# Instalar Node.js 18+
echo "📦 Instalando Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Verificar versión de Node.js
NODE_VERSION=$(node --version)
echo "✅ Node.js instalado: $NODE_VERSION"

# Instalar PM2
echo "📦 Instalando PM2..."
npm install -g pm2

# Instalar Nginx
echo "📦 Instalando Nginx..."
apt install nginx -y

# Instalar Certbot para SSL
echo "📦 Instalando Certbot..."
apt install certbot python3-certbot-nginx -y

# Crear usuario para la aplicación
echo "👤 Creando usuario apkstore..."
if ! id "apkstore" &>/dev/null; then
    adduser --system --group --home /var/www/apkstore apkstore
fi

# Crear directorio de la aplicación
echo "📁 Creando directorios..."
mkdir -p /var/www/apkstore
chown apkstore:apkstore /var/www/apkstore

# Crear directorio de logs
mkdir -p /var/log/apkstore
chown apkstore:apkstore /var/log/apkstore

# Configurar Nginx
echo "🌐 Configurando Nginx..."
cat > /etc/nginx/sites-available/store.jhservices.com.ar << 'EOF'
server {
    listen 80;
    server_name store.jhservices.com.ar;

    # Temporalmente servir desde HTTP hasta configurar SSL
    root /var/www/apkstore/frontend/dist;
    index index.html;

    # Archivos de uploads (APKs)
    location /uploads/ {
        alias /var/www/apkstore/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # API del backend
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
        proxy_read_timeout 86400;
    }

    # Frontend - React Router (SPA)
    location / {
        try_files $uri $uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public";
    }

    # Configuración de logs
    access_log /var/log/nginx/store.jhservices.com.ar.access.log;
    error_log /var/log/nginx/store.jhservices.com.ar.error.log;
}
EOF

# Habilitar el sitio
ln -sf /etc/nginx/sites-available/store.jhservices.com.ar /etc/nginx/sites-enabled/

# Deshabilitar sitio por defecto
rm -f /etc/nginx/sites-enabled/default

# Verificar configuración de Nginx
nginx -t

# Configurar firewall
echo "🔥 Configurando firewall..."
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw --force enable

echo ""
echo "✅ VPS configurado correctamente!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Subir archivo 'apkstore-deploy.tar.gz' a /var/www/apkstore/"
echo "2. Ejecutar el script de despliegue de la aplicación"
echo ""
echo "📞 Comandos para continuar:"
echo "   cd /var/www/apkstore"
echo "   wget https://tu-servidor/apkstore-deploy.tar.gz"
echo "   bash deploy-app.sh"
echo ""
