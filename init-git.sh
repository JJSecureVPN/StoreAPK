#!/bin/bash

# 🚀 Script de inicialización de Git para APK Store
# =================================================

echo "🚀 Inicializando repositorio Git para APK Store..."

# Verificar que estamos en la raíz del proyecto
if [ ! -f "package.json" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "❌ Error: Ejecuta este script desde la raíz del proyecto APK Store"
    exit 1
fi

# Inicializar Git si no existe
if [ ! -d ".git" ]; then
    echo "📁 Inicializando repositorio Git..."
    git init
else
    echo "📁 Repositorio Git ya existe"
fi

# Crear archivos necesarios para Git
echo "📝 Creando archivos de configuración..."

# Crear .gitattributes si no existe
if [ ! -f ".gitattributes" ]; then
    cat > .gitattributes << 'EOF'
# Auto detect text files and perform LF normalization
* text=auto

# Binary files
*.png binary
*.jpg binary
*.jpeg binary
*.gif binary
*.webp binary
*.ico binary
*.svg binary
*.woff binary
*.woff2 binary
*.ttf binary
*.eot binary
*.apk binary
*.zip binary
*.tar.gz binary
EOF
    echo "✅ .gitattributes creado"
fi

# Crear LICENSE si no existe
if [ ! -f "LICENSE" ]; then
    cat > LICENSE << 'EOF'
MIT License

Copyright (c) 2025 JH Services

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF
    echo "✅ LICENSE creado"
fi

# Configurar Git (si no está configurado)
if [ -z "$(git config --global user.name)" ]; then
    echo "⚙️ Configurando Git..."
    echo "Ingresa tu nombre:"
    read -r git_name
    echo "Ingresa tu email:"
    read -r git_email
    
    git config --global user.name "$git_name"
    git config --global user.email "$git_email"
    echo "✅ Git configurado"
fi

# Agregar archivos al staging
echo "📦 Agregando archivos al repositorio..."
git add .

# Verificar que tenemos cambios
if git diff --staged --quiet; then
    echo "⚠️ No hay cambios para commitear"
else
    # Hacer commit inicial
    echo "💾 Haciendo commit inicial..."
    git commit -m "🎉 Initial commit: APK Store - Complete Play Store clone

    ✨ Features:
    - React + TypeScript + TailwindCSS frontend
    - Node.js + Express + TypeScript backend  
    - Complete CRUD API with mock data fallback
    - File upload system for APKs and images
    - Admin panel for app management
    - PM2 + Nginx production configuration
    - Automated VPS deployment script
    - SSL configuration with Let's Encrypt
    
    🚀 Ready for deployment to store.jhservices.com.ar"
fi

echo ""
echo "🎉 ¡Repositorio Git inicializado correctamente!"
echo ""
echo "📋 Próximos pasos:"
echo ""
echo "1. 📤 Crear repositorio en GitHub:"
echo "   - Ve a https://github.com/new"
echo "   - Nombre: apk-store"
echo "   - Descripción: Complete Play Store clone with React + Node.js"
echo "   - Público o Privado (según prefieras)"
echo ""
echo "2. 🔗 Conectar con repositorio remoto:"
echo "   git remote add origin https://github.com/TU_USUARIO/apk-store.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. ⚡ Actualizar URL en install.sh:"
echo "   Edita 'install.sh' y cambia:"
echo "   REPO_URL=\"https://github.com/TU_USUARIO/apk-store.git\""
echo ""
echo "4. 🚀 Desplegar en VPS:"
echo "   curl -sSL https://raw.githubusercontent.com/TU_USUARIO/apk-store/main/install.sh | bash"
echo ""
echo "📊 Archivos en el repositorio:"
git ls-files | head -20
echo ""
echo "🎯 ¡Listo para subir a GitHub y desplegar!"
