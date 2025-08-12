import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { appsAPI } from '../services/api.js';

const Upload = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    package_name: '',
    short_description: '',
    long_description: '',
    version: '',
  });
  
  // Files
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [apkFile, setApkFile] = useState<File | null>(null);
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);
  
  // State
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if token is valid (simple check - in production use better validation)
  const isValidToken = token === 'secret-upload-token-2024';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('El logo debe ser menor a 5MB');
        return;
      }
      setLogoFile(file);
    }
  };

  const handleApkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        alert('El APK debe ser menor a 100MB');
        return;
      }
      setApkFile(file);
    }
  };

  const handleScreenshotsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 5) {
      alert('Máximo 5 capturas de pantalla');
      return;
    }
    
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit per image
        alert('Cada captura debe ser menor a 5MB');
        return;
      }
    }
    
    setScreenshotFiles(files);
  };

  const removeScreenshot = (index: number) => {
    setScreenshotFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.package_name || !apkFile) {
      alert('Por favor completa los campos obligatorios (nombre, package name y APK)');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setUploadProgress(10);

      // Prepare form data for upload
      const uploadFormData = new FormData();
      
      if (logoFile) {
        uploadFormData.append('logo', logoFile);
      }
      
      if (apkFile) {
        uploadFormData.append('apk', apkFile);
      }
      
      screenshotFiles.forEach((file) => {
        uploadFormData.append('screenshots', file);
      });

      setUploadProgress(30);

      // Upload files first
      const uploadResponse = await appsAPI.uploadFiles(uploadFormData);
      setUploadProgress(60);

      // Create app with uploaded file URLs
      const appData = {
        ...formData,
        logo_url: uploadResponse.data.logo_url,
        apk_url: uploadResponse.data.apk_url,
        size_mb: uploadResponse.data.size_mb ? parseFloat(uploadResponse.data.size_mb) : undefined,
      };

      const newApp = await appsAPI.createApp(appData);
      setUploadProgress(80);

      // Add screenshots if any
      if (uploadResponse.data.screenshots && uploadResponse.data.screenshots.length > 0) {
        await appsAPI.addScreenshots(newApp.id, uploadResponse.data.screenshots);
      }

      setUploadProgress(100);
      setSuccess(true);

      // Redirect to app detail after 2 seconds
      setTimeout(() => {
        navigate(`/app/${newApp.id}`);
      }, 2000);

    } catch (err: any) {
      console.error('Error uploading app:', err);
      setError(err.response?.data?.error || 'Error al subir la aplicación');
    } finally {
      setUploading(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-red-600 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso denegado</h1>
          <p className="text-gray-600">Token de acceso inválido</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Aplicación subida exitosamente!</h1>
          <p className="text-gray-600">Redirigiendo a la página de la aplicación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Subir nueva aplicación</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la aplicación *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="package_name" className="block text-sm font-medium text-gray-700 mb-1">
                Package Name *
              </label>
              <input
                type="text"
                id="package_name"
                name="package_name"
                value={formData.package_name}
                onChange={handleInputChange}
                placeholder="com.ejemplo.miapp"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="version" className="block text-sm font-medium text-gray-700 mb-1">
              Versión
            </label>
            <input
              type="text"
              id="version"
              name="version"
              value={formData.version}
              onChange={handleInputChange}
              placeholder="1.0.0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label htmlFor="short_description" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción corta
            </label>
            <input
              type="text"
              id="short_description"
              name="short_description"
              value={formData.short_description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              maxLength={100}
            />
          </div>

          <div>
            <label htmlFor="long_description" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción completa
            </label>
            <textarea
              id="long_description"
              name="long_description"
              rows={4}
              value={formData.long_description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* File Uploads */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Archivos</h3>
            
            {/* Logo Upload */}
            <div>
              <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-1">
                Logo de la aplicación
              </label>
              <input
                type="file"
                id="logo"
                accept="image/*"
                onChange={handleLogoChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {logoFile && (
                <p className="text-sm text-gray-600 mt-1">Seleccionado: {logoFile.name}</p>
              )}
            </div>

            {/* APK Upload */}
            <div>
              <label htmlFor="apk" className="block text-sm font-medium text-gray-700 mb-1">
                Archivo APK *
              </label>
              <input
                type="file"
                id="apk"
                accept=".apk"
                onChange={handleApkChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
              {apkFile && (
                <p className="text-sm text-gray-600 mt-1">
                  Seleccionado: {apkFile.name} ({(apkFile.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
            </div>

            {/* Screenshots Upload */}
            <div>
              <label htmlFor="screenshots" className="block text-sm font-medium text-gray-700 mb-1">
                Capturas de pantalla (máximo 5)
              </label>
              <input
                type="file"
                id="screenshots"
                accept="image/*"
                multiple
                onChange={handleScreenshotsChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {screenshotFiles.length > 0 && (
                <div className="mt-2 space-y-1">
                  {screenshotFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeScreenshot(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subiendo aplicación...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={uploading}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <UploadIcon className="h-5 w-5" />
              )}
              <span>{uploading ? 'Subiendo...' : 'Subir aplicación'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Upload;
