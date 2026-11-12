import React, { useState } from 'react';
import { X, Plus, Factory } from 'lucide-react';
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
  const [sku, setSku] = useState('RAW-IND-' + Math.floor(1000 + Math.random() * 9000));
  const [category, setCategory] = useState<ProductCategory>('Agri-Grains & Silo');
  const [unitOfMeasure, setUnitOfMeasure] = useState<string>('MT (Metric Ton)');
  const [plantDivision, setPlantDivision] = useState<string>('Rezwan Industrial Zone & Silo Network (Flour Division)');
  const [storageLocation, setStorageLocation] = useState<string>('Silo #02 • Rezwan Industrial Zone & Silo Network');
  const [currentStock, setCurrentStock] = useState<number>(500);
  const [dailyDemand, setDailyDemand] = useState<number>(45);
  const [leadTimeDays, setLeadTimeDays] = useState<number>(5);
  const [unitPrice, setUnitPrice] = useState<number>(42000);
  const [costPrice, setCostPrice] = useState<number>(37500);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(suppliers[0]?.id || 'sup-1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddProduct({
      name: name.trim(),
      sku: sku.trim(),
      category,
      unitOfMeasure,
      plantDivision,
      storageLocation,
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
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
        
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-4 backdrop-blur-xs">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Factory className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Add Raw Material SKU (নতুন কাঁচামাল যোগ)</h3>
              <p className="text-[11px] text-slate-500">Industrial Silo Buffer, Plant Run-Rate & Import Logistics Setup</p>
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Material / Feedstock Name:</label>
              <input
                type="text"
                required
                placeholder="e.g. Imported Milling Wheat Grade-1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Material SKU Code:</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Industrial Category:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer shadow-xs"
              >
                <option value="Agri-Grains & Silo">Agri-Grains & Silo</option>
                <option value="Oil Refinery Feedstock">Oil Refinery Feedstock</option>
                <option value="Feed Mill Ingredients">Feed Mill Ingredients</option>
                <option value="Industrial Packaging">Industrial Packaging</option>
                <option value="Chemicals & Processing">Chemicals & Processing</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Unit of Measure (UOM):</label>
              <select
                value={unitOfMeasure}
                onChange={(e) => setUnitOfMeasure(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer shadow-xs"
              >
                <option value="MT (Metric Ton)">MT (Metric Ton)</option>
                <option value="Bags (50kg)">Bags (50kg)</option>
                <option value="MT / Drums">MT / Drums</option>
                <option value="Bags (25kg)">Bags (25kg)</option>
                <option value="Litres">Litres</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Plant Division:</label>
              <select
                value={plantDivision}
                onChange={(e) => setPlantDivision(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer shadow-xs"
              >
                <option value="Rezwan Industrial Zone & Silo Network (Flour Division)">Rezwan Industrial Zone & Silo Network (Flour Division)</option>
                <option value="Rezwan Industrial Zone & Silo Network (Feed Division)">Rezwan Industrial Zone & Silo Network (Feed Division)</option>
                <option value="Rezwan Industrial Zone & Silo Network (Oil Refinery)">Rezwan Industrial Zone & Silo Network (Oil Refinery)</option>
                <option value="Rezwan Industrial Zone & Silo Network (Rice Division)">Rezwan Industrial Zone & Silo Network (Rice Division)</option>
                <option value="Rezwan Industrial Zone & Silo Network (Packaging & Logistics)">Rezwan Industrial Zone & Silo Network (Packaging & Logistics)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Storage Silo / Tank Location:</label>
              <input
                type="text"
                placeholder="e.g. Silo #04 • Rajshahi Complex"
                value={storageLocation}
                onChange={(e) => setStorageLocation(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Primary Bulk Supplier / Port Terminal:</label>
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

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Current Silo Stock:</label>
              <input
                type="number"
                min="0"
                value={currentStock}
                onChange={(e) => setCurrentStock(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Daily Consumption:</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={dailyDemand}
                onChange={(e) => setDailyDemand(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Port Lead Time (d):</label>
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
              <label className="font-semibold text-slate-700">Valuation Unit Price (৳ BDT):</label>
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
              <label className="font-semibold text-slate-700">Landing / Import Cost (৳ BDT):</label>
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
              className="rounded-lg bg-emerald-700 px-5 py-2 font-bold text-white hover:bg-emerald-800 shadow-xs"
            >
              Save Raw Material SKU
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
