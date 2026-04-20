import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  TrendingUp, 
  Search, 
  MapPin, 
  CheckCircle2, 
  XSquare,
  Stethoscope,
  Filter as FilterIcon,
  DollarSign,
  X,
  Check,
  Plus,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { appointmentService } from '../services/appointment.service';
import { providerService } from '../services/provider.service';
import { patientService } from '../services/patient.service';
import { paymentService } from '../services/payment.service';
import useAuthStore from '../store/useAuthStore';

export const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ total: 0 });
  const [earnings, setEarnings] = useState({ totalEarnings: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); 
  const [showTodayOnly, setShowTodayOnly] = useState(false);
  const [dismissedIds, setDismissedIds] = useState([]);
  const [clinicName, setClinicName] = useState('Operational Headquarters');
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const isDoctor = user?.role?.toUpperCase().includes('DOCTOR') || user?.role?.toUpperCase().includes('PROVIDER');

  useEffect(() => {
    if (user) fetchAppointments();
  }, [user, filter, showTodayOnly]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      let allApts = [];
      let currentProvider = null;

      if (isDoctor) {
        const providerRes = await providerService.getByEmail(user.email);
        currentProvider = providerRes.data;
        if (currentProvider) {
          setClinicName(currentProvider.clinicName || 'Operational Headquarters');
          try {
             const [statsRes, earningsRes, aptsRes] = await Promise.all([
               appointmentService.getCount(currentProvider.providerId),
               paymentService.getEarnings(currentProvider.providerId).catch(() => ({ data: { totalEarnings: 0 } })),
               appointmentService.getByProvider(currentProvider.providerId)
             ]);
             setStats(statsRes.data);
             setEarnings(earningsRes.data);
             allApts = aptsRes.data;
          } catch (e) { console.error("Data Fetch Error", e); }
        }
      } else {
        // Patient Flow: Secure Self-Resolution via JWT
        try {
          const res = await appointmentService.getMyList();
          allApts = res.data;
        } catch (e) {
          console.error("Patient Data Handshake Failed", e);
        }
      }

      const enrichedApts = await Promise.all(allApts.map(async (apt) => {
         try {
           if (isDoctor) {
             const pRes = await patientService.getById(apt.patientId);
             const pData = pRes.data;
             return { ...apt, patientName: pData.fullName || pData.name || pData.firstName + ' ' + pData.lastName || 'Anonymous Patient' };
           } else {
             const dRes = await providerService.getById(apt.providerId);
             return { ...apt, providerName: dRes.data.fullName, providerClinicName: dRes.data.clinicName };
           }
         } catch (e) { return apt; }
      }));

      // Full Visibility: No automatic status exclusion
      let filtered = enrichedApts;
      
      if (filter === 'PENDING') {
        filtered = filtered.filter(a => a.status?.toUpperCase() === 'SCHEDULED' || a.status?.toUpperCase() === 'PENDING');
      } else if (filter === 'COMPLETED') {
        filtered = filtered.filter(a => a.status?.toUpperCase() === 'COMPLETED');
      }
      
      // Date Filtering Layer (Today Only)
      if (showTodayOnly) {
        const today = new Date().toDateString();
        filtered = filtered.filter(a => new Date(a.appointmentDateTime).toDateString() === today);
      }
      
      // Apply Dismissal Layer (Hides but doesn't delete)
      setAppointments(filtered.filter(a => !dismissedIds.includes(a.appointmentId)));

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = (id) => {
    setDismissedIds(prev => [...prev, id]);
    setAppointments(prev => prev.filter(a => a.appointmentId !== id));
  };

  const handleStatusUpdate = async (id, action) => {
    try {
      if (action === 'complete') await appointmentService.complete(id);
      else if (action === 'no-show') await appointmentService.markNoShow(id);
      fetchAppointments();
    } catch (err) {
      alert("Update failed");
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Initialize Cancellation Protocol?")) return;
    try {
      await appointmentService.cancel(id);
      fetchAppointments();
    } catch (err) {
      alert("Cancellation failed");
    }
  };

  const statusColors = {
    PENDING: 'bg-amber-500',
    SCHEDULED: 'bg-blue-600',
    COMPLETED: 'bg-emerald-600',
    CANCELLED: 'bg-rose-600',
    NO_SHOW: 'bg-zinc-600',
    DEFAULT: 'bg-zinc-500'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Appointments</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-semibold mt-1 text-xs tracking-tight">Clinical Operations Interface</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
           {/* Independent Today Toggle */}
           <button 
             onClick={() => setShowTodayOnly(!showTodayOnly)}
             className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all border ${showTodayOnly ? 'bg-zinc-900 text-white border-zinc-900 shadow-xl' : 'bg-white dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'}`}
           >
              <Clock size={14} /> {showTodayOnly ? "Showing Today" : "Today Only"}
           </button>

           <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block mx-2" />

           <div className="flex gap-2">
              {['ALL', 'PENDING', 'COMPLETED'].map(f => (
                <button 
                  key={f} 
                  onClick={() => setFilter(f)}
                  className={`px-6 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${filter === f ? 'bg-red-600 text-white shadow-lg shadow-red-500/20' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:bg-zinc-200'}`}
                >
                  {f}
                </button>
              ))}
           </div>
        </div>
      </div>

      {!isDoctor && (
        <Card className="bg-zinc-950 border-none p-10 rounded-[3rem] text-white relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform">
              <Calendar size={120} />
           </div>
           <div className="relative z-10 space-y-6">
              <div className="space-y-2">
                 <h2 className="text-3xl font-bold tracking-tighter">Need Medical Consultation?</h2>
                 <p className="text-zinc-400 font-medium text-sm">Schedule a virtual or clinical session with our verified specialists.</p>
              </div>
              <Button 
                onClick={() => navigate('/doctors')}
                className="bg-red-600 hover:bg-red-700 text-white border-none rounded-2xl px-10 py-6 font-bold text-xs uppercase tracking-widest shadow-2xl shadow-red-500/20 flex items-center gap-3"
              >
                 Book New Appointment <Plus size={18} />
              </Button>
           </div>
        </Card>
      )}

      {isDoctor && (
        <div className="grid md:grid-cols-3 gap-6">
           <Card className="p-8 bg-zinc-950 border-none rounded-[2rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform"><TrendingUp size={80} /></div>
              <p className="text-[10px] font-black uppercase text-zinc-500 mb-4 tracking-[0.2em]">Compliance Rate</p>
              <h3 className="text-4xl font-black text-white italic">{(stats.total > 0 ? (appointments.filter(a => a.status?.toUpperCase() === 'COMPLETED').length / stats.total * 100).toFixed(0) : 0)}%</h3>
           </Card>
           <Card className="p-8 bg-red-600 border-none rounded-[2rem] text-white shadow-2xl shadow-red-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform"><DollarSign size={80} /></div>
              <p className="text-[10px] font-black uppercase text-red-200 mb-4 tracking-[0.2em]">Revenue Flow</p>
              <h3 className="text-4xl font-black italic">${earnings.totalEarnings || '0.00'}</h3>
           </Card>
           <Card className="p-8 bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 rounded-[2rem] shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform"><User size={80} /></div>
              <p className="text-[10px] font-black uppercase text-zinc-400 mb-4 tracking-[0.2em]">Active Entities</p>
              <h3 className="text-4xl font-black text-zinc-900 dark:text-white italic">{stats.total || 0}</h3>
           </Card>
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          {[1,2,3].map(i => <div key={i} className="h-44 bg-zinc-100 dark:bg-zinc-900/50 animate-pulse rounded-[2.5rem]" />)}
        </div>
      ) : appointments.length === 0 ? (
        <div className="py-24 text-center bg-zinc-50 dark:bg-zinc-900/10 rounded-[3rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
           <Calendar className="w-16 h-16 text-zinc-200 dark:text-zinc-800 mx-auto mb-6" />
           <p className="text-zinc-400 font-black uppercase tracking-[0.3em] text-xs">Zero Appointments Found</p>
           {!isDoctor && (
             <Button 
               variant="outline" 
               className="mt-8 rounded-2xl px-10 font-black text-xs uppercase tracking-widest border-zinc-200"
               onClick={() => navigate('/doctors')}
             >
                Initialize Search <Search size={14} className="ml-2" />
             </Button>
           )}
        </div>
      ) : (
        <div className="space-y-6">
          {appointments.map(apt => {
            const dt = new Date(apt.appointmentDateTime);
            const day = dt.getDate();
            const month = dt.toLocaleString('default', { month: 'short' }).toUpperCase();
            const statusStr = apt.status?.toUpperCase() || 'SCHEDULED';
            const canAction = statusStr === 'SCHEDULED' || statusStr === 'PENDING' || statusStr === 'RESCHEDULED';
            
            return (
              <Card key={apt.appointmentId} className="hover:border-red-600/30 transition-all duration-500 rounded-[2.5rem] border-transparent bg-white dark:bg-zinc-900 shadow-xl p-8 group relative overflow-hidden">
                <button 
                  onClick={() => handleDismiss(apt.appointmentId)}
                  className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-300 hover:text-zinc-600 transition-all opacity-0 group-hover:opacity-100 z-30"
                >
                  <X size={20} />
                </button>

                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-10">
                  <div className="flex items-start gap-10 flex-grow">
                    <div className="flex flex-col items-center space-y-4 shrink-0">
                      <div className="w-20 h-20 rounded-3xl bg-zinc-900 text-white flex flex-col items-center justify-center shadow-2xl group-hover:bg-red-600 transition-colors duration-500">
                        <span className="text-2xl font-black leading-none">{day}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-60">{month}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase text-white shadow-sm ${statusColors[statusStr] || statusColors.DEFAULT}`}>
                        {statusStr}
                      </span>
                    </div>

                    <div className="flex-grow pt-2">
                      <div className="space-y-6">
                         <div className="space-y-1">
                            <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] leading-none mb-1">
                               {isDoctor ? 'Patient Identity' : 'Medical Specialist'}
                            </p>
                            <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight italic whitespace-nowrap overflow-hidden text-ellipsis max-w-[300px]">
                               {isDoctor ? (apt.patientName || 'Resolving...') : (apt.providerName || 'Resolving...')}
                            </h3>
                         </div>

                         <div className="flex flex-wrap gap-3 text-sm font-bold text-zinc-500 dark:text-zinc-400">
                            <div className="flex items-center bg-zinc-50 dark:bg-zinc-800/40 px-4 py-2 rounded-xl border border-zinc-100 dark:border-zinc-800">
                               <Clock size={16} className="mr-3 text-red-600" /> {dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="flex items-center bg-zinc-50 dark:bg-zinc-800/40 px-4 py-2 rounded-xl border border-zinc-100 dark:border-zinc-800">
                               <MapPin size={16} className="mr-3 text-red-600" /> {isDoctor ? clinicName : (apt.providerClinicName || 'General Clinic')}
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>

                  {isDoctor && canAction && (
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 self-center z-40">
                       <button 
                         onClick={() => handleStatusUpdate(apt.appointmentId, 'complete')}
                         className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg active:scale-95"
                       >
                          <Check size={14} /> Visited
                       </button>
                       <button 
                         onClick={() => handleStatusUpdate(apt.appointmentId, 'no-show')}
                         className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95"
                       >
                          <XSquare size={14} /> No Show
                       </button>
                       <button 
                         onClick={() => handleCancel(apt.appointmentId)}
                         className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-red-500/30 text-red-600 text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all active:scale-95"
                       >
                          <X size={14} /> Cancel
                       </button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
