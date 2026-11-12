import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ArrowUpRight, 
  CheckCircle2, 
  ChevronRight, 
  Factory, 
  ShieldAlert, 
  ShieldCheck, 
  Sparkles, 
  TrendingDown, 
  TrendingUp,
  Layers,
  Mic,
  Volume2,
  Radio,
  Ship,
  Wheat
} from 'lucide-react';
import { AIActionItem, Product } from '../types';
import { formatBDT } from '../utils/forecasting';
import { ShopGallerySlider } from './ShopGallerySlider';
import { StockTimingImpactWidget } from './StockTimingImpactWidget';

interface ExecutiveDashboardProps {
  products: Product[];
  healthScore: number;
  healthDelta: number;
  totalValuation: number;
  deadCapital: number;
  criticalCount: number;
  attentionCount: number;
  avoidedLoss: number;
  actionQueue: AIActionItem[];
  onApproveAction: (action: AIActionItem) => void;
  onOpenWhyModal: (action: AIActionItem) => void;
  onSelectProduct: (product: Product) => void;
  onNavigateTab: (tab: any) => void;
  onOpenVoiceModal?: () => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  products,
  healthScore,
  healthDelta,
  totalValuation,
  deadCapital,
  criticalCount,
  attentionCount,
  avoidedLoss,
  actionQueue,
  onApproveAction,
  onOpenWhyModal,
  onSelectProduct,
  onNavigateTab,
  onOpenVoiceModal,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'urgent' | 'attention' | 'optimize'>('all');

  const filteredActions = actionQueue.filter((action) => {
    if (filterSeverity === 'all') return true;
    return action.severity === filterSeverity;
  });

  const deadCapitalPercentage = totalValuation > 0 ? ((deadCapital / totalValuation) * 100).toFixed(1) : '0';
  const activeMaterialsCount = products.filter(p => p.status !== 'dead_stock').length;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Industrial Plants, Grain Silos & Port Logistics Showcase Slider */}
      <ShopGallerySlider onNavigateToCatalog={() => onNavigateTab('catalog')} />

      {/* ------------------------------------------------------------- */}
      {/* SECTION 1: INDUSTRIAL RAW MATERIALS & SILO METRICS (BDT ৳)   */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        
        {/* Metric 1: Plant Continuity Score */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Plant Resilience</span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-slate-900">{healthScore}</span>
            <span className="text-xs text-slate-500">/ 100</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
            <ArrowUpRight className="h-3 w-3" />
            <span>+{healthDelta}% vs 7-day run</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                healthScore >= 75 ? 'bg-emerald-500' : healthScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${healthScore}%` }}
            ></div>
          </div>
        </div>

        {/* Metric 2: Raw Materials & Silo SKUs */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Silo Raw Materials</span>
            <Factory className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-slate-900">{products.length}</span>
            <span className="text-xs text-slate-500">Feedstocks</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600">
            <span className="text-emerald-700 font-medium">{activeMaterialsCount} In-Production</span>
            <span className="text-amber-700 font-medium">{products.length - activeMaterialsCount} Obsolete</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-400">Flour, Feed, Oil & Rice Plants</div>
        </div>

        {/* Metric 3: Total Silo Raw Material Valuation (in BDT) */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Silo Stock Valuation</span>
            <span className="font-bold text-emerald-600">৳</span>
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold tracking-tight text-slate-900">{formatBDT(totalValuation, true)}</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Physical raw material & liquid bulk
          </div>
          <div className="mt-2 text-[10px] text-slate-400">Turnover: 8.4x/year</div>
        </div>

        {/* Metric 4: Dead Capital & Stagnant Yard Stock (in BDT) */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-amber-700">
            <span>Dead Capital</span>
            <TrendingDown className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold tracking-tight text-amber-700">{formatBDT(deadCapital, true)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600">
            <span className="text-amber-700 font-semibold">{deadCapitalPercentage}% of total</span>
            <span>60d+ idle store</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div 
              className="h-full bg-amber-500 rounded-full" 
              style={{ width: `${Math.min(100, Number(deadCapitalPercentage) * 2)}%` }}
            ></div>
          </div>
        </div>

        {/* Metric 5: High-Risk Silo Depletion */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-rose-600">
            <span>Plant Stoppage Risk</span>
            <ShieldAlert className="h-4 w-4 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-rose-600">{criticalCount}</span>
            <span className="text-xs text-rose-500 font-medium">Silos Critical</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-700">
            <AlertTriangle className="h-3 w-3 text-amber-600" />
            <span>{attentionCount} near buffer limit</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-400">Runway &lt; Vessel Port Lead Time</div>
        </div>

        {/* Metric 6: Avoided Plant Downtime Loss (in BDT) */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-emerald-700 font-medium">
            <span>Avoided Factory Loss</span>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold tracking-tight text-emerald-700">{formatBDT(avoidedLoss, true)}</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600">
            Protected Milling Margins
          </div>
          <div className="mt-2 text-[10px] text-emerald-700 font-medium">Forecast Accuracy: 96.8%</div>
        </div>

      </div>

      {/* Stock Timing Financial Impact & Risk Analysis */}
      <StockTimingImpactWidget 
        products={products}
        criticalCount={criticalCount}
        attentionCount={attentionCount}
        totalValuation={totalValuation}
      />

      {/* ------------------------------------------------------------- */}
      {/* INTERACTIVE VOICE COMMAND & INDUSTRIAL ZONE INTELLIGENCE CARD */}
      {/* ------------------------------------------------------------- */}
      {onOpenVoiceModal && (
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-5 text-white shadow-lg">
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none"></div>
          
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20 font-black">
                <Mic className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                    Industrial Voice AI Command Hub
                  </h3>
                  <span className="flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                    <Radio className="h-2.5 w-2.5 animate-pulse text-emerald-400" />
                    Speech-to-Speech Ready
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-300">
                  Ask about any Industrial Area by voice: Rezwan Silo Network, Chattogram Port Tank Terminal, Dinajpur Rice Mills, or Ishwardi Feed Plants. The AI speaks the answer back aloud!
                </p>

                {/* Quick 1-Click Voice Suggestion Pills */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={onOpenVoiceModal}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-[11px] font-medium text-slate-200 hover:border-emerald-500 hover:bg-slate-700 transition-all"
                  >
                    <Factory className="h-3 w-3 text-emerald-400" />
                    <span>"Tell me about Rezwan Industrial Zone"</span>
                  </button>
                  <button
                    onClick={onOpenVoiceModal}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-[11px] font-medium text-slate-200 hover:border-emerald-500 hover:bg-slate-700 transition-all"
                  >
                    <Ship className="h-3 w-3 text-blue-400" />
                    <span>"Chattogram Port Silos & Oil Tanks"</span>
                  </button>
                  <button
                    onClick={onOpenVoiceModal}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-[11px] font-medium text-slate-200 hover:border-emerald-500 hover:bg-slate-700 transition-all"
                  >
                    <Wheat className="h-3 w-3 text-amber-400" />
                    <span>"Dinajpur Paddy Reserve Runway"</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={onOpenVoiceModal}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-bold text-white hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-700/30 transition-all active:scale-95"
              >
                <Volume2 className="h-4 w-4" />
                <span>Launch Voice Assistant</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTION 2: INDUSTRIAL AI ACTION CENTER                        */}
      {/* ------------------------------------------------------------- */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        
        {/* Action Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Plant Decision & Bulk Replenishment Queue</h2>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                {actionQueue.filter(a => a.status === 'pending').length} Action Items
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Automated silo replenishment, vessel discharge allocations, and safety buffer adjustments based on factory run-rates.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
            <button
              onClick={() => setFilterSeverity('all')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                filterSeverity === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({actionQueue.length})
            </button>
            <button
              onClick={() => setFilterSeverity('urgent')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                filterSeverity === 'urgent' ? 'bg-rose-600 text-white shadow-xs' : 'text-rose-600 hover:bg-rose-50'
              }`}
            >
              Urgent ({actionQueue.filter(a => a.severity === 'urgent').length})
            </button>
            <button
              onClick={() => setFilterSeverity('attention')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                filterSeverity === 'attention' ? 'bg-amber-500 text-white shadow-xs' : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              Attention ({actionQueue.filter(a => a.severity === 'attention').length})
            </button>
          </div>
        </div>

        {/* Action Items List */}
        <div className="mt-4 space-y-3">
          {filteredActions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-500 dark:text-slate-400">
              No pending actions in this filter. All silo feedstock levels balanced!
            </div>
          ) : (
            filteredActions.map((action) => {
              const matchingProduct = products.find(p => p.id === action.productId);
              const isApproved = action.status === 'approved';
              const sku = action.sku || action.productSku;
              const reason = action.reasoning || action.description;
              const qty = action.suggestedQuantity || action.recommendedQuantity || 500;
              const prodImg = action.imageUrl || matchingProduct?.imageUrl;
              const unit = matchingProduct?.unitOfMeasure || 'MT';

              return (
                <div
                  key={action.id}
                  className={`flex flex-col justify-between gap-4 rounded-xl border p-4 transition-all lg:flex-row lg:items-center ${
                    isApproved
                      ? 'border-emerald-300 dark:border-emerald-700/60 bg-emerald-50/50 dark:bg-emerald-950/40 opacity-90'
                      : action.severity === 'urgent'
                      ? 'border-rose-300 dark:border-rose-700/60 bg-rose-50/50 dark:bg-rose-950/40 hover:border-rose-400'
                      : action.severity === 'attention'
                      ? 'border-amber-300 dark:border-amber-700/60 bg-amber-50/50 dark:bg-amber-950/40 hover:border-amber-400'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 hover:border-slate-300'
                  }`}
                >
                  {/* Left: Product Image & Action Details */}
                  <div className="flex items-start gap-3.5">
                    
                    {/* Material Picture Thumbnail */}
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xs">
                      {prodImg ? (
                        <img 
                          src={prodImg} 
                          alt={action.productName} 
                          className="h-full w-full object-cover" 
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-bold text-slate-400">
                          🏭
                        </div>
                      )}
                    </div>

                    {/* Action summary & SKU info */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            action.severity === 'urgent'
                              ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700'
                              : action.severity === 'attention'
                              ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700'
                              : 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700'
                          }`}
                        >
                          {action.severity}
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{action.productName}</span>
                        <span className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-300">({sku})</span>
                        
                        {isApproved && (
                          <span className="flex items-center gap-1 rounded bg-emerald-100 dark:bg-emerald-900/70 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" /> Approved & Synced
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{action.title}</p>
                      <p className="text-[11px] text-slate-700 dark:text-slate-200 leading-relaxed max-w-3xl">{reason}</p>

                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                        <span>Avoided Loss: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{formatBDT(action.avoidedLossEstimate)}</strong></span>
                        <span className="text-slate-400 dark:text-slate-500">•</span>
                        {matchingProduct && (
                          <span>Silo Level: <strong className="text-slate-900 dark:text-white font-bold">{matchingProduct.currentStock} {unit}</strong></span>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Right: Interactive Action Buttons */}
                  <div className="flex items-center gap-2 self-end lg:self-center">
                    <button
                      onClick={() => onOpenWhyModal(action)}
                      className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors shadow-xs"
                    >
                      Why?
                    </button>

                    {!isApproved ? (
                      <button
                        onClick={() => onApproveAction(action)}
                        className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-all ${
                          action.severity === 'urgent'
                            ? 'bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-500'
                            : action.severity === 'attention'
                            ? 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500'
                            : 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500'
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {action.actionType === 'adjust_buffer' || action.actionType === 'adjust_safety_stock'
                          ? `Set Buffer (${qty} ${unit})`
                          : action.actionType === 'liquidate' || action.actionType === 'launch_clearance'
                          ? 'Liquidate 25%'
                          : `Approve Bulk PO (${qty} ${unit})`}
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 px-2 py-1">
                        Active in PO Queue
                      </span>
                    )}

                    {matchingProduct && (
                      <button
                        onClick={() => onSelectProduct(matchingProduct)}
                        className="rounded-lg p-1.5 text-slate-400 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                        title="View Silo Details"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 3: HIGHEST RUN-RATE RAW MATERIALS & DEAD STOCK YARD   */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        
        {/* Highest Factory Run-Rate Materials */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Fastest Daily Factory Run-Rates</h3>
            </div>
            <button 
              onClick={() => onNavigateTab('forecasting')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700"
            >
              Forecast View &rarr;
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {products
              .filter(p => p.dailyDemand > 10)
              .sort((a, b) => b.dailyDemand - a.dailyDemand)
              .slice(0, 4)
              .map(p => {
                const daysRemaining = (p.currentStock / Math.max(0.1, p.dailyDemand)).toFixed(1);
                const unit = p.unitOfMeasure || 'MT';
                return (
                  <div
                    key={p.id}
                    onClick={() => onSelectProduct(p)}
                    className="flex items-center justify-between rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60 p-2.5 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/60 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Thumbnail */}
                      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" loading="lazy" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs">🏭</div>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">{p.name}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{p.sku} • {p.plantDivision || 'Plant'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{p.dailyDemand} {unit}/day</p>
                      <p className={`text-[10px] ${Number(daysRemaining) <= p.leadTimeDays ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                        {daysRemaining}d runway left
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Dead Stock & Stagnant Yard Items */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Dead Capital & Obsolete Yard Stock</h3>
            </div>
            <button 
              onClick={() => onNavigateTab('catalog')}
              className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-800"
            >
              Catalog View &rarr;
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {products
              .filter(p => p.status === 'dead_stock' || p.daysWithoutSale >= 15)
              .slice(0, 4)
              .map(p => {
                const lockedVal = p.currentStock * p.unitPrice;
                const unit = p.unitOfMeasure || 'units';
                return (
                  <div
                    key={p.id}
                    onClick={() => onSelectProduct(p)}
                    className="flex items-center justify-between rounded-lg border border-amber-200 dark:border-amber-700/60 bg-amber-50/50 dark:bg-amber-950/40 p-2.5 hover:border-amber-300 dark:hover:border-amber-600 hover:bg-amber-100/50 dark:hover:bg-amber-900/40 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Material Thumbnail */}
                      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-amber-200 dark:border-amber-700 bg-white dark:bg-slate-800">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" loading="lazy" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs">📦</div>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">{p.name}</p>
                        <p className="text-[10px] text-amber-700 dark:text-amber-300 font-medium">{p.daysWithoutSale} days idle in yard</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-amber-800 dark:text-amber-400">{formatBDT(lockedVal)}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{p.currentStock} {unit} locked</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

      </div>

    </div>
  );
};
