#!/bin/bash

# Script de despliegue de la aplicación en el VPS
# Ejecutar como usuario apkstore en /var/www/apkstore

set -e

echo "🚀 Desplegando APK Store..."

# Verificar que estamos en el directorio correcto
if [ ! -f "apkstore-deploy.tar.gz" ]; then
    echo "❌ Archivo apkstore-deploy.tar.gz no encontrado"
    echo "Asegúrate de estar en /var/www/apkstore y tener el archivo subido"
    exit 1
fi

# Crear backup si existe instalación previa
if [ -d "backend" ] || [ -d "frontend" ]; then
    echo "💾 Creando backup..."
    BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p backups
    tar -czf "backups/$BACKUP_NAME.tar.gz" . --exclude=backups --exclude=apkstore-deploy.tar.gz 2>/dev/null || true
    echo "✅ Backup creado: backups/$BACKUP_NAME.tar.gz"
fi

# Extraer aplicación
echo "📦 Extrayendo aplicación..."
tar -xzf apkstore-deploy.tar.gz

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm run install:all

# Construir frontend para producción
echo "🏗️ Construyendo frontend..."
cd frontend
npm run build
cd ..

# Compilar backend TypeScript
echo "🏗️ Compilando backend..."
cd backend
npm run build
cd ..

# Crear directorios necesarios
echo "📁 Creando estructura de archivos..."
mkdir -p uploads/apks
mkdir -p uploads/icons
mkdir -p uploads/screenshots
mkdir -p logs

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

# Verificar que el build del frontend existe
if [ ! -f "frontend/dist/index.html" ]; then
    echo "❌ Build del frontend fallido"
    exit 1
fi

# Detener aplicación si está corriendo
echo "🛑 Deteniendo aplicación anterior..."
pm2 stop apkstore-backend 2>/dev/null || echo "No hay aplicación corriendo"

# Iniciar aplicación con PM2
echo "🚀 Iniciando aplicación..."
pm2 start ecosystem.config.js --env production

# Guardar configuración PM2
pm2 save

# Configurar PM2 para inicio automático (si no está configurado)
if ! pm2 startup | grep -q "already"; then
    echo "⚙️ Configurando inicio automático..."
    sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u apkstore --hp /var/www/apkstore
fi

# Reiniciar Nginx para cargar el frontend
echo "🌐 Reiniciando Nginx..."
sudo systemctl restart nginx

# Verificar estado
echo "🔍 Verificando estado..."
sleep 3

# Verificar PM2
PM2_STATUS=$(pm2 status apkstore-backend | grep -c "online" || echo "0")
if [ "$PM2_STATUS" -gt "0" ]; then
    echo "✅ Backend online en PM2"
else
    echo "❌ Error: Backend no está corriendo"
    pm2 logs apkstore-backend --lines 10
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
pm2 status

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
echo "   pm2 status          - Ver estado"
echo "   pm2 logs            - Ver logs"
echo "   pm2 restart all     - Reiniciar"
echo "   sudo systemctl status nginx - Estado de Nginx"
echo ""
