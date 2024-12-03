import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Car, FileText, Users, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Layout: React.FC = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link to="/" className="flex items-center space-x-2">
                <Car className="w-6 h-6 text-blue-600" />
                <span className="text-xl font-semibold">Controle de Veículos</span>
              </Link>
              <Link
                to="/reports"
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600"
              >
                <FileText className="w-5 h-5" />
                <span>Relatórios</span>
              </Link>
              {auth?.user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600"
                >
                  <Users className="w-5 h-5" />
                  <span>Usuários</span>
                </Link>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                {auth?.user.username}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600"
              >
                <LogOut className="w-5 h-5" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};