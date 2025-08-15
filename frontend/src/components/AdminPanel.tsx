import React, { useState } from 'react';
import { Upload, Package, Shield, AlertCircle, CheckCircle } from 'lucide-react';

interface AdminPanelProps {
  isAuthenticated: boolean;
  onAuthenticate: (password: string) => void;
}

interface UploadForm {
  name: string;
  packageName: string;
  version: string;
  shortDescription: string;
  longDescription: string;
  category: string;
  apkFile: File | null;
  iconFile: File | null;
  screenshots: File[];
}

const AdminPanel: React.FC<AdminPanelProps> = ({ isAuthenticated, onAuthenticate }) => {
  const [password, setPassword] = useState('');
  const [uploadForm, setUploadForm] = useState<UploadForm>({
    name: '',
    packageName: '',
    version: '',
    shortDescription: '',
    longDescription: '',
    category: '',
    apkFile: null,
    iconFile: null,
    screenshots: []
  });
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onAuthenticate(password);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof UploadForm) => {
    const files = e.target.files;
    if (!files) return;

    if (field === 'screenshots') {
      setUploadForm(prev => ({
        ...prev,
        screenshots: Array.from(files)
      }));
    } else {
      setUploadForm(prev => ({
        ...prev,
        [field]: files[0]
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUploadForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.apkFile || !uploadForm.iconFile) {
      alert('Por favor selecciona los archivos APK e ícono');
      return;
    }

    setUploading(true);
    setUploadStatus('idle');

    try {
      const formData = new FormData();
      
      // Subir archivos
      formData.append('apk', uploadForm.apkFile);
      formData.append('icon', uploadForm.iconFile);
      uploadForm.screenshots.forEach((file, index) => {
        formData.append(`screenshot${index}`, file);
      });

      const uploadResponse = await fetch('/api/upload/app', {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error('Error al subir archivos');
      }

      const uploadResult = await uploadResponse.json();

      // Crear aplicación
      const appData = {
        name: uploadForm.name,
        package_name: uploadForm.packageName,
        version: uploadForm.version,
        short_description: uploadForm.shortDescription,
        long_description: uploadForm.longDescription,
        logo_url: uploadResult.iconUrl,
        apk_url: uploadResult.apkUrl,
        size_mb: uploadResult.sizeMB
      };

      const createResponse = await fetch('/api/apps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appData)
      });

      if (!createResponse.ok) {
        throw new Error('Error al crear aplicación');
      }

      const app = await createResponse.json();

      // Subir screenshots si existen
      if (uploadResult.screenshotUrls && uploadResult.screenshotUrls.length > 0) {
        const screenshots = uploadResult.screenshotUrls.map((url: string, index: number) => ({
          image_url: url,
          position: index
        }));

        await fetch(`/api/apps/${app.id}/screenshots`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ screenshots })
        });
      }

      setUploadStatus('success');
      // Limpiar formulario
      setUploadForm({
        name: '',
        packageName: '',
        version: '',
        shortDescription: '',
        longDescription: '',
        category: '',
        apkFile: null,
        iconFile: null,
        screenshots: []
      });

    } catch (error) {
      console.error('Error:', error);
      setUploadStatus('error');
    } finally {
      setUploading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <div className="flex items-center mb-6">
            <Shield className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
          </div>
          
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña de administrador
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ingresa la contraseña"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Acceder
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
            </div>
            <div className="text-sm text-gray-500">
              JHS Store Management
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <Upload className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Subir Nueva Aplicación</h2>
          </div>

          {uploadStatus === 'success' && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                <div className="text-sm text-green-800">
                  ¡Aplicación subida exitosamente!
                </div>
              </div>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <div className="text-sm text-red-800">
                  Error al subir la aplicación. Por favor, inténtalo de nuevo.
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la aplicación *
                </label>
                <input
                  type="text"
                  name="name"
                  value={uploadForm.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: WhatsApp Messenger"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del paquete *
                </label>
                <input
                  type="text"
                  name="packageName"
                  value={uploadForm.packageName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="com.empresa.aplicacion"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Versión *
                </label>
                <input
                  type="text"
                  name="version"
                  value={uploadForm.version}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1.0.0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <select
                  name="category"
                  value={uploadForm.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar categoría</option>
                  <option value="social">Redes Sociales</option>
                  <option value="communication">Comunicación</option>
                  <option value="entertainment">Entretenimiento</option>
                  <option value="productivity">Productividad</option>
                  <option value="games">Juegos</option>
                  <option value="tools">Herramientas</option>
                  <option value="music">Música</option>
                  <option value="photography">Fotografía</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción corta *
              </label>
              <input
                type="text"
                name="shortDescription"
                value={uploadForm.shortDescription}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descripción breve de la aplicación"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción detallada
              </label>
              <textarea
                name="longDescription"
                value={uploadForm.longDescription}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descripción completa de la aplicación, características, etc."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Archivo APK *
                </label>
                <input
                  type="file"
                  accept=".apk"
                  onChange={(e) => handleFileChange(e, 'apkFile')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ícono de la aplicación *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'iconFile')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Screenshots (opcional)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileChange(e, 'screenshots')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Puedes seleccionar múltiples imágenes
              </p>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Subiendo...' : 'Subir Aplicación'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
