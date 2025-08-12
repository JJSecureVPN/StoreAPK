# 🚀 Guía de Despliegue - APK Store

## 📋 Requisitos del VPS

### Software Necesario:
- **Node.js 18+** y **npm**
- **Nginx** (como proxy reverso)
- **PM2** (para gestión de procesos)
- **PostgreSQL** (opcional, tiene fallback a datos mock)
- **Certbot** (para SSL/HTTPS)

## 🔧 Configuración del VPS

### 1. Instalar Dependencias

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2 globalmente
sudo npm install -g pm2

# Instalar Nginx
sudo apt install nginx -y

# Instalar PostgreSQL (opcional)
sudo apt install postgresql postgresql-contrib -y

# Instalar Certbot para SSL
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Configurar Usuario de Aplicación

```bash
# Crear usuario para la aplicación
sudo adduser --system --group --home /var/www/apkstore apkstore

# Cambiar a directorio de la aplicación
sudo mkdir -p /var/www/apkstore
sudo chown apkstore:apkstore /var/www/apkstore
```

## 📦 Subir y Configurar la Aplicación

### 1. Transferir Archivos al VPS

```bash
# Desde tu máquina local, comprimir el proyecto
tar -czf apkstore.tar.gz --exclude=node_modules --exclude=.git --exclude=uploads/* .

# Subir al VPS (reemplaza IP_DEL_VPS con tu IP)
scp apkstore.tar.gz root@IP_DEL_VPS:/var/www/apkstore/

# En el VPS, extraer archivos
cd /var/www/apkstore
sudo tar -xzf apkstore.tar.gz
sudo chown -R apkstore:apkstore /var/www/apkstore
```

### 2. Instalar Dependencias en el VPS

```bash
# Cambiar al usuario apkstore
sudo su - apkstore
cd /var/www/apkstore

# Instalar dependencias del proyecto
npm run install:all

# Construir el frontend para producción
npm run build

# Crear directorio de uploads
mkdir -p uploads/apks
```

### 3. Configurar Variables de Entorno

```bash
# Crear archivo .env en el backend
cd /var/www/apkstore/backend
cat > .env << 'EOF'
NODE_ENV=production
PORT=3002
FRONTEND_URL=https://store.jhservices.com.ar

# PostgreSQL (opcional - si no está configurado usará datos mock)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=apk_store
DB_USER=apkstore_user
DB_PASSWORD=tu_password_seguro

# Configuración de uploads
UPLOAD_PATH=/var/www/apkstore/uploads
MAX_FILE_SIZE=100MB
EOF
```

## 🔄 Configurar PM2 (Gestor de Procesos)

### 1. Crear Archivo de Configuración PM2

```bash
cd /var/www/apkstore
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'apkstore-backend',
      script: './backend/dist/index.js',
      cwd: '/var/www/apkstore',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      error_file: '/var/log/apkstore/backend-error.log',
      out_file: '/var/log/apkstore/backend-out.log',
      log_file: '/var/log/apkstore/backend.log',
      time: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};
EOF

# Crear directorio de logs
sudo mkdir -p /var/log/apkstore
sudo chown apkstore:apkstore /var/log/apkstore
```

### 2. Iniciar Aplicación con PM2

```bash
# Compilar TypeScript del backend
cd backend && npm run build

# Iniciar con PM2
pm2 start ecosystem.config.js

# Guardar configuración PM2
pm2 save

# Configurar PM2 para inicio automático
pm2 startup
# (seguir las instrucciones que aparezcan)
```

## 🌐 Configurar Nginx

### 1. Crear Configuración de Nginx

```bash
sudo cat > /etc/nginx/sites-available/store.jhservices.com.ar << 'EOF'
server {
    listen 80;
    server_name store.jhservices.com.ar;

    # Redirigir a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name store.jhservices.com.ar;

    # Certificados SSL (se configurarán con certbot)
    ssl_certificate /etc/letsencrypt/live/store.jhservices.com.ar/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/store.jhservices.com.ar/privkey.pem;

    # Configuración SSL moderna
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_session_timeout 10m;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;

    # Configuración de seguridad
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

    # Archivos estáticos del frontend
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
sudo ln -s /etc/nginx/sites-available/store.jhservices.com.ar /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# No reiniciar Nginx aún (necesitamos SSL primero)
```

## 🔐 Configurar SSL con Let's Encrypt

```bash
# Obtener certificado SSL
sudo certbot --nginx -d store.jhservices.com.ar

# Verificar renovación automática
sudo certbot renew --dry-run

# Reiniciar Nginx
sudo systemctl restart nginx
```

## 🔒 Crear Panel de Administración Privado

### 1. Ruta Privada para Subir APKs

Vamos a crear una ruta secreta para que solo tú puedas subir aplicaciones:

```bash
cd /var/www/apkstore
cat > admin-setup.md << 'EOF'
# Panel de Administración

## Acceso Privado
URL secreta: https://store.jhservices.com.ar/admin-jhservices-private

## Credenciales
Usuario: admin
Password: [GENERAR_PASSWORD_SEGURO]

## Funciones:
- Subir nuevas aplicaciones APK
- Gestionar apps existentes
- Ver estadísticas de descargas
- Moderar comentarios
EOF
```

## ⚡ Scripts de Mantenimiento

### 1. Script de Actualización

```bash
cat > /var/www/apkstore/update-app.sh << 'EOF'
#!/bin/bash
cd /var/www/apkstore

echo "🔄 Actualizando APK Store..."

# Detener aplicación
pm2 stop apkstore-backend

# Backup
tar -czf "backup-$(date +%Y%m%d-%H%M%S).tar.gz" . --exclude=node_modules --exclude=backup-*.tar.gz

# Instalar dependencias si hay cambios
npm run install:all

# Construir frontend
npm run build

# Compilar backend
cd backend && npm run build && cd ..

# Reiniciar aplicación
pm2 start apkstore-backend

echo "✅ APK Store actualizada correctamente"
EOF

chmod +x /var/www/apkstore/update-app.sh
```

### 2. Script de Backup

```bash
cat > /var/www/apkstore/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/apkstore"
DATE=$(date +%Y%m%d-%H%M%S)

mkdir -p $BACKUP_DIR

# Backup de archivos
tar -czf "$BACKUP_DIR/apkstore-files-$DATE.tar.gz" -C /var/www/apkstore . --exclude=node_modules

# Backup de base de datos (si existe)
if command -v pg_dump &> /dev/null; then
    sudo -u postgres pg_dump apk_store > "$BACKUP_DIR/apkstore-db-$DATE.sql"
fi

# Mantener solo los últimos 7 backups
find $BACKUP_DIR -name "apkstore-*" -mtime +7 -delete

echo "✅ Backup completado: $BACKUP_DIR/apkstore-files-$DATE.tar.gz"
EOF

chmod +x /var/www/apkstore/backup.sh

# Programar backup diario
(crontab -l 2>/dev/null; echo "0 2 * * * /var/www/apkstore/backup.sh") | crontab -
```

## 🔍 Monitoreo y Logs

```bash
# Ver logs en tiempo real
pm2 logs apkstore-backend

# Estado de la aplicación
pm2 status

# Reiniciar si es necesario
pm2 restart apkstore-backend

# Ver logs de Nginx
sudo tail -f /var/log/nginx/store.jhservices.com.ar.access.log
sudo tail -f /var/log/nginx/store.jhservices.com.ar.error.log
```

## 🎯 Verificación Post-Despliegue

1. **Frontend:** https://store.jhservices.com.ar
2. **API Health:** https://store.jhservices.com.ar/api/health
3. **Apps Endpoint:** https://store.jhservices.com.ar/api/apps

## 🚨 Solución de Problemas

### Backend no inicia:
```bash
cd /var/www/apkstore/backend
npm run build
pm2 restart apkstore-backend
pm2 logs apkstore-backend
```

### Frontend no carga:
```bash
cd /var/www/apkstore/frontend
npm run build
sudo systemctl restart nginx
```

### SSL no funciona:
```bash
sudo certbot renew
sudo systemctl restart nginx
```

---

## 📞 Siguiente Paso: Panel de Administración

Una vez desplegado, crearemos:
- ✅ Ruta privada para subir APKs
- ✅ Interface de administración
- ✅ Sistema de autenticación
- ✅ Gestión de aplicaciones

¿Procedes con el despliegue o necesitas ayuda con algún paso específico?
