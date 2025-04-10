import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
// import Toggle from './Toggle';

function Navbar() {
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white dark:bg-darkcard shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold text-primary">Soular</Link>
          
          <div className="flex space-x-6">
            <Link 
              to="/" 
              className={`${isActive('/') ? 'text-primary' : 'text-gray-600 dark:text-gray-300'} hover:text-primary`}
            >
              Home
            </Link>
            <Link 
              to="/calculator" 
              className={`${isActive('/calculator') ? 'text-primary' : 'text-gray-600 dark:text-gray-300'} hover:text-primary`}
            >
              Calculator
            </Link>
            <Link 
              to="/social" 
              className={`${isActive('/social') ? 'text-primary' : 'text-gray-600 dark:text-gray-300'} hover:text-primary`}
            >
              Social
            </Link>
            <Link 
              to="/chat" 
              className={`${isActive('/chat') ? 'text-primary' : 'text-gray-600 dark:text-gray-300'} hover:text-primary`}
            >
              Chat
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link 
              to="/profile" 
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-primary"
            >
              <img 
                src={currentUser?.photoURL || 'https://i.imgur.com/HYsTHOF.png'} 
                alt="Profile" 
                className="w-8 h-8 rounded-full"
              />
              <span>{currentUser?.displayName}</span>
            </Link>
            <button 
              onClick={() => logout()} 
              className="text-gray-600 dark:text-gray-300 hover:text-primary"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
