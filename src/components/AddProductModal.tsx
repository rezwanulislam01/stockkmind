import React, { useState } from 'react';
import { X, Plus, Package, DollarSign, Clock, Layers } from 'lucide-react';
import { Product, ProductCategory, Supplier } from '../types';

interface AddProductModalProps {
  suppliers: Supplier[];
  onClose: () => void;
  onAddProduct: (product: Omit<Product, 'id' | 'riskScore' | 'status' | 'salesHistory' | 'eoq' | 'safetyStock' | 'reorderPoint'>) => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  suppliers,
  onClose,
  onAddProduct,
}) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('SKU-' + Math.floor(1000 + Math.random() * 9000));
  const [category, setCategory] = useState<ProductCategory>('Groceries');
  const [currentStock, setCurrentStock] = useState<number>(50);
  const [dailyDemand, setDailyDemand] = useState<number>(4);
  const [leadTimeDays, setLeadTimeDays] = useState<number>(3);
  const [unitPrice, setUnitPrice] = useState<number>(12.99);
  const [costPrice, setCostPrice] = useState<number>(6.50);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(suppliers[0]?.id || 'sup-1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddProduct({
      name: name.trim(),
      sku: sku.trim(),
      category,
      currentStock,
      dailyDemand,
      leadTimeDays,
      unitPrice,
      costPrice,
      supplierIds: [selectedSupplierId],
      daysWithoutSale: 0,
      demandTrend: 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/95 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Add New Product SKU</h3>
              <p className="text-[11px] text-slate-400">Automatic EOQ, Safety Buffer & Risk Initialization</p>
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
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Product Name:</label>
              <input
                type="text"
                required
                placeholder="e.g. Organic Almond Milk"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">SKU Code:</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Category:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="Groceries">Groceries</option>
                <option value="Personal Care">Personal Care</option>
                <option value="Electronics">Electronics</option>
                <option value="Beverages">Beverages</option>
                <option value="Home & Living">Home & Living</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Primary Supplier:</label>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.location})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Initial Stock:</label>
              <input
                type="number"
                min="0"
                value={currentStock}
                onChange={(e) => setCurrentStock(parseInt(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Daily Demand:</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={dailyDemand}
                onChange={(e) => setDailyDemand(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Lead Time (d):</label>
              <input
                type="number"
                min="1"
                value={leadTimeDays}
                onChange={(e) => setLeadTimeDays(parseInt(e.target.value) || 1)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Retail Unit Price ($):</label>
              <input
                type="number"
                min="0.1"
                step="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0.1)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Wholesale Unit Cost ($):</label>
              <input
                type="number"
                min="0.1"
                step="0.01"
                value={costPrice}
                onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0.1)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 font-semibold text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-5 py-2 font-bold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/30"
            >
              Add SKU to Catalog
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
