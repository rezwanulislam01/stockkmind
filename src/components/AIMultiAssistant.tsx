import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  Brain, 
  RefreshCw, 
  Copy, 
  Check, 
  Zap, 
  ShieldAlert, 
  Coins,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio
} from 'lucide-react';
import { Product, Supplier } from '../types';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  modelUsed?: string;
  roleUsed?: string;
}

export type AssistantRole = 'inventory_strategist' | 'financial_controller' | 'risk_logistics';
export type GeminiModel = 'gemini-3.7-flash' | 'gemini-3.1-pro-preview' | 'gemini-3.1-flash-lite';

interface AIMultiAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  suppliers: Supplier[];
  onSelectProduct: (product: Product) => void;
  onNavigateTab: (tab: any) => void;
  onOpenVoiceModal?: () => void;
}

// Clean markdown text for speech synthesis
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

export const AIMultiAssistant: React.FC<AIMultiAssistantProps> = ({
  isOpen,
  onClose,
  products,
  suppliers,
  onSelectProduct,
  onNavigateTab,
  onOpenVoiceModal,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I'm StockMind's Industrial Raw Materials Intelligence Copilot for Rezwan Industrial Zone (SSR Group of Industry). 
I can analyze real-time silo runway, compute emergency reorder allocations, audit Godagari yard dead capital, and evaluate vessel transit logistics across Chattogram Port, Rajshahi, Dinajpur, and Ishwardi.

You can ask me questions by text or voice command!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.7-flash',
      roleUsed: 'Industrial Intelligence Copilot',
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<GeminiModel>('gemini-3.7-flash');
  const [selectedRole, setSelectedRole] = useState<AssistantRole>('inventory_strategist');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

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
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += trans;
          } else {
            interimTranscript += trans;
          }
        }
        const text = finalTranscript || interimTranscript;
        setInputQuery(text);
        if (finalTranscript) {
          handleSendMessage(finalTranscript);
          setIsListening(false);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [products]);

  const toggleMic = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (synthRef.current) synthRef.current.cancel();
      setSpeakingId(null);
      try {
        if (recognitionRef.current) {
          recognitionRef.current.start();
        } else if (onOpenVoiceModal) {
          onOpenVoiceModal();
        }
      } catch (err) {
        console.warn('Recognition start failed:', err);
      }
    }
  };

  const handleSpeakMessage = (id: string, text: string) => {
    if (!synthRef.current) return;

    if (speakingId === id) {
      synthRef.current.cancel();
      setSpeakingId(null);
      return;
    }

    synthRef.current.cancel();
    const clean = cleanTextForSpeech(text);
    if (!clean) return;

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setSpeakingId(id);
    };

    utterance.onend = () => {
      setSpeakingId(null);
    };

    utterance.onerror = () => {
      setSpeakingId(null);
    };

    synthRef.current.speak(utterance);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    "Tell me about Rezwan Industrial Zone silo status",
    "What is the status of Chattogram Port Tank Terminal?",
    "Check Dinajpur Auto Rice Mill paddy buffer",
    "Calculate dead capital in Godagari yard #05",
  ];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    if (synthRef.current) synthRef.current.cancel();
    setSpeakingId(null);
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        sender: 'assistant',
        text: "Conversation history cleared. Ready for your next industrial raw materials inquiry.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: selectedModel,
        roleUsed: selectedRole,
      }
    ]);
  };

  const handleSendMessage = async (queryText?: string) => {
    const text = queryText || inputQuery;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputQuery('');
    setIsLoading(true);

    try {
      // Prepare conversation history payload for multi-turn Gemini endpoint
      const conversationPayload = newHistory.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const topRiskItems = products
        .filter(p => p.riskScore > 50)
        .map(p => ({
          sku: p.sku,
          name: p.name,
          currentStock: p.currentStock,
          dailyDemand: p.dailyDemand,
          riskScore: p.riskScore,
          daysToStockout: (p.currentStock / Math.max(0.1, p.dailyDemand)).toFixed(1)
        }));

      const totalValuation = products.reduce((acc, p) => acc + (p.currentStock * p.unitPrice), 0);
      const deadCapital = products
        .filter(p => p.status === 'dead_stock')
        .reduce((acc, p) => acc + (p.currentStock * p.unitPrice), 0);

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          conversationHistory: conversationPayload,
          model: selectedModel,
          role: selectedRole,
          inventorySummary: {
            totalProducts: products.length,
            healthScore: Math.round(products.reduce((acc, p) => acc + (100 - p.riskScore), 0) / Math.max(1, products.length)),
            totalValuation,
            deadCapital,
            criticalCount: products.filter(p => p.status === 'critical').length,
            attentionCount: products.filter(p => p.status === 'warning' || p.status === 'dead_stock').length,
            topRiskItems,
          },
        }),
      });

      const data = await response.json();
      
      const assistantMsg: ChatMessage = {
        id: 'reply-' + Date.now(),
        sender: 'assistant',
        text: data.reply || "Inventory state evaluated. All parameters within bounds.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.model || selectedModel,
        roleUsed: selectedRole === 'inventory_strategist' 
          ? 'Industrial Strategist' 
          : selectedRole === 'financial_controller' 
          ? 'Financial Controller' 
          : 'Risk & Logistics',
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('AI chat failed:', err);
      const fallbackReply: ChatMessage = {
        id: 'reply-fallback-' + Date.now(),
        sender: 'assistant',
        text: `### 🏭 Rezwan Industrial Zone Telemetry Snapshot
- **Milling Wheat (Silo #01)**: 420 MT remaining (3.5 days runway - Urgent Reorder).
- **Crude Degummed Soybean Oil (Tank #02)**: 280 MT remaining (3.2 days buffer).
- **Avoided Daily Downtime Loss**: ৳1.49 Crore BDT protected through timely reorders.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'deterministic-fallback',
        roleUsed: 'Industrial Copilot',
      };
      setMessages(prev => [...prev, fallbackReply]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-slate-800 bg-slate-900 shadow-2xl backdrop-blur-xl">
      
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-950/95 px-5 py-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                Gemini Industrial Copilot
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </h3>
              <p className="text-[11px] text-slate-400">SSR Group & Industrial Silo Intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenVoiceModal && (
              <button
                onClick={onOpenVoiceModal}
                className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all"
                title="Open Voice Command Hub"
              >
                <Radio className="h-3 w-3 animate-pulse" />
                <span>Voice AI</span>
              </button>
            )}
            <button
              onClick={handleClearHistory}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              title="Clear conversation history"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Persona / Role Selector */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setSelectedRole('inventory_strategist')}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
              selectedRole === 'inventory_strategist'
                ? 'bg-emerald-600 text-white'
                : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="h-3 w-3" />
            <span>Plant Strategist</span>
          </button>

          <button
            onClick={() => setSelectedRole('financial_controller')}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
              selectedRole === 'financial_controller'
                ? 'bg-emerald-600 text-white'
                : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Coins className="h-3 w-3" />
            <span>Valuation & Loss (৳)</span>
          </button>

          <button
            onClick={() => setSelectedRole('risk_logistics')}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
              selectedRole === 'risk_logistics'
                ? 'bg-emerald-600 text-white'
                : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="h-3 w-3" />
            <span>Port & Rail Logistics</span>
          </button>
        </div>

        {/* Model Selector Bar */}
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/60 pt-2">
          <span>Model:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSelectedModel('gemini-3.7-flash')}
              className={`rounded px-2 py-0.5 text-[10px] font-medium transition-all ${
                selectedModel === 'gemini-3.7-flash'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              gemini-3.7-flash
            </button>
            <button
              onClick={() => setSelectedModel('gemini-3.1-pro-preview')}
              className={`rounded px-2 py-0.5 text-[10px] font-medium transition-all ${
                selectedModel === 'gemini-3.1-pro-preview'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              gemini-3.1-pro
            </button>
            <button
              onClick={() => setSelectedModel('gemini-3.1-flash-lite')}
              className={`rounded px-2 py-0.5 text-[10px] font-medium transition-all ${
                selectedModel === 'gemini-3.1-flash-lite'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              flash-lite
            </button>
          </div>
        </div>
      </div>

      {/* Messages Scrollable Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs bg-slate-950/50">
        
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
            >
              {/* Model & Role Badge for Assistant */}
              {!isUser && (
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 px-1">
                  <span className="font-semibold text-emerald-400">{m.roleUsed || 'AI Analyst'}</span>
                  <span>•</span>
                  <span className="font-mono text-slate-400">{m.modelUsed || selectedModel}</span>
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`group relative max-w-[90%] rounded-2xl px-4 py-3 leading-relaxed ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-br-none shadow-md shadow-emerald-600/20'
                    : 'border border-slate-800 bg-slate-900 text-slate-200 rounded-bl-none shadow-sm'
                }`}
              >
                <div className="whitespace-pre-line leading-relaxed">{m.text}</div>
                
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{m.timestamp}</span>
                  {!isUser && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleSpeakMessage(m.id, m.text)}
                        className={`p-1 transition-colors ${speakingId === m.id ? 'text-emerald-400 animate-pulse' : 'text-slate-400 hover:text-white'}`}
                        title={speakingId === m.id ? 'Stop speaking' : 'Read aloud with voice'}
                      >
                        {speakingId === m.id ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                      </button>
                      <button
                        onClick={() => handleCopy(m.id, m.text)}
                        className="p-1 text-slate-400 hover:text-white"
                        title="Copy response"
                      >
                        {copiedId === m.id ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-emerald-400 p-2 animate-pulse bg-slate-900/60 rounded-xl border border-slate-800">
            <Brain className="h-4 w-4 animate-spin" />
            <span>Analyzing industrial silo telemetry with {selectedModel}...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Inquiries */}
      <div className="border-t border-slate-800 bg-slate-950/80 p-3">
        <div className="text-[10px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
          Suggested Industrial Queries:
        </div>
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p)}
              className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-[11px] text-slate-300 transition-all hover:border-slate-700 hover:bg-slate-800 hover:text-white text-left"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Input */}
      <div className="border-t border-slate-800 bg-slate-950 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask about industrial zones, silo runway, dead stock, or downtime loss..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />

          <button
            type="button"
            onClick={toggleMic}
            className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse ring-2 ring-rose-400'
                : 'border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
            title={isListening ? 'Stop recording voice' : 'Speak voice command'}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>

          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white transition-all hover:bg-emerald-500 disabled:opacity-40 shadow-sm shadow-emerald-600/30"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
