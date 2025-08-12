import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Download, Heart, ChevronLeft, Star, MessageCircle, 
  Calendar, Package, HardDrive, Loader2, AlertCircle 
} from 'lucide-react';
import { appsAPI } from '../services/api.js';
import type { AppWithDetails, Comment } from '../types/index.js';

const AppDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [app, setApp] = useState<AppWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [liking, setLiking] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [liked, setLiked] = useState(false);
  
  // Comment form
  const [commentUsername, setCommentUsername] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);

  useEffect(() => {
    if (id) {
      loadApp(parseInt(id));
    }
  }, [id]);

  const loadApp = async (appId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await appsAPI.getAppById(appId);
      setApp(data);
    } catch (err) {
      console.error('Error loading app:', err);
      setError('Error al cargar la aplicación. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!app) return;
    
    try {
      setDownloading(true);
      const response = await appsAPI.downloadApp(app.id);
      
      // Create download link
      const link = document.createElement('a');
      link.href = response.download_url;
      link.download = response.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Update download count
      setApp(prev => prev ? { ...prev, downloads: prev.downloads + 1 } : null);
    } catch (err) {
      console.error('Error downloading app:', err);
      alert('Error al descargar la aplicación. Intenta nuevamente.');
    } finally {
      setDownloading(false);
    }
  };

  const handleLike = async () => {
    if (!app || !commentUsername.trim()) {
      alert('Por favor ingresa tu nombre para dar like');
      return;
    }
    
    try {
      setLiking(true);
      const response = await appsAPI.toggleLike(app.id, commentUsername.trim());
      setLiked(response.liked);
      setApp(prev => prev ? { ...prev, likes: response.likes } : null);
    } catch (err) {
      console.error('Error toggling like:', err);
      alert('Error al procesar el like. Intenta nuevamente.');
    } finally {
      setLiking(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!app || !commentUsername.trim() || !commentContent.trim()) {
      alert('Por favor completa todos los campos');
      return;
    }
    
    try {
      setCommenting(true);
      const newComment = await appsAPI.addComment(app.id, commentUsername.trim(), commentContent.trim());
      
      setApp(prev => prev ? {
        ...prev,
        comments: [newComment, ...(prev.comments || [])]
      } : null);
      
      setCommentContent('');
      setShowCommentForm(false);
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Error al agregar comentario. Intenta nuevamente.');
    } finally {
      setCommenting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDownloads = (downloads: number) => {
    if (downloads >= 1000000) {
      return `${(downloads / 1000000).toFixed(1)}M`;
    } else if (downloads >= 1000) {
      return `${(downloads / 1000).toFixed(1)}K`;
    }
    return downloads.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary-600" />
          <p className="mt-2 text-gray-600">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto text-red-600 mb-2" />
          <p className="text-gray-600 mb-4">{error || 'Aplicación no encontrada'}</p>
          <Link
            to="/"
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
      >
        <ChevronLeft className="h-5 w-5 mr-1" />
        Volver a la tienda
      </Link>

      {/* App Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-start space-x-6">
          <img
            src={app.logo_url || '/placeholder-icon.png'}
            alt={app.name}
            className="w-24 h-24 rounded-xl object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Crect x="3" y="3" width="18" height="18" rx="2" ry="2"/%3E%3Ccircle cx="9" cy="9" r="2"/%3E%3Cpath d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/%3E%3C/svg%3E';
            }}
          />
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{app.name}</h1>
            <p className="text-gray-600 mb-4">{app.short_description}</p>
            
            {/* App Stats */}
            <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
              <div className="flex items-center space-x-1">
                <Download className="h-4 w-4" />
                <span>{formatDownloads(app.downloads)} descargas</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="h-4 w-4" />
                <span>{app.likes} likes</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span>4.5 (123 reseñas)</span>
              </div>
            </div>
            
            {/* App Info */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              {app.version && (
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-gray-400" />
                  <span>Versión {app.version}</span>
                </div>
              )}
              {app.size_mb && (
                <div className="flex items-center space-x-2">
                  <HardDrive className="h-4 w-4 text-gray-400" />
                  <span>{app.size_mb} MB</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>{formatDate(app.created_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={handleDownload}
            disabled={downloading || !app.apk_url}
            className="download-button text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {downloading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Download className="h-5 w-5" />
            )}
            <span>{downloading ? 'Descargando...' : 'Descargar APK'}</span>
          </button>
          
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Tu nombre"
              value={commentUsername}
              onChange={(e) => setCommentUsername(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              onClick={handleLike}
              disabled={liking || !commentUsername.trim()}
              className={`like-button p-2 rounded-lg transition-colors ${
                liked ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Screenshots */}
      {app.screenshots && app.screenshots.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Capturas de pantalla</h3>
          <div className="screenshot-slider flex space-x-4 overflow-x-auto pb-4">
            {app.screenshots.map((screenshot) => (
              <div key={screenshot.id} className="screenshot-item flex-shrink-0">
                <img
                  src={screenshot.image_url}
                  alt={`Captura ${screenshot.position + 1}`}
                  className="w-48 h-86 object-cover rounded-lg shadow-sm"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {app.long_description && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Descripción</h3>
          <div className="prose max-w-none text-gray-700">
            {app.long_description.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-3">{paragraph}</p>
            ))}
          </div>
        </div>
      )}

      {/* Comments Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <span>Comentarios ({app.comments?.length || 0})</span>
          </h3>
          <button
            onClick={() => setShowCommentForm(!showCommentForm)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Agregar comentario
          </button>
        </div>

        {/* Comment Form */}
        {showCommentForm && (
          <form onSubmit={handleAddComment} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Tu nombre
                </label>
                <input
                  type="text"
                  id="username"
                  value={commentUsername}
                  onChange={(e) => setCommentUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                  Comentario
                </label>
                <textarea
                  id="comment"
                  rows={3}
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="submit"
                  disabled={commenting}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {commenting ? 'Enviando...' : 'Enviar comentario'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCommentForm(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {app.comments && app.comments.length > 0 ? (
            app.comments.map((comment: Comment) => (
              <div key={comment.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{comment.username}</span>
                  <span className="text-sm text-gray-500">{formatDate(comment.created_at)}</span>
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">
              No hay comentarios aún. ¡Sé el primero en comentar!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppDetail;
