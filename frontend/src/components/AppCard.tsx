import { Link } from 'react-router-dom';
import { Download, Heart, Shield, Zap } from 'lucide-react';
import type { App } from '../types/index.js';

interface AppCardProps {
  app: App;
}

const AppCard = ({ app }: AppCardProps) => {
  const formatDownloads = (downloads: number) => {
    if (downloads >= 1000000) {
      return `${(downloads / 1000000).toFixed(1)}M`;
    } else if (downloads >= 1000) {
      return `${(downloads / 1000).toFixed(1)}K`;
    }
    return downloads.toString();
  };

  return (
    <div className="group relative">
      <div className="relative bg-dark-100/50 border border-primary-500/20 rounded-2xl overflow-hidden hover:border-primary-400/40 transition-all duration-200 hover:shadow-lg hover:shadow-primary-500/10">
        <Link to={`/app/${app.id}`} className="block">
          {/* Subtle background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/5 to-accent-900/5"></div>
          
          <div className="relative p-6">
            {/* App Logo and Basic Info */}
            <div className="flex items-start space-x-4 mb-4">
              <div className="relative flex-shrink-0">
                <img
                  src={app.logo_url || '/placeholder-icon.png'}
                  alt={app.name}
                  className="w-16 h-16 rounded-xl object-cover shadow-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Crect x="3" y="3" width="18" height="18" rx="2" ry="2"/%3E%3Ccircle cx="9" cy="9" r="2"/%3E%3Cpath d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/%3E%3C/svg%3E';
                  }}
                />
                {/* Verified Badge */}
                <div className="absolute -top-1 -right-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-1 shadow-lg">
                  <Shield className="h-3 w-3 text-white" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-lg font-bold text-white truncate group-hover:text-primary-300 transition-colors duration-300">
                    {app.name}
                  </h3>
                  <Zap className="h-4 w-4 text-accent-500 opacity-60" />
                </div>
                <p className="text-sm text-white/80 line-clamp-2 leading-relaxed">
                  {app.short_description || 'Aplicación Android innovadora y segura'}
                </p>
                
                {/* Version and Size */}
                <div className="flex items-center space-x-3 mt-3">
                  {app.version && (
                    <span className="bg-primary-500/20 border border-primary-500/30 text-primary-400 px-2 py-1 rounded-lg text-xs font-medium">
                      v{app.version}
                    </span>
                  )}
                  {app.size_mb && (
                    <span className="text-xs text-dark-500 bg-dark-100/30 px-2 py-1 rounded-lg">
                      {app.size_mb} MB
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Stats Bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 text-dark-500">
                  <Download className="h-4 w-4 text-primary-400" />
                  <span className="text-sm font-medium">{formatDownloads(app.downloads)}</span>
                </div>
                
                <div className="flex items-center space-x-1 text-dark-500">
                  <Heart className="h-4 w-4 text-red-400" />
                  <span className="text-sm font-medium">{app.likes}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-1 text-green-400">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium">Activo</span>
              </div>
            </div>
            
            {/* Action Button */}
            <div className="mt-4">
              <button className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-primary-500/25 border border-primary-500/30 hover:border-primary-400/50">
                <span className="flex items-center justify-center space-x-2">
                  <span>Ver Detalles</span>
                  <div className="h-4 w-4 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors duration-300">
                    <div className="h-2 w-2 bg-white rounded-full"></div>
                  </div>
                </span>
              </button>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AppCard;
