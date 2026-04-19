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
  Loader2
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { providerService } from '../services/provider.service';
import { appointmentService } from '../services/appointment.service';
import useAuthStore from '../store/useAuthStore';

export const DoctorProfile = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
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
      const res = await providerService.getById(id);
      setDoctor(res.data);
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
    if (user?.role !== 'PATIENT' && user?.role !== 'ROLE_PATIENT') {
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
                      Top Specialist
                    </span>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black text-zinc-900 dark:text-white tracking-tighter leading-none truncate">
                    {doctor?.fullName}
                  </h1>
                  <p className="text-xl font-bold text-red-600 dark:text-red-400 uppercase tracking-normal">
                    {doctor?.specialization}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-zinc-600 dark:text-zinc-400 text-sm font-bold">
                  <div className="flex items-center"><MapPin size={20} className="mr-3 text-red-600" /> {doctor?.clinicName || 'UNKNOWN LOCATION'}</div>
                  <div className="flex items-center"><Award size={20} className="mr-3 text-red-600" /> {doctor?.experienceYears || '0'} YEARS CLINICAL EXP</div>
                  <div className="flex items-center"><Clock size={20} className="mr-3 text-red-600" /> OPERATIONAL STATUS: {doctor?.isAvailable ? 'ACTIVE' : 'INACTIVE'}</div>
                  <div className="flex items-center text-emerald-600 font-black tracking-tight"><ShieldCheck size={20} className="mr-3" /> FULL RECORD ENCRYPTION</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-12 w-full">
               <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl flex flex-col items-center border border-zinc-100 dark:border-zinc-800">
                  <span className="text-2xl font-black text-zinc-900 dark:text-white">{doctor?.avgRating || '0.0'}</span>
                  <div className="flex text-zinc-300 mb-1"><Star size={10} className="fill-current"/><Star size={10} className="fill-current"/><Star size={10} className="fill-current"/><Star size={10} className="fill-current"/><Star size={10} className="fill-current"/></div>
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center">Entity Rating</span>
               </div>
               <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl flex flex-col items-center border border-zinc-100 dark:border-zinc-800">
                  <span className="text-2xl font-black text-zinc-900 dark:text-white">0</span>
                  <div className="h-2.5"></div>
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center">Total Sessions</span>
               </div>
               <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl flex flex-col items-center border border-zinc-100 dark:border-zinc-800">
                  <span className="text-2xl font-black text-zinc-900 dark:text-white">0</span>
                  <div className="h-2.5"></div>
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center">Reviews</span>
               </div>
            </div>
          </section>

          {/* Bio section */}
          <section className="space-y-6 px-4 w-full">
             <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Professional Dossier</h2>
             <p className="text-zinc-600 dark:text-zinc-400 leading-loose text-xl font-medium border-l-8 border-red-600 pl-8 italic">
                "{doctor?.bio || "No biography has been defined for this medical proxy."}"
             </p>
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
