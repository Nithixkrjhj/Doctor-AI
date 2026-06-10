import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, User, Phone, Mail, ArrowLeft, Trash2, Check, 
  ExternalLink, Video, AlertCircle, FileText, Search, Printer, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { Appointment } from '../types';

interface MyAppointmentsProps {
  currentUser: { id: string; name: string; email: string; phone: string } | null;
  onGoBack: () => void;
  onBookNew: () => void;
}

export default function MyAppointments({ currentUser, onGoBack, onBookNew }: MyAppointmentsProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null);
  const [joiningTelehealthId, setJoiningTelehealthId] = useState<string | null>(null);
  const [printingId, setPrintingId] = useState<string | null>(null);

  // Load appointments
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/appointments');
      if (res.ok) {
        const data = await res.json();
        // Since we want to display either the logged-in patient's appointments or all appointments in the mock system,
        // we'll filter by email if currentUser is logged in, or show all if there's no filter.
        if (currentUser) {
          const filtered = data.filter((appt: Appointment) => 
            appt.patientEmail?.toLowerCase() === currentUser.email?.toLowerCase() ||
            appt.patientPhone === currentUser.phone
          );
          setAppointments(filtered);
        } else {
          setAppointments(data);
        }
      }
    } catch (err) {
      console.error("Failed to load clinical schedules", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [currentUser]);

  // Handle appointment cancellation
  const handleCancelAppointment = async (id: string) => {
    setCancellingId(id);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setAppointments(appointments.filter(appt => appt.id !== id));
        setShowCancelConfirm(null);
      } else {
        alert("Failed to submit cancellation request to the server.");
      }
    } catch (err) {
      console.error(err);
      alert("Network timeout. Could not complete cancellation.");
    } finally {
      setCancellingId(null);
    }
  };

  // Simulate telemedicine join room connection
  const handleJoinTelehealth = (id: string) => {
    setJoiningTelehealthId(id);
  };

  // Simulate receipt slip printing helper
  const handlePrintSlip = (id: string) => {
    setPrintingId(id);
    setTimeout(() => {
      setPrintingId(null);
      alert("Clinical confirmation receipt compiled and successfully piped to your system print framework template.");
    }, 1500);
  };

  // Filter schedules based on search text (doctor name or specialty)
  const filteredAppointments = appointments.filter(appt => 
    appt.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    appt.doctorSpecialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
    appt.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6 animate-fade-in" id="my-appointments-page">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-indigo-100">
        <div className="flex items-center space-x-3.5">
          <button 
            onClick={onGoBack}
            className="p-2 bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl transition-all shadow-xs active:scale-90 cursor-pointer flex items-center justify-center group"
            id="back-to-home-from-appointments"
            title="Go back to Home"
          >
            <ArrowLeft className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1 group-active:scale-90" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-sky-100 text-sky-800 text-[9.5px] font-bold font-mono tracking-wider px-2 py-0.5 rounded uppercase">
                Patient Outpatient Desk
              </span>
            </div>
            <h1 className="text-3xl font-display font-black text-slate-900 tracking-tight mt-0.5">
              Scheduled Appointments
            </h1>
          </div>
        </div>

        <button 
          onClick={onBookNew}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow-md transition-all active:scale-97 cursor-pointer flex items-center justify-center space-x-1.5"
        >
          <Calendar className="h-4.5 w-4.5" />
          <span>Register New Consultation</span>
        </button>
      </div>

      {/* Dynamic Diagnostic Workspace Indicator */}
      <div className="bg-gradient-to-r from-teal-50 to-emerald-50/50 border border-teal-100 rounded-2xl p-4 flex items-start space-x-3 shadow-xs">
        <ShieldCheck className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-teal-900 leading-relaxed">
          <strong className="font-bold">Clinic Sync Active</strong>: All patient consultation records are permanently stored in the local clinical records ledger repository. Telehealth consultations will open secure video channel streams directly under custom peer handshake tunnels.
        </div>
      </div>

      {/* Main List Layout Container */}
      <div className="space-y-4">
        
        {/* Filter and Search Bar widget */}
        {appointments.length > 0 && (
          <div className="relative" id="appointments-filter-widget">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4.5 w-4.5" />
            </span>
            <input 
              type="text"
              placeholder="Search by physician name, clinical specialty, or registration ticket ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/85 backdrop-blur-xs border border-slate-205 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 shadow-2xs"
            />
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3 bg-white/50 border border-slate-100/80 rounded-2xl">
            <div className="h-8 w-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono text-slate-500">Retrieving encrypted hospital appointments...</span>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-16 px-6 bg-white/70 backdrop-blur-xs border border-slate-100 rounded-3xl space-y-6 shadow-xs">
            <div className="p-4 bg-indigo-50 rounded-full inline-flex text-indigo-600">
              <Calendar className="h-10 w-10 animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-800">No appointments scheduled</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                {currentUser 
                  ? "We couldn't find any pending appointments registered under your diagnostic profile. Book your care now!"
                  : "Login to review your patient file, or consult the Voice Symptom Dispatcher to book an instant assessment."}
              </p>
            </div>

            <div className="flex justify-center gap-3">
              <button 
                onClick={onBookNew}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Browse Clinic Doctors
              </button>
            </div>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-12 bg-white/65 rounded-2xl border border-slate-100 text-slate-500 text-xs">
            No matching appointments found for "<strong className="text-slate-800 font-bold">{searchQuery}</strong>".
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appt) => {
              const isDetailsOpen = joiningTelehealthId === appt.id;
              
              return (
                <div 
                  key={appt.id}
                  className="bg-white/80 backdrop-blur-xs border border-slate-200/60 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300"
                  id={`appointment-card-${appt.id}`}
                >
                  {/* Top clinical status header band */}
                  <div className="bg-slate-900 text-slate-200 px-5 py-3 flex flex-wrap justify-between items-center gap-2 border-b border-slate-800">
                    <div className="flex items-center space-x-2.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] font-mono tracking-wider font-extrabold text-slate-300 uppercase">Confirmed Patient Ticket</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-900">
                      ID: {appt.id}
                    </span>
                  </div>

                  {/* Main Details Body */}
                  <div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
                    
                    {/* Left Column: Doctor Profile info */}
                    <div className="md:col-span-8 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg font-display flex-shrink-0">
                          {appt.doctorName.startsWith('Dr.') ? appt.doctorName.substring(3).charAt(0) : appt.doctorName.charAt(0)}
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-base font-bold text-slate-950 tracking-tight uppercase">
                            {appt.doctorName}
                          </h3>
                          <div className="flex flex-wrap gap-2 items-center">
                            <span className="bg-indigo-50 border border-indigo-100/70 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                              {appt.doctorSpecialty}
                            </span>
                            <span className="text-slate-400 text-xs">•</span>
                            <span className="text-slate-500 text-xs font-semibold">Telehealth Certified Spec.</span>
                          </div>
                        </div>
                      </div>

                      {/* Diagnostic Symptoms analysis summary section */}
                      {appt.symptomsAnalysed && appt.symptomsAnalysed.length > 0 && (
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2">
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 block">Symptom Diagnostic Summary (Acoustic Match)</span>
                          <div className="flex flex-wrap gap-1.5">
                            {appt.symptomsAnalysed.map((sym, index) => (
                              <span 
                                key={index} 
                                className="bg-white text-slate-700 border border-slate-205 text-[10px] font-mono px-2 py-0.5 rounded-md shadow-2xs"
                              >
                                {sym}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Patient Registered Profile */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-dashed border-slate-105">
                        <div className="space-y-1">
                          <span className="text-[9.5px] font-mono text-slate-400 uppercase block">Registered Recipient</span>
                          <div className="flex items-center space-x-1.5 text-xs text-slate-800 font-bold">
                            <User className="h-3.5 w-3.5 text-indigo-500" />
                            <span>{appt.patientName}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9.5px] font-mono text-slate-400 uppercase block">In-Checkup Contacts</span>
                          <div className="space-y-0.5 text-[11px] text-slate-500 font-semibold font-mono">
                            <div className="flex items-center space-x-1.5">
                              <Mail className="h-3.5 w-3.5 text-slate-400" />
                              <span>{appt.patientEmail}</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              <Phone className="h-3.5 w-3.5 text-slate-400" />
                              <span>{appt.patientPhone}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Time Slot Scheduling info & Actions Panel */}
                    <div className="md:col-span-4 bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between space-y-4">
                      
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <span className="text-[9.5px] font-mono text-slate-400 uppercase block">Consultation Schedule</span>
                          <div className="space-y-1.5">
                            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                              <Calendar className="h-4 w-4 text-indigo-600" />
                              <span>{appt.date}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                              <Clock className="h-4 w-4 text-indigo-600" />
                              <span>{appt.timeSlot}</span>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-slate-200/55 pt-3">
                          <span className="text-[9.5px] font-mono text-slate-400 uppercase block">Receipt Admission Fee</span>
                          <div className="flex items-baseline space-x-1">
                            <span className="text-xl font-black text-slate-900">₹{appt.feePaid}.00</span>
                            <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1 rounded">PAID</span>
                          </div>
                        </div>
                      </div>

                      {/* Direct clinical service operations */}
                      <div className="space-y-2 pt-2">
                        <button
                          onClick={() => handleJoinTelehealth(appt.id)}
                          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs"
                        >
                          <Video className="h-3.5 w-3.5" />
                          <span>Start Telehealth Call</span>
                        </button>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handlePrintSlip(appt.id)}
                            disabled={printingId === appt.id}
                            className="py-1.5 bg-white border border-slate-205 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                          >
                            <Printer className="h-3.5 w-3.5 text-slate-400" />
                            <span>{printingId === appt.id ? 'Loading...' : 'Print Slip'}</span>
                          </button>

                          <button
                            onClick={() => setShowCancelConfirm(appt.id)}
                            className="py-1.5 bg-white border border-rose-200 hover:bg-rose-50/50 text-rose-600 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Cancel</span>
                          </button>
                        </div>
                      </div>

                    </div>

                  </div>

                  {/* Inside card: Interactive Telehealth Consultation Screen Simulacrum */}
                  {isDetailsOpen && (
                    <div className="bg-slate-950 text-white p-5 border-t border-slate-800 space-y-4 animate-slide-up" id="telehealth-sim-screen">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div className="flex items-center space-x-2">
                          <div className="p-1 px-1.5 bg-teal-500/10 text-teal-400 rounded border border-teal-500/20 text-[9.5px] font-mono uppercase font-bold animate-pulse">
                            Secure Tunnel Connected
                          </div>
                          <h4 className="text-xs font-bold text-white font-display">DocAI Secure Virtual Consult Room</h4>
                        </div>
                        <button 
                          onClick={() => setJoiningTelehealthId(null)}
                          className="text-slate-400 hover:text-white text-[11px] font-semibold hover:underline"
                        >
                          Minimize Stream
                        </button>
                      </div>

                      <div className="bg-slate-900 rounded-xl relative overflow-hidden aspect-video border border-slate-800 max-w-lg mx-auto flex flex-col justify-between p-4">
                        <div className="flex items-center justify-between text-[11px] font-mono z-10">
                          <span className="bg-slate-950/80 px-2 py-0.5 rounded text-teal-400 font-bold">● HOST IP V6 TRACE</span>
                          <span className="bg-rose-600 px-2 py-0.5 rounded text-white font-bold animate-pulse">LIVE FEED</span>
                        </div>

                        {/* Interactive Screen graphic representing doc */}
                        <div className="text-center space-y-2 py-8 z-10">
                          <div className="h-14 w-14 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-400 inline-flex items-center justify-center animate-pulse">
                            <Video className="h-7 w-7" />
                          </div>
                          <div>
                            <p className="font-bold text-xs">{appt.doctorName}</p>
                            <span className="text-[10px] text-slate-400 font-mono tracking-wide">Syncing Clinical Audiology Streams...</span>
                          </div>
                        </div>

                        {/* Patient thumbnail preview simulated */}
                        <div className="absolute bottom-3 right-3 w-28 aspect-video bg-slate-950 border border-slate-700/60 rounded-lg flex items-center justify-center z-10 shadow-lg">
                          <div className="text-[8px] font-mono text-slate-400 text-center">
                            <span>You (Patient Feed)</span>
                            <span className="block text-teal-500">Muted</span>
                          </div>
                        </div>

                        {/* Subtle background hospital grid or medical glow for simulation depth */}
                        <div className="absolute inset-0 bg-radial-gradient from-teal-500/5 to-transparent pointer-events-none" />
                      </div>

                      <div className="flex justify-center gap-4 text-xs font-semibold py-2">
                        <span className="text-slate-400 font-mono text-[10px]">DocAI Virtual Care Core Hub Ver 1.4</span>
                      </div>
                    </div>
                  )}

                  {/* Prompt for Cancellation Confirm safety overlay */}
                  {showCancelConfirm === appt.id && (
                    <div className="bg-rose-50 border-t border-rose-200/80 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-slide-up">
                      <div className="flex items-start space-x-3 text-left">
                        <AlertTriangle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-rose-950">Revoke Patient Reservation Ticket?</p>
                          <p className="text-[11px] text-rose-800 leading-normal">
                            This will release your booked slot (<span className="font-mono font-bold">{appt.timeSlot}</span>) back into the public directory pool and reverse transactions.
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2.5 flex-shrink-0">
                        <button 
                          disabled={cancellingId === appt.id}
                          onClick={() => handleCancelAppointment(appt.id)}
                          className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-450 text-white text-[11px] font-bold rounded-lg cursor-pointer shadow-xs transition-colors"
                        >
                          {cancellingId === appt.id ? 'Processing...' : 'Confirm Release'}
                        </button>
                        <button 
                          onClick={() => setShowCancelConfirm(null)}
                          className="px-3.5 py-1.5 bg-white border border-slate-205 hover:bg-slate-50 text-slate-700 text-[11px] font-bold rounded-lg cursor-pointer transition-colors"
                        >
                          Keep Slot
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
}
