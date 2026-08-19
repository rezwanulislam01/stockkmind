import React, { useState } from 'react';
import { X, TrendingUp, DollarSign, Package, CheckCircle2 } from 'lucide-react';
import { Product } from '../types';

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
  const [quantity, setQuantity] = useState<number>(5);

  const currentProduct = products.find(p => p.id === selectedProductId) || products[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct || quantity <= 0) return;
    onRecordSale(currentProduct.id, quantity);
    onClose();
  };

  if (!currentProduct) return null;

  const totalSaleRevenue = (quantity * currentProduct.unitPrice).toFixed(2);
  const projectedRemainingStock = Math.max(0, currentProduct.currentStock - quantity);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/95 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Record Customer Sale</h3>
              <p className="text-[11px] text-slate-400">Live Inventory Deduction & Risk Recalculation</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* SKU Select */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Select Item:</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) — Stock: {p.currentStock}
                </option>
              ))}
            </select>
          </div>

          {/* Units Sold Input */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Units Sold:</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={currentProduct.currentStock || 500}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-slate-400">units</span>
            </div>
          </div>

          {/* Live Outcome Summary */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span>Gross Sales Value:</span>
              <span className="font-bold text-emerald-400 text-sm">${totalSaleRevenue}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Remaining On-Hand Stock:</span>
              <span className="font-bold text-white">{projectedRemainingStock} units</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Daily Run-Rate Adjusted:</span>
              <span className="font-semibold text-slate-200">{(currentProduct.dailyDemand + quantity * 0.1).toFixed(1)} u/day</span>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 font-semibold text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/30"
            >
              Confirm Sale & Recalculate
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
