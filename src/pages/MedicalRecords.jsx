import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  User, 
  Stethoscope, 
  Search,
  ExternalLink,
  Plus,
  ArrowRight
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';

export const MedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) fetchRecords();
  }, [user]);

  const fetchRecords = async () => {
    try {
      const res = await api.get(`/records/patient/${user.id}`);
      setRecords(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(r => 
    r.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.prescription.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12 font-sans overflow-x-hidden w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tighter">Medical Dossier</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-bold mt-2">Authenticated repository of health diagnostic data and telemetry.</p>
        </div>
        
        <div className="flex w-full md:w-auto gap-3">
           <div className="relative flex-grow md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Query by diagnosis..."
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl outline-none font-bold text-sm shadow-sm transition-all focus:ring-2 focus:ring-red-500/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Summary Info */}
        <div className="lg:col-span-3 space-y-8">
           <Card className="bg-red-600 dark:bg-red-600 border-none shadow-2xl shadow-red-500/30 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <FileText size={100} />
              </div>
              <div className="relative z-10">
                <p className="text-[10px] text-red-100 font-black uppercase tracking-[0.2em] mb-2">Authenticated Entries</p>
                <h3 className="text-6xl font-black tracking-tighter">{records.length}</h3>
                <div className="mt-8 pt-6 border-t border-white/10 flex items-center text-[10px] text-white/60 font-black uppercase tracking-widest">
                   <Calendar className="w-4 h-4 mr-2" /> Synced: {new Date().toLocaleDateString()}
                </div>
              </div>
           </Card>
           
           <div className="space-y-3 px-2">
              <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Dossier Actions</h4>
              <button className="w-full flex items-center p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all font-bold text-sm text-zinc-700 dark:text-zinc-300 shadow-sm active:scale-95">
                 <Download size={20} className="mr-4 text-red-600" /> Export Encryption Node (PDF)
              </button>
              <button className="w-full flex items-center p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all font-bold text-sm text-zinc-700 dark:text-zinc-300 shadow-sm active:scale-95">
                 <Plus size={20} className="mr-4 text-red-600" /> Append External History
              </button>
           </div>
        </div>

        {/* Records List */}
        <div className="lg:col-span-9 w-full">
           {loading ? (
             <div className="space-y-6">
                {[1,2,3].map(i => <div key={i} className="h-56 bg-zinc-100 dark:bg-zinc-900/50 animate-pulse rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800" />)}
             </div>
           ) : (
             <div className="grid gap-8 w-full">
                {filteredRecords.map(record => (
                  <Card key={record.recordId} className="hover:border-red-600/30 group transition-all duration-500 rounded-[2.5rem] border-transparent bg-white dark:bg-zinc-900 shadow-xl p-0 overflow-hidden w-full">
                     <div className="p-10 w-full">
                        <div className="flex flex-col md:flex-row justify-between md:items-start gap-6 mb-10 w-full">
                           <div className="flex items-start space-x-6 min-w-0">
                              <div className="w-16 h-16 rounded-[1.25rem] bg-red-50 dark:bg-zinc-800 text-red-600 flex items-center justify-center shadow-inner group-hover:rotate-3 transition-transform">
                                 <FileText size={32} />
                              </div>
                              <div className="space-y-1 min-w-0">
                                 <h4 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter leading-none truncate">{record.diagnosis}</h4>
                                 <div className="flex items-center text-xs font-black text-zinc-400 uppercase tracking-widest pt-1">
                                    <Calendar size={14} className="mr-2 text-red-600" /> Commited: {new Date(record.createdAt).toLocaleDateString()}
                                 </div>
                              </div>
                           </div>
                           <Button variant="secondary" className="rounded-xl px-6 py-3 font-black text-[10px] uppercase tracking-widest shadow-sm">
                              <Download size={16} className="mr-2" /> Retrieve Source
                           </Button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-12 w-full">
                           <div className="space-y-4">
                              <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] px-1">Prescription Key</span>
                              <p className="text-zinc-900 dark:text-zinc-100 text-lg font-bold leading-relaxed p-6 bg-zinc-50 dark:bg-zinc-900 rounded-[1.5rem] border border-zinc-100 dark:border-zinc-800 shadow-inner">
                                 {record.prescription}
                              </p>
                           </div>
                           <div className="space-y-4">
                              <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] px-1">Specialist Remarks</span>
                              <div className="flex items-start space-x-4 p-6 bg-red-50/10 dark:bg-red-900/10 rounded-[1.5rem] border border-red-100 dark:border-red-900/20">
                                 <Stethoscope className="w-6 h-6 text-red-600 shrink-0 mt-1" />
                                 <p className="text-zinc-600 dark:text-red-400 font-bold italic leading-relaxed">
                                    "{record.notes || "Medical proxy has not provided additional telemetry for this entry."}"
                                 </p>
                              </div>
                           </div>
                        </div>
                     </div>
                     
                     {record.followUpDate && (
                       <div className="px-10 py-5 bg-red-600 text-white flex justify-between items-center group/footer">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center">
                             <Calendar size={14} className="mr-3 text-red-200" /> Next Verification: {new Date(record.followUpDate).toLocaleDateString()}
                          </p>
                          <button className="text-[11px] font-black uppercase tracking-widest flex items-center hover:translate-x-1 transition-transform">
                             Initialize Request <ArrowRight size={14} className="ml-2" />
                          </button>
                       </div>
                     )}
                  </Card>
                ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
