import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, Clock, FileText, Shield, Mail, Phone, MapPin, Check, 
  Trash2, Plus, ArrowRight, User, Heart, Sparkles, AlertCircle, FileSpreadsheet, Send
} from 'lucide-react';
import { Appointment } from '../types';

interface PortalModalProps {
  isOpen: boolean;
  type: 'appointments' | 'records' | 'terms' | 'contact';
  onClose: () => void;
  onNavigateToDoctors: () => void;
}

interface MedicalRecord {
  id: string;
  title: string;
  date: string;
  doctor: string;
  department: string;
  diagnosis: string;
  prescription: string[];
  notes: string;
  status: 'Critical' | 'Stable' | 'On-track';
}

export default function PortalModal({ isOpen, type, onClose, onNavigateToDoctors }: PortalModalProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  
  // Contacts states
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);
  const [submittingContact, setSubmittingContact] = useState(false);

  // Medical records states
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([
    {
      id: 'rec-001',
      title: 'Diagnostic Lab Report - CBC & Lipid Triage',
      date: 'May 28, 2026',
      doctor: 'Dr. Vivek Nair',
      department: 'Cardiology Support',
      diagnosis: 'Mild hypercholesterolemia identified under clinical review. Recommended lifestyle adjustments.',
      prescription: ['Atorvastatin 10mg (once daily)', 'Omega-3 fatty supplements 1000mg'],
      notes: 'Total cholesterol checked at 224 mg/dL. Re-evaluation of vital metrics scheduled in 3 months.',
      status: 'Stable'
    },
    {
      id: 'rec-002',
      title: 'NPCI Vocal Symptom Dispatch Analysis',
      date: 'June 02, 2026',
      doctor: 'DocAI virtual system',
      department: 'Symptom Triage Dispatch',
      diagnosis: 'Acute respiratory congestion classified via acoustic voice analysis.',
      prescription: ['Levosalbutamol syrup 5ml', 'Warm saline gargles thrice daily'],
      notes: 'Gemini priority score assessed at higher confidence rating. Recommended internal pulmonology consult.',
      status: 'On-track'
    },
    {
      id: 'rec-003',
      title: 'Orthodontic Assessment & Bio-Scaling',
      date: 'March 14, 2026',
      doctor: 'Dr. Venkatesh M J',
      department: 'Dental Surgery',
      diagnosis: 'Mild level of dental plaque and tartar deposition around molar regions.',
      prescription: ['Chlorhexidine Gluconate 0.2% mouthwash', 'Amoxicillin 500mg if discomfort arises'],
      notes: 'Scaling performed successfully. Encouraged fluoride-enriched cleaning protocols.',
      status: 'Stable'
    }
  ]);

  // Form states to add new medical record
  const [newRecordTitle, setNewRecordTitle] = useState('');
  const [newRecordDoctor, setNewRecordDoctor] = useState('');
  const [newRecordDept, setNewRecordDept] = useState('');
  const [newRecordDiagnosis, setNewRecordDiagnosis] = useState('');
  const [newRecordPresc, setNewRecordPresc] = useState('');
  const [newRecordNotes, setNewRecordNotes] = useState('');
  const [newRecordStatus, setNewRecordStatus] = useState<'Critical' | 'Stable' | 'On-track'>('Stable');
  const [showAddRecordForm, setShowAddRecordForm] = useState(false);

  // Fetch medical records
  const fetchMedicalRecords = async () => {
    setLoadingSchedule(true);
    try {
      const res = await fetch('/api/records');
      if (res.ok) {
        const data = await res.json();
        setMedicalRecords(data);
      }
    } catch (err) {
      console.error("Failed to load medical records from server", err);
    } finally {
      setLoadingSchedule(false);
    }
  };

  // Fetch appointments
  const fetchAppointments = async () => {
    setLoadingSchedule(true);
    try {
      const res = await fetch('/api/appointments');
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch (err) {
      console.error("Failed to load appointments from server", err);
    } finally {
      setLoadingSchedule(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (type === 'appointments') {
        fetchAppointments();
      } else if (type === 'records') {
        fetchMedicalRecords();
      }
      setContactSuccess(false);
      setShowAddRecordForm(false);
    }
  }, [isOpen, type]);

  if (!isOpen) return null;

  // Handle support message submission
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) return;
    setSubmittingContact(true);
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          subject: contactSubject || "Dropdown Quick Help",
          message: contactMessage
        })
      });
      if (res.ok) {
        setContactSuccess(true);
        setContactName('');
        setContactEmail('');
        setContactSubject('');
        setContactMessage('');
        setTimeout(() => {
          setContactSuccess(false);
        }, 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingContact(false);
    }
  };

  // Add new medical record to server
  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecordTitle || !newRecordDoctor || !newRecordDiagnosis) {
      alert("Please fill in the record title, physician name and diagnosis details.");
      return;
    }
    const record = {
      title: newRecordTitle,
      doctor: newRecordDoctor,
      department: newRecordDept || "General Medicine",
      diagnosis: newRecordDiagnosis,
      prescription: newRecordPresc ? newRecordPresc.split(',').map(p => p.trim()) : [],
      notes: newRecordNotes || 'No additional notes registered.',
      status: newRecordStatus
    };

    try {
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(record)
      });
      if (res.ok) {
        const savedRecord = await res.json();
        setMedicalRecords([savedRecord, ...medicalRecords]);
        
        // Clear Form fields
        setNewRecordTitle('');
        setNewRecordDoctor('');
        setNewRecordDept('');
        setNewRecordDiagnosis('');
        setNewRecordPresc('');
        setNewRecordNotes('');
        setNewRecordStatus('Stable');
        setShowAddRecordForm(false);
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to save the medical record on the server.");
      }
    } catch (err) {
      console.error("Failed to post medical record", err);
      alert("Network timeout. Could not save medical record.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" id="portal-modal-overlay">
      <div 
        className="glass-panel rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.1)]"
        id="portal-modal-window"
      >
        {/* Banner header containing descriptive info */}
        <div className="bg-gradient-to-r from-indigo-950/90 to-slate-950/85 p-5 text-white flex justify-between items-center backdrop-blur-md border-b border-white/10 relative">
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-widest text-indigo-400 font-bold uppercase block">DocAI Patient Services</span>
            <h2 className="text-xl font-display font-bold flex items-center space-x-2">
              {type === 'appointments' && (
                <>
                  <Calendar className="h-5 w-5 text-indigo-400" />
                  <span>My Scheduled Appointments</span>
                </>
              )}
              {type === 'records' && (
                <>
                  <FileText className="h-5 w-5 text-indigo-400" />
                  <span>Interactive Medical Records</span>
                </>
              )}
              {type === 'terms' && (
                <>
                  <Shield className="h-5 w-5 text-indigo-400" />
                  <span>Professional Terms & Regulations</span>
                </>
              )}
              {type === 'contact' && (
                <>
                  <Mail className="h-5 w-5 text-indigo-400" />
                  <span>Official Support & Desk Inquiry</span>
                </>
              )}
            </h2>
          </div>
          
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal popup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Dynamic Inner Panel View scrollable container */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6" id="portal-modal-body">
          
          {/* A: MY APPOINTMENTS SECTION */}
          {type === 'appointments' && (
            <div className="space-y-4" id="appointments-panel-view">
              <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-4 rounded-xl">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-700">Digital Health Card System</span>
                  <p className="text-[11px] text-slate-400 italic">This panel aggregates active clinic consultation queues retrieved from DocAI in-memory server database sheets.</p>
                </div>
                <button 
                  type="button"
                  onClick={onNavigateToDoctors}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center space-x-1"
                >
                  <span>Book New</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              {loadingSchedule ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-2">
                  <div className="h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[11px] font-mono text-slate-400">Loading Patient Records...</span>
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-10 px-4 bg-slate-55/30 border border-slate-100 rounded-xl space-y-4">
                  <div className="bg-slate-100 p-3.5 rounded-full inline-block">
                    <Calendar className="h-7 w-7 text-slate-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-700">No active bookings registered yet</p>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">Use the main Voice Symptom Assessor or browse standard clinical lists directly to book.</p>
                  </div>
                  <div>
                    <button 
                      type="button" 
                      onClick={() => {
                        onClose();
                        onNavigateToDoctors();
                      }}
                      className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Browse Available Doctors
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map((appt) => (
                    <div 
                      key={appt.id} 
                      className="border border-slate-100 hover:border-slate-200 bg-white shadow-xs p-4 rounded-xl flex flex-col md:flex-row justify-between gap-4 transition-all"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                            {appt.doctorSpecialty}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">
                            ID: {appt.id}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm">{appt.doctorName}</h4>
                        
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-500 font-medium">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                            <span>{appt.date}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3.5 w-3.5 text-indigo-500" />
                            <span>{appt.timeSlot}</span>
                          </div>
                          <div className="flex items-center space-x-1 col-span-2 mt-1">
                            <User className="h-3.5 w-3.5 text-slate-400" />
                            <span>Patient: <strong className="text-slate-700">{appt.patientName}</strong></span>
                          </div>
                        </div>

                        {appt.symptomsAnalysed && appt.symptomsAnalysed.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1.5">
                            {appt.symptomsAnalysed.map((s, idx) => (
                              <span key={idx} className="bg-slate-50 text-slate-500 border border-slate-100 text-[9px] font-mono px-1.5 py-0.5 rounded">
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex md:flex-col justify-between items-end md:items-end flex-wrap gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                        <div className="text-right">
                          <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase">Consultation Fee</span>
                          <span className="text-sm font-black text-slate-800">INR ₹{appt.feePaid}.00</span>
                        </div>
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 px-2.5 py-0.5 rounded text-[10px] font-bold inline-flex items-center space-x-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Status: Confirmed</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* B: MEDICAL RECORDS PANEL */}
          {type === 'records' && (
            <div className="space-y-6" id="medical-records-panel-view">
              <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-4 rounded-xl">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-700">Patient Electronic Medical Vault</span>
                  <p className="text-[11px] text-slate-400 italic">Access your certified medical summaries, diagnostic notes, or append manual prescriptions.</p>
                </div>
                
                <button 
                  type="button"
                  onClick={() => setShowAddRecordForm(!showAddRecordForm)}
                  className={`px-3.5 py-1.5 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center space-x-1 ${
                    showAddRecordForm ? 'bg-slate-700 hover:bg-slate-800' : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {showAddRecordForm ? (
                    <span>Back to List</span>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Record</span>
                    </>
                  )}
                </button>
              </div>

              {showAddRecordForm ? (
                <form onSubmit={handleAddRecord} className="border border-indigo-100 bg-indigo-50/20 p-5 rounded-xl space-y-4 animate-fade-in" id="add-record-form">
                  <h4 className="font-display font-bold text-slate-800 text-sm flex items-center space-x-1.5 pb-1 border-b border-indigo-50">
                    <FileSpreadsheet className="h-4.5 w-4.5 text-indigo-600" />
                    <span>Compile New Medical Entry Card</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-600 uppercase">Document/Record Title *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Endoscopy Summary" 
                        value={newRecordTitle}
                        onChange={(e) => setNewRecordTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-600 uppercase">Consulting Practitioner *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Dr. Sarah Connor" 
                        value={newRecordDoctor}
                        onChange={(e) => setNewRecordDoctor(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-600 uppercase">Medical Department / Specialty</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Pulmonology" 
                        value={newRecordDept}
                        onChange={(e) => setNewRecordDept(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-600 uppercase">Status Category</label>
                      <select 
                        value={newRecordStatus} 
                        onChange={(e) => setNewRecordStatus(e.target.value as any)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 bg-white"
                      >
                        <option value="Stable">Stable</option>
                        <option value="On-track">On-track</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-600 uppercase">Diagnosis Summary Details *</label>
                    <textarea 
                      required 
                      rows={2}
                      placeholder="Briefly describe diagnosed medical observations..." 
                      value={newRecordDiagnosis}
                      onChange={(e) => setNewRecordDiagnosis(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 bg-white resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-600 uppercase">Prescribed Medicines (Comma separated)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Paracetamol 500mg, Vitamin C" 
                      value={newRecordPresc}
                      onChange={(e) => setNewRecordPresc(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-600 uppercase">Additional Clinical Notes</label>
                    <textarea 
                      rows={2}
                      placeholder="e.g. Regular aerobic activity, periodic physical reviews to follow." 
                      value={newRecordNotes}
                      onChange={(e) => setNewRecordNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 bg-white resize-none"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button 
                      type="submit"
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Verify and Append Record
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  {medicalRecords.map((rec) => (
                    <div 
                      key={rec.id} 
                      className="border border-slate-100 hover:border-slate-200 bg-white shadow-xs rounded-xl overflow-hidden flex flex-col md:flex-row transition-all"
                    >
                      {/* Left visual strip */}
                      <div className={`w-full md:w-3 border-b-2 md:border-b-0 md:border-r-2 ${
                        rec.status === 'Critical' ? 'bg-rose-500 border-rose-600' :
                        rec.status === 'On-track' ? 'bg-indigo-500 border-indigo-600' :
                        'bg-emerald-500 border-emerald-600'
                      }`} />
                      
                      {/* Details container */}
                      <div className="p-4 flex-grow space-y-3">
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-mono text-slate-400 font-bold block">{rec.date} • REFERENCE ID: {rec.id}</span>
                            <h4 className="font-display font-bold text-slate-800 text-sm leading-snug">{rec.title}</h4>
                          </div>
                          
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            rec.status === 'Critical' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                            rec.status === 'On-track' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                            'bg-emerald-50 text-emerald-750 border border-emerald-100'
                          }`}>
                            {rec.status}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-50/50 rounded-lg text-slate-600 text-xs leading-relaxed border border-slate-100">
                          <strong className="text-slate-800 font-bold block mb-1">Observation Diagnosis:</strong>
                          {rec.diagnosis}
                        </div>

                        {rec.prescription && rec.prescription.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Prescribed Medicines</span>
                            <div className="flex flex-wrap gap-1.5">
                              {rec.prescription.map((m, idx) => (
                                <span key={idx} className="bg-indigo-50/60 text-indigo-700 border border-indigo-100/50 text-[10px] py-0.5 px-2 rounded-md font-medium">
                                  💊 {m}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between items-center text-[11px] text-slate-450 pt-2 border-t border-slate-50">
                          <span>Department: <strong className="text-slate-700">{rec.department}</strong></span>
                          <span>Consultant: <strong className="text-slate-700">{rec.doctor}</strong></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* C: TERMS & SERVICE COMPREHENSIVE TEXT */}
          {type === 'terms' && (
            <div className="space-y-6" id="terms-panel-view">
              <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-start space-x-2.5">
                <AlertCircle className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-slate-650 leading-relaxed font-semibold">
                  By utilizing the DocAI appointment dispatch portal, you implicitly accept current operational guidelines, HIPAA security regulations, and medical information disclosure standards.
                </span>
              </div>

              <div className="space-y-4 font-sans text-xs text-slate-550 leading-relaxed pr-2">
                <section className="space-y-1.5">
                  <h4 className="font-display font-black text-slate-800 uppercase tracking-widest text-[10px] border-b border-slate-100 pb-1">
                    1. Telehealth Triage & AI Screening Disclaimer
                  </h4>
                  <p>
                    DocAI provides instant symptom analysis using advanced Google Gemini AI algorithms to route patients with appropriate medical staff. This screening does not constitute direct medical therapy, a definitive physical diagnosis, or a replacement for local hospital emergency rooms. Patients exhibiting severe conditions (intense cardiac pressure, deep bleeding, extreme respiratory distress) must bypass the virtual portal and dial local emergency services directly.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h4 className="font-display font-black text-slate-800 uppercase tracking-widest text-[10px] border-b border-slate-100 pb-1">
                    2. Electronic Registration & Verification Safety
                  </h4>
                  <p>
                    Patients pledge to furnish genuine, up-to-date coordinate metrics (Full Name, contact telephone, active email inbox) during clinic appointment confirmations. Impersonating other citizens, supplying dummy medical feedback sheets, or creating false medical appointments on system directories triggers immediate restriction from the portal.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h4 className="font-display font-black text-slate-800 uppercase tracking-widest text-[10px] border-b border-slate-100 pb-1">
                    3. Patient Records Privacy & Encryption (HIPAA Compliance)
                  </h4>
                  <p>
                    DocAI honors state digital health privacy acts (HIPAA / clinical telemetry standards). Your vocal symptom entries and associated medical record checklists are processed securely in temporary runtime variables on container sandboxes. Financial checkout details are evaluated over isolated sandbox tokens, preventing local system operators from archiving raw credit card digits.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h4 className="font-display font-black text-slate-800 uppercase tracking-widest text-[10px] border-b border-slate-100 pb-1">
                    4. Postponements, Rescheduling, & Clinical Shifts Refund Policies
                  </h4>
                  <p>
                    Registered appointment bookings retain complete validation loops up to the selected date. Cancellations initiated at least 4 hours before the booked slot qualify for full financial processing back to original wallets. Clinic shifts missed without prior scheduling updates are processed as completed check-ins. Individual physicians hold discrete regulatory policies regarding personal billing values.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h4 className="font-display font-black text-slate-800 uppercase tracking-widest text-[10px] border-b border-slate-100 pb-1">
                    5. Secure Sandbox Transaction Disclosures
                  </h4>
                  <p>
                    Transaction indicators generated in checkout channels are simulated safely. No live banking currency is actively transferred. QR-code payments are calculated strictly for demonstration of National Payment Corporation (NPCI/BHIM) interfaces.
                  </p>
                </section>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex justify-between items-center text-xs">
                <span className="text-slate-500 font-mono text-[10px]">Latest Update Version: June 08, 2026</span>
                <span className="text-indigo-600 font-bold">DocAI Compliance Legal Office</span>
              </div>
            </div>
          )}

          {/* D: CONTACT US SECTION */}
          {type === 'contact' && (
            <div className="space-y-6" id="contact-panel-view">
              
              {/* Clinical Address Coordinates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 border border-slate-100/60 p-4 rounded-xl text-center space-y-1.5">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg inline-block">
                    <Phone className="h-4.5 w-4.5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 block">Customer Support</h4>
                  <p className="text-[11px] font-mono font-bold text-slate-600 leading-normal">+91 88915 99027</p>
                  <span className="text-[9px] text-slate-400 block font-medium">Monday - Saturday (24/7)</span>
                </div>

                <div className="bg-slate-50 border border-slate-100/60 p-4 rounded-xl text-center space-y-1.5">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg inline-block">
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 block">Mail Address</h4>
                  <p className="text-[11px] font-mono text-indigo-650 truncate block leading-normal">docaisupport@gmil.com</p>
                  <span className="text-[9px] text-slate-400 block font-medium">Inbox Checked hourly</span>
                </div>

                <div className="bg-slate-50 border border-slate-100/60 p-4 rounded-xl text-center space-y-1.5">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg inline-block">
                    <MapPin className="h-4.5 w-4.5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 block">Head Quarters</h4>
                  <p className="text-[11px] font-mono text-slate-600 block leading-snug">Nelamangala, Bangalore</p>
                  <span className="text-[9px] text-slate-400 block font-medium">Karnataka, PIN 562123</span>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Inquiry Message Dispatcher Form */}
              <form onSubmit={handleContactSubmit} className="space-y-4" id="modal-support-form">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-indigo-600 font-bold uppercase tracking-wider block">Rapid inquiry channel</span>
                  <p className="text-xs text-slate-400 leading-normal">Have simple inquiries or support questions? Type details here to post them directly to the administrative hub.</p>
                </div>

                {contactSuccess && (
                  <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-xl p-3.5 text-xs font-mono flex items-center animate-bounce">
                    <span>✅ Success! Message sent successfully. Clinical desk has registered your details.</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-600 uppercase">Your Name *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Rachel Green" 
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 focus:ring-1 focus:ring-indigo-500 rounded-lg text-xs font-medium bg-slate-50/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-600 uppercase">Email Address *</label>
                    <input 
                      type="email" 
                      required
                      placeholder="e.g. rachel@centralperk.com" 
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 focus:ring-1 focus:ring-indigo-500 rounded-lg text-xs font-medium bg-slate-50/50"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-600 uppercase">Subject</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Pulmonology specialist appointment request" 
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 focus:ring-1 focus:ring-indigo-500 rounded-lg text-xs font-medium bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-600 uppercase">Message details *</label>
                  <textarea 
                    required
                    rows={3}
                    placeholder="Provide full description of your query..." 
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 focus:ring-1 focus:ring-indigo-500 rounded-lg text-xs font-medium bg-slate-50/50 resize-none"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button 
                    type="submit" 
                    disabled={submittingContact}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer inline-flex items-center space-x-1"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{submittingContact ? "Posting..." : "Dispatch Message to Support"}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
