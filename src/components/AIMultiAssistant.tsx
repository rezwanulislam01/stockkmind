import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  Zap, 
  Database, 
  Brain, 
  RefreshCw, 
  HelpCircle, 
  Package, 
  ChevronRight,
  TrendingDown,
  Cpu
} from 'lucide-react';
import { Product, Supplier } from '../types';
import { routeTokenQuery } from '../utils/tokenRouter';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  tier?: 1 | 2 | 3;
  tierLabel?: string;
  cost?: string;
}

interface AIMultiAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  suppliers: Supplier[];
  onSelectProduct: (product: Product) => void;
  onNavigateTab: (tab: any) => void;
}

export const AIMultiAssistant: React.FC<AIMultiAssistantProps> = ({
  isOpen,
  onClose,
  products,
  suppliers,
  onSelectProduct,
  onNavigateTab,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! I'm StockMind's AI Inventory Intelligence Specialist powered by Gemini 3.1 Pro (High Thinking Mode) & Hybrid Deterministic Routing. Ask me anything about stockout risk, EOQ reordering, vendor trade-offs, or dead stock liquidation.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tier: 1,
      tierLabel: 'Deterministic Core (0 Tokens)',
      cost: '0 Tokens',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHighThinkingEnabled, setIsHighThinkingEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    "Which SKUs will stock out this week?",
    "What is the total dead capital locked?",
    "Provide deep strategic reorder guidance for Cooking Oil",
    "Analyze vendor trade-offs for Basmati Rice",
  ];

  const handleSendMessage = async (queryText?: string) => {
    const text = queryText || inputQuery;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    // 1. Evaluate Token Router (Deterministic Tiers 1 & 2 vs LLM Tier 3)
    const routingResult = routeTokenQuery(text, products);

    // If High Thinking is forced or query needs deep strategic reasoning, send to Tier 3
    const isDeepQuery = text.toLowerCase().includes('strategic') || 
                        text.toLowerCase().includes('trade-off') || 
                        text.toLowerCase().includes('guidance') || 
                        text.toLowerCase().includes('analyze') ||
                        isHighThinkingEnabled;

    if (!isDeepQuery && (routingResult.tier === 1 || routingResult.tier === 2)) {
      // Zero token local response!
      setTimeout(() => {
        const assistantMsg: Message = {
          id: 'asst-' + Date.now(),
          sender: 'assistant',
          text: routingResult.response || 'Computed directly from real-time database state.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          tier: routingResult.tier,
          tierLabel: routingResult.tier === 1 ? 'Tier 1: Deterministic Engine' : 'Tier 2: Fast SKU Query',
          cost: '0 Tokens ($0.00)',
        };
        setMessages(prev => [...prev, assistantMsg]);
        setIsLoading(false);
      }, 400);
      return;
    }

    // 2. Tier 3: Call Server-Side Gemini API with gemini-3.1-pro-preview HIGH Thinking
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          inventorySummary: {
            totalProducts: products.length,
            topRiskItems: products.filter(p => p.riskScore > 50).map(p => ({
              sku: p.sku,
              name: p.name,
              currentStock: p.currentStock,
              dailyDemand: p.dailyDemand,
              riskScore: p.riskScore
            })),
          },
          useHighThinking: true,
        }),
      });

      const data = await response.json();
      const assistantMsg: Message = {
        id: 'asst-' + Date.now(),
        sender: 'assistant',
        text: data.reply || 'Strategic analysis completed.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tier: 3,
        tierLabel: 'Gemini 3.1 Pro (High Thinking)',
        cost: 'Deep Reasoning Engine',
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      // Fallback
      const assistantMsg: Message = {
        id: 'asst-' + Date.now(),
        sender: 'assistant',
        text: routingResult.response || 'Inventory intelligence analysis completed based on current on-hand quantities.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tier: 1,
        tierLabel: 'Tier 1: Deterministic Fallback',
        cost: '0 Tokens',
      };
      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl backdrop-blur-xl animate-slideLeft transition-colors">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/90 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              StockMind AI Analyst
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <Cpu className="h-3 w-3 text-indigo-500" />
              <span>Gemini 3.1 Pro • High Thinking</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsHighThinkingEnabled(!isHighThinkingEnabled)}
            className={`flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold transition-all border ${
              isHighThinkingEnabled
                ? 'bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-300'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
            }`}
            title="Toggle High Thinking reasoning depth"
          >
            <Brain className="h-3 w-3" />
            <span>High Thinking</span>
          </button>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs bg-slate-50/50 dark:bg-slate-900/50">
        
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
            >
              {/* Token Tier Badge */}
              {!isUser && m.tier && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-500/30 shadow-xs">
                  {m.tier === 1 && <Zap className="h-3 w-3 text-amber-500" />}
                  {m.tier === 2 && <Database className="h-3 w-3 text-blue-500" />}
                  {m.tier === 3 && <Brain className="h-3 w-3 text-purple-500" />}
                  <span>{m.tierLabel} ({m.cost})</span>
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-[92%] rounded-2xl px-4 py-3 leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                    : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 rounded-bl-none shadow-sm'
                }`}
              >
                <div className="whitespace-pre-line leading-relaxed">{m.text}</div>
                <div
                  className={`mt-1.5 text-[10px] ${
                    isUser ? 'text-indigo-200 text-right' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 p-2 animate-pulse">
            <Brain className="h-4 w-4 animate-spin" />
            <span>Gemini 3.1 Pro is performing High Thinking analysis...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/40 p-3">
        <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
          Suggested Inquiries:
        </div>
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p)}
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/90 px-2.5 py-1 text-[11px] text-slate-700 dark:text-slate-300 transition-all hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white text-left"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Input */}
      <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask about inventory, EOQ, risk, or dead capital..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white transition-all hover:bg-indigo-500 disabled:opacity-40 shadow-sm"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
