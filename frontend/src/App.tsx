import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.tsx';
import Home from './pages/Home.tsx';
import AppDetail from './pages/AppDetail.tsx';
import Upload from './pages/Upload.tsx';
import Admin from './pages/Admin.tsx';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
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
