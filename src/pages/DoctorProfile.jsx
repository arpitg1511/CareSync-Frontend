import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Stethoscope, 
  MapPin, 
  Star, 
  Calendar, 
  ShieldCheck, 
  Award,
  Clock,
  ChevronLeft,
  ArrowRight,
  Loader2,
  MessageSquare
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { providerService } from '../services/provider.service';
import { reviewService } from '../services/review.service';
import { patientService } from '../services/patient.service';
import { appointmentService } from '../services/appointment.service';
import useAuthStore from '../store/useAuthStore';

export const DoctorProfile = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ averageRating: 0 });
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    fetchDoctor();
  }, [id]);

  useEffect(() => {
    if (doctor) fetchSlots();
  }, [doctor, selectedDate]);

  const fetchDoctor = async () => {
    try {
      const docRes = await providerService.getById(id);
      setDoctor(docRes.data);
      
      try {
        const [reviewRes, ratingVal] = await Promise.all([
          reviewService.getByProvider(id),
          reviewService.getAvgRating(id)
        ]);
        
        // Enrich reviews with patient names
        const enrichedReviews = await Promise.all(reviewRes.data.map(async (rev) => {
           if (rev.isAnonymous) return { ...rev, patientName: 'Anonymous Patient' };
           try {
             const pRes = await patientService.getById(rev.patientId);
             return { ...rev, patientName: pRes.data.fullName || 'Verified Patient' };
           } catch (e) { return { ...rev, patientName: 'Verified Patient' }; }
        }));

        setReviews(enrichedReviews);
        if (ratingVal.data) {
          setStats({ 
            averageRating: ratingVal.data.avgRating || 0,
            totalReviews: ratingVal.data.totalReviews || 0
          });
        }
      } catch (e) {
        console.warn("Feedback Matrix Offline");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSlots = async () => {
    try {
      const res = await appointmentService.getSlots(id, selectedDate);
      setSlots(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (slot) => {
    if (!isAuthenticated) return navigate('/login');
    if (!user?.role?.toUpperCase().includes('PATIENT')) {
      alert("Authorization Discordance: Only Medical Entities with 'PATIENT' status can bind to these vectors.");
      return;
    }
    setBooking(true);
    try {
      await appointmentService.create({
        providerId: doctor.providerId,
        slotId: slot.slotId,
        appointmentDateTime: `${selectedDate}T${slot.startTime}`,
        reason: 'Regular Checkup'
      });
      navigate('/appointments');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to book slot');
    } finally {
      setBooking(false);
    }
  };

  if (!doctor && !loading) return <div className="p-20 text-center font-black text-zinc-500 uppercase tracking-widest">Medical Entity Not Found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 overflow-x-hidden w-full">
      <button onClick={() => navigate(-1)} className="flex items-center text-zinc-500 dark:text-zinc-400 hover:text-red-600 transition-all font-black text-xs uppercase tracking-widest mb-10 group">
        <ChevronLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Return to Specialist Matrix
      </button>

      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-12">
          {/* Header Info */}
          <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <Stethoscope size={160} />
            </div>
            
            <div className="flex flex-col md:flex-row gap-10 items-start relative z-10 w-full">
              <div className="w-40 h-40 md:w-56 md:h-56 rounded-3xl bg-red-50 dark:bg-zinc-800 flex items-center justify-center text-red-600 shadow-inner group overflow-hidden">
                <Stethoscope size={80} className="group-hover:rotate-12 transition-transform duration-500" />
              </div>
              
              <div className="flex-grow space-y-6 min-w-0">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border border-emerald-100 dark:border-emerald-800">
                      Identity Verified
                    </span>
                    <span className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border border-red-100 dark:border-red-800">
                      {(stats.averageRating > 0 || doctor?.avgRating > 0) ? "Top Specialist" : "Provisional Specialist"}
                    </span>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black text-zinc-900 dark:text-white tracking-tighter leading-none truncate uppercase italic">
                    {doctor?.fullName}
                  </h1>
                  <p className="text-xl font-bold text-red-600 dark:text-red-400 uppercase tracking-normal underline decoration-2 underline-offset-8">
                    {doctor?.specialization}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-zinc-600 dark:text-zinc-400 text-sm font-bold">
                  <div className="flex items-center"><MapPin size={20} className="mr-3 text-red-600" /> {doctor?.clinicName || 'Operational HQ'}</div>
                  <div className="flex items-center"><Award size={20} className="mr-3 text-red-600" /> {doctor?.experienceYears || '0'} YEARS CLINICAL EXP</div>
                  <div className="flex items-center"><Clock size={20} className="mr-3 text-red-600" /> STATUS: {doctor?.isAvailable ? 'ACTIVE' : 'INACTIVE'}</div>
                  <div className="flex items-center text-emerald-600 font-black tracking-tight"><ShieldCheck size={20} className="mr-3" /> FULL RECORD ENCRYPTION</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-12 w-full">
               <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl flex flex-col items-center border border-zinc-100 dark:border-zinc-800">
                  <span className="text-2xl font-black text-zinc-900 dark:text-white">{stats.averageRating > 0 ? stats.averageRating.toFixed(1) : (doctor?.avgRating?.toFixed(1) || '0.0')}</span>
                  <div className="flex text-amber-500 mb-1">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} size={10} className={i <= (stats.averageRating || doctor?.avgRating) ? "fill-current" : "text-zinc-300"} />
                    ))}
                  </div>
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center">Avg Rating</span>
               </div>
               <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl flex flex-col items-center border border-zinc-100 dark:border-zinc-800">
                  <span className="text-2xl font-black text-zinc-900 dark:text-white">{doctor?.experienceYears || '0'}</span>
                  <div className="h-2.5"></div>
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center">Exp Years</span>
               </div>
               <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl flex flex-col items-center border border-zinc-100 dark:border-zinc-800">
                  <span className="text-2xl font-black text-zinc-900 dark:text-white">{reviews.length}</span>
                  <div className="h-2.5"></div>
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center">Verified Reviews</span>
               </div>
            </div>
          </section>

          <section className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] p-10">
             <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-6">Expertise Vector</h3>
             <p className="text-zinc-600 dark:text-zinc-300 leading-loose text-lg font-medium italic border-l-4 border-red-600 pl-8">
                "{doctor?.bio || "No biography has been defined for this medical proxy."}"
             </p>
          </section>

          {/* Feedback Matrix */}
          <section className="space-y-8">
             <div className="flex items-center justify-between px-2">
                <div>
                   <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight italic">Feedback Matrix</h3>
                   <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1 mt-1">Synchronized Patient Signals</p>
                </div>
                <div className="flex items-center gap-2">
                   <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                   <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{reviews.length} Verified Records</span>
                </div>
             </div>

             <div className="grid gap-6">
                {reviews.length === 0 ? (
                  <div className="p-16 text-center bg-zinc-50 dark:bg-zinc-900/40 rounded-[2.5rem] border border-dashed border-zinc-200 dark:border-zinc-800">
                     <MessageSquare size={40} className="mx-auto text-zinc-200 mb-4" />
                     <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">No signals detected in this sector</p>
                  </div>
                ) : (
                  reviews.map(review => (
                    <Card key={review.reviewId} className="p-10 rounded-[2.5rem] border-zinc-100 dark:border-zinc-800 hover:shadow-2xl transition-all duration-500 group bg-white dark:bg-zinc-900 overflow-hidden relative">
                       <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                          <MessageSquare size={60} />
                       </div>
                       <div className="flex justify-between items-start mb-6 relative z-10">
                          <div className="flex items-center gap-1">
                             {[1,2,3,4,5].map(s => (
                               <Star key={s} size={14} className={`${s <= review.rating ? 'fill-amber-500 text-amber-500' : 'text-zinc-200'}`} />
                             ))}
                          </div>
                          <div className="flex items-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                             <Clock size={12} className="mr-2 text-red-600" /> {new Date(review.reviewDate || review.createdAt).toLocaleDateString()}
                          </div>
                       </div>
                       <p className="text-zinc-900 dark:text-zinc-200 text-lg font-medium leading-relaxed relative z-10 italic mb-8">
                          "{review.comment}"
                       </p>
                       <div className="flex items-center space-x-4 border-t border-zinc-100 dark:border-zinc-800 pt-8 mt-2 relative z-10">
                          <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[12px] font-black text-red-600">
                             {review.patientName?.charAt(0) || 'P'}
                          </div>
                          <div className="flex flex-col">
                             <span className="text-[11px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">{review.patientName}</span>
                             <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Verified Contributor</span>
                          </div>
                       </div>
                    </Card>
                  ))
                )}
             </div>
          </section>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-4 space-y-8 w-full">
          <Card className="sticky top-28 p-8 border-transparent bg-zinc-900 dark:bg-zinc-900 text-white rounded-[2.5rem] shadow-2xl shadow-red-500/10">
            <div className="space-y-8 w-full">
              <div className="space-y-2">
                 <h3 className="text-2xl font-black tracking-tight text-white">Resource Access</h3>
                 <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Initialization Protocol</p>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1">Synchronize Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500 w-5 h-5" />
                  <input 
                    type="date" 
                    className="w-full bg-zinc-800/50 border border-zinc-700/50 text-white rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-red-500 font-bold transition-all text-sm" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1">Available Vectors</label>
                {loading ? (
                   <div className="flex justify-center py-6"><Loader2 className="animate-spin text-red-400" /></div>
                ) : slots.length === 0 ? (
                  <div className="bg-zinc-800/30 border-2 border-dashed border-zinc-700/50 rounded-2xl py-10 text-center px-4">
                    <Clock size={32} className="mx-auto text-zinc-600 mb-3" />
                    <p className="text-zinc-400 text-xs font-black uppercase tracking-widest">No Vectors Available</p>
                    <p className="text-zinc-600 text-[10px] mt-1">Select a future synchronization point</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {slots.map(slot => (
                      <button
                        key={slot.slotId}
                        onClick={() => handleBook(slot)}
                        disabled={booking}
                        className="py-3.5 rounded-2xl bg-zinc-800 hover:bg-white hover:text-zinc-900 border border-zinc-700/50 text-xs font-black tracking-widest uppercase transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none group"
                      >
                        {slot.startTime} <ArrowRight size={10} className="inline ml-1 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-red-600/20 border border-red-500/30 p-5 rounded-2xl flex items-start space-x-4">
                 <ShieldCheck size={28} className="text-red-400 shrink-0" />
                 <div className="space-y-1">
                    <p className="text-xs font-black text-white leading-none">ZERO-KNOWLEDGE BINDING</p>
                    <p className="text-[10px] text-zinc-400 font-medium leading-tight">Your booking is cryptographically signed and routed through the secure gateway.</p>
                 </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
