import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Filter, Stethoscope, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { providerService } from '../services/provider.service';

export const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const specialities = ['All', 'Cardiologist', 'Dentist', 'Neurologist', 'Dermatologist', 'General Physician'];

  useEffect(() => {
    fetchDoctors();
  }, [activeFilter]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const speciality = activeFilter === 'All' ? null : activeFilter;
      const res = await providerService.getAll(speciality);
      setDoctors(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return fetchDoctors();
    setLoading(true);
    try {
      const res = await providerService.search(searchQuery);
      setDoctors(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10 overflow-x-hidden w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">Active Specialists</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-bold">Discover and connect with verified healthcare providers in real-time.</p>
        </div>
        
        <form onSubmit={handleSearch} className="flex w-full md:w-[26rem] gap-2 p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-red-500/20 transition-all">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4.5 h-4.5" />
            <input
              type="text"
              placeholder="Search by name or field..."
              className="w-full pl-11 pr-4 py-2.5 bg-transparent text-sm font-bold text-zinc-900 dark:text-white outline-none placeholder:text-zinc-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit" size="sm" className="rounded-xl px-6">Search</Button>
        </form>
      </div>

      <div className="flex overflow-x-auto pb-4 gap-3 scrollbar-hide no-scrollbar w-full">
        {specialities.map(s => (
          <button
            key={s}
            onClick={() => setActiveFilter(s)}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap border transition-all ${
              activeFilter === s 
                ? 'bg-red-600 border-red-600 text-white shadow-xl shadow-red-500/30' 
                : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-red-400 hover:text-red-600 shadow-sm'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-72 rounded-[2rem] bg-zinc-100 dark:bg-zinc-900/50 animate-pulse border border-zinc-200 dark:border-zinc-800" />
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <div className="py-20 text-center bg-zinc-50 dark:bg-zinc-900/30 rounded-[3rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
           <Stethoscope className="w-16 h-16 text-zinc-300 mx-auto mb-6" />
           <p className="text-zinc-500 font-black uppercase tracking-widest">Zero Specialists Found</p>
           <p className="text-zinc-400 text-xs mt-2">No medical proxies are currently registered in this synchronization cluster.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {doctors.map(doctor => (
            <Card key={doctor.providerId} className="group hover:-translate-y-2 transition-all duration-500 rounded-[2rem] p-0 border-transparent bg-white dark:bg-zinc-900 shadow-xl hover:shadow-2xl hover:shadow-red-500/5">
              <div className="p-8">
                <div className="flex items-start space-x-5">
                  <div className="w-20 h-20 rounded-2xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-600 relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                    <Stethoscope className="w-10 h-10" />
                    <div className="absolute inset-0 bg-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-zinc-900 ${doctor.isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-300'}`}></div>
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-black text-zinc-900 dark:text-white truncate group-hover:text-red-600 transition-colors uppercase tracking-tight">
                        {doctor.fullName}
                      </h3>
                    </div>
                    <p className="text-red-600 dark:text-red-400 text-xs font-black uppercase tracking-widest mt-1">
                      {doctor.specialization}
                    </p>
                    <div className="flex items-center text-zinc-400 text-sm mt-2 font-black">
                        <Star size={14} className="fill-current mr-1" />
                        <span>{doctor.avgRating || '0.0'}</span>
                        <span className="text-zinc-300 dark:text-zinc-700 mx-2">|</span>
                        <span className="text-zinc-400 font-bold select-none text-[10px] uppercase">Unrated Specialist</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-6 line-clamp-2 font-bold leading-relaxed italic">
                  "{doctor.bio || "No professional dossier provided yet. Profile awaiting synchronization."}"
                </p>

                <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center text-zinc-400 dark:text-zinc-500 text-xs font-black">
                     <MapPin size={14} className="mr-1.5 text-red-500" /> {doctor.clinicName || 'Unknown Location'}
                  </div>
                  <Button size="sm" className="rounded-xl px-5 font-black text-[11px] uppercase tracking-wider" onClick={() => (window.location.href = `/doctor/${doctor.providerId}`)}>
                    View Proxy <ChevronRight size={14} className="ml-1" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
