import { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
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
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary-600" />
          <p className="mt-2 text-gray-600">Cargando aplicaciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto text-red-600 mb-2" />
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadApps}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Descubre las mejores apps Android
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Explora, descarga y disfruta de una amplia colección de aplicaciones Android seguras y verificadas.
        </p>
      </div>

      {/* Apps Grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Aplicaciones populares
          </h2>
          <span className="text-sm text-gray-500">
            {apps.length} aplicaciones disponibles
          </span>
        </div>

        {apps.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay aplicaciones disponibles por el momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {apps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        )}
      </div>

      {/* Categories Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mt-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Categorías populares</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Juegos', icon: '🎮', count: 0 },
            { name: 'Productividad', icon: '💼', count: 0 },
            { name: 'Entretenimiento', icon: '🎬', count: 0 },
            { name: 'Educación', icon: '📚', count: 0 },
          ].map((category) => (
            <div
              key={category.name}
              className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">{category.icon}</div>
                <h4 className="font-medium text-gray-900">{category.name}</h4>
                <p className="text-sm text-gray-500">{category.count} apps</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
