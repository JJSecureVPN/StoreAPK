#!/bin/bash

# Script de instalación simple para APK Store
# Para ejecutar desde el directorio del proyecto clonado

set -e

echo "🚀 Instalando APK Store..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ No estamos en el directorio del proyecto"
    echo "Ejecuta desde el directorio raíz del proyecto: cd StoreAPK"
    exit 1
fi

# Verificar que somos root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Este script debe ejecutarse como root"
    echo "Ejecuta: sudo ./install-simple.sh"
    exit 1
fi

echo "📦 Instalando dependencias del sistema..."

# Instalar Node.js si no está instalado
if ! command -v node &> /dev/null; then
    echo "📦 Instalando Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# Instalar PM2 globalmente
echo "📦 Instalando PM2..."
npm install -g pm2

# Crear usuario apkstore si no existe
if ! id "apkstore" &>/dev/null; then
    echo "👤 Creando usuario apkstore..."
    useradd -m -s /bin/bash apkstore
    usermod -aG sudo apkstore
fi

# Crear directorio de destino
DEPLOY_DIR="/var/www/apkstore"
echo "📁 Preparando directorio: $DEPLOY_DIR"
mkdir -p $DEPLOY_DIR

# Copiar archivos
echo "📦 Copiando archivos..."
rsync -av --delete \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='.env' \
    . $DEPLOY_DIR/

# Cambiar propiedad
chown -R apkstore:apkstore $DEPLOY_DIR

# Cambiar al directorio de despliegue
cd $DEPLOY_DIR

echo "📦 Instalando dependencias de Node.js..."

# Instalar dependencias del proyecto
sudo -u apkstore npm install

# Backend
echo "📦 Backend..."
sudo -u apkstore bash -c "cd backend && npm install"

# Frontend
echo "📦 Frontend..."
sudo -u apkstore bash -c "cd frontend && npm install"

# Configurar variables de entorno
echo "⚙️ Configurando variables de entorno..."
sudo -u apkstore cp backend/.env.example backend/.env
sudo -u apkstore cp frontend/.env.example frontend/.env

# Actualizar puerto en .env del frontend si es necesario
sudo -u apkstore sed -i 's/localhost:3001/localhost:3002/g' frontend/.env

echo "🏗️ Construyendo aplicación..."

# Construir frontend
sudo -u apkstore bash -c "cd frontend && npm run build"

# Compilar backend
sudo -u apkstore bash -c "cd backend && npm run build"

# Crear directorios necesarios
echo "📁 Creando directorios..."
sudo -u apkstore mkdir -p uploads/{apks,icons,screenshots}
sudo -u apkstore mkdir -p logs

# Configurar permisos
chmod 755 uploads uploads/apks uploads/icons uploads/screenshots

echo "🚀 Iniciando aplicación..."

# Detener si está corriendo
sudo -u apkstore pm2 stop all 2>/dev/null || true

# Iniciar con PM2
sudo -u apkstore pm2 start ecosystem.config.js --env production

# Guardar configuración
sudo -u apkstore pm2 save

# Configurar startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u apkstore --hp /var/www/apkstore 2>/dev/null || true

echo "🔍 Verificando instalación..."
sleep 3

# Verificar que esté corriendo
if sudo -u apkstore pm2 status | grep -q "online"; then
    echo "✅ Aplicación iniciada correctamente"
else
    echo "⚠️ La aplicación puede estar iniciándose..."
    sudo -u apkstore pm2 status
fi

# Probar API
sleep 2
if curl -f http://localhost:3002/api/health > /dev/null 2>&1; then
    echo "✅ API respondiendo en puerto 3002"
else
    echo "⚠️ API aún no responde (normal en el primer arranque)"
fi

echo ""
echo "🎉 ¡Instalación completada!"
echo ""
echo "📊 Estado actual:"
sudo -u apkstore pm2 status
echo ""
echo "🌐 URLs:"
echo "   API: http://$(hostname -I | awk '{print $1}'):3002/api/health"
echo "   Frontend: Necesitas configurar Nginx"
echo ""
echo "📋 Próximos pasos:"
echo "1. Configurar Nginx: ./configure-nginx.sh"
echo "2. Configurar SSL: ./setup-ssl.sh tu-dominio.com"
echo ""
echo "📊 Comandos útiles:"
echo "   sudo -u apkstore pm2 status"
echo "   sudo -u apkstore pm2 logs"
echo "   sudo -u apkstore pm2 restart all"
echo ""
