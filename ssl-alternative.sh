#!/bin/bash

# 🔐 APK Store - SSL Alternativo (sin puerto 80)
# ==============================================

echo "🔐 Configurando SSL sin usar puerto 80..."
echo "========================================="
echo ""

# Verificar que se ejecuta como root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Ejecuta como root: sudo bash ssl-alternative.sh"
    exit 1
fi

DOMAIN="store.jhservices.com.ar"

echo "🔍 Método 1: Intentando con standalone en puerto alternativo..."

# Detener nginx temporalmente
systemctl stop nginx

# Intentar con standalone en puerto 80 (ahora libre)
certbot certonly --standalone -d $DOMAIN --non-interactive --agree-tos --email admin@jhservices.com.ar

if [ $? -eq 0 ]; then
    echo "✅ Certificado SSL obtenido exitosamente"
    
    # Reiniciar nginx
    systemctl start nginx
    
    # Crear configuración final con SSL
    echo "📋 Configurando Nginx con SSL..."
    
    cat > /etc/nginx/sites-available/$DOMAIN << 'SSL_EOF'
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

    # Certificados SSL
    ssl_certificate /etc/letsencrypt/live/store.jhservices.com.ar/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/store.jhservices.com.ar/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Configuración de seguridad
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

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

# Mantener acceso directo puerto 8080 como respaldo
server {
    listen 8080;
    listen [::]:8080;
    server_name store.jhservices.com.ar;
    
    # Redirigir a HTTPS
    return 301 https://$server_name$request_uri;
}
SSL_EOF

    # Habilitar configuración SSL
    ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
    
    # Remover configuraciones anteriores
    rm -f /etc/nginx/sites-enabled/temp-ssl
    rm -f /etc/nginx/sites-available/temp-ssl
    
    # Verificar configuración
    nginx -t
    
    if [ $? -eq 0 ]; then
        systemctl reload nginx
        
        # Configurar renovación automática
        (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet --pre-hook 'systemctl stop nginx' --post-hook 'systemctl start nginx'") | crontab -
        
        echo "✅ Nginx configurado con SSL"
        echo ""
        echo "🎉 ¡SSL configurado exitosamente!"
        echo ""
        echo "📋 URLs finales:"
        echo "   🏠 Frontend: https://store.jhservices.com.ar"
        echo "   🔒 Admin: https://store.jhservices.com.ar/admin-jhservices-private"
        echo "   📊 API: https://store.jhservices.com.ar/api/health"
        echo ""
        echo "🔐 Contraseña admin: jhservices2025!"
        echo ""
        echo "✅ Renovación automática configurada (detiene nginx temporalmente)"
        echo "🔥 Puerto 80, 443 y 8080 configurados"
        echo ""
        echo "🚀 ¡Tu APK Store está listo con SSL!"
        
    else
        echo "❌ Error en configuración de Nginx"
        nginx -t
        systemctl start nginx
    fi
    
else
    echo "❌ Error obteniendo certificado SSL con método standalone"
    echo ""
    echo "🔄 Intentando método manual..."
    
    # Reiniciar nginx
    systemctl start nginx
    
    echo ""
    echo "📋 MÉTODO MANUAL:"
    echo "1. Ve a tu proveedor DNS y crea un registro TXT:"
    echo "   Nombre: _acme-challenge.store.jhservices.com.ar"
    echo "   Valor: [valor que aparecerá en el siguiente comando]"
    echo ""
    echo "2. Ejecuta manualmente:"
    echo "   certbot certonly --manual --preferred-challenges dns -d store.jhservices.com.ar"
    echo ""
    echo "3. Luego ejecuta este script otra vez"
    echo ""
    echo "🔧 O puedes usar un certificado autofirmado:"
    echo "   Ejecuta: curl -sSL https://raw.githubusercontent.com/JJSecureVPN/StoreAPK/main/self-signed-ssl.sh | bash"
fi
