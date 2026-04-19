import React, { useState, useEffect } from 'react';
import { 
    ShieldCheck, 
    UserCheck, 
    UserX, 
    Clock, 
    Stethoscope, 
    Mail, 
    ShieldAlert, 
    Award,
    Trash2,
    Users,
    Search
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { providerService } from '../services/provider.service';

export const Admin = () => {
  const [pending, setPending] = useState([]);
  const [active, setActive] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending'); // 'pending' or 'active'
  const [actioning, setActioning] = useState(null);

  useEffect(() => {
    fetchData();
  }, [tab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === 'pending') {
        const res = await providerService.getPending();
        setPending(res.data);
      } else {
        const res = await providerService.getAll();
        setActive(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch specialists:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActioning(id);
    try {
      await providerService.approve(id);
      setPending(pending.filter(p => p.providerId !== id));
    } catch (err) {
      alert('Approval failed.');
    } finally {
      setActioning(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this medical proxy?')) return;
    setActioning(id);
    try {
      await providerService.reject(id);
      setPending(pending.filter(p => p.providerId !== id));
    } catch (err) {
      alert('Rejection failed.');
    } finally {
      setActioning(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('🛡️ SECURITY ALERT: Are you sure you want to PERMANENTLY revoke these credentials? This action cannot be undone.')) return;
    setActioning(id);
    try {
      await providerService.deleteProfile(id);
      setActive(active.filter(p => p.providerId !== id));
    } catch (err) {
      alert('Deletion failed. System firewall may be active.');
    } finally {
      setActioning(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12 w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-zinc-100 dark:border-zinc-800 pb-10">
        <div className="space-y-2">
          <div className="flex items-center space-x-3 text-red-600 mb-2">
             <ShieldCheck size={24} />
             <span className="text-[10px] font-black uppercase tracking-[0.3em]">Administrative Overlay</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tighter">Entity Management</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-bold max-w-2xl">Manage medical specialists across the decentralized network clusters.</p>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <button 
                onClick={() => setTab('pending')}
                className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === 'pending' ? 'bg-white dark:bg-zinc-800 text-red-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
                Pending Authorization
            </button>
            <button 
                onClick={() => setTab('active')}
                className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === 'active' ? 'bg-white dark:bg-zinc-800 text-red-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
                Active Directory
            </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
           <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (tab === 'pending' ? pending : active).length === 0 ? (
        <div className="py-24 text-center bg-zinc-50 dark:bg-zinc-900/40 rounded-[3rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
           <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto mb-8">
              {tab === 'pending' ? <ShieldCheck size={40} /> : <Users size={40} />}
           </div>
           <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">Zero {tab} Entities</h2>
           <p className="text-zinc-500 dark:text-zinc-400 font-bold text-sm mt-3">All medical sub-entities are currently synchronized.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {(tab === 'pending' ? pending : active).map(doctor => (
            <Card key={doctor.providerId} className="group overflow-hidden rounded-[2.5rem] p-0 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl hover:shadow-2xl transition-all duration-500">
              <div className="flex flex-col lg:flex-row lg:items-center">
                <div className="p-8 lg:p-10 flex-grow space-y-8">
                  <div className="flex items-start space-x-6">
                    <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-500/20 shrink-0">
                       <Stethoscope size={28} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">{doctor.fullName}</h3>
                      <div className="flex items-center text-red-600 dark:text-red-400 text-xs font-black uppercase tracking-widest mt-1">
                         {doctor.specialization} <span className="mx-2 text-zinc-300">•</span> {doctor.qualification || 'Global Scholar'}
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Communication</span>
                      <div className="flex items-center text-sm font-bold text-zinc-700 dark:text-zinc-300 truncate">
                         <Mail size={16} className="mr-2 text-zinc-400 shrink-0" /> {doctor.email}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Experience</span>
                      <div className="flex items-center text-sm font-bold text-zinc-700 dark:text-zinc-300">
                         <Award size={16} className="mr-2 text-zinc-400" /> {doctor.experienceYears || '0'} Years Clinical
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Status</span>
                      <div className={`flex items-center text-[10px] font-black uppercase tracking-tighter px-3 py-1 rounded-full w-fit ${doctor.isVerified ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-red-50 dark:bg-red-900/20 text-red-600'}`}>
                         {doctor.status}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-8 lg:p-12 lg:h-full lg:min-w-[320px] flex flex-col justify-center space-y-4 border-t lg:border-t-0 lg:border-l border-zinc-100 dark:border-zinc-800">
                  {tab === 'pending' ? (
                    <>
                        <Button 
                            variant="primary" 
                            className="w-full h-14 rounded-2xl font-black shadow-lg shadow-emerald-500/10 !bg-emerald-600 hover:!bg-emerald-500 border-none uppercase tracking-widest text-xs"
                            onClick={() => handleApprove(doctor.providerId)}
                            isLoading={actioning === doctor.providerId}
                        >
                            <UserCheck className="mr-2 w-4 h-4" /> Authorize Entity
                        </Button>
                        <Button 
                            variant="secondary" 
                            className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs border-2"
                            onClick={() => handleReject(doctor.providerId)}
                            disabled={actioning === doctor.providerId}
                        >
                            <UserX className="mr-2 w-4 h-4" /> Reject Proxy
                        </Button>
                    </>
                  ) : (
                    <Button 
                        variant="danger" 
                        className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-red-500/10"
                        onClick={() => handleDelete(doctor.providerId)}
                        isLoading={actioning === doctor.providerId}
                    >
                        <Trash2 className="mr-2 w-4 h-4" /> Revoke Credentials
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Security Notice */}
      <div className="mt-16 bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 p-8 rounded-[2rem] flex items-start space-x-6">
         <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border border-red-100 dark:border-red-900/30 flex items-center justify-center text-red-600 shrink-0 shadow-sm">
            <ShieldAlert size={24} />
         </div>
         <div className="space-y-2">
            <h4 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">Security Protocol Verification</h4>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm leading-relaxed">
               Credential revocation is immediate and global. Once an entity is purged from the active directory, all associated tokens are invalidated across the microservice mesh.
               Ensure you have documented the cause of revocation for the global audit log.
            </p>
         </div>
      </div>
    </div>
  );
};
