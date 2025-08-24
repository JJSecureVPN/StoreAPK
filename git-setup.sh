#!/bin/bash

# Script para configurar Git remote y hacer push
# Uso: ./setup-git.sh <URL_DEL_REPOSITORIO>

if [ -z "$1" ]; then
    echo "❌ Error: Debes proporcionar la URL del repositorio"
    echo "📝 Uso: ./setup-git.sh <URL_DEL_REPOSITORIO>"
    echo "📝 Ejemplo: ./setup-git.sh https://github.com/usuario/StoreAPK.git"
    exit 1
fi

REPO_URL="$1"

echo "🔧 Configurando repositorio Git..."

# Añadir remote origin
git remote add origin "$REPO_URL"

echo "✅ Remote origin añadido: $REPO_URL"

# Verificar remotes
echo "📋 Repositorios remotos configurados:"
git remote -v

# Hacer push de la rama main
echo "🚀 Haciendo push al repositorio..."
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    echo "✅ ¡Push realizado exitosamente!"
    echo "🌐 Tu repositorio está disponible en: $REPO_URL"
    echo ""
    echo "📋 Próximos pasos para VPS:"
    echo "1️⃣  git clone $REPO_URL"
    echo "2️⃣  cd StoreAPK-main"
    echo "3️⃣  chmod +x install-vps.sh"
    echo "4️⃣  ./install-vps.sh"
else
    echo "❌ Error al hacer push. Verifica:"
    echo "   - Que tengas permisos en el repositorio"
    echo "   - Que la URL sea correcta"
    echo "   - Que hayas configurado tu autenticación Git"
fi
