# 🚀 APK Store - Instrucciones de Despliegue Automático

## 📋 Resumen del Proyecto

Tu **APK Store** completo está listo con:

- ✅ **Frontend**: React 18 + TypeScript + TailwindCSS v3.4
- ✅ **Backend**: Node.js + Express + TypeScript + Sistema de archivos
- ✅ **Panel Admin**: `/admin-jhservices-private` para subir aplicaciones
- ✅ **Datos Mock**: Sistema de respaldo sin base de datos
- ✅ **Despliegue Automático**: Scripts de Git a producción

---

## 🚀 Instalación Automática (¡FÁCIL!)

### 1️⃣ Ejecuta el Setup Automático

```bash
bash setup-git.sh
```

Este script te guiará paso a paso para:
- ✅ Inicializar Git
- ✅ Configurar GitHub
- ✅ Generar comandos de instalación automática

### 2️⃣ Crear Repositorio en GitHub

1. Ve a: https://github.com/new
2. Nombre: `apk-store`
3. Descripción: `Complete Play Store clone with React + Node.js`
4. **NO** inicializar con README
5. Crear repositorio

### 3️⃣ Subir Código a GitHub

```bash
git remote add origin https://github.com/TU_USUARIO/apk-store.git
git branch -M main
git push -u origin main
```

### 4️⃣ Instalar en VPS (¡UN SOLO COMANDO!)

En tu VPS, ejecuta como **root**:

```bash
curl -sSL https://raw.githubusercontent.com/TU_USUARIO/apk-store/main/install.sh | bash
```

---

## 🌐 URLs Finales

- **🏠 Frontend**: https://store.jhservices.com.ar
- **🔒 Admin Panel**: https://store.jhservices.com.ar/admin-jhservices-private  
- **📊 API Health**: https://store.jhservices.com.ar/api/health

---

## 🔧 Post-Instalación

### Configurar DNS
Apunta `store.jhservices.com.ar` a la IP de tu VPS

### Configurar SSL
```bash
sudo certbot --nginx -d store.jhservices.com.ar
```

### Cambiar Contraseña Admin
Por defecto: `admin123` (¡cámbiala!)

---

## 🛠️ Comandos de Mantenimiento

```bash
# Ver estado de la aplicación
sudo -u apkstore pm2 status

# Ver logs en tiempo real
sudo -u apkstore pm2 logs

# Actualizar desde Git
sudo -u apkstore bash /var/www/apkstore/update-vps.sh

# Reiniciar aplicación
sudo -u apkstore pm2 restart all

# Crear backup
bash /var/www/apkstore/backup.sh
```

---

## 📁 Estructura del Proyecto

```
apk-store/
├── 📱 frontend/          # React + TypeScript + TailwindCSS
├── 🖥️  backend/           # Node.js + Express + TypeScript
├── 📋 docs/              # Documentación técnica
├── 🚀 setup-git.sh       # Script de setup automático
├── 🔧 install.sh         # Instalación automática en VPS
├── 🔄 update-vps.sh      # Actualizaciones automáticas
├── 🌐 nginx-config.conf  # Configuración Nginx
└── 📊 ecosystem.config.js # Configuración PM2
```

---

## 🎯 Características Implementadas

### ✅ Frontend Features
- 📱 Listado de aplicaciones con grid responsivo
- 🔍 Búsqueda y filtros avanzados
- 👍 Sistema de likes
- 💬 Comentarios y reseñas
- 📱 Vista de detalles completa
- 🎨 Dark/Light mode
- 📱 Mobile-first responsive

### ✅ Backend Features
- 🔌 API RESTful completa
- 📂 Sistema de subida de archivos
- 🔒 Validación de datos
- 💾 Sistema de respaldo sin BD
- 🚦 Health checks
- 📊 Logs estructurados

### ✅ Panel Admin
- 🔐 Login protegido
- 📤 Subida de aplicaciones (.apk)
- 🖼️ Subida de capturas
- ✏️ Editor de metadatos
- 📊 Dashboard de estadísticas

### ✅ DevOps Features
- 🚀 Instalación automática
- 🔄 Actualizaciones con Git
- 📦 PM2 process management
- 🌐 Nginx reverse proxy
- 🔐 SSL con Let's Encrypt
- 💾 Sistema de backups

---

## 🆘 Soporte

- 📧 **Email**: contacto@jhservices.com.ar
- 🌐 **Web**: https://jhservices.com.ar
- 📱 **WhatsApp**: +54 9 XXX XXX XXXX

---

## 📄 Licencia

MIT License - Libre para uso comercial y personal.

---

**¡Tu APK Store está listo para conquistar el mundo! 🚀**
