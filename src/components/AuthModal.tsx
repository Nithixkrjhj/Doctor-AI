import React, { useState } from 'react';
import { X, Mail, Key, User, Phone, Sparkles, ShieldCheck, Heart } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: { id: string; name: string; email: string; phone: string }) => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const payload = isSignUp 
      ? { name, email, phone, password }
      : { email, password };

    const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        onAuthSuccess(data);
        onClose();
        // Clear forms
        setName('');
        setEmail('');
        setPhone('');
        setPassword('');
      } else {
        setError(data.error || 'Authentication failed. Please verify your details.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failed. Please check your network.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = () => {
    setEmail('nitheeshkrishnapr123@gmail.com');
    setPassword('password123');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" id="auth-modal-overlay">
      <div 
        className="glass-panel rounded-2xl w-full max-w-md overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.1)] flex flex-col"
        id="auth-modal-window"
      >
        {/* Banner header containing descriptive info */}
        <div className="bg-gradient-to-r from-indigo-950/90 to-slate-950/85 p-5 text-white flex justify-between items-center backdrop-blur-md border-b border-white/10 relative">
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-widest text-indigo-400 font-bold uppercase block">Secure Verification Portal</span>
            <h2 className="text-xl font-display font-bold flex items-center space-x-2">
              <ShieldCheck className="h-5 w-5 text-indigo-400" />
              <span>{isSignUp ? 'Create Patient Profile' : 'Access Patient Portal'}</span>
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 px-1.5 bg-white/10 hover:bg-white/20 border border-white/15 hover:border-white/25 rounded-lg text-white/80 hover:text-white transition-all cursor-pointer inline-flex items-center"
            title="Dismiss Portal"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Modal content body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]" id="auth-modal-body">
          
          {/* Quick info tip */}
          <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-xl p-3 flex items-start space-x-3 text-xs leading-relaxed text-slate-600">
            <Sparkles className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-0.5" />
            <p>
              Please register or sign in to verify your identity. Accounts are fully synchronized with our clinic appointment systems.
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold px-4 py-3 rounded-xl">
              ⚠️ {error}
            </div>
          )}

          {/* Core Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Nitheesh Krishna"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 glass-input rounded-xl focus:outline-none text-xs text-slate-700 placeholder:text-slate-400 bg-slate-50/50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 glass-input rounded-xl focus:outline-none text-xs text-slate-700 placeholder:text-slate-400 bg-slate-50/50"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="e.g. nitheeshkrishnapr123@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 glass-input rounded-xl focus:outline-none text-xs text-slate-700 placeholder:text-slate-400 bg-slate-50/50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Secure Password *</label>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 glass-input rounded-xl focus:outline-none text-xs text-slate-700 placeholder:text-slate-400 bg-slate-50/50"
                />
              </div>
            </div>

            {/* Core Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md cursor-pointer text-xs transition-all active:scale-99 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <span>{isSignUp ? 'Complete Registration' : 'Secure Login'}</span>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Info Bar */}
          {!isSignUp && (
            <div className="p-3 border border-dashed border-sky-200 bg-sky-50/50 rounded-xl space-y-2 text-center">
              <p className="text-[10px] uppercase font-mono font-bold tracking-wider text-sky-700">
                💡 Developer Nitheesh Demo Account
              </p>
              <p className="text-[11px] text-slate-650 leading-relaxed font-sans">
                Quickly fill Nitheesh's credentials for instant testing!
              </p>
              <button
                type="button"
                onClick={handleQuickLogin}
                className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-[10px] font-bold font-mono rounded-lg transition-colors cursor-pointer"
              >
                Auto-fill Nitheesh Profile
              </button>
            </div>
          )}

          {/* Mode Switch Card */}
          <div className="border-t border-slate-100 pt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold transition-colors cursor-pointer"
            >
              {isSignUp 
                ? 'Already registered? Clear fields and Sign In' 
                : "New patient client? Register a new secure profile"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
