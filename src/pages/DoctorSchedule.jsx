import React, { useState, useEffect } from 'react';
import {
    Calendar as CalendarIcon,
    Clock,
    Plus,
    Trash2,
    Lock,
    Unlock,
    Loader2,
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    AlertTriangle,
    User,
    ShieldAlert,
    CalendarDays,
    Activity,
    Zap
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';

export const DoctorSchedule = () => {
    const { user } = useAuthStore();
    const [viewDate, setViewDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [slots, setSlots] = useState([]);
    const [allSlots, setAllSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [providerId, setProviderId] = useState(null);
    const [profileMissing, setProfileMissing] = useState(false);

    // Generation Config
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('17:00');
    const [interval, setInterval] = useState(30);

    useEffect(() => {
        fetchProviderId();
    }, []);

    useEffect(() => {
        if (providerId) {
            fetchSlots();
        }
    }, [providerId]);

    // Update displayed slots when selectedDate or allSlots changes
    useEffect(() => {
        const filtered = allSlots.filter(s => s.date === selectedDate);
        setSlots(filtered.sort((a, b) => a.startTime.localeCompare(b.startTime)));
    }, [selectedDate, allSlots]);

    const fetchProviderId = async () => {
        try {
            const { data } = await api.get(`/providers/email/${user.email}`);
            setProviderId(data.providerId);
            setProfileMissing(false);
        } catch (err) {
            console.error("Provider profile not found");
            setProfileMissing(true);
        }
    };

    if (profileMissing) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-32 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in duration-700">
                <div className="w-24 h-24 bg-red-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-red-500/40 rotate-12">
                    <ShieldAlert className="text-white -rotate-12" size={48} />
                </div>
                <div className="space-y-4 max-w-lg">
                    <h1 className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase italic">
                        Identity <span className="text-red-600">Verification</span> Required
                    </h1>
                    <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest leading-relaxed">
                        To command schedule vectors, you must first synchronize your professional clinical dossier in the profile console.
                    </p>
                </div>
                <Button
                    variant="danger"
                    className="px-10 py-5 rounded-2xl font-black shadow-lg shadow-red-500/20"
                    onClick={() => window.location.href = '/profile'}
                >
                    INITIALIZE PROFESSIONAL DOSSIER <ChevronRight className="ml-2" size={20} />
                </Button>
            </div>
        );
    }

    const fetchSlots = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/slots/provider/${providerId}`);
            setAllSlots(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (slots.length > 0) {
            if (!window.confirm(`Warning: Overlapping vectors detected. Do you want to wipe existing ${slots.length} slots for ${selectedDate} first?`)) {
                return;
            }
            // Backend now handles atomic purge during bulk POST
        }

        setGenerating(true);
        try {
            const newSlots = [];
            let current = new Date(`${selectedDate}T${startTime}`);
            const end = new Date(`${selectedDate}T${endTime}`);

            while (current < end) {
                const next = new Date(current.getTime() + interval * 60000);
                newSlots.push({
                    providerId,
                    date: selectedDate,
                    startTime: current.toTimeString().split(' ')[0],
                    endTime: next.toTimeString().split(' ')[0],
                    durationMinutes: interval
                });
                current = next;
            }

            await api.post('/slots/bulk', newSlots);
            fetchSlots();
        } catch (err) {
            alert("Matrix Collision: Backend rejected overlapping vectors.");
        } finally {
            setGenerating(false);
        }
    };

    const handleDelete = async (slotId, isBooked) => {
        const msg = isBooked
            ? "CRITICAL: This vector is already synchronized with a patient booking. Deleting it will trigger a cancellation alert. Proceed?"
            : "Remove this time vector from your active schedule?";

        if (!window.confirm(msg)) return;

        try {
            await api.delete(`/slots/${slotId}`);
            setSlots(slots.filter(s => s.slotId !== slotId));
        } catch (err) {
            alert("Lock Failure: Could not release slot.");
        }
    };

    const handleBlock = async (slotId, currentStatus) => {
        try {
            if (currentStatus) await api.put(`/slots/${slotId}/unblock`);
            else await api.put(`/slots/${slotId}/block`);
            fetchSlots();
        } catch (err) {
            console.error(err);
        }
    };

    // Calendar Generation Logic
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        return { days, firstDay };
    };

    const { days, firstDay } = getDaysInMonth(viewDate);
    const monthName = viewDate.toLocaleString('default', { month: 'long' });

    return (
        <div className="max-w-[1600px] mx-auto px-6 py-10 min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <div className="flex flex-col xl:flex-row gap-10">

                {/* 🗓️ CENTER: MEGA CALENDAR */}
                <div className="flex-grow space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-5xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase italic">
                                Vector <span className="text-red-600">Distribution</span>
                            </h1>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-[0.4em] mt-3 flex items-center">
                                <Activity className="mr-2 text-red-500" size={14} /> Schedule Command Interface Layer 02
                            </p>
                        </div>
                        <div className="flex items-center space-x-3 bg-white dark:bg-zinc-900 p-2 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                            <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))} className="p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-colors"><ChevronLeft size={20} /></button>
                            <span className="px-6 font-black uppercase text-sm tracking-widest">{monthName} {viewDate.getFullYear()}</span>
                            <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))} className="p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-colors"><ChevronRight size={20} /></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-4">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <div key={d} className="text-center py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">{d}</div>
                        ))}
                        {[...Array(firstDay)].map((_, i) => <div key={`empty-${i}`} />)}
                        {[...Array(days)].map((_, i) => {
                            const day = i + 1;
                            const dateStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const isSelected = selectedDate === dateStr;
                            const todayStr = new Date().toISOString().split('T')[0];
                            const isPastDate = dateStr < todayStr;
                            const isToday = todayStr === dateStr;

                            const hasBooked = allSlots.some(s => s.date === dateStr && (s.isBooked || s.booked));
                            const hasAvailable = allSlots.some(s => s.date === dateStr && !(s.isBooked || s.booked) && !(s.isBlocked || s.blocked));

                            return (
                                <button
                                    key={day}
                                    onClick={() => setSelectedDate(dateStr)}
                                    disabled={isPastDate}
                                    className={`aspect-square rounded-[2rem] border transition-all duration-300 flex flex-col items-center justify-center space-y-2 relative group overflow-hidden ${isPastDate ? 'opacity-40 cursor-not-allowed bg-zinc-50 dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800/50' :
                                            isSelected
                                                ? 'bg-red-600 border-red-500 shadow-xl shadow-red-500/30 text-white scale-105 z-10'
                                                : hasBooked
                                                    ? 'bg-yellow-400 dark:bg-yellow-500 border-yellow-500 text-black shadow-lg shadow-yellow-500/30 hover:scale-105 z-0'
                                                    : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 hover:border-red-500/50 text-zinc-900 dark:text-zinc-400'
                                        }`}
                                >
                                    <span className="text-2xl font-black italic">{day}</span>
                                    {isToday && <span className={`text-[8px] font-black uppercase tracking-tighter ${isSelected ? 'text-white/80' : hasBooked ? 'text-black/50' : 'text-red-500'}`}>Today</span>}

                                    {/* Indicator for available (unbooked) slots on non-yellow days */}
                                    <div className="absolute bottom-3 flex space-x-1">
                                        {hasAvailable && !hasBooked && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/60' : 'bg-red-400'}`}></div>}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 📋 RIGHT: VECTOR INSPECTOR */}
                <div className="xl:w-[450px] space-y-6">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-zinc-900 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                        <Card className="relative bg-white dark:bg-zinc-950 border-zinc-100 dark:border-zinc-800 p-8 rounded-[2.5rem] shadow-2xl space-y-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-black uppercase italic tracking-tighter">Vector Generator</h2>
                                <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-2xl">
                                    <Zap className="text-red-600 fill-red-600" size={20} />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Entry Point"
                                        type="time"
                                        value={startTime}
                                        onChange={e => setStartTime(e.target.value)}
                                        icon={<Clock size={18} />}
                                    />
                                    <Input
                                        label="Termination"
                                        type="time"
                                        value={endTime}
                                        onChange={e => setEndTime(e.target.value)}
                                        icon={<Clock size={18} />}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 ml-1">
                                        Sharding Interval
                                    </label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {[15, 30, 45, 60, 120].map(val => (
                                            <button
                                                key={val}
                                                type="button"
                                                onClick={() => setInterval(val)}
                                                className={`py-3 rounded-xl text-[10px] font-black transition-all border ${interval === val
                                                        ? 'bg-red-600 border-red-500 text-white shadow-lg'
                                                        : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-400'
                                                    }`}
                                            >
                                                {val === 120 ? '2h' : `${val}m`}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <Button
                                    variant="danger"
                                    className="w-full py-5 rounded-3xl font-black shadow-xl shadow-red-500/20"
                                    onClick={handleGenerate}
                                    isLoading={generating}
                                    disabled={startTime >= endTime || !providerId || selectedDate < new Date().toISOString().split('T')[0]}
                                >
                                    {!providerId ? 'LOADING IDENTITY...' : (selectedDate < new Date().toISOString().split('T')[0] ? 'DATE HAS PASSED' : (startTime >= endTime ? 'INVALID TIME ENTROPY' : 'SYNCHRONIZE VECTOR DAY'))} <ChevronRight className="ml-2" size={20} />
                                </Button>
                            </div>
                        </Card>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 italic">Day Vectors: {selectedDate}</h3>
                            <span className="text-[10px] font-bold px-3 py-1 bg-zinc-100 dark:bg-zinc-900 rounded-full text-zinc-400">{slots.length} Units</span>
                        </div>

                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {loading ? (
                                <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-red-600" size={32} /></div>
                            ) : slots.length === 0 ? (
                                <div className="p-10 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] text-center space-y-3">
                                    <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-900 rounded-2xl mx-auto flex items-center justify-center"><CalendarDays className="text-zinc-300" size={20} /></div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Empty Vector Matrix</p>
                                </div>
                            ) : (
                                slots.map(slot => (
                                    <div
                                        key={slot.slotId}
                                        className={`p-5 rounded-3xl border transition-all group relative overflow-hidden ${slot.booked
                                                ? 'bg-red-600 border-red-500 text-white shadow-lg'
                                                : slot.blocked
                                                    ? 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
                                                    : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between relative z-10">
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${slot.booked ? 'bg-white/20' : 'bg-red-50 dark:bg-zinc-800'}`}>
                                                    <Clock size={16} className={slot.booked ? 'text-white' : 'text-red-600'} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black italic">{slot.startTime.substring(0, 5)} — {slot.endTime.substring(0, 5)}</p>
                                                    <p className={`text-[10px] font-bold uppercase tracking-tighter ${slot.booked ? 'text-white/80' : 'text-zinc-400'}`}>
                                                        {slot.booked ? 'SYNCED WITH PATIENT' : slot.blocked ? 'OFFLINE MATRIX' : 'ACTIVE VECTOR'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                {!slot.booked && (
                                                    <button
                                                        onClick={() => handleBlock(slot.slotId, slot.blocked)}
                                                        className={`p-2 rounded-lg transition-colors ${slot.booked ? 'hover:bg-white/20 text-white' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400'}`}
                                                    >
                                                        {slot.blocked ? <Unlock size={16} /> : <Lock size={16} />}
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(slot.slotId, slot.booked)}
                                                    className={`p-2 rounded-lg transition-colors ${slot.booked ? 'hover:bg-white/20 text-white' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400'}`}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        {slot.booked && (
                                            <div className="mt-4 pt-4 border-t border-white/20 flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center"><User size={14} /></div>
                                                <div className="flex-grow">
                                                    <p className="text-[10px] font-black uppercase tracking-tighter text-white/80 leading-none">Identity Linked</p>
                                                    <p className="text-[12px] font-black mt-1">Patient Vector Synchronized</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
