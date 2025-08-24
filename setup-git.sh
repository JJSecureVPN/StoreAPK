#!/bin/bash

# 🚀 APK Store - Setup Completo con Git
# =====================================
# 
# Este script automatiza todo el proceso:
# 1. Inicializa Git
# 2. Prepara archivos para despliegue
# 3. Muestra instrucciones para GitHub y VPS
#

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

title() {
    echo -e "${BLUE}$1${NC}"
}

log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que estamos en la raíz del proyecto
if [ ! -f "package.json" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    error "Ejecuta este script desde la raíz del proyecto APK Store"
    exit 1
fi

title "🚀 APK Store - Setup Completo con Git"
title "======================================"
echo ""

# Paso 1: Inicializar Git
title "📋 PASO 1: Inicializando repositorio Git"
echo ""
if [ -f "init-git.sh" ]; then
    bash init-git.sh
else
    error "Archivo init-git.sh no encontrado"
    exit 1
fi

echo ""
title "📋 PASO 2: Instrucciones para GitHub"
title "===================================="
echo ""
log "🌐 Ve a https://github.com/new y crea un repositorio:"
echo ""
echo "   📝 Nombre: apk-store"
echo "   📝 Descripción: Complete Play Store clone with React + Node.js"
echo "   📝 Visibilidad: Público (recomendado) o Privado"
echo "   📝 NO inicializar con README, .gitignore o licencia"
echo ""
log "📤 Después de crear el repositorio, ejecuta:"
echo ""
echo "   git remote add origin https://github.com/TU_USUARIO/apk-store.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""

# Preguntar si quiere continuar
echo -n "¿Has creado el repositorio en GitHub? (y/n): "
read -r github_ready

if [[ $github_ready =~ ^[Yy]$ ]]; then
    echo ""
    echo -n "Ingresa tu usuario de GitHub: "
    read -r github_user
    
    if [ -n "$github_user" ]; then
        # Actualizar URL en install.sh
        if [ -f "install.sh" ]; then
            sed -i "s|REPO_URL=\"https://github.com/TU_USUARIO/apk-store.git\"|REPO_URL=\"https://github.com/$github_user/apk-store.git\"|g" install.sh
            log "✅ URL actualizada en install.sh"
        fi
        
        # Mostrar comandos para ejecutar
        echo ""
        log "📤 Ejecuta estos comandos para subir a GitHub:"
        echo ""
        echo "   git remote add origin https://github.com/$github_user/apk-store.git"
        echo "   git branch -M main"
        echo "   git push -u origin main"
        echo ""
        
        # Preguntar si ya subió a GitHub
        echo -n "¿Ya subiste el código a GitHub? (y/n): "
        read -r uploaded
        
        if [[ $uploaded =~ ^[Yy]$ ]]; then
            echo ""
            title "📋 PASO 3: Instalación Automática en VPS"
            title "========================================="
            echo ""
            log "🚀 Tu aplicación ya está lista para instalarse automáticamente!"
            echo ""
            log "📋 En tu VPS, ejecuta este comando como root:"
            echo ""
            echo "   curl -sSL https://raw.githubusercontent.com/$github_user/apk-store/main/install.sh | bash"
            echo ""
            log "🔧 O descarga y ejecuta manualmente:"
            echo ""
            echo "   wget https://raw.githubusercontent.com/$github_user/apk-store/main/install.sh"
            echo "   sudo bash install.sh"
            echo ""
            
            title "📋 PASO 4: Configuración Post-Instalación"
            title "=========================================="
            echo ""
            log "✅ Después de la instalación automática:"
            echo ""
            echo "   1. 🌐 Configurar DNS:"
            echo "      store.jhservices.com.ar -> IP_DE_TU_VPS"
            echo ""
            echo "   2. 🔐 Configurar SSL:"
            echo "      sudo certbot --nginx -d store.jhservices.com.ar"
            echo ""
            echo "   3. 🔑 Cambiar contraseña del admin:"
            echo "      nano /var/www/apkstore/frontend/src/pages/Admin.tsx"
            echo ""
            
            title "📋 PASO 5: URLs Finales"
            title "======================="
            echo ""
            log "🌐 Tu APK Store estará disponible en:"
            echo ""
            echo "   🏠 Frontend: https://store.jhservices.com.ar"
            echo "   🔒 Admin: https://store.jhservices.com.ar/admin-jhservices-private"
            echo "   📊 API: https://store.jhservices.com.ar/api/health"
            echo ""
            
            title "📋 PASO 6: Comandos de Mantenimiento"
            title "===================================="
            echo ""
            log "🛠️ En el VPS puedes usar:"
            echo ""
            echo "   # Ver estado"
            echo "   sudo -u apkstore pm2 status"
            echo ""
            echo "   # Ver logs"
            echo "   sudo -u apkstore pm2 logs"
            echo ""
            echo "   # Actualizar desde Git"
            echo "   sudo -u apkstore bash /var/www/apkstore/update-vps.sh"
            echo ""
            echo "   # Crear backup"
            echo "   bash /var/www/apkstore/backup.sh"
            echo ""
            
            title "🎉 ¡Setup Completo!"
            echo ""
            log "✅ Repositorio Git creado y configurado"
            log "✅ Código subido a GitHub"
            log "✅ Script de instalación automática listo"
            log "✅ URLs de despliegue configuradas"
            echo ""
            warn "🚨 Recordatorios importantes:"
            echo "   - Configurar DNS antes de ejecutar certbot"
            echo "   - Cambiar la contraseña del admin"
            echo "   - Hacer backup regular de la aplicación"
            echo ""
            log "🚀 ¡Tu APK Store está listo para producción!"
            
        else
            echo ""
            warn "⚠️ Sube el código a GitHub primero, luego podrás usar la instalación automática"
        fi
    else
        warn "⚠️ Necesitas ingresar tu usuario de GitHub para continuar"
    fi
else
    echo ""
    warn "⚠️ Crea el repositorio en GitHub primero para continuar"
    echo ""
    log "📋 Instrucciones:"
    echo "   1. Ve a https://github.com/new"
    echo "   2. Crea el repositorio 'apk-store'"
    echo "   3. Ejecuta este script nuevamente"
fi

echo ""
log "📚 Documentación completa en README.md"
log "🆘 Soporte técnico: contacto@jhservices.com.ar"
