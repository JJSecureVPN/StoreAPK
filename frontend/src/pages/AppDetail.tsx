import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Download, Heart, ChevronLeft, MessageCircle, 
  Calendar, Package, HardDrive, AlertCircle 
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
  
  // Screenshot modal
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [showScreenshotModal, setShowScreenshotModal] = useState(false);
  
  // Comment form
  const [commentUsername, setCommentUsername] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);

  useEffect(() => {
    if (id) {
      loadApp(parseInt(id));
    }
  }, [id]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeScreenshotModal();
      }
    };

    if (showScreenshotModal) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showScreenshotModal]);

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

  const openScreenshotModal = (imageUrl: string) => {
    setSelectedScreenshot(imageUrl);
    setShowScreenshotModal(true);
  };

  const closeScreenshotModal = () => {
    setShowScreenshotModal(false);
    setSelectedScreenshot(null);
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
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-500/20 border-t-primary-500 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-6 w-6 bg-primary-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="mt-4 text-primary-300 font-medium">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-dark-100/50 backdrop-blur-sm border border-red-500/20 rounded-2xl p-8 max-w-md mx-4">
          <div className="h-16 w-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Error</h3>
          <p className="text-dark-400 mb-6">{error || 'Aplicación no encontrada'}</p>
          <Link
            to="/"
            className="inline-flex items-center bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg"
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center text-primary-400 hover:text-primary-300 mb-6 group transition-colors duration-200"
        >
          <div className="p-2 rounded-xl bg-dark-100/30 border border-primary-500/20 group-hover:border-primary-500/40 transition-all duration-200 mr-3">
            <ChevronLeft className="h-5 w-5" />
          </div>
          <span className="font-medium">Volver a la tienda</span>
        </Link>

        {/* App Header */}
        <div className="bg-dark-100/50 border border-primary-500/20 rounded-2xl p-6 mb-6">
          <div className="flex items-start space-x-6">
            <div className="relative flex-shrink-0">
              <img
                src={app.logo_url || '/placeholder-icon.png'}
                alt={app.name}
                className="w-24 h-24 rounded-2xl object-cover shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Crect x="3" y="3" width="18" height="18" rx="2" ry="2"/%3E%3Ccircle cx="9" cy="9" r="2"/%3E%3Cpath d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/%3E%3C/svg%3E';
                }}
              />
              {/* Verified Badge */}
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-2 border-2 border-dark-100">
                <div className="h-3 w-3 bg-white rounded-full"></div>
              </div>
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">{app.name}</h1>
              <p className="text-white/90 mb-4 leading-relaxed">{app.short_description}</p>
              
              {/* App Stats */}
              <div className="flex flex-wrap items-center gap-3 text-sm mb-4">
                <div className="flex items-center space-x-2 bg-primary-500/10 border border-primary-500/20 rounded-lg px-3 py-2">
                  <Download className="h-4 w-4 text-primary-400" />
                  <span className="text-primary-300 font-medium">{formatDownloads(app.downloads)}</span>
                  <span className="text-dark-500">descargas</span>
                </div>
                <div className="flex items-center space-x-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  <Heart className="h-4 w-4 text-red-400" />
                  <span className="text-red-300 font-medium">{app.likes}</span>
                  <span className="text-dark-500">likes</span>
                </div>
              </div>
              
              {/* App Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {app.version && (
                  <div className="flex items-center space-x-2 text-dark-400">
                    <div className="p-2 bg-primary-500/10 rounded-lg">
                      <Package className="h-4 w-4 text-primary-400" />
                    </div>
                    <div>
                      <div className="text-xs text-dark-500">Versión</div>
                      <div className="text-white font-medium">{app.version}</div>
                    </div>
                  </div>
                )}
                {app.size_mb && (
                  <div className="flex items-center space-x-2 text-dark-400">
                    <div className="p-2 bg-accent-500/10 rounded-lg">
                      <HardDrive className="h-4 w-4 text-accent-400" />
                    </div>
                    <div>
                      <div className="text-xs text-dark-500">Tamaño</div>
                      <div className="text-white font-medium">{app.size_mb} MB</div>
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-2 text-dark-400">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Calendar className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <div className="text-xs text-dark-500">Publicado</div>
                    <div className="text-white font-medium">{formatDate(app.created_at)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-6 pt-6 border-t border-primary-500/20">
            <button
              onClick={handleDownload}
              disabled={downloading || !app.apk_url}
              className="w-full sm:w-auto bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white px-8 py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {downloading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></div>
                  <span>Descargando...</span>
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  <span>Descargar APK</span>
                </>
              )}
            </button>
            
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Tu nombre para dar like"
                  value={commentUsername}
                  onChange={(e) => setCommentUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-100/30 border border-primary-500/30 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/60 transition-all duration-200"
                />
              </div>
              <button
                onClick={handleLike}
                disabled={liking || !commentUsername.trim()}
                className={`p-3 rounded-xl transition-all duration-200 border-2 ${
                  liked 
                    ? 'bg-red-500/20 border-red-500/50 text-red-400' 
                    : 'bg-dark-100/30 border-primary-500/30 text-dark-400 hover:border-red-500/50 hover:text-red-400'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Heart className={`h-6 w-6 ${liked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Screenshots */}
        {app.screenshots && app.screenshots.length > 0 && (
          <div className="bg-dark-100/50 border border-primary-500/20 rounded-2xl p-6 mb-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
              <div className="h-6 w-6 bg-primary-500/20 rounded-lg flex items-center justify-center">
                <div className="h-3 w-3 bg-primary-400 rounded"></div>
              </div>
              <span>Capturas de pantalla</span>
            </h3>
            <div className="flex space-x-4 overflow-x-auto pb-4 px-2">
              {app.screenshots.map((screenshot) => (
                <div key={screenshot.id} className="flex-shrink-0 p-2">
                  <img
                    src={screenshot.image_url}
                    alt={`Captura ${screenshot.position + 1}`}
                    className="w-48 h-86 object-cover rounded-xl shadow-lg border border-primary-500/20 hover:border-primary-500/40 transition-all duration-200 cursor-pointer hover:scale-105"
                    onClick={() => openScreenshotModal(screenshot.image_url)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {app.long_description && (
          <div className="bg-dark-100/50 border border-primary-500/20 rounded-2xl p-6 mb-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
              <div className="h-6 w-6 bg-accent-500/20 rounded-lg flex items-center justify-center">
                <div className="h-3 w-3 bg-accent-400 rounded"></div>
              </div>
              <span>Descripción</span>
            </h3>
            <div className="text-white/85 leading-relaxed space-y-3">
              {app.long_description.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="bg-dark-100/50 border border-primary-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
              <div className="h-6 w-6 bg-green-500/20 rounded-lg flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-green-400" />
              </div>
              <span>Comentarios ({app.comments?.length || 0})</span>
            </h3>
            <button
              onClick={() => setShowCommentForm(!showCommentForm)}
              className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
            >
              Agregar comentario
            </button>
          </div>

          {/* Comment Form */}
          {showCommentForm && (
            <form onSubmit={handleAddComment} className="mb-6 p-4 bg-dark-100/30 border border-primary-500/20 rounded-xl">
              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-dark-400 mb-1">
                    Tu nombre
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={commentUsername}
                    onChange={(e) => setCommentUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-dark-100/30 border border-primary-500/30 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/60 transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="comment" className="block text-sm font-medium text-dark-400 mb-1">
                    Comentario
                  </label>
                  <textarea
                    id="comment"
                    rows={3}
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    className="w-full px-3 py-2 bg-dark-100/30 border border-primary-500/30 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/60 transition-all duration-200"
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="submit"
                    disabled={commenting}
                    className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50"
                  >
                    {commenting ? 'Enviando...' : 'Enviar comentario'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCommentForm(false)}
                    className="bg-dark-200/30 hover:bg-dark-200/50 text-dark-400 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
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
                <div key={comment.id} className="border-b border-primary-500/20 pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-primary-300">{comment.username}</span>
                    <span className="text-sm text-dark-500">{formatDate(comment.created_at)}</span>
                  </div>
                  <p className="text-dark-300">{comment.content}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="h-16 w-16 bg-dark-200/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-dark-500" />
                </div>
                <p className="text-dark-400">
                  No hay comentarios aún. ¡Sé el primero en comentar!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Screenshot Modal */}
      {showScreenshotModal && selectedScreenshot && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeScreenshotModal}
        >
          <div className="relative max-w-md w-full flex items-center justify-center">
            <img
              src={selectedScreenshot}
              alt="Captura de pantalla ampliada"
              className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          {/* Close button fixed to screen corner */}
          <button
            onClick={closeScreenshotModal}
            className="fixed top-6 right-6 bg-black/50 text-white rounded-full p-3 hover:bg-black/70 transition-colors duration-200 z-60"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default AppDetail;
