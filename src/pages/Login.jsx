import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, HeartPulse, ArrowRight } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { authService } from '../services/auth.service';
import useAuthStore from '../store/useAuthStore';

export const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const loginStore = useAuthStore(state => state.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const data = await authService.login(formData);
      loginStore(data, data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Unauthorized: The identity email or secret key is incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-zinc-50 dark:bg-zinc-950 transition-colors w-full overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-red-500/5 rounded-full blur-[120px]"></div>
      </div>

      <Card className="w-full max-w-md p-8 shadow-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-visible relative">
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center shadow-xl shadow-red-500/20 mb-6 group cursor-pointer transition-transform hover:rotate-3">
             <HeartPulse className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Identity Gateway</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-semibold text-sm mt-2">Sign in to access your health data</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl text-xs font-bold mb-8 animate-shake flex items-center">
             <Lock size={14} className="mr-2" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Identity Email"
            type="email"
            placeholder="verified@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            autoComplete="email"
            className="h-12"
          />

          <div className="space-y-1">
            <div className="flex justify-between items-center px-1">
              <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Secret Key</label>
              <Link to="/forgot-password" title="Recovery help" className="text-xs font-bold text-red-600 hover:text-red-500">I lost my key</Link>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              autoComplete="current-password"
              className="h-12"
            />
          </div>

          <Button type="submit" className="w-full h-12 text-lg font-black mt-4 shadow-xl shadow-red-500/10" isLoading={loading}>
            Access Platform <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </form>

        <div className="mt-10 pt-8 border-t border-zinc-100 dark:border-zinc-800 text-center">
          <p className="text-sm font-bold text-zinc-400 dark:text-zinc-500">
            No gateway account?{' '}
            <Link to="/register" className="text-red-600 hover:text-red-500 font-black">Register New Identity</Link>
          </p>
        </div>
      </Card>
    </div>
  );
};
