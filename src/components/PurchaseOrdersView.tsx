import React, { useState } from 'react';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Sparkles, 
  ExternalLink, 
  Building,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { PurchaseOrder, POStatus } from '../types';
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
              <Package className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">Purchase Orders & Replenishment Pipeline</h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Track automated and approved supplier purchase orders, estimated transit arrivals, and inventory restock receipt.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('suppliers')}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white transition-all hover:bg-indigo-500 shadow-md shadow-indigo-600/30 self-start sm:self-center"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Create New Reorder
        </button>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm">
          <span className="text-xs text-slate-400">Active In-Transit Pipeline</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-indigo-400">{inTransitCount}</span>
            <span className="text-xs text-slate-400">Shipments en route</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Live GPS tracking synced with vendors</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm">
          <span className="text-xs text-slate-400">Committed Inbound Capital</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">${inTransitValue.toLocaleString()}</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Pending freight delivery value</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm">
          <span className="text-xs text-slate-400">Total Purchase Orders</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-400">{purchaseOrders.length}</span>
            <span className="text-xs text-slate-400">Historical records</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">100% on-time receipt rate</p>
        </div>

      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/60 p-1 w-fit">
        {['all', 'submitted', 'in_transit', 'delivered'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`capitalize rounded-lg px-3 py-1 text-xs font-medium transition-all ${
              statusFilter === st
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredPOs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center text-xs text-slate-500">
            No purchase orders in this status category.
          </div>
        ) : (
          filteredPOs.map((po) => {
            const isDelivered = po.status === 'delivered';
            const isInTransit = po.status === 'in_transit';
            const isSubmitted = po.status === 'submitted';

            return (
              <div
                key={po.id}
                className={`rounded-2xl border p-5 transition-all ${
                  isDelivered
                    ? 'border-emerald-500/20 bg-slate-900/60 opacity-80'
                    : isInTransit
                    ? 'border-indigo-500/40 bg-gradient-to-r from-indigo-950/20 via-slate-900 to-slate-900 shadow-md'
                    : 'border-slate-800 bg-slate-900/80'
                }`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  
                  {/* Left PO Info */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {po.poNumber}
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          isDelivered
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : isInTransit
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {po.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400">Created {po.createdAt}</span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white">{po.productName}</h4>
                      <p className="text-xs text-slate-400">
                        SKU: <span className="font-mono text-slate-300">{po.productSku}</span> • Vendor: <strong className="text-slate-200">{po.supplierName}</strong>
                      </p>
                    </div>

                    {po.aiRecommendationReason && (
                      <div className="flex items-center gap-1.5 text-[11px] text-indigo-300/90 max-w-2xl bg-indigo-500/10 rounded-lg px-2.5 py-1 border border-indigo-500/20">
                        <Sparkles className="h-3 w-3 text-indigo-400 flex-shrink-0" />
                        <span>{po.aiRecommendationReason}</span>
                      </div>
                    )}
                  </div>

                  {/* Middle / Right: Pricing, ETA, Receive Action */}
                  <div className="flex flex-wrap items-center gap-6 lg:justify-end">
                    
                    <div className="text-left lg:text-right">
                      <div className="text-xs text-slate-400">Batch Quantity</div>
                      <div className="text-sm font-bold text-white">{po.quantity} units</div>
                      <div className="text-[10px] text-slate-500">${po.unitCost}/unit wholesale</div>
                    </div>

                    <div className="text-left lg:text-right">
                      <div className="text-xs text-slate-400">Total Valuation</div>
                      <div className="text-sm font-bold text-emerald-400">${po.totalCost.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-500">Est Arrival: {po.expectedDeliveryDate}</div>
                    </div>

                    {/* Receive Action */}
                    {!isDelivered ? (
                      <button
                        onClick={() => handleReceive(po.id)}
                        className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/30 transition-all"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Receive & Restock (+{po.quantity} units)
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="h-3.5 w-3.5" />
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
