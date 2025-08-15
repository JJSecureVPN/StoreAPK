import { MessageCircle, Upload, ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative z-10 mt-16">
      <div className="bg-dark-100/50 border-t border-primary-500/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Contact Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                <Upload className="h-5 w-5 text-primary-400" />
                <span>¿Quieres tu App en la Store?</span>
              </h3>
              <p className="text-white/80 leading-relaxed">
                Contacta con el administrador para subir tu aplicación a nuestra plataforma y llegar a miles de usuarios.
              </p>
              <div className="space-y-3">
                <a 
                  href="https://wa.me/5493812531123" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-green-400 hover:text-green-300 transition-colors duration-200 group"
                >
                  <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors duration-200">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <span>WhatsApp</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
                <a 
                  href="https://t.me/JHServices" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-blue-400 hover:text-blue-300 transition-colors duration-200 group"
                >
                  <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors duration-200">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <span>Telegram</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              </div>
            </div>

            {/* About Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">
                Sobre JHS Store
              </h3>
              <p className="text-white/80 leading-relaxed">
                Una plataforma en desarrollo para descubrir y descargar aplicaciones Android. 
                Nuestro objetivo es crear un espacio seguro y confiable para compartir aplicaciones verificadas.
              </p>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-blue-400 font-medium">En Desarrollo - Beta</span>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-primary-500/20 mt-8 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-white/60 text-sm">
                © 2025 JHS Store. Todos los derechos reservados.
              </div>
              <div className="flex items-center space-x-2 text-white/60 text-sm">
                <span>Desarrollado con</span>
                <span className="text-red-400">♥</span>
                <span>por JHServices</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
