import React, { useState } from 'react';
import { 
  FileText, Shield, ArrowLeft, CheckCircle, AlertOctagon, 
  Download, Printer, ChevronDown, Check, Scale, Bookmark, Heart
} from 'lucide-react';

interface TermsAndConditionsProps {
  onGoBack: () => void;
}

export default function TermsAndConditions({ onGoBack }: TermsAndConditionsProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [agreementChecked, setAgreementChecked] = useState(() => {
    return localStorage.getItem('docai_terms_accepted') === 'true';
  });
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 40;
    if (isAtBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleAcceptCheckbox = (checked: boolean) => {
    setAgreementChecked(checked);
    localStorage.setItem('docai_terms_accepted', checked ? 'true' : 'false');
  };

  const handlePrint = () => {
    window.print();
  };

  const sections = [
    {
      id: 1,
      title: "1. Telehealth Triage & AI Screening Disclaimer",
      icon: <AlertOctagon className="h-5 w-5 text-indigo-505" />,
      content: `DocAI provides instant symptom analysis using advanced Google Gemini AI algorithms to route patients to appropriate medical staff. This screening does not constitute direct medical therapy, a definitive physical diagnosis, or a replacement for local hospital emergency rooms. Patients exhibiting severe conditions (intense cardiac pressure, deep chest pain, heavy bleeding, extreme respiratory distress) must bypass this virtual portal and dial local emergency services (like 112/108/911) directly.`
    },
    {
      id: 2,
      title: "2. Electronic Registration & Verification Safety",
      icon: <CheckCircle className="h-5 w-5 text-emerald-500" />,
      content: `Patients pledge to furnish genuine, up-to-date coordinate metrics (Full Name, contact telephone, active email inbox) during clinic appointment confirmations. Impersonating other citizens, supplying dummy medical feedback sheets, or creating false medical appointments on system directories triggers immediate restriction from the portal.`
    },
    {
      id: 3,
      title: "3. Patient Records Privacy & Encryption (HIPAA Compliance)",
      icon: <Shield className="h-5 w-5 text-sky-500" />,
      content: `DocAI honors state digital health privacy acts (HIPAA / clinical telemetry standards). Your vocal symptom entries and associated medical record checklists are processed securely in temporary runtime variables on container sandboxes. Financial checkout details are evaluated over isolated sandbox tokens, preventing local system operators from archiving raw credit card digits.`
    },
    {
      id: 4,
      title: "4. Postponements, Rescheduling, & Clinical Shifts Refund Policies",
      icon: <Scale className="h-5 w-5 text-amber-500" />,
      content: `Registered appointment bookings retain complete validation loops up to the selected date. Cancellations initiated at least 4 hours before the booked slot qualify for full financial processing back to original wallets. Clinic shifts missed without prior scheduling updates are processed as completed check-ins. Individual physicians hold discrete regulatory policies regarding personal billing values.`
    },
    {
      id: 5,
      title: "5. Digital Outbox Transmissions & System telemetry",
      icon: <Bookmark className="h-5 w-5 text-rose-500" />,
      content: `Clinic appointment receipts and automated prescriptions are delivered securely to your patient record inbox and optionally dispatched via simulated SMTP mail relays if active. System telemetry data remains isolated and runs inside a secure, compliant Cloud Run container infrastructure.`
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8 animate-slide-down" id="terms-and-conditions-page">
      
      {/* Page Header Layout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-indigo-100">
        <div className="flex items-center space-x-3.5">
          <button 
            onClick={onGoBack}
            className="p-2 bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl transition-all shadow-xs active:scale-90 cursor-pointer flex items-center justify-center group"
            id="back-to-home-from-terms"
            title="Go Back"
          >
            <ArrowLeft className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1 group-active:scale-90" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold font-mono tracking-wider px-2 py-0.5 rounded uppercase">
                Legal & Operational Guidelines
              </span>
            </div>
            <h1 className="text-3xl font-display font-black text-slate-900 tracking-tight mt-0.5">
              Terms & Patient Covenants
            </h1>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={handlePrint}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-205 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Printer className="h-4 w-4 text-slate-400" />
            <span>Print Covenant</span>
          </button>
        </div>
      </div>

      {/* Main Container Dual-Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Long-form scrollable document */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white/90 backdrop-blur-xs border border-slate-205 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                <span className="text-xs font-bold font-mono text-slate-500 uppercase">Interactive Legal Ledger</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">LATEST PROTOCOL: JUNE 2026</span>
            </div>

            {/* Scrollable Terms Text Box */}
            <div 
              onScroll={handleScroll}
              className="max-h-[380px] overflow-y-auto pr-3 space-y-5 text-xs text-slate-600 leading-relaxed scrollbar-thin border-r border-transparent"
              id="legal-document-scrollbar-box"
            >
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-sm">Patient Service Agreement & HIPAA Disclosures</h3>
                <p>
                  Please review the clinical guidelines carefully. By accessing or scheduling any telehealth, audiology screening, physical assessment, or specialist consultations on the DocAI platform, you consent to these covenants.
                </p>
              </div>

              {sections.map((section) => (
                <div key={section.id} className="border-t border-slate-100 pt-4 space-y-1.5">
                  <h4 className="font-bold text-slate-900 flex items-center space-x-2">
                    <span className="p-1 bg-indigo-50 rounded-md">{section.icon}</span>
                    <span>{section.title}</span>
                  </h4>
                  <p className="text-slate-500 font-normal leading-relaxed pl-8">
                    {section.content}
                  </p>
                </div>
              ))}

              <div className="border-t border-slate-100 pt-4 bg-slate-50 p-4 rounded-xl text-[11px] text-slate-500 text-center font-mono">
                ✦ End of Document Covenants ✦
                <br />
                Security and clinical assurance are maintained inside our regulatory micro-services.
              </div>
            </div>

            {/* Scroll indicator banner */}
            {!hasScrolledToBottom && (
              <div className="mt-3 text-center py-1.5 bg-indigo-50/50 rounded-xl text-[10.5px] font-semibold text-indigo-700 animate-pulse border border-indigo-100/40">
                ⬇ Please scroll to the bottom of the covenants to confirm check-in read.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Quick Action Consent Widget Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 space-y-5 relative overflow-hidden flex flex-col justify-between h-full">
            
            <div className="space-y-4">
              <span className="text-[9px] font-mono font-bold tracking-widest text-indigo-400 uppercase block">Verification Gate</span>
              
              <div className="space-y-2 text-left">
                <h3 className="font-display font-black text-lg text-white leading-tight">Patient Authorization</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  You are required to accept the clinical screening declarations and privacy standards before diagnostic dispatch matches.
                </p>
              </div>

              {/* Accordion FAQ summary */}
              <div className="space-y-2 pt-3 border-t border-slate-800">
                <span className="text-[9.5px] font-mono text-slate-500 uppercase block">Covenants FAQ</span>
                {sections.slice(0, 3).map((sec, idx) => (
                  <div key={idx} className="border border-slate-800 rounded-xl overflow-hidden text-xs">
                    <button
                      onClick={() => toggleAccordion(sec.id)}
                      className="w-full p-2.5 bg-slate-950/40 hover:bg-slate-950/80 text-left font-bold text-slate-300 flex items-center justify-between"
                    >
                      <span className="truncate">{sec.title.substring(3)}</span>
                      <ChevronDown className={`h-3.5 w-3.5 text-slate-500 transition-transform ${activeAccordion === sec.id ? 'rotate-180' : ''}`} />
                    </button>
                    {activeAccordion === sec.id && (
                      <div className="p-2.5 bg-slate-950 text-slate-400 text-[11px] leading-normal border-t border-slate-850">
                        {sec.content}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Checkbox Agreement Action */}
            <div className="space-y-3 pt-4 border-t border-slate-800 mt-auto">
              <label className="flex items-start space-x-2.5 cursor-pointer text-left select-none">
                <input 
                  type="checkbox"
                  checked={agreementChecked}
                  onChange={(e) => handleAcceptCheckbox(e.target.checked)}
                  className="mt-0.5 h-4 w-4 bg-slate-950 rounded border-slate-700 text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-[11px] text-slate-300 font-semibold leading-snug">
                  I clarify that I have fully read and verified the medical and AI screening disclosures.
                </span>
              </label>

              <button
                disabled={!agreementChecked}
                onClick={onGoBack}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Check className="h-4 w-4" />
                <span>Confirm & Back to Home</span>
              </button>
            </div>

          </div>
        </div>

      </div>

      <div className="flex justify-center items-center space-x-2 py-4 text-slate-400 text-xs">
        <Heart className="h-4 w-4 text-indigo-600 fill-indigo-500 animate-pulse" />
        <span>Care, Integrity, and HIPAA Privacy standards are meticulously honored at DocAI.</span>
      </div>

    </div>
  );
}
