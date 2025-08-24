module.exports = {
  apps: [
    {
      name: 'apkstore-backend',
      script: './backend/dist/index.js',
      cwd: '/var/www/apkstore',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
        FRONTEND_URL: 'https://store.jhservices.com.ar'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3002,
        FRONTEND_URL: 'https://store.jhservices.com.ar'
      },
      error_file: '/var/log/apkstore/backend-error.log',
      out_file: '/var/log/apkstore/backend-out.log',
      log_file: '/var/log/apkstore/backend.log',
      time: true,
      watch: false,
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 5,
      autorestart: true
    }
  ]
};
