import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, Download, Star, TrendingUp, Shield, Zap } from 'lucide-react';
import AppCard from '../components/AppCard.tsx';
import { appsAPI } from '../services/api.js';
import type { App } from '../types/index.js';

const Home = () => {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await appsAPI.getAllApps();
      setApps(data);
    } catch (err) {
      console.error('Error loading apps:', err);
      setError('Error al cargar las aplicaciones. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary-500" />
            <div className="absolute inset-0 h-12 w-12 mx-auto border-2 border-primary-500/20 rounded-full animate-pulse-glow"></div>
          </div>
          <p className="mt-4 text-dark-600 font-medium">Cargando aplicaciones...</p>
          <div className="mt-2 flex justify-center space-x-1">
            <div className="h-2 w-2 bg-primary-500 rounded-full animate-bounce"></div>
            <div className="h-2 w-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="h-2 w-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-dark-100/50 backdrop-blur-sm border border-red-500/20 rounded-2xl p-8 shadow-glow">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <p className="text-dark-600 mb-6 text-lg">{error}</p>
          <button
            onClick={loadApps}
            className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-glow"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Hero Section */}
      <div className="text-center mb-16 animate-fade-in">
        <div className="relative">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-primary-200 to-accent-300 bg-clip-text text-transparent mb-6 leading-tight">
            Descubre el Futuro
            <br />
            <span className="text-primary-400">de las Apps Android</span>
          </h1>
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full animate-pulse-glow"></div>
        </div>
        <p className="text-xl text-dark-500 max-w-3xl mx-auto leading-relaxed mt-6">
          Explora, descarga y disfruta de una amplia colección de aplicaciones Android 
          <span className="text-primary-400 font-semibold"> seguras y verificadas</span> con la última tecnología.
        </p>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-2xl mx-auto">
          <div className="bg-dark-100/30 backdrop-blur-sm border border-primary-500/20 rounded-xl p-6 text-center hover:border-primary-500/40 transition-all duration-300 group">
            <Download className="h-8 w-8 mx-auto text-primary-500 mb-2 group-hover:animate-bounce" />
            <div className="text-2xl font-bold text-white">1000+</div>
            <div className="text-dark-500 text-sm">Descargas</div>
          </div>
          <div className="bg-dark-100/30 backdrop-blur-sm border border-accent-500/20 rounded-xl p-6 text-center hover:border-accent-500/40 transition-all duration-300 group">
            <Shield className="h-8 w-8 mx-auto text-accent-500 mb-2 group-hover:animate-bounce" />
            <div className="text-2xl font-bold text-white">100%</div>
            <div className="text-dark-500 text-sm">Seguras</div>
          </div>
          <div className="bg-dark-100/30 backdrop-blur-sm border border-primary-400/20 rounded-xl p-6 text-center hover:border-primary-400/40 transition-all duration-300 group">
            <Star className="h-8 w-8 mx-auto text-yellow-500 mb-2 group-hover:animate-bounce" />
            <div className="text-2xl font-bold text-white">4.8</div>
            <div className="text-dark-500 text-sm">Rating</div>
          </div>
        </div>
      </div>

      {/* Featured Apps Section */}
      <div className="mb-12 animate-slide-up">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-8 w-8 text-primary-500" />
            <h2 className="text-3xl font-bold text-white">
              Aplicaciones Destacadas
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-accent-500" />
            <span className="text-dark-500 bg-dark-100/30 backdrop-blur-sm border border-primary-500/20 rounded-full px-4 py-2 text-sm font-medium">
              {apps.length} disponibles
            </span>
          </div>
        </div>

        {apps.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-dark-100/30 backdrop-blur-sm border border-primary-500/20 rounded-2xl p-12 max-w-md mx-auto">
              <div className="h-16 w-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="h-8 w-8 text-primary-500" />
              </div>
              <p className="text-dark-500 text-lg">No hay aplicaciones disponibles por el momento.</p>
              <p className="text-dark-600 text-sm mt-2">¡Vuelve pronto para descubrir nuevas apps!</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {apps.map((app, index) => (
              <div
                key={app.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <AppCard app={app} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Categories Section */}
      <div className="bg-dark-100/20 backdrop-blur-sm border border-primary-500/10 rounded-2xl p-8 mt-16 animate-fade-in">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-white mb-2">Explora por Categorías</h3>
          <p className="text-dark-500">Encuentra exactamente lo que necesitas</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: 'Juegos', icon: '🎮', count: 0, color: 'from-purple-500 to-pink-500' },
            { name: 'Productividad', icon: '💼', count: 0, color: 'from-blue-500 to-cyan-500' },
            { name: 'Entretenimiento', icon: '🎬', count: 0, color: 'from-orange-500 to-red-500' },
            { name: 'Educación', icon: '📚', count: 0, color: 'from-green-500 to-emerald-500' },
          ].map((category, index) => (
            <div
              key={category.name}
              className="group relative p-6 bg-dark-100/30 backdrop-blur-sm border border-primary-500/20 rounded-xl hover:border-primary-500/50 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-glow"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300`}></div>
              <div className="relative text-center">
                <div className="text-3xl mb-3 group-hover:animate-bounce">{category.icon}</div>
                <h4 className="font-semibold text-white mb-1">{category.name}</h4>
                <p className="text-sm text-dark-500">{category.count} apps</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
