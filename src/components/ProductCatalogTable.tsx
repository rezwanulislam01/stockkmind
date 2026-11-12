import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ArrowUpDown, 
  ChevronRight,
  Flame, 
  AlertTriangle, 
  CheckCircle2, 
  Percent,
  Factory
} from 'lucide-react';
import { Product } from '../types';
import { formatBDT } from '../utils/forecasting';

interface ProductCatalogTableProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onOpenRecordSale: (product: Product) => void;
  onOpenReorder: (product: Product) => void;
}

export const ProductCatalogTable: React.FC<ProductCatalogTableProps> = ({
  products,
  onSelectProduct,
  onOpenRecordSale,
  onOpenReorder,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sortField, setSortField] = useState<keyof Product>('riskScore');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const categories = [
    'All',
    'Agri-Grains & Silo',
    'Oil Refinery Feedstock',
    'Feed Mill Ingredients',
    'Industrial Packaging',
    'Chemicals & Processing'
  ];

  const statuses = ['All', 'critical', 'warning', 'healthy', 'dead_stock'];

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch = 
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.plantDivision && p.plantDivision.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (p.storageLocation && p.storageLocation.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        const matchesStatus = selectedStatus === 'All' || p.status === selectedStatus;
        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (typeof valA === 'string') {
          return sortDirection === 'asc' 
            ? (valA as string).localeCompare(valB as string) 
            : (valB as string).localeCompare(valA as string);
        }

        return sortDirection === 'asc' 
          ? (valA as number) - (valB as number) 
          : (valB as number) - (valA as number);
      });
  }, [products, searchQuery, selectedCategory, selectedStatus, sortField, sortDirection]);

  const handleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="space-y-4 pb-12">
      
      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Rezwan Industrial Zone Industrial Raw Material Inventory</h2>
          <p className="text-xs text-slate-500">
            Real-time physical stock in grain silos, liquid bulk storage tanks, and daily factory consumption velocity.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search material, plant, silo or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-xs">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`capitalize rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                selectedStatus === st
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {st === 'dead_stock' ? 'Obsolete Yard' : st === 'critical' ? 'Silo Critical' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Clean Data Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/80 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">
                  <button onClick={() => handleSort('name')} className="flex items-center gap-1 hover:text-slate-900">
                    Raw Material / Plant Division <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">Silo / Tank Location</th>
                <th className="px-4 py-3 font-semibold">
                  <button onClick={() => handleSort('currentStock')} className="flex items-center gap-1 hover:text-slate-900">
                    Physical Silo Stock <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">
                  <button onClick={() => handleSort('dailyDemand')} className="flex items-center gap-1 hover:text-slate-900">
                    Daily Factory Run-Rate <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">Silo Runway</th>
                <th className="px-4 py-3 font-semibold">Valuation (BDT)</th>
                <th className="px-4 py-3 font-semibold">
                  <button onClick={() => handleSort('riskScore')} className="flex items-center gap-1 hover:text-slate-900">
                    Risk Index <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No matching industrial raw materials found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const daysLeft = (p.currentStock / Math.max(0.1, p.dailyDemand)).toFixed(1);
                  const isCritical = p.status === 'critical';
                  const isDeadStock = p.status === 'dead_stock';
                  const isWarning = p.status === 'warning';
                  const valuation = p.currentStock * p.unitPrice;
                  const unit = p.unitOfMeasure || 'MT';

                  return (
                    <tr 
                      key={p.id} 
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group cursor-pointer"
                      onClick={() => onSelectProduct(p)}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          {/* Material Thumbnail */}
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xs">
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" loading="lazy" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs">🏭</div>
                            )}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                              {p.name}
                            </p>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                              <span className="font-mono">{p.sku}</span>
                              <span>•</span>
                              <span className="text-emerald-700 font-medium">{p.plantDivision || 'SSR Plant'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-slate-600">
                        <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] block font-medium text-slate-800 truncate max-w-[190px]">
                          {p.storageLocation || p.category}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-bold text-slate-900">{p.currentStock} {unit}</span>
                        <div className="text-[10px] text-slate-500">Safety Buffer: {p.safetyStock} {unit}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-semibold ${p.dailyDemand > 0 ? 'text-emerald-700' : 'text-slate-500'}`}>
                            {p.dailyDemand} {unit}/day
                          </span>
                          {p.demandTrend !== 0 && (
                            <span className={`text-[10px] font-medium ${p.demandTrend > 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                              ({p.demandTrend > 0 ? '+' : ''}{p.demandTrend}%)
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        {isDeadStock ? (
                          <span className="text-amber-700 font-medium text-[11px]">{p.daysWithoutSale}d Inactive</span>
                        ) : (
                          <div>
                            <span className={`font-bold ${Number(daysLeft) <= p.leadTimeDays ? 'text-rose-600' : 'text-slate-800'}`}>
                              {daysLeft} Days
                            </span>
                            <div className="text-[10px] text-slate-400">Port Lead: {p.leadTimeDays}d</div>
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900">{formatBDT(valuation, true)}</div>
                        <div className="text-[10px] text-slate-500">{formatBDT(p.unitPrice, true)} / {unit}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            isCritical
                              ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : isWarning
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : isDeadStock
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {isCritical && <Flame className="h-3 w-3 text-rose-600" />}
                          {isWarning && <AlertTriangle className="h-3 w-3 text-amber-600" />}
                          {isDeadStock && <Percent className="h-3 w-3 text-amber-600" />}
                          {!isCritical && !isWarning && !isDeadStock && <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
                          {p.riskScore}/100
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenRecordSale(p)}
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-xs"
                            title="Issue to Plant Production"
                          >
                            Issue
                          </button>

                          <button
                            onClick={() => onOpenReorder(p)}
                            className="rounded-lg bg-emerald-700 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-800 shadow-xs"
                            title="Raise Bulk Procurement PO"
                          >
                            Bulk PO
                          </button>

                          <button
                            onClick={() => onSelectProduct(p)}
                            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
                            title="Silo Deep Dive"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
