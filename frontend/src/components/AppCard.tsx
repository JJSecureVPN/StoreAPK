import { Link } from 'react-router-dom';
import { Download, Heart, Star } from 'lucide-react';
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
    <div className="app-card bg-white rounded-lg shadow-md overflow-hidden">
      <Link to={`/app/${app.id}`}>
        <div className="p-4">
          {/* App Logo and Basic Info */}
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <img
                src={app.logo_url || '/placeholder-icon.png'}
                alt={app.name}
                className="w-16 h-16 rounded-xl object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Crect x="3" y="3" width="18" height="18" rx="2" ry="2"/%3E%3Ccircle cx="9" cy="9" r="2"/%3E%3Cpath d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/%3E%3C/svg%3E';
                }}
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {app.name}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                {app.short_description || 'Sin descripción disponible'}
              </p>
              
              {/* Version and Size */}
              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                {app.version && (
                  <span>v{app.version}</span>
                )}
                {app.size_mb && (
                  <span>{app.size_mb} MB</span>
                )}
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Download className="h-4 w-4" />
                <span>{formatDownloads(app.downloads)}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Heart className="h-4 w-4" />
                <span>{app.likes}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span>4.5</span>
              </div>
            </div>
            
            <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Ver más
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default AppCard;
