#!/bin/bash

# 🔐 APK Store - SSL Autofirmado (Opción Rápida)
# ==============================================

echo "🔐 Configurando SSL autofirmado para APK Store..."
echo "================================================"
echo ""

# Verificar que se ejecuta como root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Ejecuta como root: sudo bash self-signed-ssl.sh"
    exit 1
fi

DOMAIN="store.jhservices.com.ar"
SSL_DIR="/etc/ssl/apkstore"

echo "📋 Creando certificado SSL autofirmado..."

# Crear directorio para certificados
mkdir -p $SSL_DIR

# Generar clave privada
openssl genrsa -out $SSL_DIR/private.key 2048

# Generar certificado autofirmado
openssl req -new -x509 -key $SSL_DIR/private.key -out $SSL_DIR/certificate.crt -days 365 -subj "/C=AR/ST=Buenos Aires/L=Buenos Aires/O=JH Services/OU=APK Store/CN=store.jhservices.com.ar/emailAddress=admin@jhservices.com.ar"

# Configuración SSL con certificado autofirmado
cat > /etc/nginx/sites-available/$DOMAIN << 'SSL_SELF_EOF'
# Redirigir HTTP a HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name store.jhservices.com.ar;
    return 301 https://$server_name$request_uri;
}

# Configuración principal HTTPS con SSL autofirmado
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

# Redirigir puerto 8080 a HTTPS
server {
    listen 8080;
    listen [::]:8080;
    server_name store.jhservices.com.ar;
    return 301 https://$server_name$request_uri;
}
SSL_SELF_EOF

# Habilitar configuración SSL
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/

# Remover configuraciones anteriores
rm -f /etc/nginx/sites-enabled/temp-ssl 2>/dev/null
rm -f /etc/nginx/sites-available/temp-ssl 2>/dev/null

# Verificar configuración
nginx -t

if [ $? -eq 0 ]; then
    systemctl reload nginx
    
    echo "✅ Nginx configurado con SSL autofirmado"
    echo ""
    echo "🎉 ¡SSL autofirmado configurado exitosamente!"
    echo ""
    echo "📋 URLs finales:"
    echo "   🏠 Frontend: https://store.jhservices.com.ar"
    echo "   🔒 Admin: https://store.jhservices.com.ar/admin-jhservices-private"
    echo "   📊 API: https://store.jhservices.com.ar/api/health"
    echo ""
    echo "🔐 Contraseña admin: jhservices2025!"
    echo ""
    echo "⚠️  NOTA IMPORTANTE:"
    echo "   - El navegador mostrará 'Conexión no segura'"
    echo "   - Haz clic en 'Avanzado' → 'Acceder al sitio'"
    echo "   - Es normal con certificados autofirmados"
    echo ""
    echo "🔄 Para certificado real de Let's Encrypt:"
    echo "   curl -sSL https://raw.githubusercontent.com/JJSecureVPN/StoreAPK/main/ssl-alternative.sh | bash"
    echo ""
    echo "🚀 ¡Tu APK Store está listo con SSL!"
    
else
    echo "❌ Error en configuración de Nginx"
    nginx -t
fi
