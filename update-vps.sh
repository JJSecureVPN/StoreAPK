#!/bin/bash

# 🔄 Script de actualización automática para APK Store
# ====================================================
# 
# Este script actualiza la aplicación desde Git y reinicia los servicios
# Ejecutar como usuario apkstore: bash /var/www/apkstore/update.sh
#

set -e

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[UPDATE]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] || [ ! -d ".git" ]; then
    error "Este script debe ejecutarse desde /var/www/apkstore"
    exit 1
fi

# Verificar que somos el usuario correcto
if [ "$USER" != "apkstore" ]; then
    error "Este script debe ejecutarse como usuario 'apkstore'"
    echo "Usa: sudo -u apkstore bash update.sh"
    exit 1
fi

log "🔄 Iniciando actualización de APK Store..."

# Crear backup antes de actualizar
log "💾 Creando backup..."
BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
tar -czf "$BACKUP_NAME.tar.gz" . --exclude=node_modules --exclude=backup-*.tar.gz --exclude=.git 2>/dev/null || true
log "✅ Backup creado: $BACKUP_NAME.tar.gz"

# Guardar archivos de configuración
log "💾 Guardando configuración actual..."
cp backend/.env backend/.env.backup 2>/dev/null || true
cp frontend/.env.production frontend/.env.production.backup 2>/dev/null || true

# Detener aplicación
log "🛑 Deteniendo aplicación..."
pm2 stop apkstore-backend 2>/dev/null || warn "La aplicación no estaba corriendo"

# Actualizar código desde Git
log "📥 Actualizando código desde Git..."
git fetch origin
git reset --hard origin/main

# Restaurar configuración
log "⚙️ Restaurando configuración..."
cp backend/.env.backup backend/.env 2>/dev/null || warn "No se pudo restaurar backend/.env"
cp frontend/.env.production.backup frontend/.env.production 2>/dev/null || warn "No se pudo restaurar frontend/.env.production"

# Verificar si hay cambios en package.json
FRONTEND_CHANGED=false
BACKEND_CHANGED=false

if git diff HEAD~1 --name-only | grep -q "frontend/package.json"; then
    FRONTEND_CHANGED=true
fi

if git diff HEAD~1 --name-only | grep -q "backend/package.json"; then
    BACKEND_CHANGED=true
fi

# Instalar dependencias si es necesario
if [ "$FRONTEND_CHANGED" = true ] || [ "$BACKEND_CHANGED" = true ]; then
    log "📦 Instalando dependencias actualizadas..."
    npm run install:all
else
    log "📦 No hay cambios en dependencias"
fi

# Verificar si hay cambios en el frontend
if git diff HEAD~1 --name-only | grep -q "frontend/"; then
    log "🏗️ Construyendo frontend..."
    cd frontend && npm run build && cd ..
else
    log "🏗️ No hay cambios en el frontend"
fi

# Verificar si hay cambios en el backend
if git diff HEAD~1 --name-only | grep -q "backend/"; then
    log "🏗️ Compilando backend..."
    cd backend && npm run build && cd ..
else
    log "🏗️ No hay cambios en el backend"
fi

# Verificar que los builds existen
if [ ! -f "backend/dist/index.js" ]; then
    error "❌ Build del backend fallido"
    exit 1
fi

if [ ! -f "frontend/dist/index.html" ]; then
    error "❌ Build del frontend fallido"
    exit 1
fi

# Iniciar aplicación
log "🚀 Iniciando aplicación..."
pm2 start apkstore-backend 2>/dev/null || pm2 restart apkstore-backend

# Esperar a que la aplicación se inicie
sleep 5

# Verificar que la aplicación está corriendo
if pm2 status apkstore-backend | grep -q "online"; then
    log "✅ Aplicación iniciada correctamente"
else
    error "❌ Error al iniciar la aplicación"
    pm2 logs apkstore-backend --lines 10
    exit 1
fi

# Verificar que la API responde
if curl -f http://localhost:3002/api/health > /dev/null 2>&1; then
    log "✅ API respondiendo correctamente"
else
    warn "⚠️ API no responde (puede ser normal en el primer arranque)"
fi

# Recargar Nginx si es necesario (requiere sudo)
log "🌐 Recargando Nginx..."
sudo systemctl reload nginx 2>/dev/null || warn "No se pudo recargar Nginx (ejecutar manualmente si es necesario)"

# Limpiar backups antiguos (mantener solo los últimos 5)
log "🧹 Limpiando backups antiguos..."
ls -t backup-*.tar.gz 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null || true

# Limpiar archivos temporales
rm -f backend/.env.backup frontend/.env.production.backup 2>/dev/null || true

log "✅ Actualización completada exitosamente!"
echo ""
log "📊 Estado actual:"
pm2 status apkstore-backend

# Mostrar últimos commits
echo ""
log "📝 Últimos cambios:"
git log --oneline -5

echo ""
log "🌐 Verificar en:"
echo "   Frontend: https://store.jhservices.com.ar"
echo "   API: https://store.jhservices.com.ar/api/health"
echo "   Admin: https://store.jhservices.com.ar/admin-jhservices-private"

log "🎉 ¡APK Store actualizada correctamente!"
