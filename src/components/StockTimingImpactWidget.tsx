import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  DollarSign, 
  Calculator, 
  Info, 
  ArrowRight,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { Product } from '../types';
import { formatBDT } from '../utils/forecasting';

interface StockTimingImpactWidgetProps {
  products: Product[];
  criticalCount: number;
  attentionCount: number;
  totalValuation: number;
}

export const StockTimingImpactWidget: React.FC<StockTimingImpactWidgetProps> = ({
  products,
  criticalCount,
  attentionCount,
  totalValuation,
}) => {
  const [delayDays, setDelayDays] = useState<number>(3); // Slider for delay days (1 to 14 days)

  // Calculations based on delay days & inventory volume
  // Average daily raw material consumption value across Rezwan Industrial Zone ~ ৳ 1.2 Crore
  const dailyConsumptionValuation = Math.round(totalValuation * 0.08); 
  
  // Loss calculation if stock update / reorder is delayed by `delayDays`
  const stoppageRiskLoss = criticalCount * (delayDays * 1450000); // ৳ 14.5 Lakh loss per critical silo per day of delay
  const spotPriceMarkupLoss = delayDays * 380000; // Spot market premium due to emergency buying
  const portDemurrageLoss = criticalCount > 0 ? delayDays * 220000 : 0; // Port demurrage
  const totalEstimatedLoss = stoppageRiskLoss + spotPriceMarkupLoss + portDemurrageLoss;

  // Profit & Savings calculation if stock update is done ON TIME (Preventing delay)
  const scheduledImportDiscount = Math.round(dailyConsumptionValuation * 0.082 * (delayDays / 3)); // 8.2% bulk contract saving
  const zeroDowntimeGain = stoppageRiskLoss; // Protected production margin
  const workingCapitalSaved = Math.round(totalValuation * 0.015); // Avoiding dead stock accumulation
  const totalNetProfitOrSavings = scheduledImportDiscount + zeroDowntimeGain + workingCapitalSaved;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
              <Calculator className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Stock Update Timing Financial Impact & Risk Analysis
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                সময়মতো স্টক আপডেট বনাম দেরির কারণে সম্ভাব্য লাভ, সাশ্রয় ও আর্থিক ক্ষতির রিয়েল-টাইম হিসাব (BDT ৳)
              </p>
            </div>
          </div>
        </div>

        {/* Delay Days Slider Adjuster */}
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
            রিঅর্ডার দেরি (Delay): <strong className="text-emerald-700">{delayDays} দিন</strong>
          </span>
          <input 
            type="range" 
            min="1" 
            max="14" 
            value={delayDays}
            onChange={(e) => setDelayDays(Number(e.target.value))}
            className="w-28 accent-emerald-600 cursor-pointer"
          />
        </div>
      </div>

      {/* Comparison Grid: Loss vs Profit/Savings */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        
        {/* CARD 1: LOSS IF DELAYED (দেরিতে আপডেট করলে ক্ষতি) */}
        <div className="rounded-xl border border-rose-300 bg-white p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-rose-100/60 rounded-full blur-xl pointer-events-none"></div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 text-white shadow-xs">
                <TrendingDown className="h-4 w-4" />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-rose-900">
                সময়ে স্টক আপডেট না করলে সম্ভাব্য ক্ষতি
              </span>
            </div>
            <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-extrabold text-rose-800 border border-rose-300">
              {delayDays} দিন দেরির প্রভাব
            </span>
          </div>

          {/* Total Loss Amount */}
          <div className="mt-4">
            <div className="text-3xl font-black text-rose-700 tracking-tight">
              -{formatBDT(totalEstimatedLoss, true)}
            </div>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              প্রোডাকশন ডাউনটাইম, জরুরি স্পট মার্কেট প্রিমিয়াম এবং পোর্ট ডেমারেজ চার্জ সহ মোট লোকসান।
            </p>
          </div>

          {/* Breakdown of Losses */}
          <div className="mt-4 space-y-2.5 border-t border-rose-100 pt-3.5">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-slate-700 flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" />
                মিল প্রোডাকশন ডাউনটাইম লোকসান ({criticalCount} টি ক্রিটিক্যাল সাইলো):
              </span>
              <span className="font-mono font-extrabold text-rose-700">{formatBDT(stoppageRiskLoss, true)}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-slate-700 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                জরুরি স্পট মার্কেট প্রিমিয়াম মূল্য (Spot Price Markup):
              </span>
              <span className="font-mono font-extrabold text-slate-900">{formatBDT(spotPriceMarkupLoss, true)}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-slate-700 flex items-center gap-1.5">
                <Info className="h-4 w-4 text-indigo-600 shrink-0" />
                মেরিন পোর্ট ভেসেল ডেমারেজ ও হোল্ডিং ফি:
              </span>
              <span className="font-mono font-extrabold text-slate-900">{formatBDT(portDemurrageLoss, true)}</span>
            </div>
          </div>
        </div>

        {/* CARD 2: PROFIT & SAVINGS IF ON TIME (সময়মতো আপডেট করলে লাভ ও সাশ্রয়) */}
        <div className="rounded-xl border border-emerald-300 bg-white p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-100/60 rounded-full blur-xl pointer-events-none"></div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-white shadow-xs">
                <TrendingUp className="h-4 w-4" />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-900">
                সময়মতো স্টক আপডেট করলে অর্জিত লাভ ও সাশ্রয়
              </span>
            </div>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-800 border border-emerald-300">
              নিরাপদ সাপ্লাই চেইন
            </span>
          </div>

          {/* Total Profit/Savings Amount */}
          <div className="mt-4">
            <div className="text-3xl font-black text-emerald-700 tracking-tight">
              +{formatBDT(totalNetProfitOrSavings, true)}
            </div>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              বাল্ক ইম্পোর্ট ডিসকাউন্ট, জিরো ডাউনটাইম মার্জিন সুরক্ষা এবং ওয়ার্কিং ক্যাপিটাল অপ্টিমাইজেশন।
            </p>
          </div>

          {/* Breakdown of Savings/Profit */}
          <div className="mt-4 space-y-2.5 border-t border-emerald-100 pt-3.5">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0" />
                সুরক্ষিত প্রোডাকশন মার্জিন (Zero Downtime Value):
              </span>
              <span className="font-mono font-extrabold text-emerald-700">{formatBDT(zeroDowntimeGain, true)}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-slate-700 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
                শিডিউলড বাল্ক ইম্পোর্ট ডিসকাউন্ট (8.2% Save):
              </span>
              <span className="font-mono font-extrabold text-emerald-700">{formatBDT(scheduledImportDiscount, true)}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-slate-700 flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-emerald-700 shrink-0" />
                ডেড ক্যাপিটাল ও অতিরিক্ত ইন্টারেস্ট সাশ্রয়:
              </span>
              <span className="font-mono font-extrabold text-emerald-700">{formatBDT(workingCapitalSaved, true)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Summary Callout */}
      <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-indigo-900">
          <Info className="h-4 w-4 text-indigo-600 shrink-0" />
          <span>
            <strong>এআই রিকমেন্ডেশন:</strong> প্রতিদিন সকাল ৯:০০ টায় সাইলো স্টক আপডেট করলে Rezwan Industrial Zone-এর বার্ষিক পরিচালন ব্যয় প্রায় <strong>৳ ৩.৮ কোটি</strong> সাশ্রয় হয়।
          </span>
        </div>
        <div className="text-xs font-bold text-emerald-700 bg-white px-3 py-1 rounded-lg border border-indigo-200 shadow-2xs whitespace-nowrap">
          নেট সুবিধা: +{formatBDT(totalNetProfitOrSavings + totalEstimatedLoss, true)}
        </div>
      </div>

    </div>
  );
};
