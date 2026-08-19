import React, { useState } from 'react';
import { 
  Package, 
  CheckCircle2, 
  Sparkles
} from 'lucide-react';
import { PurchaseOrder } from '../types';
import { formatBDT } from '../utils/forecasting';
import confetti from 'canvas-confetti';

interface PurchaseOrdersViewProps {
  purchaseOrders: PurchaseOrder[];
  onReceivePO: (poId: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const PurchaseOrdersView: React.FC<PurchaseOrdersViewProps> = ({
  purchaseOrders,
  onReceivePO,
  onNavigateTab,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredPOs = purchaseOrders.filter((po) => {
    if (statusFilter === 'all') return true;
    return po.status === statusFilter;
  });

  const inTransitCount = purchaseOrders.filter(p => p.status === 'in_transit').length;
  const inTransitValue = purchaseOrders
    .filter(p => p.status === 'in_transit' || p.status === 'submitted')
    .reduce((sum, p) => sum + p.totalCost, 0);

  const handleReceive = (poId: string) => {
    onReceivePO(poId);
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 },
      });
    } catch (e) {}
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Package className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Purchase Orders & Replenishment Pipeline</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Track automated and approved supplier purchase orders, estimated transit arrivals, and inventory restock receipt.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('suppliers')}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white transition-all hover:bg-emerald-700 shadow-xs self-start sm:self-center"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Create New Reorder
        </button>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs text-slate-500">Active In-Transit Pipeline</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{inTransitCount}</span>
            <span className="text-xs text-slate-500">Shipments en route</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Dhaka & Regional Logistics Synced</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs text-slate-500">Committed Inbound Capital</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-emerald-700">{formatBDT(inTransitValue)}</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Pending wholesale delivery value</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs text-slate-500">Total Purchase Orders</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{purchaseOrders.length}</span>
            <span className="text-xs text-slate-500">Historical records</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">100% verified procurement audit</p>
        </div>

      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-xs w-fit">
        {['all', 'submitted', 'in_transit', 'delivered'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`capitalize rounded-md px-3 py-1 text-xs font-medium transition-all ${
              statusFilter === st
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredPOs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-xs text-slate-500 shadow-xs">
            No purchase orders in this status category.
          </div>
        ) : (
          filteredPOs.map((po) => {
            const isDelivered = po.status === 'delivered';
            const isInTransit = po.status === 'in_transit';

            return (
              <div
                key={po.id}
                className={`rounded-xl border p-5 transition-all shadow-xs ${
                  isDelivered
                    ? 'border-emerald-200 bg-emerald-50/30 opacity-80'
                    : isInTransit
                    ? 'border-indigo-200 bg-indigo-50/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  
                  {/* Left PO Info */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {po.poNumber}
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          isDelivered
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : isInTransit
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {po.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-500">Created {po.createdAt}</span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{po.productName}</h4>
                      <p className="text-xs text-slate-500">
                        SKU: <span className="font-mono text-slate-700">{po.productSku}</span> • Vendor: <strong className="text-slate-800">{po.supplierName}</strong>
                      </p>
                    </div>

                    {po.aiRecommendationReason && (
                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 max-w-2xl bg-emerald-50 rounded-lg px-2.5 py-1 border border-emerald-200">
                        <Sparkles className="h-3 w-3 text-emerald-600 flex-shrink-0" />
                        <span>{po.aiRecommendationReason}</span>
                      </div>
                    )}
                  </div>

                  {/* Middle / Right: Pricing, ETA, Receive Action */}
                  <div className="flex flex-wrap items-center gap-6 lg:justify-end">
                    
                    <div className="text-left lg:text-right">
                      <div className="text-xs text-slate-500">Batch Quantity</div>
                      <div className="text-sm font-bold text-slate-900">{po.quantity} units</div>
                      <div className="text-[10px] text-slate-400">{formatBDT(po.unitCost)}/unit wholesale</div>
                    </div>

                    <div className="text-left lg:text-right">
                      <div className="text-xs text-slate-500">Total Valuation</div>
                      <div className="text-sm font-bold text-emerald-700">{formatBDT(po.totalCost)}</div>
                      <div className="text-[10px] text-slate-400">Est Arrival: {po.expectedDeliveryDate}</div>
                    </div>

                    {/* Receive Action */}
                    {!isDelivered ? (
                      <button
                        onClick={() => handleReceive(po.id)}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition-all"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Receive & Restock (+{po.quantity} units)
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        Stock Integrated
                      </div>
                    )}

                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
