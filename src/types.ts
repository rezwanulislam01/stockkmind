export type ProductCategory = 
  | 'Groceries' 
  | 'Personal Care' 
  | 'Electronics' 
  | 'Beverages' 
  | 'Home & Living';

export type StockStatus = 'healthy' | 'warning' | 'critical' | 'dead_stock';

export interface DailySales {
  date: string;
  sales: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  currentStock: number;
  safetyStock: number;
  dailyDemand: number;
  unitPrice: number; // Retail selling price in BDT (৳)
  costPrice: number; // Wholesale unit cost in BDT (৳)
  leadTimeDays: number;
  reorderPoint: number;
  eoq: number;
  demandTrend: number; // percentage change, e.g. +23
  daysWithoutSale: number; // consecutive days with 0 sales
  riskScore: number; // 0 - 100
  status: StockStatus;
  holdingCostPerYear?: number;
  orderSetupCost?: number;
  holdingCostAnnual?: number; // e.g. 0.18 (18%)
  confidenceBoundLower?: number;
  confidenceBoundUpper?: number;
  supplierIds?: string[];
  preferredSupplierId?: string;
  salesHistory: DailySales[];
  notes?: string;
  lastRestocked?: string;
  userId?: string;
}

export interface Supplier {
  id: string;
  name: string;
  rating: number; // 1 to 5
  reliability: number; // Percentage (e.g. 96)
  baseLeadTime: number; // Days
  expeditedLeadTime: number; // Days
  unitCostMarkup: number; // Multiplier, e.g. 1.0 (standard) or 1.04 (+4% cost)
  minOrderQty: number;
  location: string;
  contactEmail: string;
}

export type POStatus = 'draft' | 'submitted' | 'in_transit' | 'delivered' | 'cancelled';

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  productId: string;
  productName: string;
  productSku?: string;
  sku?: string;
  supplierId: string;
  supplierName: string;
  quantity: number;
  unitCost?: number;
  unitPrice?: number;
  totalCost: number;
  status: POStatus;
  createdAt: string;
  orderDate?: string;
  expectedDelivery?: string;
  expectedDeliveryDate?: string;
  isExpedited?: boolean;
  shippingCost?: number;
  aiRecommendationReason?: string;
  userId?: string;
}

export type ActionSeverity = 'urgent' | 'attention' | 'optimize';
export type ActionType = 'approve_reorder' | 'reorder' | 'adjust_safety_stock' | 'adjust_buffer' | 'launch_clearance' | 'liquidate' | 'supplier_switch';

export interface AIActionItem {
  id: string;
  userId?: string;
  severity: ActionSeverity;
  productId: string;
  productName: string;
  productSku?: string;
  sku?: string;
  category?: string;
  title: string;
  description?: string;
  reasoning?: string;
  actionType: ActionType;
  recommendedQuantity?: number;
  suggestedQuantity?: number;
  recommendedSafetyStock?: number;
  suggestedSupplierId?: string;
  discountPercent?: number;
  avoidedLossEstimate: number; // in BDT (৳)
  riskScore?: number;
  confidenceScore?: number;
  status: 'pending' | 'approved' | 'dismissed';
  createdAt?: string;
  metrics?: {
    daysToStockout?: number;
    holdingCostReduction?: number;
    leadTimeVariance?: number;
    supplierReliability?: number;
  };
  whyData?: {
    summary: string;
    rootCauses: string[];
    financialImpact: string;
    recommendedAction: string;
    supplierTip: string;
  };
}

export type TokenRouterTier = 'tier1_instant_math' | 'tier2_db_query' | 'tier3_llm_reasoning';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  tier?: TokenRouterTier;
  tokensSaved?: number;
  tokensUsed?: number;
  structuredData?: any;
}

export interface ScenarioParams {
  productId: string;
  demandShiftPercent: number; // -50% to +100%
  leadTimeDelayDays: number; // 0 to +10 days
  batchReorderQty: number; // 0 to 500 units
}

export interface ForecastPoint {
  date: string;
  historicalSales?: number;
  forecast?: number;
  lowerBound?: number;
  upperBound?: number;
  isForecast: boolean;
}

export type DemoScenario = 
  | 'baseline' 
  | 'black_friday' 
  | 'port_strike' 
  | 'supply_shock' 
  | 'dead_stock_crisis' 
  | 'dead_stock_flush' 
  | 'stockout_crisis';

export interface InventoryMetrics {
  healthScore: number;
  healthScoreDelta: number;
  totalProducts: number;
  activeSkus: number;
  totalValuation: number;
  deadCapital: number;
  criticalStockouts: number;
  attentionItems: number;
  forecastAccuracy: number;
  avoidedStockoutLoss: number;
}
