import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Heart, Stethoscope, Sparkles, PhoneCall, HelpCircle, Activity, 
  UserCog, Calendar, MoreVertical, Search, FileText, Shield, Mail, Users, Moon, Sun, Microscope
} from 'lucide-react';
import VoiceInput from './components/VoiceInput';
import DoctorListing from './components/DoctorListing';
import PaymentGateway from './components/PaymentGateway';
import BookingConfirmation from './components/BookingConfirmation';
import AdminDashboard from './components/AdminDashboard';
import PortalModal from './components/PortalModal';
import AuthModal from './components/AuthModal';
import MyAppointments from './components/MyAppointments';
import TermsAndConditions from './components/TermsAndConditions';
import AboutUs from './components/AboutUs';
import MedicalRecords from './components/MedicalRecords';
import CommunityHub from './components/CommunityHub';
import LabDiagnostics from './components/LabDiagnostics';
import { Doctor, Appointment, SymptomAnalysis } from './types';

type Screen = 'landing' | 'symptoms' | 'doctors' | 'payment' | 'confirmation' | 'admin' | 'appointments' | 'terms' | 'about' | 'records' | 'community' | 'labs';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('docai_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('docai_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('docai_theme', 'light');
    }
  }, [isDarkMode]);
  
  // Patient user session state (initialized from localStorage when app starts)
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string; phone: string } | null>(() => {
    try {
      const saved = localStorage.getItem('docai_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // Navigation states for quick portal services dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [portalModalType, setPortalModalType] = useState<'appointments' | 'records' | 'terms' | 'contact' | null>(null);
  
  // Transition state machines
  const [symptomAnalysis, setSymptomAnalysis] = useState<SymptomAnalysis | null>(null);
  const [rawSymptomText, setRawSymptomText] = useState('');
  
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);
  
  // General loaders
  const [isLoading, setIsLoading] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactSuccess, setContactSuccess] = useState(false);
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  // Restart core booking loop
  const handleResetLoop = () => {
    setSymptomAnalysis(null);
    setRawSymptomText('');
    setSelectedDoctor(null);
    setSelectedSlot('');
    setSelectedDate('');
    setConfirmedAppointment(null);
    setCurrentScreen('landing');
  };

  const handleSymptomAnalysisComplete = (analysis: SymptomAnalysis, text: string) => {
    setSymptomAnalysis(analysis);
    setRawSymptomText(text);
    setCurrentScreen('doctors');
  };

  const handleSelectDoctorSlot = (doctor: Doctor, slot: string, date: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setSelectedDoctor(doctor);
    setSelectedSlot(slot);
    setSelectedDate(date);
    setCurrentScreen('payment');
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      alert("Please fill in all mandatory contact fields.");
      return;
    }
    setIsSubmittingContact(true);
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm)
      });
      if (res.ok) {
        setContactSuccess(true);
        setContactForm({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setContactSuccess(false), 5000);
      } else {
        alert("Verification failed. Review detail entries.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to establish server connection.");
    } finally {
      setIsSubmittingContact(false);
    }
  };

  const handleConfirmPayment = async (formData: {
    patientName: string;
    patientEmail: string;
    patientPhone: string;
    cardDetails?: {
      cardNumber: string;
      cardExpiry: string;
      cardCvc: string;
    };
    upiId?: string;
  }) => {
    if (!selectedDoctor || !selectedSlot) return;
    
    setIsPaying(true);

    try {
      // Direct REST post request to backend system
      const res = await fetch("/api/appointments/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: selectedDoctor.id,
          timeSlot: selectedSlot,
          patientName: formData.patientName,
          patientEmail: formData.patientEmail,
          patientPhone: formData.patientPhone,
          date: selectedDate || new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
          feePaid: selectedDoctor.fee,
          symptomsAnalysed: symptomAnalysis?.extractedSymptoms || [rawSymptomText.substring(0, 55)],
          cardDetails: formData.cardDetails,
          upiId: formData.upiId
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        // Successful payment logic transition
        setConfirmedAppointment(data);
        setCurrentScreen('confirmation');
      } else {
        alert(data.error || "Payment gateway refused validation. Review card inputs.");
      }
    } catch (e) {
      console.error(e);
      alert("Payment connection timeout. Please check your network.");
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#f0f9ff]/80 via-[#f1f5f9]/75 to-[#f0fdfa]/70 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col justify-between relative overflow-hidden transition-colors" id="docai-app-root">
      {/* 🏥 Clinical Hospital Repeating SVG Pattern (Medical plus symbols & wellness accent dots) */}
      <div 
        className="absolute inset-0 pointer-events-none -z-10 opacity-[0.9]" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 40 12 L 40 22 M 35 17 L 45 17' stroke='%230ea5e9' stroke-width='1.5' stroke-linecap='round' stroke-opacity='0.1'/%3E%3Cpath d='M 10 50 L 10 54 M 8 52 L 12 52' stroke='%2314b8a6' stroke-width='1.2' stroke-linecap='round' stroke-opacity='0.08'/%3E%3Ccircle cx='70' cy='45' r='2' fill='%236366f1' fill-opacity='0.08'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }}
      />
      {/* Deep Radiating Clinical Blue, Cyan, and Care Teal Soft Backdrops */}
      <div className="absolute top-[6%] left-[2%] w-[480px] h-[480px] bg-sky-200/15 rounded-full blur-3xl pointer-events-none -z-10 animate-blob-1" />
      <div className="absolute bottom-[8%] right-[2%] w-[520px] h-[520px] bg-teal-100/15 rounded-full blur-3xl pointer-events-none -z-10 animate-blob-2" />
      <div className="absolute top-[35%] left-[25%] w-[400px] h-[400px] bg-indigo-250/10 rounded-full blur-3xl pointer-events-none -z-10 animate-blob-3" />
      
      {/* 📈 Elegant horizontal cardiogram (ECG/EKG pulse) running subtly across the lower background */}
      <div className="absolute inset-x-0 bottom-[18%] h-40 opacity-[0.06] pointer-events-none -z-10 overflow-hidden">
        <svg className="w-full h-full text-indigo-600" viewBox="0 0 1440 200" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M0,100 L400,100 L420,92 L430,108 L442,55 L458,155 L468,92 L478,108 L490,100 L850,100 L870,82 L880,118 L892,30 L908,180 L918,75 L928,125 L940,100 L1440,100" 
            stroke="currentColor" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
        </svg>
      </div>
      
      {/* 1. Global Navigation Bar with glass design */}
      <header className="glass-header sticky top-0 z-30 shadow-[0_2px_18px_rgba(0,0,0,0.01)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div 
            onClick={handleResetLoop}
            className="flex items-center space-x-3 cursor-pointer group select-none"
            id="docai-brand-logo-container"
          >
            <div className="relative flex items-center justify-center w-11 h-11 group-hover:scale-[1.06] transition-all duration-300">
              {/* Upgraded High-fidelity, Unique Modern Hospital Logo */}
              <svg className="w-11 h-11 select-none" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1e40af" /> {/* Sapphire Hospital Blue */}
                    <stop offset="60%" stopColor="#3b82f6" /> {/* Classic Medical Blue */}
                    <stop offset="100%" stopColor="#06b6d4" /> {/* Care Cyan */}
                  </linearGradient>
                  <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" /> {/* Emerald Wellness */}
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <filter id="subtleGlow" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#3b82f6" floodOpacity="0.18" />
                  </filter>
                </defs>

                {/* Protective Octagonal Medical Frame */}
                <path 
                  d="M 30 15 H 70 L 85 30 V 70 L 70 85 H 30 L 15 70 V 30 Z" 
                  fill="#ffffff" 
                  stroke="url(#shieldGrad)" 
                  strokeWidth="3.5" 
                  strokeLinejoin="round"
                  filter="url(#subtleGlow)"
                />

                {/* Abstract Caring/Nurturing Crescent Hands (Left) */}
                <path 
                  d="M 24 50 C 24 64, 36 76, 50 76 C 42 76, 32 68, 30 50 C 28 32, 42 24, 50 24 C 36 24, 24 36, 24 50 Z" 
                  fill="url(#shieldGrad)" 
                  opacity="0.15" 
                />

                {/* Abstract Caring/Nurturing Crescent Hands (Right) */}
                <path 
                  d="M 76 50 C 76 64, 64 76, 50 76 C 58 76, 68 68, 70 50 C 72 32, 58 24, 50 24 C 64 24, 76 36, 76 50 Z" 
                  fill="url(#shieldGrad)" 
                  opacity="0.15" 
                />

                {/* Bold Modern Hospital Cross in Center */}
                {/* Vertical Bar */}
                <rect x="44" y="27" width="12" height="46" rx="6" fill="url(#shieldGrad)" />
                {/* Horizontal Bar */}
                <rect x="27" y="44" width="46" height="12" rx="6" fill="url(#shieldGrad)" />

                {/* Stylized Heartbeat ECG Line Intersecting the Hospital Cross */}
                <path 
                  d="M 31 50 H 42 L 46 36 L 50 64 L 54 44 L 58 56 L 62 50 H 69" 
                  stroke="#ffffff" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />

                {/* Vibrant Life Accent - Floating Organic Leaf at Top Right of the Cross representing healing growth */}
                <path 
                  d="M 50 24 C 54 24, 60 16, 60 16 C 60 16, 52 18, 50 24 Z" 
                  fill="url(#accentGrad)" 
                />
                
                {/* Heart Wellness Pulse Dot */}
                <circle cx="50" cy="50" r="3" fill="#10b981" />
              </svg>
            </div>
            
            <span className="font-display font-black text-xl tracking-tight bg-gradient-to-r from-slate-900 to-indigo-900 bg-clip-text text-transparent group-hover:from-indigo-600 group-hover:to-indigo-855 transition-colors duration-300">
              DocAI
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentScreen('admin')}
              id="admin-panel-nav-trigger"
              className="hidden xs:flex px-3.5 py-1.5 border border-slate-200 text-xs font-semibold text-slate-600 rounded-lg hover:bg-slate-100 items-center space-x-1.5 cursor-pointer transition-colors"
            >
              <UserCog className="h-4 w-4" />
              <span>Admin Hub</span>
            </button>

            <button
              onClick={() => setCurrentScreen('appointments')}
              id="my-appointments-nav-trigger"
              className="px-3.5 py-1.5 border border-indigo-200 bg-indigo-50/40 text-[11px] font-bold text-indigo-700 rounded-lg hover:bg-indigo-50 items-center space-x-1.5 cursor-pointer transition-all flex shadow-xs"
            >
              <Calendar className="h-4 w-4 text-indigo-600" />
              <span>My Appointments</span>
            </button>

            <div className="hidden lg:flex items-center text-xs text-slate-400 space-x-1">
              <PhoneCall className="h-3 w-3 text-indigo-600" />
              <span>Primary Helpline:</span>
              <strong className="text-slate-600">+91 88915 99027</strong>
            </div>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer shadow-xs"
              title="Toggle Dark Mode"
              id="theme-toggle"
            >
              {isDarkMode ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            {/* Profile Card or Login CTA */}
            {currentUser ? (
              <div 
                className="flex items-center space-x-2 bg-indigo-50/75 border border-indigo-100/50 rounded-xl px-3 py-1.5 text-slate-800"
                id="logged-in-user-profile-badge"
              >
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center font-display shadow-xs flex-shrink-0">
                  {currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <div className="hidden xs:block text-left max-w-28 leading-none">
                  <p className="text-[11px] font-bold truncate text-slate-800">{currentUser.name}</p>
                  <p className="text-[9px] text-indigo-600 font-mono font-bold mt-0.5 uppercase tracking-wider">Patient</p>
                </div>
                <button
                  onClick={() => {
                    localStorage.removeItem('docai_current_user');
                    setCurrentUser(null);
                  }}
                  className="px-2 py-1 bg-white hover:bg-rose-50 border border-slate-205/60 hover:border-rose-200 text-xs text-rose-600 font-bold rounded-lg transition-colors cursor-pointer"
                  title="Secure Logout"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all hover:scale-101 active:scale-99 cursor-pointer"
                id="login-navigation-cta"
              >
                Login / Sign In
              </button>
            )}

            {/* UPGRADED: Absolute pristine Three-Dot Dropdown Menu */}
            <div className="relative" id="three-dot-menu-container">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                id="header-three-dot-trigger"
                className="p-2.5 bg-slate-50 border border-slate-200/80 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50 rounded-xl cursor-pointer transition-all flex items-center justify-center shadow-xs"
              >
                <MoreVertical className="h-5 w-5" />
              </button>

              {isDropdownOpen && (
                <>
                  {/* Dropdown backdrop guard to ensure single-click cancellation safety */}
                  <div 
                    className="fixed inset-0 z-40 bg-transparent cursor-default" 
                    onClick={() => setIsDropdownOpen(false)} 
                  />
                  <div 
                    className="absolute right-0 mt-2.5 w-64 rounded-2xl glass-dropdown py-2 z-50 animate-fade-in text-sm font-sans"
                    id="three-dot-dropdown-overlay"
                  >
                    <div className="px-4 py-2 border-b border-slate-50">
                      <span className="text-[10px] font-mono tracking-widest text-slate-400 font-bold uppercase block">Clinic Menu Portal</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setSymptomAnalysis(null);
                        setCurrentScreen('doctors');
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center space-x-3 transition-colors cursor-pointer"
                    >
                      <Search className="h-4.5 w-4.5 text-indigo-600" />
                      <span>Find Doctor Specialists</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setCurrentScreen('appointments');
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center space-x-3 transition-colors cursor-pointer"
                    >
                      <Calendar className="h-4.5 w-4.5 text-indigo-600" />
                      <span>My Appointments</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setCurrentScreen('community');
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center space-x-3 transition-colors cursor-pointer"
                    >
                      <Users className="h-4.5 w-4.5 text-rose-500" />
                      <span>Community & Social</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setCurrentScreen('labs');
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center space-x-3 transition-colors cursor-pointer"
                    >
                      <Microscope className="h-4.5 w-4.5 text-sky-500" />
                      <span>Lab & Diagnostics</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setCurrentScreen('records');
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center space-x-3 transition-colors cursor-pointer"
                    >
                      <FileText className="h-4.5 w-4.5 text-indigo-600" />
                      <span>Medical Records</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setCurrentScreen('terms');
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center space-x-3 transition-colors cursor-pointer"
                    >
                      <Shield className="h-4.5 w-4.5 text-indigo-600" />
                      <span>Terms and Service</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setCurrentScreen('about');
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center space-x-3 transition-colors cursor-pointer"
                      id="three-dot-about-us-trigger"
                    >
                      <Users className="h-4.5 w-4.5 text-indigo-600" />
                      <span>About Us</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setPortalModalType('contact');
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-indigo-50/50 hover:text-indigo-750 text-xs font-semibold text-slate-700 flex items-center space-x-3 transition-colors cursor-pointer border-t border-slate-55/60 mt-1"
                    >
                      <Mail className="h-4.5 w-4.5 text-indigo-650" />
                      <span>Contact Us</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </header>

      {/* 2. Primary Layout Render Area */}
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        
        {currentScreen === 'landing' && (
          <div className="max-w-4xl mx-auto space-y-12 py-6 animate-fade-in" id="landing-screen">
            {/* Hero pitch banner */}
            <div className="text-center space-y-4">
              
              <h1 className="text-5xl font-display font-black tracking-tight text-slate-800 leading-none">
                Smart Patient Dispatch, <br />
                <span className="text-indigo-600">Instantly Analyzed</span>
              </h1>
              
              <p className="text-slate-500 max-w-lg mx-auto text-base leading-relaxed">
                Experience voice-activated clinical department matchmaking. Describe symptoms naturally to our AI virtual assistant, find elite specialty physicians, and book secure appointments today.
              </p>
            </div>

            {/* Launchpad buttons card */}
            <div className="glass-panel glass-panel-hover rounded-2xl p-8 text-center max-w-xl mx-auto space-y-4">
              <h3 className="font-display font-bold text-lg text-slate-800">Ready to Book an Appointment?</h3>
              <p className="text-xs text-slate-400">Describe symptoms via microphone or type details safely. DocAI will map you with the exact clinical category in seconds.</p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  onClick={() => setCurrentScreen('symptoms')}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md cursor-pointer text-sm transition-all hover:scale-101 active:scale-99 flex items-center justify-center space-x-2"
                >
                  <Activity className="h-4.5 w-4.5 animate-pulse" />
                  <span>Use Voice Symptom AI Checker</span>
                </button>
                <button
                  onClick={() => {
                    setSymptomAnalysis(null);
                    setCurrentScreen('doctors');
                  }}
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md cursor-pointer text-sm transition-all hover:scale-101 active:scale-99 flex items-center justify-center space-x-2"
                >
                  <Stethoscope className="h-4.5 w-4.5" />
                  <span>Browse Directory Directly</span>
                </button>
              </div>
            </div>

            {/* Quality and Security Trust row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              
              <div className="glass-panel glass-panel-hover rounded-xl p-5 space-y-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg inline-block">
                  <Activity className="h-5 w-5" />
                </div>
                <h4 className="font-display font-bold text-slate-800 text-sm">Vocal Diagnostic Analysis</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Leverages Gemini AI to securely extract symptoms and triage clinical mapping accuracy to appropriate doctor departments.
                </p>
              </div>

              <div className="glass-panel glass-panel-hover rounded-xl p-5 space-y-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg inline-block">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h4 className="font-display font-bold text-slate-800 text-sm">PCI-DSS Payment checkout</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Secured credit card token validation loops protect personal financial logs. Complete, fully simulated offline checkout.
                </p>
              </div>

              <div className="glass-panel glass-panel-hover rounded-xl p-5 space-y-2">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg inline-block">
                  <Heart className="h-5 w-5" />
                </div>
                <h4 className="font-display font-bold text-slate-800 text-sm">Verified Practitioners</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  All physicians undergo strict credentialing validation. Board certifications from Harvard, Mayo, Hopkins, and more.
                </p>
              </div>

            </div>

            {/* --- NEW SECTION: Project Overview & Clinical System --- */}
            <hr className="border-slate-200" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-4" id="project-description-section">
              <div className="space-y-4">
                <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider font-mono inline-block">
                  Technical Architecture
                </span>
                <h2 className="text-3xl font-display font-bold text-slate-800 leading-tight">
                  About the DocAI Clinical System
                </h2>
                <div className="text-slate-500 text-sm space-y-3 leading-relaxed">
                  <p>
                    DocAI represents the next generation of patient-centric digital clinical dispatching. By removing traditional hospital triage bottlenecks, you can voice-describe raw symptoms directly to our integrated Google Gemini AI engine.
                  </p>
                  <p>
                    The AI parses complex symptom lists dynamically, evaluates patient priorities, and coordinates direct scheduling with verified clinical professionals. Built on modular high-performance full-stack architectures, patients experience zero delays in routing.
                  </p>
                  <p>
                    Your diagnostic data resides in secure, isolated memory slots, shielded from unauthorized access. Every booking triggers an encrypted digital ticket receipt and automated billing record.
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 rounded-2xl p-6 text-white space-y-4 border border-indigo-850 shadow-md">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-indigo-400 animate-pulse" />
                  <span className="text-xs font-mono tracking-widest text-indigo-300 uppercase font-bold">System Status Dashboard</span>
                </div>
                <hr className="border-white/10" />
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-indigo-200">AI Dispatch Latency:</span>
                    <span className="text-indigo-400 font-bold">42ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-indigo-200">Symptom Accuracy Map:</span>
                    <span className="text-indigo-400 font-bold">98.4%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-indigo-200">Live Active Doctors:</span>
                    <span className="text-indigo-400 font-bold">6 verified</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-indigo-200">Gateway Protocols:</span>
                    <span className="text-indigo-400 font-bold">PCI-DSS Secure</span>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/15 p-3 rounded-lg text-[11px] leading-relaxed text-indigo-200">
                  ⚡ <strong>Auto-Failover</strong> is active. Secondary Google Gemini API model is operating as a hot backup on standard ports.
                </div>
              </div>
            </div>

            {/* --- NEW SECTION: Features Bento Matrix Grid --- */}
            <hr className="border-slate-200" />
            
            <div className="space-y-4 pt-4" id="features-matrix-section">
              <div className="text-center space-y-1">
                <span className="text-indigo-600 text-xs font-mono font-bold uppercase tracking-wider">Features Matrix</span>
                <h2 className="text-3xl font-display font-bold text-slate-800">Advanced Integrated Features</h2>
                <p className="text-slate-400 text-xs max-w-md mx-auto">Explore the tools built right inside this portal.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-100 hover:border-slate-200 transition-all space-y-2">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg inline-block">
                    <Activity className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">Instant Voice assessment</h4>
                  <p className="text-slate-400 text-xs">Record symptoms via microphoned assess text. Gemini matches exact clinical specialties.</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-100 hover:border-slate-200 transition-all space-y-2">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg inline-block">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">Visual Weekly Calendar</h4>
                  <p className="text-slate-400 text-xs">Browse real-time hourly slots across multiple dates to plan custom medical follow-ups.</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-100 hover:border-slate-200 transition-all space-y-2">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg inline-block">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">Luxury Checkout Loop</h4>
                  <p className="text-slate-400 text-xs">Simulated Stripe layout handles card tokens privately under standard validation steps.</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-100 hover:border-slate-200 transition-all space-y-2">
                  <div className="p-2 bg-rose-50 text-rose-600 rounded-lg inline-block">
                    <UserCog className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">Admin Control Center</h4>
                  <p className="text-slate-400 text-xs">Allows clinic coordinators to toggle shift limits, view visitor inquiries, and track billings.</p>
                </div>
              </div>
            </div>

            {/* --- NEW SECTION: Stateful Contact Enquiry Form --- */}
            <hr className="border-slate-200" />
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 space-y-6 pt-4" id="contact-form-section">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-widest block">Reach our Desk</span>
                  <h3 className="text-2xl font-display font-bold text-slate-800">Hospital Contact & Support Inquiry</h3>
                  <p className="text-xs text-slate-400">Have hospital inquiries or general medical questions? Send us an electronic request card.</p>
                </div>
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2 text-indigo-800 text-xs font-mono uppercase font-bold">
                  ⚡ Inbox Checked Hourly
                </div>
              </div>

              {contactSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 text-xs font-mono flex items-center animate-bounce">
                  <span>✅ Success! Your clinic inquiry card was logged securely. Staff members will reply shortly.</span>
                </div>
              )}

              <form onSubmit={handleContactSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-600 uppercase">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Connor"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none rounded-xl text-xs placeholder:text-slate-400 bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-600 uppercase">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. sarah@skynet.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none rounded-xl text-xs placeholder:text-slate-400 bg-slate-50/50"
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="block text-xs font-semibold text-slate-600 uppercase">Subject Topic</label>
                  <input
                    type="text"
                    placeholder="e.g. Pediatrics doctor consult availability next week"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none rounded-xl text-xs placeholder:text-slate-400 bg-slate-50/50"
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="block text-xs font-semibold text-slate-600 uppercase">Your Inquiry Message *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe your question or message request in full detail..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none rounded-xl text-xs placeholder:text-slate-400 bg-slate-50/50 resize-y"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingContact}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer text-center"
                  >
                    {isSubmittingContact ? "Dispatching..." : "Submit Inquiry Message"}
                  </button>
                </div>
              </form>
            </div>

          </div>
        )}

        {currentScreen === 'symptoms' && (
          <VoiceInput 
            onAnalysisComplete={handleSymptomAnalysisComplete} 
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        )}

        {currentScreen === 'doctors' && (
          <DoctorListing 
            analysis={symptomAnalysis}
            onSelectDoctorSlot={handleSelectDoctorSlot}
            onGoBack={() => setCurrentScreen('landing')}
          />
        )}

        {currentScreen === 'payment' && selectedDoctor && (
          <PaymentGateway 
            doctor={selectedDoctor}
            timeSlot={selectedSlot}
            date={selectedDate}
            symptomsAnalysed={symptomAnalysis?.extractedSymptoms || []}
            isProcessing={isPaying}
            currentUser={currentUser}
            onConfirmBooking={handleConfirmPayment}
            onCancel={() => setCurrentScreen('doctors')}
          />
        )}

        {currentScreen === 'confirmation' && confirmedAppointment && (
          <BookingConfirmation 
            appointment={confirmedAppointment}
            onReset={handleResetLoop}
          />
        )}

        {currentScreen === 'admin' && (
          <AdminDashboard 
            onGoBack={() => setCurrentScreen('landing')}
          />
        )}

        {currentScreen === 'appointments' && (
          <MyAppointments 
            currentUser={currentUser}
            onGoBack={() => setCurrentScreen('landing')}
            onBookNew={() => {
              setSymptomAnalysis(null);
              setCurrentScreen('doctors');
            }}
          />
        )}

        {currentScreen === 'terms' && (
          <TermsAndConditions 
            onGoBack={() => setCurrentScreen('landing')}
          />
        )}

        {currentScreen === 'about' && (
          <AboutUs 
            onGoBack={() => setCurrentScreen('landing')}
          />
        )}

        {currentScreen === 'records' && (
          <MedicalRecords 
            onGoBack={() => setCurrentScreen('landing')}
          />
        )}

        {currentScreen === 'community' && (
          <CommunityHub 
            onGoBack={() => setCurrentScreen('landing')}
          />
        )}

        {currentScreen === 'labs' && (
          <LabDiagnostics 
            onGoBack={() => setCurrentScreen('landing')}
          />
        )}

      </main>

      {/* 3. Global Footer copyright details */}
      <footer className="bg-white border-t border-slate-100 py-6" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-4.5 w-4.5 text-indigo-600" />
            <span className="text-xs font-semibold text-slate-500 font-mono">
              [DocAI Core Net Shield Node • Online and Verified]
            </span>
          </div>

          <div className="text-[11px] text-slate-400 font-mono tracking-widest uppercase">
            © 2026 DocAI Incorporated • Safe Clinical Management System
          </div>
        </div>
      </footer>

      {/* Dynamic quick-access services modal popup */}
      <PortalModal
        isOpen={portalModalType !== null}
        type={portalModalType || 'appointments'}
        onClose={() => setPortalModalType(null)}
        onNavigateToDoctors={() => {
          setPortalModalType(null);
          setSymptomAnalysis(null);
          setCurrentScreen('doctors');
        }}
      />

      {/* Dynamic User Authentication, Registration and Profile Portal popup */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          localStorage.setItem('docai_current_user', JSON.stringify(user));
        }}
      />

    </div>
  );
}
