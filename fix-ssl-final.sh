#!/bin/bash

# 🔧 APK Store - Corrección SSL Definitiva
# ========================================

echo "🔧 Corrigiendo configuración SSL..."
echo "=================================="
echo ""

# Verificar que se ejecuta como root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Ejecuta como root: sudo bash fix-ssl-final.sh"
    exit 1
fi

DOMAIN="store.jhservices.com.ar"

echo "📋 Paso 1: Verificando configuración actual..."

# Ver puertos activos
echo "Puertos Nginx actuales:"
ss -tlnp | grep nginx

echo ""
echo "Sitios habilitados:"
ls -la /etc/nginx/sites-enabled/

echo ""
echo "📋 Paso 2: Recreando configuración SSL completa..."

# Crear directorio SSL si no existe
mkdir -p /etc/ssl/apkstore

# Regenerar certificado autofirmado
openssl genrsa -out /etc/ssl/apkstore/private.key 2048
openssl req -new -x509 -key /etc/ssl/apkstore/private.key -out /etc/ssl/apkstore/certificate.crt -days 365 -subj "/C=AR/ST=Buenos Aires/L=Buenos Aires/O=JH Services/OU=APK Store/CN=store.jhservices.com.ar/emailAddress=admin@jhservices.com.ar"

# Crear configuración completa y correcta
cat > /etc/nginx/sites-available/$DOMAIN << 'SSL_FINAL_EOF'
# Redirigir HTTP (puerto 80) a HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name store.jhservices.com.ar;
    return 301 https://$server_name$request_uri;
}

# Configuración principal HTTPS (puerto 443)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name store.jhservices.com.ar;

    # Certificados SSL autofirmados
    ssl_certificate /etc/ssl/apkstore/certificate.crt;
    ssl_certificate_key /etc/ssl/apkstore/private.key;
    
    # Configuración SSL básica
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Configuración de seguridad
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # Configuración de cliente
    client_max_body_size 100M;
    client_body_timeout 60s;
    client_header_timeout 60s;

    # Directorio raíz
    root /var/www/apkstore/frontend/dist;
    index index.html;

    # Logs
    access_log /var/log/nginx/store.jhservices.com.ar.access.log;
    error_log /var/log/nginx/store.jhservices.com.ar.error.log;

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
SSL_FINAL_EOF

echo "📋 Paso 3: Aplicando configuración..."

# Eliminar todas las configuraciones temporales
rm -f /etc/nginx/sites-enabled/* 2>/dev/null
rm -f /etc/nginx/sites-available/temp-ssl 2>/dev/null

# Habilitar SOLO la configuración SSL
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/

# Verificar configuración
echo "🔍 Verificando configuración..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Configuración válida, aplicando..."
    
    # Recargar nginx
    systemctl reload nginx
    
    # Verificar puertos después
    echo ""
    echo "📋 Puertos después de la configuración:"
    ss -tlnp | grep nginx
    
    echo ""
    echo "🎉 ¡SSL configurado correctamente!"
    echo ""
    echo "📋 URLs finales:"
    echo "   🏠 Frontend: https://store.jhservices.com.ar"
    echo "   🔒 Admin: https://store.jhservices.com.ar/admin-jhservices-private"
    echo "   📊 API: https://store.jhservices.com.ar/api/health"
    echo ""
    echo "⚠️  IMPORTANTE:"
    echo "   - El navegador mostrará 'No seguro' (normal con SSL autofirmado)"
    echo "   - Haz clic en 'Avanzado' → 'Continuar al sitio'"
    echo ""
    echo "🔐 Contraseña admin: jhservices2025!"
    echo ""
    echo "🚀 ¡Tu APK Store está listo!"
    
else
    echo "❌ Error en configuración de Nginx"
    nginx -t
    
    # Restaurar configuración de respaldo (puerto 8080)
    echo "🔄 Restaurando configuración de respaldo..."
    curl -sSL https://raw.githubusercontent.com/JJSecureVPN/StoreAPK/main/fix-nginx.sh | bash
fi
