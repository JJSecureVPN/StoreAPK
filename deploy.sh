#!/bin/bash

# APK Store Deployment Script
# Para VPS con Ubuntu/Debian

echo "🚀 Iniciando despliegue de APK Store..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funciones de utilidad
print_step() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Verificar si estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    print_error "No se encontró package.json. Ejecuta este script desde la raíz del proyecto."
    exit 1
fi

# 1. Actualizar dependencias
print_step "Instalando dependencias..."
npm run install:all

# 2. Compilar proyectos
print_step "Compilando frontend y backend..."
npm run build

# 3. Crear directorios necesarios
print_step "Creando directorios de uploads..."
mkdir -p uploads/logos uploads/screenshots uploads/apks

# 4. Configurar permisos
print_step "Configurando permisos..."
chmod 755 uploads/
chmod 755 uploads/logos uploads/screenshots uploads/apks

# 5. Verificar configuración de PostgreSQL
if command -v psql >/dev/null 2>&1; then
    print_step "PostgreSQL está instalado"
else
    print_warning "PostgreSQL no está instalado. Instálalo antes de continuar."
    echo "sudo apt install postgresql postgresql-contrib"
fi

# 6. Verificar archivo .env del backend
if [ ! -f "backend/.env" ]; then
    print_warning "No se encontró backend/.env. Copiando desde .env.example..."
    cp backend/.env.example backend/.env
    print_warning "⚠ Configura las variables de entorno en backend/.env"
fi

# 7. Verificar archivo .env del frontend
if [ ! -f "frontend/.env" ]; then
    print_warning "No se encontró frontend/.env. Copiando desde .env.example..."
    cp frontend/.env.example frontend/.env
fi

# 8. Para producción con PM2
if command -v pm2 >/dev/null 2>&1; then
    print_step "PM2 está disponible"
    
    read -p "¿Quieres iniciar el servidor con PM2? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_step "Iniciando servidor con PM2..."
        pm2 start ecosystem.config.js
        pm2 save
        print_step "Servidor iniciado con PM2"
    fi
else
    print_warning "PM2 no está instalado. Para producción, instala PM2: npm install -g pm2"
fi

# 9. Mostrar información final
echo
echo "🎉 Despliegue completado!"
echo
echo "📋 Próximos pasos:"
echo "1. Configura PostgreSQL y crea la base de datos 'apk_store'"
echo "2. Actualiza las variables de entorno en backend/.env"
echo "3. Para desarrollo: npm run dev"
echo "4. Para producción: npm start (o PM2)"
echo
echo "📡 URLs:"
echo "- Frontend: http://localhost:5173 (desarrollo) o puerto configurado"
echo "- Backend API: http://localhost:3001/api"
echo "- Upload (desarrollo): http://localhost:5173/upload/secret-upload-token-2024"
echo
echo "📁 Estructura de uploads creada en ./uploads/"
echo
print_step "¡Listo para usar!"
