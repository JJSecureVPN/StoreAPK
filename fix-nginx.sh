#!/bin/bash

# 🔧 Fix Nginx Configuration - Port 8080
# =====================================

echo "🔧 Corrigiendo configuración de Nginx para puerto 8080..."

# Crear nueva configuración HTTP en puerto 8080
cat > /etc/nginx/sites-available/store.jhservices.com.ar << 'NGINX_EOF'
# Configuración HTTP para APK Store (puerto 8080)
server {
    listen 8080;
    listen [::]:8080;
    server_name store.jhservices.com.ar;

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
            add_header Content-Disposition 'attachment; filename="$basename"';
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
        
        # Configuración para uploads grandes
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
NGINX_EOF

# Habilitar el sitio
ln -sf /etc/nginx/sites-available/store.jhservices.com.ar /etc/nginx/sites-enabled/

# Remover configuración por defecto si existe
rm -f /etc/nginx/sites-enabled/default

# Abrir puerto 8080 en firewall
ufw allow 8080/tcp

# Verificar configuración
echo "🔍 Verificando configuración de Nginx..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Configuración válida, reiniciando Nginx..."
    systemctl reload nginx
    systemctl enable nginx
    
    echo ""
    echo "🎉 ¡Nginx configurado correctamente!"
    echo ""
    echo "📋 URLs de acceso:"
    echo "   🏠 Frontend: http://store.jhservices.com.ar:8080"
    echo "   🔒 Admin: http://store.jhservices.com.ar:8080/admin-jhservices-private"
    echo "   📊 API: http://store.jhservices.com.ar:8080/api/health"
    echo ""
    echo "🔥 Puerto abierto en firewall: 8080"
    echo ""
else
    echo "❌ Error en la configuración de Nginx"
    echo "Revisa los logs: nginx -t"
fi
