import React, { useState } from 'react';
import { 
  ShoppingCart, 
  CheckCircle2, 
  Sparkles, 
  ChevronDown,
  Building,
  Plus,
  Ship,
  Factory
} from 'lucide-react';
import { Product, PurchaseOrder, Supplier } from '../types';
import { formatBDT } from '../utils/forecasting';
import confetti from 'canvas-confetti';

interface SupplierMatrixViewProps {
  products: Product[];
  suppliers: Supplier[];
  selectedProduct: Product | null;
  onSelectProduct: (product: Product) => void;
  onCreatePO: (po: Omit<PurchaseOrder, 'id' | 'poNumber' | 'createdAt'>) => void;
  onNavigateToOrders?: () => void;
}

export const SupplierMatrixView: React.FC<SupplierMatrixViewProps> = ({
  products,
  suppliers,
  selectedProduct,
  onSelectProduct,
  onCreatePO,
}) => {
  const currentProduct = selectedProduct || products[0] || null;
  const [customQty, setCustomQty] = useState<number | null>(null);
  const [isExpedited, setIsExpedited] = useState<boolean>(false);
  const [poSuccessMessage, setPoSuccessMessage] = useState<string | null>(null);

  if (!currentProduct) {
    return <div className="p-8 text-center text-slate-500">No industrial material selected for supplier evaluation.</div>;
  }

  const unit = currentProduct.unitOfMeasure || 'MT';
  const availableSuppliers = suppliers.length > 0 ? suppliers : [];
  const activeOrderQty = customQty !== null ? customQty : currentProduct.eoq;
  const daysToStockout = Number((currentProduct.currentStock / Math.max(0.1, currentProduct.dailyDemand)).toFixed(1));
  const isCriticalStockout = currentProduct.riskScore >= 75 || daysToStockout <= currentProduct.leadTimeDays;

  // Determine AI recommended supplier / vessel terminal
  let recommendedSupplier = availableSuppliers[0];
  let aiReason = "";

  if (isCriticalStockout) {
    const fastest = [...availableSuppliers].sort((a, b) => a.expeditedLeadTime - b.expeditedLeadTime)[0];
    if (fastest) {
      recommendedSupplier = fastest;
      aiReason = `${fastest.name} (${fastest.location}) is recommended because plant silo runway is critical (${daysToStockout} days remaining vs ${fastest.expeditedLeadTime}d expedited transit/berthing), preventing plant production stoppage.`;
    }
  } else {
    const optimal = [...availableSuppliers].sort((a, b) => (b.reliability - a.unitCostMarkup * 10) - (a.reliability - b.unitCostMarkup * 10))[0];
    if (optimal) {
      recommendedSupplier = optimal;
      aiReason = `${optimal.name} is recommended for optimal bulk shipping discharge reliability (98%+) and competitive landed port cost.`;
    }
  }

  const handleCreatePurchaseOrder = (supplier: Supplier, qty: number) => {
    const unitCost = Math.round(currentProduct.costPrice * (isExpedited ? supplier.unitCostMarkup * 1.05 : supplier.unitCostMarkup));
    const totalCost = unitCost * qty;
    const transitDays = isExpedited ? supplier.expeditedLeadTime : supplier.baseLeadTime;
    
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + transitDays);

    onCreatePO({
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
    });

    try {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.8 },
      });
    } catch (e) {}

    setPoSuccessMessage(`Bulk PO for ${qty} ${unit} of ${currentProduct.name} generated (${formatBDT(totalCost, true)})!`);
    setTimeout(() => setPoSuccessMessage(null), 5000);
  };

  return (
    <div className="space-y-4 pb-12">
      
      {/* Header & Product Switcher */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Ship className="h-4 w-4 text-emerald-700" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Bulk Commodity Suppliers & Port Freight Matrix (EOQ)</h2>
          </div>
          <p className="text-xs text-slate-500">
            Compare international grain trading houses, port terminals (Chattogram, Mongla), and regional storage silos.
          </p>
        </div>

        {/* Material Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500">Feedstock:</label>
          <div className="relative">
            <select
              value={currentProduct.id}
              onChange={(e) => {
                const found = products.find(p => p.id === e.target.value);
                if (found) onSelectProduct(found);
              }}
              className="appearance-none rounded-lg border border-slate-300 bg-white py-1.5 pl-3 pr-8 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer shadow-xs"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id} className="bg-white text-slate-900">
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {poSuccessMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{poSuccessMessage}</span>
        </div>
      )}

      {/* Quick Diagnostics */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-xs text-slate-500">Physical Silo Stock</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900">{currentProduct.currentStock}</span>
            <span className="text-xs text-slate-500">{unit} (Buffer: {currentProduct.safetyStock})</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-xs text-slate-500">Economic Order Qty (EOQ)</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-emerald-700">{currentProduct.eoq}</span>
            <span className="text-xs text-slate-500">{unit} shipment</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-xs text-slate-500">Reorder Trigger (ROP)</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-indigo-600">{currentProduct.reorderPoint}</span>
            <span className="text-xs text-slate-500">{unit}</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-xs text-slate-500">Silo Runway</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold ${isCriticalStockout ? 'text-rose-600' : 'text-slate-900'}`}>
              {daysToStockout}
            </span>
            <span className="text-xs text-slate-500">Days (Port Lead: {currentProduct.leadTimeDays}d)</span>
          </div>
        </div>
      </div>

      {/* AI Pick Directive */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-xs">
        <div className="flex items-start gap-2.5">
          <Sparkles className="h-4 w-4 text-emerald-700 flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold text-emerald-800">
              Procurement Intelligence Recommendation:
            </span>
            <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
              {aiReason}
            </p>
          </div>
        </div>
      </div>

      {/* Suppliers Matrix Cards */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Approved Trading Houses & Port Terminals ({availableSuppliers.length} Vendors)</h3>
            <p className="text-xs text-slate-500">Prices and bulk delivery estimates calculated in BDT (৳).</p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-2">
              <label className="text-slate-600 font-medium">Shipment Qty ({unit}):</label>
              <input
                type="number"
                min="10"
                max="50000"
                value={activeOrderQty}
                onChange={(e) => setCustomQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 rounded-md border border-slate-300 bg-white px-2 py-1 text-center font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-xs"
              />
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={isExpedited}
                onChange={(e) => setIsExpedited(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-0"
              />
              <span>Priority Port Clearance / Coastal Charter</span>
            </label>
          </div>
        </div>

        {/* Supplier Cards Grid */}
        <div className="mt-4 grid grid-cols-1 gap-3.5 lg:grid-cols-3">
          {availableSuppliers.map((supplier) => {
            const isRec = supplier.id === recommendedSupplier?.id;
            const unitPrice = Math.round(currentProduct.costPrice * (isExpedited ? supplier.unitCostMarkup * 1.05 : supplier.unitCostMarkup));
            const batchCost = unitPrice * activeOrderQty;
            const leadTime = isExpedited ? supplier.expeditedLeadTime : supplier.baseLeadTime;
            const willStockoutBeforeArrival = daysToStockout < leadTime;

            return (
              <div
                key={supplier.id}
                className={`relative flex flex-col justify-between rounded-xl border p-4 transition-all ${
                  isRec
                    ? 'border-emerald-300 bg-emerald-50/40 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                }`}
              >
                {isRec && (
                  <span className="absolute -top-2.5 right-3 flex items-center gap-1 rounded-full bg-emerald-700 px-2 py-0.5 text-[9px] font-bold text-white shadow-xs">
                    <Sparkles className="h-2.5 w-2.5" /> AI Recommended
                  </span>
                )}

                <div>
                  <h4 className="text-xs font-bold text-slate-900">{supplier.name}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                    <Building className="h-3 w-3 text-slate-400" />
                    {supplier.location}
                  </p>

                  <div className="mt-3 space-y-1.5 text-xs border-y border-slate-100 py-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Discharge Reliability:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-emerald-700">{supplier.reliability}%</span>
                        <span className="text-[10px] text-slate-400">({supplier.rating}★)</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Port Transit & Customs:</span>
                      <span className={`font-bold ${willStockoutBeforeArrival ? 'text-rose-600' : 'text-slate-900'}`}>
                        {leadTime} Days
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Landed Unit Cost:</span>
                      <span className="font-bold text-slate-900">{formatBDT(unitPrice, true)} /{unit}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Total Shipment Cost:</span>
                      <span className="font-bold text-slate-900">{formatBDT(batchCost, true)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3.5">
                  <button
                    onClick={() => handleCreatePurchaseOrder(supplier, activeOrderQty)}
                    className={`w-full flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all shadow-xs ${
                      isRec
                        ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                        : 'border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Generate Bulk PO ({activeOrderQty} {unit})
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
