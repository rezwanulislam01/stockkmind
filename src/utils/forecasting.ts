import { DailySales, ForecastPoint, Product, ScenarioParams } from '../types';

/**
 * Calculates Holt's Linear Exponential Smoothing (Level & Trend)
 * Over historical time series to generate future k-step forecasts.
 */
export function calculateHoltsForecast(
  history: DailySales[],
  forecastDays: number = 14,
  alpha: number = 0.35,
  beta: number = 0.15
): ForecastPoint[] {
  if (!history || history.length === 0) return [];

  const n = history.length;
  // Initialize Level and Trend from first few points
  let level = history[0].sales;
  let trend = history.length > 1 ? history[1].sales - history[0].sales : 0;

  // Smoothing pass
  const fitted: number[] = [level];
  const residuals: number[] = [];

  for (let t = 1; t < n; t++) {
    const actual = history[t].sales;
    const prevLevel = level;
    const prevTrend = trend;

    // Update equations
    level = alpha * actual + (1 - alpha) * (prevLevel + prevTrend);
    trend = beta * (level - prevLevel) + (1 - beta) * prevTrend;

    const oneStepForecast = Math.max(0, prevLevel + prevTrend);
    fitted.push(oneStepForecast);
    residuals.push(actual - oneStepForecast);
  }

  // Calculate Root Mean Square Error (RMSE) for confidence bands
  const variance = residuals.length > 0
    ? residuals.reduce((sum, r) => sum + r * r, 0) / residuals.length
    : 1.0;
  const rmse = Math.sqrt(variance);

  const result: ForecastPoint[] = [];

  // 1. Add historical points (last 30 days for clean chart display)
  const displayHistory = history.slice(-30);
  displayHistory.forEach((item) => {
    result.push({
      date: item.date,
      historicalSales: item.sales,
      isForecast: false,
    });
  });

  // 2. Generate future k-step forecast
  const lastDateStr = history[n - 1].date;
  const lastDate = new Date(lastDateStr);

  for (let k = 1; k <= forecastDays; k++) {
    const nextDate = new Date(lastDate);
    nextDate.setDate(lastDate.getDate() + k);
    const dateFormatted = nextDate.toISOString().split('T')[0];

    // Holt forecast formula: F_{t+k} = Level_t + k * Trend_t
    const forecastedValue = Math.max(0, Number((level + k * trend).toFixed(1)));
    
    // Confidence interval widens with sqrt(k)
    const margin = 1.96 * rmse * Math.sqrt(k);
    const lower = Math.max(0, Number((forecastedValue - margin).toFixed(1)));
    const upper = Number((forecastedValue + margin).toFixed(1));

    result.push({
      date: dateFormatted,
      forecast: forecastedValue,
      lowerBound: lower,
      upperBound: upper,
      isForecast: true,
    });
  }

  return result;
}

/**
 * Calculates Risk Score (0-100) based on:
 * - Lead Time vs Days to Stockout
 * - Demand Velocity Trend %
 * - Current Stock vs Safety Stock Ratio
 */
export function calculateRiskScore(
  currentStock: number,
  dailyDemand: number,
  leadTimeDays: number,
  safetyStock: number,
  demandTrend: number = 0,
  daysWithoutSale: number = 0
): { riskScore: number; daysToStockout: number; status: 'healthy' | 'warning' | 'critical' | 'dead_stock' } {
  // Dead stock check: 28+ days with 0 sales
  if (daysWithoutSale >= 28 || dailyDemand === 0) {
    return {
      riskScore: 35, // Financial dead capital risk
      daysToStockout: 999,
      status: 'dead_stock',
    };
  }

  const effectiveDemand = Math.max(0.1, dailyDemand);
  const daysToStockout = Number((currentStock / effectiveDemand).toFixed(1));

  // Component 1: Lead Time vs Days to Stockout (Max 40 pts)
  // If Days to Stockout <= Lead Time, danger is immediate
  const leadTimeRatio = leadTimeDays / Math.max(0.2, daysToStockout);
  const comp1 = Math.min(40, leadTimeRatio * 20);

  // Component 2: Demand Trend % (Max 30 pts)
  // e.g. +30% surge increases risk
  const trendFactor = demandTrend > 0 ? (demandTrend / 100) * 30 : 0;
  const comp2 = Math.min(30, Math.max(0, trendFactor));

  // Component 3: Stock vs Safety Stock buffer deficit (Max 30 pts)
  const safetyDeficit = Math.max(0, 1 - currentStock / Math.max(1, safetyStock));
  const comp3 = safetyDeficit * 30;

  const rawScore = comp1 + comp2 + comp3;
  const riskScore = Math.min(100, Math.max(0, Math.round(rawScore)));

  let status: 'healthy' | 'warning' | 'critical' | 'dead_stock' = 'healthy';
  if (riskScore >= 75 || daysToStockout <= leadTimeDays) {
    status = 'critical';
  } else if (riskScore >= 45 || daysToStockout <= leadTimeDays * 1.8) {
    status = 'warning';
  }

  return { riskScore, daysToStockout, status };
}

export function calculateStockStatus(
  currentStock: number,
  dailyDemand: number,
  leadTimeDays: number,
  daysWithoutSale: number = 0
): 'healthy' | 'warning' | 'critical' | 'dead_stock' {
  if (daysWithoutSale >= 28 || dailyDemand === 0) return 'dead_stock';
  const effectiveDemand = Math.max(0.1, dailyDemand);
  const daysToStockout = currentStock / effectiveDemand;
  if (daysToStockout <= leadTimeDays) return 'critical';
  if (daysToStockout <= leadTimeDays * 1.8) return 'warning';
  return 'healthy';
}

/**
 * Modified EOQ (Economic Order Quantity)
 * EOQ = sqrt( (2 * AnnualDemand * SetupCost) / HoldingCostPerUnitPerYear )
 */
export function calculateEOQ(
  dailyDemand: number,
  costPrice: number,
  holdingCostAnnualRate: number = 0.18, // 18% annual holding cost
  orderSetupCost: number = 30 // $30 fixed order transaction cost
): number {
  const annualDemand = Math.max(10, dailyDemand * 365);
  const annualHoldingCost = Math.max(0.5, costPrice * holdingCostAnnualRate);
  const eoq = Math.sqrt((2 * annualDemand * orderSetupCost) / annualHoldingCost);
  return Math.max(10, Math.round(eoq));
}

/**
 * Dynamic Safety Stock & Reorder Point (ROP)
 */
export function calculateSafetyStockAndROP(
  dailyDemand: number,
  leadTimeDays: number,
  demandStdDev: number = 1.8
): { dynamicSafetyStock: number; safetyStock: number; reorderPoint: number } {
  // Z = 1.65 (95% service level)
  const zScore = 1.65;
  const dynamicSafetyStock = Math.round(zScore * demandStdDev * Math.sqrt(leadTimeDays));
  const reorderPoint = Math.round(dailyDemand * leadTimeDays + dynamicSafetyStock);
  return { dynamicSafetyStock, safetyStock: dynamicSafetyStock, reorderPoint };
}

/**
 * Calculates overall SME inventory health score (0-100)
 */
export function calculateOverallHealthScore(products: Product[]): {
  healthScore: number;
  totalValuation: number;
  deadCapital: number;
  criticalCount: number;
  attentionCount: number;
} {
  if (products.length === 0) {
    return { healthScore: 100, totalValuation: 0, deadCapital: 0, criticalCount: 0, attentionCount: 0 };
  }

  let totalValuation = 0;
  let deadCapital = 0;
  let criticalCount = 0;
  let attentionCount = 0;
  let weightedRiskSum = 0;

  products.forEach((p) => {
    const valuation = p.currentStock * p.unitPrice;
    totalValuation += valuation;

    if (p.status === 'dead_stock') {
      deadCapital += valuation;
      attentionCount++;
    } else if (p.status === 'critical') {
      criticalCount++;
    } else if (p.status === 'warning') {
      attentionCount++;
    }

    weightedRiskSum += p.riskScore;
  });

  const avgRisk = weightedRiskSum / products.length;
  const deadCapitalRatio = totalValuation > 0 ? (deadCapital / totalValuation) : 0;
  
  // Health score is inverted risk minus penalty for dead capital ratio and critical stockouts
  let score = 100 - avgRisk * 0.7 - deadCapitalRatio * 30 - criticalCount * 4;
  score = Math.min(100, Math.max(10, Math.round(score)));

  return {
    healthScore: score,
    totalValuation: Math.round(totalValuation),
    deadCapital: Math.round(deadCapital),
    criticalCount,
    attentionCount,
  };
}

export function calculateInventoryHealthScore(products: Product[]): number {
  return calculateOverallHealthScore(products).healthScore;
}

export function calculateTotalInventoryValuation(products: Product[]): number {
  return calculateOverallHealthScore(products).totalValuation;
}

export function calculateDeadStockCapital(products: Product[]): number {
  return calculateOverallHealthScore(products).deadCapital;
}

/**
 * Formats a monetary amount into Bangladeshi Taka (BDT / ৳)
 * with support for standard South Asian lakh/crore formatting or compact mode.
 */
export function formatBDT(amount: number, compact: boolean = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '৳ 0';
  if (compact) {
    if (Math.abs(amount) >= 10000000) {
      return `৳ ${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (Math.abs(amount) >= 100000) {
      return `৳ ${(amount / 100000).toFixed(2)} L`;
    }
    if (Math.abs(amount) >= 1000) {
      return `৳ ${(amount / 1000).toFixed(1)}k`;
    }
  }
  return `৳ ${Math.round(amount).toLocaleString('en-IN')}`;
}

/**
 * Interactive What-If Scenario Engine
 */
export function simulateScenario(product: Product, params: ScenarioParams) {
  const adjustedDemand = Math.max(0.1, product.dailyDemand * (1 + params.demandShiftPercent / 100));
  const adjustedLeadTime = Math.max(1, product.leadTimeDays + params.leadTimeDelayDays);
  const adjustedStock = product.currentStock + params.batchReorderQty;

  const newDaysToStockout = Number((adjustedStock / adjustedDemand).toFixed(1));
  const { riskScore: newRiskScore } = calculateRiskScore(
    adjustedStock,
    adjustedDemand,
    adjustedLeadTime,
    product.safetyStock,
    params.demandShiftPercent,
    product.daysWithoutSale
  );

  // Projected stockout date
  const stockoutDate = new Date();
  stockoutDate.setDate(stockoutDate.getDate() + Math.max(0, Math.floor(newDaysToStockout)));

  // Financial impact calculation
  const originalDays = product.currentStock / Math.max(0.1, product.dailyDemand);
  const daysDiff = newDaysToStockout - originalDays;
  const projectedRevenueImpact = Math.round(daysDiff * adjustedDemand * product.unitPrice);

  let recommendation = "";
  if (newRiskScore >= 75) {
    recommendation = `⚠️ High vulnerability: Expedite replenishment of +${Math.round(adjustedDemand * adjustedLeadTime * 1.5)} units to bridge the ${adjustedLeadTime}-day lead time.`;
  } else if (newRiskScore >= 45) {
    recommendation = `⚡ Moderate risk: Schedule a batch order of ${Math.round(product.eoq * 1.2)} units within ${Math.max(1, Math.floor(newDaysToStockout - adjustedLeadTime))} days.`;
  } else {
    recommendation = `✅ Resilient posture: Current inventory buffer withstands this scenario with ${newDaysToStockout} days of supply.`;
  }

  // 14-day projection curve for chart
  const stockTrendData = [];
  let simulatedStock = adjustedStock;
  let baselineStock = product.currentStock;

  for (let day = 0; day <= 14; day++) {
    const d = new Date();
    d.setDate(d.getDate() + day);
    const dayLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    stockTrendData.push({
      day: dayLabel,
      projectedStock: Math.max(0, Math.round(simulatedStock)),
      baselineStock: Math.max(0, Math.round(baselineStock)),
    });

    simulatedStock -= adjustedDemand;
    baselineStock -= product.dailyDemand;
  }

  return {
    newDaysToStockout,
    newRiskScore,
    projectedRevenueImpact,
    stockoutDate: stockoutDate.toISOString().split('T')[0],
    recommendedAction: recommendation,
    stockTrendData,
  };
}
