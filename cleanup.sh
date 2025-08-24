#!/bin/bash

# 🧹 APK Store - Script de Limpieza para Reinstalación
# ===================================================

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🧹 APK Store - Limpieza para Reinstalación${NC}"
echo "=================================================="
echo ""

# Detener servicios
echo -e "${YELLOW}🛑 Deteniendo servicios...${NC}"
systemctl stop nginx 2>/dev/null || true
sudo -u apkstore pm2 stop all 2>/dev/null || true
sudo -u apkstore pm2 delete all 2>/dev/null || true

# Remover directorio de aplicación
echo -e "${YELLOW}📁 Removiendo directorio de aplicación...${NC}"
rm -rf /var/www/apkstore

# Remover usuario apkstore
echo -e "${YELLOW}👤 Removiendo usuario apkstore...${NC}"
userdel -r apkstore 2>/dev/null || true

# Remover configuración de Nginx
echo -e "${YELLOW}🌐 Removiendo configuración de Nginx...${NC}"
rm -f /etc/nginx/sites-available/apkstore
rm -f /etc/nginx/sites-enabled/apkstore
systemctl reload nginx 2>/dev/null || true

# Limpiar Node.js
echo -e "${YELLOW}📦 Limpiando instalación de Node.js...${NC}"
npm uninstall -g pm2 2>/dev/null || true
apt-get remove -y nodejs npm 2>/dev/null || true
rm -f /usr/bin/node /usr/bin/npm /usr/bin/npx
rm -rf /usr/local/bin/node /usr/local/bin/npm /usr/local/bin/npx
rm -rf /usr/local/lib/node_modules

echo ""
echo -e "${GREEN}✅ Limpieza completada!${NC}"
echo ""
echo -e "${YELLOW}📋 Ahora puedes ejecutar nuevamente:${NC}"
echo "curl -sSL https://raw.githubusercontent.com/JJSecureVPN/StoreAPK/main/install.sh | bash"
echo ""
