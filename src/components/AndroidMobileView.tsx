import React, { useState } from 'react';
import { 
  Wifi, 
  Battery, 
  Signal, 
  Layers, 
  Bot, 
  LineChart, 
  ShoppingCart, 
  Sliders, 
  Table, 
  Package, 
  Plus, 
  TrendingUp, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2, 
  ArrowUpRight, 
  ChevronRight, 
  Search, 
  Filter, 
  SlidersHorizontal,
  Flame,
  Clock,
  DollarSign,
  ShieldAlert,
  Brain,
  QrCode,
  Smartphone,
  Tablet,
  Monitor,
  Code2
} from 'lucide-react';
import { Product, Supplier, AIActionItem, PurchaseOrder, DemoScenario } from '../types';

interface AndroidMobileViewProps {
  products: Product[];
  suppliers: Supplier[];
  actionQueue: AIActionItem[];
  purchaseOrders: PurchaseOrder[];
  healthScore: number;
  totalValuation: number;
  deadCapital: number;
  criticalCount: number;
  attentionCount: number;
  avoidedLoss: number;
  activeScenario: DemoScenario;
  onSelectProduct: (product: Product) => void;
  onApproveAction: (action: AIActionItem) => void;
  onOpenWhyModal: (action: AIActionItem) => void;
  onOpenRecordSale: () => void;
  onOpenAddProduct: () => void;
  onOpenAIAssistant: () => void;
  onCreatePO: (po: Omit<PurchaseOrder, 'id' | 'poNumber' | 'createdAt'>) => void;
  onSelectScenario: (scenario: string) => void;
}

export const AndroidMobileView: React.FC<AndroidMobileViewProps> = ({
  products,
  suppliers,
  actionQueue,
  purchaseOrders,
  healthScore,
  totalValuation,
  deadCapital,
  criticalCount,
  attentionCount,
  avoidedLoss,
  activeScenario,
  onSelectProduct,
  onApproveAction,
  onOpenWhyModal,
  onOpenRecordSale,
  onOpenAddProduct,
  onOpenAIAssistant,
  onCreatePO,
  onSelectScenario,
}) => {
  const [mobileTab, setMobileTab] = useState<'home' | 'forecast' | 'suppliers' | 'simulator' | 'ai'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [currentTime, setCurrentTime] = useState(() => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  });

  const categories = ['all', 'Groceries', 'Personal Care', 'Electronics', 'Beverages', 'Home & Living'];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = activeCategoryFilter === 'all' || p.category === activeCategoryFilter;
    return matchesSearch && matchesCat;
  });

  const pendingActions = actionQueue.filter(a => a.status === 'pending');

  return (
    <div className="mx-auto max-w-[420px] rounded-[48px] border-[10px] border-slate-900 dark:border-slate-800 bg-slate-950 shadow-2xl overflow-hidden text-slate-100 relative select-none">
      
      {/* ------------------------------------------------------------- */}
      {/* ANDROID STATUS BAR                                            */}
      {/* ------------------------------------------------------------- */}
      <div className="flex h-10 w-full items-center justify-between px-6 pt-2 text-[12px] font-semibold text-slate-300 bg-slate-950 z-20">
        <span className="font-mono">{currentTime}</span>
        
        {/* Camera Punch Hole */}
        <div className="h-4 w-4 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
          <div className="h-1.5 w-1.5 rounded-full bg-indigo-950"></div>
        </div>

        <div className="flex items-center gap-2">
          <Signal className="h-3.5 w-3.5 text-slate-300" />
          <Wifi className="h-3.5 w-3.5 text-slate-300" />
          <div className="flex items-center gap-0.5">
            <span className="text-[10px]">98%</span>
            <Battery className="h-4 w-4 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* ANDROID APP HEADER                                            */}
      {/* ------------------------------------------------------------- */}
      <div className="px-5 pt-2 pb-3 bg-slate-950/90 border-b border-slate-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 p-0.5 shadow-md">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
                <Layers className="h-4 w-4 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-bold text-white tracking-tight">StockMind</h1>
                <span className="rounded bg-indigo-500/20 px-1 py-0.5 text-[9px] font-bold text-indigo-400 border border-indigo-500/30">
                  ANDROID
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Decision Intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenAIAssistant}
              className="flex items-center gap-1 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-2.5 py-1 text-[11px] font-semibold text-indigo-300 shadow-xs active:scale-95 transition-transform"
            >
              <Brain className="h-3.5 w-3.5 text-indigo-400" />
              <span>AI</span>
            </button>
          </div>
        </div>

        {/* Material 3 Search Bar */}
        <div className="mt-3 flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/90 px-3 py-2">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search SKU, product, or supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Horizontal Category Chips */}
        <div className="mt-2.5 flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategoryFilter(cat)}
              className={`flex-shrink-0 rounded-full px-3 py-1 text-[11px] font-medium transition-all ${
                activeCategoryFilter === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Items' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SCROLLABLE MAIN CONTENT BODY                                  */}
      {/* ------------------------------------------------------------- */}
      <div className="h-[520px] overflow-y-auto px-4 py-3 space-y-4 no-scrollbar pb-20">
        
        {/* TAB 1: HOME & ACTIONS */}
        {mobileTab === 'home' && (
          <>
            {/* Quick Metrics Carousel */}
            <div className="grid grid-cols-2 gap-2.5">
              
              {/* Health Score Card */}
              <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-3 shadow-sm">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Health Score</span>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
                </div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-white">{healthScore}</span>
                  <span className="text-[10px] text-slate-400">/ 100</span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-400">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>+4.2% optimized</span>
                </div>
              </div>

              {/* Total Valuation Card */}
              <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-3 shadow-sm">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Inventory Value</span>
                  <DollarSign className="h-3 w-3 text-indigo-400" />
                </div>
                <div className="mt-1">
                  <span className="text-2xl font-bold text-white">${(totalValuation / 1000).toFixed(1)}k</span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                  <span>{products.length} Active SKUs</span>
                </div>
              </div>

              {/* Critical Alerts */}
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-3">
                <div className="flex items-center justify-between text-[11px] text-rose-300">
                  <span>Critical Stockouts</span>
                  <Flame className="h-3.5 w-3.5 text-rose-400" />
                </div>
                <div className="mt-1 text-2xl font-bold text-rose-400">{criticalCount} SKUs</div>
                <div className="text-[10px] text-rose-300/80">Reorder required</div>
              </div>

              {/* Dead Stock Capital */}
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3">
                <div className="flex items-center justify-between text-[11px] text-amber-300">
                  <span>Dead Capital</span>
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                </div>
                <div className="mt-1 text-2xl font-bold text-amber-400">${(deadCapital / 1000).toFixed(1)}k</div>
                <div className="text-[10px] text-amber-300/80">Ready to liquidate</div>
              </div>

            </div>

            {/* AI Decision Action Center */}
            <div className="rounded-3xl border border-indigo-500/30 bg-slate-900/80 p-3.5 shadow-md">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                  <h3 className="text-xs font-bold text-white">AI Decision Action Center</h3>
                </div>
                <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
                  {pendingActions.length} Pending
                </span>
              </div>

              <div className="space-y-2">
                {pendingActions.slice(0, 3).map((action) => (
                  <div 
                    key={action.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950/90 p-3 space-y-2 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`h-2 w-2 rounded-full ${
                            action.severity === 'urgent' ? 'bg-rose-500' : 'bg-amber-500'
                          }`} />
                          <p className="text-xs font-semibold text-white">{action.productName}</p>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{action.title}</p>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        +${action.avoidedLossEstimate}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => onOpenWhyModal(action)}
                        className="flex-1 rounded-xl border border-slate-700 bg-slate-800 py-1.5 text-[11px] font-medium text-slate-300 hover:bg-slate-700 active:scale-98 transition-transform"
                      >
                        Explain Why?
                      </button>
                      <button
                        onClick={() => onApproveAction(action)}
                        className="flex-1 rounded-xl bg-emerald-600 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-500 active:scale-98 transition-transform shadow-xs"
                      >
                        Approve Reorder
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SKU Catalog Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-white">SKU Inventory Status</h3>
                <span className="text-[11px] text-slate-400">{filteredProducts.length} items</span>
              </div>

              <div className="space-y-2">
                {filteredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => onSelectProduct(prod)}
                    className="flex items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-900/60 p-3 hover:bg-slate-800/60 active:scale-99 transition-all cursor-pointer"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white">{prod.name}</span>
                        <span className={`rounded-md px-1.5 py-0.2 text-[9px] font-bold uppercase ${
                          prod.status === 'critical'
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            : prod.status === 'warning'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : prod.status === 'dead_stock'
                            ? 'bg-slate-700 text-slate-300'
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {prod.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span>Stock: <strong className="text-slate-200">{prod.currentStock}</strong></span>
                        <span>Daily: <strong className="text-slate-200">{prod.dailyDemand}</strong>/d</span>
                        <span>Lead: <strong className="text-slate-200">{prod.leadTimeDays}d</strong></span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-white">${prod.unitPrice}</div>
                      <div className="text-[10px] text-indigo-400 font-medium">Risk {prod.riskScore}/100</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* TAB 2: FORECASTING */}
        {mobileTab === 'forecast' && (
          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3.5">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <LineChart className="h-4 w-4 text-indigo-400" />
                Holt's Linear Forecast Engine
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Deterministic exponential smoothing with confidence bounds.
              </p>
            </div>

            {products.slice(0, 6).map((prod) => (
              <div key={prod.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-white">{prod.name}</span>
                    <p className="text-[10px] text-slate-400">Trend: {prod.demandTrend > 0 ? '+' : ''}{prod.demandTrend}% velocity</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-400">
                    EOQ: {prod.eoq} units
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1 border-t border-slate-800/60">
                  <span>Safety Buffer: <strong>{prod.safetyStock}</strong></span>
                  <span>Reorder Point: <strong>{prod.reorderPoint}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: SUPPLIERS */}
        {mobileTab === 'suppliers' && (
          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3.5">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <ShoppingCart className="h-4 w-4 text-emerald-400" />
                Supplier Lead Time & Cost Matrix
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Evaluate vendor trade-offs between standard and expedited freight.
              </p>
            </div>

            {suppliers.map((sup) => (
              <div key={sup.id} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white">{sup.name}</span>
                    <p className="text-[10px] text-slate-400">{sup.location}</p>
                  </div>
                  <div className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                    {sup.reliability}% Reliability
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950 p-2 rounded-xl">
                  <div>Standard Lead: <strong className="text-slate-200">{sup.baseLeadTime} days</strong></div>
                  <div>Expedited Lead: <strong className="text-emerald-400">{sup.expeditedLeadTime} days</strong></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: SIMULATOR */}
        {mobileTab === 'simulator' && (
          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3.5">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sliders className="h-4 w-4 text-amber-400" />
                What-If Supply Chain Simulator
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Select a preset scenario to simulate market shocks in real-time.
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => onSelectScenario('black_friday')}
                className="w-full text-left rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-3 hover:bg-indigo-500/20 active:scale-98 transition-transform"
              >
                <div className="text-xs font-bold text-indigo-300">📈 Black Friday Demand Surge (+75%)</div>
                <p className="text-[11px] text-slate-300 mt-0.5">Spikes velocity across Groceries and Tech categories.</p>
              </button>

              <button
                onClick={() => onSelectScenario('supply_shock')}
                className="w-full text-left rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 hover:bg-amber-500/20 active:scale-98 transition-transform"
              >
                <div className="text-xs font-bold text-amber-300">⏱️ Lead Time Delay Shock (+5 Days)</div>
                <p className="text-[11px] text-slate-300 mt-0.5">Simulates supplier logistics & shipping congestion.</p>
              </button>

              <button
                onClick={() => onSelectScenario('dead_stock_flush')}
                className="w-full text-left rounded-2xl border border-purple-500/30 bg-purple-500/10 p-3 hover:bg-purple-500/20 active:scale-98 transition-transform"
              >
                <div className="text-xs font-bold text-purple-300">🟡 Dead Stock Clearance Mode</div>
                <p className="text-[11px] text-slate-300 mt-0.5">Evaluates cash liquidation discount curves.</p>
              </button>

              <button
                onClick={() => onSelectScenario('baseline')}
                className="w-full text-left rounded-2xl border border-slate-700 bg-slate-800/80 p-3 hover:bg-slate-700 active:scale-98 transition-transform"
              >
                <div className="text-xs font-bold text-slate-200">⚡ Reset to Normal Baseline</div>
                <p className="text-[11px] text-slate-400 mt-0.5">Restores standard demand and lead times.</p>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ------------------------------------------------------------- */}
      {/* ANDROID FLOATING ACTION BUTTON (FAB)                          */}
      {/* ------------------------------------------------------------- */}
      <button
        onClick={onOpenRecordSale}
        className="absolute bottom-16 right-5 flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-indigo-600 text-white shadow-xl shadow-indigo-600/40 active:scale-90 transition-transform z-30"
        title="Record Sale or Scan SKU"
      >
        <TrendingUp className="h-6 w-6" />
      </button>

      {/* ------------------------------------------------------------- */}
      {/* MATERIAL 3 BOTTOM NAVIGATION BAR                             */}
      {/* ------------------------------------------------------------- */}
      <div className="absolute bottom-0 inset-x-0 bg-slate-950/95 border-t border-slate-900 px-2 py-1.5 z-20 backdrop-blur-md">
        <div className="flex items-center justify-around">
          
          <button
            onClick={() => setMobileTab('home')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
              mobileTab === 'home' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`flex h-7 w-12 items-center justify-center rounded-full transition-all ${
              mobileTab === 'home' ? 'bg-indigo-500/20' : ''
            }`}>
              <Layers className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-medium">Overview</span>
          </button>

          <button
            onClick={() => setMobileTab('forecast')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
              mobileTab === 'forecast' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`flex h-7 w-12 items-center justify-center rounded-full transition-all ${
              mobileTab === 'forecast' ? 'bg-indigo-500/20' : ''
            }`}>
              <LineChart className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-medium">Forecast</span>
          </button>

          <button
            onClick={() => setMobileTab('suppliers')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
              mobileTab === 'suppliers' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`flex h-7 w-12 items-center justify-center rounded-full transition-all ${
              mobileTab === 'suppliers' ? 'bg-indigo-500/20' : ''
            }`}>
              <ShoppingCart className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-medium">Suppliers</span>
          </button>

          <button
            onClick={() => setMobileTab('simulator')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
              mobileTab === 'simulator' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`flex h-7 w-12 items-center justify-center rounded-full transition-all ${
              mobileTab === 'simulator' ? 'bg-indigo-500/20' : ''
            }`}>
              <Sliders className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-medium">Simulator</span>
          </button>

          <button
            onClick={onOpenAIAssistant}
            className="flex flex-col items-center gap-1 py-1 px-3 rounded-2xl text-slate-400 hover:text-indigo-400 transition-all"
          >
            <div className="flex h-7 w-12 items-center justify-center rounded-full">
              <Bot className="h-4 w-4 text-emerald-400 animate-pulse" />
            </div>
            <span className="text-[10px] font-medium">AI Copilot</span>
          </button>

        </div>

        {/* Android Gesture Bar */}
        <div className="mx-auto mt-1 h-1 w-32 rounded-full bg-slate-700"></div>
      </div>

    </div>
  );
};
