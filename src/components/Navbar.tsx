import React, { useState } from 'react';
import { 
  Bot, 
  Layers, 
  LineChart, 
  ShoppingCart, 
  Sliders, 
  Table, 
  Zap, 
  Plus, 
  TrendingUp, 
  CheckCircle2, 
  Sparkles,
  RefreshCw,
  Package,
  Sun,
  Moon,
  LogIn,
  LogOut,
  User as UserIcon,
  Cloud,
  CloudCheck,
  ShieldCheck,
  Smartphone,
  Monitor,
  Code2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
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
  viewMode: 'desktop' | 'android';
  onToggleViewMode: () => void;
  onOpenAndroidCode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  healthScore,
  tokensSavedPercentage,
  tokensSavedTotal,
  onOpenRecordSale,
  onOpenAddProduct,
  onToggleChat,
  isChatOpen,
  onSelectDemoScenario,
  currentDemoScenario,
  viewMode,
  onToggleViewMode,
  onOpenAndroidCode,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { user, signIn, signOutUser, loading: authLoading } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signIn();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        
        {/* Brand & Platform Identity */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-blue-600 to-emerald-500 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-white dark:bg-slate-950">
              <Layers className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">StockMind</span>
              <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                DECISION INTELLIGENCE
              </span>
            </div>
            <p className="hidden text-[11px] text-slate-500 dark:text-slate-400 sm:block">AI-Powered SME Inventory Optimization</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/60 p-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            Dashboard & Actions
          </button>
          <button
            onClick={() => setActiveTab('forecasting')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'forecasting'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <LineChart className="h-3.5 w-3.5" />
            Demand Forecasting
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'suppliers'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Supplier Matrix
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'simulator'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            What-If Simulator
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'catalog'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Table className="h-3.5 w-3.5" />
            Catalog
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'orders'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Package className="h-3.5 w-3.5" />
            Orders (PO)
          </button>
        </nav>

        {/* Right Section: Preset, Theme Toggle, Auth, AI Button */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* Android View Mode Switcher */}
          <button
            onClick={onToggleViewMode}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all shadow-xs ${
              viewMode === 'android'
                ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-400'
                : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
            title="Toggle between Desktop Dashboard and Android Mobile App View"
          >
            {viewMode === 'android' ? (
              <>
                <Monitor className="h-3.5 w-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Web Mode</span>
              </>
            ) : (
              <>
                <Smartphone className="h-3.5 w-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Android App</span>
              </>
            )}
          </button>

          {/* Android Kotlin Source Code Modal Trigger */}
          <button
            onClick={onOpenAndroidCode}
            className="hidden lg:flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-2 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            title="View Android Jetpack Compose native source code"
          >
            <Code2 className="h-3.5 w-3.5 text-indigo-400" />
            <span>Android Code</span>
          </button>

          {/* Quick Demo Mode Dropdown */}
          <div className="relative hidden xl:flex items-center">
            <select
              value={currentDemoScenario}
              onChange={(e) => onSelectDemoScenario(e.target.value)}
              className="appearance-none rounded-lg border border-amber-500/40 bg-amber-500/10 py-1.5 pl-7 pr-7 text-xs font-semibold text-amber-700 dark:text-amber-300 transition-all hover:bg-amber-500/20 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
            >
              <option value="baseline" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">⚡ Preset: Baseline Normal</option>
              <option value="stockout_crisis" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">🚨 Preset: Stockout Crisis</option>
              <option value="black_friday" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">📈 Preset: Black Friday Surge (+75%)</option>
              <option value="supply_shock" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">⏱️ Preset: Lead Time Delay (+5 Days)</option>
              <option value="dead_stock_flush" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">🟡 Preset: Dead Stock Liquidation</option>
            </select>
            <Zap className="pointer-events-none absolute left-2 h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
          </div>

          {/* Theme Toggle Button (Light / Dark) */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 transition-all hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-600" />
            )}
          </button>

          {/* Action: Record Sale */}
          <button
            onClick={onOpenRecordSale}
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 transition-all hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white shadow-sm"
            title="Simulate or record customer sales"
          >
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
            Record Sale
          </button>

          {/* Action: Add SKU */}
          <button
            onClick={onOpenAddProduct}
            className="hidden md:flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 transition-all hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white shadow-sm"
          >
            <Plus className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            Add SKU
          </button>

          {/* Firebase Authentication / User Profile Button */}
          {authLoading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800"></div>
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 transition-all hover:bg-emerald-500/20"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="h-5 w-5 rounded-full object-cover border border-emerald-500/40"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <UserIcon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                )}
                <span className="hidden sm:inline font-semibold">{user.displayName?.split(' ')[0] || 'User'}</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500" title="Firestore Connected"></span>
              </button>

              {/* User Menu Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl z-50 text-slate-800 dark:text-slate-200">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.displayName || 'Authenticated User'}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="h-3 w-3" />
                      <span>Firestore Cloud Sync Active</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      signOutUser();
                    }}
                    className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 transition-all hover:bg-indigo-500/20 shadow-sm"
              title="Sign in with Google to sync inventory to Cloud Firestore"
            >
              <LogIn className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{isSigningIn ? 'Connecting...' : 'Sign In'}</span>
            </button>
          )}

          {/* AI Manager Drawer Trigger */}
          <button
            onClick={onToggleChat}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              isChatOpen 
                ? 'bg-emerald-500 text-white dark:text-slate-950 shadow-md shadow-emerald-500/20' 
                : 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/20 hover:brightness-110'
            }`}
          >
            <Bot className="h-4 w-4" />
            <span className="hidden sm:inline">AI Analyst</span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </button>

        </div>

      </div>

      {/* Mobile Sub-Navigation */}
      <div className="flex lg:hidden overflow-x-auto border-t border-slate-200 dark:border-slate-800/60 bg-slate-100/90 dark:bg-slate-950/80 px-4 py-2 gap-1.5 no-scrollbar">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex-shrink-0 rounded-md px-2.5 py-1 text-xs font-medium ${
            activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('forecasting')}
          className={`flex-shrink-0 rounded-md px-2.5 py-1 text-xs font-medium ${
            activeTab === 'forecasting' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Forecasting
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`flex-shrink-0 rounded-md px-2.5 py-1 text-xs font-medium ${
            activeTab === 'suppliers' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Suppliers
        </button>
        <button
          onClick={() => setActiveTab('simulator')}
          className={`flex-shrink-0 rounded-md px-2.5 py-1 text-xs font-medium ${
            activeTab === 'simulator' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Simulator
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex-shrink-0 rounded-md px-2.5 py-1 text-xs font-medium ${
            activeTab === 'catalog' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Catalog
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-shrink-0 rounded-md px-2.5 py-1 text-xs font-medium ${
            activeTab === 'orders' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Orders
        </button>
      </div>
    </header>
  );
};
