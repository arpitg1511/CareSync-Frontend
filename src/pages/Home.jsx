import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Clock, 
  Users, 
  Stethoscope, 
  Calendar, 
  FileText,
  ArrowRight,
  Star
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import useAuthStore from '../store/useAuthStore';

export const Home = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="space-y-24 py-12 md:py-24 overflow-x-hidden w-full">
      {/* Hero Section */}
      <section className="px-4 relative overflow-hidden w-full">
        {/* Dynamic Background elements for both themes */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 bg-white dark:bg-zinc-950">
           <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-red-500/10 rounded-full blur-[120px]"></div>
           <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-500/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-bold animate-fade-in shadow-sm">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>Trusted Healthcare Ecosystem</span>
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-zinc-900 dark:text-white leading-[0.9] md:leading-[1.1]">
            Your Health, <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-400">Syncronized</span>.
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed font-medium">
            A high-performance microservices platform connecting patients with elite specialists through real-time availability and encrypted medical history.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            {isAuthenticated ? (
              <Button size="lg" className="px-10 py-5 rounded-2xl shadow-xl hover:shadow-red-500/20" onClick={() => navigate('/appointments')}>
                Go to Dashboard <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            ) : (
              <>
                <Button size="lg" className="px-10 py-5 rounded-2xl shadow-xl hover:shadow-red-500/20" onClick={() => navigate('/login')}>
                   Sign In Now <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button variant="secondary" size="lg" className="px-10 py-5 rounded-2xl" onClick={() => navigate('/doctors')}>
                  Browse Specialists
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white dark:bg-zinc-900/40 py-16 border-y border-zinc-100 dark:border-zinc-800 transition-colors w-full">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-12">
          {[
              { label: 'Cloud Specialists', value: '250+' },
              { label: 'Patient Success', value: '99.9%' },
              { label: 'Encrypted Records', value: '1.2M' },
              { label: 'Latency', value: '< 20ms' }
          ].map((stat, i) => (
            <div key={i} className="text-center space-y-2">
              <p className="text-4xl font-black text-zinc-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-black">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-4 pb-20 w-full">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-white">Built for High Availability</h2>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium max-w-xl mx-auto">Experience the benefits of our distributed healthcare architecture.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-10">
          <Card className="p-8 hover:border-red-500/50 group bg-zinc-50/50 dark:bg-zinc-900/50 border-transparent shadow-none hover:shadow-2xl hover:shadow-red-500/5">
            <div className="w-14 h-14 bg-red-100 dark:bg-red-900/40 rounded-2xl flex items-center justify-center text-red-600 mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all">
              <Calendar className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black tracking-tight mb-4">Precision Booking</h3>
            <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed font-bold text-sm">Real-time slot synchronization prevents double booking and ensures millisecond accuracy across all time zones.</p>
          </Card>

          <Card className="p-8 hover:border-emerald-500/50 group bg-zinc-50/50 dark:bg-zinc-900/50 border-transparent shadow-none hover:shadow-2xl hover:shadow-emerald-500/5">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/40 rounded-2xl flex items-center justify-center text-emerald-600 mb-8 group-hover:scale-110 group-hover:-rotate-3 transition-all">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black tracking-tight mb-4">Stateless Security</h3>
            <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed font-bold text-sm">Industry-standard JWT authentication and encrypted data sharding keep your medical history completely isolated.</p>
          </Card>

          <Card className="p-8 hover:border-amber-500/50 group bg-zinc-50/50 dark:bg-zinc-900/50 border-transparent shadow-none hover:shadow-2xl hover:shadow-amber-500/5">
            <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/40 rounded-2xl flex items-center justify-center text-amber-600 mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black tracking-tight mb-4">Active Directory</h3>
            <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed font-bold text-sm">Verified profiles with specialty mapping allow you to discover the exact care model you need in seconds.</p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 pb-24 w-full">
        <div className="bg-red-600 dark:bg-red-600 rounded-[2.5rem] p-12 md:p-24 relative overflow-hidden text-center text-white shadow-3xl shadow-red-500/20">
          <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-white rounded-full blur-[120px]"></div>
          </div>
          
          <div className="relative z-10 max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">The future of healthcare is distributed.</h2>
            <p className="text-red-100 text-lg md:text-xl font-medium max-w-2xl mx-auto">Access world-class specialists and secure medical storage through our modern digital gateway.</p>
            <div className="pt-4">
              <Button size="lg" className="px-12 py-6 rounded-2xl bg-white text-red-600 hover:bg-zinc-100 shadow-2xl">
                 Launch Platform <ArrowRight className="ml-3 w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
