import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.tsx';
import Footer from './components/Footer.tsx';
import GridBackground from './components/GridBackground.tsx';
import Home from './pages/Home.tsx';
import Categories from './pages/Categories.tsx';
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
        
        <GridBackground />
        <Navbar />
        <main className="relative z-10 pt-40 md:pt-28">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/app/:id" element={<AppDetail />} />
            <Route path="/upload/:token" element={<Upload />} />
            <Route path="/admin-jhservices-private" element={<Admin />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
