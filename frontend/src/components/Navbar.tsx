import { Link } from 'react-router-dom';
import { Search, Zap, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="relative z-50">
      {/* Simplified backdrop */}
      <div className="absolute inset-0 bg-dark-50/90 border-b border-primary-500/20"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl blur-md opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
              <img 
                src="/logo-jhs.png" 
                alt="JHS Store" 
                className="relative h-10 w-10 rounded-xl border-2 border-primary-500/50 group-hover:border-primary-400 transition-colors duration-300" 
              />
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-primary-200 bg-clip-text text-transparent">
                JHS Store
              </span>
              <Zap className="h-5 w-5 text-accent-500 animate-pulse" />
            </div>
          </Link>
          
          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full group">
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Search className="h-5 w-5 text-primary-400 group-hover:text-primary-300 transition-colors duration-200" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar aplicaciones increíbles..."
                  className="w-full pl-12 pr-16 py-4 bg-dark-100/40 border border-primary-500/30 rounded-2xl leading-5 text-white placeholder-dark-500 focus:outline-none focus:placeholder-dark-600 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/60 transition-all duration-200 hover:border-primary-500/50"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none z-10">
                  <kbd className="hidden lg:inline-flex items-center px-2 py-1 bg-primary-500/20 border border-primary-500/30 rounded-lg text-xs text-primary-300 font-mono">
                    ⌘K
                  </kbd>
                </div>
              </div>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="relative text-white hover:text-primary-300 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 group hover:bg-primary-500/10"
            >
              <span className="relative z-10">Inicio</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <Link
              to="/categories"
              className="relative text-white hover:text-primary-300 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 group hover:bg-primary-500/10"
            >
              <span className="relative z-10">Categorías</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <div className="h-6 w-px bg-primary-500/30"></div>
            <button className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-glow border border-primary-500/50">
              Subir App
            </button>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-primary-300 p-2 rounded-xl bg-dark-100/30 backdrop-blur-sm border border-primary-500/30 hover:border-primary-500/50 transition-all duration-300"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <div className="relative group">
            <div className="relative flex items-center">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-primary-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar apps..."
                className="w-full pl-12 pr-4 py-3 bg-dark-100/40 border border-primary-500/30 rounded-2xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/60 transition-all duration-200"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-dark-50/95 border-b border-primary-500/20 animate-slide-up">
          <div className="px-4 py-6 space-y-4">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className="block text-white hover:text-primary-300 px-4 py-3 rounded-xl font-semibold transition-colors duration-300 hover:bg-primary-500/10"
            >
              Inicio
            </Link>
            <Link
              to="/categories"
              onClick={() => setIsMenuOpen(false)}
              className="block text-white hover:text-primary-300 px-4 py-3 rounded-xl font-semibold transition-colors duration-300 hover:bg-primary-500/10"
            >
              Categorías
            </Link>
            <div className="pt-4 border-t border-primary-500/20">
              <button className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-glow">
                Subir App
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
