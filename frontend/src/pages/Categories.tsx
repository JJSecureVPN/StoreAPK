import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Download, Heart, Grid, List } from 'lucide-react';
import { appsAPI } from '../services/api';
import type { App } from '../types';

// Definir categorías disponibles
const predefinedCategories = [
  {
    id: 'Comunicación',
    name: 'Comunicación',
    description: 'Mensajería, llamadas y redes sociales',
    icon: '�',
    color: 'from-blue-500 to-purple-600'
  },
  {
    id: 'Entretenimiento',
    name: 'Entretenimiento',
    description: 'Videos, música y diversión',
    icon: '🎭',
    color: 'from-red-500 to-pink-600'
  },
  {
    id: 'Herramientas',
    name: 'Herramientas',
    description: 'Utilidades y productividad',
    icon: '🛠️',
    color: 'from-green-500 to-teal-600'
  },
  {
    id: 'Juegos',
    name: 'Juegos',
    description: 'Diversión y entretenimiento',
    icon: '🎮',
    color: 'from-purple-500 to-indigo-600'
  },
  {
    id: 'Multimedia',
    name: 'Multimedia',
    description: 'Fotos, videos y edición',
    icon: '🎵',
    color: 'from-orange-500 to-red-600'
  },
  {
    id: 'Educación',
    name: 'Educación',
    description: 'Aprendizaje y conocimiento',
    icon: '📚',
    color: 'from-indigo-500 to-blue-600'
  },
  {
    id: 'Otras',
    name: 'Otras',
    description: 'Aplicaciones diversas',
    icon: '📱',
    color: 'from-gray-500 to-gray-600'
  }
];

const Categories = () => {
  const [apps, setApps] = useState<App[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generar categorías dinámicamente basadas en las apps
  const getAvailableCategories = () => {
    const appCategories = [...new Set(apps.map(app => app.category || 'Otras'))];
    return predefinedCategories.filter(cat => appCategories.includes(cat.id));
  };

  const categories = getAvailableCategories();

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const data = await appsAPI.getAllApps();
        setApps(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching apps:', error);
        setError('Error al cargar las aplicaciones');
      } finally {
        setLoading(false);
      }
    };

    fetchApps();
  }, []);

  const getAppsForCategory = (categoryId: string) => {
    return apps.filter(app => (app.category || 'Otras') === categoryId);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Cargando categorías...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-primary-100 to-primary-300 bg-clip-text text-transparent mb-4">
          Explorar por Categorías
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Descubre aplicaciones organizadas por categorías para encontrar exactamente lo que necesitas
        </p>
      </div>

      {selectedCategory ? (
        /* Vista de categoría específica */
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 mb-8">
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-primary-400 hover:text-primary-300 transition-colors duration-200"
            >
              Categorías
            </button>
            <span className="text-gray-500">/</span>
            <span className="text-white font-medium">
              {categories.find(cat => cat.id === selectedCategory)?.name}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold text-white">
                {categories.find(cat => cat.id === selectedCategory)?.name}
              </h2>
              <span className="px-3 py-1 bg-primary-500/20 text-primary-300 rounded-full text-sm font-medium">
                {getAppsForCategory(selectedCategory).length} apps
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-200 text-gray-400 hover:text-white hover:bg-dark-100'
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  viewMode === 'list'
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-200 text-gray-400 hover:text-white hover:bg-dark-100'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Apps Grid/List */}
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {getAppsForCategory(selectedCategory).map((app) => (
              <Link
                key={app.id}
                to={`/app/${app.id}`}
                className={`group block ${
                  viewMode === 'grid'
                    ? 'bg-dark-200/40 border border-primary-500/20 rounded-2xl p-6 hover:border-primary-500/40 hover:bg-dark-200/60 transition-all duration-300'
                    : 'bg-dark-200/40 border border-primary-500/20 rounded-xl p-4 hover:border-primary-500/40 hover:bg-dark-200/60 transition-all duration-300 flex items-center space-x-4'
                }`}
              >
                <div className={`${viewMode === 'list' ? 'flex-shrink-0' : ''}`}>
                  <img
                    src={app.logo_url}
                    alt={app.name}
                    className={`${
                      viewMode === 'grid' ? 'w-16 h-16 mx-auto mb-4' : 'w-12 h-12'
                    } rounded-2xl object-cover`}
                  />
                </div>
                
                <div className={`${viewMode === 'list' ? 'flex-1 min-w-0' : 'text-center'}`}>
                  <h3 className={`font-semibold text-white group-hover:text-primary-300 transition-colors duration-200 ${
                    viewMode === 'list' ? 'text-lg truncate' : 'text-lg mb-2'
                  }`}>
                    {app.name}
                  </h3>
                  
                  <p className={`text-gray-400 text-sm ${
                    viewMode === 'grid' ? 'mb-4 line-clamp-2' : 'truncate mb-2'
                  }`}>
                    {app.short_description}
                  </p>
                  
                  <div className={`flex items-center ${
                    viewMode === 'grid' ? 'justify-center space-x-4' : 'space-x-6'
                  } text-xs text-gray-500`}>
                    <div className="flex items-center space-x-1">
                      <Download className="h-3 w-3" />
                      <span>{formatNumber(app.downloads)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="h-3 w-3" />
                      <span>{formatNumber(app.likes)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {getAppsForCategory(selectedCategory).length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No hay aplicaciones en esta categoría aún.</p>
            </div>
          )}
        </div>
      ) : (
        /* Vista de todas las categorías */
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => {
              const appCount = getAppsForCategory(category.id).length;
              
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className="group relative bg-dark-200/40 border border-primary-500/20 rounded-2xl p-6 hover:border-primary-500/40 hover:bg-dark-200/60 transition-all duration-300 text-left"
                >
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>
                  
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="text-4xl mb-4">{category.icon}</div>
                    
                    {/* Category info */}
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-300 transition-colors duration-200">
                      {category.name}
                    </h3>
                    
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {category.description}
                    </p>
                    
                    {/* App count */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {appCount} {appCount === 1 ? 'app' : 'apps'}
                      </span>
                      <div className="w-6 h-6 rounded-full bg-primary-500/20 group-hover:bg-primary-500/30 transition-colors duration-200 flex items-center justify-center">
                        <span className="text-xs text-primary-400">→</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
