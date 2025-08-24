#!/bin/bash

# 🚨 APK Store - Corrección SSL FORZADA
# ====================================

echo "🚨 Corrección SSL FORZADA para APK Store..."
echo "==========================================="
echo ""

# Verificar que se ejecuta como root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Ejecuta como root: sudo bash force-ssl-fix.sh"
    exit 1
fi

DOMAIN="store.jhservices.com.ar"

echo "📋 Paso 1: Detener Nginx completamente..."
systemctl stop nginx
sleep 2

echo "📋 Paso 2: Limpiar configuraciones..."
# Eliminar TODAS las configuraciones
rm -f /etc/nginx/sites-enabled/*
rm -f /etc/nginx/sites-available/temp-ssl
rm -f /etc/nginx/sites-available/default

echo "📋 Paso 3: Crear certificado SSL..."
mkdir -p /etc/ssl/apkstore
openssl genrsa -out /etc/ssl/apkstore/private.key 2048
openssl req -new -x509 -key /etc/ssl/apkstore/private.key -out /etc/ssl/apkstore/certificate.crt -days 365 -subj "/C=AR/ST=Buenos Aires/L=Buenos Aires/O=JH Services/OU=APK Store/CN=store.jhservices.com.ar/emailAddress=admin@jhservices.com.ar"

echo "📋 Paso 4: Crear configuración SSL completa..."
cat > /etc/nginx/sites-available/$DOMAIN << 'FORCE_SSL_EOF'
# APK Store - Configuración SSL Completa
server {
    listen 80;
    listen [::]:80;
    server_name store.jhservices.com.ar;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name store.jhservices.com.ar;

    ssl_certificate /etc/ssl/apkstore/certificate.crt;
    ssl_certificate_key /etc/ssl/apkstore/private.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;

    client_max_body_size 100M;
    root /var/www/apkstore/frontend/dist;
    index index.html;

    access_log /var/log/nginx/store.access.log;
    error_log /var/log/nginx/store.error.log;

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    location /uploads/ {
        alias /var/www/apkstore/uploads/;
        expires 30d;
        add_header Cache-Control "public";
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /admin-jhservices-private {
        try_files $uri $uri/ /index.html;
        add_header X-Robots-Tag "noindex, nofollow";
    }

    location / {
        try_files $uri $uri/ /index.html;
        expires 1h;
    }

    location ~ /\. {
        deny all;
    }
}
FORCE_SSL_EOF

echo "📋 Paso 5: Habilitar configuración..."
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/

echo "📋 Paso 6: Verificar configuración..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Configuración válida"
    
    echo "📋 Paso 7: Iniciar Nginx..."
    systemctl start nginx
    systemctl enable nginx
    
    sleep 3
    
    echo "📋 Paso 8: Verificar puertos..."
    echo "Puertos activos:"
    ss -tlnp | grep nginx || echo "❌ Nginx no está escuchando"
    
    echo ""
    echo "Estado de Nginx:"
    systemctl status nginx --no-pager -l
    
    echo ""
    echo "🔍 Test de conectividad:"
    echo "Puerto 80: $(curl -s -o /dev/null -w '%{http_code}' http://localhost 2>/dev/null || echo 'Error')"
    echo "Puerto 443: $(curl -s -o /dev/null -w '%{http_code}' https://localhost -k 2>/dev/null || echo 'Error')"
    
    echo ""
    if ss -tlnp | grep -q ":80\|:443"; then
        echo "🎉 ¡SSL configurado correctamente!"
        echo ""
        echo "📋 URLs finales:"
        echo "   🏠 Frontend: https://store.jhservices.com.ar"
        echo "   🔒 Admin: https://store.jhservices.com.ar/admin-jhservices-private"
        echo "   📊 API: https://store.jhservices.com.ar/api/health"
        echo ""
        echo "⚠️  El navegador mostrará 'No seguro' - haz clic en 'Avanzado' → 'Continuar'"
        echo "🔐 Contraseña admin: jhservices2025!"
    else
        echo "❌ Nginx no está escuchando en puerto 80/443"
        echo "📋 Logs de error:"
        tail -10 /var/log/nginx/error.log 2>/dev/null || echo "No hay logs de error"
    fi
    
else
    echo "❌ Error en configuración de Nginx"
    nginx -t
    
    echo "🔄 Restaurando puerto 8080..."
    curl -sSL https://raw.githubusercontent.com/JJSecureVPN/StoreAPK/main/fix-nginx.sh | bash
fi

echo ""
echo "📋 Estado final:"
echo "Nginx: $(systemctl is-active nginx)"
echo "PM2: $(sudo -u apkstore pm2 list | grep -c 'online' || echo '0') procesos activos"
