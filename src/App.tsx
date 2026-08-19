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

export default function App() {
  const { user } = useAuth();

  // Navigation State
  const [currentTab, setCurrentTab] = useState<ActiveTab>('dashboard');

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
      const updated = INITIAL_PRODUCTS.map(p => {
        const spikeDemand = p.category === 'Groceries' || p.category === 'Electronics' 
          ? Math.round(p.dailyDemand * 1.8) 
          : Math.round(p.dailyDemand * 1.4);
        const { safetyStock, reorderPoint } = calculateSafetyStockAndROP(spikeDemand, p.leadTimeDays);
        const { riskScore, status } = calculateRiskScore(p.currentStock, spikeDemand, p.leadTimeDays, safetyStock, p.demandTrend + 45, p.daysWithoutSale);

        return {
          ...p,
          dailyDemand: spikeDemand,
          safetyStock,
          reorderPoint,
          riskScore,
          status,
          demandTrend: p.demandTrend + 45,
        };
      });
      setProducts(updated);
    } else if (scenario === 'supply_shock') {
      const updated = INITIAL_PRODUCTS.map(p => {
        const delayedLead = p.leadTimeDays + 5;
        const { safetyStock, reorderPoint } = calculateSafetyStockAndROP(p.dailyDemand, delayedLead);
        const { riskScore, status } = calculateRiskScore(p.currentStock, p.dailyDemand, delayedLead, safetyStock, p.demandTrend, p.daysWithoutSale);

        return {
          ...p,
          leadTimeDays: delayedLead,
          safetyStock,
          reorderPoint,
          riskScore,
          status,
        };
      });
      setProducts(updated);
    } else if (scenario === 'dead_stock_flush') {
      const updated = INITIAL_PRODUCTS.map(p => {
        if (p.status === 'dead_stock' || p.daysWithoutSale >= 25) {
          return {
            ...p,
            unitPrice: Math.round(p.unitPrice * 0.75),
            dailyDemand: 4.5,
            daysWithoutSale: 0,
            status: 'warning' as const,
            riskScore: 40,
          };
        }
        return p;
      });
      setProducts(updated);
    }
  };

  // Human-In-The-Loop Action Approval
  const handleApproveAction = (action: AIActionItem) => {
    const updatedQueue = actionQueue.map(a => {
      if (a.id === action.id) {
        return { ...a, status: 'approved' as const };
      }
      return a;
    });
    setActionQueue(updatedQueue);

    if (user) {
      updateActionInFirestore(user.uid, { ...action, status: 'approved' });
    }

    if (action.actionType === 'approve_reorder') {
      const product = products.find(p => p.sku === action.productSku);
      if (product) {
        const sup = suppliers.find(s => s.id === product.preferredSupplierId) || suppliers[0];
        const poNumber = `PO-${Math.floor(100000 + Math.random() * 900000)}`;
        const reorderQty = product.eoq || 100;
        const unitCost = Math.round(product.costPrice * sup.unitCostMarkup);

        const newPO: PurchaseOrder = {
          id: `po-${Date.now()}`,
          poNumber,
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          supplierId: sup.id,
          supplierName: sup.name,
          quantity: reorderQty,
          unitCost,
          totalCost: reorderQty * unitCost,
          status: 'submitted',
          createdAt: new Date().toISOString().split('T')[0],
          expectedDeliveryDate: new Date(Date.now() + sup.baseLeadTime * 86400000).toISOString().split('T')[0],
          userId: user?.uid,
        };

        const updatedPOs = [newPO, ...purchaseOrders];
        setPurchaseOrders(updatedPOs);

        if (user) {
          savePurchaseOrderToFirestore(user.uid, newPO);
        }

        const updatedProducts = products.map(p => {
          if (p.id === product.id) {
            return {
              ...p,
              riskScore: Math.max(10, p.riskScore - 40),
              status: 'healthy' as const,
            };
          }
          return p;
        });
        setProducts(updatedProducts);
      }
    }
  };

  // Record Sale & Decrement Stock
  const handleRecordSale = (productId: string, quantity: number) => {
    const updated = products.map(p => {
      if (p.id === productId) {
        const newStock = Math.max(0, p.currentStock - quantity);
        const { riskScore, status } = calculateRiskScore(newStock, p.dailyDemand, p.leadTimeDays, p.safetyStock, p.demandTrend, 0);

        const todayStr = new Date().toISOString().split('T')[0];
        const historyCopy = [...p.salesHistory];
        const lastEntry = historyCopy[historyCopy.length - 1];

        if (lastEntry && lastEntry.date === todayStr) {
          lastEntry.sales += quantity;
        } else {
          historyCopy.push({ date: todayStr, sales: quantity });
        }

        const updatedProduct: Product = {
          ...p,
          currentStock: newStock,
          daysWithoutSale: 0,
          riskScore,
          status,
          salesHistory: historyCopy,
        };

        if (user) {
          saveProductToFirestore(user.uid, updatedProduct);
        }

        return updatedProduct;
      }
      return p;
    });

    setProducts(updated);
  };

  // Add SKU to Catalog
  const handleAddProduct = (newProductData: Omit<Product, 'id' | 'salesHistory' | 'reorderPoint' | 'eoq' | 'riskScore' | 'status'>) => {
    const id = `prod-${Date.now()}`;
    const { safetyStock, reorderPoint } = calculateSafetyStockAndROP(newProductData.dailyDemand, newProductData.leadTimeDays);
    const eoq = calculateEOQ(newProductData.dailyDemand, newProductData.costPrice, 0.20, 1200);
    const { riskScore, status } = calculateRiskScore(
      newProductData.currentStock, 
      newProductData.dailyDemand, 
      newProductData.leadTimeDays, 
      safetyStock, 
      newProductData.demandTrend || 0, 
      newProductData.daysWithoutSale || 0
    );

    const history = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return {
        date: d.toISOString().split('T')[0],
        sales: Math.max(1, Math.round(newProductData.dailyDemand * (0.8 + Math.random() * 0.4))),
      };
    });

    const newProduct: Product = {
      ...newProductData,
      id,
      safetyStock,
      reorderPoint,
      eoq,
      riskScore,
      status,
      salesHistory: history,
      userId: user?.uid,
    };

    const updated = [newProduct, ...products];
    setProducts(updated);
    setSelectedProduct(newProduct);

    if (user) {
      saveProductToFirestore(user.uid, newProduct);
    }
  };

  // Create Purchase Order
  const handleCreatePO = (poData: Omit<PurchaseOrder, 'id' | 'poNumber' | 'createdAt'>) => {
    const newPO: PurchaseOrder = {
      ...poData,
      id: `po-${Date.now()}`,
      poNumber: `PO-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString().split('T')[0],
      userId: user?.uid,
    };

    const updated = [newPO, ...purchaseOrders];
    setPurchaseOrders(updated);

    if (user) {
      savePurchaseOrderToFirestore(user.uid, newPO);
    }
  };

  // Receive Purchase Order
  const handleReceivePO = (poId: string) => {
    const targetPO = purchaseOrders.find(po => po.id === poId);
    if (!targetPO) return;

    const updatedPOs = purchaseOrders.map(po => {
      if (po.id === poId) {
        return { ...po, status: 'delivered' as const };
      }
      return po;
    });
    setPurchaseOrders(updatedPOs);

    const updatedProducts = products.map(p => {
      if (p.id === targetPO.productId) {
        const newStock = p.currentStock + targetPO.quantity;
        const { riskScore, status } = calculateRiskScore(newStock, p.dailyDemand, p.leadTimeDays, p.safetyStock, p.demandTrend, 0);

        const prodUpdated = {
          ...p,
          currentStock: newStock,
          daysWithoutSale: 0,
          riskScore,
          status,
          lastRestocked: new Date().toISOString().split('T')[0],
        };

        if (user) {
          saveProductToFirestore(user.uid, prodUpdated);
        }

        return prodUpdated;
      }
      return p;
    });

    setProducts(updatedProducts);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      
      {/* Primary White Navigation Header */}
      <Navbar
        activeTab={currentTab}
        setActiveTab={setCurrentTab}
        healthScore={healthScore}
        tokensSavedPercentage={94}
        tokensSavedTotal={14200}
        onOpenRecordSale={() => setIsRecordSaleOpen(true)}
        onOpenAddProduct={() => setIsAddProductOpen(true)}
        onToggleChat={() => setIsAIAssistantOpen(!isAIAssistantOpen)}
        isChatOpen={isAIAssistantOpen}
        onSelectDemoScenario={handleSelectScenario}
        currentDemoScenario={activeDemoScenario}
      />

      {/* Main Workspace Body */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">

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
            onOpenWhyModal={action => setActionWhyItem(action)}
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
            onOpenReorderModal={prod => {
              setSelectedProduct(prod);
              setCurrentTab('suppliers');
            }}
          />
        )}

        {currentTab === 'suppliers' && (
          <SupplierMatrixView
            products={products}
            suppliers={suppliers}
            selectedProduct={selectedProduct}
            onSelectProduct={setSelectedProduct}
            onCreatePO={handleCreatePO}
            onNavigateToOrders={() => setCurrentTab('orders')}
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

      {/* AI Multi-Assistant Slide-Over Drawer */}
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

    </div>
  );
}
