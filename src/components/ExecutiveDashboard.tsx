import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  ChevronRight, 
  DollarSign, 
  HelpCircle, 
  Package, 
  ShieldAlert, 
  ShieldCheck, 
  Sparkles, 
  TrendingDown, 
  TrendingUp, 
  Zap,
  ShoppingBag,
  ExternalLink,
  Flame,
  Clock,
  Percent,
  Layers
} from 'lucide-react';
import { AIActionItem, Product } from '../types';

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

  // Category breakdown calculations
  const categories = Array.from(new Set(products.map(p => p.category)));
  const categoryStats = categories.map(cat => {
    const catProds = products.filter(p => p.category === cat);
    const catVal = catProds.reduce((sum, p) => sum + p.currentStock * p.unitPrice, 0);
    const catCritical = catProds.filter(p => p.status === 'critical').length;
    return { category: cat, valuation: catVal, count: catProds.length, criticalCount: catCritical };
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* ------------------------------------------------------------- */}
      {/* SECTION 1: TOP METRIC CARDS                                    */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        
        {/* Metric 1: Health Score */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/70 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Health Score</span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-white">{healthScore}</span>
            <span className="text-xs font-semibold text-slate-400">/ 100</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-400">
            <ArrowUpRight className="h-3 w-3" />
            <span>+{healthDelta}% vs 7-day avg</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                healthScore >= 75 ? 'bg-emerald-500' : healthScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${healthScore}%` }}
            ></div>
          </div>
        </div>

        {/* Metric 2: Total SKUs & Active */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/70 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Catalog</span>
            <Package className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-white">{products.length}</span>
            <span className="text-xs text-slate-400">SKUs</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span className="text-emerald-400 font-medium">{activeSkusCount} Active</span>
            <span className="text-amber-400 font-medium">{products.length - activeSkusCount} Stagnant</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500">Across 5 retail categories</div>
        </div>

        {/* Metric 3: Total Asset Valuation */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/70 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Inventory Valuation</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold tracking-tight text-white">${totalValuation.toLocaleString()}</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Total on-hand wholesale & retail basis
          </div>
          <div className="mt-2 text-[10px] text-slate-500">Avg Turnover: 4.8x/yr</div>
        </div>

        {/* Metric 4: Dead Capital Locked */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/70 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-amber-400">
            <span>Dead Capital</span>
            <TrendingDown className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold tracking-tight text-amber-300">${deadCapital.toLocaleString()}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span className="text-amber-400 font-semibold">{deadCapitalPercentage}% of total</span>
            <span>28d+ inactivity</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div 
              className="h-full bg-amber-500 rounded-full" 
              style={{ width: `${Math.min(100, Number(deadCapitalPercentage) * 2)}%` }}
            ></div>
          </div>
        </div>

        {/* Metric 5: High-Risk Stockouts */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/70 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Stockout Risk</span>
            <ShieldAlert className="h-4 w-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-rose-400">{criticalCount}</span>
            <span className="text-xs text-rose-400/80">Critical</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-400">
            <AlertTriangle className="h-3 w-3" />
            <span>{attentionCount} needing attention</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500">Days to stockout &lt; Lead time</div>
        </div>

        {/* Metric 6: Avoided Stockout Loss */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-medium">
            <span>Avoided Stockout Loss</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold tracking-tight text-emerald-300">${avoidedLoss.toLocaleString()}</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400/80">
            Forecast Accuracy: <span className="font-semibold text-emerald-300">94.2%</span>
          </div>
          <div className="mt-2 text-[10px] text-emerald-500/80">Protected by StockMind AI</div>
        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 2: AI ACTION CENTER (PRIORITIZED QUEUE)               */}
      {/* ------------------------------------------------------------- */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md">
        
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">AI Action Center — Prioritized Decision Queue</h2>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Human-in-the-Loop decision recommendations generated by real-time risk, lead time, and dead-stock algorithms.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950/60 p-1">
            <button
              onClick={() => setFilterSeverity('all')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                filterSeverity === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({actionQueue.length})
            </button>
            <button
              onClick={() => setFilterSeverity('urgent')}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                filterSeverity === 'urgent' ? 'bg-rose-600 text-white' : 'text-rose-400 hover:bg-rose-950/40'
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400"></span>
              Urgent ({actionQueue.filter(a => a.severity === 'urgent').length})
            </button>
            <button
              onClick={() => setFilterSeverity('attention')}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                filterSeverity === 'attention' ? 'bg-amber-600 text-white' : 'text-amber-400 hover:bg-amber-950/40'
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
              Attention ({actionQueue.filter(a => a.severity === 'attention').length})
            </button>
            <button
              onClick={() => setFilterSeverity('optimize')}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                filterSeverity === 'optimize' ? 'bg-blue-600 text-white' : 'text-blue-400 hover:bg-blue-950/40'
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
              Optimize ({actionQueue.filter(a => a.severity === 'optimize').length})
            </button>
          </div>
        </div>

        {/* Action Cards Queue */}
        <div className="mt-6 space-y-3.5">
          {filteredActions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-xs text-slate-500">
              No pending actions in this category. All systems optimized!
            </div>
          ) : (
            filteredActions.map((action) => {
              const matchingProduct = products.find(p => p.id === action.productId);
              const isApproved = action.status === 'approved';

              return (
                <div
                  key={action.id}
                  className={`group relative flex flex-col justify-between gap-4 rounded-xl border p-4.5 transition-all lg:flex-row lg:items-center ${
                    isApproved
                      ? 'border-emerald-500/30 bg-emerald-950/10 opacity-75'
                      : action.severity === 'urgent'
                      ? 'border-rose-500/30 bg-gradient-to-r from-rose-950/20 via-slate-900 to-slate-900 hover:border-rose-500/50'
                      : action.severity === 'attention'
                      ? 'border-amber-500/30 bg-gradient-to-r from-amber-950/20 via-slate-900 to-slate-900 hover:border-amber-500/50'
                      : 'border-blue-500/30 bg-gradient-to-r from-blue-950/20 via-slate-900 to-slate-900 hover:border-blue-500/50'
                  }`}
                >
                  {/* Left content */}
                  <div className="flex items-start gap-3.5">
                    {/* Severity Icon Indicator */}
                    <div className="mt-0.5">
                      {action.severity === 'urgent' ? (
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400">
                          <Flame className="h-4 w-4" />
                        </div>
                      ) : action.severity === 'attention' ? (
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                          <Percent className="h-4 w-4" />
                        </div>
                      )}
                    </div>

                    {/* Text & SKU */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            action.severity === 'urgent'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : action.severity === 'attention'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          }`}
                        >
                          {action.severity}
                        </span>
                        <span className="text-xs font-mono font-medium text-slate-400">{action.productSku}</span>
                        <span className="text-xs font-semibold text-white">{action.productName}</span>
                        
                        {isApproved && (
                          <span className="flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/40">
                            <CheckCircle2 className="h-3 w-3" /> Approved & Tracked
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-medium text-slate-200">{action.title}</p>
                      <p className="text-[11px] text-slate-400 leading-relaxed max-w-2xl">{action.description}</p>

                      <div className="flex items-center gap-4 pt-1 text-[11px] text-slate-400">
                        <span>Avoided Loss: <strong className="text-emerald-400">${action.avoidedLossEstimate.toLocaleString()}</strong></span>
                        <span>•</span>
                        <span>Risk Index: <strong className={action.riskScore >= 75 ? 'text-rose-400' : 'text-amber-400'}>{action.riskScore}/100</strong></span>
                        {matchingProduct && (
                          <>
                            <span>•</span>
                            <span>Stock on hand: <strong className="text-slate-200">{matchingProduct.currentStock} units</strong></span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-2 self-end lg:self-center">
                    
                    {/* View Reason / Explainable AI Button */}
                    <button
                      onClick={() => onOpenWhyModal(action)}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 transition-all hover:bg-slate-700 hover:text-white"
                    >
                      <HelpCircle className="h-3.5 w-3.5 text-indigo-400" />
                      Why? / View Reason
                    </button>

                    {/* Human-in-the-Loop Approval Action */}
                    {!isApproved ? (
                      <button
                        onClick={() => onApproveAction(action)}
                        className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all ${
                          action.severity === 'urgent'
                            ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
                            : action.severity === 'attention'
                            ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20'
                            : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {action.actionType === 'approve_reorder'
                          ? `Approve Reorder (${action.recommendedQuantity} units)`
                          : action.actionType === 'adjust_safety_stock'
                          ? `Adjust Buffer (${action.recommendedSafetyStock} units)`
                          : `Launch ${action.discountPercent}% Clearance`}
                      </button>
                    ) : (
                      <div className="text-xs font-medium text-emerald-400 px-2 py-1">
                        Action Active in PO Queue
                      </div>
                    )}

                    {/* Drill-down link */}
                    {matchingProduct && (
                      <button
                        onClick={() => onSelectProduct(matchingProduct)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                        title="SKU Deep Dive"
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
      {/* SECTION 3: CATEGORY HEALTH & QUICK VELOCITY MATRIX            */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Category Breakdown Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Portfolio Category Health</h3>
            <span className="text-xs text-slate-400">Valuation Share</span>
          </div>
          <div className="mt-4 space-y-3.5">
            {categoryStats.map((item) => {
              const pct = totalValuation > 0 ? (item.valuation / totalValuation) * 100 : 0;
              return (
                <div key={item.category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-200">{item.category}</span>
                    <div className="flex items-center gap-2">
                      {item.criticalCount > 0 && (
                        <span className="rounded bg-rose-500/20 px-1.5 py-0.2 text-[10px] text-rose-400 border border-rose-500/30">
                          {item.criticalCount} at risk
                        </span>
                      )}
                      <span className="font-semibold text-slate-300">${item.valuation.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-500">({pct.toFixed(0)}%)</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        item.criticalCount > 0 ? 'bg-amber-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Velocity Movers */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Fastest Velocity SKUs</h3>
            </div>
            <button 
              onClick={() => onNavigateTab('forecasting')}
              className="text-xs text-indigo-400 hover:text-indigo-300"
            >
              Forecast &rarr;
            </button>
          </div>
          <div className="mt-4 space-y-2.5">
            {products
              .filter(p => p.dailyDemand > 5)
              .sort((a, b) => b.dailyDemand - a.dailyDemand)
              .slice(0, 4)
              .map(p => {
                const daysRemaining = (p.currentStock / Math.max(0.1, p.dailyDemand)).toFixed(1);
                return (
                  <div
                    key={p.id}
                    onClick={() => onSelectProduct(p)}
                    className="flex items-center justify-between rounded-lg border border-slate-800/60 bg-slate-950/40 p-2.5 transition-all hover:border-slate-700 hover:bg-slate-800/40 cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-semibold text-white">{p.name}</p>
                      <p className="text-[10px] text-slate-400">{p.sku} • {p.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-emerald-400">{p.dailyDemand} /day</p>
                      <p className={`text-[10px] ${Number(daysRemaining) <= p.leadTimeDays ? 'text-rose-400 font-semibold' : 'text-slate-400'}`}>
                        {daysRemaining}d stock left
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Stagnant / Dead Capital Recovery */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Dead Capital Recovery</h3>
            </div>
            <button 
              onClick={() => onNavigateTab('catalog')}
              className="text-xs text-amber-400 hover:text-amber-300"
            >
              Catalog &rarr;
            </button>
          </div>
          <div className="mt-4 space-y-2.5">
            {products
              .filter(p => p.status === 'dead_stock' || p.daysWithoutSale >= 20)
              .slice(0, 4)
              .map(p => {
                const lockedVal = p.currentStock * p.unitPrice;
                return (
                  <div
                    key={p.id}
                    onClick={() => onSelectProduct(p)}
                    className="flex items-center justify-between rounded-lg border border-amber-500/20 bg-amber-950/10 p-2.5 transition-all hover:border-amber-500/40 hover:bg-amber-950/20 cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-semibold text-amber-200">{p.name}</p>
                      <p className="text-[10px] text-amber-400/80">{p.daysWithoutSale} days with 0 sales</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-amber-300">${lockedVal.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400">{p.currentStock} units idle</p>
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
