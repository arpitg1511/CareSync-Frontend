import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  TrendingUp, 
  Search, 
  MapPin, 
  CheckCircle2, 
  XCircle,
  Stethoscope,
  Filter,
  DollarSign
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { appointmentService } from '../services/appointment.service';
import { providerService } from '../services/provider.service';
import { paymentService } from '../services/payment.service';
import useAuthStore from '../store/useAuthStore';

export const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ totalCount: 0 });
  const [earnings, setEarnings] = useState({ totalEarnings: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); 
  const { user } = useAuthStore();

  const isDoctor = user?.role === 'DOCTOR' || user?.role === 'ROLE_DOCTOR';

  useEffect(() => {
    if (user) fetchAppointments();
  }, [user, filter]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      if (isDoctor) {
        const providerRes = await providerService.getAll();
        const myProfile = providerRes.data.find(p => p.email === user.email);
        if (myProfile) {
          try {
            const statsRes = await appointmentService.getCount(myProfile.providerId);
            setStats(statsRes.data);
          } catch (e) { console.error("Stats error", e); }

          try {
             const earningsRes = await paymentService.getEarnings(myProfile.providerId);
             setEarnings(earningsRes.data);
          } catch (e) {
             console.warn("Payment service offline");
          }

          let res;
          if (filter === 'PENDING') res = await appointmentService.getPendingByProvider(myProfile.providerId);
          else if (filter === 'COMPLETED') res = await appointmentService.getCompletedByProvider(myProfile.providerId);
          else res = await appointmentService.getByProvider(myProfile.providerId);
          setAppointments(res.data);
        }
      } else {
        const res = await appointmentService.getByUser(user.id);
        setAppointments(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    PENDING: 'bg-amber-500',
    COMPLETED: 'bg-emerald-500',
    CANCELLED: 'bg-rose-500',
    DEFAULT: 'bg-zinc-500'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight">Appointments</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-bold mt-1">Manage and track your clinical interactions.</p>
        </div>
        
        {isDoctor && (
          <div className="flex gap-2">
             {['ALL', 'PENDING', 'COMPLETED'].map(f => (
               <button 
                 key={f} 
                 onClick={() => setFilter(f)}
                 className={`px-4 py-2 rounded-xl font-bold text-xs transition-colors ${filter === f ? 'bg-red-600 text-white shadow-lg shadow-red-500/20' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:bg-zinc-200'}`}
               >
                 {f}
               </button>
             ))}
          </div>
        )}
      </div>

      {isDoctor && (
        <div className="grid md:grid-cols-3 gap-6">
           <Card className="p-6 bg-zinc-900 border-none rounded-3xl relative overflow-hidden">
              <p className="text-[10px] font-black uppercase text-zinc-500 mb-2">Completion Rate</p>
              <h3 className="text-4xl font-black text-white">{(stats.totalCount > 0 ? (appointments.filter(a => a.status === 'COMPLETED').length / stats.totalCount * 100).toFixed(0) : 0)}%</h3>
              <div className="mt-4 flex items-center text-[10px] font-black text-emerald-500 uppercase">
                 <TrendingUp size={12} className="mr-2" /> Verified Operations
              </div>
           </Card>
           <Card className="p-6 bg-red-600 border-none rounded-3xl text-white shadow-xl shadow-red-500/20">
              <p className="text-[10px] font-black uppercase text-red-200 mb-2">Total Earnings</p>
              <h3 className="text-4xl font-black">${earnings.totalEarnings || '0.00'}</h3>
              <div className="mt-4 flex items-center text-[10px] font-black text-white/60 uppercase">
                 <DollarSign size={12} className="mr-2" /> Verified Payments
              </div>
           </Card>
           <Card className="p-6 bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 rounded-3xl shadow-xl">
              <p className="text-[10px] font-black uppercase text-zinc-400 mb-2">Total Patients</p>
              <h3 className="text-4xl font-black text-zinc-900 dark:text-white">{stats.totalCount || 0}</h3>
              <div className="mt-4 flex items-center text-[10px] font-black text-zinc-400 uppercase">
                 <User size={12} className="mr-2 text-red-600" /> Lifetime Records
              </div>
           </Card>
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          {[1,2,3].map(i => <div key={i} className="h-40 bg-zinc-100 dark:bg-zinc-900/50 animate-pulse rounded-3xl border border-zinc-100 dark:border-zinc-800" />)}
        </div>
      ) : appointments.length === 0 ? (
        <div className="py-20 text-center bg-zinc-50 dark:bg-zinc-900/10 rounded-[2rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
           <Calendar className="w-12 h-12 text-zinc-200 dark:text-zinc-800 mx-auto mb-4" />
           <p className="text-zinc-400 font-bold">No appointments found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map(apt => (
            <Card key={apt.appointmentId} className="hover:border-red-600/30 transition-all rounded-3xl border-transparent bg-white dark:bg-zinc-900 shadow-xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                <div className="flex items-center space-x-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${statusColors[apt.status] || statusColors.DEFAULT}`}>
                    <Calendar size={28} />
                  </div>
                  <div className="space-y-1">
                     <div className="flex items-center gap-3">
                        <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">{isDoctor ? apt.patientName : apt.providerName}</h3>
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase text-white ${statusColors[apt.status] || statusColors.DEFAULT}`}>
                          {apt.status}
                        </span>
                     </div>
                     <div className="flex items-center space-x-4 text-xs font-bold text-zinc-400">
                        <div className="flex items-center"><Clock size={14} className="mr-1.5 text-red-600" /> {apt.date} @ {apt.timeSlot}</div>
                        <div className="flex items-center"><MapPin size={14} className="mr-1.5 text-red-600" /> Clinic</div>
                     </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="rounded-xl px-6 font-bold text-xs">Details</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
