#!/bin/bash

# 🔍 APK Store - Diagnóstico Completo del Sistema
# ===============================================

echo "🔍 APK Store - Diagnóstico del Sistema"
echo "======================================"
echo ""

# Verificar usuario root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Ejecuta como root: sudo bash diagnostic.sh"
    exit 1
fi

# Sistema operativo
echo "📋 INFORMACIÓN DEL SISTEMA:"
echo "OS: $(lsb_release -d | cut -f2)"
echo "Kernel: $(uname -r)"
echo "Arquitectura: $(uname -m)"
echo ""

# Verificar puertos ocupados
echo "🔌 PUERTOS EN USO:"
echo "Puerto 80: $(ss -tlnp | grep :80 || echo 'Libre')"
echo "Puerto 8080: $(ss -tlnp | grep :8080 || echo 'Libre')"
echo "Puerto 3002: $(ss -tlnp | grep :3002 || echo 'Libre')"
echo "Puerto 443: $(ss -tlnp | grep :443 || echo 'Libre')"
echo ""

# Verificar servicios
echo "🔧 ESTADO DE SERVICIOS:"
echo "Nginx: $(systemctl is-active nginx 2>/dev/null || echo 'No instalado')"
echo "UFW: $(systemctl is-active ufw 2>/dev/null || echo 'No instalado')"
echo ""

# Verificar Node.js y npm
echo "📦 HERRAMIENTAS DE DESARROLLO:"
echo "Node.js: $(node --version 2>/dev/null || echo 'No instalado')"
echo "npm: $(npm --version 2>/dev/null || echo 'No instalado')"
echo "PM2: $(pm2 --version 2>/dev/null || echo 'No instalado')"
echo "Git: $(git --version 2>/dev/null || echo 'No instalado')"
echo ""

# Verificar directorio de aplicación
echo "📁 DIRECTORIO DE APLICACIÓN:"
if [ -d "/var/www/apkstore" ]; then
    echo "✅ /var/www/apkstore existe"
    echo "   - Frontend: $([ -d '/var/www/apkstore/frontend' ] && echo 'Sí' || echo 'No')"
    echo "   - Backend: $([ -d '/var/www/apkstore/backend' ] && echo 'Sí' || echo 'No')"
    echo "   - Dist: $([ -d '/var/www/apkstore/frontend/dist' ] && echo 'Sí' || echo 'No')"
    
    # Verificar usuario propietario
    echo "   - Propietario: $(stat -c %U /var/www/apkstore)"
else
    echo "❌ /var/www/apkstore no existe"
fi
echo ""

# Verificar usuario apkstore
echo "👤 USUARIO APKSTORE:"
if id "apkstore" &>/dev/null; then
    echo "✅ Usuario apkstore existe"
    echo "   - Home: $(getent passwd apkstore | cut -d: -f6)"
    echo "   - Shell: $(getent passwd apkstore | cut -d: -f7)"
else
    echo "❌ Usuario apkstore no existe"
fi
echo ""

# Verificar configuración de Nginx
echo "🌐 CONFIGURACIÓN NGINX:"
if [ -f "/etc/nginx/sites-available/store.jhservices.com.ar" ]; then
    echo "✅ Configuración existe"
    if [ -L "/etc/nginx/sites-enabled/store.jhservices.com.ar" ]; then
        echo "✅ Sitio habilitado"
    else
        echo "❌ Sitio no habilitado"
    fi
    
    # Verificar configuración
    nginx -t &>/dev/null
    if [ $? -eq 0 ]; then
        echo "✅ Configuración válida"
    else
        echo "❌ Error en configuración"
    fi
else
    echo "❌ Configuración no existe"
fi
echo ""

# Verificar procesos PM2
echo "🚀 PROCESOS PM2:"
if command -v pm2 &> /dev/null; then
    if sudo -u apkstore pm2 list 2>/dev/null | grep -q "apkstore"; then
        echo "✅ Aplicación ejecutándose en PM2"
        sudo -u apkstore pm2 list
    else
        echo "❌ Aplicación no encontrada en PM2"
    fi
else
    echo "❌ PM2 no instalado"
fi
echo ""

# Verificar firewall
echo "🔥 FIREWALL:"
if command -v ufw &> /dev/null; then
    echo "Estado: $(ufw status | head -1)"
    echo "Puerto 22: $(ufw status | grep 22 || echo 'No configurado')"
    echo "Puerto 8080: $(ufw status | grep 8080 || echo 'No configurado')"
    echo "Puerto 443: $(ufw status | grep 443 || echo 'No configurado')"
else
    echo "❌ UFW no instalado"
fi
echo ""

# Verificar logs de error
echo "📝 LOGS RECIENTES:"
if [ -f "/var/log/nginx/store.jhservices.com.ar.error.log" ]; then
    echo "Últimos errores de Nginx:"
    tail -5 /var/log/nginx/store.jhservices.com.ar.error.log 2>/dev/null || echo "Sin errores"
else
    echo "❌ Log de Nginx no existe"
fi
echo ""

# Conectividad
echo "🌐 CONECTIVIDAD:"
echo "Localhost:8080: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:8080 2>/dev/null || echo 'Error')"
echo "127.0.0.1:3002: $(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3002/api/health 2>/dev/null || echo 'Error')"
echo ""

echo "✅ Diagnóstico completado"
echo ""
echo "📋 PRÓXIMOS PASOS:"
echo "1. Si hay errores, usa: curl -sSL https://raw.githubusercontent.com/JJSecureVPN/StoreAPK/main/cleanup.sh | bash"
echo "2. Luego instala: curl -sSL https://raw.githubusercontent.com/JJSecureVPN/StoreAPK/main/install.sh | bash"
echo "3. Si solo Nginx falla: curl -sSL https://raw.githubusercontent.com/JJSecureVPN/StoreAPK/main/fix-nginx.sh | bash"
