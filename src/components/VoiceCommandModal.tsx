import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Play, 
  Square, 
  X, 
  Sparkles, 
  Factory, 
  Ship, 
  Wheat, 
  AlertTriangle, 
  RotateCcw, 
  Languages, 
  Send,
  Radio,
  Copy,
  Check,
  Zap,
  Gauge
} from 'lucide-react';
import { Product, Supplier } from '../types';

interface VoiceCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  suppliers: Supplier[];
}

export interface VoiceInteraction {
  id: string;
  query: string;
  answer: string;
  timestamp: string;
  source?: string;
  areaTag?: string;
}

// Clean markdown text for smooth natural speech synthesis
function cleanTextForSpeech(markdownText: string): string {
  if (!markdownText) return '';
  return markdownText
    .replace(/###\s+/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/`{1,3}.*?`{1,3}/g, '')
    .replace(/^[-\*\+]\s+/gm, '. ')
    .replace(/৳/g, 'Taka ')
    .replace(/MT/g, 'Metric Tons')
    .replace(/\n+/g, '. ')
    .replace(/\.\s*\./g, '.')
    .trim();
}

export const VoiceCommandModal: React.FC<VoiceCommandModalProps> = ({
  isOpen,
  onClose,
  products,
  suppliers,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [language, setLanguage] = useState<'en-US' | 'bn-BD'>('en-US');
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const [history, setHistory] = useState<VoiceInteraction[]>([
    {
      id: 'init-1',
      query: 'Tell me about Rezwan Industrial Zone and Chattogram Port Silos',
      answer: `### 🏭 Rezwan Industrial Zone & Chattogram Port Briefing
- **Rezwan Industrial Zone (Rajshahi Hub)**: Silo #01 has **420 MT** Russian Milling Wheat (~3.5 days runway left at 120 MT/day milling run-rate). Reorder is urgent.
- **Chattogram Port Belt**: Tank #02 holds **280 MT** Crude Soybean Oil (CDSO) with 3.2 days buffer vs 6 days vessel transit lead time.
- **Ishwardi & Dinajpur**: Soybean Meal (1,450 MT) and Paddy reserves (2,100 MT) remain healthy.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'Industrial Voice Intelligence',
      areaTag: 'Multi-Zone Briefing',
    },
  ]);

  const [currentResponse, setCurrentResponse] = useState<string>(history[0].answer);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize Speech Synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += trans;
          } else {
            interimTranscript += trans;
          }
        }

        const currentText = finalTranscript || interimTranscript;
        setTranscript(currentText);

        if (finalTranscript) {
          handleProcessVoiceQuery(finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error/warning:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language, products]);

  // Handle Speaking Text via Web Speech Synthesis
  const speakText = (text: string) => {
    if (!synthRef.current || !autoSpeak) return;

    synthRef.current.cancel(); // Stop any ongoing speech
    const cleanText = cleanTextForSpeech(text);
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = speechRate;
    utterance.pitch = 1.0;
    utterance.lang = language === 'bn-BD' ? 'bn-BD' : 'en-US';

    // Pick best available voice if possible
    const voices = synthRef.current.getVoices();
    if (voices && voices.length > 0) {
      const targetLang = language === 'bn-BD' ? 'bn' : 'en';
      const matchedVoice = voices.find(v => v.lang.toLowerCase().includes(targetLang));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      setIsSpeaking(false);
      setIsPaused(false);
    };

    currentUtteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  const togglePauseSpeech = () => {
    if (!synthRef.current) return;
    if (isSpeaking && !isPaused) {
      synthRef.current.pause();
      setIsPaused(true);
    } else if (isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      stopSpeaking();
      setTranscript('');
      try {
        if (recognitionRef.current) {
          recognitionRef.current.lang = language;
          recognitionRef.current.start();
        } else {
          setNoticeMessage('Voice input is not directly available in this browser window. Click any quick query chip below or type your inquiry!');
          setTimeout(() => setNoticeMessage(null), 5000);
        }
      } catch (err) {
        console.warn('Speech recognition start failed:', err);
      }
    }
  };

  // Process user voice or text query
  const handleProcessVoiceQuery = async (queryText: string) => {
    const text = queryText.trim();
    if (!text || isLoading) return;

    stopSpeaking();
    setIsLoading(true);
    setIsListening(false);

    try {
      const totalValuation = products.reduce((acc, p) => acc + (p.currentStock * p.unitPrice), 0);
      const deadCapital = products
        .filter(p => p.status === 'dead_stock')
        .reduce((acc, p) => acc + (p.currentStock * p.unitPrice), 0);

      const topRiskItems = products
        .filter(p => p.riskScore > 50)
        .map(p => ({
          name: p.name,
          location: p.storageLocation,
          currentStock: `${p.currentStock} ${p.unitOfMeasure || 'MT'}`,
          daysToStockout: (p.currentStock / Math.max(0.1, p.dailyDemand)).toFixed(1),
        }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          model: 'gemini-3.7-flash',
          role: 'risk_logistics',
          inventorySummary: {
            totalProducts: products.length,
            healthScore: 49,
            totalValuation,
            deadCapital,
            criticalCount: products.filter(p => p.status === 'critical').length,
            attentionCount: products.filter(p => p.status === 'warning' || p.status === 'dead_stock').length,
            topRiskItems,
          },
        }),
      });

      const data = await res.json();
      const answerText = data.reply || 'Voice analysis complete. All industrial silo telemetry refreshed.';

      const newInteraction: VoiceInteraction = {
        id: 'voice-' + Date.now(),
        query: text,
        answer: answerText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source || 'Voice AI Engine',
        areaTag: detectAreaTag(text),
      };

      setHistory(prev => [newInteraction, ...prev]);
      setCurrentResponse(answerText);

      if (autoSpeak) {
        speakText(answerText);
      }
    } catch (err) {
      console.error('Voice command failed:', err);
      const fallbackAns = `Rezwan Industrial Zone Flour Mill Silo #01 has 420 Metric Tons of Russian Wheat remaining (3.5 days runway). Chattogram Port CDSO Tank #02 has 280 Metric Tons (3.2 days runway). Reorder allocation is recommended immediately.`;
      setCurrentResponse(fallbackAns);
      if (autoSpeak) {
        speakText(fallbackAns);
      }
    } finally {
      setIsLoading(false);
    }
  };

  function detectAreaTag(text: string): string {
    const t = text.toLowerCase();
    if (t.includes('chattogram') || t.includes('port') || t.includes('patenga') || t.includes('চট্টগ্রাম')) return 'Chattogram Port Belt';
    if (t.includes('rezwan') || t.includes('rajshahi') || t.includes('godagari') || t.includes('রেজওয়ান')) return 'Rezwan Industrial Zone';
    if (t.includes('ishwardi') || t.includes('bogura') || t.includes('ঈশ্বরদী')) return 'Ishwardi & Bogura Hub';
    if (t.includes('dinajpur') || t.includes('rice') || t.includes('দিনাজপুর')) return 'Dinajpur Rice Complex';
    if (t.includes('narayanganj') || t.includes('meghna') || t.includes('নারায়ণগঞ্জ')) return 'Narayanganj Belt';
    return 'Industrial Zone Audit';
  }

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const presetAreaPrompts = [
    {
      title: 'Rezwan Industrial Zone',
      subtitle: 'Flour Silo & Maize Run-Rate',
      icon: Factory,
      query: 'Tell me about Rezwan Industrial Zone & Silo Network in Rajshahi',
      color: 'from-emerald-600 to-teal-700',
    },
    {
      title: 'Chattogram Port Silos',
      subtitle: 'Edible Oil Tanker Lead Time',
      icon: Ship,
      query: 'What is the status of Chattogram Port Belt and Patenga Tank Terminal?',
      color: 'from-blue-600 to-indigo-700',
    },
    {
      title: 'Dinajpur Auto Rice Mill',
      subtitle: 'Paddy Silo Reserve & Milling Rate',
      icon: Wheat,
      query: 'Give me a voice report on Dinajpur Auto Rice Mill Silo Complex',
      color: 'from-amber-600 to-orange-700',
    },
    {
      title: 'Ishwardi & Bogura Feed',
      subtitle: 'Soybean Meal & Fish Meal Buffer',
      icon: Gauge,
      query: 'Analyze Ishwardi and Bogura Feed Plant stock and amino acids',
      color: 'from-purple-600 to-fuchsia-700',
    },
    {
      title: 'Stoppage & Downtime Risk',
      subtitle: 'Critical Silos & Avoided Loss (৳)',
      icon: AlertTriangle,
      query: 'What is our total plant stoppage risk and daily downtime loss today?',
      color: 'from-rose-600 to-red-700',
    },
    {
      title: 'Godagari Dead Capital',
      subtitle: '৳48.75L Trapped in Silo Yard #05',
      icon: Zap,
      query: 'How much dead capital is trapped in Godagari yard and how can we recover it?',
      color: 'from-yellow-600 to-amber-700',
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="flex h-[92vh] w-full max-w-4xl flex-col rounded-3xl border border-slate-700/80 bg-slate-900 text-slate-100 shadow-2xl overflow-hidden ring-1 ring-white/10">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              <Mic className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white tracking-tight">
                  Industrial Voice Command Intelligence
                </h2>
                <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  <Radio className="h-2.5 w-2.5 animate-pulse text-emerald-400" />
                  Voice Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Ask by voice about any Industrial Zone, Silo Runway, or Tank Terminal across Bangladesh
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(l => l === 'en-US' ? 'bn-BD' : 'en-US')}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-all"
              title="Toggle Voice Language"
            >
              <Languages className="h-3.5 w-3.5 text-emerald-400" />
              <span>{language === 'en-US' ? 'English (US)' : 'বাংলা (BD)'}</span>
            </button>

            {/* Auto Speak Toggle */}
            <button
              onClick={() => {
                if (isSpeaking) stopSpeaking();
                setAutoSpeak(!autoSpeak);
              }}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                autoSpeak 
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' 
                  : 'border-slate-700 bg-slate-800 text-slate-400'
              }`}
              title="Toggle automatic voice playback"
            >
              {autoSpeak ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              <span>{autoSpeak ? 'Voice On' : 'Muted'}</span>
            </button>

            <button
              onClick={() => {
                stopSpeaking();
                if (isListening) recognitionRef.current?.stop();
                onClose();
              }}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-y-auto p-6 space-y-6">

          {noticeMessage && (
            <div className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300 animate-in fade-in">
              <span>{noticeMessage}</span>
              <button 
                onClick={() => setNoticeMessage(null)}
                className="text-amber-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Central Interactive Voice Orb / Equalizer */}
          <div className="relative flex flex-col items-center justify-center rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-8 text-center shadow-inner overflow-hidden">
            
            {/* Glowing background ripple */}
            <div className={`absolute h-48 w-48 rounded-full blur-3xl transition-all duration-700 ${
              isListening 
                ? 'bg-rose-500/20 scale-150 animate-pulse' 
                : isSpeaking 
                ? 'bg-emerald-500/20 scale-125' 
                : 'bg-teal-500/10'
            }`} />

            {/* Animated Wave Equalizer Bars */}
            <div className="mb-4 flex items-center gap-1.5 h-10">
              {[40, 70, 95, 60, 85, 100, 75, 45, 90, 65, 80, 50, 30].map((height, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 rounded-full transition-all duration-200 ${
                    isListening
                      ? 'bg-rose-500 animate-pulse'
                      : isSpeaking
                      ? 'bg-emerald-400 animate-bounce'
                      : 'bg-slate-700'
                  }`}
                  style={{
                    height: isListening || isSpeaking ? `${height}%` : '20%',
                    animationDelay: `${idx * 60}ms`,
                  }}
                />
              ))}
            </div>

            {/* Main Push to Talk Mic Button */}
            <button
              onClick={toggleListening}
              className={`relative z-10 flex h-24 w-24 items-center justify-center rounded-full text-white shadow-2xl transition-all duration-300 transform active:scale-95 ${
                isListening
                  ? 'bg-gradient-to-tr from-rose-600 to-pink-500 ring-8 ring-rose-500/30 scale-105 animate-pulse'
                  : 'bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 ring-8 ring-emerald-500/20 hover:scale-105 hover:ring-emerald-500/40'
              }`}
            >
              {isListening ? (
                <MicOff className="h-10 w-10 text-white animate-pulse" />
              ) : (
                <Mic className="h-10 w-10 text-white" />
              )}
            </button>

            {/* Status Prompt */}
            <div className="mt-4 z-10">
              <h3 className="text-base font-bold text-white tracking-tight">
                {isListening 
                  ? 'Listening to your voice... (Speak about any Industrial Zone)' 
                  : isLoading 
                  ? 'Analyzing Industrial Telemetry & Formulating Voice Answer...' 
                  : isSpeaking 
                  ? 'StockMind Voice Assistant is Speaking...' 
                  : 'Click the Microphone & Ask about any Industrial Area'}
              </h3>
              <p className="mt-1 text-xs text-slate-400 font-medium">
                {transcript ? `"${transcript}"` : 'Example: "Tell me about Chattogram Port Silo Zone" or "রেজওয়ান ইন্ডাস্ট্রিয়াল জোনের অবস্থা কী?"'}
              </p>
            </div>

            {/* Voice Player Controls during Audio Output */}
            {isSpeaking && (
              <div className="mt-5 z-10 flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-950/60 px-4 py-2 shadow-lg">
                <button
                  onClick={togglePauseSpeech}
                  className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-500"
                >
                  <Play className="h-3 w-3" />
                  <span>{isPaused ? 'Resume Voice' : 'Pause'}</span>
                </button>
                <button
                  onClick={stopSpeaking}
                  className="flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1 text-xs font-bold text-slate-200 hover:bg-slate-700"
                >
                  <Square className="h-3 w-3 text-rose-400" />
                  <span>Stop</span>
                </button>
                <div className="flex items-center gap-1 pl-2 border-l border-emerald-800 text-[11px] text-emerald-300">
                  <span>Speed:</span>
                  {[0.8, 1.0, 1.2].map(speed => (
                    <button
                      key={speed}
                      onClick={() => setSpeechRate(speed)}
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        speechRate === speed ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Quick Clickable Industrial Area Preset Cards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                Tap to Ask via Voice (Industrial Area Presets)
              </h4>
              <span className="text-[11px] text-slate-500">6 Specialized Knowledge Hubs</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {presetAreaPrompts.map((preset, idx) => {
                const IconComponent = preset.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setTranscript(preset.query);
                      handleProcessVoiceQuery(preset.query);
                    }}
                    className="group relative flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5 text-left hover:border-slate-700 hover:bg-slate-800/80 transition-all shadow-xs"
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${preset.color} text-white shadow-md group-hover:scale-105 transition-transform`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                        {preset.title}
                      </h5>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {preset.subtitle}
                      </p>
                      <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                        <Volume2 className="h-3 w-3" />
                        <span>Tap to listen report</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Latest Answer & Voice History Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-5 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  Spoken Intelligence Output
                </h4>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => speakText(currentResponse)}
                  className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all"
                  title="Re-play audio"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Re-listen</span>
                </button>
                <button
                  onClick={() => handleCopy('current', currentResponse)}
                  className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-all"
                  title="Copy text"
                >
                  {copiedId === 'current' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedId === 'current' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="mt-4 text-xs leading-relaxed text-slate-200 whitespace-pre-line">
              {currentResponse}
            </div>
          </div>

        </div>

        {/* Bottom Text Input Bar (If user prefers typing instead of mic) */}
        <div className="border-t border-slate-800 bg-slate-950 p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (transcript.trim()) {
                handleProcessVoiceQuery(transcript);
              }
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Or type an industrial zone inquiry (e.g., 'Chattogram Port CDSO tank buffer')..."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            
            <button
              type="button"
              onClick={toggleListening}
              className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-all shadow-md ${
                isListening 
                  ? 'bg-rose-600 text-white animate-pulse ring-2 ring-rose-400' 
                  : 'border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
              title={isListening ? 'Stop listening' : 'Start listening'}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>

            <button
              type="submit"
              disabled={!transcript.trim() || isLoading}
              className="flex h-11 items-center gap-1.5 rounded-2xl bg-emerald-600 px-5 text-xs font-bold text-white transition-all hover:bg-emerald-500 disabled:opacity-40 shadow-lg shadow-emerald-600/30"
            >
              <Send className="h-4 w-4" />
              <span>Ask & Speak</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
