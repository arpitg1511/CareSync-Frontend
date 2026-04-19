import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Sun, 
  Moon, 
  User, 
  LogOut, 
  HeartPulse, 
  Bell,
  Settings
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useUIStore from '../store/useUIStore';
import { Button } from '../components/Button';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <NavLink to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <HeartPulse className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">
                CareSync
              </span>
            </NavLink>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/doctors" className={({isActive}) => `text-sm font-bold transition-colors ${isActive ? 'text-red-600' : 'text-zinc-500 dark:text-zinc-400 hover:text-red-600'}`}>Find Doctors</NavLink>
            {isAuthenticated && (
              <>
                <NavLink to="/appointments" className={({isActive}) => `text-sm font-bold transition-colors ${isActive ? 'text-red-600' : 'text-zinc-500 dark:text-zinc-400 hover:text-red-600'}`}>Appointments</NavLink>
                <NavLink to="/records" className={({isActive}) => `text-sm font-bold transition-colors ${isActive ? 'text-red-600' : 'text-zinc-500 dark:text-zinc-400 hover:text-red-600'}`}>Medical Records</NavLink>
                {(user?.role === 'DOCTOR' || user?.role === 'ROLE_DOCTOR') && (
                  <NavLink to="/doctor/schedule" className={({isActive}) => `text-sm font-bold transition-colors ${isActive ? 'text-red-600' : 'text-zinc-500 dark:text-zinc-400 hover:text-red-600'}`}>Manage Schedule</NavLink>
                )}
                {(user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN') && (
                  <NavLink to="/admin" className={({isActive}) => `text-sm font-bold transition-colors ${isActive ? 'text-red-600' : 'text-zinc-500 dark:text-zinc-400 hover:text-red-600'}`}>Management</NavLink>
                )}
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <button className="p-2 relative text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                  <Bell size={20} />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border-2 border-white dark:border-zinc-950"></span>
                </button>
                <div className="group relative">
                  <button className="flex items-center space-x-2 p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all hover:shadow-sm">
                    <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white text-xs font-black shadow-sm">
                      {(user?.fullName || user?.name)?.charAt(0) || <User size={18} />}
                    </div>
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0">
                    <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                      <p className="text-sm font-black text-zinc-900 dark:text-white truncate">{user?.fullName || user?.name}</p>
                      <p className="text-xs font-semibold text-zinc-400 truncate">{user?.email}</p>
                    </div>
                    <NavLink to="/profile" className="flex items-center px-4 py-2.5 text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 transition-colors">
                      <Settings className="w-4 h-4 mr-3" /> Profile Settings
                    </NavLink>
                    {(user?.role === 'DOCTOR' || user?.role === 'ROLE_DOCTOR') && (
                      <NavLink to="/doctor/schedule" className="flex items-center px-4 py-2.5 text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 transition-colors">
                        <HeartPulse className="w-4 h-4 mr-3" /> Shift Management
                      </NavLink>
                    )}
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3" /> Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button onClick={() => navigate('/login')}>Sign In</Button>
              </div>
            )}

            <button
              className="md:hidden p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-6 shadow-xl w-full">
          <NavLink to="/doctors" className="block text-lg font-bold text-zinc-700 dark:text-zinc-300">Find Doctors</NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/appointments" className="block text-lg font-bold text-zinc-700 dark:text-zinc-300">Appointments</NavLink>
              <NavLink to="/records" className="block text-lg font-bold text-zinc-700 dark:text-zinc-300">Medical Records</NavLink>
              {(user?.role === 'DOCTOR' || user?.role === 'ROLE_DOCTOR') && (
                <NavLink to="/doctor/schedule" className="block text-lg font-bold text-zinc-700 dark:text-zinc-300">Manage Schedule</NavLink>
              )}
              {(user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN') && (
                <NavLink to="/admin" className="block text-lg font-bold text-zinc-700 dark:text-zinc-300">Management</NavLink>
              )}
              <Button variant="danger" className="w-full justify-start py-3" onClick={handleLogout}>
                <LogOut className="w-5 h-5 mr-3" /> Logout
              </Button>
            </>
          ) : (
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <Button className="w-full py-3" onClick={() => navigate('/login')}>Sign In</Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
