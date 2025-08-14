#!/bin/bash

# 🔐 APK Store - SSL Solo Puerto 443 (sin puerto 80)
# ==================================================

echo "🔐 Configurando SSL solo en puerto 443 (sin puerto 80)..."
echo "======================================================="
echo ""

# Verificar que se ejecuta como root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Ejecuta como root: sudo bash ssl-port-443-only.sh"
    exit 1
fi

DOMAIN="store.jhservices.com.ar"

echo "📋 Paso 1: Detener Nginx..."
systemctl stop nginx
sleep 2

echo "📋 Paso 2: Limpiar configuraciones..."
rm -f /etc/nginx/sites-enabled/*
rm -f /etc/nginx/sites-available/temp-ssl

echo "📋 Paso 3: Crear certificado SSL..."
mkdir -p /etc/ssl/apkstore
openssl genrsa -out /etc/ssl/apkstore/private.key 2048
openssl req -new -x509 -key /etc/ssl/apkstore/private.key -out /etc/ssl/apkstore/certificate.crt -days 365 -subj "/C=AR/ST=Buenos Aires/L=Buenos Aires/O=JH Services/OU=APK Store/CN=store.jhservices.com.ar/emailAddress=admin@jhservices.com.ar"

echo "📋 Paso 4: Crear configuración SOLO puerto 443..."
cat > /etc/nginx/sites-available/$DOMAIN << 'SSL_443_EOF'
# APK Store - Solo HTTPS puerto 443 (puerto 80 ocupado por VPN)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name store.jhservices.com.ar;

    # Certificados SSL autofirmados
    ssl_certificate /etc/ssl/apkstore/certificate.crt;
    ssl_certificate_key /etc/ssl/apkstore/private.key;
    
    # Configuración SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Configuración de cliente
    client_max_body_size 100M;
    client_body_timeout 60s;
    client_header_timeout 60s;

    # Directorio raíz
    root /var/www/apkstore/frontend/dist;
    index index.html;

    # Logs
    access_log /var/log/nginx/store.access.log;
    error_log /var/log/nginx/store.error.log;

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

    # Cache para archivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # Uploads
    location /uploads/ {
        alias /var/www/apkstore/uploads/;
        expires 30d;
        add_header Cache-Control "public";
        
        location ~* \.apk$ {
            add_header Content-Type application/vnd.android.package-archive;
            add_header Content-Disposition 'attachment';
        }
        
        location ~* \.(png|jpg|jpeg|gif|webp)$ {
            add_header Cache-Control "public, max-age=2592000";
        }
    }

    # API del backend - proxy reverso
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
        proxy_read_timeout 86400;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        
        proxy_request_buffering off;
        proxy_buffering off;
    }

    # Panel de administración
    location /admin-jhservices-private {
        try_files $uri $uri/ /index.html;
        add_header X-Robots-Tag "noindex, nofollow, nosnippet, noarchive";
    }

    # Frontend React Router - SPA
    location / {
        try_files $uri $uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public, must-revalidate";
        
        location = /index.html {
            expires 5m;
            add_header Cache-Control "public, must-revalidate";
        }
    }

    # Bloquear acceso a archivos sensibles
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    location ~ /(package\.json|\.env|\.git|node_modules) {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Páginas de error
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /var/www/apkstore/frontend/dist;
    }
}

# Mantener puerto 8080 como respaldo/alternativo
server {
    listen 8080;
    listen [::]:8080;
    server_name store.jhservices.com.ar;
    
    # Redirigir a HTTPS 443
    return 301 https://$server_name$request_uri;
}
SSL_443_EOF

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
    ss -tlnp | grep nginx
    
    echo ""
    echo "Estado de Nginx:"
    systemctl status nginx --no-pager -l | head -15
    
    echo ""
    echo "🔍 Test de conectividad:"
    echo "Puerto 443: $(curl -s -o /dev/null -w '%{http_code}' https://localhost -k 2>/dev/null || echo 'Error')"
    echo "Puerto 8080: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:8080 2>/dev/null || echo 'Error')"
    
    echo ""
    if ss -tlnp | grep -q ":443"; then
        echo "🎉 ¡SSL configurado correctamente en puerto 443!"
        echo ""
        echo "📋 URLs finales:"
        echo "   🏠 Frontend: https://store.jhservices.com.ar"
        echo "   🔒 Admin: https://store.jhservices.com.ar/admin-jhservices-private"
        echo "   📊 API: https://store.jhservices.com.ar/api/health"
        echo ""
        echo "📋 URLs alternativas (redirigen a HTTPS):"
        echo "   🔄 Puerto 8080: http://store.jhservices.com.ar:8080"
        echo ""
        echo "⚠️  IMPORTANTE:"
        echo "   - El navegador mostrará 'No seguro' (normal con SSL autofirmado)"
        echo "   - Haz clic en 'Avanzado' → 'Continuar al sitio'"
        echo "   - Puerto 80 NO se usa (ocupado por VPN)"
        echo ""
        echo "🔐 Contraseña admin: jhservices2025!"
        echo ""
        echo "🚀 ¡Tu APK Store está listo en HTTPS!"
        
    else
        echo "❌ Error: Nginx no está escuchando en puerto 443"
        echo "📋 Logs de error:"
        tail -10 /var/log/nginx/error.log 2>/dev/null || echo "No hay logs"
    fi
    
else
    echo "❌ Error en configuración de Nginx"
    nginx -t
    
    echo "🔄 Restaurando configuración puerto 8080..."
    curl -sSL https://raw.githubusercontent.com/JJSecureVPN/StoreAPK/main/fix-nginx.sh | bash
fi

echo ""
echo "📋 Estado final:"
echo "Nginx: $(systemctl is-active nginx)"
echo "PM2: $(sudo -u apkstore pm2 list 2>/dev/null | grep -c 'online' || echo '0') procesos activos"
echo ""
echo "💡 Nota: Puerto 80 no se usa porque está ocupado por el VPN"
