#!/bin/bash

# Script para configurar Nginx para APK Store
set -e

echo "🌐 Configurando Nginx para APK Store..."

# Verificar que somos root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Este script debe ejecutarse como root"
    echo "Ejecuta: sudo ./configure-nginx.sh"
    exit 1
fi

# Variables
DOMAIN="store.jhservices.com.ar"
FRONTEND_PATH="/var/www/apkstore/frontend/dist"
BACKEND_PORT="3002"

echo "📝 Configurando Nginx para dominio: $DOMAIN"

# Crear configuración de Nginx
cat > /etc/nginx/sites-available/apkstore << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Logs
    access_log /var/log/nginx/apkstore_access.log;
    error_log /var/log/nginx/apkstore_error.log;

    # Frontend (React app)
    location / {
        root $FRONTEND_PATH;
        try_files \$uri \$uri/ /index.html;
        
        # Cache headers for static files
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }

    # Uploads directory
    location /uploads/ {
        root /var/www/apkstore;
        expires 1y;
        add_header Cache-Control "public, immutable";
        
        # Security headers
        add_header X-Content-Type-Options nosniff;
        add_header X-Frame-Options DENY;
        add_header X-XSS-Protection "1; mode=block";
    }

    # Health check
    location /health {
        proxy_pass http://localhost:$BACKEND_PORT/api/health;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
}
EOF

echo "🔗 Activando sitio..."

# Crear enlace simbólico
ln -sf /etc/nginx/sites-available/apkstore /etc/nginx/sites-enabled/

# Remover sitio por defecto si existe
rm -f /etc/nginx/sites-enabled/default

echo "🔍 Verificando configuración..."

# Verificar configuración de Nginx
if nginx -t; then
    echo "✅ Configuración de Nginx válida"
else
    echo "❌ Error en configuración de Nginx"
    exit 1
fi

echo "🔄 Reiniciando Nginx..."
systemctl restart nginx

# Verificar que Nginx esté corriendo
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx corriendo correctamente"
else
    echo "❌ Error: Nginx no está corriendo"
    systemctl status nginx
    exit 1
fi

echo "🔍 Verificando frontend..."

# Verificar que el directorio del frontend existe
if [ -d "$FRONTEND_PATH" ] && [ -f "$FRONTEND_PATH/index.html" ]; then
    echo "✅ Frontend encontrado en $FRONTEND_PATH"
else
    echo "⚠️ Frontend no encontrado. Verificando build..."
    
    # Intentar construir el frontend si no existe
    if [ -d "/var/www/apkstore/frontend" ]; then
        echo "🏗️ Construyendo frontend..."
        cd /var/www/apkstore
        sudo -u apkstore bash -c "cd frontend && npm run build"
        
        if [ -f "$FRONTEND_PATH/index.html" ]; then
            echo "✅ Frontend construido exitosamente"
        else
            echo "❌ Error construyendo frontend"
            exit 1
        fi
    else
        echo "❌ Directorio frontend no encontrado"
        exit 1
    fi
fi

echo ""
echo "🎉 ¡Nginx configurado exitosamente!"
echo ""
echo "🌐 URLs disponibles:"
echo "   Frontend: http://$DOMAIN"
echo "   API: http://$DOMAIN/api/health"
echo "   Backend directo: http://localhost:$BACKEND_PORT/api/health"
echo ""
echo "📋 Próximos pasos:"
echo "1. Configurar DNS para que $DOMAIN apunte a este servidor"
echo "2. Configurar SSL: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo ""
echo "🔧 Comandos útiles:"
echo "   nginx -t                    # Verificar configuración"
echo "   systemctl restart nginx     # Reiniciar Nginx"
echo "   systemctl status nginx      # Estado de Nginx"
echo "   tail -f /var/log/nginx/apkstore_error.log  # Ver errores"
echo ""

# Verificar conectividad
echo "🔍 Verificando conectividad..."
sleep 2

if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Backend accesible a través de Nginx"
else
    echo "⚠️ Backend no accesible - revisar logs:"
    echo "   sudo -u apkstore pm2 logs"
    echo "   tail /var/log/nginx/apkstore_error.log"
fi
