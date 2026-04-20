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
  ArrowRight,
  Trash2,
  RefreshCw,
  Star,
  MessageSquare,
  Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { appointmentService } from '../services/appointment.service';
import { providerService } from '../services/provider.service';
import { patientService } from '../services/patient.service';
import { paymentService } from '../services/payment.service';
import { reviewService } from '../services/review.service';
import useAuthStore from '../store/useAuthStore';

export const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ total: 0 });
  const [earnings, setEarnings] = useState({ totalEarnings: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); 
  const [showTodayOnly, setShowTodayOnly] = useState(false);
  const [dismissedIds, setDismissedIds] = useState(() => {
    const saved = localStorage.getItem('purged_appointments');
    return saved ? JSON.parse(saved) : [];
  });
  const [clinicName, setClinicName] = useState('Operational Headquarters');
  const [reviewingAppt, setReviewingAppt] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', isAnonymous: false });
  const [existingReviews, setExistingReviews] = useState({}); // { appointmentId: true }
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
      const finalApts = filtered.filter(a => !dismissedIds.includes(a.appointmentId));
      setAppointments(finalApts);

      // Check for existing reviews for completed appointments
      if (!isDoctor) {
          const completedIds = finalApts.filter(a => a.status?.toUpperCase() === 'COMPLETED').map(a => a.appointmentId);
          const reviewMap = {};
          for (const id of completedIds) {
              try {
                  const r = await reviewService.getByAppointment(id);
                  if (r.data) reviewMap[id] = true;
              } catch (e) { /* No review yet */ }
          }
          setExistingReviews(reviewMap);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    try {
        await reviewService.create({
            appointmentId: reviewingAppt.appointmentId,
            patientId: reviewingAppt.patientId, 
            providerId: reviewingAppt.providerId,
            rating: reviewForm.rating,
            comment: reviewForm.comment,
            isAnonymous: reviewForm.isAnonymous
        });
        setReviewingAppt(null);
        setReviewForm({ rating: 5, comment: '', isAnonymous: false });
        alert("✅ Clinical Experience Logged. Thank you for your feedback.");
        fetchAppointments();
    } catch (err) {
        alert("Review submission failed.");
    }
  };

  const handleDismiss = (id) => {
    const newDismissed = [...dismissedIds, id];
    setDismissedIds(newDismissed);
    localStorage.setItem('purged_appointments', JSON.stringify(newDismissed));
    setAppointments(prev => prev.filter(a => a.appointmentId !== id));
  };

  const handlePurgeHistory = () => {
    if (!window.confirm("Initialize Data Purge? All cancelled and completed records will be permanently removed from this view console.")) return;
    const toPurge = appointments
      .filter(a => a.status?.toUpperCase() === 'CANCELLED' || a.status?.toUpperCase() === 'COMPLETED' || a.status?.toUpperCase() === 'NO_SHOW')
      .map(a => a.appointmentId);
    
    const newDismissed = [...new Set([...dismissedIds, ...toPurge])];
    setDismissedIds(newDismissed);
    localStorage.setItem('purged_appointments', JSON.stringify(newDismissed));
    setAppointments(prev => prev.filter(a => !toPurge.includes(a.appointmentId)));
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

  const handleReschedule = (apt) => {
    // Navigate to the specialist page to pick a new slot, passing the existing appointment ID
    navigate(`/doctor/${apt.providerId}?rescheduleId=${apt.appointmentId}`);
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
              <button 
                onClick={handlePurgeHistory}
                className="p-2 px-4 rounded-xl bg-rose-600/10 border border-rose-600/20 text-rose-500 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                title={isDoctor ? "Purge non-active clinical records" : "Clear my appointment history permanently"}
              >
                <Trash2 size={16} />
              </button>
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
                <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-30">
                  <button 
                    onClick={() => handleDismiss(apt.appointmentId)}
                    className="p-2 rounded-full hover:bg-rose-600/10 text-zinc-300 hover:text-rose-600 transition-all"
                    title="Purge record permanently"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

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

                  {canAction && (
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 self-center z-40">
                       {isDoctor && (
                         <>
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
                         </>
                       )}
                       
                       {!isDoctor && (
                         <button 
                           onClick={() => handleReschedule(apt)}
                           className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg active:scale-95"
                         >
                            <RefreshCw size={14} className="mr-1" /> Reschedule
                         </button>
                       )}

                       <button 
                         onClick={() => handleCancel(apt.appointmentId)}
                         className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-red-500/30 text-red-600 text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all active:scale-95 ${!isDoctor ? 'w-full' : ''}`}
                       >
                          <X size={14} /> {isDoctor ? 'Cancel' : 'Terminate Booking'}
                       </button>
                    </div>
                  )}

                  {!isDoctor && statusStr === 'COMPLETED' && !existingReviews[apt.appointmentId] && (
                    <div className="shrink-0 self-center z-40">
                       <button 
                          onClick={() => setReviewingAppt(apt)}
                          className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-amber-500 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-amber-600 transition-all shadow-xl shadow-amber-500/10 active:scale-95"
                       >
                          <Star size={16} className="fill-white" /> Share Experience
                       </button>
                    </div>
                  )}

                  {!isDoctor && existingReviews[apt.appointmentId] && (
                    <div className="shrink-0 self-center text-center px-4">
                       <div className="p-2 bg-emerald-50 dark:bg-emerald-900/10 rounded-full mb-1 inline-block">
                          <CheckCircle2 size={16} className="text-emerald-500" />
                       </div>
                       <p className="text-[8px] font-black uppercase tracking-tighter text-emerald-600">Feedback Logged</p>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* REVIEW MODAL */}
      {reviewingAppt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-300">
              <Card className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-[3rem] p-10 border-none shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-12 opacity-5"><Award size={140} /></div>
                  <button onClick={() => setReviewingAppt(null)} className="absolute top-8 right-8 text-zinc-400 hover:text-red-600 transition-all"><X size={24} /></button>
                  
                  <div className="relative z-10 space-y-8">
                      <div className="space-y-2">
                          <h2 className="text-3xl font-black tracking-tighter uppercase italic">Specalist Feedback</h2>
                          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">Logging experience with Dr. {reviewingAppt.providerName}</p>
                      </div>

                      <div className="space-y-6">
                          <div className="space-y-4">
                              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] block">Reputation Score</label>
                              <div className="flex gap-2">
                                  {[1,2,3,4,5].map(i => (
                                      <button key={i} onClick={() => setReviewForm({...reviewForm, rating: i})} className="group">
                                          <Star size={32} className={`${i <= reviewForm.rating ? 'fill-amber-500 text-amber-500' : 'text-zinc-200 dark:text-zinc-800'} transition-all transform hover:scale-110 active:scale-95`} />
                                      </button>
                                  ))}
                              </div>
                          </div>

                          <div className="space-y-3">
                              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] block">Clinical Remarks</label>
                              <textarea 
                                className="w-full h-32 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6 text-sm font-bold text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                                placeholder="Describe the medical consultation experience..."
                                value={reviewForm.comment}
                                onChange={e => setReviewForm({...reviewForm, comment: e.target.value})}
                              />
                          </div>

                          <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl">
                             <div className="flex items-center gap-3">
                                <MessageSquare size={18} className="text-red-600" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Identity Protection</span>
                             </div>
                             <div className="flex items-center gap-3">
                                <span className="text-[9px] font-bold text-zinc-400">Anonymous Mode</span>
                                <button onClick={() => setReviewForm({...reviewForm, isAnonymous: !reviewForm.isAnonymous})}
                                    className={`w-10 h-5 rounded-full relative transition-all duration-300 p-1
                                        ${reviewForm.isAnonymous ? 'bg-red-600' : 'bg-zinc-300 dark:bg-zinc-700'}`}>
                                    <div className={`w-3 h-3 bg-white rounded-full shadow-lg transition-transform ${reviewForm.isAnonymous ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                             </div>
                          </div>

                          <Button onClick={handleSubmitReview} className="w-full bg-zinc-900 dark:bg-red-600 text-white rounded-2xl py-6 font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-red-500/20">
                              Submit Signal To Network <ArrowRight size={18} className="ml-2" />
                          </Button>
                      </div>
                  </div>
              </Card>
          </div>
      )}
    </div>
  );
};
