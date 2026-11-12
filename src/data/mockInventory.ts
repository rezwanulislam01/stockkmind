import { AIActionItem, Product, PurchaseOrder, Supplier } from '../types';

// Helper to generate 90-day daily factory consumption history
function generateConsumptionHistory(avgDemand: number, volatility: number = 0.15, trend: number = 0, zeroDaysCount: number = 0) {
  const history = [];
  const today = new Date();

  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // Check if within the zero consumption period (for stagnant/dead stock)
    if (i < zeroDaysCount) {
      history.push({ date: dateStr, sales: 0 });
      continue;
    }

    // Industrial production continuous shift factor (Fridays slight plant maintenance shift)
    const dayOfWeek = d.getDay();
    const shiftMultiplier = (dayOfWeek === 5) ? 0.85 : 1.02;

    // Trend progression over 90 days
    const trendMultiplier = 1 + (trend / 100) * ((90 - i) / 90);

    // Random noise in daily processing batch
    const noise = (Math.random() - 0.5) * 2 * volatility;
    const consumption = Math.max(0, Math.round(avgDemand * shiftMultiplier * trendMultiplier * (1 + noise)));

    history.push({ date: dateStr, sales: consumption });
  }

  return history;
}

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    name: 'Bunge & Cargill Global Agri (Chattogram Silo)',
    rating: 4.9,
    reliability: 98,
    baseLeadTime: 7,
    expeditedLeadTime: 3,
    unitCostMarkup: 1.0,
    minOrderQty: 250, // 250 MT bulk
    location: 'Outer Anchorage & Silo Jetty, Chattogram Port',
    contactEmail: 'bulk.asia@cargill-bunge.com',
  },
  {
    id: 'sup-2',
    name: 'ADM & Louis Dreyfus Co. (LDC Singapore)',
    rating: 4.8,
    reliability: 96,
    baseLeadTime: 6,
    expeditedLeadTime: 3,
    unitCostMarkup: 1.02,
    minOrderQty: 200,
    location: 'Patenga Tank Terminal & Silo, Chattogram',
    contactEmail: 'agro.trade@ldc.com',
  },
  {
    id: 'sup-3',
    name: 'Chittagong Port Customs & Tanker Rail Logistics',
    rating: 4.6,
    reliability: 92,
    baseLeadTime: 4,
    expeditedLeadTime: 2,
    unitCostMarkup: 1.03,
    minOrderQty: 100,
    location: 'Agrabad Commercial Area & Port Yard, Chattogram',
    contactEmail: 'logistics@portclearance.gov.bd',
  },
  {
    id: 'sup-4',
    name: 'Northern Agro Grains Farmer Cooperatives',
    rating: 4.9,
    reliability: 97,
    baseLeadTime: 3,
    expeditedLeadTime: 1,
    unitCostMarkup: 0.96, // Direct farmer cooperative price
    minOrderQty: 150,
    location: 'Godagari & Paba Grain Mandi, Rajshahi',
    contactEmail: 'procurement@northernagro-coop.bd',
  },
  {
    id: 'sup-5',
    name: 'Meghna Petrochemicals & Industrial Reagents',
    rating: 4.7,
    reliability: 95,
    baseLeadTime: 4,
    expeditedLeadTime: 2,
    unitCostMarkup: 1.0,
    minOrderQty: 50,
    location: 'Narayanganj & Meghna Industrial Belt, Dhaka',
    contactEmail: 'reagents@meghnapetrochemicals.com',
  },
  {
    id: 'sup-6',
    name: 'Akij & Meghna Poly Sacks & Packaging Ltd.',
    rating: 4.8,
    reliability: 97,
    baseLeadTime: 3,
    expeditedLeadTime: 1,
    unitCostMarkup: 0.98,
    minOrderQty: 5000,
    location: 'Manikganj & Gazipur Packaging Park',
    contactEmail: 'industrial.packaging@akij.net',
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  // 1. Russian / Canadian Milling Wheat Grade-1 (Flour Mill Silo)
  {
    id: 'prod-1',
    sku: 'RAW-WHEAT-M1',
    name: 'Imported Milling Wheat (Russian Grade-1, 12.5% Protein)',
    category: 'Agri-Grains & Silo',
    imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80',
    currentStock: 420, // 420 MT
    unitPrice: 42500, // ৳ 42,500 per MT
    costPrice: 38200, // ৳ 38,200 per MT
    dailyDemand: 120, // 120 MT daily factory milling consumption
    leadTimeDays: 5,
    safetyStock: 350,
    reorderPoint: 850,
    eoq: 1200,
    holdingCostPerYear: 2800,
    orderSetupCost: 25000,
    demandTrend: 18,
    daysWithoutSale: 0,
    status: 'critical',
    riskScore: 94,
    unitOfMeasure: 'MT (Metric Ton)',
    storageLocation: 'Bulk Silo #01 • Rezwan Industrial Zone & Silo Network, Rajshahi',
    plantDivision: 'Rezwan Industrial Zone & Silo Network (Flour Division)',
    confidenceBoundLower: 105,
    confidenceBoundUpper: 138,
    salesHistory: generateConsumptionHistory(120, 0.12, 18),
    notes: 'Critical Silo depletion threat! Only 3.5 days of milling wheat remaining. Factory milling line 1 & 2 run-rate is 120 MT/day.',
  },

  // 2. Crude Degummed Soybean Oil (CDSO) - Edible Oil Refinery Feedstock
  {
    id: 'prod-2',
    sku: 'RAW-CDSO-OIL',
    name: 'Crude Degummed Soybean Oil (CDSO Feedstock)',
    category: 'Oil Refinery Feedstock',
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80',
    currentStock: 280, // 280 MT
    unitPrice: 152000, // ৳ 1,52,000 per MT
    costPrice: 138000, // ৳ 1,38,000 per MT
    dailyDemand: 85, // 85 MT daily refining capacity
    leadTimeDays: 6,
    safetyStock: 300,
    reorderPoint: 750,
    eoq: 800,
    holdingCostPerYear: 6500,
    orderSetupCost: 45000,
    demandTrend: 22,
    daysWithoutSale: 0,
    status: 'critical',
    riskScore: 91,
    unitOfMeasure: 'MT (Metric Ton)',
    storageLocation: 'Refinery Tank Terminal #02 • Chattogram Port Belt',
    plantDivision: 'Rezwan Industrial Zone & Silo Network (Oil Refinery)',
    confidenceBoundLower: 75,
    confidenceBoundUpper: 98,
    salesHistory: generateConsumptionHistory(85, 0.15, 22),
    notes: 'Urgent refinery feedstock shortage: Tank level is at 280 MT (3.2 days buffer). Lead time from tanker vessel discharge is 6 days.',
  },

  // 3. Yellow Maize / Feed Corn - Poultry & Aqua Feed Mill
  {
    id: 'prod-3',
    sku: 'RAW-MAIZE-YEL',
    name: 'Yellow Feed Maize / Corn (Feed Grade, High Starch)',
    category: 'Agri-Grains & Silo',
    imageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&auto=format&fit=crop&q=80',
    currentStock: 860, // 860 MT
    unitPrice: 33500, // ৳ 33,500 per MT
    costPrice: 29800, // ৳ 29,800 per MT
    dailyDemand: 95, // 95 MT daily feed compounding
    leadTimeDays: 4,
    safetyStock: 450,
    reorderPoint: 800,
    eoq: 1000,
    holdingCostPerYear: 1800,
    orderSetupCost: 20000,
    demandTrend: 28,
    daysWithoutSale: 0,
    status: 'warning',
    riskScore: 68,
    unitOfMeasure: 'MT (Metric Ton)',
    storageLocation: 'Grain Silo #03 • Rezwan Industrial Zone & Silo Network, Paba, Rajshahi',
    plantDivision: 'Rezwan Industrial Zone & Silo Network (Feed Division)',
    confidenceBoundLower: 82,
    confidenceBoundUpper: 110,
    salesHistory: generateConsumptionHistory(95, 0.14, 28),
    notes: 'Commercial feed demand accelerated +28% due to peak poultry farming cycle in Northern Bangladesh.',
  },

  // 4. High-Protein Soybean Meal (SBM 48% CP)
  {
    id: 'prod-4',
    sku: 'RAW-SBM-48P',
    name: 'High-Protein Soybean Meal (SBM 48% Crude Protein)',
    category: 'Feed Mill Ingredients',
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
    currentStock: 1450, // 1450 MT
    unitPrice: 68000, // ৳ 68,000 per MT
    costPrice: 61500, // ৳ 61,500 per MT
    dailyDemand: 70, // 70 MT/day
    leadTimeDays: 5,
    safetyStock: 400,
    reorderPoint: 720,
    eoq: 900,
    holdingCostPerYear: 3200,
    orderSetupCost: 30000,
    demandTrend: 5,
    daysWithoutSale: 0,
    status: 'healthy',
    riskScore: 24,
    unitOfMeasure: 'MT (Metric Ton)',
    storageLocation: 'Bulk Storage Bay B • Ishwardi Feed Complex',
    plantDivision: 'Rezwan Industrial Zone & Silo Network (Feed Division)',
    confidenceBoundLower: 62,
    confidenceBoundUpper: 78,
    salesHistory: generateConsumptionHistory(70, 0.1, 5),
    notes: 'Optimal healthy buffer in Ishwardi facility. Directly imported via Louis Dreyfus Company (LDC).',
  },

  // 5. Premium Paddy Grains (Miniket / Katari) - Auto Rice Mill
  {
    id: 'prod-5',
    sku: 'RAW-PADDY-MIN',
    name: 'Northern Premium Paddy Grains (Miniket & Katari Crop)',
    category: 'Agri-Grains & Silo',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
    currentStock: 2100, // 2100 MT
    unitPrice: 39000, // ৳ 39,000 per MT
    costPrice: 34500, // ৳ 34,500 per MT
    dailyDemand: 110, // 110 MT/day auto parboiling & milling
    leadTimeDays: 3,
    safetyStock: 600,
    reorderPoint: 900,
    eoq: 1500,
    holdingCostPerYear: 1900,
    orderSetupCost: 15000,
    demandTrend: 8,
    daysWithoutSale: 0,
    status: 'healthy',
    riskScore: 20,
    unitOfMeasure: 'MT (Metric Ton)',
    storageLocation: 'Ventilated Silo Complex • Dinajpur Auto Rice Mill',
    plantDivision: 'Rezwan Industrial Zone & Silo Network (Rice Division)',
    confidenceBoundLower: 98,
    confidenceBoundUpper: 122,
    salesHistory: generateConsumptionHistory(110, 0.12, 8),
    notes: 'Consistent raw paddy intake from Rajshahi & Dinajpur farmer mandis.',
  },

  // 6. Activated Bleaching Earth (Refinery Auxiliary Reagent)
  {
    id: 'prod-6',
    sku: 'CHEM-BLEACH-E',
    name: 'Activated Bleaching Earth (Tonsil Supreme Grade)',
    category: 'Chemicals & Processing',
    imageUrl: 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=600&auto=format&fit=crop&q=80',
    currentStock: 18, // 18 MT
    unitPrice: 94000, // ৳ 94,000 per MT
    costPrice: 82000, // ৳ 82,000 per MT
    dailyDemand: 3.5, // 3.5 MT daily in oil de-colorization
    leadTimeDays: 4,
    safetyStock: 20,
    reorderPoint: 32,
    eoq: 45,
    holdingCostPerYear: 4500,
    orderSetupCost: 12000,
    demandTrend: 12,
    daysWithoutSale: 0,
    status: 'critical',
    riskScore: 88,
    unitOfMeasure: 'MT (Metric Ton)',
    storageLocation: 'Chemical Storage Vault • Chattogram Refinery',
    plantDivision: 'Rezwan Industrial Zone & Silo Network (Oil Refinery)',
    confidenceBoundLower: 2.8,
    confidenceBoundUpper: 4.2,
    salesHistory: generateConsumptionHistory(3.5, 0.15, 12),
    notes: 'Stockout alert: 5.1 days of bleaching earth remaining. Refinery de-colorization line requires continuous dosage.',
  },

  // 7. Marine Fish Meal 62% CP (Aqua & Shrimp Feed)
  {
    id: 'prod-7',
    sku: 'RAW-FISH-62P',
    name: 'High-Grade Marine Fish Meal (62% Protein, Low Ash)',
    category: 'Feed Mill Ingredients',
    imageUrl: 'https://images.unsplash.com/photo-1534943441045-1089d75b3c36?w=600&auto=format&fit=crop&q=80',
    currentStock: 260, // 260 MT
    unitPrice: 118000, // ৳ 1,18,000 per MT
    costPrice: 104000, // ৳ 1,04,000 per MT
    dailyDemand: 18, // 18 MT/day
    leadTimeDays: 5,
    safetyStock: 90,
    reorderPoint: 170,
    eoq: 200,
    holdingCostPerYear: 5800,
    orderSetupCost: 25000,
    demandTrend: 15,
    daysWithoutSale: 0,
    status: 'warning',
    riskScore: 62,
    unitOfMeasure: 'MT (Metric Ton)',
    storageLocation: 'Climate Warehouse 4 • Bogura Feed Plant',
    plantDivision: 'Rezwan Industrial Zone & Silo Network (Feed Division)',
    confidenceBoundLower: 15,
    confidenceBoundUpper: 22,
    salesHistory: generateConsumptionHistory(18, 0.16, 15),
    notes: 'Aqua culture feed production surge. Lead time is 5 days from Cox’s Bazar & Chattogram marine suppliers.',
  },

  // 8. 50kg Heavy Woven Polypropylene (PP) Sacks (Branded Packaging)
  {
    id: 'prod-8',
    sku: 'PKG-PP-50KG',
    name: 'Woven Polypropylene Sacks (50kg Rezwan Branded Flour & Feed)',
    category: 'Industrial Packaging',
    imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80',
    currentStock: 185000, // 185,000 bags
    unitPrice: 28.5, // ৳ 28.5 per bag
    costPrice: 24.0, // ৳ 24.0 per bag
    dailyDemand: 12000, // 12,000 bags/day dispatch packing
    leadTimeDays: 3,
    safetyStock: 50000,
    reorderPoint: 85000,
    eoq: 150000,
    holdingCostPerYear: 1.2,
    orderSetupCost: 8000,
    demandTrend: 6,
    daysWithoutSale: 0,
    status: 'healthy',
    riskScore: 18,
    unitOfMeasure: 'Bags (50kg)',
    storageLocation: 'Packaging Central Depot • Godagari, Rajshahi',
    plantDivision: 'Rezwan Industrial Zone & Silo Network (Packaging & Logistics)',
    confidenceBoundLower: 10500,
    confidenceBoundUpper: 13500,
    salesHistory: generateConsumptionHistory(12000, 0.08, 6),
    notes: 'High-speed automated bagging line running stably with 15.4 days of sack supply.',
  },

  // 9. Crude Palm Oil (CPO Bleachable) - Edible Oil Fractionation
  {
    id: 'prod-9',
    sku: 'RAW-CPO-PALM',
    name: 'Crude Palm Oil (CPO Super Olein Feedstock)',
    category: 'Oil Refinery Feedstock',
    imageUrl: 'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?w=600&auto=format&fit=crop&q=80',
    currentStock: 540, // 540 MT
    unitPrice: 128000, // ৳ 1,28,000 per MT
    costPrice: 114000, // ৳ 1,14,000 per MT
    dailyDemand: 60, // 60 MT/day
    leadTimeDays: 5,
    safetyStock: 250,
    reorderPoint: 520,
    eoq: 600,
    holdingCostPerYear: 5200,
    orderSetupCost: 35000,
    demandTrend: 4,
    daysWithoutSale: 0,
    status: 'healthy',
    riskScore: 22,
    unitOfMeasure: 'MT (Metric Ton)',
    storageLocation: 'Shore Tank #04 • Patenga, Chattogram',
    plantDivision: 'Rezwan Industrial Zone & Silo Network (Oil Refinery)',
    confidenceBoundLower: 52,
    confidenceBoundUpper: 68,
    salesHistory: generateConsumptionHistory(60, 0.12, 4),
    notes: 'Supplied directly from Malaysian/Indonesian vessel discharge at Chattogram port.',
  },

  // 10. Caustic Soda Flakes (99% Industrial Neutralizer)
  {
    id: 'prod-10',
    sku: 'CHEM-CAUST-99',
    name: 'Industrial Caustic Soda Flakes (NaOH 99% Neutralization)',
    category: 'Chemicals & Processing',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    currentStock: 45, // 45 MT
    unitPrice: 78000, // ৳ 78,000 per MT
    costPrice: 68000, // ৳ 68,000 per MT
    dailyDemand: 2.2, // 2.2 MT/day
    leadTimeDays: 4,
    safetyStock: 15,
    reorderPoint: 24,
    eoq: 40,
    holdingCostPerYear: 3800,
    orderSetupCost: 10000,
    demandTrend: 2,
    daysWithoutSale: 0,
    status: 'healthy',
    riskScore: 25,
    unitOfMeasure: 'MT / Drums',
    storageLocation: 'Chemical Annex B • Refinery Plant, Chattogram',
    plantDivision: 'Rezwan Industrial Zone & Silo Network (Oil Refinery)',
    confidenceBoundLower: 1.8,
    confidenceBoundUpper: 2.6,
    salesHistory: generateConsumptionHistory(2.2, 0.1, 2),
    notes: 'Consistent daily chemical neutralization volume sourced from Meghna Petrochemicals.',
  },

  // 11. DL-Methionine & Poultry Amino Acid Premix
  {
    id: 'prod-11',
    sku: 'ING-DLMETH-99',
    name: 'DL-Methionine 99% (Feed Grade Essential Amino Acid)',
    category: 'Feed Mill Ingredients',
    imageUrl: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600&auto=format&fit=crop&q=80',
    currentStock: 35, // 35 MT (25kg bags)
    unitPrice: 380000, // ৳ 3,80,000 per MT
    costPrice: 335000, // ৳ 3,35,000 per MT
    dailyDemand: 1.8, // 1.8 MT/day
    leadTimeDays: 7,
    safetyStock: 18,
    reorderPoint: 30,
    eoq: 40,
    holdingCostPerYear: 16000,
    orderSetupCost: 20000,
    demandTrend: 10,
    daysWithoutSale: 0,
    status: 'warning',
    riskScore: 66,
    unitOfMeasure: 'MT (25kg bags)',
    storageLocation: 'Climate-Controlled Vault • Rajshahi Feed Mill',
    plantDivision: 'Rezwan Industrial Zone & Silo Network (Feed Division)',
    confidenceBoundLower: 1.5,
    confidenceBoundUpper: 2.2,
    salesHistory: generateConsumptionHistory(1.8, 0.14, 10),
    notes: 'Specialized imported amino acid; lead time is 7 days due to cold-chain port transport.',
  },

  // 12. Dead Stock: Obsolete Discontinued Jute Sacks
  {
    id: 'prod-12',
    sku: 'PKG-JUTE-OBS',
    name: 'Damaged & Obsolete Non-Laminated Jute Sacks (Old 80kg Spec)',
    category: 'Industrial Packaging',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80',
    currentStock: 65000, // 65,000 bags
    unitPrice: 75.0, // ৳ 75 per bag
    costPrice: 62.0, // ৳ 62 per bag
    dailyDemand: 0.0, // Discontinued packaging spec
    leadTimeDays: 10,
    safetyStock: 5000,
    reorderPoint: 10000,
    eoq: 20000,
    holdingCostPerYear: 8.5,
    orderSetupCost: 5000,
    demandTrend: -98,
    daysWithoutSale: 64, // 64 days without plant consumption
    status: 'dead_stock',
    riskScore: 86,
    unitOfMeasure: 'Bags (Obsolete)',
    storageLocation: 'Old Warehouse Yard #05 • Godagari Industrial Complex',
    plantDivision: 'Rezwan Industrial Zone & Silo Network (Packaging & Logistics)',
    confidenceBoundLower: 0,
    confidenceBoundUpper: 0.1,
    salesHistory: generateConsumptionHistory(0.01, 0.01, -98, 64),
    notes: 'Dead Capital: ৳ 48,75,000 locked across 65,000 obsolete jute sacks. Liquidate or sell to local wholesale grain traders.',
  },
];

export const INITIAL_ACTION_QUEUE: AIActionItem[] = [
  {
    id: 'action-1',
    productId: 'prod-1',
    productName: 'Imported Milling Wheat (Russian Grade-1)',
    sku: 'RAW-WHEAT-M1',
    category: 'Agri-Grains & Silo',
    imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80',
    actionType: 'reorder',
    severity: 'urgent',
    title: 'Flour Mill Shutdown Threat: 3.5 Days Silo Buffer',
    reasoning: 'At 120 MT/day milling velocity, Silo #01 (420 MT on hand) will empty before standard rail/barge transit from Chattogram Port arrives. Expedite bulk allocation of 1,200 MT from Bunge/Cargill port silo.',
    suggestedQuantity: 1200,
    suggestedSupplierId: 'sup-1',
    avoidedLossEstimate: 2450000, // ৳ 24.5 Lakhs avoided plant downtime loss
    confidenceScore: 97,
    status: 'pending',
    createdAt: new Date().toISOString(),
    metrics: {
      daysToStockout: 3.5,
      holdingCostReduction: 125000,
      leadTimeVariance: 2,
      supplierReliability: 98,
    },
  },
  {
    id: 'action-2',
    productId: 'prod-2',
    productName: 'Crude Degummed Soybean Oil (CDSO Feedstock)',
    sku: 'RAW-CDSO-OIL',
    category: 'Oil Refinery Feedstock',
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80',
    actionType: 'reorder',
    severity: 'urgent',
    title: 'Refinery Tank Depletion: 3.2 Days Remaining',
    reasoning: 'Refinery tank buffer (280 MT) is dangerously close to minimum pump level. Lead time from tanker berth is 6 days. Authorize immediate dispatch of 800 MT via specialized rail tank wagons.',
    suggestedQuantity: 800,
    suggestedSupplierId: 'sup-2',
    avoidedLossEstimate: 3800000, // ৳ 38.0 Lakhs avoided refinery downtime loss
    confidenceScore: 95,
    status: 'pending',
    createdAt: new Date().toISOString(),
    metrics: {
      daysToStockout: 3.2,
      holdingCostReduction: 210000,
      leadTimeVariance: 1,
      supplierReliability: 96,
    },
  },
  {
    id: 'action-3',
    productId: 'prod-3',
    productName: 'Yellow Feed Maize / Corn (Feed Grade)',
    sku: 'RAW-MAIZE-YEL',
    category: 'Agri-Grains & Silo',
    imageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&auto=format&fit=crop&q=80',
    actionType: 'adjust_buffer',
    severity: 'attention',
    title: 'Feed Production Surge (+28% Compounding Rate)',
    reasoning: 'Northern poultry feed demand increased daily consumption from 74 to 95 MT/day. Raise factory safety buffer from 450 to 650 MT to maintain unbroken 7-day plant operational resilience.',
    suggestedQuantity: 650,
    suggestedSupplierId: 'sup-4',
    avoidedLossEstimate: 1200000, // ৳ 12.0 Lakhs
    confidenceScore: 92,
    status: 'pending',
    createdAt: new Date().toISOString(),
    metrics: {
      daysToStockout: 9.0,
      holdingCostReduction: 85000,
      leadTimeVariance: 1,
      supplierReliability: 97,
    },
  },
  {
    id: 'action-4',
    productId: 'prod-12',
    productName: 'Damaged & Obsolete Non-Laminated Jute Sacks',
    sku: 'PKG-JUTE-OBS',
    category: 'Industrial Packaging',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80',
    actionType: 'liquidate',
    severity: 'optimize',
    title: 'Dead Capital Recovery: ৳ 48.75 Lakhs Trapped in Silo Yard',
    reasoning: '65,000 obsolete jute bags have been idle for 64 days taking up warehouse space. Auction or liquidate at 25% discount to local grain mandis to unlock working capital for raw grain purchases.',
    suggestedQuantity: 65000,
    suggestedSupplierId: 'sup-6',
    avoidedLossEstimate: 1650000, // ৳ 16.5 Lakhs
    confidenceScore: 90,
    status: 'pending',
    createdAt: new Date().toISOString(),
    metrics: {
      daysToStockout: 999,
      holdingCostReduction: 380000,
      leadTimeVariance: 0,
      supplierReliability: 97,
    },
  },
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-1',
    poNumber: 'PO-REZWAN-IND-2026-081',
    supplierId: 'sup-1',
    supplierName: 'Bunge & Cargill Global Agri (Chattogram Silo)',
    productId: 'prod-1',
    productName: 'Imported Milling Wheat (Russian Grade-1)',
    sku: 'RAW-WHEAT-M1',
    quantity: 500, // 500 MT
    unitPrice: 38200, // ৳ BDT per MT
    totalCost: 19100000, // ৳ 1.91 Crore
    status: 'in_transit',
    orderDate: '2026-08-16',
    expectedDelivery: '2026-08-21',
    isExpedited: false,
    shippingCost: 350000,
    createdAt: '2026-08-16T09:30:00Z',
  },
  {
    id: 'po-2',
    poNumber: 'PO-REZWAN-IND-2026-082',
    supplierId: 'sup-2',
    supplierName: 'ADM & Louis Dreyfus Co. (LDC Singapore)',
    productId: 'prod-2',
    productName: 'Crude Degummed Soybean Oil (CDSO Feedstock)',
    sku: 'RAW-CDSO-OIL',
    quantity: 250, // 250 MT
    unitPrice: 138000, // ৳ BDT per MT
    totalCost: 34500000, // ৳ 3.45 Crore
    status: 'in_transit',
    orderDate: '2026-08-18',
    expectedDelivery: '2026-08-22',
    isExpedited: true,
    shippingCost: 480000,
    createdAt: '2026-08-18T11:00:00Z',
  },
];
