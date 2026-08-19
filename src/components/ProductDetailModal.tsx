import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  ShieldAlert, 
  ShieldCheck, 
  DollarSign, 
  Package, 
  Building, 
  CheckCircle2, 
  ShoppingCart,
  Zap,
  Info
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Product, Supplier } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  suppliers: Supplier[];
  onClose: () => void;
  onOpenReorder: (product: Product) => void;
  onOpenRecordSale: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  suppliers,
  onClose,
  onOpenReorder,
  onOpenRecordSale,
}) => {
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);

  useEffect(() => {
    if (!product) return;

    let isMounted = true;
    setIsLoadingAI(true);

    fetch('/api/ai/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product, actionType: 'SKU Deep Dive Diagnostic' }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setAiAnalysis(data.analysis);
          setIsLoadingAI(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoadingAI(false);
      });

    return () => {
      isMounted = false;
    };
  }, [product]);

  if (!product) return null;

  const daysToStockout = (product.currentStock / Math.max(0.1, product.dailyDemand)).toFixed(1);
  const isCritical = product.status === 'critical';
  const isDeadStock = product.status === 'dead_stock';
  const matchedSuppliers = suppliers.filter(s => product.supplierIds.includes(s.id));
  const totalValuation = product.currentStock * product.unitPrice;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-fadeIn">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-950/95 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{product.name}</h3>
                <span className="font-mono text-xs text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  {product.sku}
                </span>
                <span className="text-xs text-slate-400">• {product.category}</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Stock Velocity & Explainable AI Decision Breakdown</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Top Metric Bar */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <span className="text-[11px] text-slate-400">On-Hand Stock</span>
              <div className="mt-1 text-xl font-bold text-white">{product.currentStock} units</div>
              <span className="text-[10px] text-slate-500">Buffer: {product.safetyStock}</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <span className="text-[11px] text-slate-400">Daily Demand Run-Rate</span>
              <div className="mt-1 text-xl font-bold text-emerald-400">{product.dailyDemand} u/day</div>
              <span className="text-[10px] text-slate-500">Trend: {product.demandTrend > 0 ? '+' : ''}{product.demandTrend}%</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <span className="text-[11px] text-slate-400">Days to Depletion</span>
              <div className={`mt-1 text-xl font-bold ${isCritical ? 'text-rose-400' : 'text-slate-200'}`}>
                {isDeadStock ? 'Stagnant (0 sales)' : `${daysToStockout} Days`}
              </div>
              <span className="text-[10px] text-slate-500">Lead time: {product.leadTimeDays}d</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <span className="text-[11px] text-slate-400">Total Asset Valuation</span>
              <div className="mt-1 text-xl font-bold text-indigo-400">${totalValuation.toLocaleString()}</div>
              <span className="text-[10px] text-slate-500">Retail: ${product.unitPrice}/u</span>
            </div>

          </div>

          {/* Explainable AI Diagnosis Box (4 Bullet Points) */}
          <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/30 via-slate-900 to-slate-900 p-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-indigo-500/20">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                  Explainable AI Operational Diagnosis
                </h4>
              </div>
              <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
                Risk Score: {product.riskScore}/100
              </span>
            </div>

            {isLoadingAI ? (
              <div className="py-6 text-center text-xs text-indigo-300 animate-pulse">
                Running StockMind Decision Intelligence model on {product.sku}...
              </div>
            ) : aiAnalysis ? (
              <div className="mt-4 space-y-3 text-xs">
                
                {/* 1. Summary */}
                <p className="text-slate-200 font-medium leading-relaxed">
                  {aiAnalysis.summary}
                </p>

                {/* 2. Root Cause Breakdown */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <span className="font-bold text-indigo-300">Root Cause Diagnostics:</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    {aiAnalysis.rootCauses?.map((cause: string, i: number) => (
                      <li key={i} className="text-[11px]">{cause}</li>
                    ))}
                  </ul>
                </div>

                {/* 3. Quantitative Trade-off */}
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="font-bold text-indigo-300">Financial Trade-off: </span>
                  <span className="text-slate-300 text-[11px]">{aiAnalysis.financialImpact}</span>
                </div>

                {/* 4. Recommended Action & Supplier Tip */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-2 border-t border-slate-800/80">
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-2.5">
                    <span className="font-bold text-emerald-400 text-[11px]">Recommended Action:</span>
                    <p className="text-slate-300 text-[11px] mt-0.5">{aiAnalysis.recommendedAction}</p>
                  </div>

                  <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-2.5">
                    <span className="font-bold text-indigo-400 text-[11px]">Vendor Routing Tip:</span>
                    <p className="text-slate-300 text-[11px] mt-0.5">{aiAnalysis.supplierTip}</p>
                  </div>
                </div>

              </div>
            ) : null}
          </div>

          {/* 30-Day Historical Sales Velocity Mini Chart */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-xs font-bold text-slate-200">30-Day Daily Sales Consumption History</h4>
              <span className="text-[11px] text-slate-400">Avg: {product.dailyDemand} units/day</span>
            </div>

            <div className="mt-3 h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={product.salesHistory.slice(-30)} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="productHistoryGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickFormatter={(v) => v.slice(5)} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border border-slate-700 bg-slate-950 p-2 text-xs">
                            <p className="text-slate-400">{label}</p>
                            <p className="font-bold text-indigo-400">{payload[0]?.value} units sold</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={2} fill="url(#productHistoryGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Supplier Directory for this SKU */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Approved Suppliers ({matchedSuppliers.length})</h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {matchedSuppliers.map((s) => (
                <div key={s.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-white">{s.name}</span>
                    <p className="text-[11px] text-slate-400">{s.location}</p>
                    <p className="text-[10px] text-emerald-400 mt-1">Reliability: {s.reliability}% • Lead Time: {s.baseLeadTime}d</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-200">${(product.costPrice * s.unitCostMarkup).toFixed(2)}/u</span>
                    <p className="text-[10px] text-slate-500">MOQ: {s.minOrderQty}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-slate-800 bg-slate-950/95 px-6 py-4 backdrop-blur-md">
          <button
            onClick={() => {
              onClose();
              onOpenRecordSale(product);
            }}
            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white"
          >
            Record Customer Sale
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenReorder(product);
            }}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/30"
          >
            Open Smart Reorder Matrix &rarr;
          </button>
        </div>

      </div>
    </div>
  );
};
