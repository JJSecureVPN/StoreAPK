#!/bin/bash

# Script completo de preparación y instrucciones para despliegue
# APK Store en store.jhservices.com.ar

echo "🚀 APK Store - Preparación para Despliegue"
echo "=========================================="
echo ""

# Verificar que estamos en la raíz del proyecto
if [ ! -f "package.json" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "❌ Error: Ejecuta este script desde la raíz del proyecto APK Store"
    exit 1
fi

echo "📋 PASO 1: Preparando archivos localmente..."
echo "============================================"

# Ejecutar script de preparación
if [ -f "prepare-deploy.sh" ]; then
    bash prepare-deploy.sh
else
    echo "❌ Archivo prepare-deploy.sh no encontrado"
    exit 1
fi

echo ""
echo "✅ Archivos preparados correctamente!"
echo ""
echo "📋 PASO 2: Instrucciones para el VPS"
echo "===================================="
echo ""
echo "🔧 En tu VPS, ejecuta los siguientes comandos:"
echo ""
echo "# 1. Instalar dependencias del sistema"
echo "sudo bash install-vps.sh"
echo ""
echo "# 2. Subir el archivo de la aplicación"
echo "sudo su - apkstore"
echo "cd /var/www/apkstore"
echo "wget https://tu-servidor-temporal.com/apkstore-deploy.tar.gz"
echo "# O usar scp desde tu máquina:"
echo "# scp apkstore-deploy.tar.gz root@TU_IP_VPS:/var/www/apkstore/"
echo ""
echo "# 3. Desplegar la aplicación"
echo "bash deploy-app.sh"
echo ""
echo "# 4. Configurar SSL"
echo "sudo certbot --nginx -d store.jhservices.com.ar"
echo ""
echo "📋 PASO 3: URLs después del despliegue"
echo "======================================"
echo ""
echo "🌐 Frontend: https://store.jhservices.com.ar"
echo "🔒 Admin Panel: https://store.jhservices.com.ar/admin-jhservices-private"
echo "📊 API Health: https://store.jhservices.com.ar/api/health"
echo ""
echo "📋 PASO 4: Credenciales del Panel Admin"
echo "======================================="
echo ""
echo "🔑 URL: https://store.jhservices.com.ar/admin-jhservices-private"
echo "🔑 Contraseña: jhservices2025!"
echo ""
echo "⚠️  IMPORTANTE: Cambia la contraseña en frontend/src/pages/Admin.tsx"
echo ""
echo "📋 PASO 5: Funcionalidades disponibles"
echo "======================================"
echo ""
echo "✅ Listado de aplicaciones con datos mock"
echo "✅ Detalles de cada aplicación"
echo "✅ Sistema de likes y comentarios"
echo "✅ Panel de administración para subir APKs"
echo "✅ Sistema de uploads de archivos"
echo "✅ Configuración SSL automática"
echo "✅ Fallback cuando PostgreSQL no está disponible"
echo ""
echo "📋 PASO 6: Configuración opcional de PostgreSQL"
echo "=============================================="
echo ""
echo "Si deseas usar PostgreSQL en lugar de datos mock:"
echo ""
echo "sudo apt install postgresql postgresql-contrib -y"
echo "sudo -u postgres createuser apkstore_user"
echo "sudo -u postgres createdb apk_store"
echo "sudo -u postgres psql -c \"ALTER USER apkstore_user PASSWORD 'tu_password_seguro';\""
echo ""
echo "Luego edita /var/www/apkstore/backend/.env y descomenta las líneas de PostgreSQL"
echo ""
echo "📋 PASO 7: Comandos útiles para mantenimiento"
echo "==========================================="
echo ""
echo "# Ver estado de la aplicación"
echo "pm2 status"
echo ""
echo "# Ver logs en tiempo real"
echo "pm2 logs apkstore-backend"
echo ""
echo "# Reiniciar aplicación"
echo "pm2 restart apkstore-backend"
echo ""
echo "# Ver logs de Nginx"
echo "sudo tail -f /var/log/nginx/store.jhservices.com.ar.access.log"
echo ""
echo "# Backup de la aplicación"
echo "bash backup.sh"
echo ""
echo "🎉 ¡APK Store listo para despliegue!"
echo ""
echo "📞 ¿Necesitas ayuda? Revisa el archivo deploy-guide.md"
echo ""

# Mostrar información del archivo generado
if [ -f "apkstore-deploy.tar.gz" ]; then
    echo "📦 Archivo de despliegue creado:"
    echo "   Nombre: apkstore-deploy.tar.gz"
    echo "   Tamaño: $(du -h apkstore-deploy.tar.gz | cut -f1)"
    echo ""
fi

echo "🚀 ¡Listo para subir a store.jhservices.com.ar!"
