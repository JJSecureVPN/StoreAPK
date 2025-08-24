#!/bin/bash

# Script de despliegue directo de la aplicación en el VPS
# Ejecutar desde el directorio del proyecto clonado

set -e

echo "🚀 Desplegando APK Store directamente desde código fuente..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ No estamos en el directorio del proyecto"
    echo "Asegúrate de ejecutar desde el directorio raíz del proyecto clonado"
    exit 1
fi

# Crear directorio de destino si no existe
DEPLOY_DIR="/var/www/apkstore"
echo "📁 Preparando directorio de despliegue: $DEPLOY_DIR"

# Crear directorio si no existe
sudo mkdir -p $DEPLOY_DIR

# Cambiar propiedad al usuario apkstore
sudo chown -R apkstore:apkstore $DEPLOY_DIR

# Crear backup si existe instalación previa
if [ -d "$DEPLOY_DIR/backend" ] || [ -d "$DEPLOY_DIR/frontend" ]; then
    echo "💾 Creando backup..."
    BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
    sudo mkdir -p $DEPLOY_DIR/backups
    sudo tar -czf "$DEPLOY_DIR/backups/$BACKUP_NAME.tar.gz" -C $DEPLOY_DIR . --exclude=backups 2>/dev/null || true
    echo "✅ Backup creado: $DEPLOY_DIR/backups/$BACKUP_NAME.tar.gz"
fi

# Copiar código al directorio de despliegue
echo "📦 Copiando código fuente..."
sudo rsync -av --delete \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='.env' \
    . $DEPLOY_DIR/

# Cambiar propiedad
sudo chown -R apkstore:apkstore $DEPLOY_DIR

# Cambiar al directorio de despliegue
cd $DEPLOY_DIR

# Instalar dependencias
echo "📦 Instalando dependencias..."
sudo -u apkstore npm install

# Backend
echo "📦 Instalando dependencias del backend..."
sudo -u apkstore bash -c "cd backend && npm install"

# Frontend
echo "📦 Instalando dependencias del frontend..."
sudo -u apkstore bash -c "cd frontend && npm install"

# Configurar variables de entorno
echo "⚙️ Configurando variables de entorno..."
if [ ! -f "backend/.env" ]; then
    sudo -u apkstore cp backend/.env.example backend/.env
    echo "📝 Archivo backend/.env creado. Edita las configuraciones si es necesario."
fi

if [ ! -f "frontend/.env" ]; then
    sudo -u apkstore cp frontend/.env.example frontend/.env
    echo "📝 Archivo frontend/.env creado."
fi

# Construir frontend para producción
echo "🏗️ Construyendo frontend..."
sudo -u apkstore bash -c "cd frontend && npm run build"

# Compilar backend TypeScript
echo "🏗️ Compilando backend..."
sudo -u apkstore bash -c "cd backend && npm run build"

# Crear directorios necesarios
echo "📁 Creando estructura de archivos..."
sudo -u apkstore mkdir -p uploads/apks
sudo -u apkstore mkdir -p uploads/icons
sudo -u apkstore mkdir -p uploads/screenshots
sudo -u apkstore mkdir -p logs

# Configurar permisos
chmod 755 uploads
chmod 755 uploads/apks
chmod 755 uploads/icons
chmod 755 uploads/screenshots

# Verificar que el build del backend existe
if [ ! -f "backend/dist/index.js" ]; then
    echo "❌ Build del backend fallido"
    exit 1
fi

# Verificar que el build del frontend exists
if [ ! -f "frontend/dist/index.html" ]; then
    echo "❌ Build del frontend fallido"
    exit 1
fi

# Detener aplicación si está corriendo
echo "🛑 Deteniendo aplicación anterior..."
sudo -u apkstore pm2 stop apkstore-backend 2>/dev/null || echo "No hay aplicación corriendo"

# Iniciar aplicación con PM2
echo "🚀 Iniciando aplicación..."
sudo -u apkstore pm2 start ecosystem.config.js --env production

# Guardar configuración PM2
sudo -u apkstore pm2 save

# Configurar PM2 para inicio automático
echo "⚙️ Configurando inicio automático..."
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u apkstore --hp /var/www/apkstore 2>/dev/null || true

# Reiniciar Nginx para cargar el frontend
echo "🌐 Reiniciando Nginx..."
sudo systemctl restart nginx

# Verificar estado
echo "🔍 Verificando estado..."
sleep 3

# Verificar PM2
PM2_STATUS=$(sudo -u apkstore pm2 status apkstore-backend | grep -c "online" || echo "0")
if [ "$PM2_STATUS" -gt "0" ]; then
    echo "✅ Backend online en PM2"
else
    echo "❌ Error: Backend no está corriendo"
    sudo -u apkstore pm2 logs apkstore-backend --lines 10
    exit 1
fi

# Verificar Nginx
if sudo nginx -t; then
    echo "✅ Configuración de Nginx válida"
else
    echo "❌ Error en configuración de Nginx"
    exit 1
fi

# Verificar API
echo "🔍 Probando API..."
sleep 2
if curl -f http://localhost:3002/api/health > /dev/null 2>&1; then
    echo "✅ API respondiendo correctamente"
else
    echo "⚠️ API no responde (puede ser normal en el primer arranque)"
fi

echo ""
echo "🎉 ¡Despliegue completado!"
echo ""
echo "📊 Estado de la aplicación:"
sudo -u apkstore pm2 status

echo ""
echo "🌐 URLs disponibles:"
echo "   Frontend: http://$(hostname -I | awk '{print $1}')"
echo "   API: http://$(hostname -I | awk '{print $1}')/api/health"
echo ""
echo "📋 Próximos pasos:"
echo "1. Configurar DNS para store.jhservices.com.ar"
echo "2. Ejecutar: sudo certbot --nginx -d store.jhservices.com.ar"
echo "3. Acceder a: https://store.jhservices.com.ar"
echo ""
echo "📊 Comandos útiles:"
echo "   sudo -u apkstore pm2 status    - Ver estado"
echo "   sudo -u apkstore pm2 logs      - Ver logs"
echo "   sudo -u apkstore pm2 restart all - Reiniciar"
echo "   sudo systemctl status nginx    - Estado de Nginx"
echo ""
