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
  TrendingUp, 
  AlertTriangle, 
  Sparkles, 
  ArrowUpRight, 
  Search, 
  Flame,
  Brain
} from 'lucide-react';
import { Product, Supplier, AIActionItem, PurchaseOrder, DemoScenario } from '../types';
import { formatBDT } from '../utils/forecasting';

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
  const [mobileTab, setMobileTab] = useState<'home' | 'forecast' | 'suppliers' | 'simulator'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [currentTime] = useState(() => {
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
    <div className="mx-auto max-w-[400px] rounded-[40px] border-8 border-slate-900 bg-slate-950 shadow-2xl overflow-hidden text-slate-100 relative select-none">
      
      {/* ------------------------------------------------------------- */}
      {/* ANDROID STATUS BAR                                            */}
      {/* ------------------------------------------------------------- */}
      <div className="flex h-9 w-full items-center justify-between px-5 pt-1.5 text-[11px] font-semibold text-slate-400 bg-slate-950 z-20">
        <span className="font-mono">{currentTime}</span>
        
        <div className="h-3.5 w-3.5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
          <div className="h-1 w-1 rounded-full bg-emerald-500"></div>
        </div>

        <div className="flex items-center gap-1.5">
          <Signal className="h-3 w-3 text-slate-400" />
          <Wifi className="h-3 w-3 text-slate-400" />
          <div className="flex items-center gap-0.5">
            <span className="text-[9px]">98%</span>
            <Battery className="h-3.5 w-3.5 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* ANDROID APP HEADER                                            */}
      {/* ------------------------------------------------------------- */}
      <div className="px-4 pt-1 pb-2.5 bg-slate-950/95 border-b border-slate-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-black text-sm">
              ৳
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-bold text-white tracking-tight">StockMind BD</h1>
                <span className="rounded bg-emerald-500/20 px-1 py-0.2 text-[8px] font-bold text-emerald-400 border border-emerald-500/30">
                  ANDROID
                </span>
              </div>
              <p className="text-[9px] text-slate-400">Bangladesh SME Inventory</p>
            </div>
          </div>

          <button
            onClick={onOpenAIAssistant}
            className="flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-300 active:scale-95"
          >
            <Brain className="h-3 w-3 text-emerald-400" />
            <span>AI Analyst</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-2.5 py-1.5">
          <Search className="h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search SKU or Product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none"
          />
        </div>

        {/* Category Chips */}
        <div className="mt-2 flex gap-1 overflow-x-auto no-scrollbar py-0.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategoryFilter(cat)}
              className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-medium transition-all ${
                activeCategoryFilter === cat
                  ? 'bg-emerald-600 text-white'
                  : 'border border-slate-800 bg-slate-900 text-slate-400'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SCROLLABLE MAIN CONTENT BODY                                  */}
      {/* ------------------------------------------------------------- */}
      <div className="h-[480px] overflow-y-auto px-3.5 py-3 space-y-3.5 no-scrollbar pb-20">
        
        {/* TAB 1: HOME & ACTIONS */}
        {mobileTab === 'home' && (
          <>
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2">
              
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-2.5">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Health Score</span>
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-xl font-bold text-white">{healthScore}</span>
                  <span className="text-[10px] text-slate-400">/ 100</span>
                </div>
                <div className="mt-0.5 text-[9px] text-emerald-400">+4.2% optimized</div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900 p-2.5">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Inventory Value</span>
                  <span className="text-emerald-400 font-bold">৳</span>
                </div>
                <div className="mt-1">
                  <span className="text-lg font-bold text-white">{formatBDT(totalValuation, true)}</span>
                </div>
                <div className="mt-0.5 text-[9px] text-slate-400">{products.length} Active SKUs</div>
              </div>

              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-2.5">
                <div className="flex items-center justify-between text-[10px] text-rose-300">
                  <span>Critical Stockouts</span>
                  <Flame className="h-3 w-3 text-rose-400" />
                </div>
                <div className="mt-1 text-lg font-bold text-rose-400">{criticalCount} SKUs</div>
                <div className="text-[9px] text-rose-300/80">Reorder required</div>
              </div>

              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5">
                <div className="flex items-center justify-between text-[10px] text-amber-300">
                  <span>Dead Capital</span>
                  <AlertTriangle className="h-3 w-3 text-amber-400" />
                </div>
                <div className="mt-1 text-lg font-bold text-amber-400">{formatBDT(deadCapital, true)}</div>
                <div className="text-[9px] text-amber-300/80">Ready to liquidate</div>
              </div>

            </div>

            {/* AI Decision Action Center */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                  <h3 className="text-xs font-bold text-white">AI Decision Center</h3>
                </div>
                <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-bold text-emerald-300">
                  {pendingActions.length} Pending
                </span>
              </div>

              <div className="space-y-2">
                {pendingActions.slice(0, 3).map((action) => (
                  <div 
                    key={action.id}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-2.5 space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <div>
                        <p className="text-xs font-semibold text-white">{action.productName}</p>
                        <p className="text-[10px] text-slate-400">{action.title}</p>
                      </div>
                      <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded">
                        +{formatBDT(action.avoidedLossEstimate, true)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        onClick={() => onOpenWhyModal(action)}
                        className="flex-1 rounded-lg border border-slate-700 bg-slate-800 py-1 text-[10px] font-medium text-slate-300"
                      >
                        Why?
                      </button>
                      <button
                        onClick={() => onApproveAction(action)}
                        className="flex-1 rounded-lg bg-emerald-600 py-1 text-[10px] font-bold text-white hover:bg-emerald-500"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SKU Catalog Section */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="text-xs font-bold text-white">Products Catalog</h3>
                <span className="text-[10px] text-slate-400">{filteredProducts.length} items</span>
              </div>

              <div className="space-y-1.5">
                {filteredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => onSelectProduct(prod)}
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 hover:bg-slate-800/60 cursor-pointer"
                  >
                    <div>
                      <span className="text-xs font-semibold text-white">{prod.name}</span>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span>Stock: <strong className="text-slate-200">{prod.currentStock}</strong></span>
                        <span>Daily: <strong className="text-slate-200">{prod.dailyDemand}</strong>/d</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-white">{formatBDT(prod.unitPrice)}</div>
                      <div className="text-[9px] text-emerald-400 font-medium">Risk {prod.riskScore}/100</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* TAB 2: FORECASTING */}
        {mobileTab === 'forecast' && (
          <div className="space-y-2.5">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-3">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <LineChart className="h-3.5 w-3.5 text-emerald-400" />
                Holt's Linear Forecast Engine
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Exponential smoothing tailored for Bangladesh retail seasonality.
              </p>
            </div>

            {products.slice(0, 6).map((prod) => (
              <div key={prod.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">{prod.name}</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    EOQ: {prod.eoq} u
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                  <span>Safety Buffer: {prod.safetyStock} u</span>
                  <span>Reorder Point: {prod.reorderPoint} u</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: SUPPLIERS */}
        {mobileTab === 'suppliers' && (
          <div className="space-y-2.5">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-3">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <ShoppingCart className="h-3.5 w-3.5 text-emerald-400" />
                Bangladesh Supplier Matrix
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Distributors across Dhaka, Narayanganj, Gazipur & Chattogram.
              </p>
            </div>

            {suppliers.map((sup) => (
              <div key={sup.id} className="rounded-xl border border-slate-800 bg-slate-900/70 p-2.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white">{sup.name}</span>
                    <p className="text-[10px] text-slate-400">{sup.location}</p>
                  </div>
                  <span className="rounded bg-emerald-500/10 px-1.5 py-0.2 text-[9px] font-bold text-emerald-400">
                    {sup.reliability}% Reliability
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-300 bg-slate-950 p-1.5 rounded-lg">
                  <span>Lead Time: {sup.baseLeadTime} days</span>
                  <span>Expedited: {sup.expeditedLeadTime} days</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: SIMULATOR */}
        {mobileTab === 'simulator' && (
          <div className="space-y-2.5">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-3">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-amber-400" />
                What-If Scenario Simulator
              </h3>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => onSelectScenario('black_friday')}
                className="w-full text-left rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5"
              >
                <div className="text-xs font-bold text-emerald-300">📈 Eid & Festival Sales Surge (+75%)</div>
                <p className="text-[10px] text-slate-300 mt-0.5">Spikes daily consumption across all retail SKUs.</p>
              </button>

              <button
                onClick={() => onSelectScenario('supply_shock')}
                className="w-full text-left rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5"
              >
                <div className="text-xs font-bold text-amber-300">⏱️ Highway / Port Transit Delay (+5 Days)</div>
                <p className="text-[10px] text-slate-300 mt-0.5">Tests safety buffer resilience.</p>
              </button>

              <button
                onClick={() => onSelectScenario('baseline')}
                className="w-full text-left rounded-xl border border-slate-700 bg-slate-800 p-2.5"
              >
                <div className="text-xs font-bold text-slate-200">⚡ Reset to Normal Baseline</div>
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
        className="absolute bottom-14 right-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg active:scale-90 transition-transform z-30"
        title="Record Sale"
      >
        <TrendingUp className="h-5 w-5" />
      </button>

      {/* ------------------------------------------------------------- */}
      {/* MATERIAL 3 BOTTOM NAVIGATION BAR                             */}
      {/* ------------------------------------------------------------- */}
      <div className="absolute bottom-0 inset-x-0 bg-slate-950/95 border-t border-slate-900 px-2 py-1 z-20">
        <div className="flex items-center justify-around">
          
          <button
            onClick={() => setMobileTab('home')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl ${
              mobileTab === 'home' ? 'text-emerald-400' : 'text-slate-400'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span className="text-[9px] font-medium">Home</span>
          </button>

          <button
            onClick={() => setMobileTab('forecast')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl ${
              mobileTab === 'forecast' ? 'text-emerald-400' : 'text-slate-400'
            }`}
          >
            <LineChart className="h-4 w-4" />
            <span className="text-[9px] font-medium">Forecast</span>
          </button>

          <button
            onClick={() => setMobileTab('suppliers')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl ${
              mobileTab === 'suppliers' ? 'text-emerald-400' : 'text-slate-400'
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="text-[9px] font-medium">Suppliers</span>
          </button>

          <button
            onClick={() => setMobileTab('simulator')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl ${
              mobileTab === 'simulator' ? 'text-emerald-400' : 'text-slate-400'
            }`}
          >
            <Sliders className="h-4 w-4" />
            <span className="text-[9px] font-medium">Simulate</span>
          </button>

        </div>

        {/* Android Gesture Bar */}
        <div className="mx-auto mt-0.5 h-1 w-24 rounded-full bg-slate-700"></div>
      </div>

    </div>
  );
};
