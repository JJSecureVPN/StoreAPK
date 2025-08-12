import React, { useState } from 'react';
import AdminPanel from '../components/AdminPanel';

const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Contraseña simple para el panel de administración
  // En producción, esto debería ser más seguro
  const ADMIN_PASSWORD = 'jhservices2025!';

  const handleAuthenticate = (password: string) => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert('Contraseña incorrecta');
    }
  };

  return (
    <AdminPanel 
      isAuthenticated={isAuthenticated}
      onAuthenticate={handleAuthenticate}
    />
  );
};

export default Admin;
