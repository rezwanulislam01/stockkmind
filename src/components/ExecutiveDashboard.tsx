import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ArrowUpRight, 
  CheckCircle2, 
  ChevronRight, 
  Package, 
  ShieldAlert, 
  ShieldCheck, 
  Sparkles, 
  TrendingDown, 
  TrendingUp
} from 'lucide-react';
import { AIActionItem, Product } from '../types';
import { formatBDT } from '../utils/forecasting';

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
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'urgent' | 'attention' | 'optimize'>('all');

  const filteredActions = actionQueue.filter((action) => {
    if (filterSeverity === 'all') return true;
    return action.severity === filterSeverity;
  });

  const deadCapitalPercentage = totalValuation > 0 ? ((deadCapital / totalValuation) * 100).toFixed(1) : '0';
  const activeSkusCount = products.filter(p => p.status !== 'dead_stock').length;

  return (
    <div className="space-y-6 pb-12">
      
      {/* ------------------------------------------------------------- */}
      {/* SECTION 1: CLEAN TOP METRICS (BDT ৳)                          */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        
        {/* Metric 1: Health Score */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Health Score</span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-slate-900">{healthScore}</span>
            <span className="text-xs text-slate-500">/ 100</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
            <ArrowUpRight className="h-3 w-3" />
            <span>+{healthDelta}% vs 7-day</span>
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

        {/* Metric 2: Total SKUs & Active */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Catalog</span>
            <Package className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-slate-900">{products.length}</span>
            <span className="text-xs text-slate-500">SKUs</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600">
            <span className="text-emerald-700 font-medium">{activeSkusCount} Active</span>
            <span className="text-amber-700 font-medium">{products.length - activeSkusCount} Idle</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-400">5 Bangladesh retail sectors</div>
        </div>

        {/* Metric 3: Total Asset Valuation (in BDT) */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Inventory Valuation</span>
            <span className="font-bold text-emerald-600">৳</span>
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold tracking-tight text-slate-900">{formatBDT(totalValuation)}</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Current wholesale stock value
          </div>
          <div className="mt-2 text-[10px] text-slate-400">Turnover: 5.2x/year</div>
        </div>

        {/* Metric 4: Dead Capital Locked (in BDT) */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-amber-700">
            <span>Dead Capital</span>
            <TrendingDown className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold tracking-tight text-amber-700">{formatBDT(deadCapital)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600">
            <span className="text-amber-700 font-semibold">{deadCapitalPercentage}% of total</span>
            <span>30d+ idle</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div 
              className="h-full bg-amber-500 rounded-full" 
              style={{ width: `${Math.min(100, Number(deadCapitalPercentage) * 2)}%` }}
            ></div>
          </div>
        </div>

        {/* Metric 5: High-Risk Stockouts */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-rose-600">
            <span>Stockout Risk</span>
            <ShieldAlert className="h-4 w-4 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-rose-600">{criticalCount}</span>
            <span className="text-xs text-rose-500 font-medium">Critical</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-700">
            <AlertTriangle className="h-3 w-3 text-amber-600" />
            <span>{attentionCount} needing attention</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-400">Days to stockout &lt; Lead time</div>
        </div>

        {/* Metric 6: Avoided Stockout Loss (in BDT) */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-emerald-700 font-medium">
            <span>Avoided Stockout Loss</span>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold tracking-tight text-emerald-700">{formatBDT(avoidedLoss)}</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600">
            Protected Revenue
          </div>
          <div className="mt-2 text-[10px] text-emerald-700 font-medium">Forecast Accuracy: 95.4%</div>
        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 2: SIMPLIFIED AI ACTION CENTER                        */}
      {/* ------------------------------------------------------------- */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        
        {/* Action Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900 tracking-tight">AI Decision Action Center</h2>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                {actionQueue.filter(a => a.status === 'pending').length} Pending Decisions
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Automated reorder triggers and buffer adjustments calculated from real-time sales velocity.
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
            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500">
              No pending actions in this filter. All inventory balanced!
            </div>
          ) : (
            filteredActions.map((action) => {
              const matchingProduct = products.find(p => p.id === action.productId);
              const isApproved = action.status === 'approved';
              const sku = action.sku || action.productSku;
              const reason = action.reasoning || action.description;
              const qty = action.suggestedQuantity || action.recommendedQuantity || 50;

              return (
                <div
                  key={action.id}
                  className={`flex flex-col justify-between gap-3 rounded-xl border p-4 transition-all lg:flex-row lg:items-center ${
                    isApproved
                      ? 'border-emerald-200 bg-emerald-50/40 opacity-80'
                      : action.severity === 'urgent'
                      ? 'border-rose-200 bg-rose-50/40 hover:border-rose-300'
                      : action.severity === 'attention'
                      ? 'border-amber-200 bg-amber-50/40 hover:border-amber-300'
                      : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                  }`}
                >
                  {/* Left: Action summary & SKU info */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          action.severity === 'urgent'
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : action.severity === 'attention'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                        }`}
                      >
                        {action.severity}
                      </span>
                      <span className="text-xs font-semibold text-slate-900">{action.productName}</span>
                      <span className="text-[11px] font-mono text-slate-500">({sku})</span>
                      
                      {isApproved && (
                        <span className="flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Approved & Synced
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-semibold text-slate-800">{action.title}</p>
                    <p className="text-[11px] text-slate-600 leading-relaxed max-w-3xl">{reason}</p>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500">
                      <span>Avoided Loss: <strong className="text-emerald-700">{formatBDT(action.avoidedLossEstimate)}</strong></span>
                      <span>•</span>
                      {matchingProduct && (
                        <span>Stock on Hand: <strong className="text-slate-800">{matchingProduct.currentStock} units</strong></span>
                      )}
                    </div>
                  </div>

                  {/* Right: Interactive Action Buttons */}
                  <div className="flex items-center gap-2 self-end lg:self-center">
                    <button
                      onClick={() => onOpenWhyModal(action)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-xs"
                    >
                      Why?
                    </button>

                    {!isApproved ? (
                      <button
                        onClick={() => onApproveAction(action)}
                        className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-all ${
                          action.severity === 'urgent'
                            ? 'bg-rose-600 hover:bg-rose-700'
                            : action.severity === 'attention'
                            ? 'bg-amber-600 hover:bg-amber-700'
                            : 'bg-emerald-600 hover:bg-emerald-700'
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {action.actionType === 'adjust_buffer' || action.actionType === 'adjust_safety_stock'
                          ? `Set Buffer (${qty} units)`
                          : action.actionType === 'liquidate' || action.actionType === 'launch_clearance'
                          ? 'Discount 30%'
                          : `Approve Reorder (${qty} units)`}
                      </button>
                    ) : (
                      <span className="text-xs font-medium text-emerald-700 px-2 py-1">
                        Active in PO Queue
                      </span>
                    )}

                    {matchingProduct && (
                      <button
                        onClick={() => onSelectProduct(matchingProduct)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
                        title="View SKU Details"
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
      {/* SECTION 3: FASTEST MOVERS & DEAD STOCK RECOVERY                */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        
        {/* Fastest Movers (High Daily Demand) */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Fastest Daily Velocity SKUs</h3>
            </div>
            <button 
              onClick={() => onNavigateTab('forecasting')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Forecast View &rarr;
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {products
              .filter(p => p.dailyDemand > 3)
              .sort((a, b) => b.dailyDemand - a.dailyDemand)
              .slice(0, 4)
              .map(p => {
                const daysRemaining = (p.currentStock / Math.max(0.1, p.dailyDemand)).toFixed(1);
                return (
                  <div
                    key={p.id}
                    onClick={() => onSelectProduct(p)}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 hover:border-slate-300 hover:bg-slate-100/60 cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{p.name}</p>
                      <p className="text-[10px] text-slate-500">{p.sku} • {formatBDT(p.unitPrice)}/unit</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-emerald-700">{p.dailyDemand} units/day</p>
                      <p className={`text-[10px] ${Number(daysRemaining) <= p.leadTimeDays ? 'text-rose-600 font-semibold' : 'text-slate-500'}`}>
                        {daysRemaining}d stock left
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Dead Stock & Stagnant Items */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-amber-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Dead Stock Capital Recovery</h3>
            </div>
            <button 
              onClick={() => onNavigateTab('catalog')}
              className="text-xs font-semibold text-amber-700 hover:text-amber-800"
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
                return (
                  <div
                    key={p.id}
                    onClick={() => onSelectProduct(p)}
                    className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50/50 p-2.5 hover:border-amber-300 hover:bg-amber-100/50 cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{p.name}</p>
                      <p className="text-[10px] text-amber-700">{p.daysWithoutSale} days with 0 sales</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-amber-800">{formatBDT(lockedVal)}</p>
                      <p className="text-[10px] text-slate-500">{p.currentStock} units locked</p>
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
