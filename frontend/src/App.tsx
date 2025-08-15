import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.tsx';
import GridBackground from './components/GridBackground.tsx';
import Home from './pages/Home.tsx';
import AppDetail from './pages/AppDetail.tsx';
import Upload from './pages/Upload.tsx';
import Admin from './pages/Admin.tsx';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-dark-50 via-secondary-900 to-dark-100 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-tech-pattern opacity-5" style={{ backgroundSize: '20px 20px' }}></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary-400/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2 animate-pulse-glow"></div>
        
        <GridBackground />
        <Navbar />
        <main className="relative z-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/app/:id" element={<AppDetail />} />
            <Route path="/upload/:token" element={<Upload />} />
            <Route path="/admin-jhservices-private" element={<Admin />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
