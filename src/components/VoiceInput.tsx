import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Sparkles, AlertCircle, HelpCircle, FileText, Send } from 'lucide-react';
import { SymptomAnalysis } from '../types';

interface VoiceInputProps {
  onAnalysisComplete: (analysis: SymptomAnalysis, rawText: string) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
}

const SAMPLE_SUGGESTIONS = [
  {
    title: "Cardiology",
    text: "I am experiencing heavy chest pain, a fast heartbeat, and short breath that gets worse with stairs.",
    icon: "❤️"
  },
  {
    title: "Dermatology",
    text: "I have a dry, itchy red skin rash spreading on my elbows and back of my head.",
    icon: "🔬"
  },
  {
    title: "Pediatrics",
    text: "My 3-year-old toddler has a 102°F fever, loss of appetite, and is coughing since yesterday morning.",
    icon: "👶"
  },
  {
    title: "Neurology",
    text: "I have an intense throbbing headache behind my left eye, accompanied by mild dizziness and nausea.",
    icon: "🧠"
  },
  {
    title: "Orthopedics",
    text: "I twisted my ankle during sports yesterday, it is swollen, bruised, and hurts severely when putting weight on it.",
    icon: "🦴"
  }
];

export default function VoiceInput({ onAnalysisComplete, isLoading, setIsLoading }: VoiceInputProps) {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const isRecordingRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Web Audio Visualizer
  const startAudioVisualizer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      
      source.connect(analyser);
      analyser.fftSize = 256;
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      drawVisual();
    } catch (err) {
      console.warn("Could not capture audio stream for visualization: ", err);
    }
  };

  const drawVisual = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const width = canvas.width;
    const height = canvas.height;
    
    const draw = () => {
      if (!isRecordingRef.current) return;
      animationFrameRef.current = requestAnimationFrame(draw);
      
      analyser.getByteFrequencyData(dataArray);
      
      ctx.fillStyle = '#0f172a'; // Smooth dark background matching Slate 900
      ctx.fillRect(0, 0, width, height);
      
      const barWidth = (width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 1.5;
        
        // Gradient color for medical waveform pulse (Indigo to Violet/Blue)
        const percent = i / bufferLength;
        const red = Math.floor(79 + percent * 45);   // Indigo start
        const green = Math.floor(70 + percent * 20);
        const blue = Math.floor(229 + percent * 20);
        
        ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
        ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
        
        x += barWidth;
      }
    };
    
    draw();
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    setError(null);
    try {
      const apiKey = import.meta.env.VITE_ASSEMBLYAI_API_KEY;
      if (!apiKey) {
        throw new Error("AssemblyAI API key not found. Please add VITE_ASSEMBLYAI_API_KEY to the Settings menu.");
      }

      // 1. Upload audio
      const uploadRes = await fetch("https://api.assemblyai.com/v2/upload", {
        method: "POST",
        headers: { "Authorization": apiKey },
        body: audioBlob
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || "Failed to upload audio to AssemblyAI");
      
      const uploadUrl = uploadData.upload_url;

      // 2. Submit transcript job
      const transcriptRes = await fetch("https://api.assemblyai.com/v2/transcript", {
        method: "POST",
        headers: { 
          "Authorization": apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ audio_url: uploadUrl })
      });
      const transcriptData = await transcriptRes.json();
      if (!transcriptRes.ok) throw new Error(transcriptData.error || "Failed to start transcription job");
      
      const transcriptId = transcriptData.id;

      // 3. Poll for completion
      let status = "processing";
      while (status !== "completed" && status !== "error") {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const pollRes = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
          method: "GET",
          headers: { "Authorization": apiKey }
        });
        const pollData = await pollRes.json();
        status = pollData.status;
        
        if (status === "completed") {
          setText((prev) => prev + (prev ? ' ' : '') + pollData.text);
        } else if (status === "error") {
          throw new Error(pollData.error || "Transcription processing failed at AssemblyAI");
        }
      }
    } catch (err: any) {
      console.error("Transcription error:", err);
      setError(`Voice input error: ${err.message}. Please type manually.`);
    } finally {
      setIsTranscribing(false);
    }
  };

  const startRecording = async () => {
    setError(null);
    setIsRecording(true);
    isRecordingRef.current = true;
    setText('');
    
    await startAudioVisualizer();
    
    if (streamRef.current) {
      try {
        const mediaRecorder = new MediaRecorder(streamRef.current);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          transcribeAudio(audioBlob);
        };

        mediaRecorder.start();
      } catch (err) {
        console.error("Failed to start MediaRecorder:", err);
        setError("Microphone access failed. Please type manually!");
        stopRecording();
      }
    } else {
      setError("Microphone access failed. Please type manually!");
      stopRecording();
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    isRecordingRef.current = false;
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {}
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError("Please describe or record your symptoms first.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });

      const data = await res.json();
      
      if (res.ok) {
        onAnalysisComplete(data, text);
      } else {
        if (data.fallback) {
          // If server failed but returned safe fallback, use it
          onAnalysisComplete(data.fallback, text);
        } else {
          setError(data.error || "System timed out trying to parse symptoms. Please try again.");
        }
      }
    } catch (err) {
      console.error(err);
      setError("Connection to DocAI core system failed. Please ensure the server is fully running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-6 max-w-3xl mx-auto" id="voice-symptom-card">
      <div className="flex items-center space-x-2 text-indigo-600 font-medium mb-3">
        <Sparkles className="h-5 w-5 animate-pulse" />
        <span className="font-display tracking-tight text-sm uppercase">AI Virtual Dispatcher</span>
      </div>
      
      <h2 className="text-2xl font-display font-semibold text-slate-800 mb-2">
        How are you feeling today?
      </h2>
      
      <p className="text-slate-500 text-sm mb-6 leading-relaxed">
        Speak clearly into your microphone or describe your symptoms below. Our advanced medical AI model will extract key symptoms and match you with the exact category specialist instantly.
      </p>

      {/* Voice Recording Panel */}
      <div className="bg-slate-950/85 backdrop-blur-md rounded-xl p-6 mb-6 border border-white/5 relative overflow-hidden flex flex-col items-center">
        {isRecording ? (
          <canvas 
            ref={canvasRef} 
            width={350} 
            height={60} 
            className="w-full max-w-sm h-16 bg-slate-900/50 rounded mb-4"
          />
        ) : (
          <div className="h-16 flex items-center justify-center space-x-1.5 mb-4">
            <span className="text-slate-400 text-sm font-mono flex items-center">
              <FileText className="h-4 w-4 mr-2 text-indigo-450" />
              SYSTEM IDLE • READY FOR CAPTURE
            </span>
          </div>
        )}

        <button
          onClick={handleMicClick}
          id="btn-voice-record"
          className={`relative p-5 rounded-full shadow-lg transition-all duration-300 transform active:scale-95 ${
            isRecording 
              ? 'bg-rose-500 hover:bg-rose-600 text-white ring-4 ring-rose-100' 
              : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-indigo-100 ring-4 ring-indigo-50/20'
          }`}
        >
          {isRecording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </button>

        <span className="text-xs font-mono tracking-wider text-slate-400 uppercase mt-3">
          {isTranscribing 
            ? "Transcribing your voice..." 
            : isRecording 
              ? "Recording... Tap again to Stop" 
              : "Tap symbol to Record"}
        </span>
      </div>

      {/* Symptoms text area input */}
      <div className="mb-6">
        <label className="block text-xs font-mono text-slate-500 uppercase mb-2">
          Symptoms Description
        </label>
        <textarea
          id="symptoms-input-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. My throat is burning since yesterday and I am feeling shivering chills with a mild dry cough..."
          className="w-full h-32 px-4 py-3 glass-input rounded-xl focus:outline-none text-slate-700 placeholder:text-slate-400 text-sm resize-none transition-all"
        />
      </div>

      {/* Suggestions preset quick-picks */}
      <div className="mb-6">
        <span className="text-xs font-mono text-slate-400 uppercase flex items-center mb-3">
          <HelpCircle className="h-3.5 w-3.5 mr-1 text-slate-400" />
          Test cases (Simulate client input)
        </span>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_SUGGESTIONS.map((preset, index) => (
            <button
              key={index}
              onClick={() => { setText(preset.text); setError(null); }}
              className="px-3 py-1.5 bg-white/40 hover:bg-indigo-50/70 hover:text-indigo-700 border border-slate-200/50 hover:border-indigo-200 rounded-full text-xs text-slate-600 font-medium backdrop-blur-xs transition-all duration-200 flex items-center space-x-1"
            >
              <span>{preset.icon}</span>
              <span>{preset.title} Preset</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-xl text-sm mb-6" id="error-alert">
          <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Primary diagnostic buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <button
          onClick={() => { setText(''); setError(null); }}
          className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 font-medium hover:bg-slate-50 rounded-lg transition-all"
        >
          Clear Input
        </button>
        
        <button
          onClick={handleAnalyze}
          id="btn-analyze-symptoms"
          disabled={isLoading || !text.trim()}
          className="px-6 py-2.5 bg-slate-900 disabled:bg-slate-200 hover:bg-slate-800 text-white font-medium rounded-xl shadow-md flex items-center space-x-2 transition-all disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Analyzing Symptoms...</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>Submit for AI Dispatch</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
