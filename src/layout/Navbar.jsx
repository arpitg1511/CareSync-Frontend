import React, { useState, useEffect } from 'react';
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
  Settings,
  Clock,
  Calendar,
  AlertCircle,
  Shield
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useUIStore from '../store/useUIStore';
import { Button } from '../components/Button';
import { notificationService } from '../services/notification.service';
import { patientService } from '../services/patient.service';
import { providerService } from '../services/provider.service';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recipientId, setRecipientId] = useState(null);
  const [dismissedRecentIds, setDismissedRecentIds] = useState([]);
  const navigate = useNavigate();

  const isDoctor = user?.role?.toUpperCase().includes('DOCTOR');
  const isAdmin = user?.role?.toUpperCase().includes('ADMIN');

  useEffect(() => {
    if (isAuthenticated) {
      resolveRecipientId();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (recipientId) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); 
      return () => clearInterval(interval);
    }
  }, [recipientId]);

  const resolveRecipientId = async () => {
    try {
      if (isDoctor) {
        const { data: profile } = await providerService.getByEmail(user.email);
        if (profile) setRecipientId(profile.providerId);
      } else {
        const { data: profile } = await patientService.getByEmail(user.email);
        if (profile) setRecipientId(profile.patientId);
      }
    } catch (err) {
      console.warn("Identity Resolution Failure", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const [{ data: list }, { data: count }] = await Promise.all([
        notificationService.getByRecipient(recipientId),
        notificationService.getUnreadCount(recipientId)
      ]);
      setNotifications(list.slice(0, 5)); 
      setUnreadCount(count.count || 0);
    } catch (err) {
      console.error("Sync Error", err);
    }
  };

  const handleToggleNotif = async () => {
    const newState = !isNotifOpen;
    setIsNotifOpen(newState);
    if (newState && recipientId && unreadCount > 0) {
      try {
        await notificationService.markAllRead(recipientId);
        setUnreadCount(0);
      } catch (err) {
        console.warn("Read Status Sync Failure (Silent Fallback)");
      }
    }
  };

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
                {isDoctor && (
                  <NavLink to="/doctor/schedule" className={({isActive}) => `text-sm font-bold transition-colors ${isActive ? 'text-red-600' : 'text-zinc-500 dark:text-zinc-400 hover:text-red-600'}`}>Manage Schedule</NavLink>
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
                <div className="relative">
                  <button 
                    onClick={handleToggleNotif}
                    className={`p-2 relative rounded-xl transition-all ${unreadCount > 0 ? 'text-red-600' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                  >
                    <Bell size={20} className={unreadCount > 0 ? 'animate-bounce' : ''} />
                    {unreadCount > 0 && (
                      <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border-2 border-white dark:border-zinc-950"></span>
                    )}
                  </button>

                  {isNotifOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl py-0 overflow-hidden z-[100]">
                      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                         <h3 className="text-xs font-black uppercase text-zinc-900 dark:text-white">Notifications</h3>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-10 text-center">
                             <p className="text-xs font-bold text-zinc-400">No notifications</p>
                          </div>
                        ) : (
                          notifications
                            .filter(n => !dismissedRecentIds.includes(n.notificationId))
                            .map(n => (
                            <div key={n.notificationId} className="p-4 flex gap-3 border-b border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors group relative">
                               <div className="shrink-0 mt-0.5">
                                  {n.title.toLowerCase().includes('booking') ? <Calendar size={16} className="text-blue-500" /> : <AlertCircle size={16} className="text-red-500" />}
                               </div>
                               <div className="min-w-0 pr-6">
                                  <p className="text-xs font-black text-zinc-900 dark:text-white truncate">{n.title}</p>
                                  <p className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 line-clamp-2">{n.message}</p>
                               </div>
                               <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDismissedRecentIds(prev => [...prev, n.notificationId]);
                                  }}
                                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                                >
                                   <X size={12} />
                                </button>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="p-3 text-center border-t border-zinc-100 dark:border-zinc-800">
                         <button 
                           onClick={() => {
                             setIsNotifOpen(false);
                             navigate('/notifications');
                           }}
                           className="text-[10px] font-black text-red-600 uppercase tracking-widest hover:underline"
                         >
                           View All Notifications
                         </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="group relative">
                  <button className="flex items-center space-x-2 p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white text-xs font-black shadow-sm">
                      {(user?.fullName || user?.name)?.charAt(0) || <User size={18} />}
                    </div>
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                      <p className="text-sm font-black text-zinc-900 dark:text-white truncate">{user?.fullName || user?.name}</p>
                      <p className="text-xs font-bold text-zinc-400 truncate tracking-tight">{user?.email}</p>
                    </div>
                    <NavLink to="/profile" className="flex items-center px-4 py-2.5 text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 transition-colors">
                      <Settings className="w-4 h-4 mr-3" /> Profile Settings
                    </NavLink>
                    {isDoctor && (
                      <NavLink to="/doctor/schedule" className="flex items-center px-4 py-2.5 text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 transition-colors">
                        <HeartPulse className="w-4 h-4 mr-3" /> Shift Management
                      </NavLink>
                    )}
                    {isAdmin && (
                      <NavLink to="/admin" className="flex items-center px-4 py-2.5 text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 transition-colors">
                        <Shield className="w-4 h-4 mr-3" /> Manage Requests
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
    </nav>
  );
};
