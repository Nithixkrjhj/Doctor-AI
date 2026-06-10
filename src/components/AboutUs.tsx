import React from 'react';
import { 
  ArrowLeft, Code2, Users, Layers, Award, Terminal, Heart, 
  Github, Cpu, Sparkles, Server, Layout, CheckCircle2 
} from 'lucide-react';

interface AboutUsProps {
  onGoBack: () => void;
}

export default function AboutUs({ onGoBack }: AboutUsProps) {
  const creators = [
    {
      name: "Nitheesh Krishna P R",
      role: "Lead Full-Stack Architect",
      initials: "NK",
      contribution: "Designed and implemented the core React routing flow, the server-side integration structure, environment variables handling, the voice/text diagnostic symptom analyser, and overall application telemetry system.",
      highlights: ["API Proxy Design", "Interactive Flow Integration", "Routing States Infrastructure"],
      color: "from-indigo-500 to-sky-500"
    },
    {
      name: "Bagath Krishna P R",
      role: "Lead UI/UX & Creative Stylist",
      initials: "BK",
      contribution: "Created the premium responsive glass theme and hospital branding assets, cardiogram SVG elements, responsive bento grids, and the custom micro-animations (the back button sliding transitions and visual effects).",
      highlights: ["Glassmorphic Architecture", "Interactive SVG Cardiograms", "Page Transition Loops"],
      color: "from-teal-500 to-emerald-500"
    },
    {
      name: "Alan C Biju",
      role: "Clinical Data & Auth Systems Engineer",
      initials: "AB",
      contribution: "Constructed the local in-memory/localStorage record ledger, payment gateway sandbox workflows, user login session validators, and simulated clinical ticket generation modules.",
      highlights: ["Payment Simulation", "Local Storage Ledger", "Clinic DB Mock Schema"],
      color: "from-rose-500 to-amber-500"
    }
  ];

  const technologies = [
    {
      category: "Frontend Core",
      items: ["React (TSX) v18", "TypeScript", "Vite JS Builder"],
      icon: <Layout className="h-5 w-5 text-indigo-500" />,
      description: "Fast-loading, declarative client-side web application container."
    },
    {
      category: "Styling & Motion",
      items: ["Tailwind CSS", "Lucide Icons", "Cubic-Bezier Classes"],
      icon: <Layers className="h-5 w-5 text-teal-500" />,
      description: "Utility-first design and responsive fluid grids."
    },
    {
      category: "Backend Services",
      items: ["Node.js", "Express Web Framework", "Port 3000 Ingress Routing"],
      icon: <Server className="h-5 w-5 text-sky-500" />,
      description: "Server-side REST endpoints proxying requests securely."
    },
    {
      category: "AI Integration",
      items: ["Google Gemini API", "@google/genai SDK", "Acoustic Symptom Dispatcher"],
      icon: <Cpu className="h-5 w-5 text-purple-500" />,
      description: "Server-side natural language medical triage and department mapping."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8 animate-slide-down" id="about-us-page">
      
      {/* Page Header Layout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-indigo-100">
        <div className="flex items-center space-x-3.5">
          <button 
            onClick={onGoBack}
            className="p-2 bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl transition-all shadow-xs active:scale-90 cursor-pointer flex items-center justify-center group"
            id="back-to-home-from-about"
            title="Go Back"
          >
            <ArrowLeft className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1 group-active:scale-90" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold font-mono tracking-wider px-2 py-0.5 rounded uppercase">
                System Creators & Stack
              </span>
            </div>
            <h1 className="text-3xl font-display font-black text-slate-900 tracking-tight mt-0.5">
              About DocAI Developers
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl">
            Version 1.4.2 [STABLE]
          </span>
        </div>
      </div>

      {/* Intro Mission Statement */}
      <div className="bg-white/80 backdrop-blur-xs border border-slate-200/65 rounded-3xl p-6 md:p-8 shadow-xs text-left space-y-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900 font-display">Our Mission & Concept</h2>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
          DocAI is designed to bridge the gap between patient symptoms and appropriate clinical departments using the power of natural language understanding and instant audio triaging. Built inside a full-stack Node.js environment, the application simulates modern healthcare scheduling systems with absolute precision, offline capability, and high-quality design aesthetics.
        </p>
      </div>

      {/* Creators Grid section */}
      <div className="space-y-4 text-left">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900 font-display uppercase tracking-wider">Project Team Contribution</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {creators.map((member, index) => (
            <div 
              key={index}
              className="bg-white hover:border-slate-300 border border-slate-200/70 rounded-3xl p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden"
              id={`creator-card-${member.name.replace(/\s+/g, '-').toLowerCase()}`}
            >
              {/* Header with Circle Initials */}
              <div className="space-y-3.5">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${member.color} text-white flex items-center justify-center font-black font-display text-lg shadow-sm`}>
                  {member.initials}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-950 tracking-tight font-display pr-2">
                    {member.name}
                  </h3>
                  <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-md inline-block mt-1">
                    {member.role}
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed pt-2 border-t border-slate-100">
                  {member.contribution}
                </p>
              </div>

              {/* Highlights pills */}
              <div className="pt-4 mt-4 border-t border-slate-100/80 space-y-1.5 mt-auto">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Core Contribution Tasks</span>
                <div className="flex flex-wrap gap-1">
                  {member.highlights.map((item, keyIdx) => (
                    <span 
                      key={keyIdx}
                      className="bg-slate-50 border border-slate-100 text-[10px] text-slate-600 px-2 py-0.5 rounded font-mono"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Program and Languages Stack section */}
      <div className="space-y-4 text-left">
        <div className="flex items-center space-x-2">
          <Terminal className="h-5 w-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900 font-display uppercase tracking-wider">Software Stack & Languages Used</h2>
        </div>

        <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 md:p-8 border border-slate-800 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {technologies.map((tech, idx) => (
              <div key={idx} className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="p-1.5 bg-slate-900 rounded-lg">{tech.icon}</span>
                    <h3 className="text-xs font-bold font-display text-white">{tech.category}</h3>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">{tech.description}</p>
                </div>

                <div className="space-y-1 pt-2 border-t border-slate-800">
                  {tech.items.map((item, keyIdx) => (
                    <div key={keyIdx} className="flex items-center space-x-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-teal-500 flex-shrink-0" />
                      <span className="text-[10.5px] font-mono text-slate-300 font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3 text-left">
              <Code2 className="h-7 w-7 text-indigo-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">Full-Stack Bundling and Packaging Pipeline</p>
                <p className="text-[11px] text-indigo-250">
                  Compiled perfectly via Vite & esbuild into modern CommonJS modules. Served securely on Port 3000 over custom sandboxed environments.
                </p>
              </div>
            </div>
            <div className="flex space-x-2 flex-shrink-0">
              <span className="px-2.5 py-1 bg-slate-900 border border-slate-750 text-indigo-400 font-mono text-[10px] rounded-md font-bold">Node.js 20+</span>
              <span className="px-2.5 py-1 bg-slate-900 border border-slate-750 text-indigo-400 font-mono text-[10px] rounded-md font-bold">ES6/TS</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center space-x-2 py-4 text-slate-400 text-xs">
        <Heart className="h-4 w-4 text-indigo-600 fill-indigo-500 animate-pulse" />
        <span className="font-semibold text-slate-500">Formulated with care and absolute digital stewardship in 2026.</span>
      </div>

    </div>
  );
}
