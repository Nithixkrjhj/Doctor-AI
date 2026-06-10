import React, { useState, useEffect } from 'react';
import { CreditCard, ShieldCheck, Info, Sparkles, Smartphone, QrCode, Check, RefreshCcw } from 'lucide-react';
import { Doctor } from '../types';

interface PatientInput {
  name: string;
  email: string;
  phone: string;
}

interface PaymentGatewayProps {
  doctor: Doctor;
  timeSlot: string;
  date: string;
  symptomsAnalysed: string[];
  isProcessing: boolean;
  currentUser?: { id: string; name: string; email: string; phone: string } | null;
  onConfirmBooking: (formData: {
    patientName: string;
    patientEmail: string;
    patientPhone: string;
    cardDetails?: {
      cardNumber: string;
      cardExpiry: string;
      cardCvc: string;
    };
    upiId?: string;
  }) => void;
  onCancel: () => void;
}

export default function PaymentGateway({
  doctor,
  timeSlot,
  date,
  symptomsAnalysed,
  isProcessing,
  currentUser,
  onConfirmBooking,
  onCancel
}: PaymentGatewayProps) {
  // Patient details state
  const [patient, setPatient] = useState<PatientInput>({ 
    name: currentUser?.name || '', 
    email: currentUser?.email || '', 
    phone: currentUser?.phone || '' 
  });

  useEffect(() => {
    if (currentUser) {
      setPatient({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || ''
      });
    }
  }, [currentUser]);

  
  // Payment method selection ('card' | 'upi')
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
  const [upiId, setUpiId] = useState('');
  
  // Card details state
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  
  // Active step in simulated payment processing
  const [processingStep, setProcessingStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const PAY_STEPS = [
    "Establishing 256-bit SSL Handshake...",
    "Validating secure token credentials with banking network...",
    "Securing credit balance transaction authorized...",
    "Finalizing clinic registry reservations..."
  ];

  // Rotate loading steps if processing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isProcessing) {
      setProcessingStep(0);
      interval = setInterval(() => {
        setProcessingStep(prev => (prev < PAY_STEPS.length - 1 ? prev + 1 : prev));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isProcessing]);

  // Card Number space-formattings
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const matches = value.match(/(\d{1,4})/g);
    const formatted = matches ? matches.join(' ').substring(0, 19) : '';
    setCardNumber(formatted);
  };

  // Card expiry formatting e.g. "MM/YY"
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      let formatted = value;
      if (value.length >= 2) {
        formatted = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
      }
      setCardExpiry(formatted);
    }
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 4);
    setCardCvc(value);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const cleaned = rawVal.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length > 5) {
      formatted = `${cleaned.slice(0, 5)} ${cleaned.slice(5, 10)}`;
    }
    setPatient({ ...patient, phone: formatted.slice(0, 11) });
  };

  const validateForm = (): boolean => {
    const tempErrors: Record<string, string> = {};
    
    if (!patient.name.trim()) tempErrors.name = "Full name is required";
    if (!patient.email.trim() || !/\S+@\S+\.\S+/.test(patient.email)) tempErrors.email = "Provide a valid email address";
    if (!patient.phone.trim() || patient.phone.replace(/\s/g, '').length < 10) tempErrors.phone = "Provide a valid 10-digit Indian contact number";
    
    if (paymentMethod === 'card') {
      if (cardNumber.replace(/\s/g, '').length < 16) tempErrors.cardNum = "Incomplete credit card number";
      if (!cardHolder.trim()) tempErrors.cardHolder = "Cardholder name is required";
      if (cardExpiry.length < 5) tempErrors.expiry = "Use full expiration timeline (MM/YY)";
      if (cardCvc.length < 3) tempErrors.cvc = "Validation code incomplete";
    } else {
      if (!upiId.trim()) {
        tempErrors.upiId = "UPI ID/VPA Address is required";
      } else if (!upiId.includes('@') || upiId.startsWith('@') || upiId.endsWith('@')) {
        tempErrors.upiId = "Provide a valid UPI ID (e.g. name@bank)";
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onConfirmBooking({
        patientName: patient.name,
        patientEmail: patient.email,
        patientPhone: patient.phone,
        cardDetails: paymentMethod === 'card' ? {
          cardNumber,
          cardExpiry,
          cardCvc
        } : undefined,
        upiId: paymentMethod === 'upi' ? upiId : undefined
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 relative" id="payment-gateway-wrapper">
      
      {/* 1. Transaction Processing Modal Glassmorphism Block */}
      {isProcessing && (
        <div className="absolute inset-x-0 inset-y-0 bg-slate-900/90 backdrop-blur-md rounded-2xl z-40 flex flex-col items-center justify-center p-6 text-white text-center">
          <div className="w-20 h-20 relative flex items-center justify-center mb-6">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-20"></span>
            <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-indigo-400"></div>
            <ShieldCheck className="h-6 w-6 absolute text-indigo-400" />
          </div>
          
          <h3 className="text-2xl font-display font-medium text-white mb-2">
            Secure Payment Authorization
          </h3>
          <p className="text-indigo-400 text-xs font-mono font-bold tracking-wider uppercase mb-8">
            Do not refresh or click back
          </p>

          <div className="max-w-md w-full space-y-2">
            {PAY_STEPS.map((step, idx) => (
              <div 
                key={idx} 
                className={`flex items-center space-x-3 text-sm font-mono text-left p-3 rounded-lg border transition-all duration-300 ${
                  processingStep === idx 
                    ? 'bg-slate-800/80 text-indigo-400 border-indigo-500/30' 
                    : processingStep > idx 
                      ? 'bg-slate-950/40 text-indigo-600 border-none opacity-50' 
                      : 'text-slate-500 border-transparent opacity-20'
                }`}
              >
                <div className={`h-2.5 w-2.5 rounded-full ${processingStep >= idx ? 'bg-indigo-400' : 'bg-slate-700'}`} />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Main Page Layout Grid */}
      <h2 className="text-3xl font-display font-bold text-slate-800 mb-2">Secure Appointment Booking</h2>
      <p className="text-slate-500 text-sm mb-6">Secured checkout powered by DocAI clinical processing gateway node.</p>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="checkout-form">
        
        {/* Left Side: Client profile details & credit options */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Patient Details Cards */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider">Patient Contact Profile</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={patient.name}
                  onChange={(e) => setPatient({ ...patient, name: e.target.value })}
                  className={`w-full px-3.5 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm ${
                    errors.name ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200'
                  }`}
                />
                {errors.name && <span className="text-[10px] text-rose-500 mt-1 block">{errors.name}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. john@example.com"
                  value={patient.email}
                  onChange={(e) => setPatient({ ...patient, email: e.target.value })}
                  className={`w-full px-3.5 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm ${
                    errors.email ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200'
                  }`}
                />
                {errors.email && <span className="text-[10px] text-rose-500 mt-1 block">{errors.email}</span>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Contact Line</label>
              <input
                type="tel"
                placeholder="e.g. 88915 99027"
                value={patient.phone}
                onChange={handlePhoneChange}
                className={`w-full px-3.5 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm ${
                  errors.phone ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200'
                }`}
              />
              {errors.phone && <span className="text-[10px] text-rose-500 mt-1 block">{errors.phone}</span>}
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Payment Method Selector */}
          <div className="space-y-3" id="payment-method-selector-section">
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider">Payment Protocol Method</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                id="select-card-payment"
                onClick={() => setPaymentMethod('card')}
                className={`flex items-center justify-center space-x-2.5 p-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="h-4 w-4 text-indigo-600" />
                <span>Credit / Debit Card</span>
              </button>

              <button
                type="button"
                id="select-upi-payment"
                onClick={() => setPaymentMethod('upi')}
                className={`flex items-center justify-center space-x-2.5 p-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                  paymentMethod === 'upi'
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="h-4 w-4 text-indigo-600" />
                <span>UPI Pay (GPay/PhonePe)</span>
              </button>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Secure Card Payment Forms */}
          {paymentMethod === 'card' ? (
            <div className="space-y-4 animate-fadeIn" id="card-payment-form">
              <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider">Gateway Card Credentials</h3>
              
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Card Number</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="4111 2222 3333 4444"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    className={`w-full pl-10 pr-3.5 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono ${
                      errors.cardNum ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200'
                    }`}
                  />
                  <CreditCard className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                </div>
                {errors.cardNum && <span className="text-[10px] text-rose-500 mt-1 block">{errors.cardNum}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Cardholder Name</label>
                <input
                  type="text"
                  placeholder="As printed on card"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  className={`w-full px-3.5 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm uppercase font-semibold text-slate-700 ${
                    errors.cardHolder ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200'
                  }`}
                />
                {errors.cardHolder && <span className="text-[10px] text-rose-500 mt-1 block">{errors.cardHolder}</span>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Expiration (MM/YY)</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={handleExpiryChange}
                    className={`w-full px-3.5 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono text-center ${
                      errors.expiry ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200'
                    }`}
                  />
                  {errors.expiry && <span className="text-[10px] text-rose-500 mt-1 block">{errors.expiry}</span>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">CVC / CVV</label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="•••"
                    value={cardCvc}
                    onChange={handleCvcChange}
                    className={`w-full px-3.5 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono text-center ${
                      errors.cvc ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200'
                    }`}
                  />
                  {errors.cvc && <span className="text-[10px] text-rose-500 mt-1 block">{errors.cvc}</span>}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-fadeIn" id="upi-payment-form">
              <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider">Secure UPI Credentials</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                
                {/* Instant QR Payload Scanner */}
                <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200/50 relative overflow-hidden">
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase mb-2 tracking-wider text-center">Scan QR Code to Pay</span>
                  <div className="bg-white p-3.5 rounded-xl shadow-xs border border-slate-200 relative aspect-square">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
                        `upi://pay?pa=docai@okaxis&pn=DocAI&am=${doctor.fee}&cu=INR&tn=DocAI%2520Consultation%2520Fee`
                      )}`}
                      alt="NPCI UPI QR Payload" 
                      referrerPolicy="no-referrer"
                      className="w-28 h-28 select-none"
                    />
                    <div className="absolute inset-0 bg-transparent flex items-center justify-center overflow-hidden rounded-xl pointer-events-none">
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-indigo-500 opacity-80 shadow-md animate-[bounce_2s_infinite]" />
                    </div>
                  </div>
                  <div className="text-center mt-2.5">
                    <p className="text-xs font-bold text-slate-700">₹{doctor.fee}.00</p>
                    <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest block mt-0.5">BHIM • GPay • PhonePe</span>
                  </div>
                </div>

                {/* VPA Account manual typing details */}
                <div className="md:col-span-7 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">UPI ID / VPA Address</label>
                    <input
                      type="text"
                      placeholder="e.g. janesmith@okhdfcbank"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className={`w-full px-3.5 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono ${
                        errors.upiId ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200'
                      }`}
                    />
                    {errors.upiId && <span className="text-[10px] text-rose-500 mt-1 block">{errors.upiId}</span>}
                  </div>

                  {/* VPA Handles Shortcuts selector */}
                  <div>
                    <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase block mb-1.5">Quick Handles Prefix</span>
                    <div className="flex flex-wrap gap-1.5">
                      {['@okaxis', '@okhdfcbank', '@okicici', '@paytm', '@ybl'].map((handle) => {
                        const baseName = upiId.split('@')[0] || '';
                        return (
                          <button
                            key={handle}
                            type="button"
                            onClick={() => setUpiId(`${baseName}${handle}`)}
                            className="px-2 py-1 text-[11px] bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 font-mono rounded border border-slate-200 hover:border-indigo-200 cursor-pointer transition-all active:scale-95 text-slate-600"
                          >
                            {handle}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 flex items-start space-x-2">
                    <Info className="h-4 w-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                    <span className="text-[10px] text-slate-500 leading-normal">
                      Authorize the request instantly in your UPI app once you submit, or scan the system-generated QR code directly.
                    </span>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* Right Side: Visualizing checkout and Doctor summary card */}
        <div className="lg:col-span-5 space-y-6">
          <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider">Checkout Summary</h3>

          {/* Luxury Card Graphic Representation (Dynamic to Method) */}
          {paymentMethod === 'card' ? (
            <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-5 rounded-2xl shadow-xl text-white font-mono flex flex-col justify-between h-48 relative overflow-hidden select-none border border-slate-700/50 animate-fadeIn" id="card-graphic">
              <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                <span className="text-9xl font-bold">DocAI</span>
              </div>

              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest block">DocAI VIP Gold</span>
                  <span className="text-[9px] text-slate-400 block">SECURE INTERNET TRANSAX</span>
                </div>
                <ShieldCheck className="h-6 w-6 text-indigo-400" />
              </div>

              <div className="text-lg tracking-widest text-slate-200">
                {cardNumber || "•••• •••• •••• ••••"}
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[8px] text-slate-500 uppercase block">Cardholder</span>
                  <span className="text-xs truncate max-w-[150px] font-semibold text-slate-300 block">
                    {cardHolder.toUpperCase() || "NAME SURNAME"}
                  </span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-500 uppercase block">Expires</span>
                  <span className="text-xs font-semibold text-slate-300 block">{cardExpiry || "MM/YY"}</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-500 uppercase block">CVC</span>
                  <span className="text-xs font-semibold text-slate-300 block">{(cardCvc ? "•••" : "•••")}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-900 p-5 rounded-2xl shadow-xl text-white font-mono flex flex-col justify-between h-48 relative overflow-hidden select-none border border-emerald-500/20 animate-fadeIn" id="upi-graphic">
              <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                <span className="text-9xl font-bold">UPI</span>
              </div>

              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest block">DocAI UPI Instant Link</span>
                  <span className="text-[9px] text-slate-400 block">NPCI SECURE ENVELOPE</span>
                </div>
                <Smartphone className="h-6 w-6 text-emerald-400" />
              </div>

              <div className="space-y-1">
                <span className="text-[8px] text-slate-400 uppercase block">Virtual Payment Address</span>
                <div className="text-xs tracking-wider text-emerald-300 truncate max-w-full font-semibold">
                  {upiId || "awaiting-vpa@upi"}
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[8px] text-emerald-400 uppercase font-bold block">Auth Status</span>
                  <span className="text-[10px] font-semibold text-slate-300 flex items-center space-x-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                    <span>Awaiting Auth</span>
                  </span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-500 uppercase block">Currency</span>
                  <span className="text-xs font-semibold text-slate-350 block">INR (₹)</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-500 uppercase block">Processing</span>
                  <span className="text-[10px] font-semibold text-emerald-350 block">Instant Node</span>
                </div>
              </div>
            </div>
          )}

          {/* Selected session summary */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
            <div className="flex items-start space-x-3">
              <img 
                src={doctor.avatar} 
                alt={doctor.name} 
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-xs"
              />
              <div className="space-y-0.5">
                <span className="bg-slate-200 text-slate-700 font-mono text-[9px] font-extrabold tracking-wider px-2 py-0.5 rounded-full uppercase">
                  {doctor.specialty} Specialist
                </span>
                <h4 className="font-display font-bold text-slate-800 text-sm leading-tight">{doctor.name}</h4>
                <p className="text-slate-400 text-xs">{doctor.qualification}</p>
              </div>
            </div>

            <hr className="border-slate-200/50" />

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Appointment Time</span>
                <span className="font-semibold text-slate-700 font-mono">{timeSlot} on {date}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Diagnostic Routing</span>
                <span className="font-semibold text-slate-700 text-right">AI Automatic Checked</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Tax Fee / System Surcharge</span>
                <span className="font-semibold text-slate-700">₹0.00</span>
              </div>
            </div>

            <hr className="border-slate-200" />

            <div className="flex justify-between items-baseline">
              <span className="font-display font-bold text-slate-800 text-base">Total Consultation Fee</span>
              <span className="text-3xl font-display font-bold text-indigo-600 tracking-tight">
                ₹{doctor.fee}
              </span>
            </div>
          </div>

          {/* Secure lock alert */}
          <div className="flex items-start space-x-3 bg-indigo-50 rounded-xl p-3 border border-indigo-100 text-slate-600 text-xs leading-relaxed">
            <ShieldCheck className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div>
              Your details and payment credentials are processed securely on isolated loops. DocAI never saves credentials onto local text sheets. PCI-DSS & UPI 2.0 Compliant.
            </div>
          </div>

          {/* Refund policy alert */}
          <div className="flex items-start space-x-3 bg-teal-50 rounded-xl p-3 border border-teal-100 text-slate-600 text-xs leading-relaxed">
            <RefreshCcw className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-teal-800 tracking-tight">Flexible Refunds:</span> You will receive an <span className="font-bold text-teal-700">85% refund</span> of your payment if you cancel the booking within <span className="font-bold text-teal-700">24 hours</span>. Fast automated processing.
            </div>
          </div>

          {/* Confirmation buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 border border-slate-200 text-sm font-semibold rounded-xl text-center cursor-pointer transition-all active:scale-95"
            >
              Cancel Form
            </button>
            <button
              type="submit"
              className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-indigo-100 text-sm font-semibold rounded-xl text-center cursor-pointer transition-all active:scale-95 flex items-center justify-center space-x-2"
            >
              {paymentMethod === 'card' ? <CreditCard className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
              <span>{paymentMethod === 'card' ? `Authorize ₹${doctor.fee}` : `UPI Pay ₹${doctor.fee}`}</span>
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
