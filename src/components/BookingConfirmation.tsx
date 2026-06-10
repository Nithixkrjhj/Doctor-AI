import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle, ShieldCheck, Printer, ArrowDownCircle, RefreshCw, Calendar, Clock, MapPin, Heart, Mail, Send, Loader2, Eye, Check, Server } from 'lucide-react';
import { Appointment } from '../types';

interface BookingConfirmationProps {
  appointment: Appointment;
  onReset: () => void;
}

interface ConfettiPiece {
  id: number;
  left: string;
  top: string;
  color: string;
  size: number;
  shape: 'circle' | 'square' | 'triangle' | 'strip';
  xSpeed: string;
  yUp: string;
  yDown: string;
  xDrift: string;
  rotMid: string;
  rotEnd: string;
  delay: string;
  duration: string;
}

export default function BookingConfirmation({ appointment, onReset }: BookingConfirmationProps) {
  const [simulationStep, setSimulationStep] = useState(0);
  const [showEmailInbox, setShowEmailInbox] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setSimulationStep(1), 650),
      setTimeout(() => setSimulationStep(2), 1450),
      setTimeout(() => setSimulationStep(3), 2250),
      setTimeout(() => setSimulationStep(4), 3000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleDownload = () => {
    alert("Simulating Slip PDF generation... Download file 'DocAI_Booking_Receipt.pdf' successfully initiated.");
  };

  const handlePrint = () => {
    // Custom clean preview rendering before printing
    window.print();
  };

  // Generate a wonderful physical canvas of confetti pieces exploding from the checkmark center
  const confettiParticles = useMemo<ConfettiPiece[]>(() => {
    const arr: ConfettiPiece[] = [];
    const colors = [
      '#6366f1', // Indigo
      '#4f46e5', // High-contrast Indigo
      '#3b82f6', // Bright Blue
      '#10b981', // Emerald
      '#f59e0b', // Amber/Gold
      '#ec4899', // Hot Pink
      '#8b5cf6', // Grape Purple
      '#f43f5e'  // Deep Rose
    ];
    const shapes: ('circle' | 'square' | 'triangle' | 'strip')[] = ['circle', 'square', 'triangle', 'strip'];

    for (let i = 0; i < 85; i++) {
      // Calculate random dispersion angles in degrees, covering a beautiful wide fan arc (200deg to 340deg, i.e., shooting upwards and outwards)
      const angleDeg = 200 + Math.random() * 140; 
      const angleRad = (Math.PI / 180) * angleDeg;
      
      // Calculate individual explosion speed forces
      const forceMultiplier = 130 + Math.random() * 180; // pixels distance
      const xForce = Math.cos(angleRad) * forceMultiplier;
      const yForce = Math.sin(angleRad) * forceMultiplier - 30; // strong upward velocity injection
      
      // Add natural horizontal breeze drifting and drop vectors
      const xDrift = xForce + (Math.random() * 120 - 60);
      const yDown = yForce + 450 + Math.random() * 200; // falling down 450-650px from peak
      
      const size = 5 + Math.floor(Math.random() * 8); // nice range of sizes: 5px to 13px
      const duration = 2.5 + Math.random() * 1.3; // duration of falling: 2.5s to 3.8s
      const delay = Math.random() * 0.22; // staggered sequential burst start timing

      arr.push({
        id: i,
        left: '50%',
        top: '60px', // centers perfectly around the bouncy checkmark circle
        color: colors[i % colors.length],
        size,
        shape: shapes[i % shapes.length],
        xSpeed: `${xForce.toFixed(1)}px`,
        yUp: `${yForce.toFixed(1)}px`,
        yDown: `${yDown.toFixed(1)}px`,
        xDrift: `${xDrift.toFixed(1)}px`,
        rotMid: `${(120 + Math.random() * 240).toFixed(0)}deg`,
        rotEnd: `${(360 + Math.random() * 720).toFixed(0)}deg`,
        delay: `${delay.toFixed(3)}s`,
        duration: `${duration.toFixed(3)}s`
      });
    }
    return arr;
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6 relative" id="booking-confirmation-parent">
      
      {/* Pure CSS declarative keyframes injected once at the root layout */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes confetti-burst {
          0% {
            transform: translate3d(0, 0, 0) scale(0.2) rotate(0deg);
            opacity: 1;
          }
          15% {
            transform: translate3d(var(--x-speed), var(--y-up), 0) scale(1.1) rotate(var(--rot-mid));
            opacity: 1;
          }
          100% {
            transform: translate3d(var(--x-drift), var(--y-down), 0) scale(0.6) rotate(var(--rot-end));
            opacity: 0;
          }
        }
        @keyframes check-pulse-ring-outer {
          0% {
            transform: scale(0.85);
            opacity: 0.95;
          }
          50% {
            transform: scale(1.5);
            opacity: 0.35;
          }
          100% {
            transform: scale(2.0);
            opacity: 0;
          }
        }
        @keyframes check-pulse-ring-inner {
          0% {
            transform: scale(0.95);
            opacity: 1;
          }
          40% {
            transform: scale(1.3);
            opacity: 0.5;
          }
          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }
        .confetti-particle {
          animation: confetti-burst var(--duration) cubic-bezier(0.12, 0.85, 0.3, 1) var(--delay) forwards;
        }
        .animate-pulse-ring-outer {
          animation: check-pulse-ring-outer 2.4s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }
        .animate-pulse-ring-inner {
          animation: check-pulse-ring-inner 2.4s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }
      `}} />

      {/* Confetti canvas field that does not block user clicks on underlying ticket actions */}
      <div className="pointer-events-none absolute inset-x-0 -top-12 z-50 overflow-hidden" style={{ height: '700px' }}>
        {confettiParticles.map((p) => {
          let borderRadiusClass = '';
          let borderRadiusStyle: React.CSSProperties = {};
          
          if (p.shape === 'circle') {
            borderRadiusClass = 'rounded-full';
          } else if (p.shape === 'triangle') {
            borderRadiusStyle = {
              width: 0,
              height: 0,
              backgroundColor: 'transparent',
              borderLeft: `${p.size / 2}px solid transparent`,
              borderRight: `${p.size / 2}px solid transparent`,
              borderBottom: `${p.size}px solid ${p.color}`,
            };
          } else if (p.shape === 'strip') {
            borderRadiusStyle = {
              width: `${p.size}px`,
              height: `${Math.floor(p.size / 3.2)}px`,
              backgroundColor: p.color
            };
          } else {
            borderRadiusStyle = {
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color
            };
          }

          return (
            <div
              key={p.id}
              className={`absolute confetti-particle ${borderRadiusClass}`}
              style={{
                left: p.left,
                top: p.top,
                '--x-speed': p.xSpeed,
                '--y-up': p.yUp,
                '--y-down': p.yDown,
                '--x-drift': p.xDrift,
                '--rot-mid': p.rotMid,
                '--rot-end': p.rotEnd,
                '--duration': p.duration,
                '--delay': p.delay,
                width: p.shape !== 'triangle' && p.shape !== 'strip' ? `${p.size}px` : undefined,
                height: p.shape !== 'triangle' && p.shape !== 'strip' ? `${p.size}px` : undefined,
                backgroundColor: p.shape !== 'triangle' && p.shape !== 'strip' ? p.color : undefined,
                ...borderRadiusStyle
              } as React.CSSProperties}
            />
          );
        })}
      </div>
      
      {/* 1. Header greeting */}
      <div className="text-center space-y-2 py-4 relative z-10">
        <div className="inline-flex items-center justify-center p-3.5 rounded-full bg-indigo-50 text-indigo-600 mb-2 relative">
          
          {/* Subtle 'check-pulse' echo animations radiating from the center */}
          <div className="absolute inset-0 rounded-full bg-indigo-200 animate-pulse-ring-outer pointer-events-none" />
          <div className="absolute inset-0 rounded-full bg-indigo-200 animate-pulse-ring-inner pointer-events-none" />
          
          <CheckCircle className="h-10 w-10 relative z-10 animate-bounce" />
        </div>
        <h2 className="text-3xl font-display font-bold text-slate-800">Appointment Confirmed!</h2>
        <p className="text-slate-500 text-sm max-w-sm mx-auto">
          Your credit card authorization was cleared. Below is your official clinic gateway admission ticket pass.
        </p>
      </div>

      {/* 2. Medical Ticket Pass */}
      <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden relative" id="admission-ticket-pass">
        
        {/* Ticket Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-900 text-white p-6 justify-between flex items-start">
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-widest text-indigo-200 uppercase font-bold block">Official Clinic Ticket Pass</span>
            <h3 className="font-display font-extrabold text-2xl tracking-tight">DocAI Care Systems</h3>
          </div>
          <ShieldCheck className="h-8 w-8 text-indigo-300" />
        </div>

        {/* Ticket Body details */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            
            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] font-mono uppercase block">Specialist Physician</span>
              <span className="text-sm font-semibold text-slate-800 block">{appointment.doctorName}</span>
              <span className="bg-slate-100 text-slate-600 text-[9px] font-mono tracking-wider px-2 py-0.5 rounded-full font-semibold uppercase inline-block">
                {appointment.doctorSpecialty}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] font-mono uppercase block">Time Slot Allocated</span>
              <span className="text-sm font-semibold text-slate-800 flex items-center font-mono">
                <Clock className="h-3.5 w-3.5 mr-1 text-indigo-600" />
                {appointment.timeSlot}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] font-mono uppercase block">Scheduled Date</span>
              <span className="text-sm font-semibold text-slate-800 flex items-center font-mono">
                <Calendar className="h-3.5 w-3.5 mr-1 text-indigo-600" />
                {appointment.date}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] font-mono uppercase block">Consultation Price</span>
              <span className="text-sm font-semibold text-indigo-600 font-mono block">
                ₹{appointment.feePaid} Paid
              </span>
            </div>

          </div>

          <hr className="border-dashed border-slate-200" />

          {/* Patient Details */}
          <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] font-mono uppercase block">Patient Checked</span>
              <span className="text-xs font-semibold text-slate-700 block">{appointment.patientName}</span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] font-mono uppercase block">Registry Email</span>
              <span className="text-xs font-semibold text-slate-700 block truncate">{appointment.patientEmail}</span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] font-mono uppercase block">Symptomatic Core</span>
              <span className="text-[10px] text-slate-500 font-medium block truncate">
                {appointment.symptomsAnalysed.join(', ') || "Self-Declared Description"}
              </span>
            </div>

          </div>

          {/* Ticket Perforated Tear-off divider */}
          <div className="relative h-px border-t border-dashed border-slate-300 my-6">
            <div className="absolute -left-10 -top-2 w-4 h-4 bg-slate-50 rounded-full border border-slate-100 shadow-inner"></div>
            <div className="absolute -right-10 -top-2 w-4 h-4 bg-slate-50 rounded-full border border-slate-100 shadow-inner"></div>
          </div>

          {/* Barcode & Security receipts info */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2">
            
            <div className="space-y-1 flex flex-col items-center md:items-start">
              <span className="text-slate-400 text-[10px] font-mono uppercase block">Validation Barcode</span>
              {/* Retro SVG Barcode */}
              <div className="flex space-x-0.5 bg-slate-900/5 p-2 rounded-lg justify-center select-none" title={appointment.id}>
                {[1,3,2,1,4,2,3,1,2,4,1,3,1,2,3,2,1,4,2].map((width, idx) => (
                  <div key={idx} className="bg-slate-800" style={{ width: `${width}px`, height: '24px' }} />
                ))}
              </div>
              <span className="text-[9px] font-mono text-slate-400 block tracking-widest">{appointment.id}</span>
            </div>

            <div className="text-right space-y-1 text-center md:text-right">
              <span className="text-slate-400 text-[10px] font-mono uppercase block">Secure Gateway Ticket</span>
              <div className="text-xs font-semibold text-slate-700 flex items-center justify-center md:justify-end">
                <ShieldCheck className="h-4 w-4 mr-1 text-indigo-600" />
                <span className="font-mono tracking-wider">{appointment.paymentId}</span>
              </div>
              <span className="text-[9px] text-slate-400 block">PCI Licensed Digital Receipt</span>
            </div>

          </div>

        </div>

        {/* Footnotes */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 text-center text-[10px] text-slate-400 flex items-center justify-center space-x-1.5 font-mono">
          <MapPin className="h-3 w-3 text-indigo-600" />
          <span>DocAI Clinic Hub Network Locations • Telehealth Gateway Secure</span>
        </div>

      </div>

      {/* 2.5 Dynamic SMTP Email Delivery Simulation Engine */}
      <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 shadow-xl border border-slate-800 space-y-4" id="email-delivery-simulation-panel">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/15">
              <Server className="h-4.5 w-4.5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold font-display text-white">Simulated Mail Delivery Service</h4>
              <p className="text-[10px] font-mono text-slate-400">DocAI Relational Outbox SMTP Module</p>
            </div>
          </div>
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-semibold font-mono tracking-wider px-2 py-0.5 rounded-full uppercase self-start sm:self-center">
            Active Simulator
          </span>
        </div>

        {/* Step-by-step checklist of the simulator logs */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {[
            { stepNum: 1, label: "Verify SMTP Credentials", desc: "Auth support@smtp.docai.com" },
            { stepNum: 2, label: "Template Generation", desc: "Render HTML prescription structure" },
            { stepNum: 3, label: "TLS Secure Broadcast", desc: "Dispatching to outbox channel" },
            { stepNum: 4, label: "Inbox Handshake", desc: `Delivered to recipient inbox` }
          ].map((item) => {
            const isCompleted = simulationStep >= item.stepNum;
            const isProcessing = simulationStep === item.stepNum - 1;
            
            return (
              <div 
                key={item.stepNum} 
                className={`p-3 rounded-xl border transition-all duration-300 ${
                  isCompleted 
                    ? "bg-slate-950/40 border-indigo-950/50 text-indigo-400" 
                    : isProcessing 
                    ? "bg-indigo-950/40 border-indigo-500/30 text-indigo-300 animate-pulse" 
                    : "bg-slate-950/25 border-slate-850 text-slate-500"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-mono font-bold tracking-wider">STAGE 0{item.stepNum}</span>
                  {isCompleted ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : isProcessing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                  )}
                </div>
                <h5 className="text-[11px] font-bold text-slate-200 truncate">{item.label}</h5>
                <p className="text-[9px] text-slate-400 truncate mt-0.5">{item.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Post Delivery interactive sandbox section */}
        {simulationStep === 4 ? (
          <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-left">
              <span className="text-[9.5px] font-mono font-bold tracking-widest text-indigo-400 uppercase block">Outbox Transmission Confirmed</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                An official confirmation email was processed and sent to <span className="font-mono text-indigo-300 font-bold underline decoration-dotted">{appointment.patientEmail}</span>. The sender address was configured as <span className="font-mono text-indigo-300 font-bold">docaisupport@gmil.com</span>.
              </p>
            </div>
            <button
              onClick={() => setShowEmailInbox(!showEmailInbox)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 hover:shadow-lg transition-all active:scale-97 flex-shrink-0 cursor-pointer"
            >
              <Eye className="h-4 w-4" />
              <span>{showEmailInbox ? 'Hide Mail Inbox' : 'Open Simulated Inbox'}</span>
            </button>
          </div>
        ) : (
          <div className="bg-slate-950/30 rounded-2xl p-4 border border-dashed border-slate-800 text-center py-5">
            <span className="inline-block animate-bounce mb-1">📬</span>
            <p className="text-[11px] font-mono text-slate-400">Processing real-time SMTP handshake sequences...</p>
          </div>
        )}

        {/* Beautiful Simulated Webmail Client */}
        {simulationStep === 4 && showEmailInbox && (
          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl" id="simulated-email-client-container">
            {/* Mail header */}
            <div className="bg-slate-900 border-b border-slate-800 p-3 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="text-[10px] font-mono text-slate-450 ml-2">Inbox Explorer (Simulated Client)</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">1 New Message</span>
            </div>

            {/* Mail Envelope / Details */}
            <div className="p-4 border-b border-slate-850 space-y-2 bg-slate-900/30 text-xs text-left">
              <div className="grid grid-cols-6 gap-1">
                <span className="text-slate-550 font-mono text-[11px] uppercase col-span-1">Subject:</span>
                <span className="text-slate-200 font-bold text-[11px] col-span-5 col-start-2">Booking Confirmed: Admission Ticket #{appointment.id} inside DocAI Systems</span>
              </div>
              <div className="grid grid-cols-6 gap-1">
                <span className="text-slate-550 font-mono text-[11px] uppercase col-span-1">From:</span>
                <span className="text-slate-200 col-span-5 col-start-2 font-mono">
                  DocAI Systems Support &lt;<span className="text-indigo-450 font-bold">docaisupport@gmil.com</span>&gt;
                </span>
              </div>
              <div className="grid grid-cols-6 gap-1">
                <span className="text-slate-550 font-mono text-[11px] uppercase col-span-1">To:</span>
                <span className="text-slate-200 col-span-5 col-start-2 font-mono">
                  {appointment.patientName} &lt;<span className="text-indigo-400">{appointment.patientEmail}</span>&gt;
                </span>
              </div>
            </div>

            {/* Rendered Email Content Wrapper resembling a real HTML clinic newsletter ticket */}
            <div className="bg-slate-100 p-4 sm:p-6 md:p-8 text-slate-800 text-left selection:bg-indigo-100" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-md border border-slate-200/60 overflow-hidden">
                
                {/* Header brand */}
                <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 text-white p-5 justify-between flex items-center">
                  <div>
                    <h3 className="font-extrabold text-base tracking-tight leading-none">DocAI Care Hub</h3>
                    <p className="text-[9px] text-indigo-200 font-mono tracking-widest mt-1.5 uppercase font-bold">Automated Notification Portal</p>
                  </div>
                  <Mail className="h-6.5 w-6.5 text-indigo-300 animate-pulse" />
                </div>

                {/* Email Body */}
                <div className="p-5 space-y-4">
                  <h4 className="text-sm font-bold text-slate-900">Hello {appointment.patientName},</h4>
                  <p className="text-[12px] text-slate-600 leading-relaxed">
                    This is an automated confirmation verifying that your telehealth consultation or in-person checkup appointment was scheduled and approved. Your payment request has been certified. Your official entrance receipt is provided below.
                  </p>

                  {/* Summary ticket detail inside email */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/40 space-y-3">
                    <h5 className="text-[10px] font-bold text-indigo-650 uppercase tracking-wider font-mono">Admission Ticket Details</h5>
                    
                    <div className="grid grid-cols-2 gap-4 text-[11px]">
                      <div>
                        <span className="text-slate-400 text-[9px] uppercase font-mono block">Physician</span>
                        <span className="font-semibold text-slate-800">{appointment.doctorName}</span>
                        <span className="text-[10px] text-slate-500 block">({appointment.doctorSpecialty})</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[9px] uppercase font-mono block">Allocated Time</span>
                        <span className="font-semibold text-slate-800 block">{appointment.timeSlot}</span>
                        <span className="text-[10px] text-slate-500 block">{appointment.date}</span>
                      </div>
                    </div>

                    <div className="border-t border-slate-200/60 pt-3 grid grid-cols-2 gap-4 text-[11px]">
                      <div>
                        <span className="text-slate-400 text-[9px] uppercase font-mono block">Admission Fee</span>
                        <span className="font-semibold text-green-700">₹{appointment.feePaid} (Paid Securely)</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[9px] uppercase font-mono block">Ticket Registry Ref</span>
                        <span className="font-semibold text-slate-800 font-mono tracking-wider">{appointment.id}</span>
                      </div>
                    </div>
                  </div>

                  {/* headquarters update */}
                  <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-start space-x-2.5">
                    <MapPin className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <div className="text-[11px] text-slate-650 leading-relaxed">
                      <strong className="text-slate-800 font-bold block">Facility Location Headquarters</strong>
                      Nelamangala Square Office, Bangalore (PIN 562123), Karnataka
                    </div>
                  </div>

                  <p className="text-[12px] text-slate-600 leading-relaxed">
                    Should you feel any immediate need to modify your schedule or declare complementary symptom sheets, simply use our in-app Voice diagnostics console or contact our support lines at <strong className="text-slate-850">docaisupport@gmil.com</strong>.
                  </p>

                  <div className="border-t border-slate-200 pt-4 flex flex-col items-center text-center text-[10px] text-slate-450 font-mono space-y-0.5">
                    <span>DocAI Care Systems Co. • Bengaluru Digital Hub</span>
                    <span>This is a transaction-triggered digital email of medical nature.</span>
                  </div>

                </div>

              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Slip Action Row */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
        <button
          onClick={handlePrint}
          className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-800 border border-slate-200 text-xs font-semibold rounded-xl inline-flex items-center justify-center space-x-2 transition-all cursor-pointer active:scale-95"
        >
          <Printer className="h-4 w-4" />
          <span>Print Slip Receipt</span>
        </button>

        <button
          onClick={handleDownload}
          className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-800 border border-slate-200 text-xs font-semibold rounded-xl inline-flex items-center justify-center space-x-2 transition-all cursor-pointer active:scale-95"
        >
          <ArrowDownCircle className="h-4 w-4" />
          <span>Download PDF Ticket</span>
        </button>

        <button
          onClick={onReset}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl inline-flex items-center justify-center space-x-2 shadow-sm transition-all cursor-pointer active:scale-95 sm:ml-auto"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Consult Another Symptom</span>
        </button>
      </div>

      <div className="flex justify-center items-center space-x-1 py-4 text-indigo-600/70 text-xs font-medium">
        <Heart className="h-3.5 w-3.5 fill-indigo-500 animate-pulse" />
        <span>Stay safe first. Your health profile is shielded with absolute care.</span>
      </div>

    </div>
  );
}
