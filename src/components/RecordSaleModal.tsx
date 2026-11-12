import React, { useState } from 'react';
import { X, Factory, Layers, AlertCircle } from 'lucide-react';
import { Product } from '../types';
import { formatBDT } from '../utils/forecasting';

interface RecordSaleModalProps {
  products: Product[];
  initialProduct: Product | null;
  onClose: () => void;
  onRecordSale: (productId: string, quantitySold: number) => void;
}

export const RecordSaleModal: React.FC<RecordSaleModalProps> = ({
  products,
  initialProduct,
  onClose,
  onRecordSale,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialProduct?.id || products[0]?.id || ''
  );
  const [quantity, setQuantity] = useState<number>(25);
  const [productionBatch, setProductionBatch] = useState<string>('BATCH-REZWAN-SHIFT-A');

  const currentProduct = products.find(p => p.id === selectedProductId) || products[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct || quantity <= 0) return;
    onRecordSale(currentProduct.id, quantity);
    onClose();
  };

  if (!currentProduct) return null;

  const unitLabel = currentProduct.unitOfMeasure || 'MT';
  const totalValuation = quantity * currentProduct.unitPrice;
  const projectedRemainingStock = Math.max(0, currentProduct.currentStock - quantity);
  const isDepletingRunway = projectedRemainingStock <= currentProduct.safetyStock;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Factory className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Issue Raw Material (কারখানায় কাঁচামাল ইস্যু)</h3>
              <p className="text-[11px] text-slate-500">Live Plant Consumption & Silo Level Deduction</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* Material Select */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Select Raw Material / Silo SKU:</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer shadow-xs"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) — {p.currentStock} {p.unitOfMeasure || 'MT'} in {p.plantDivision || 'Plant'}
                </option>
              ))}
            </select>
          </div>

          {/* Plant Division & Silo Location Display */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 flex items-center justify-between text-slate-600">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Plant / Silo Bay</span>
              <p className="font-medium text-slate-800 text-xs">{currentProduct.storageLocation || 'Central Silo'}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400">Current Silo Stock</span>
              <p className="font-bold text-emerald-700 text-xs">{currentProduct.currentStock} {unitLabel}</p>
            </div>
          </div>

          {/* Quantity Issued Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Issue Quantity ({unitLabel}):</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max={currentProduct.currentStock || 500000}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-xs"
                />
                <span className="text-slate-500 shrink-0">{unitLabel}</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Production Batch # / Shift:</label>
              <input
                type="text"
                value={productionBatch}
                onChange={(e) => setProductionBatch(e.target.value)}
                placeholder="e.g. MILL-A-SHIFT-1"
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-xs"
              />
            </div>
          </div>

          {/* Live Outcome Summary */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span>Batch Consumption Value:</span>
              <span className="font-bold text-emerald-700 text-sm">{formatBDT(totalValuation)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>Projected Remaining Silo Level:</span>
              <span className={`font-bold ${isDepletingRunway ? 'text-rose-600' : 'text-slate-900'}`}>
                {projectedRemainingStock} {unitLabel}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>Daily Plant Run-Rate:</span>
              <span className="font-medium text-slate-800">{currentProduct.dailyDemand} {unitLabel}/day</span>
            </div>

            {isDepletingRunway && (
              <div className="flex items-center gap-1.5 pt-1 text-[11px] text-rose-600">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>Warning: This issue reduces Silo level below safety buffer ({currentProduct.safetyStock} {unitLabel}).</span>
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-emerald-700 px-4 py-2 font-bold text-white hover:bg-emerald-800 shadow-xs"
            >
              Confirm Issue (কাঁচামাল ছাড় করুন)
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
