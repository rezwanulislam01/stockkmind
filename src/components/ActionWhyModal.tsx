import React from 'react';
import { 
  X, 
  Sparkles, 
  AlertTriangle, 
  Flame, 
  Percent, 
  CheckCircle2, 
  DollarSign, 
  Clock, 
  Building,
  HelpCircle
} from 'lucide-react';
import { AIActionItem } from '../types';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-fadeIn">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-950/95 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
              action.severity === 'urgent'
                ? 'bg-rose-500/20 text-rose-400'
                : action.severity === 'attention'
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-blue-500/20 text-blue-400'
            }`}>
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {action.severity} Action Reason
                </span>
                <span className="font-mono text-xs text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded">
                  {action.productSku}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mt-0.5">{action.title}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-xs">
          
          {/* Executive Summary */}
          <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4">
            <h4 className="font-bold text-indigo-300 uppercase tracking-wider text-[11px] mb-1">
              Executive AI Synthesis
            </h4>
            <p className="text-slate-200 leading-relaxed font-medium">
              {action.whyData.summary}
            </p>
          </div>

          {/* Root Causes */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 space-y-2">
            <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
              Root Causes & Causal Factors
            </h4>
            <ul className="list-disc list-inside space-y-1.5 text-slate-300">
              {action.whyData.rootCauses.map((cause, i) => (
                <li key={i} className="leading-relaxed">{cause}</li>
              ))}
            </ul>
          </div>

          {/* Financial & Operational Trade-Off */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
            <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] mb-1">
              Financial Impact & Risk Exposure
            </h4>
            <p className="text-slate-300 leading-relaxed">
              {action.whyData.financialImpact}
            </p>
          </div>

          {/* Recommended Action & Vendor Strategy */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3">
              <span className="font-bold text-emerald-400 text-[11px]">Specific Prescription:</span>
              <p className="text-slate-200 text-[11px] mt-1 leading-relaxed">{action.whyData.recommendedAction}</p>
            </div>

            <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-3">
              <span className="font-bold text-indigo-400 text-[11px]">Supplier Trade-off Tip:</span>
              <p className="text-slate-200 text-[11px] mt-1 leading-relaxed">{action.whyData.supplierTip}</p>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 flex items-center justify-between border-t border-slate-800 bg-slate-950/95 px-6 py-4 backdrop-blur-md">
          <span className="text-[11px] text-slate-400">
            Estimated Protected Value: <strong className="text-emerald-400">${action.avoidedLossEstimate.toLocaleString()}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
            >
              Dismiss
            </button>

            {!isApproved ? (
              <button
                onClick={() => {
                  onApprove(action);
                  onClose();
                }}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-md transition-all ${
                  action.severity === 'urgent'
                    ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Approve & Execute Action
              </button>
            ) : (
              <div className="text-xs font-semibold text-emerald-400 px-3 py-1 bg-emerald-950/40 rounded-lg border border-emerald-500/30">
                Action Approved & Tracked
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
