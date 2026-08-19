import { AIActionItem, Product, PurchaseOrder, Supplier } from '../types';
import { calculateEOQ, calculateRiskScore } from '../utils/forecasting';

// Helper to generate 90-day daily sales history
function generateSalesHistory(avgDemand: number, volatility: number = 0.25, trend: number = 0, zeroDaysCount: number = 0) {
  const history = [];
  const today = new Date();

  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // Check if within the zero sales period (for dead stock)
    if (i < zeroDaysCount) {
      history.push({ date: dateStr, sales: 0 });
      continue;
    }

    // Weekly seasonality (Fridays & Saturdays +25% in Bangladesh retail)
    const dayOfWeek = d.getDay();
    const weekendMultiplier = (dayOfWeek === 5 || dayOfWeek === 6) ? 1.25 : 0.95;

    // Trend progression over 90 days
    const trendMultiplier = 1 + (trend / 100) * ((90 - i) / 90);

    // Random Gaussian noise
    const noise = (Math.random() - 0.5) * 2 * volatility;
    const sales = Math.max(0, Math.round(avgDemand * weekendMultiplier * trendMultiplier * (1 + noise)));

    history.push({ date: dateStr, sales });
  }

  return history;
}

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    name: 'Meghna Consumer Goods Ltd (Fresh)',
    rating: 4.9,
    reliability: 98,
    baseLeadTime: 3,
    expeditedLeadTime: 1,
    unitCostMarkup: 1.0,
    minOrderQty: 25,
    location: 'Tejgaon Industrial Area, Dhaka',
    contactEmail: 'orders@meghnagroup.biz',
  },
  {
    id: 'sup-2',
    name: 'City Group Distribution (Teer)',
    rating: 4.7,
    reliability: 96,
    baseLeadTime: 2,
    expeditedLeadTime: 1,
    unitCostMarkup: 1.02,
    minOrderQty: 20,
    location: 'Gandaria & Narayanganj Depot',
    contactEmail: 'sales@citygroup.com.bd',
  },
  {
    id: 'sup-3',
    name: 'Square Consumer Products (Radhuni/Meril)',
    rating: 4.9,
    reliability: 99,
    baseLeadTime: 4,
    expeditedLeadTime: 2,
    unitCostMarkup: 1.0,
    minOrderQty: 30,
    location: 'Uttara & Pabna Central Plant',
    contactEmail: 'distributors@squaregroup.com',
  },
  {
    id: 'sup-4',
    name: 'PRAN-RFL Agro Logistics',
    rating: 4.6,
    reliability: 94,
    baseLeadTime: 3,
    expeditedLeadTime: 2,
    unitCostMarkup: 1.0,
    minOrderQty: 40,
    location: 'Pran Industrial Park, Narsingdi',
    contactEmail: 'b2b@prangroup.com',
  },
  {
    id: 'sup-5',
    name: 'Khatunganj Wholesale Traders Co.',
    rating: 4.4,
    reliability: 90,
    baseLeadTime: 6,
    expeditedLeadTime: 4,
    unitCostMarkup: 0.94, // 6% wholesale discount
    minOrderQty: 80,
    location: 'Khatunganj Commercial Hub, Chattogram',
    contactEmail: 'bulk@khatunganjtraders.bd',
  },
  {
    id: 'sup-6',
    name: 'Walton Hi-Tech Distribution Hub',
    rating: 4.8,
    reliability: 97,
    baseLeadTime: 5,
    expeditedLeadTime: 3,
    unitCostMarkup: 0.96,
    minOrderQty: 15,
    location: 'Chandra, Gazipur',
    contactEmail: 'corporate.sales@waltonbd.com',
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  // 1. Critical Stockout (Staples)
  {
    id: 'prod-1',
    sku: 'GRO-OIL-5L',
    name: 'Teer Fortified Soybean Oil (5L Can)',
    category: 'Groceries',
    currentStock: 18,
    unitPrice: 890, // BDT
    costPrice: 810,
    dailyDemand: 6.5,
    leadTimeDays: 3,
    safetyStock: 25,
    reorderPoint: 45,
    eoq: 60,
    holdingCostPerYear: 90,
    orderSetupCost: 400,
    demandTrend: 18,
    daysWithoutSale: 0,
    status: 'critical',
    riskScore: 92,
    confidenceBoundLower: 4.5,
    confidenceBoundUpper: 8.5,
    salesHistory: generateSalesHistory(6.5, 0.2, 18),
    notes: 'Urgent stockout threat: Only 2.7 days of stock left. Replenishment lead time is 3 days from City Group Narayanganj.',
  },

  // 2. High Demand Acceleration (Rice)
  {
    id: 'prod-2',
    sku: 'GRO-RICE-50K',
    name: 'Miniket Premium Rice (50kg Bag)',
    category: 'Groceries',
    currentStock: 42,
    unitPrice: 3850, // BDT
    costPrice: 3500,
    dailyDemand: 8.2,
    leadTimeDays: 4,
    safetyStock: 35,
    reorderPoint: 68,
    eoq: 80,
    holdingCostPerYear: 350,
    orderSetupCost: 800,
    demandTrend: 24,
    daysWithoutSale: 0,
    status: 'warning',
    riskScore: 68,
    confidenceBoundLower: 6.5,
    confidenceBoundUpper: 10.5,
    salesHistory: generateSalesHistory(8.2, 0.18, 24),
    notes: 'Demand accelerating (+24%) due to wedding & festival season. Recommend raising safety buffer to 45 bags.',
  },

  // 3. Dead Capital / Stagnant Inventory
  {
    id: 'prod-3',
    sku: 'COS-SCRUB-500',
    name: 'Imported Walnut Glow Face Scrub (500ml)',
    category: 'Personal Care',
    currentStock: 85,
    unitPrice: 1250, // BDT
    costPrice: 950,
    dailyDemand: 0.1,
    leadTimeDays: 5,
    safetyStock: 10,
    reorderPoint: 15,
    eoq: 20,
    holdingCostPerYear: 180,
    orderSetupCost: 350,
    demandTrend: -85,
    daysWithoutSale: 42,
    status: 'dead_stock',
    riskScore: 78,
    confidenceBoundLower: 0,
    confidenceBoundUpper: 0.5,
    salesHistory: generateSalesHistory(0.1, 0.1, -85, 42),
    notes: 'Dead Capital: ৳ 1,06,250 tied up across 85 units with zero sales in 42 days. Recommend 35% clearance bundle.',
  },

  // 4. Stable Healthy SKU (Lentils)
  {
    id: 'prod-4',
    sku: 'GRO-DAAL-25K',
    name: 'Fresh Red Lentils / Mosharir Daal (25kg Sack)',
    category: 'Groceries',
    currentStock: 65,
    unitPrice: 3600, // BDT
    costPrice: 3250,
    dailyDemand: 4.8,
    leadTimeDays: 3,
    safetyStock: 20,
    reorderPoint: 35,
    eoq: 40,
    holdingCostPerYear: 320,
    orderSetupCost: 500,
    demandTrend: 2,
    daysWithoutSale: 0,
    status: 'healthy',
    riskScore: 18,
    confidenceBoundLower: 3.8,
    confidenceBoundUpper: 5.8,
    salesHistory: generateSalesHistory(4.8, 0.15, 2),
    notes: 'Optimal healthy cadence. Sourced directly from Meghna Consumer Goods.',
  },

  // 5. High Velocity Beverage (Tea)
  {
    id: 'prod-5',
    sku: 'BEV-TEA-500',
    name: 'Ispahani Mirzapore Black Tea (500g Pack)',
    category: 'Beverages',
    currentStock: 120,
    unitPrice: 420, // BDT
    costPrice: 365,
    dailyDemand: 16.0,
    leadTimeDays: 2,
    safetyStock: 40,
    reorderPoint: 72,
    eoq: 150,
    holdingCostPerYear: 45,
    orderSetupCost: 300,
    demandTrend: 8,
    daysWithoutSale: 0,
    status: 'healthy',
    riskScore: 22,
    confidenceBoundLower: 13.0,
    confidenceBoundUpper: 19.0,
    salesHistory: generateSalesHistory(16.0, 0.12, 8),
    notes: 'High velocity staple with fast 2-day local distributor turnaround.',
  },

  // 6. Mustard Oil (Cooking Spices)
  {
    id: 'prod-6',
    sku: 'GRO-MUST-1L',
    name: 'Radhuni Pure Mustard Oil (1L Bottle)',
    category: 'Groceries',
    currentStock: 22,
    unitPrice: 340, // BDT
    costPrice: 295,
    dailyDemand: 5.5,
    leadTimeDays: 4,
    safetyStock: 25,
    reorderPoint: 47,
    eoq: 80,
    holdingCostPerYear: 35,
    orderSetupCost: 350,
    demandTrend: 12,
    daysWithoutSale: 0,
    status: 'critical',
    riskScore: 86,
    confidenceBoundLower: 4.0,
    confidenceBoundUpper: 7.0,
    salesHistory: generateSalesHistory(5.5, 0.15, 12),
    notes: 'Stockout alert: 4 days of stock remaining with 4-day delivery from Square Consumer Products.',
  },

  // 7. Salt (Essential Staple)
  {
    id: 'prod-7',
    sku: 'GRO-SALT-1K',
    name: 'ACI Pure Vacuum Evaporated Salt (1kg Pack)',
    category: 'Groceries',
    currentStock: 210,
    unitPrice: 42, // BDT
    costPrice: 34,
    dailyDemand: 22.0,
    leadTimeDays: 2,
    safetyStock: 60,
    reorderPoint: 104,
    eoq: 250,
    holdingCostPerYear: 6,
    orderSetupCost: 200,
    demandTrend: 4,
    daysWithoutSale: 0,
    status: 'healthy',
    riskScore: 16,
    confidenceBoundLower: 18.0,
    confidenceBoundUpper: 26.0,
    salesHistory: generateSalesHistory(22.0, 0.1, 4),
    notes: 'High turnover essential staple with low holding cost.',
  },

  // 8. Juice Case (PRAN)
  {
    id: 'prod-8',
    sku: 'BEV-FRUT-24P',
    name: 'PRAN Frooto Mango Juice (250ml x 24 Box)',
    category: 'Beverages',
    currentStock: 34,
    unitPrice: 720, // BDT
    costPrice: 620,
    dailyDemand: 4.2,
    leadTimeDays: 3,
    safetyStock: 18,
    reorderPoint: 31,
    eoq: 50,
    holdingCostPerYear: 80,
    orderSetupCost: 350,
    demandTrend: 15,
    daysWithoutSale: 0,
    status: 'warning',
    riskScore: 62,
    confidenceBoundLower: 3.2,
    confidenceBoundUpper: 5.5,
    salesHistory: generateSalesHistory(4.2, 0.2, 15),
    notes: 'Summer surge: Daily velocity up 15%. Reorder from PRAN-RFL logistics.',
  },

  // 9. Atta / Flour
  {
    id: 'prod-9',
    sku: 'GRO-ATTA-2K',
    name: 'Teer Premium White Atta (2kg Pack)',
    category: 'Groceries',
    currentStock: 95,
    unitPrice: 130, // BDT
    costPrice: 112,
    dailyDemand: 11.0,
    leadTimeDays: 2,
    safetyStock: 30,
    reorderPoint: 52,
    eoq: 120,
    holdingCostPerYear: 18,
    orderSetupCost: 250,
    demandTrend: 5,
    daysWithoutSale: 0,
    status: 'healthy',
    riskScore: 20,
    confidenceBoundLower: 9.0,
    confidenceBoundUpper: 13.0,
    salesHistory: generateSalesHistory(11.0, 0.14, 5),
    notes: 'Fast turnover daily baking staple.',
  },

  // 10. Personal Care Soap
  {
    id: 'prod-10',
    sku: 'PC-TIBET-24B',
    name: 'Tibet Luxury Beauty Soap (100g x 24 Pack)',
    category: 'Personal Care',
    currentStock: 40,
    unitPrice: 1200, // BDT
    costPrice: 1040,
    dailyDemand: 3.0,
    leadTimeDays: 4,
    safetyStock: 15,
    reorderPoint: 27,
    eoq: 40,
    holdingCostPerYear: 120,
    orderSetupCost: 300,
    demandTrend: 0,
    daysWithoutSale: 1,
    status: 'healthy',
    riskScore: 28,
    confidenceBoundLower: 2.2,
    confidenceBoundUpper: 3.8,
    salesHistory: generateSalesHistory(3.0, 0.15, 0),
    notes: 'Consistent daily hygiene sales volume.',
  },

  // 11. Dead Stock: Discontinued Hair Styling Gel
  {
    id: 'prod-11',
    sku: 'PC-GEL-250',
    name: 'Retro Spiky Hair Styling Wax (250g Jar)',
    category: 'Personal Care',
    currentStock: 48,
    unitPrice: 650, // BDT
    costPrice: 480,
    dailyDemand: 0.05,
    leadTimeDays: 6,
    safetyStock: 8,
    reorderPoint: 12,
    eoq: 15,
    holdingCostPerYear: 90,
    orderSetupCost: 250,
    demandTrend: -92,
    daysWithoutSale: 58,
    status: 'dead_stock',
    riskScore: 84,
    confidenceBoundLower: 0,
    confidenceBoundUpper: 0.2,
    salesHistory: generateSalesHistory(0.05, 0.05, -92, 58),
    notes: 'Dead stock: ৳ 31,200 locked up with zero demand in nearly 2 months. Liquidate or return to vendor.',
  },

  // 12. Walton Electronics
  {
    id: 'prod-12',
    sku: 'ELE-WALT-LED',
    name: 'Walton Primo 12W Energy LED Bulb (10-Pack Box)',
    category: 'Electronics',
    currentStock: 16,
    unitPrice: 2400, // BDT
    costPrice: 2050,
    dailyDemand: 2.5,
    leadTimeDays: 5,
    safetyStock: 12,
    reorderPoint: 25,
    eoq: 30,
    holdingCostPerYear: 260,
    orderSetupCost: 500,
    demandTrend: 10,
    daysWithoutSale: 0,
    status: 'critical',
    riskScore: 88,
    confidenceBoundLower: 1.8,
    confidenceBoundUpper: 3.2,
    salesHistory: generateSalesHistory(2.5, 0.18, 10),
    notes: 'Low stock: 6.4 days of coverage vs 5-day factory delivery from Walton Chandra.',
  },
];

export const INITIAL_ACTION_QUEUE: AIActionItem[] = [
  {
    id: 'action-1',
    productId: 'prod-1',
    productName: 'Teer Fortified Soybean Oil (5L Can)',
    sku: 'GRO-OIL-5L',
    category: 'Groceries',
    actionType: 'reorder',
    severity: 'urgent',
    title: 'Critical Stockout Alert: 2.7 Days Left',
    reasoning: 'At current sales velocity (6.5 cans/day), current inventory (18 units) will deplete before standard delivery arrives. Expedited replenishment of 60 units from City Group Narayanganj is strongly recommended.',
    suggestedQuantity: 60,
    suggestedSupplierId: 'sup-2',
    avoidedLossEstimate: 14800, // BDT
    confidenceScore: 96,
    status: 'pending',
    createdAt: new Date().toISOString(),
    metrics: {
      daysToStockout: 2.7,
      holdingCostReduction: 2400,
      leadTimeVariance: 1,
      supplierReliability: 96,
    },
  },
  {
    id: 'action-2',
    productId: 'prod-6',
    productName: 'Radhuni Pure Mustard Oil (1L Bottle)',
    sku: 'GRO-MUST-1L',
    category: 'Groceries',
    actionType: 'reorder',
    severity: 'urgent',
    title: 'Imminent Stockout Threat (4 Days Buffer)',
    reasoning: 'On-hand stock (22 units) matches supplier delivery cycle (4 days). Reorder 80 units immediately to avoid lost margin during weekend rush.',
    suggestedQuantity: 80,
    suggestedSupplierId: 'sup-3',
    avoidedLossEstimate: 7200, // BDT
    confidenceScore: 94,
    status: 'pending',
    createdAt: new Date().toISOString(),
    metrics: {
      daysToStockout: 4.0,
      holdingCostReduction: 1200,
      leadTimeVariance: 1,
      supplierReliability: 99,
    },
  },
  {
    id: 'action-3',
    productId: 'prod-2',
    productName: 'Miniket Premium Rice (50kg Bag)',
    sku: 'GRO-RICE-50K',
    category: 'Groceries',
    actionType: 'adjust_buffer',
    severity: 'attention',
    title: 'Demand Acceleration Detected (+24% Surge)',
    reasoning: 'Daily run rate jumped from 6.6 to 8.2 bags/day. Increase safety buffer from 35 to 48 bags to avoid future stockouts during peak market cycles.',
    suggestedQuantity: 48,
    suggestedSupplierId: 'sup-5',
    avoidedLossEstimate: 22000, // BDT
    confidenceScore: 91,
    status: 'pending',
    createdAt: new Date().toISOString(),
    metrics: {
      daysToStockout: 5.1,
      holdingCostReduction: 4200,
      leadTimeVariance: 2,
      supplierReliability: 90,
    },
  },
  {
    id: 'action-4',
    productId: 'prod-3',
    productName: 'Imported Walnut Glow Face Scrub (500ml)',
    sku: 'COS-SCRUB-500',
    category: 'Personal Care',
    actionType: 'liquidate',
    severity: 'optimize',
    title: 'Dead Capital Liquidation: ৳ 1,06,250 Trapped',
    reasoning: '85 units stagnant with 42 days of zero consumer sales. Apply a 30% discount or bundle with fast-moving bath soaps to recover working capital.',
    suggestedQuantity: 85,
    suggestedSupplierId: 'sup-3',
    avoidedLossEstimate: 42500, // BDT
    confidenceScore: 89,
    status: 'pending',
    createdAt: new Date().toISOString(),
    metrics: {
      daysToStockout: 850,
      holdingCostReduction: 15300,
      leadTimeVariance: 0,
      supplierReliability: 99,
    },
  },
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-1',
    poNumber: 'PO-BD-2026-081',
    supplierId: 'sup-1',
    supplierName: 'Meghna Consumer Goods Ltd (Fresh)',
    productId: 'prod-4',
    productName: 'Fresh Red Lentils / Mosharir Daal (25kg Sack)',
    sku: 'GRO-DAAL-25K',
    quantity: 40,
    unitPrice: 3250, // BDT
    totalCost: 130000,
    status: 'in_transit',
    orderDate: '2026-08-16',
    expectedDelivery: '2026-08-20',
    isExpedited: false,
    shippingCost: 2500,
    createdAt: '2026-08-16T09:30:00Z',
  },
  {
    id: 'po-2',
    poNumber: 'PO-BD-2026-082',
    supplierId: 'sup-2',
    supplierName: 'City Group Distribution (Teer)',
    productId: 'prod-1',
    productName: 'Teer Fortified Soybean Oil (5L Can)',
    sku: 'GRO-OIL-5L',
    quantity: 60,
    unitPrice: 810, // BDT
    totalCost: 48600,
    status: 'in_transit',
    orderDate: '2026-08-18',
    expectedDelivery: '2026-08-20',
    isExpedited: true,
    shippingCost: 1800,
    createdAt: '2026-08-18T11:00:00Z',
  },
];
