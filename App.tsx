
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
  TrendingUp
} from 'lucide-react';
import { AppView, Product, Customer, Sale, Expense, ShopConfig } from './types';
import Dashboard from './components/Dashboard';
import Sales from './components/Sales';
import Inventory from './components/Inventory';
import CRM from './components/CRM';
import Finances from './components/Finances';
import Settings from './components/Settings';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
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

  // Load Initial Data
  useEffect(() => {
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

  // Persist State Changes
  useEffect(() => {
    localStorage.setItem('ga_products', JSON.stringify(products));
    localStorage.setItem('ga_customers', JSON.stringify(customers));
    localStorage.setItem('ga_sales', JSON.stringify(sales));
    localStorage.setItem('ga_expenses', JSON.stringify(expenses));
    localStorage.setItem('ga_shop_config', JSON.stringify(shopConfig));
  }, [products, customers, sales, expenses, shopConfig]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <Dashboard 
            sales={sales} 
            expenses={expenses} 
            products={products} 
            customers={customers}
            setActiveView={setActiveView}
            shopConfig={shopConfig}
          />
        );
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

  const NavItem = ({ view, icon: Icon, label }: { view: AppView, icon: any, label: string }) => (
    <button
      onClick={() => { setActiveView(view); setIsSidebarOpen(false); }}
      className={`flex items-center gap-3 w-full p-4 rounded-xl transition-all ${
        activeView === view ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-500 hover:bg-gray-100'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 overflow-hidden">
      <header className="md:hidden bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <TrendingUp size={18} />
          </div>
          <span className="font-bold text-lg tracking-tight truncate max-w-[150px]">{shopConfig.name}</span>
        </div>
        <button onClick={toggleSidebar} className="p-2 text-gray-600">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      <aside className={`
        fixed md:static inset-0 z-40 bg-white border-r w-72 transition-transform duration-300 transform 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        flex flex-col h-full
      `}>
        <div className="hidden md:flex items-center gap-3 px-6 py-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
            <TrendingUp size={24} />
          </div>
          <h1 className="text-xl font-bold truncate pr-2">{shopConfig.name}</h1>
        </div>

        <nav className="flex-1 px-4 space-y-2 py-4">
          <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem view="sales" icon={ShoppingCart} label="Vendas" />
          <NavItem view="inventory" icon={Package} label="Inventário" />
          <NavItem view="crm" icon={Users} label="Clientes" />
          <NavItem view="finances" icon={ArrowUpCircle} label="Finanças" />
          <div className="pt-4 border-t border-gray-100">
            <NavItem view="settings" icon={SettingsIcon} label="Configurações" />
          </div>
        </nav>

        <div className="p-6 mt-auto no-print">
          <div className="bg-blue-50 p-4 rounded-xl">
            <p className="text-xs text-blue-600 font-bold uppercase mb-1">Status</p>
            <p className="text-sm text-blue-800 font-medium">Sistema Online</p>
          </div>
        </div>
      </aside>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <main className="flex-1 overflow-y-auto h-screen pb-20 md:pb-0 relative">
        <div className="max-w-5xl mx-auto p-4 md:p-8">
          {renderView()}
        </div>

        {activeView !== 'sales' && (
          <button 
            onClick={() => setActiveView('sales')}
            className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-green-600 text-white rounded-full shadow-xl flex items-center justify-center active:scale-95 transition-transform z-50"
          >
            <Plus size={28} />
          </button>
        )}
      </main>
    </div>
  );
};

export default App;
