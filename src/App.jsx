import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './layout/Navbar';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Doctors } from './pages/Doctors';
import { DoctorProfile } from './pages/DoctorProfile';
import { Appointments } from './pages/Appointments';
import { MedicalRecords } from './pages/MedicalRecords';
import { Admin } from './pages/Admin';
import { Profile } from './pages/Profile';
import { DoctorSchedule } from './pages/DoctorSchedule';
import { Notifications } from './pages/Notifications';
import useAuthStore from './store/useAuthStore';
import useUIStore from './store/useUIStore';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  const initTheme = useUIStore(state => state.initTheme);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col transition-colors duration-300 bg-white dark:bg-zinc-950 font-sans">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/doctor/:id" element={<DoctorProfile />} />
            
            <Route path="/appointments" element={
              <PrivateRoute>
                <Appointments />
              </PrivateRoute>
            } />
            
            <Route path="/records" element={
              <PrivateRoute>
                <MedicalRecords />
              </PrivateRoute>
            } />
            
            <Route path="/admin" element={
              <PrivateRoute>
                <Admin />
              </PrivateRoute>
            } />

            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />

            <Route path="/doctor/schedule" element={
              <PrivateRoute>
                <DoctorSchedule />
              </PrivateRoute>
            } />

            <Route path="/notifications" element={
              <PrivateRoute>
                <Notifications />
              </PrivateRoute>
            } />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        
        <footer className="border-t border-zinc-100 dark:border-zinc-800 py-16 bg-zinc-50/50 dark:bg-zinc-950/20">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-2 space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-black">CS</span>
                </div>
                <span className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">CareSync</span>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-sm font-medium leading-relaxed">
                A high-performance microservices architecture for distributed healthcare delivery and secure medical telemetry.
              </p>
            </div>
            <div>
              <h4 className="font-black text-zinc-900 dark:text-white mb-6 uppercase tracking-widest text-xs">Infrastructure</h4>
              <ul className="space-y-4 text-sm font-bold text-zinc-500 dark:text-zinc-400">
                <li><a href="#" className="hover:text-red-600 transition-colors">Specialist Query</a></li>
                <li><a href="#" className="hover:text-red-600 transition-colors">Booking Gateway</a></li>
                <li><a href="#" className="hover:text-red-600 transition-colors">Record Sharding</a></li>
                <li><a href="#" className="hover:text-red-600 transition-colors">Security Model</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-zinc-900 dark:text-white mb-6 uppercase tracking-widest text-xs">Connectivity</h4>
              <ul className="space-y-4 text-sm font-bold text-zinc-500 dark:text-zinc-400">
                <li><a href="#" className="hover:text-red-600 transition-colors">Identity Support</a></li>
                <li><a href="#" className="hover:text-red-600 transition-colors">+1 (212) 555-0198</a></li>
                <li><a href="#" className="hover:text-red-600 transition-colors">Developer Portal</a></li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-zinc-100 dark:border-zinc-800 text-center">
            <p className="text-zinc-400 dark:text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">© 2026 CareSync Systems Cluster. End-to-End Encryption Enabled.</p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
