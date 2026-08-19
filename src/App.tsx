import React, { useState, useMemo, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { DemandForecastingView } from './components/DemandForecastingView';
import { SupplierMatrixView } from './components/SupplierMatrixView';
import { ScenarioSimulator } from './components/ScenarioSimulator';
import { ProductCatalogTable } from './components/ProductCatalogTable';
import { PurchaseOrdersView } from './components/PurchaseOrdersView';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ActionWhyModal } from './components/ActionWhyModal';
import { RecordSaleModal } from './components/RecordSaleModal';
import { AddProductModal } from './components/AddProductModal';
import { AIMultiAssistant } from './components/AIMultiAssistant';
import { AndroidMobileView } from './components/AndroidMobileView';
import { AndroidCodeModal } from './components/AndroidCodeModal';
import { useAuth } from './context/AuthContext';
import { 
  initializeUserInventory, 
  subscribeToUserProducts, 
  subscribeToUserPurchaseOrders, 
  subscribeToUserActionQueue,
  saveProductToFirestore,
  savePurchaseOrderToFirestore,
  updateActionInFirestore 
} from './services/inventoryPersistence';

import { 
  INITIAL_PRODUCTS, 
  INITIAL_SUPPLIERS, 
  INITIAL_ACTION_QUEUE, 
  INITIAL_PURCHASE_ORDERS 
} from './data/mockInventory';
import { 
  Product, 
  Supplier, 
  AIActionItem, 
  PurchaseOrder, 
  DemoScenario 
} from './types';
import { 
  calculateInventoryHealthScore, 
  calculateTotalInventoryValuation, 
  calculateDeadStockCapital, 
  calculateRiskScore,
  calculateStockStatus,
  calculateEOQ,
  calculateSafetyStockAndROP
} from './utils/forecasting';
import { Sparkles, Plus, AlertCircle, ShoppingCart, TrendingUp, Cloud, ShieldCheck } from 'lucide-react';

export default function App() {
  const { user } = useAuth();

  // Navigation & View State
  const [currentTab, setCurrentTab] = useState<ActiveTab>('dashboard');
  const [viewMode, setViewMode] = useState<'desktop' | 'android'>('desktop');
  const [isAndroidCodeOpen, setIsAndroidCodeOpen] = useState<boolean>(false);

  // Core Data State
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [actionQueue, setActionQueue] = useState<AIActionItem[]>(INITIAL_ACTION_QUEUE);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(INITIAL_PURCHASE_ORDERS);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(INITIAL_PRODUCTS[0]);
  const [activeDemoScenario, setActiveDemoScenario] = useState<DemoScenario>('baseline');

  // Modals & Assistant State
  const [drilldownProduct, setDrilldownProduct] = useState<Product | null>(null);
  const [actionWhyItem, setActionWhyItem] = useState<AIActionItem | null>(null);
  const [isRecordSaleOpen, setIsRecordSaleOpen] = useState<boolean>(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState<boolean>(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState<boolean>(false);

  // Firestore Real-Time Subscriptions when User is Authenticated
  useEffect(() => {
    if (!user) return;

    let unsubProds: (() => void) | undefined;
    let unsubPOs: (() => void) | undefined;
    let unsubActions: (() => void) | undefined;

    const setupSync = async () => {
      await initializeUserInventory(user.uid);

      unsubProds = subscribeToUserProducts(user.uid, (prods) => {
        if (prods && prods.length > 0) {
          setProducts(prods);
          if (!selectedProduct) {
            setSelectedProduct(prods[0]);
          }
        }
      });

      unsubPOs = subscribeToUserPurchaseOrders(user.uid, (orders) => {
        if (orders) {
          setPurchaseOrders(orders);
        }
      });

      unsubActions = subscribeToUserActionQueue(user.uid, (actions) => {
        if (actions) {
          setActionQueue(actions);
        }
      });
    };

    setupSync();

    return () => {
      if (unsubProds) unsubProds();
      if (unsubPOs) unsubPOs();
      if (unsubActions) unsubActions();
    };
  }, [user]);

  // Global Computed Metrics (Real-Time Reactive)
  const healthScore = useMemo(() => calculateInventoryHealthScore(products), [products]);
  const totalValuation = useMemo(() => calculateTotalInventoryValuation(products), [products]);
  const deadCapital = useMemo(() => calculateDeadStockCapital(products), [products]);
  const criticalCount = useMemo(() => products.filter(p => p.status === 'critical').length, [products]);
  const attentionCount = useMemo(() => products.filter(p => p.status === 'warning' || p.status === 'dead_stock').length, [products]);
  const avoidedLoss = useMemo(() => {
    return actionQueue
      .filter(a => a.status === 'approved')
      .reduce((sum, a) => sum + a.avoidedLossEstimate, 3450);
  }, [actionQueue]);

  // Handle Demo Scenario Switch
  const handleSelectScenario = (scenarioStr: string) => {
    const scenario = scenarioStr as DemoScenario;
    setActiveDemoScenario(scenario);

    if (scenario === 'baseline') {
      setProducts(INITIAL_PRODUCTS);
      setActionQueue(INITIAL_ACTION_QUEUE);
    } else if (scenario === 'black_friday') {
      // Spike daily demand by 60-90% for high velocity items
      const updated = INITIAL_PRODUCTS.map(p => {
        const spikeDemand = p.category === 'Groceries' || p.category === 'Electronics' 
          ? Math.round(p.dailyDemand * 1.8) 
          : p.dailyDemand;
        const newRisk = calculateRiskScore(p.currentStock, spikeDemand, p.leadTimeDays, p.safetyStock).riskScore;
        return {
          ...p,
          dailyDemand: spikeDemand,
          demandTrend: 75,
          riskScore: newRisk,
          status: calculateStockStatus(p.currentStock, spikeDemand, p.leadTimeDays, p.daysWithoutSale),
        };
      });
      setProducts(updated);
    } else if (scenario === 'supply_shock' || scenario === 'port_strike') {
      // Add +5 to +8 days lead time delay
      const updated = INITIAL_PRODUCTS.map(p => {
        const delayedLead = p.leadTimeDays + 6;
        const newRisk = calculateRiskScore(p.currentStock, p.dailyDemand, delayedLead, p.safetyStock).riskScore;
        return {
          ...p,
          leadTimeDays: delayedLead,
          riskScore: newRisk,
          status: calculateStockStatus(p.currentStock, p.dailyDemand, delayedLead, p.daysWithoutSale),
        };
      });
      setProducts(updated);
    } else if (scenario === 'dead_stock_flush' || scenario === 'dead_stock_crisis') {
      // Increase stagnant days on cosmetic / home goods
      const updated = INITIAL_PRODUCTS.map((p, idx) => {
        if (idx % 3 === 0) {
          return {
            ...p,
            daysWithoutSale: 45,
            dailyDemand: 0,
            status: 'dead_stock' as const,
            riskScore: 60,
          };
        }
        return p;
      });
      setProducts(updated);
    }
  };

  // Handle Approve Action in AI Action Center
  const handleApproveAction = (action: AIActionItem) => {
    // 1. Mark action as approved
    const updatedAction = { ...action, status: 'approved' as const };
    setActionQueue(prev =>
      prev.map(a => (a.id === action.id ? updatedAction : a))
    );

    if (user) {
      updateActionInFirestore(user.uid, updatedAction);
    }

    // 2. If it's a reorder action, generate a PO automatically
    if (action.actionType === 'approve_reorder' && action.recommendedQuantity) {
      const matchingProduct = products.find(p => p.id === action.productId);
      const supplier = suppliers[0];

      if (matchingProduct && supplier) {
        const newPO: PurchaseOrder = {
          id: 'po-' + Date.now(),
          poNumber: 'PO-' + Math.floor(10000 + Math.random() * 90000),
          productId: matchingProduct.id,
          productName: matchingProduct.name,
          productSku: matchingProduct.sku,
          supplierId: supplier.id,
          supplierName: supplier.name,
          quantity: action.recommendedQuantity,
          unitCost: matchingProduct.costPrice,
          totalCost: matchingProduct.costPrice * action.recommendedQuantity,
          status: 'in_transit',
          createdAt: new Date().toISOString().split('T')[0],
          expectedDeliveryDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
          aiRecommendationReason: `Auto-generated from AI Action Center approval (${action.title})`,
        };
        setPurchaseOrders(prev => [newPO, ...prev]);

        if (user) {
          savePurchaseOrderToFirestore(user.uid, newPO);
        }
      }
    }
  };

  // Handle Create Purchase Order from Supplier Matrix
  const handleCreatePurchaseOrder = (newPOData: Omit<PurchaseOrder, 'id' | 'poNumber' | 'createdAt'>) => {
    const newPO: PurchaseOrder = {
      ...newPOData,
      id: 'po-' + Date.now(),
      poNumber: 'PO-' + Math.floor(10000 + Math.random() * 90000),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setPurchaseOrders(prev => [newPO, ...prev]);

    if (user) {
      savePurchaseOrderToFirestore(user.uid, newPO);
    }
  };

  // Handle Receive PO & Restock
  const handleReceivePO = (poId: string) => {
    const targetPO = purchaseOrders.find(p => p.id === poId);
    if (!targetPO) return;

    // 1. Update PO Status
    const updatedPO = { ...targetPO, status: 'delivered' as const };
    setPurchaseOrders(prev =>
      prev.map(p => (p.id === poId ? updatedPO : p))
    );

    if (user) {
      savePurchaseOrderToFirestore(user.uid, updatedPO);
    }

    // 2. Add Stock to Product & Recalculate Risk
    setProducts(prev =>
      prev.map(prod => {
        if (prod.id === targetPO.productId) {
          const updatedStock = prod.currentStock + targetPO.quantity;
          const newRisk = calculateRiskScore(updatedStock, prod.dailyDemand, prod.leadTimeDays, prod.safetyStock).riskScore;
          const newStatus = calculateStockStatus(updatedStock, prod.dailyDemand, prod.leadTimeDays, prod.daysWithoutSale);
          const updatedProduct: Product = {
            ...prod,
            currentStock: updatedStock,
            riskScore: newRisk,
            status: newStatus,
          };
          if (user) {
            saveProductToFirestore(user.uid, updatedProduct);
          }
          return updatedProduct;
        }
        return prod;
      })
    );
  };

  // Handle Record Customer Sale
  const handleRecordSale = (productId: string, quantitySold: number) => {
    setProducts(prev =>
      prev.map(prod => {
        if (prod.id === productId) {
          const updatedStock = Math.max(0, prod.currentStock - quantitySold);
          const newRisk = calculateRiskScore(updatedStock, prod.dailyDemand, prod.leadTimeDays, prod.safetyStock).riskScore;
          const newStatus = calculateStockStatus(updatedStock, prod.dailyDemand, prod.leadTimeDays, 0);
          
          // Append sale to history
          const updatedHistory = [
            ...prod.salesHistory.slice(1),
            {
              date: new Date().toISOString().split('T')[0],
              sales: quantitySold,
              forecast: prod.dailyDemand,
            },
          ];

          const updatedProduct: Product = {
            ...prod,
            currentStock: updatedStock,
            salesHistory: updatedHistory,
            daysWithoutSale: 0,
            riskScore: newRisk,
            status: newStatus,
          };

          if (user) {
            saveProductToFirestore(user.uid, updatedProduct);
          }

          return updatedProduct;
        }
        return prod;
      })
    );
  };

  // Handle Add New Product SKU
  const handleAddProduct = (newProdData: Omit<Product, 'id' | 'riskScore' | 'status' | 'salesHistory' | 'eoq' | 'safetyStock' | 'reorderPoint'>) => {
    const { safetyStock, reorderPoint } = calculateSafetyStockAndROP(newProdData.dailyDemand, newProdData.leadTimeDays);
    const eoq = calculateEOQ(newProdData.dailyDemand * 365, 25, newProdData.costPrice, 0.2);
    const risk = calculateRiskScore(newProdData.currentStock, newProdData.dailyDemand, newProdData.leadTimeDays, safetyStock).riskScore;
    const status = calculateStockStatus(newProdData.currentStock, newProdData.dailyDemand, newProdData.leadTimeDays, 0);

    // Initial sales history
    const history = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return {
        date: d.toISOString().split('T')[0],
        sales: Math.max(0, Math.round(newProdData.dailyDemand + (Math.random() * 4 - 2))),
        forecast: Math.round(newProdData.dailyDemand),
      };
    });

    const newProd: Product = {
      ...newProdData,
      id: 'prod-' + Date.now(),
      safetyStock,
      reorderPoint,
      eoq,
      riskScore: risk,
      status,
      salesHistory: history,
    };

    setProducts(prev => [newProd, ...prev]);
    setSelectedProduct(newProd);

    if (user) {
      saveProductToFirestore(user.uid, newProd);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 antialiased selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      
      {/* Navigation Header */}
      <Navbar
        activeTab={currentTab}
        setActiveTab={setCurrentTab}
        healthScore={healthScore}
        tokensSavedPercentage={68}
        tokensSavedTotal={14200}
        onOpenRecordSale={() => setIsRecordSaleOpen(true)}
        onOpenAddProduct={() => setIsAddProductOpen(true)}
        onToggleChat={() => setIsAIAssistantOpen(prev => !prev)}
        isChatOpen={isAIAssistantOpen}
        onSelectDemoScenario={handleSelectScenario}
        currentDemoScenario={activeDemoScenario}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode(prev => prev === 'android' ? 'desktop' : 'android')}
        onOpenAndroidCode={() => setIsAndroidCodeOpen(true)}
      />

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        
        {viewMode === 'android' ? (
          <div className="py-4 flex flex-col items-center justify-center space-y-4">
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span>📱 Android Pixel 9 Pro Material 3 Simulation</span>
              <span>•</span>
              <button 
                onClick={() => setIsAndroidCodeOpen(true)}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                Inspect Jetpack Compose Kotlin Code
              </button>
            </div>
            
            <AndroidMobileView
              products={products}
              suppliers={suppliers}
              actionQueue={actionQueue}
              purchaseOrders={purchaseOrders}
              healthScore={healthScore}
              totalValuation={totalValuation}
              deadCapital={deadCapital}
              criticalCount={criticalCount}
              attentionCount={attentionCount}
              avoidedLoss={avoidedLoss}
              activeScenario={activeDemoScenario}
              onSelectProduct={prod => {
                setSelectedProduct(prod);
                setDrilldownProduct(prod);
              }}
              onApproveAction={handleApproveAction}
              onOpenWhyModal={setActionWhyItem}
              onOpenRecordSale={() => setIsRecordSaleOpen(true)}
              onOpenAddProduct={() => setIsAddProductOpen(true)}
              onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
              onCreatePO={handleCreatePurchaseOrder}
              onSelectScenario={handleSelectScenario}
            />
          </div>
        ) : (
          <>
            {/* Quick Operational Floating / Top Bar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/60 px-5 py-3 backdrop-blur-md shadow-sm">
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  StockMind Decision Engine: Active
                </span>
                <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>
                <span className="hidden sm:inline text-slate-600 dark:text-slate-400">
                  Scenario: <strong className="text-slate-800 dark:text-slate-200 capitalize">{activeDemoScenario.replace('_', ' ')}</strong>
                </span>
                {user && (
                  <>
                    <span className="hidden md:inline text-slate-300 dark:text-slate-700">|</span>
                    <span className="hidden md:flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      <Cloud className="h-3.5 w-3.5" />
                      Firestore Synced
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsRecordSaleOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/90 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
                >
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                  Record Sale
                </button>

                <button
                  onClick={() => setIsAddProductOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 shadow-sm shadow-indigo-600/30 transition-all"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add SKU
                </button>
              </div>
            </div>

            {/* Tab View Router */}
            {currentTab === 'dashboard' && (
              <ExecutiveDashboard
                products={products}
                healthScore={healthScore}
                healthDelta={4.2}
                totalValuation={totalValuation}
                deadCapital={deadCapital}
                criticalCount={criticalCount}
                attentionCount={attentionCount}
                avoidedLoss={avoidedLoss}
                actionQueue={actionQueue}
                onApproveAction={handleApproveAction}
                onOpenWhyModal={setActionWhyItem}
                onSelectProduct={prod => {
                  setSelectedProduct(prod);
                  setDrilldownProduct(prod);
                }}
                onNavigateTab={setCurrentTab}
              />
            )}

            {currentTab === 'forecasting' && (
              <DemandForecastingView
                products={products}
                selectedProduct={selectedProduct}
                onSelectProduct={setSelectedProduct}
                onOpenOrderModal={() => setCurrentTab('suppliers')}
              />
            )}

            {currentTab === 'suppliers' && (
              <SupplierMatrixView
                products={products}
                suppliers={suppliers}
                selectedProduct={selectedProduct}
                onSelectProduct={setSelectedProduct}
                onCreatePurchaseOrder={handleCreatePurchaseOrder}
              />
            )}

            {currentTab === 'simulator' && (
              <ScenarioSimulator
                products={products}
                selectedProduct={selectedProduct}
                onSelectProduct={setSelectedProduct}
              />
            )}

            {currentTab === 'catalog' && (
              <ProductCatalogTable
                products={products}
                onSelectProduct={prod => {
                  setSelectedProduct(prod);
                  setDrilldownProduct(prod);
                }}
                onOpenRecordSale={prod => {
                  setSelectedProduct(prod);
                  setIsRecordSaleOpen(true);
                }}
                onOpenReorder={prod => {
                  setSelectedProduct(prod);
                  setCurrentTab('suppliers');
                }}
              />
            )}

            {currentTab === 'orders' && (
              <PurchaseOrdersView
                purchaseOrders={purchaseOrders}
                onReceivePO={handleReceivePO}
                onNavigateTab={setCurrentTab}
              />
            )}
          </>
        )}

      </main>

      {/* ------------------------------------------------------------- */}
      {/* MODALS & DRAWERS                                              */}
      {/* ------------------------------------------------------------- */}

      {/* SKU Deep Dive & Explainable AI Modal */}
      {drilldownProduct && (
        <ProductDetailModal
          product={drilldownProduct}
          suppliers={suppliers}
          onClose={() => setDrilldownProduct(null)}
          onOpenReorder={prod => {
            setDrilldownProduct(null);
            setSelectedProduct(prod);
            setCurrentTab('suppliers');
          }}
          onOpenRecordSale={prod => {
            setDrilldownProduct(null);
            setSelectedProduct(prod);
            setIsRecordSaleOpen(true);
          }}
        />
      )}

      {/* Action Center "Why?" Explainable AI Modal */}
      {actionWhyItem && (
        <ActionWhyModal
          action={actionWhyItem}
          onClose={() => setActionWhyItem(null)}
          onApprove={handleApproveAction}
        />
      )}

      {/* Record Sale Modal */}
      {isRecordSaleOpen && (
        <RecordSaleModal
          products={products}
          initialProduct={selectedProduct}
          onClose={() => setIsRecordSaleOpen(false)}
          onRecordSale={handleRecordSale}
        />
      )}

      {/* Add New SKU Modal */}
      {isAddProductOpen && (
        <AddProductModal
          suppliers={suppliers}
          onClose={() => setIsAddProductOpen(false)}
          onAddProduct={handleAddProduct}
        />
      )}

      {/* AI Multi-Assistant Slide-Over Drawer with High Thinking mode */}
      <AIMultiAssistant
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        products={products}
        suppliers={suppliers}
        onSelectProduct={prod => {
          setSelectedProduct(prod);
          setDrilldownProduct(prod);
        }}
        onNavigateTab={setCurrentTab}
      />

      {/* Android Jetpack Compose Native Code Modal */}
      <AndroidCodeModal
        isOpen={isAndroidCodeOpen}
        onClose={() => setIsAndroidCodeOpen(false)}
      />

    </div>
  );
}
