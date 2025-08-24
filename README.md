# 🏪 APK Store - Play Store Clone

Una aplicación web completa tipo Play Store construida con **React + TypeScript + TailwindCSS** en el frontend y **Node.js + Express + TypeScript** en el backend.

![APK Store](https://img.shields.io/badge/Status-Production%20Ready-green)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)

## 🌟 Características

### 📱 Frontend
- ✅ **React 18** con TypeScript y TailwindCSS v3.4
- ✅ **Diseño responsivo** tipo Google Play Store
- ✅ **Sistema de navegación** con React Router
- ✅ **Listado de aplicaciones** con búsqueda y filtros
- ✅ **Página de detalles** con screenshots y comentarios
- ✅ **Sistema de likes** y comentarios interactivos
- ✅ **Panel de administración** privado para gestión

### 🚀 Backend
- ✅ **Node.js + Express** con TypeScript
- ✅ **API RESTful** completa con CRUD
- ✅ **Sistema de uploads** para APKs, iconos y screenshots
- ✅ **Fallback a datos mock** cuando PostgreSQL no está disponible
- ✅ **Configuración CORS** para múltiples orígenes
- ✅ **Middleware de seguridad** (Helmet, Morgan)

### 🔧 DevOps & Producción
- ✅ **PM2** para gestión de procesos
- ✅ **Nginx** configurado como proxy reverso
- ✅ **SSL automático** con Let's Encrypt
- ✅ **Scripts de backup** y mantenimiento
- ✅ **Instalación automática** desde Git

## 🚀 Instalación Rápida en VPS

### Opción 1: Instalación Automática (Recomendada)

```bash
# En tu VPS Ubuntu/Debian como root:
chmod +x install-vps.sh
./install-vps.sh
```

### Opción 2: Instalación Manual

1. **Clonar repositorio:**
```bash
git clone https://github.com/JJSecureVPN/StoreAPK.git
cd StoreAPK
```

2. **Configurar variables de entorno:**
```bash
# Backend
cp backend/.env.example backend/.env
# Editar backend/.env con tus credenciales de PostgreSQL

# Frontend  
cp frontend/.env.example frontend/.env
# Verificar que VITE_API_URL apunte al puerto correcto (3002)
```

3. **Instalar dependencias:**
```bash
# Instalar dependencias del sistema
sudo apt update
sudo apt install -y nodejs npm postgresql postgresql-contrib nginx

# Instalar dependencias del proyecto
cd backend && npm install
cd ../frontend && npm install
```

4. **Configurar base de datos:**
```bash
# Crear usuario y base de datos PostgreSQL
sudo -u postgres createuser --interactive
sudo -u postgres createdb apk_store
```

5. **Desplegar:**
```bash
# Construcción y despliegue automático
./deploy-complete.sh
```

2. **Ejecutar instalación:**
```bash
sudo bash install.sh
```

### 🔐 Configurar SSL

```bash
# Después de configurar DNS
sudo certbot --nginx -d store.jhservices.com.ar
```

## 🖥️ Desarrollo Local

### Prerrequisitos
- Node.js 18+
- npm o yarn

### Instalación
```bash
# Clonar repositorio
git clone https://github.com/TU_USUARIO/apk-store.git
cd apk-store

# Instalar dependencias
npm run install:all

# Ejecutar en desarrollo
npm run dev
```

### URLs de desarrollo:
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3002
- **API Health:** http://localhost:3002/api/health

## 📁 Estructura del Proyecto

```
apk-store/
├── frontend/                 # React + TypeScript + TailwindCSS
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── pages/          # Páginas de la aplicación
│   │   ├── services/       # Servicios API
│   │   └── types/          # Tipos TypeScript
│   └── package.json
├── backend/                 # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── controllers/    # Controladores de rutas
│   │   ├── routes/         # Definición de rutas
│   │   ├── config/         # Configuración (DB, etc.)
│   │   ├── models/         # Tipos e interfaces
│   │   └── data/           # Datos mock
│   └── package.json
├── uploads/                 # Archivos subidos (APKs, imágenes)
├── scripts/                 # Scripts de despliegue y mantenimiento
└── docs/                    # Documentación adicional
```

## 🌐 URLs de Producción

- **🏠 Frontend:** https://store.jhservices.com.ar
- **🔒 Panel Admin:** https://store.jhservices.com.ar/admin-jhservices-private
- **📊 API Health:** https://store.jhservices.com.ar/api/health

### 🔑 Credenciales Admin
- **URL:** `/admin-jhservices-private`
- **Contraseña:** `jhservices2025!`

> ⚠️ **Importante:** Cambiar la contraseña en `frontend/src/pages/Admin.tsx` antes del despliegue en producción.

## 📊 API Endpoints

### Aplicaciones
- `GET /api/apps` - Listar todas las aplicaciones
- `GET /api/apps/:id` - Obtener detalles de una aplicación
- `POST /api/apps` - Crear nueva aplicación
- `POST /api/apps/:id/like` - Toggle like en aplicación
- `POST /api/apps/:id/comments` - Agregar comentario
- `POST /api/apps/:id/download` - Registrar descarga

### Uploads
- `POST /api/upload/app` - Subir archivos de aplicación
- `DELETE /api/upload/:type/:filename` - Eliminar archivo

### Sistema
- `GET /api/health` - Estado del sistema

## 🛠️ Comandos Útiles

### Desarrollo
```bash
npm run dev              # Ejecutar frontend y backend
npm run dev:frontend     # Solo frontend
npm run dev:backend      # Solo backend
npm run build           # Construir para producción
```

### Producción
```bash
# Ver estado de la aplicación
sudo -u apkstore pm2 status

# Ver logs en tiempo real
sudo -u apkstore pm2 logs

# Reiniciar aplicación
sudo -u apkstore pm2 restart apkstore-backend

# Actualizar desde Git
bash /var/www/apkstore/update.sh

# Crear backup
bash /var/www/apkstore/backup.sh
```

## Despliegue en VPS

### 1. Configuración del servidor

```bash
# Actualizar el sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib

# Instalar PM2 para gestión de procesos
sudo npm install -g pm2
```

### 2. Configuración de PostgreSQL

```bash
sudo su - postgres
psql
CREATE DATABASE apk_store;
CREATE USER apk_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE apk_store TO apk_user;
\\q
exit
```

### 3. Configuración de Nginx

```nginx
server {
    listen 80;
    server_name store.jhservices.com.ar;

    # Frontend
    location / {
        root /var/www/apk-store/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads
    location /uploads/ {
        root /var/www/apk-store;
        expires 1y;
        add_header Cache-Control \"public, immutable\";
    }
}
```

### 4. Configuración de variables de entorno

```bash
# /var/www/apk-store/backend/.env
DB_USER=apk_user
DB_HOST=localhost
DB_NAME=apk_store
DB_PASSWORD=secure_password
DB_PORT=5432
PORT=3002
NODE_ENV=production
FRONTEND_URL=https://store.jhservices.com.ar
```

### 5. Despliegue con PM2

```bash
# Compilar el proyecto
npm run build

# Crear archivo de configuración PM2
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'apk-store-backend',
    script: './backend/dist/index.js',
    cwd: '/var/www/apk-store',
    env: {
      NODE_ENV: 'production'
    }
  }]
}
EOF

# Iniciar con PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Tecnologías utilizadas

### Frontend
- React 18
- TypeScript
- TailwindCSS v3.4
- Vite
- React Router DOM
- Axios
- Lucide React (iconos)

### Backend
- Node.js
- Express
- TypeScript
- PostgreSQL
- Multer (upload de archivos)
- Helmet (seguridad)
- CORS
- Morgan (logging)

## Estructura de la base de datos

### Tabla `apps`
- Información básica de las aplicaciones
- Contadores de descargas y likes
- URLs de archivos

### Tabla `screenshots`
- Capturas de pantalla de cada aplicación
- Relación con `apps`

### Tabla `comments`
- Comentarios de usuarios
- Solo requiere nombre temporal

### Tabla `user_likes`
- Registro de likes por usuario/IP
- Previene likes duplicados

### Tabla `downloads`
- Registro de descargas
- Tracking de IP y User-Agent

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -am 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Crea un Pull Request

## Licencia

MIT License - ver archivo LICENSE para más detalles.

## Soporte

Para soporte técnico o consultas:
- Email: soporte@jhservices.com.ar
- Website: https://jhservices.com.ar
