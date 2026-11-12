import React from 'react';
import { Product } from '../types';
import { AlertCircle, AlertTriangle, CheckCircle2, TrendingDown, Radio, Factory } from 'lucide-react';
import { formatBDT } from '../utils/forecasting';

interface LiveStockTickerProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const LiveStockTicker: React.FC<LiveStockTickerProps> = ({
  products,
  onSelectProduct,
}) => {
  // Sort or duplicate items for seamless endless loop
  const tickerItems = [...products, ...products];

  const getStatusBadge = (p: Product) => {
    const unit = p.unitOfMeasure || 'MT';
    const daysToStockout = p.dailyDemand > 0 ? (p.currentStock / p.dailyDemand).toFixed(1) : '∞';
    const healthScore = Math.max(0, 100 - p.riskScore);
    
    if (p.status === 'critical') {
      return (
        <span className="flex items-center gap-1 rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400 border border-rose-500/30">
          <AlertCircle className="h-2.5 w-2.5" />
          <span>সাইলো সংকট (স্বাস্থ্য: {healthScore}% • স্টক: {p.currentStock} {unit})</span>
        </span>
      );
    }
    if (p.status === 'warning') {
      return (
        <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400 border border-amber-500/30">
          <AlertTriangle className="h-2.5 w-2.5" />
          <span>সতর্কতা (স্বাস্থ্য: {healthScore}% • স্টক: {p.currentStock} {unit})</span>
        </span>
      );
    }
    if (p.status === 'dead_stock') {
      return (
        <span className="flex items-center gap-1 rounded-full bg-purple-500/15 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-400 border border-purple-500/30">
          <TrendingDown className="h-2.5 w-2.5" />
          <span>অচল স্টক (স্বাস্থ্য: {healthScore}% • {p.daysWithoutSale}d স্থবির)</span>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
        <CheckCircle2 className="h-2.5 w-2.5" />
        <span>ফ্যাক্টরি সুস্থ (স্বাস্থ্য: {healthScore}% • স্টক: {p.currentStock} {unit})</span>
      </span>
    );
  };

  return (
    <div className="relative w-full border-y border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs py-2 shadow-2xs overflow-hidden transition-colors">
      <div className="flex items-center">
        
        {/* Left Ticker Label */}
        <div className="z-10 flex shrink-0 items-center gap-1.5 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1 font-bold text-xs shadow-xs">
          <Radio className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
          <span className="text-slate-900 dark:text-white font-extrabold tracking-tight">Rezwan Industrial Zone — ফ্যাক্টরি হেলথ ও সাইলো স্টক পালস</span>
          <span className="rounded bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.2 text-[10px] text-emerald-800 dark:text-emerald-300 font-mono border border-emerald-200">
            {products.length} Silos
          </span>
        </div>

        {/* Marquee Track scrolling Right to Left */}
        <div className="flex-1 overflow-hidden">
          <div className="flex w-max animate-marquee hover:[animation-play-state:paused] items-center gap-4 pl-4 cursor-pointer">
            {tickerItems.map((p, idx) => {
              const divisionName = (p.plantDivision || 'SSR Industrial Plant').replace('Nabil', 'SSR');
              return (
                <div
                  key={`${p.id}-${idx}`}
                  onClick={() => onSelectProduct(p)}
                  className="flex items-center gap-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-all hover:scale-[1.02] shadow-2xs"
                >
                  {/* Division / Thumbnail Icon */}
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    <Factory className="h-3.5 w-3.5" />
                  </div>

                  {/* Details */}
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                      [{divisionName}]
                    </span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 max-w-[160px] truncate">
                      {p.name}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      {formatBDT(p.unitPrice, true)}
                    </span>
                    {getStatusBadge(p)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
