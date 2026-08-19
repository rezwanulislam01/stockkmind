import React, { useState } from 'react';
import { 
  Bot, 
  Layers, 
  LineChart, 
  ShoppingCart, 
  Table, 
  Plus, 
  TrendingUp, 
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type ActiveTab = 'dashboard' | 'forecasting' | 'suppliers' | 'simulator' | 'catalog' | 'orders';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  healthScore: number;
  tokensSavedPercentage: number;
  tokensSavedTotal: number;
  onOpenRecordSale: () => void;
  onOpenAddProduct: () => void;
  onToggleChat: () => void;
  isChatOpen: boolean;
  onSelectDemoScenario: (scenario: string) => void;
  currentDemoScenario: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenRecordSale,
  onOpenAddProduct,
  onToggleChat,
  isChatOpen,
}) => {
  const { user, signOutUser } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        
        {/* Brand & Platform Identity */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 p-0.5 shadow-sm shadow-emerald-600/30 text-white font-black text-lg">
            ৳
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900">StockMind BD</span>
              <span className="rounded-md border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                BDT (৳)
              </span>
            </div>
            <p className="hidden text-[11px] text-slate-500 sm:block">Bangladesh SME Inventory Intelligence Platform</p>
          </div>
        </div>

        {/* Clean Simplified Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100/80 p-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            Dashboard & Actions
          </button>
          
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'catalog'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
            }`}
          >
            <Table className="h-3.5 w-3.5" />
            Products Catalog
          </button>

          <button
            onClick={() => setActiveTab('suppliers')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'suppliers' || activeTab === 'orders'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
            }`}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Suppliers & Orders
          </button>

          <button
            onClick={() => setActiveTab('forecasting')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'forecasting' || activeTab === 'simulator'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
            }`}
          >
            <LineChart className="h-3.5 w-3.5" />
            Demand Forecast
          </button>
        </nav>

        {/* Right Actions: Record Sale, Add SKU, AI Drawer */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* Record Sale Button */}
          <button
            onClick={onOpenRecordSale}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-all shadow-xs"
          >
            <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Record Sale</span>
            <span className="sm:hidden">Sale</span>
          </button>

          {/* Add SKU Button */}
          <button
            onClick={onOpenAddProduct}
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-xs"
          >
            <Plus className="h-3.5 w-3.5 text-slate-500" />
            <span>Add SKU</span>
          </button>

          {/* AI Multi-Assistant Drawer Trigger */}
          <button
            onClick={onToggleChat}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold shadow-xs transition-all ${
              isChatOpen
                ? 'border-emerald-600 bg-emerald-600 text-white shadow-emerald-600/30'
                : 'border-slate-200 bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            <Bot className="h-3.5 w-3.5 text-emerald-400" />
            <span>AI Copilot</span>
          </button>

          {/* User Profile Avatar if signed in */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-300 bg-emerald-50 text-xs font-bold text-emerald-800 hover:border-emerald-500 overflow-hidden"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="h-full w-full object-cover" />
                ) : (
                  <span>{user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}</span>
                )}
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-900 truncate">{user.displayName || 'BD Merchant'}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={async () => {
                      setShowUserMenu(false);
                      await signOutUser();
                    }}
                    className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </header>
  );
};
