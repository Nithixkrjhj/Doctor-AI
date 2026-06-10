import { useState, useEffect } from 'react';
import { Star, Shield, Clock, Search, Filter, AlertTriangle, ArrowLeft, Calendar, Info } from 'lucide-react';
import { Doctor, SymptomAnalysis, Appointment } from '../types';

interface DoctorListingProps {
  analysis: SymptomAnalysis | null;
  onSelectDoctorSlot: (doctor: Doctor, slot: string, date: string) => void;
  onGoBack: () => void;
}

export default function DoctorListing({ analysis, onSelectDoctorSlot, onGoBack }: DoctorListingProps) {
  const [doctorsList, setDoctorsList] = useState<Doctor[]>([]);
  const [appointmentsList, setAppointmentsList] = useState<Appointment[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Maintain selected date per doctor. Defaults to the first date (today).
  const [selectedDoctorDates, setSelectedDoctorDates] = useState<Record<string, string>>({});

  // Specialties available in the catalog
  const SPECIALTIES = ['All', 'Cardiology', 'Dermatology', 'Pediatrics', 'Neurology', 'Orthopedics', 'General Medicine'];

  const generateNext7Days = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push({
        full: d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        shortDay: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate(),
        month: d.toLocaleDateString('en-US', { month: 'short' }),
      });
    }
    return dates;
  };

  const next7Days = generateNext7Days();

  useEffect(() => {
    // If analysis matches, auto focus selection to that matched clinical category
    if (analysis?.specialtySuggested) {
      setSelectedSpecialty(analysis.specialtySuggested);
    } else {
      setSelectedSpecialty('All');
    }
  }, [analysis]);

  useEffect(() => {
    const fetchDoctorsAndAppointments = async () => {
      try {
        setIsLoading(true);
        const [resDocs, resApts] = await Promise.all([
          fetch("/api/doctors"),
          fetch("/api/appointments")
        ]);
        if (resDocs.ok) {
          const docsData: Doctor[] = await resDocs.json();
          setDoctorsList(docsData);
          
          // Pre-initialize doctor dates selection to today
          const dMap: Record<string, string> = {};
          docsData.forEach(d => {
            dMap[d.id] = next7Days[0].full;
          });
          setSelectedDoctorDates(dMap);
        }
        if (resApts.ok) {
          setAppointmentsList(await resApts.json());
        }
      } catch (err) {
        console.error("Failed to load doctor database profiles:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoctorsAndAppointments();
  }, []);

  // Filter & search implementation
  const filteredDoctors = doctorsList.filter(doc => {
    const matchesSpecialty = selectedSpecialty === 'All' || doc.specialty.toLowerCase() === selectedSpecialty.toLowerCase();
    const matchesQuery = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         doc.qualification.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSpecialty && matchesQuery;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6" id="doctor-listings-container">
      
      {/* 1. Header and navigation row */}
      <div className="flex items-center justify-between">
        <button
          onClick={onGoBack}
          className="flex items-center space-x-2 text-sm text-slate-650 hover:text-slate-800 font-semibold bg-white/45 backdrop-blur-xs px-4 py-2 rounded-xl shadow-sm border border-slate-200/50 transition-all active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Symptoms</span>
        </button>
        <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50/70 border border-indigo-100/50 px-3 py-1.5 rounded-full uppercase tracking-wider">
          Catalog updated live
        </span>
      </div>

      {/* 2. AI symptom match summary panel */}
      {analysis && (
        <div className="bg-gradient-to-r from-indigo-650/95 to-indigo-950/90 backdrop-blur-md text-white rounded-2xl shadow-lg border border-white/10 p-6 relative overflow-hidden animate-fade-in" id="ai-symptom-analysis-panel">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Shield className="h-44 w-44" />
          </div>
 
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {/* Matching specialist and confidence */}
            <div className="md:col-span-2 space-y-3">
              <span className="bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono tracking-wider uppercase inline-block">
                Gemini Medical Assessment Output
              </span>
              <h3 className="text-3xl font-display font-bold">
                Smart Matching: <span className="underline decoration-indigo-300 underline-offset-4">{analysis.specialtySuggested}</span>
              </h3>
              <p className="text-indigo-50  text-sm leading-relaxed max-w-xl">
                <strong>Explanation:</strong> {analysis.clinicalRationale}
              </p>
            </div>
 
            {/* Confidence indicator gauge */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 flex flex-col justify-between items-start">
              <span className="text-xs font-mono text-indigo-100 uppercase">Matching Confidence</span>
              <div className="flex items-baseline space-x-2 mt-2">
                <span className="text-4xl font-display font-semibold tracking-tight">
                  {(analysis.confidence * 100).toFixed(0)}%
                </span>
                <span className="text-xs text-indigo-200">Optimal Match</span>
              </div>
              <div className="w-full bg-white/20 h-2 mt-3 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-350 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${analysis.confidence * 100}%` }}
                />
              </div>
            </div>
          </div>
 
          {/* Extracted symptoms list as tags */}
          {analysis.extractedSymptoms && analysis.extractedSymptoms.length > 0 && (
            <div className="mt-5 pt-4 border-t border-white/10 flex items-center flex-wrap gap-2">
              <span className="text-xs font-mono text-indigo-200 uppercase mr-2 font-semibold">Extracted Symptoms:</span>
              {analysis.extractedSymptoms.map((sym, idx) => (
                <span 
                  key={idx} 
                  className="bg-white/15 hover:bg-white/25 px-3 py-1 rounded-lg text-xs tracking-wide transition-all border border-white/5 font-medium"
                >
                  {sym}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Search and Catalog Controls */}
      <div className="glass-panel rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
        {/* Specialty Filter Slider */}
        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          <Filter className="h-4 w-4 text-slate-400 flex-shrink-0" />
          <div className="flex space-x-1">
            {SPECIALTIES.map(spec => (
              <button
                key={spec}
                onClick={() => setSelectedSpecialty(spec)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 ${
                  selectedSpecialty.toLowerCase() === spec.toLowerCase()
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white/50 hover:bg-white/95 text-slate-600 border border-slate-200/40'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        {/* Text Filter Bar */}
        <div className="relative w-full md:w-64 flex-shrink-0">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Name or Degrees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 glass-input rounded-lg focus:outline-none text-sm placeholder:text-slate-400 text-slate-700"
          />
        </div>
      </div>

      {/* 4. Doctors Catalog Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <svg className="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm font-mono text-slate-500 uppercase">Synchronizing Catalog...</span>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="glass-panel rounded-xl p-12 text-center flex flex-col items-center max-w-md mx-auto">
          <AlertTriangle className="h-12 w-12 text-amber-550 mb-3" />
          <h4 className="text-lg font-display font-semibold text-slate-800 mb-1">No Specialists Found</h4>
          <p className="text-slate-500 text-sm leading-relaxed">
            There are no profiles listed matching the chosen parameters at this time. Tap 'All' to browse the complete registry directory list.
          </p>
          <button
            onClick={() => setSelectedSpecialty('All')}
            className="mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg"
          >
            Show All Doctors
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="doctors-registry-grid">
          {filteredDoctors.map(doctor => (
            <div 
              key={doctor.id} 
              className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col justify-between"
              id={`doctor-card-${doctor.id}`}
            >
              {/* Profile Card Header */}
              <div className="flex space-x-4 items-start">
                <img 
                  src={doctor.avatar} 
                  alt={doctor.name} 
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-full object-cover border-2 border-indigo-50 shadow-sm"
                />
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-display font-bold text-slate-800 text-lg leading-tight">
                      {doctor.name}
                    </h4>
                    <span className="bg-indigo-50 text-indigo-700 text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-full font-bold uppercase">
                      {doctor.specialty}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed">
                    {doctor.qualification}
                  </p>
                  
                  {/* Rating & Experience */}
                  <div className="flex items-center space-x-4 pt-1">
                    <div className="flex items-center text-amber-500 text-xs font-semibold">
                      <Star className="h-3.5 w-3.5 fill-amber-500 mr-1" />
                      {doctor.rating.toFixed(2)}
                    </div>
                    <div className="text-xs text-slate-400">
                      <strong>{doctor.experience} yrs</strong> experience
                    </div>
                  </div>
                </div>
              </div>

              {/* Consultation details & Fee */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[11px] font-mono uppercase block">Affiliated Fee</span>
                  <span className="text-2xl font-display font-semibold text-slate-800 tracking-tight">
                    ₹{doctor.fee}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[11px] font-mono uppercase block">Schedules</span>
                  <span className="text-xs text-indigo-600 font-semibold flex items-center justify-end font-mono">
                    <Calendar className="h-3.5 w-3.5 mr-1 text-indigo-500" />
                    {selectedDoctorDates[doctor.id] ? selectedDoctorDates[doctor.id].split(',')[0] : 'Today'}
                  </span>
                </div>
              </div>

              {/* Interactive Calendar Date Picker Row */}
              <div className="mt-4 space-y-2">
                <span className="text-xs font-mono text-slate-400 uppercase block">
                  1. Choose Appointment Date:
                </span>
                <div className="flex space-x-1 overflow-x-auto pb-1.5 scrollbar-none justify-between">
                  {next7Days.map((day) => {
                    const isSelected = selectedDoctorDates[doctor.id] === day.full;
                    return (
                      <button
                        type="button"
                        key={day.full}
                        onClick={() => setSelectedDoctorDates(prev => ({ ...prev, [doctor.id]: day.full }))}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg min-w-11 transition-all border cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wide opacity-80">{day.shortDay}</span>
                        <span className="text-sm font-bold tracking-tight font-display">{day.dayNum}</span>
                        <span className="text-[8px] font-mono uppercase tracking-widest opacity-80">{day.month}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slot Scheduler Triggers */}
              <div className="mt-4 space-y-2">
                <span className="text-xs font-mono text-slate-400 uppercase block mb-1">
                  2. Select Available Hour Slot:
                </span>
                
                <div className="grid grid-cols-3 gap-1.5">
                  {doctor.availableSlots.map(slot => {
                    const currentDate = selectedDoctorDates[doctor.id] || next7Days[0].full;
                    // Check if booked
                    const isBooked = appointmentsList.some(apt => 
                      apt.doctorId === doctor.id && 
                      apt.date === currentDate && 
                      apt.timeSlot === slot && 
                      apt.status === 'confirmed'
                    );

                    return (
                      <button
                        key={slot}
                        disabled={isBooked}
                        onClick={() => onSelectDoctorSlot(doctor, slot, currentDate)}
                        className={`px-2 py-1.5 border transition-all text-center text-xs font-semibold hover:shadow-sm font-mono rounded-lg cursor-pointer ${
                          isBooked
                            ? 'bg-slate-100 text-slate-400 border-slate-200 line-through cursor-not-allowed opacity-50'
                            : 'bg-slate-50 hover:bg-indigo-600 hover:text-white border-slate-200 hover:border-indigo-500 hover:font-bold'
                        }`}
                        title={isBooked ? "This slot is already booked" : "Click to select slot"}
                      >
                        {slot}
                        {isBooked && <span className="block text-[8px] text-rose-500 font-bold mt-0.5 tracking-wider uppercase">Booked</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
