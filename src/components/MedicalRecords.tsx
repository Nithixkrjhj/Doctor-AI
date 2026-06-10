import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, FileText, Plus, FileSpreadsheet, Send, User, MapPin
} from 'lucide-react';

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

interface MedicalRecordsProps {
  onGoBack: () => void;
}

export default function MedicalRecords({ onGoBack }: MedicalRecordsProps) {
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

  const [loadingSchedule, setLoadingSchedule] = useState(false);

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

  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecordTitle || !newRecordDoctor || !newRecordDept) return;
    
    const prescArray = newRecordPresc.split(',').map(p => p.trim()).filter(Boolean);

    const newRecordData = {
      title: newRecordTitle,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      doctor: newRecordDoctor,
      department: newRecordDept,
      diagnosis: newRecordDiagnosis,
      prescription: prescArray,
      notes: newRecordNotes,
      status: newRecordStatus
    };

    try {
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecordData)
      });
      if (res.ok) {
        const addedRecord = await res.json();
        setMedicalRecords([addedRecord, ...medicalRecords]);
        // Reset form
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
    <div className="max-w-4xl mx-auto py-6 space-y-8 animate-slide-right" id="medical-records-page">
      {/* Page Header Layout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-indigo-100">
        <div className="flex items-center space-x-3.5">
          <button 
            onClick={onGoBack}
            className="p-2 bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl transition-all shadow-xs active:scale-90 cursor-pointer flex items-center justify-center group"
            id="back-to-home-from-records"
            title="Go Back"
          >
            <ArrowLeft className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1 group-active:scale-90" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold font-mono tracking-wider px-2 py-0.5 rounded uppercase">
                Patient Electronic Vault
              </span>
            </div>
            <h1 className="text-3xl font-display font-black text-slate-900 tracking-tight mt-0.5">
              Medical Records
            </h1>
          </div>
        </div>
      </div>

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
              <span>Log Manual Record</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-semibold font-mono text-slate-500 uppercase tracking-widest">Report/Diagnosis Title <span className="text-rose-500">*</span></label>
                <input 
                  required value={newRecordTitle} onChange={(e) => setNewRecordTitle(e.target.value)}
                  type="text" placeholder="e.g. CBC Blood Work Analysis" 
                  className="w-full text-xs font-medium bg-white border border-slate-200 outline-none p-2.5 rounded-lg focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                />
              </div>
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-semibold font-mono text-slate-500 uppercase tracking-widest">Attending Physician <span className="text-rose-500">*</span></label>
                <input 
                  required value={newRecordDoctor} onChange={(e) => setNewRecordDoctor(e.target.value)}
                  type="text" placeholder="Dr. XYZ" 
                  className="w-full text-xs font-medium bg-white border border-slate-200 outline-none p-2.5 rounded-lg focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                />
              </div>
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-semibold font-mono text-slate-500 uppercase tracking-widest">Clinical Department <span className="text-rose-500">*</span></label>
                <input 
                  required value={newRecordDept} onChange={(e) => setNewRecordDept(e.target.value)}
                  type="text" placeholder="e.g. Cardiology" 
                  className="w-full text-xs font-medium bg-white border border-slate-200 outline-none p-2.5 rounded-lg focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                />
              </div>
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-semibold font-mono text-slate-500 uppercase tracking-widest">Medical Urgency Status</label>
                <select 
                  value={newRecordStatus} onChange={(e) => setNewRecordStatus(e.target.value as any)}
                  className="w-full text-xs font-medium bg-white border border-slate-200 outline-none p-2.5 rounded-lg focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                >
                  <option value="Stable">Stable</option>
                  <option value="Critical">Critical</option>
                  <option value="On-track">On-track</option>
                </select>
              </div>
            </div>

            <div className="space-y-1 text-left">
              <label className="text-[10px] font-semibold font-mono text-slate-500 uppercase tracking-widest">Core Diagnosis Results</label>
              <textarea 
                rows={2} value={newRecordDiagnosis} onChange={(e) => setNewRecordDiagnosis(e.target.value)}
                placeholder="Observed symptoms or lab results..."
                className="w-full text-xs font-medium bg-white border border-slate-200 outline-none p-2.5 rounded-lg focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 resize-none"
              />
            </div>
            
            <div className="space-y-1 text-left">
              <label className="text-[10px] font-semibold font-mono text-slate-500 uppercase tracking-widest">Prescribed Medicines (Comma separated)</label>
              <input 
                value={newRecordPresc} onChange={(e) => setNewRecordPresc(e.target.value)}
                type="text" placeholder="e.g. Dolo 650mg, Cough Syrup" 
                className="w-full text-xs font-medium bg-white border border-slate-200 outline-none p-2.5 rounded-lg focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
              />
            </div>

            <button type="submit" disabled={!newRecordTitle || !newRecordDoctor || !newRecordDept} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-lg shadow-sm flex items-center justify-center space-x-2 cursor-pointer transition-colors mt-2">
              <Send className="h-4 w-4" />
              <span>Submit Virtual Record</span>
            </button>
          </form>
        ) : (
          <div className="space-y-4 pr-1">
            {loadingSchedule ? (
              <div className="py-12 flex justify-center items-center">
                <div className="h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : medicalRecords.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs italic bg-slate-50 rounded-xl border border-slate-100">
                No electronic medical records found in your vault.
              </div>
            ) : (
              medicalRecords.map((rec) => (
                <div key={rec.id} className="bg-white border text-left border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
                  {/* Sidebar Color Bar per status */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    rec.status === 'Critical' ? 'bg-rose-500' :
                    rec.status === 'Stable' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`} />
                  
                  <div className="flex justify-between items-start mb-3 border-b border-slate-50 pb-3">
                    <div className="pl-1">
                      <h4 className="font-bold text-slate-900 text-sm">{rec.title}</h4>
                      <span className="text-[10px] text-slate-400 font-mono tracking-widest">{rec.date} • ID: {rec.id}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center space-x-1 ${
                      rec.status === 'Critical' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                      rec.status === 'Stable' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                      'bg-amber-50 text-amber-700 border-amber-100'
                    } border`}>
                      {rec.status === 'Critical' && <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse inline-block" />}
                      <span>{rec.status}</span>
                    </span>
                  </div>

                  <div className="space-y-3.5 pl-1">
                    {/* Diagnosis / Notes block */}
                    <div className="bg-slate-50 rounded-lg p-3 text-xs leading-relaxed text-slate-700 border border-slate-100/50">
                      {rec.diagnosis && (
                        <p className="mb-1.5"><strong className="text-slate-900">Diagnosis:</strong> {rec.diagnosis}</p>
                      )}
                      {rec.notes && (
                        <p className="text-slate-500 italic">" {rec.notes} "</p>
                      )}
                    </div>

                    {/* Prescription pills */}
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
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
