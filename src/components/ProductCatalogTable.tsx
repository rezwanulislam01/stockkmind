import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  HelpCircle, 
  Plus, 
  TrendingUp, 
  ShoppingCart, 
  Flame, 
  AlertTriangle, 
  CheckCircle2, 
  Percent, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Product, ProductCategory, StockStatus } from '../types';

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

  const categories = ['All', 'Groceries', 'Personal Care', 'Electronics', 'Beverages', 'Home & Living'];
  const statuses = ['All', 'critical', 'warning', 'healthy', 'dead_stock'];

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch = 
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase());
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
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur-md">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">Master SKU Inventory Catalog & Velocity</h2>
          <p className="mt-1 text-xs text-slate-400">
            Real-time stock on hand, daily velocity run-rate, days to depletion, and automated risk scoring.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search SKU or Product name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-800/90 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/60 p-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/60 p-1">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`capitalize rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                selectedStatus === st
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st === 'dead_stock' ? 'Dead Stock' : st}
            </button>
          ))}
        </div>

      </div>

      {/* Data Table Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            
            {/* Table Head */}
            <thead className="border-b border-slate-800 bg-slate-950/70 text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">
                  <button onClick={() => handleSort('name')} className="flex items-center gap-1 hover:text-white">
                    Product / SKU <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">
                  <button onClick={() => handleSort('currentStock')} className="flex items-center gap-1 hover:text-white">
                    Stock On Hand <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">
                  <button onClick={() => handleSort('dailyDemand')} className="flex items-center gap-1 hover:text-white">
                    Daily Velocity <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">Runway</th>
                <th className="px-4 py-3 font-semibold">Valuation</th>
                <th className="px-4 py-3 font-semibold">
                  <button onClick={() => handleSort('riskScore')} className="flex items-center gap-1 hover:text-white">
                    Risk Score <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold text-right">Quick Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No matching SKUs found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const daysLeft = (p.currentStock / Math.max(0.1, p.dailyDemand)).toFixed(1);
                  const isCritical = p.status === 'critical';
                  const isDeadStock = p.status === 'dead_stock';
                  const isWarning = p.status === 'warning';
                  const valuation = p.currentStock * p.unitPrice;

                  return (
                    <tr 
                      key={p.id} 
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => onSelectProduct(p)}
                    >
                      {/* Product Name & SKU */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div>
                            <p className="font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors">
                              {p.name}
                            </p>
                            <span className="font-mono text-[10px] text-slate-400">{p.sku}</span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5 text-slate-300">
                        <span className="rounded-md border border-slate-700/60 bg-slate-800/40 px-2 py-0.5 text-[11px]">
                          {p.category}
                        </span>
                      </td>

                      {/* On Hand Stock */}
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-slate-100">{p.currentStock} units</span>
                        <div className="text-[10px] text-slate-500">Buffer: {p.safetyStock}</div>
                      </td>

                      {/* Daily Velocity */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-semibold ${p.dailyDemand > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {p.dailyDemand} u/day
                          </span>
                          {p.demandTrend !== 0 && (
                            <span className={`text-[10px] ${p.demandTrend > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                              ({p.demandTrend > 0 ? '+' : ''}{p.demandTrend}%)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Runway */}
                      <td className="px-4 py-3.5">
                        {isDeadStock ? (
                          <span className="text-amber-400 font-medium text-[11px]">{p.daysWithoutSale}d No Sales</span>
                        ) : (
                          <div>
                            <span className={`font-bold ${Number(daysLeft) <= p.leadTimeDays ? 'text-rose-400' : 'text-slate-200'}`}>
                              {daysLeft} Days
                            </span>
                            <div className="text-[10px] text-slate-500">Lead: {p.leadTimeDays}d</div>
                          </div>
                        )}
                      </td>

                      {/* Valuation */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-200">${valuation.toLocaleString()}</div>
                        <div className="text-[10px] text-slate-500">${p.unitPrice}/u retail</div>
                      </td>

                      {/* Risk Score Badge */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              isCritical
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : isWarning
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : isDeadStock
                                ? 'bg-amber-950/40 text-amber-400 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            }`}
                          >
                            {isCritical && <Flame className="h-3 w-3" />}
                            {isWarning && <AlertTriangle className="h-3 w-3" />}
                            {isDeadStock && <Percent className="h-3 w-3" />}
                            {!isCritical && !isWarning && !isDeadStock && <CheckCircle2 className="h-3 w-3" />}
                            {p.riskScore}/100
                          </span>
                        </div>
                      </td>

                      {/* Quick Actions */}
                      <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          
                          <button
                            onClick={() => onOpenRecordSale(p)}
                            className="rounded-lg border border-slate-700 bg-slate-800/80 px-2 py-1 text-[11px] text-slate-200 hover:bg-slate-700 hover:text-white"
                            title="Log Sale"
                          >
                            Sale
                          </button>

                          <button
                            onClick={() => onOpenReorder(p)}
                            className="rounded-lg bg-indigo-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-indigo-500"
                            title="Open Supplier Reorder"
                          >
                            Reorder
                          </button>

                          <button
                            onClick={() => onSelectProduct(p)}
                            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                            title="Explain AI Diagnosis"
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
