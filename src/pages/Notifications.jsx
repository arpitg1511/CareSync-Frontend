import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  Trash2, 
  RefreshCcw, 
  Clock, 
  AlertCircle,
  Calendar,
  CreditCard,
  MessageSquare
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { notificationService } from '../services/notification.service';
import { patientService } from '../services/patient.service';
import { providerService } from '../services/provider.service';
import useAuthStore from '../store/useAuthStore';

export const Notifications = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recipientId, setRecipientId] = useState(null);
  const [filter, setFilter] = useState('ALL'); 

  const isDoctor = user?.role === 'DOCTOR' || user?.role === 'ROLE_DOCTOR';

  useEffect(() => {
    if (isAuthenticated) resolveRecipientId();
  }, [isAuthenticated]);

  useEffect(() => {
    if (recipientId) fetchNotifications();
  }, [recipientId]);

  const resolveRecipientId = async () => {
    try {
      if (isDoctor) {
        const { data } = await providerService.getAll();
        const profile = data.find(p => p.email === user.email);
        if (profile) setRecipientId(profile.providerId);
      } else {
        const { data } = await patientService.getByEmail(user.email);
        if (data) setRecipientId(data.patientId);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await notificationService.getByRecipient(recipientId);
      setNotifications(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markRead(id);
      setNotifications(notifications.map(n => n.notificationId === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.delete(id);
      setNotifications(notifications.filter(n => n.notificationId !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead(recipientId);
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotifs = filter === 'UNREAD' 
    ? notifications.filter(n => !n.read) 
    : notifications;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">Notifications</h1>
          <p className="text-sm font-bold text-zinc-500">View and manage your recent alerts.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            Mark all as read
          </Button>
          <Button variant="secondary" size="sm" onClick={fetchNotifications}>
            <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-zinc-100 dark:bg-zinc-900/50 animate-pulse rounded-3xl" />)}
        </div>
      ) : filteredNotifs.length === 0 ? (
        <div className="py-24 text-center bg-zinc-50 dark:bg-zinc-900/30 rounded-[3rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
           <Bell className="w-16 h-16 text-zinc-200 dark:text-zinc-800 mx-auto mb-6" />
           <p className="text-zinc-400 font-black uppercase tracking-widest text-xs">No notifications found</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-1">
            {['ALL', 'UNREAD'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`pb-4 px-2 text-[11px] font-black uppercase tracking-widest transition-all relative ${filter === f ? 'text-red-600' : 'text-zinc-400 hover:text-zinc-600'}`}
              >
                {f} Notifications
                {filter === f && <div className="absolute bottom-0 left-0 w-full h-1 bg-red-600 rounded-full animate-in fade-in duration-300"></div>}
              </button>
            ))}
          </div>
          {filteredNotifs.map(n => (
            <Card key={n.notificationId} className={`p-6 rounded-2xl border-transparent transition-all group ${!n.read ? 'bg-zinc-50 dark:bg-zinc-900/50' : 'bg-white dark:bg-zinc-900'}`}>
              <div className="flex items-start gap-4">
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-sm font-black uppercase text-zinc-900 dark:text-white">{n.title}</h3>
                        <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400 leading-relaxed mt-1">{n.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase"><Clock size={12} className="inline mr-1" /> {new Date(n.createdAt).toLocaleString()}</span>
                    <div className="flex gap-3">
                       {!n.read && (
                         <button onClick={() => handleMarkRead(n.notificationId)} className="text-[10px] font-black text-emerald-600 uppercase hover:underline">Mark Read</button>
                       )}
                       <button onClick={() => handleDelete(n.notificationId)} className="text-[10px] font-black text-red-600 uppercase hover:underline">Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
