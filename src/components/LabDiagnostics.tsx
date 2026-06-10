import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, TestTube, FileText, BrainCircuit, 
  Activity, Clock, Search, ChevronRight, AlertCircle, CheckCircle2,
  FileCheck, FileUp, Microscope
} from 'lucide-react';

interface LabDiagnosticsProps {
  onGoBack: () => void;
}

type TabType = 'booking' | 'reports' | 'checker' | 'history';

export default function LabDiagnostics({ onGoBack }: LabDiagnosticsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('booking');
  
  // 1. Booking State
  const availableTests = [
    { id: 1, name: 'Complete Blood Count (CBC)', category: 'Blood', price: 450, time: '24 hrs' },
    { id: 2, name: 'Lipid Profile', category: 'Blood', price: 600, time: '24 hrs' },
    { id: 3, name: 'Thyroid Panel (T3, T4, TSH)', category: 'Hormone', price: 800, time: '24 hrs' },
    { id: 4, name: 'Electrocardiogram (ECG)', category: 'Heart', price: 500, time: 'Instant' },
    { id: 5, name: 'MRI Brain', category: 'Imaging', price: 8500, time: '48 hrs' },
    { id: 6, name: 'HbA1c (Diabetes)', category: 'Blood', price: 400, time: '24 hrs' },
  ];
  const [searchTest, setSearchTest] = useState('');
  const filteredTests = availableTests.filter(t => t.name.toLowerCase().includes(searchTest.toLowerCase()) || t.category.toLowerCase().includes(searchTest.toLowerCase()));

  // 2. Reports State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setAiAnalysisResult(null);
    }
  };

  const analyzeReport = () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    // Mock AI Analysis delay
    setTimeout(() => {
      setIsAnalyzing(false);
      setAiAnalysisResult("AI Analysis Complete: The patient's lipid profile indicates mildly elevated LDL cholesterol (140 mg/dL) and normal HDL cholesterol. Fasting blood sugar is within normal limits. Recommendation: Dietary adjustments to reduce saturated fats and an increase in cardiovascular exercise are advised. Please consult your physician for clinical correlation.");
    }, 2500);
  };

  // 3. Normal Range Checker State
  const [checkerBiomarker, setCheckerBiomarker] = useState('Hemoglobin');
  const [checkerValue, setCheckerValue] = useState<number | ''>('');
  const [checkerResult, setCheckerResult] = useState<'Normal' | 'Abnormal' | null>(null);

  const checkNormalRange = () => {
    if (checkerValue === '') return;
    const val = Number(checkerValue);
    let isNormal = true;
    if (checkerBiomarker === 'Hemoglobin') {
      isNormal = val >= 12 && val <= 17.5;
    } else if (checkerBiomarker === 'Fasting Blood Sugar') {
      isNormal = val >= 70 && val <= 100;
    } else if (checkerBiomarker === 'LDL Cholesterol') {
      isNormal = val < 100;
    }
    setCheckerResult(isNormal ? 'Normal' : 'Abnormal');
  };

  // 4. History State
  const historyTimeline = [
    { id: 'T-102', date: 'March 15, 2026', test: 'Lipid Profile', status: 'Completed', result: 'View Report' },
    { id: 'T-098', date: 'January 10, 2026', test: 'Complete Blood Count', status: 'Completed', result: 'View Report' },
    { id: 'T-045', date: 'November 22, 2025', test: 'Thyroid Panel', status: 'Completed', result: 'View Report' },
  ];

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6 animate-slide-right" id="lab-diagnostics-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3.5">
          <button 
            onClick={onGoBack}
            className="p-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl transition-all shadow-xs active:scale-90 cursor-pointer flex items-center justify-center group"
          >
            <ArrowLeft className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-sky-100 text-sky-800 text-[10px] font-bold font-mono tracking-wider px-2 py-0.5 rounded uppercase">
                Diagnostics Center
              </span>
            </div>
            <h1 className="text-3xl font-display font-black text-slate-900 tracking-tight mt-0.5">
              Lab & Diagnostics
            </h1>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-none">
        <button 
          onClick={() => setActiveTab('booking')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === 'booking' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          <Microscope className="h-4 w-4" />
          <span>Test Booking</span>
        </button>
        <button 
          onClick={() => setActiveTab('reports')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === 'reports' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          <BrainCircuit className="h-4 w-4" />
          <span>AI Analyzer</span>
        </button>
        <button 
          onClick={() => setActiveTab('checker')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === 'checker' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          <Activity className="h-4 w-4" />
          <span>Range Checker</span>
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          <Clock className="h-4 w-4" />
          <span>History Timeline</span>
        </button>
      </div>

      <div className="bg-white/80 backdrop-blur-xs border border-slate-200 rounded-2xl shadow-xs min-h-[400px]">
        
        {/* 1. Booking */}
        {activeTab === 'booking' && (
          <div className="p-6 space-y-6 animate-fade-in text-left">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search for blood tests, ECG, MRI..." 
                value={searchTest}
                onChange={(e) => setSearchTest(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {filteredTests.map(test => (
                <div key={test.id} className="p-4 border border-slate-100 bg-white rounded-xl hover:shadow-md transition-shadow flex justify-between items-center group">
                  <div>
                    <h3 className="font-bold text-slate-900">{test.name}</h3>
                    <div className="flex items-center space-x-2 mt-1.5 text-xs text-slate-500 font-semibold">
                      <span className="bg-slate-100 px-2 py-0.5 rounded">{test.category}</span>
                      <span>•</span>
                      <span>Result in {test.time}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block font-bold text-slate-800">₹{test.price}</span>
                    <button className="text-xs bg-indigo-50 text-indigo-600 font-bold px-3 py-1.5 rounded-lg mt-2 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      Book Test
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. AI Analyzer */}
        {activeTab === 'reports' && (
          <div className="p-6 space-y-6 animate-fade-in text-left">
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 space-y-4">
              <h3 className="font-bold text-indigo-900 flex items-center space-x-2">
                <BrainCircuit className="h-5 w-5" />
                <span>DocAI Report Analyzer</span>
              </h3>
              <p className="text-sm text-indigo-800/80 leading-relaxed">
                Upload your lab report PDF. Our advanced AI will read the complex medical jargon and explain your results in simple, understandable language.
              </p>
              
              <div className="pt-2">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept=".pdf,.jpg,.png" 
                  className="hidden" 
                  onChange={handleFileUpload} 
                />
                
                {!selectedFile ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-indigo-200 bg-white/50 rounded-xl p-8 text-center cursor-pointer hover:bg-white transition-colors"
                  >
                    <FileUp className="h-8 w-8 text-indigo-400 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-700">Click to upload lab report</p>
                    <p className="text-xs text-slate-500 mt-1">Supports PDF, JPG, PNG up to 10MB</p>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{selectedFile.name}</p>
                        <p className="text-xs text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedFile(null)}
                      className="text-xs text-rose-500 font-bold hover:bg-rose-50 px-2 py-1 rounded"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {selectedFile && !aiAnalysisResult && (
                <button 
                  onClick={analyzeReport}
                  disabled={isAnalyzing}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center space-x-2 mt-4"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Analyzing Report...</span>
                    </>
                  ) : (
                    <>
                      <BrainCircuit className="h-4 w-4" />
                      <span>Analyze with AI</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {aiAnalysisResult && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 space-y-3 animate-slide-down">
                <h4 className="font-bold text-emerald-900 flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>AI Summary</span>
                </h4>
                <p className="text-sm text-emerald-800 leading-relaxed font-medium">
                  {aiAnalysisResult}
                </p>
              </div>
            )}
          </div>
        )}

        {/* 3. Range Checker */}
        {activeTab === 'checker' && (
          <div className="p-6 md:p-10 space-y-6 animate-fade-in text-center max-w-xl mx-auto">
            <div className="space-y-2 mb-6">
              <h2 className="text-2xl font-black font-display text-slate-900">Normal Range Checker</h2>
              <p className="text-slate-600 text-sm">Enter your blood test values to quickly see if they fall within healthy clinical ranges.</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Biomarker</label>
                <select 
                  value={checkerBiomarker}
                  onChange={(e) => { setCheckerBiomarker(e.target.value); setCheckerResult(null); }}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 font-semibold text-slate-800"
                >
                  <option>Hemoglobin</option>
                  <option>Fasting Blood Sugar</option>
                  <option>LDL Cholesterol</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Observed Value</label>
                <div className="flex space-x-2">
                  <input 
                    type="number" 
                    value={checkerValue}
                    onChange={(e) => { setCheckerValue(e.target.value ? Number(e.target.value) : ''); setCheckerResult(null); }}
                    className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-400 text-slate-900"
                    placeholder="e.g. 14"
                  />
                  <button 
                    onClick={checkNormalRange}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl transition-colors shadow-sm"
                  >
                    Check
                  </button>
                </div>
              </div>

              {checkerResult && (
                <div className={`mt-4 p-4 rounded-xl border flex items-center space-x-3 ${checkerResult === 'Normal' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                  {checkerResult === 'Normal' ? <CheckCircle2 className="h-6 w-6 text-emerald-500" /> : <AlertCircle className="h-6 w-6 text-rose-500" />}
                  <div>
                    <h4 className={`font-bold ${checkerResult === 'Normal' ? 'text-emerald-900' : 'text-rose-900'}`}>
                      {checkerResult === 'Normal' ? 'Normal Clinical Range' : 'Abnormal Reading Out of Range'}
                    </h4>
                    <p className={`text-xs ${checkerResult === 'Normal' ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {checkerBiomarker === 'Hemoglobin' && 'Healthy range: 12.0 - 17.5 g/dL'}
                      {checkerBiomarker === 'Fasting Blood Sugar' && 'Healthy range: 70 - 100 mg/dL'}
                      {checkerBiomarker === 'LDL Cholesterol' && 'Healthy range: < 100 mg/dL'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. History Timeline */}
        {activeTab === 'history' && (
          <div className="p-6 space-y-6 animate-fade-in text-left">
            <h3 className="font-bold text-slate-800 mb-4 px-2">Clinical Test History</h3>
            <div className="space-y-0 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              {historyTimeline.map((item, index) => (
                <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active py-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 group-[.is-active]:bg-indigo-50 text-slate-500 group-[.is-active]:text-indigo-600 shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <TestTube className="h-4 w-4" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-100 bg-white shadow-xs hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-slate-900">{item.test}</div>
                      <div className="text-[10px] bg-slate-50 text-slate-500 font-mono tracking-wider px-2 py-0.5 rounded">{item.id}</div>
                    </div>
                    <div className="text-xs text-slate-500 mb-3">{item.date}</div>
                    <div className="flex justify-between items-center border-t border-slate-50 pt-3">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center space-x-1"><CheckCircle2 className="h-3 w-3" /> <span>{item.status}</span></span>
                      <button className="text-xs text-indigo-600 font-bold hover:text-indigo-800 transition-colors flex items-center space-x-1"><span>{item.result}</span> <ChevronRight className="h-3 w-3" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
