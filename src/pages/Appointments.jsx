import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ChevronRight, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  CreditCard,
  FileText,
  Stethoscope
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { appointmentService } from '../services/appointment.service';
import useAuthStore from '../store/useAuthStore';

export const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    try {
      const res = await appointmentService.getMyList();
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await appointmentService.cancel(id);
      fetchAppointments();
    } catch (err) {
      alert('Failed to cancel appointment');
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      CONFIRMED: { color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800', icon: <CheckCircle2 size={12} className="mr-1.5" /> },
      PENDING: { color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-100 dark:border-amber-800', icon: <Clock size={12} className="mr-1.5" /> },
      CANCELLED: { color: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-100 dark:border-red-800', icon: <XCircle size={12} className="mr-1.5" /> },
      COMPLETED: { color: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-100 dark:border-red-800', icon: <FileText size={12} className="mr-1.5" /> },
    };
    const config = configs[status] || configs.PENDING;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight border ${config.color}`}>
        {config.icon} {status}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-10 overflow-x-hidden w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white tracking-tight text-left">Deployment Queue</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-bold mt-1 text-left">Status of scheduled synchronize events with medical entities.</p>
        </div>
        <Button onClick={() => window.location.href = '/doctors'} className="rounded-xl px-8 shadow-xl hover:shadow-red-500/20">Initialize New Request</Button>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1,2,3].map(i => <div key={i} className="h-44 bg-zinc-100 dark:bg-zinc-900/50 animate-pulse rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800" />)}
        </div>
      ) : (
        <div className="grid gap-6 w-full">
          {appointments.map(apt => (
            <Card key={apt.appointmentId} className="hover:shadow-2xl hover:border-red-500/30 transition-all rounded-[2.5rem] bg-white dark:bg-zinc-900 p-0 overflow-hidden border-zinc-200 dark:border-zinc-800 w-full">
               <div className="flex flex-col md:flex-row w-full">
                  {/* Status & Date */}
                  <div className="p-8 md:w-64 bg-zinc-50 dark:bg-zinc-800/10 flex flex-col justify-center items-center text-center border-b md:border-b-0 md:border-r border-zinc-100 dark:border-zinc-800">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-3">SYNC POINT</p>
                      <p className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">{new Date(apt.appointmentDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }).toUpperCase()}</p>
                      <p className="text-xs font-bold text-zinc-400 mt-1">{new Date(apt.appointmentDate).getFullYear()}</p>
                      <div className="mt-6">
                         {getStatusBadge(apt.status)}
                      </div>
                  </div>

                  {/* Doctor Info */}
                  <div className="p-10 flex-grow font-sans min-w-0">
                      <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center space-x-5">
                              <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-600 shadow-inner">
                                 <Stethoscope size={28} />
                              </div>
                              <div className="min-w-0">
                                 <h4 className="font-black text-xl text-zinc-900 dark:text-white tracking-tight uppercase truncate">Specialist Entity</h4>
                                 <p className="text-sm font-bold text-red-600 dark:text-red-400 mt-0.5 uppercase tracking-tighter">Scheduled for 10:30 AM (UTC-5)</p>
                              </div>
                          </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div className="flex items-center text-sm font-bold text-zinc-500"><MapPin size={16} className="mr-2 text-red-600" /> CENTRAL HUB METRO</div>
                         <div className="flex items-center text-sm font-bold text-zinc-500 italic truncate"><AlertCircle size={16} className="mr-2 text-red-600" /> {apt.reason}</div>
                      </div>
                  </div>

                  {/* Actions */}
                  <div className="p-8 md:w-72 flex md:flex-col justify-center gap-3 bg-zinc-50 dark:bg-zinc-800/10 border-t md:border-t-0 md:border-l border-zinc-100 dark:border-zinc-800">
                      {apt.status === 'COMPLETED' ? (
                        <Button variant="secondary" className="w-full text-[11px] font-black uppercase tracking-widest py-3 hover:bg-red-600 hover:text-white transition-all shadow-sm" onClick={() => (window.location.href = `/records`)}>
                           <FileText size={16} className="mr-2.5" /> Access Dossier
                        </Button>
                      ) : apt.status !== 'CANCELLED' ? (
                        <>
                          <Button variant="outline" className="w-full text-red-600 border-red-200 dark:border-red-900/30 font-black text-[11px] uppercase tracking-widest py-3" onClick={() => handleCancel(apt.appointmentId)}>
                             Terminate Session
                          </Button>
                        </>
                      ) : (
                        <p className="text-center text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-loose">Session Terminated by Proxy</p>
                      )}
                  </div>
               </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
