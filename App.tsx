
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  Plus, 
  Menu, 
  X, 
  ArrowUpCircle, 
  Settings as SettingsIcon,
  TrendingUp,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { AppView, Product, Customer, Sale, Expense, ShopConfig, AuthSession } from './types';
import Dashboard from './components/Dashboard';
import Sales from './components/Sales';
import Inventory from './components/Inventory';
import CRM from './components/CRM';
import Finances from './components/Finances';
import Settings from './components/Settings';
import Login from './components/Login';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [session, setSession] = useState<AuthSession | null>(null);
  
  // App State
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [shopConfig, setShopConfig] = useState<ShopConfig>({
    name: 'Minha Loja',
    phone: '',
    address: '',
    nif: '',
    currency: 'Kz'
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const savedSession = localStorage.getItem('ga_session');
    if (savedSession) setSession(JSON.parse(savedSession));

    const savedProducts = localStorage.getItem('ga_products');
    const savedCustomers = localStorage.getItem('ga_customers');
    const savedSales = localStorage.getItem('ga_sales');
    const savedExpenses = localStorage.getItem('ga_expenses');
    const savedConfig = localStorage.getItem('ga_shop_config');

    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
    if (savedSales) setSales(JSON.parse(savedSales));
    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
    if (savedConfig) setShopConfig(JSON.parse(savedConfig));
  }, []);

  useEffect(() => {
    localStorage.setItem('ga_products', JSON.stringify(products));
    localStorage.setItem('ga_customers', JSON.stringify(customers));
    localStorage.setItem('ga_sales', JSON.stringify(sales));
    localStorage.setItem('ga_expenses', JSON.stringify(expenses));
    localStorage.setItem('ga_shop_config', JSON.stringify(shopConfig));
    if (session) {
      localStorage.setItem('ga_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('ga_session');
    }
  }, [products, customers, sales, expenses, shopConfig, session]);

  const handleLogin = (newSession: AuthSession) => {
    setSession(newSession);
    if (!shopConfig.name || shopConfig.name === 'Minha Loja') {
      setShopConfig(prev => ({ ...prev, name: newSession.companyName }));
    }
  };

  const handleLogout = () => {
    if (confirm('Deseja realmente encerrar a sessão?')) {
      setSession(null);
      setIsSidebarOpen(false);
    }
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard sales={sales} expenses={expenses} products={products} customers={customers} setActiveView={setActiveView} shopConfig={shopConfig} />;
      case 'sales':
        return <Sales sales={sales} setSales={setSales} products={products} customers={customers} setProducts={setProducts} setCustomers={setCustomers} shopConfig={shopConfig} />;
      case 'inventory':
        return <Inventory products={products} setProducts={setProducts} shopConfig={shopConfig} />;
      case 'crm':
        return <CRM customers={customers} setCustomers={setCustomers} sales={sales} shopConfig={shopConfig} />;
      case 'finances':
        return <Finances sales={sales} expenses={expenses} setExpenses={setExpenses} shopConfig={shopConfig} />;
      case 'settings':
        return <Settings shopConfig={shopConfig} setShopConfig={setShopConfig} />;
      default:
        return <Dashboard sales={sales} expenses={expenses} products={products} customers={customers} setActiveView={setActiveView} shopConfig={shopConfig} />;
    }
  };

  if (!session) return <Login onLogin={handleLogin} />;

  const MobileBottomTab = ({ view, icon: Icon, label }: { view: AppView, icon: any, label: string }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`flex flex-col items-center justify-center gap-1 flex-1 transition-all ${
        activeView === view ? 'text-blue-600' : 'text-gray-400'
      }`}
    >
      <div className={`p-1 rounded-lg ${activeView === view ? 'bg-blue-50' : ''}`}>
        <Icon size={20} strokeWidth={activeView === view ? 2.5 : 2} />
      </div>
      <span className="text-[10px] font-black uppercase tracking-tighter">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r h-screen sticky top-0">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <TrendingUp size={24} />
          </div>
          <h1 className="text-xl font-black truncate">{shopConfig.name}</h1>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'sales', icon: ShoppingCart, label: 'Vendas' },
            { id: 'inventory', icon: Package, label: 'Inventário' },
            { id: 'crm', icon: Users, label: 'Clientes' },
            { id: 'finances', icon: ArrowUpCircle, label: 'Finanças' },
            { id: 'settings', icon: SettingsIcon, label: 'Definições' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as AppView)}
              className={`flex items-center justify-between w-full p-4 rounded-2xl transition-all group ${
                activeView === item.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={20} />
                <span className="font-bold">{item.label}</span>
              </div>
              <ChevronRight size={14} className={`opacity-0 group-hover:opacity-100 transition-opacity ${activeView === item.id ? 'opacity-100' : ''}`} />
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-black text-sm"
          >
            <LogOut size={18} /> Sair do Sistema
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen pb-24 md:pb-8 relative scroll-smooth">
        {/* Header Mobile */}
        <header className="md:hidden bg-white/80 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between sticky top-0 z-30 safe-area-pt">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <TrendingUp size={18} />
            </div>
            <span className="font-black text-lg tracking-tight truncate max-w-[180px]">{shopConfig.name}</span>
          </div>
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500'}`}></div>
        </header>

        <div className="max-w-5xl mx-auto p-4 md:p-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {renderView()}
        </div>
      </main>

      {/* Mobile Bottom Navigation (Nativo em APKs) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-100 px-2 py-3 flex items-center justify-around z-50 safe-area-pb shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <MobileBottomTab view="dashboard" icon={LayoutDashboard} label="Início" />
        <MobileBottomTab view="sales" icon={ShoppingCart} label="Vendas" />
        <div className="relative -mt-12">
            <button 
                onClick={() => setActiveView('sales')}
                className="w-14 h-14 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-200 flex items-center justify-center active:scale-90 transition-all border-4 border-white"
            >
                <Plus size={28} strokeWidth={3} />
            </button>
        </div>
        <MobileBottomTab view="inventory" icon={Package} label="Stock" />
        <MobileBottomTab view="settings" icon={SettingsIcon} label="Ajustes" />
      </nav>
    </div>
  );
};

export default App;
