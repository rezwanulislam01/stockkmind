import React from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2
} from 'lucide-react';
import { AIActionItem } from '../types';
import { formatBDT } from '../utils/forecasting';

interface ActionWhyModalProps {
  action: AIActionItem | null;
  onClose: () => void;
  onApprove: (action: AIActionItem) => void;
}

export const ActionWhyModal: React.FC<ActionWhyModalProps> = ({
  action,
  onClose,
  onApprove,
}) => {
  if (!action) return null;

  const isApproved = action.status === 'approved';
  const sku = action.sku || action.productSku;
  const whyData = action.whyData || {
    summary: action.reasoning || action.description || 'Automated stock balancing rule triggered.',
    rootCauses: ['Sales run-rate velocity shift', 'Lead-time buffer boundary reached'],
    financialImpact: `Potential stockout risk loss estimated at ${formatBDT(action.avoidedLossEstimate)}.`,
    recommendedAction: 'Execute replenishment order or adjust inventory buffer immediately.',
    supplierTip: 'Procure from preferred Bangladesh distributor for 2-3 day transit.',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
        
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-4 backdrop-blur-xs">
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
              action.severity === 'urgent'
                ? 'bg-rose-50 text-rose-600'
                : action.severity === 'attention'
                ? 'bg-amber-50 text-amber-600'
                : 'bg-emerald-50 text-emerald-600'
            }`}>
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {action.severity} Action Reason
                </span>
                <span className="font-mono text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {sku}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-0.5">{action.title}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs">
          
          {/* Executive Summary */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-xs">
            <h4 className="font-bold text-emerald-900 uppercase tracking-wider text-[11px] mb-1">
              Decision Intelligence Summary
            </h4>
            <p className="text-slate-800 leading-relaxed font-medium">
              {whyData.summary}
            </p>
          </div>

          {/* Root Causes */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2 shadow-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Root Causes & Inventory Indicators
            </h4>
            <ul className="list-disc list-inside space-y-1.5 text-slate-700">
              {whyData.rootCauses.map((cause, i) => (
                <li key={i} className="leading-relaxed">{cause}</li>
              ))}
            </ul>
          </div>

          {/* Financial & Operational Trade-Off */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 shadow-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1">
              Financial Impact (BDT)
            </h4>
            <p className="text-slate-700 leading-relaxed">
              {whyData.financialImpact}
            </p>
          </div>

          {/* Recommended Action & Supplier Tip */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 shadow-xs">
              <span className="font-bold text-slate-900 text-[11px]">Next Action Step:</span>
              <p className="text-slate-700 mt-1 leading-relaxed">{whyData.recommendedAction}</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 shadow-xs">
              <span className="font-bold text-slate-900 text-[11px]">Supplier Recommendation:</span>
              <p className="text-slate-700 mt-1 leading-relaxed">{whyData.supplierTip}</p>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 flex items-center justify-between border-t border-slate-100 bg-white/95 px-6 py-3.5 backdrop-blur-xs">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-xs"
          >
            Close
          </button>

          {!isApproved ? (
            <button
              onClick={() => {
                onApprove(action);
                onClose();
              }}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Approve Action Recommendation
            </button>
          ) : (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-4 w-4" /> Already Approved
            </span>
          )}
        </div>

      </div>
    </div>
  );
};
