import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
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
  const [sku, setSku] = useState('SKU-BD-' + Math.floor(1000 + Math.random() * 9000));
  const [category, setCategory] = useState<ProductCategory>('Groceries');
  const [currentStock, setCurrentStock] = useState<number>(60);
  const [dailyDemand, setDailyDemand] = useState<number>(6);
  const [leadTimeDays, setLeadTimeDays] = useState<number>(3);
  const [unitPrice, setUnitPrice] = useState<number>(180);
  const [costPrice, setCostPrice] = useState<number>(140);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Add New Product (নতুন পণ্য যোগ)</h3>
              <p className="text-[11px] text-slate-500">Automatic EOQ, Safety Buffer & Risk Initialization in BDT</p>
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
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Product Name:</label>
              <input
                type="text"
                required
                placeholder="e.g. Radhuni Pure Mustard Oil 1L"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">SKU Code:</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Category:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer shadow-xs"
              >
                <option value="Groceries">Groceries</option>
                <option value="Personal Care">Personal Care</option>
                <option value="Electronics">Electronics</option>
                <option value="Beverages">Beverages</option>
                <option value="Home & Living">Home & Living</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Primary Distributor:</label>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer shadow-xs"
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.location})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Initial Stock (units):</label>
              <input
                type="number"
                min="0"
                value={currentStock}
                onChange={(e) => setCurrentStock(parseInt(e.target.value) || 0)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Daily Sales Demand:</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={dailyDemand}
                onChange={(e) => setDailyDemand(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Lead Time (days):</label>
              <input
                type="number"
                min="1"
                value={leadTimeDays}
                onChange={(e) => setLeadTimeDays(parseInt(e.target.value) || 1)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Retail Unit Price (৳ BDT):</label>
              <input
                type="number"
                min="1"
                step="1"
                value={unitPrice}
                onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 1)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Wholesale Unit Cost (৳ BDT):</label>
              <input
                type="number"
                min="1"
                step="1"
                value={costPrice}
                onChange={(e) => setCostPrice(parseFloat(e.target.value) || 1)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-xs"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-5 py-2 font-bold text-white hover:bg-emerald-700 shadow-xs"
            >
              Save Product SKU
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
