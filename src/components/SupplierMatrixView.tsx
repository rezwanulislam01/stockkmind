import React, { useState } from 'react';
import { 
  ShoppingCart, 
  ShieldCheck, 
  Clock, 
  DollarSign, 
  Star, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  ChevronDown,
  Building,
  Truck,
  Plus
} from 'lucide-react';
import { Product, PurchaseOrder, Supplier } from '../types';
import { calculateEOQ, calculateSafetyStockAndROP } from '../utils/forecasting';
import confetti from 'canvas-confetti';

interface SupplierMatrixViewProps {
  products: Product[];
  suppliers: Supplier[];
  selectedProduct: Product | null;
  onSelectProduct: (product: Product) => void;
  onCreatePurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'poNumber' | 'createdAt'>) => void;
}

export const SupplierMatrixView: React.FC<SupplierMatrixViewProps> = ({
  products,
  suppliers,
  selectedProduct,
  onSelectProduct,
  onCreatePurchaseOrder,
}) => {
  const currentProduct = selectedProduct || products[0] || null;
  const [customQty, setCustomQty] = useState<number | null>(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [isExpedited, setIsExpedited] = useState<boolean>(false);
  const [poSuccessMessage, setPoSuccessMessage] = useState<string | null>(null);

  if (!currentProduct) {
    return <div className="p-8 text-center text-slate-400">No product selected for supplier evaluation.</div>;
  }

  // Multi-suppliers for this SKU
  const availableSuppliers = suppliers.filter(s => currentProduct.supplierIds.includes(s.id));
  const activeOrderQty = customQty !== null ? customQty : currentProduct.eoq;
  const daysToStockout = Number((currentProduct.currentStock / Math.max(0.1, currentProduct.dailyDemand)).toFixed(1));
  const isCriticalStockout = currentProduct.riskScore >= 75 || daysToStockout <= currentProduct.leadTimeDays;

  // Determine AI recommended supplier
  // If critical stockout, prioritize shortest lead time (SwiftLogistics / expedited)
  // Else prioritize best reliability and lower cost
  let recommendedSupplier = availableSuppliers[0];
  let aiReason = "";

  if (isCriticalStockout) {
    // Find fastest supplier
    const fastest = [...availableSuppliers].sort((a, b) => a.expeditedLeadTime - b.expeditedLeadTime)[0];
    if (fastest) {
      recommendedSupplier = fastest;
      aiReason = `${fastest.name} is recommended over others despite a small price premium because current stockout risk is critical (${daysToStockout} days remaining vs ${fastest.expeditedLeadTime}d expedited transit), preventing an active stockout gap.`;
    }
  } else {
    // Standard cost & reliability optimization
    const optimal = [...availableSuppliers].sort((a, b) => (b.reliability - a.unitCostMarkup * 10) - (a.reliability - b.unitCostMarkup * 10))[0];
    if (optimal) {
      recommendedSupplier = optimal;
      aiReason = `${optimal.name} is recommended for optimal balance of 98%+ delivery reliability and competitive wholesale unit pricing.`;
    }
  }

  const effectiveSelectedSupplier = availableSuppliers.find(s => s.id === (selectedSupplierId || recommendedSupplier?.id)) || recommendedSupplier;

  const handleCreatePO = (supplier: Supplier, qty: number) => {
    const unitCost = Number((currentProduct.costPrice * (isExpedited ? supplier.unitCostMarkup * 1.05 : supplier.unitCostMarkup)).toFixed(2));
    const totalCost = Number((unitCost * qty).toFixed(2));
    const transitDays = isExpedited ? supplier.expeditedLeadTime : supplier.baseLeadTime;
    
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + transitDays);

    onCreatePurchaseOrder({
      productId: currentProduct.id,
      productName: currentProduct.name,
      productSku: currentProduct.sku,
      supplierId: supplier.id,
      supplierName: supplier.name,
      quantity: qty,
      unitCost,
      totalCost,
      status: 'submitted',
      expectedDeliveryDate: deliveryDate.toISOString().split('T')[0],
      aiRecommendationReason: aiReason,
    });

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch (e) {}

    setPoSuccessMessage(`Purchase Order for ${qty} units of ${currentProduct.name} generated successfully!`);
    setTimeout(() => setPoSuccessMessage(null), 5000);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Product Switcher */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
              <ShoppingCart className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">Smart Reorder & Multi-Supplier Decision Matrix</h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Automated Economic Order Quantity (EOQ), dynamic buffer calculations, and multi-vendor trade-off optimization.
          </p>
        </div>

        {/* SKU Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-slate-400">Evaluate SKU:</label>
          <div className="relative">
            <select
              value={currentProduct.id}
              onChange={(e) => {
                const found = products.find(p => p.id === e.target.value);
                if (found) onSelectProduct(found);
              }}
              className="appearance-none rounded-xl border border-slate-700 bg-slate-800/90 py-2 pl-3 pr-9 text-xs font-semibold text-white transition-all hover:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-slate-100">
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
          </div>
        </div>
      </div>

      {poSuccessMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-xs font-semibold text-emerald-300 animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{poSuccessMessage}</span>
        </div>
      )}

      {/* Reorder Diagnostics Banner */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <span className="text-xs text-slate-400">Current Stock / Safety Level</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{currentProduct.currentStock}</span>
            <span className="text-xs text-slate-400">/ {currentProduct.safetyStock} buffer</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Run-rate: {currentProduct.dailyDemand} units/day</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <span className="text-xs text-slate-400">Calculated EOQ Batch</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-400">{currentProduct.eoq}</span>
            <span className="text-xs text-slate-400">units</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Minimizes setup + annual holding cost</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <span className="text-xs text-slate-400">Reorder Point (ROP)</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400">{currentProduct.reorderPoint}</span>
            <span className="text-xs text-slate-400">units threshold</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Trigger PO when stock hits this count</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <span className="text-xs text-slate-400">Stockout Runway</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${isCriticalStockout ? 'text-rose-400' : 'text-slate-200'}`}>
              {daysToStockout}
            </span>
            <span className="text-xs text-slate-400">Days</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Lead time: {currentProduct.leadTimeDays} days</p>
        </div>

      </div>

      {/* AI Recommendation Highlight Box */}
      <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 p-5 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 flex-shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                StockMind AI Decision Directive
              </span>
              {recommendedSupplier && (
                <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-200 border border-indigo-500/40">
                  Recommended: {recommendedSupplier.name}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-200 leading-relaxed max-w-3xl">
              {aiReason}
            </p>
          </div>
        </div>
      </div>

      {/* Multi-Supplier Comparison Matrix Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md">
        
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-800/80">
          <div>
            <h3 className="text-sm font-bold text-white">Vendor Comparison & Trade-off Scoring</h3>
            <p className="text-xs text-slate-400">
              Evaluating {availableSuppliers.length} approved distribution sources for {currentProduct.name}.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            {/* Batch quantity override */}
            <div className="flex items-center gap-2">
              <label className="text-slate-400">Order Qty:</label>
              <input
                type="number"
                min="10"
                max="1000"
                value={activeOrderQty}
                onChange={(e) => setCustomQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-center font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Expedited shipping checkbox */}
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={isExpedited}
                onChange={(e) => setIsExpedited(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
              />
              <span>Expedited Freight</span>
            </label>
          </div>
        </div>

        {/* Suppliers List */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {availableSuppliers.map((supplier) => {
            const isRec = supplier.id === recommendedSupplier?.id;
            const unitPrice = Number((currentProduct.costPrice * (isExpedited ? supplier.unitCostMarkup * 1.05 : supplier.unitCostMarkup)).toFixed(2));
            const batchCost = Number((unitPrice * activeOrderQty).toFixed(2));
            const leadTime = isExpedited ? supplier.expeditedLeadTime : supplier.baseLeadTime;
            const willStockoutBeforeArrival = daysToStockout < leadTime;

            return (
              <div
                key={supplier.id}
                className={`relative flex flex-col justify-between rounded-xl border p-5 transition-all ${
                  isRec
                    ? 'border-indigo-500/50 bg-gradient-to-b from-indigo-950/20 to-slate-900/90 shadow-lg shadow-indigo-950/30'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                {/* AI Pick Badge */}
                {isRec && (
                  <span className="absolute -top-2.5 right-4 flex items-center gap-1 rounded-full bg-indigo-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-md">
                    <Sparkles className="h-3 w-3" /> AI Optimal Pick
                  </span>
                )}

                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{supplier.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <Building className="h-3 w-3 text-slate-500" />
                        {supplier.location}
                      </p>
                    </div>
                  </div>

                  {/* Supplier Metrics */}
                  <div className="mt-4 space-y-2 text-xs border-y border-slate-800/80 py-3">
                    
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Reliability Rating:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-emerald-400">{supplier.reliability}%</span>
                        <div className="flex text-amber-400">
                          <Star className="h-3 w-3 fill-amber-400" />
                          <span className="text-[10px] text-slate-400 ml-1">({supplier.rating})</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Transit Window:</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-indigo-400" />
                        <span className={`font-bold ${willStockoutBeforeArrival ? 'text-rose-400' : 'text-slate-200'}`}>
                          {leadTime} Days {isExpedited ? '(Expedited)' : '(Standard)'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Unit Wholesale Cost:</span>
                      <span className="font-bold text-slate-200">${unitPrice} /unit</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Total Batch ({activeOrderQty} units):</span>
                      <span className="font-bold text-white text-sm">${batchCost.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Min Order Qty (MOQ):</span>
                      <span className="text-slate-400">{supplier.minOrderQty} units</span>
                    </div>

                  </div>

                  {/* Stockout Risk Indicator for this supplier */}
                  <div className="mt-3">
                    {willStockoutBeforeArrival ? (
                      <div className="flex items-center gap-1 text-[11px] text-rose-400 font-medium">
                        <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>Warning: {leadTime}d transit exceeds {daysToStockout}d stock runway!</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                        <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>Safe: Replenishment arrives before zero-stock point.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Create PO CTA */}
                <div className="mt-5">
                  <button
                    onClick={() => handleCreatePO(supplier, activeOrderQty)}
                    className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white transition-all ${
                      isRec
                        ? 'bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30'
                        : 'border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Generate PO ({activeOrderQty} units — ${batchCost.toLocaleString()})
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
