#!/bin/bash

# Script de preparación para despliegue en VPS
# Ejecutar desde la raíz del proyecto antes de subir al servidor

echo "🚀 Preparando APK Store para despliegue..."

# Limpiar dependencias existentes
echo "🧹 Limpiando node_modules..."
find . -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true

# Limpiar archivos de desarrollo
echo "🗑️ Limpiando archivos temporales..."
find . -name ".DS_Store" -delete 2>/dev/null || true
find . -name "*.log" -delete 2>/dev/null || true
find . -name ".env.local" -delete 2>/dev/null || true

# Crear archivo .env de producción para backend
echo "⚙️ Creando configuración de producción..."
cat > backend/.env.production << 'EOF'
NODE_ENV=production
PORT=3002
FRONTEND_URL=https://store.jhservices.com.ar

# PostgreSQL (opcional - comentar si no tienes PostgreSQL)
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=apk_store
# DB_USER=apkstore_user
# DB_PASSWORD=tu_password_seguro

# Configuración de uploads
UPLOAD_PATH=/var/www/apkstore/uploads
MAX_FILE_SIZE=100MB
EOF

# Actualizar URLs en frontend para producción
echo "🌐 Configurando URLs de producción..."
cat > frontend/.env.production << 'EOF'
VITE_API_URL=https://store.jhservices.com.ar/api
VITE_APP_NAME=APK Store - JH Services
VITE_APP_DESCRIPTION=Tu tienda de aplicaciones Android
EOF

# Crear directorio de uploads con estructura
echo "📁 Creando estructura de uploads..."
mkdir -p uploads/apks
mkdir -p uploads/icons
mkdir -p uploads/screenshots

# Crear archivo .gitkeep para mantener estructura
touch uploads/.gitkeep
touch uploads/apks/.gitkeep
touch uploads/icons/.gitkeep
touch uploads/screenshots/.gitkeep

# Crear archivo de compresión excluyendo archivos innecesarios
echo "📦 Creando archivo de despliegue..."
tar --exclude='node_modules' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='.DS_Store' \
    --exclude='backend/dist' \
    --exclude='frontend/dist' \
    --exclude='*.tar.gz' \
    -czf apkstore-deploy.tar.gz .

echo "✅ Preparación completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Subir 'apkstore-deploy.tar.gz' a tu VPS"
echo "2. Seguir la guía en 'deploy-guide.md'"
echo ""
echo "📂 Archivo creado: apkstore-deploy.tar.gz"
echo "📄 Guía completa: deploy-guide.md"
echo ""
echo "🚀 ¡Listo para subir a store.jhservices.com.ar!"
