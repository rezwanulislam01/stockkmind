import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Factory,
  Layers,
  MapPin
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
import { formatBDT } from '../utils/forecasting';

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
      body: JSON.stringify({ product, actionType: 'Industrial Feedstock Silo Diagnostics' }),
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

  const unit = product.unitOfMeasure || 'MT';
  const daysToStockout = (product.currentStock / Math.max(0.1, product.dailyDemand)).toFixed(1);
  const isCritical = product.status === 'critical';
  const isDeadStock = product.status === 'dead_stock';
  const matchedSuppliers = suppliers.filter(s => (product.supplierIds || []).includes(s.id));
  const totalValuation = product.currentStock * product.unitPrice;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
        
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-6 py-4 backdrop-blur-xs">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xs">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <Factory className="h-6 w-6" />
                </div>
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{product.name}</h3>
                <span className="font-mono text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  {product.sku}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">• {product.plantDivision || 'Rezwan Industrial Zone Plant'}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Location: {product.storageLocation || 'Central Silo Storage'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {/* Top Metric Bar */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-xs">
              <span className="text-[11px] text-slate-500">Physical Silo Stock</span>
              <div className="mt-1 text-lg font-bold text-slate-900">{product.currentStock} {unit}</div>
              <span className="text-[10px] text-slate-500">Buffer: {product.safetyStock} {unit}</span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-xs">
              <span className="text-[11px] text-slate-500">Daily Factory Run-Rate</span>
              <div className="mt-1 text-lg font-bold text-emerald-700">{product.dailyDemand} {unit}/day</div>
              <span className="text-[10px] text-slate-500">Trend: {product.demandTrend > 0 ? '+' : ''}{product.demandTrend}%</span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-xs">
              <span className="text-[11px] text-slate-500">Silo Runway</span>
              <div className={`mt-1 text-lg font-bold ${isCritical ? 'text-rose-600' : 'text-slate-900'}`}>
                {isDeadStock ? 'Stagnant (0 run-rate)' : `${daysToStockout} Days`}
              </div>
              <span className="text-[10px] text-slate-500">Port Lead: {product.leadTimeDays}d</span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-xs">
              <span className="text-[11px] text-slate-500">Silo Inventory Value</span>
              <div className="mt-1 text-lg font-bold text-emerald-700">{formatBDT(totalValuation, true)}</div>
              <span className="text-[10px] text-slate-500">Unit: {formatBDT(product.unitPrice, true)}/{unit}</span>
            </div>

          </div>

          {/* Explainable AI Diagnosis Box */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-xs">
            <div className="flex items-center justify-between pb-2.5 border-b border-emerald-200">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                  Industrial AI Feedstock Intelligence
                </h4>
              </div>
              <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                Resilience Index: {100 - product.riskScore}/100
              </span>
            </div>

            {isLoadingAI ? (
              <div className="py-4 text-center text-xs text-emerald-800 animate-pulse">
                Running StockMind Industrial Forecasting model on {product.sku}...
              </div>
            ) : aiAnalysis ? (
              <div className="mt-3 space-y-2.5 text-xs">
                <p className="text-slate-800 font-medium leading-relaxed">
                  {aiAnalysis.summary}
                </p>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 pt-2 border-t border-emerald-200">
                  <div className="rounded-lg border border-emerald-200 bg-white p-2.5 shadow-xs">
                    <span className="font-bold text-emerald-800 text-[11px]">Factory Replenishment Directive:</span>
                    <p className="text-slate-700 text-[11px] mt-0.5">{aiAnalysis.recommendedAction}</p>
                  </div>

                  <div className="rounded-lg border border-indigo-200 bg-white p-2.5 shadow-xs">
                    <span className="font-bold text-indigo-700 text-[11px]">Vessel & Port Logistics Tip:</span>
                    <p className="text-slate-700 text-[11px] mt-0.5">{aiAnalysis.supplierTip}</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* 30-Day Historical Factory Consumption Chart */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-xs font-bold text-slate-900">30-Day Daily Factory Consumption History</h4>
              <span className="text-[11px] text-slate-500">Average: {product.dailyDemand} {unit}/day</span>
            </div>

            <div className="mt-3 h-[160px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={product.salesHistory.slice(-30)} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="productHistoryGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickFormatter={(v) => v.slice(5)} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border border-slate-200 bg-white p-2 text-xs shadow-md">
                            <p className="text-slate-500">{label}</p>
                            <p className="font-bold text-emerald-700">{payload[0]?.value} {unit} consumed in milling</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#047857" strokeWidth={2} fill="url(#productHistoryGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Approved Bulk Feedstock Vendors / Port Terminals */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Approved Bulk Feedstock Vendors & Port Logistics ({matchedSuppliers.length})</h4>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {matchedSuppliers.map((s) => (
                <div key={s.id} className="rounded-lg border border-slate-200 bg-slate-50/80 p-2.5 text-xs flex justify-between items-center shadow-xs">
                  <div>
                    <span className="font-semibold text-slate-900">{s.name}</span>
                    <p className="text-[10px] text-slate-500">{s.location}</p>
                    <p className="text-[10px] text-emerald-700 mt-0.5">Reliability: {s.reliability}% • Port Transit: {s.baseLeadTime}d</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">{formatBDT(Math.round(product.costPrice * s.unitCostMarkup), true)}/{unit}</span>
                    <p className="text-[10px] text-slate-500">MOQ: {s.minOrderQty} {unit}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="sticky bottom-0 flex items-center justify-end gap-2.5 border-t border-slate-100 bg-white/95 px-6 py-3.5 backdrop-blur-xs">
          <button
            onClick={() => {
              onClose();
              onOpenRecordSale(product);
            }}
            className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-xs"
          >
            Issue to Production (কাঁচামাল ছাড়)
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenReorder(product);
            }}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 shadow-xs"
          >
            Raise Bulk Purchase Order (EOQ) &rarr;
          </button>
        </div>

      </div>
    </div>
  );
};
