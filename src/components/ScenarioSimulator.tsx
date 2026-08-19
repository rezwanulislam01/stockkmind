import React, { useState, useMemo } from 'react';
import { 
  Sliders, 
  TrendingUp, 
  Clock, 
  Package, 
  Sparkles, 
  RotateCcw,
  Zap,
  ChevronDown
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine
} from 'recharts';
import { Product } from '../types';
import { simulateScenario, formatBDT } from '../utils/forecasting';

interface ScenarioSimulatorProps {
  products: Product[];
  selectedProduct: Product | null;
  onSelectProduct: (product: Product) => void;
  onApplySimulationToInventory?: (productId: string, reorderQty: number) => void;
}

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({
  products,
  selectedProduct,
  onSelectProduct,
}) => {
  const currentProduct = selectedProduct || products[0] || null;

  const [demandShiftPercent, setDemandShiftPercent] = useState<number>(0);
  const [leadTimeDelayDays, setLeadTimeDelayDays] = useState<number>(0);
  const [batchReorderQty, setBatchReorderQty] = useState<number>(0);

  // Compute scenario dynamically
  const simulation = useMemo(() => {
    if (!currentProduct) return null;
    return simulateScenario(currentProduct, {
      productId: currentProduct.id,
      demandShiftPercent,
      leadTimeDelayDays,
      batchReorderQty,
    });
  }, [currentProduct, demandShiftPercent, leadTimeDelayDays, batchReorderQty]);

  if (!currentProduct || !simulation) {
    return <div className="p-8 text-center text-slate-500">No product selected for simulation.</div>;
  }

  // Preset Scenario Handlers
  const handlePreset = (name: 'black_friday' | 'port_strike' | 'soft_landing' | 'emergency_injection' | 'reset') => {
    switch (name) {
      case 'black_friday':
        setDemandShiftPercent(75);
        setLeadTimeDelayDays(1);
        setBatchReorderQty(0);
        break;
      case 'port_strike':
        setDemandShiftPercent(10);
        setLeadTimeDelayDays(6);
        setBatchReorderQty(0);
        break;
      case 'soft_landing':
        setDemandShiftPercent(-30);
        setLeadTimeDelayDays(0);
        setBatchReorderQty(40);
        break;
      case 'emergency_injection':
        setDemandShiftPercent(20);
        setLeadTimeDelayDays(0);
        setBatchReorderQty(120);
        break;
      case 'reset':
      default:
        setDemandShiftPercent(0);
        setLeadTimeDelayDays(0);
        setBatchReorderQty(0);
        break;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Product Switcher */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Sliders className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Interactive &quot;What-If&quot; Scenario Simulator</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Stress-test demand shocks, supplier delays across Bangladesh routes, and batch injection strategies.
          </p>
        </div>

        {/* SKU Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-slate-600">Test SKU:</label>
          <div className="relative">
            <select
              value={currentProduct.id}
              onChange={(e) => {
                const found = products.find(p => p.id === e.target.value);
                if (found) onSelectProduct(found);
              }}
              className="appearance-none rounded-lg border border-slate-300 bg-white py-2 pl-3 pr-9 text-xs font-semibold text-slate-900 transition-all hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer shadow-xs"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id} className="bg-white text-slate-900">
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Quick Scenario Preset Pills */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
        <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
          <Zap className="h-3.5 w-3.5 text-amber-500" /> Quick Stress Presets:
        </span>
        <button
          onClick={() => handlePreset('black_friday')}
          className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition-all hover:bg-slate-100 hover:text-slate-900 shadow-xs"
        >
          🔥 Eid / Festival Surge (+75% Demand)
        </button>
        <button
          onClick={() => handlePreset('port_strike')}
          className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition-all hover:bg-slate-100 hover:text-slate-900 shadow-xs"
        >
          ⏱️ Supply Chain Shock (+6d Transit Delay)
        </button>
        <button
          onClick={() => handlePreset('emergency_injection')}
          className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition-all hover:bg-slate-100 hover:text-slate-900 shadow-xs"
        >
          📦 Emergency Batch Buffer (+120 Units)
        </button>
        <button
          onClick={() => handlePreset('soft_landing')}
          className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition-all hover:bg-slate-100 hover:text-slate-900 shadow-xs"
        >
          📉 Demand Softening (-30%)
        </button>
        <button
          onClick={() => handlePreset('reset')}
          className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 ml-auto shadow-xs"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>

      {/* Main Simulation Layout: Sliders (Left) vs Live Intelligence (Right) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* Left 5 Cols: Sliders & Controls */}
        <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Scenario Parameters</h3>
            <span className="text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
              {currentProduct.sku}
            </span>
          </div>

          {/* Slider 1: Demand Shift */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                Demand Shift Velocity:
              </span>
              <span className={`font-mono font-bold text-sm ${demandShiftPercent > 0 ? 'text-emerald-700' : demandShiftPercent < 0 ? 'text-amber-700' : 'text-slate-900'}`}>
                {demandShiftPercent > 0 ? `+${demandShiftPercent}` : demandShiftPercent}%
              </span>
            </div>
            <input
              type="range"
              min="-50"
              max="100"
              step="5"
              value={demandShiftPercent}
              onChange={(e) => setDemandShiftPercent(parseInt(e.target.value))}
              className="mt-1 w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>-50% (Slump)</span>
              <span>Baseline (0%)</span>
              <span>+100% (Doubled)</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Simulated Daily Rate: <strong className="text-slate-800">{(currentProduct.dailyDemand * (1 + demandShiftPercent / 100)).toFixed(1)} units/day</strong> (vs {currentProduct.dailyDemand} baseline).
            </p>
          </div>

          {/* Slider 2: Supplier Lead Time Delay */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-amber-600" />
                Supplier Lead Time Delay:
              </span>
              <span className="font-mono font-bold text-sm text-amber-700">
                +{leadTimeDelayDays} Days Delay
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={leadTimeDelayDays}
              onChange={(e) => setLeadTimeDelayDays(parseInt(e.target.value))}
              className="mt-1 w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0 Days (On-Time)</span>
              <span>+5 Days</span>
              <span>+10 Days (Highway Bottleneck)</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Total Transit Time: <strong className="text-slate-800">{currentProduct.leadTimeDays + leadTimeDelayDays} Days</strong> (vs {currentProduct.leadTimeDays}d standard).
            </p>
          </div>

          {/* Slider 3: Batch Reorder Quantity */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Package className="h-4 w-4 text-emerald-600" />
                Batch Reorder Quantity:
              </span>
              <span className="font-mono font-bold text-sm text-emerald-700">
                +{batchReorderQty} Units
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="400"
              step="10"
              value={batchReorderQty}
              onChange={(e) => setBatchReorderQty(parseInt(e.target.value))}
              className="mt-1 w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0 (No Order)</span>
              <span>+200 units</span>
              <span>+400 units (Heavy Buffer)</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Simulated Initial Stock: <strong className="text-slate-800">{currentProduct.currentStock + batchReorderQty} units</strong> (vs {currentProduct.currentStock} on hand).
            </p>
          </div>

        </div>

        {/* Right 7 Cols: Real-Time Results & 14-Day Depletion Curve */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Live Outcome Metrics */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            
            {/* New Risk Score */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-xs text-slate-500">Simulated Risk Score</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className={`text-3xl font-bold ${
                  simulation.newRiskScore >= 75 ? 'text-rose-600' : simulation.newRiskScore >= 45 ? 'text-amber-600' : 'text-emerald-700'
                }`}>
                  {simulation.newRiskScore}
                </span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Baseline Risk: <strong className="text-slate-800">{currentProduct.riskScore}/100</strong>
              </p>
            </div>

            {/* Days to Stockout */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-xs text-slate-500">Days to Stockout</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className={`text-3xl font-bold ${simulation.newDaysToStockout <= (currentProduct.leadTimeDays + leadTimeDelayDays) ? 'text-rose-600' : 'text-slate-900'}`}>
                  {simulation.newDaysToStockout}
                </span>
                <span className="text-xs text-slate-400">Days</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Stockout Date: <strong className="text-slate-800">{simulation.stockoutDate}</strong>
              </p>
            </div>

            {/* Revenue Impact */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-xs text-slate-500">Projected Revenue Impact</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className={`text-2xl font-bold ${simulation.projectedRevenueImpact >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {simulation.projectedRevenueImpact >= 0 ? `+${formatBDT(simulation.projectedRevenueImpact)}` : `-${formatBDT(Math.abs(simulation.projectedRevenueImpact))}`}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Delta based on retail BDT pricing
              </p>
            </div>

          </div>

          {/* Real-time 14-Day Depletion Curve Chart */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                14-Day Inventory Depletion Trajectory
              </h4>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-slate-400"></span> Baseline Run
                </span>
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-emerald-600"></span> Simulated Scenario
                </span>
              </div>
            </div>

            <div className="mt-4 h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={simulation.stockTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-xl border border-slate-200 bg-white p-2.5 text-xs shadow-md">
                            <p className="font-semibold text-slate-900">{label}</p>
                            <p className="text-emerald-700 font-medium">
                              Simulated Stock: <strong>{payload[0]?.value} units</strong>
                            </p>
                            <p className="text-slate-500">
                              Baseline Stock: <strong>{payload[1]?.value} units</strong>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine y={currentProduct.safetyStock} stroke="#f59e0b" strokeDasharray="3 3" />
                  <Line 
                    type="monotone" 
                    dataKey="projectedStock" 
                    stroke="#059669" 
                    strokeWidth={2.5} 
                    dot={false}
                    name="Simulated Scenario"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="baselineStock" 
                    stroke="#94a3b8" 
                    strokeWidth={1.5} 
                    strokeDasharray="4 4"
                    dot={false}
                    name="Baseline Run"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Prescriptive Recommendation Callout */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-xs text-emerald-900 shadow-xs">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900 mb-1">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              StockMind Prescriptive Action
            </div>
            <p className="leading-relaxed text-slate-700">{simulation.recommendedAction}</p>
          </div>

        </div>

      </div>

    </div>
  );
};
