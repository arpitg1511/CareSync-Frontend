import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, User, Mail, Lock, HeartPulse, Stethoscope, UserCircle, ArrowRight } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { authService } from '../services/auth.service';

export const Register = () => {
  const [role, setRole] = useState('PATIENT');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    name: '',
    speciality: '',
    phoneNumber: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const userData = {
        fullName: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formData.phoneNumber,
        role: role,
        speciality: formData.speciality
      };
      await authService.register(userData);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Conflict: This identity already exists in our system.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4 bg-zinc-50 dark:bg-zinc-950 transition-colors w-full overflow-hidden">
      <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-red-500/5 rounded-full blur-[120px] -z-10"></div>

      <Card className="w-full max-w-xl p-8 md:p-10 shadow-3xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center shadow-xl shadow-red-500/20 mb-6 font-bold text-white">
             <UserPlus size={28} />
          </div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Identity Registration</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-bold text-sm mt-2">Create your unique CareSync cryptographic profile</p>
        </div>

        {success ? (
          <div className="text-center py-12 space-y-6">
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
               <HeartPulse size={40} />
            </div>
            <div className="space-y-2">
               <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Registration Authorized</h2>
               <p className="text-zinc-500 dark:text-zinc-400 font-bold">Transferring to Identity Gateway...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex bg-zinc-100 dark:bg-zinc-800/50 p-1.5 rounded-2xl mb-8">
              <button
                type="button"
                className={`flex-1 flex items-center justify-center py-2.5 rounded-xl text-sm font-black transition-all ${role === 'PATIENT' ? 'bg-white dark:bg-zinc-700 shadow-md text-red-600' : 'text-zinc-500 hover:text-red-600'}`}
                onClick={() => setRole('PATIENT')}
              >
                <UserCircle className="w-4 h-4 mr-2" /> Patient Entity
              </button>
              <button
                type="button"
                className={`flex-1 flex items-center justify-center py-2.5 rounded-xl text-sm font-black transition-all ${role === 'DOCTOR' ? 'bg-white dark:bg-zinc-700 shadow-md text-red-600' : 'text-zinc-500 hover:text-red-600'}`}
                onClick={() => setRole('DOCTOR')}
              >
                <Stethoscope className="w-4 h-4 mr-2" /> Medical Proxy
              </button>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/30 text-red-600 dark:text-red-400 p-4 rounded-xl text-xs font-bold mb-4">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <Input
                label="Legal Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Required"
                required
              />
            </div>

            <Input
              label="Secure Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="verified@example.com"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Contact Vector"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="+1 000 000 0000"
              />
              <Input
                label="Access Key"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Strong key required"
                required
              />
            </div>

            {role === 'DOCTOR' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <Input
                  label="Field Specialization"
                  value={formData.speciality}
                  onChange={(e) => setFormData({ ...formData, speciality: e.target.value })}
                  placeholder="e.g. Neuro-Oncology"
                  required
                />
              </div>
            )}

            <Button type="submit" className="w-full py-4 text-lg font-black mt-2 rounded-2xl shadow-xl shadow-red-500/10" isLoading={loading}>
              Register New Identity <ArrowRight className="ml-2 w-5 h-5" />
            </Button>

            <p className="text-center text-sm font-bold text-zinc-500 pt-8 border-t border-zinc-100 dark:border-zinc-800">
              Identity already verified?{' '}
              <Link to="/login" className="text-red-600 hover:text-red-500 font-black">Transfer to Login</Link>
            </p>
          </form>
        )}
      </Card>
    </div>
  );
};
