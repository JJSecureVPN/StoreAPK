#!/bin/bash

# 🚀 APK Store - Instalación Automática desde Git
# ================================================
# 
# Este script clona el repositorio e instala automáticamente 
# la aplicación APK Store en tu VPS
#
# Uso: curl -sSL https://raw.githubusercontent.com/TU_USUARIO/apk-store/main/install.sh | bash
#

set -e  # Salir si hay errores

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

title() {
    echo -e "${BLUE}$1${NC}"
}

# Verificar que se ejecuta como root
if [ "$EUID" -ne 0 ]; then
    error "Este script debe ejecutarse como root"
    echo "Usa: sudo bash install.sh"
    exit 1
fi

# Configuración
REPO_URL="https://github.com/JJSecureVPN/StoreAPK.git"
DOMAIN="store.jhservices.com.ar"
APP_DIR="/var/www/apkstore"

title "🚀 APK Store - Instalación Automática"
title "======================================"
echo ""
log "Dominio: $DOMAIN"
log "Directorio: $APP_DIR"
log "Usuario: $APP_USER"
echo ""

# Actualizar sistema
title "📦 Actualizando sistema..."
apt update && apt upgrade -y

# Instalar herramientas básicas
title "📦 Instalando herramientas básicas..."
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Instalar Node.js
title "📦 Instalando Node.js $NODE_VERSION..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
apt-get install -y nodejs

# Verificar instalación de Node.js
NODE_VER=$(node --version 2>/dev/null || echo "Error")
NPM_VER=$(npm --version 2>/dev/null || echo "Error")
log "Node.js: $NODE_VER"
log "npm: $NPM_VER"

# Si npm no está disponible, instalarlo por separado
if ! command -v npm &> /dev/null; then
    warn "npm no encontrado, instalando por separado..."
    apt-get install -y npm
fi

# Instalar PM2
title "📦 Instalando PM2..."
npm install -g pm2

# Instalar Nginx
title "📦 Instalando Nginx..."
apt install -y nginx

# Instalar Certbot
title "📦 Instalando Certbot..."
apt install -y certbot python3-certbot-nginx

# Crear usuario de aplicación
title "👤 Configurando usuario de aplicación..."
if ! id "$APP_USER" &>/dev/null; then
    adduser --system --group --home $APP_DIR $APP_USER
    log "Usuario $APP_USER creado"
else
    log "Usuario $APP_USER ya existe"
fi

# Crear directorios
title "📁 Creando estructura de directorios..."
mkdir -p $APP_DIR
mkdir -p /var/log/apkstore
mkdir -p /var/backups/apkstore

# Cambiar propietarios
chown -R $APP_USER:$APP_USER $APP_DIR
chown -R $APP_USER:$APP_USER /var/log/apkstore

# Clonar repositorio
title "📥 Clonando repositorio..."
cd $APP_DIR

# Si ya existe, hacer backup y eliminar
if [ -d ".git" ]; then
    warn "Repositorio existente encontrado, creando backup..."
    BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p /var/backups/apkstore
    tar -czf "/var/backups/apkstore/$BACKUP_NAME.tar.gz" . --exclude=node_modules --exclude=.git 2>/dev/null || true
    log "Backup creado: /var/backups/apkstore/$BACKUP_NAME.tar.gz"
    
    # Limpiar directorio pero mantener uploads
    find . -maxdepth 1 -not -name uploads -not -name . -exec rm -rf {} + 2>/dev/null || true
fi

# Clonar como usuario apkstore
sudo -u $APP_USER git clone $REPO_URL .

# Configurar Git para el usuario
sudo -u $APP_USER git config --global --add safe.directory $APP_DIR

# Instalar dependencias
title "📦 Instalando dependencias del proyecto..."
sudo -u $APP_USER npm run install:all

# Crear archivos de configuración
title "⚙️ Configurando aplicación..."

# Crear .env para backend
sudo -u $APP_USER cat > backend/.env << EOF
NODE_ENV=production
PORT=3002
FRONTEND_URL=https://$DOMAIN

# PostgreSQL (opcional - comentar si no tienes PostgreSQL)
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=apk_store
# DB_USER=apkstore_user
# DB_PASSWORD=cambiar_password_seguro

# Configuración de uploads
UPLOAD_PATH=$APP_DIR/uploads
MAX_FILE_SIZE=100MB
EOF

# Crear .env para frontend
sudo -u $APP_USER cat > frontend/.env.production << EOF
VITE_API_URL=https://$DOMAIN/api
VITE_APP_NAME=APK Store - JH Services
VITE_APP_DESCRIPTION=Tu tienda de aplicaciones Android
EOF

# Construir aplicación
title "🏗️ Construyendo aplicación..."
cd $APP_DIR

# Construir frontend
log "Construyendo frontend..."
sudo -u $APP_USER bash -c "cd frontend && npm run build"

# Compilar backend
log "Compilando backend..."
sudo -u $APP_USER bash -c "cd backend && npm run build"

# Crear estructura de uploads
sudo -u $APP_USER mkdir -p uploads/{apks,logos,screenshots}

# Configurar Nginx
title "🌐 Configurando Nginx..."
cat > /etc/nginx/sites-available/$DOMAIN << 'NGINX_EOF'
# Redirigir HTTP a HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name store.jhservices.com.ar;
    return 301 https://$server_name$request_uri;
}

# Configuración principal HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name store.jhservices.com.ar;

    # Certificados SSL (configurados por certbot)
    ssl_certificate /etc/letsencrypt/live/store.jhservices.com.ar/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/store.jhservices.com.ar/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Configuración de seguridad
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

    client_max_body_size 100M;
    root /var/www/apkstore/frontend/dist;
    index index.html;

    # Logs
    access_log /var/log/nginx/store.jhservices.com.ar.access.log;
    error_log /var/log/nginx/store.jhservices.com.ar.error.log;

    # Archivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
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
    }

    # API
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
    }

    # Admin panel
    location /admin-jhservices-private {
        try_files $uri $uri/ /index.html;
        add_header X-Robots-Tag "noindex, nofollow";
    }

    # Frontend SPA
    location / {
        try_files $uri $uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public, must-revalidate";
    }

    # Bloquear archivos sensibles
    location ~ /\. {
        deny all;
    }
}
NGINX_EOF

# Habilitar sitio
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Verificar configuración de Nginx
if nginx -t; then
    log "Configuración de Nginx válida"
else
    error "Error en configuración de Nginx"
    exit 1
fi

# Configurar firewall
title "🔥 Configurando firewall..."
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable

# Iniciar aplicación con PM2
title "🚀 Iniciando aplicación..."
cd $APP_DIR

# Configurar PM2 para el usuario apkstore
sudo -u $APP_USER pm2 start ecosystem.config.js --env production
sudo -u $APP_USER pm2 save

# Configurar PM2 para inicio automático
env PATH=$PATH:/usr/bin pm2 startup systemd -u $APP_USER --hp $APP_DIR

# Reiniciar Nginx
systemctl restart nginx
systemctl enable nginx

# Verificar estado
title "🔍 Verificando instalación..."
sleep 3

# Verificar PM2
if sudo -u $APP_USER pm2 status | grep -q "online"; then
    log "✅ Backend online en PM2"
else
    warn "⚠️ Backend no está corriendo, verificando..."
    sudo -u $APP_USER pm2 logs --lines 5
fi

# Verificar Nginx
if systemctl is-active --quiet nginx; then
    log "✅ Nginx activo"
else
    error "❌ Nginx no está activo"
fi

# Crear scripts útiles
title "📝 Creando scripts de mantenimiento..."

# Script de actualización
cat > $APP_DIR/update.sh << 'UPDATE_EOF'
#!/bin/bash
cd /var/www/apkstore
echo "🔄 Actualizando APK Store..."

# Crear backup
tar -czf "backup-$(date +%Y%m%d-%H%M%S).tar.gz" . --exclude=node_modules --exclude=backup-*.tar.gz

# Actualizar código
sudo -u apkstore git pull

# Instalar dependencias
sudo -u apkstore npm run install:all

# Construir aplicación
sudo -u apkstore bash -c "cd frontend && npm run build"
sudo -u apkstore bash -c "cd backend && npm run build"

# Reiniciar aplicación
sudo -u apkstore pm2 restart apkstore-backend

echo "✅ APK Store actualizada"
UPDATE_EOF

chmod +x $APP_DIR/update.sh

# Script de backup
cat > $APP_DIR/backup.sh << 'BACKUP_EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/apkstore"
DATE=$(date +%Y%m%d-%H%M%S)

mkdir -p $BACKUP_DIR

# Backup de archivos
tar -czf "$BACKUP_DIR/apkstore-files-$DATE.tar.gz" -C /var/www/apkstore . --exclude=node_modules

echo "✅ Backup completado: $BACKUP_DIR/apkstore-files-$DATE.tar.gz"
BACKUP_EOF

chmod +x $APP_DIR/backup.sh

# Programar backup diario
(crontab -l 2>/dev/null; echo "0 2 * * * /var/www/apkstore/backup.sh") | crontab -

echo ""
title "🎉 ¡Instalación completada!"
echo ""
log "📋 Estado actual:"
echo "   ✅ Sistema actualizado"
echo "   ✅ Node.js $(node --version) instalado"
echo "   ✅ PM2 instalado y configurado"
echo "   ✅ Nginx instalado y configurado"
echo "   ✅ Aplicación construida y desplegada"
echo "   ✅ Firewall configurado"
echo "   ✅ Scripts de mantenimiento creados"
echo ""
log "🌐 URLs (después de configurar SSL):"
echo "   Frontend: https://$DOMAIN"
echo "   Admin: https://$DOMAIN/admin-jhservices-private"
echo "   API: https://$DOMAIN/api/health"
echo ""
log "🔐 Credenciales del panel admin:"
echo "   URL: https://$DOMAIN/admin-jhservices-private"
echo "   Contraseña: jhservices2025!"
echo ""
warn "📋 Próximos pasos obligatorios:"
echo "   1. Configurar DNS: $DOMAIN -> $(curl -s ifconfig.me)"
echo "   2. Obtener SSL: sudo certbot --nginx -d $DOMAIN"
echo "   3. Cambiar contraseña en: $APP_DIR/frontend/src/pages/Admin.tsx"
echo ""
log "📊 Comandos útiles:"
echo "   Estado: sudo -u $APP_USER pm2 status"
echo "   Logs: sudo -u $APP_USER pm2 logs"
echo "   Actualizar: bash $APP_DIR/update.sh"
echo "   Backup: bash $APP_DIR/backup.sh"
echo ""
log "🎯 Para configurar SSL ejecuta:"
echo "   sudo certbot --nginx -d $DOMAIN"
echo ""
title "🎉 ¡APK Store listo en tu VPS!"
