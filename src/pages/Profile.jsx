import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Shield,
  Stethoscope,
  Clock,
  Award,
  MapPin,
  Save,
  Loader2,
  CheckCircle2,
  Heart,
  Globe,
  Fingerprint,
  Calendar
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';
import { authService } from '../services/auth.service';
import { providerService } from '../services/provider.service';
import { patientService } from '../services/patient.service';

export const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const isDoctor = user?.role === 'DOCTOR' || user?.role === 'ROLE_DOCTOR';
  const isPatient = user?.role === 'PATIENT' || user?.role === 'ROLE_PATIENT';
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN';

  // Consolidated Profile Data
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    isAvailable: true,
    providerId: null,
    // Doctor Specific
    specialization: '',
    bio: '',
    clinicName: '',
    clinicAddress: '',
    experienceYears: 0,
    qualification: '',
    contact: '',
    // Patient Specific
    bloodGroup: '',
    gender: '',
    dateOfBirth: '',
    medicalHistory: '',
    emergencyContact: '',
    patientId: null
  });

  useEffect(() => {
    if (isDoctor) {
      fetchMedicalProfile();
    }
    if (isPatient) {
      fetchPatientProfile();
    }
  }, [user]);

  const fetchMedicalProfile = async () => {
    try {
      const res = await providerService.getAll();
      const myProfile = res.data.find(p => p.email === user.email);
      if (myProfile) {
        setFormData(prev => ({
          ...prev,
          providerId: myProfile.providerId,
          isAvailable: myProfile.isAvailable,
          specialization: myProfile.specialization || '',
          bio: myProfile.bio || '',
          clinicName: myProfile.clinicName || '',
          clinicAddress: myProfile.clinicAddress || '',
          experienceYears: myProfile.experienceYears || 0,
          qualification: myProfile.qualification || '',
          contact: myProfile.contact || ''
        }));
      }
    } catch (err) {
      console.error("Error fetching medical profile:", err);
    }
  };

  const fetchPatientProfile = async () => {
    try {
      const { data } = await patientService.getMyProfile();
      setFormData(prev => ({
        ...prev,
        bloodGroup: data.bloodGroup || '',
        gender: data.gender || '',
        dateOfBirth: data.dateOfBirth || '',
        medicalHistory: data.medicalHistory || '',
        emergencyContact: data.emergencyContact || '',
        patientId: data.patientId
      }));
    } catch (err) {
      console.log("No patient dossier found yet.");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Update Core Identity (Auth Service)
      await authService.updateProfile(user.id, {
        fullName: formData.fullName,
        phone: formData.phone
      });

      // 2. Update Medical Dossier if Doctor (Provider Service)
      if (isDoctor && formData.providerId) {
        await providerService.update(formData.providerId, {
          name: formData.fullName,
          contact: formData.phone,
          specialization: formData.specialization,
          bio: formData.bio,
          clinicName: formData.clinicName,
          clinicAddress: formData.clinicAddress,
          experienceYears: formData.experienceYears,
          qualification: formData.qualification
        });
      }

      // 3. Update Patient Dossier if Patient
      if (isPatient) {
        const patientData = {
          bloodGroup: formData.bloodGroup,
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth,
          medicalHistory: formData.medicalHistory,
          emergencyContact: formData.emergencyContact,
          address: formData.clinicAddress
        };
        
        if (formData.patientId) {
            await patientService.updateProfile(patientData);
        } else {
            const { data } = await patientService.createProfile(patientData);
            setFormData(prev => ({ ...prev, patientId: data.patientId }));
        }
      }

      updateUser({ fullName: formData.fullName, phone: formData.phone });
      showSuccess();
    } catch (err) {
      alert(`Sync Failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    try {
      const newStatus = !formData.isAvailable;
      const targetId = formData.providerId;
      if (!targetId) throw new Error("Medical Profile Not Synchronized");

      await providerService.setAvailability(targetId, newStatus);
      setFormData(prev => ({ ...prev, isAvailable: newStatus }));
    } catch (err) {
      alert("Failed to toggle occupancy status.");
    }
  };

  const showSuccess = () => {
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      navigate(isDoctor ? '/doctors' : '/');
    }, 1500);
  };

  const handleGenerateSlots = () => {
    navigate('/doctor/schedule');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-zinc-200 dark:border-zinc-800">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-zinc-900 dark:text-white tracking-tighter">
            {isDoctor ? 'Professional Dossier' : 'Account Identity'}
          </h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs flex items-center">
            <Shield className="mr-2 text-red-600" size={14} /> Security Clearance: {user?.role?.replace('ROLE_', '')}
          </p>
        </div>
        {success && (
          <div className="flex items-center text-emerald-600 font-black animate-bounce bg-emerald-50 dark:bg-emerald-900/20 px-6 py-2 rounded-full border border-emerald-100 dark:border-emerald-800">
            <CheckCircle2 className="mr-2" size={20} /> CHANGES SYNCHRONIZED
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Sidebar info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-8 border-none bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-3xl shadow-xl overflow-hidden relative border border-zinc-200 dark:border-zinc-800">
              <div className="absolute top-0 right-0 p-6 opacity-5 dark:opacity-10 rotate-12 text-red-600 dark:text-white">
                {isDoctor ? <Stethoscope size={100} /> : (isAdmin ? <Shield size={100} /> : <Heart size={100} />)}
              </div>
              <div className="relative z-10 space-y-6">
                <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg text-white">
                  <span className="text-2xl font-black">{(formData.fullName || 'U').charAt(0)}</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black truncate">{formData.fullName || 'New User'}</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-xs font-bold truncate">{formData.email}</p>
                </div>
                <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
                  <div className="flex items-center text-xs font-bold text-zinc-500 dark:text-zinc-400">
                    <Globe size={14} className="mr-3 text-red-500" /> Distributed Architecture
                  </div>
                  <div className="flex items-center text-xs font-bold text-zinc-500 dark:text-zinc-400">
                    <Shield size={14} className="mr-3 text-red-500" /> End-to-End Encryption
                  </div>
                </div>
              </div>
            </Card>

            <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest leading-loose text-center px-4">
              Every modification is cryptographically signed and routed through the secure gateway clusters.
            </p>
          </div>

          {/* Main Form Area */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-8 md:p-10 space-y-8 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-3xl">
              <div className="space-y-8">
                {/* Section: Core Info */}
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] border-b border-zinc-100 dark:border-zinc-800 pb-2 text-center">Operational Pulse</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl flex items-center border border-zinc-100 dark:border-zinc-800">
                      <MapPin size={24} className="mr-4 text-red-600" />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Global Node</span>
                        <span className="text-xs font-black text-zinc-900 dark:text-white truncate max-w-[150px]">{formData.clinicAddress || 'UNSET VECTOR'}</span>
                      </div>
                    </div>
                    <div
                      onClick={isDoctor ? handleToggleAvailability : null}
                      className={`p-4 rounded-2xl flex items-center border transition-all ${isDoctor ? 'cursor-pointer hover:shadow-lg' : ''} ${formData.isAvailable ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30' : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-100 dark:border-zinc-800'}`}
                    >
                      <Clock size={24} className={`mr-4 ${formData.isAvailable ? 'text-emerald-500' : 'text-zinc-400'}`} />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Network Status</span>
                        <span className={`text-xs font-black ${formData.isAvailable ? 'text-emerald-600' : 'text-zinc-500'}`}>
                          {formData.isAvailable ? 'ACTIVE / READY' : 'INACTIVE / OFFLINE'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <h4 className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] border-b border-zinc-100 dark:border-zinc-800 pb-2">Core Identity</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Legal Full Name"
                      value={formData.fullName}
                      onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Dr. John Doe"
                      required
                    />
                    <Input
                      label="Registered Phone"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                {/* Section: Professional (Only for Doctors) */}
                {isDoctor && (
                  <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                    <h4 className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] border-b border-zinc-100 dark:border-zinc-800 pb-2">Medical Dossier</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Primary Specialization"
                        value={formData.specialization}
                        onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                        placeholder="e.g. Cardiologist"
                      />
                      <Input
                        label="Level of Qualification"
                        value={formData.qualification}
                        onChange={e => setFormData({ ...formData, qualification: e.target.value })}
                        placeholder="e.g. MBBS, MD"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 px-1">Professional Biography</label>
                      <textarea
                        className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-3xl p-6 text-sm font-medium outline-none focus:ring-2 focus:ring-red-600 transition-all min-h-[120px]"
                        value={formData.bio}
                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Your clinical expertise..."
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Facility Name"
                        value={formData.clinicName}
                        onChange={e => setFormData({ ...formData, clinicName: e.target.value })}
                      />
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 px-1">Clinical Experience: {formData.experienceYears} Years</label>
                        <input
                          type="range" min="0" max="50"
                          className="w-full accent-red-600"
                          value={formData.experienceYears}
                          onChange={e => setFormData({ ...formData, experienceYears: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>
                    <Input
                      label="Facility Physical Geo-Location"
                      icon={<MapPin size={18} />}
                      value={formData.clinicAddress}
                      onChange={e => setFormData({ ...formData, clinicAddress: e.target.value })}
                    />

                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={handleGenerateSlots}
                        className="w-full py-4 border-2 border-dashed border-red-200 dark:border-red-900/30 rounded-3xl text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all flex items-center justify-center"
                      >
                        <Calendar className="mr-3" size={16} /> Initialize Availability Clusters
                      </button>
                    </div>
                  </div>
                )}

                {isPatient && (
                  <div className="space-y-6 pt-8 border-t border-zinc-100 dark:border-zinc-800 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-xl font-black tracking-tight text-red-600 dark:text-red-500 uppercase italic">Medical Dossier</h3>
                        <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-1">Health Encapsulation Layer 01</p>
                      </div>
                      <div className="w-12 h-12 bg-red-50 dark:bg-red-950/20 rounded-2xl flex items-center justify-center border border-red-100 dark:border-red-900/30">
                        <Heart className="text-red-600" size={20} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Blood Group Classification"
                        icon={<Award size={18} />}
                        placeholder="e.g., A+ Positive"
                        value={formData.bloodGroup}
                        onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                      />
                      <Input
                        label="Identity Gender"
                        icon={<User size={18} />}
                        placeholder="e.g., Male / Female"
                        value={formData.gender}
                        onChange={e => setFormData({ ...formData, gender: e.target.value })}
                      />
                    </div>

                    <Input
                      label="Emergency Communication Proxy"
                      icon={<Phone size={18} />}
                      placeholder="Contact name and frequency/number"
                      value={formData.emergencyContact}
                      onChange={e => setFormData({ ...formData, emergencyContact: e.target.value })}
                    />

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 ml-1">
                            Critical Medical History & Vectors
                        </label>
                        <textarea
                            className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 text-sm font-medium text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500/20 transition-all min-h-[120px]"
                            placeholder="Detail chronic conditions, previous surgeries, or allergies..."
                            value={formData.medicalHistory}
                            onChange={e => setFormData({ ...formData, medicalHistory: e.target.value })}
                        />
                    </div>
                  </div>
                )}

                <Button type="submit" variant="danger" className="w-full text-lg py-5 rounded-3xl font-black shadow-xl shadow-red-500/20" isLoading={loading}>
                  Sync Global Identity <Save size={22} className="ml-3" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};
