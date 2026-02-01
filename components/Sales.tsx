
import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  ArrowLeft, 
  CheckCircle2, 
  ShoppingCart,
  User,
  CreditCard,
  Banknote,
  Smartphone,
  Briefcase,
  Package,
  RotateCcw,
  Tag,
  AlertCircle
} from 'lucide-react';
import { Sale, Product, Customer, SaleItem, PaymentMethod, ShopConfig } from '../types';
import Receipt from './Receipt';

interface SalesProps {
  sales: Sale[];
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  shopConfig: ShopConfig;
}

const Sales: React.FC<SalesProps> = ({ sales, setSales, products, setProducts, customers, setCustomers, shopConfig }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedItems, setSelectedItems] = useState<SaleItem[]>([]);
  const [customerName, setCustomerName] = useState<string>('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Dinheiro');
  const [showReceipt, setShowReceipt] = useState<Sale | null>(null);

  const categories = ['Todas', 'Alimentos', 'Bebidas', 'Roupas', 'Serviços', 'Eletrônicos', 'Geral'];

  const formatCurrency = (value: number) => {
    const formatted = new Intl.NumberFormat('pt-AO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
    return `${formatted} ${shopConfig.currency || 'Kz'}`;
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'Todas' || p.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const currentTotal = useMemo(() => 
    selectedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0)
  , [selectedItems]);

  const addItem = (product: Product) => {
    if (product.manageStock && product.stock <= 0) {
      alert("Produto sem stock disponível!");
      return;
    }
    const existing = selectedItems.find(i => i.productId === product.id);
    if (existing) {
      if (product.manageStock && existing.quantity >= product.stock) {
        alert("Limite de stock atingido!");
        return;
      }
      setSelectedItems(selectedItems.map(item => 
        item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setSelectedItems([...selectedItems, { 
        productId: product.id, 
        name: product.name, 
        price: product.price, 
        quantity: 1 
      }]);
    }
  };

  const removeItem = (productId: string) => {
    setSelectedItems(selectedItems.filter(item => item.productId !== productId));
  };

  const finalizeSale = () => {
    if (selectedItems.length === 0 || !customerName.trim()) {
        alert("Preencha o nome do cliente e adicione itens.");
        return;
    }

    const newSale: Sale = {
      id: Math.random().toString(36).substr(2, 6).toUpperCase(),
      date: new Date().toISOString(),
      customerId: selectedCustomerId || undefined,
      items: selectedItems,
      total: currentTotal,
      paymentMethod,
      status: 'completed'
    };

    setSales([newSale, ...sales]);
    
    setProducts(prev => prev.map(p => {
      const sold = selectedItems.find(item => item.productId === p.id);
      return (sold && p.manageStock) ? { ...p, stock: p.stock - sold.quantity } : p;
    }));

    if (selectedCustomerId) {
      setCustomers(prev => prev.map(c => 
        c.id === selectedCustomerId ? { ...c, totalSpent: c.totalSpent + currentTotal, lastVisit: new Date().toISOString() } : c
      ));
    } else {
      const existingCustomer = customers.find(c => c.name.toLowerCase() === customerName.toLowerCase());
      if (!existingCustomer) {
          const newCust: Customer = {
              id: Math.random().toString(36).substr(2, 6).toUpperCase(),
              name: customerName,
              phone: '',
              totalSpent: currentTotal,
              lastVisit: new Date().toISOString()
          };
          setCustomers(prev => [newCust, ...prev]);
      } else {
          setCustomers(prev => prev.map(c => 
            c.id === existingCustomer.id ? { ...c, totalSpent: c.totalSpent + currentTotal, lastVisit: new Date().toISOString() } : c
          ));
      }
    }

    setSelectedItems([]);
    setCustomerName('');
    setIsCreating(false);
    setShowReceipt(newSale);
  };

  const handleRefund = (sale: Sale) => {
    if (sale.status === 'refunded') return;
    
    const reason = window.prompt('Deseja realmente reembolsar esta venda? Se sim, insira o motivo do reembolso:');
    
    if (reason === null) return; // User cancelled

    setSales(prev => prev.map(s => s.id === sale.id ? {
      ...s,
      status: 'refunded',
      refundedAt: new Date().toISOString(),
      refundReason: reason || 'Motivo não especificado'
    } : s));

    // Restore stock
    setProducts(prev => prev.map(p => {
      const returned = sale.items.find(item => item.productId === p.id);
      return (returned && p.manageStock) ? { ...p, stock: p.stock + returned.quantity } : p;
    }));

    // Adjust customer spent
    const customerId = sale.customerId;
    if (customerId) {
        setCustomers(prev => prev.map(c => 
            c.id === customerId ? { ...c, totalSpent: Math.max(0, c.totalSpent - sale.total) } : c
        ));
    }
  };

  if (showReceipt) {
    return <Receipt 
        sale={showReceipt} 
        customer={customers.find(c => c.id === showReceipt.customerId) || { name: customerName } as any} 
        onBack={() => setShowReceipt(null)} 
        shopConfig={shopConfig}
    />;
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Vendas</h1>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
            isCreating ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-blue-600 text-white shadow-xl shadow-blue-100'
          }`}
        >
          {isCreating ? <ArrowLeft size={20} /> : <Plus size={20} />}
          {isCreating ? 'Cancelar' : 'Nova Venda'}
        </button>
      </div>

      {isCreating ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text"
                  placeholder="Pesquisar por nome, código (#ID) ou categoria..."
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-blue-500 shadow-sm outline-none transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                      selectedCategory === cat ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto max-h-[600px] p-1">
              {filteredProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => addItem(product)}
                  className={`bg-white p-4 rounded-3xl border border-gray-50 shadow-sm hover:shadow-md hover:border-blue-100 transition-all text-left flex flex-col justify-between h-44 group relative overflow-hidden ${(product.manageStock && product.stock <= 0) ? 'opacity-50 grayscale' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-widest ${product.manageStock ? 'text-blue-600 bg-blue-50' : 'text-purple-600 bg-purple-50'}`}>
                      {product.manageStock ? 'Item' : 'Serviço'}
                    </span>
                    <span className="text-[8px] font-mono text-gray-300">#{product.id}</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-800 line-clamp-2 text-sm leading-tight">{product.name}</span>
                    <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-tighter flex items-center gap-1">
                      <Tag size={10} /> {product.category}
                    </p>
                  </div>
                  <div className="flex flex-col mt-2">
                    <span className="text-lg font-black text-gray-900">{formatCurrency(product.price)}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-widest ${product.manageStock && product.stock < 5 ? 'text-red-500' : 'text-gray-400'}`}>
                      {product.manageStock ? `Qtd: ${product.stock}` : 'Ilimitado'}
                    </span>
                  </div>
                  <div className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-tl-2xl translate-y-full group-hover:translate-y-0 transition-transform">
                    <Plus size={16} />
                  </div>
                </button>
              ))}
              
              {filteredProducts.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-400 italic">
                  Nenhum resultado para "{searchQuery}"
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden flex flex-col sticky top-8" style={{ maxHeight: 'calc(100vh - 150px)' }}>
            <div className="p-6 border-b bg-gray-50/50">
              <h3 className="font-black text-gray-800 uppercase tracking-tight flex items-center gap-2">
                <ShoppingCart size={18} className="text-blue-600" /> Carrinho
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                      type="text"
                      placeholder="Nome do Cliente"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      list="customer-list"
                  />
                  <datalist id="customer-list">
                      {customers.map(c => <option key={c.id} value={c.name} />)}
                  </datalist>
              </div>

              <div className="space-y-3">
                {selectedItems.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 italic flex flex-col items-center gap-2">
                    <ShoppingCart size={32} strokeWidth={1} />
                    <span>Selecione itens à esquerda</span>
                  </div>
                ) : (
                  selectedItems.map(item => (
                    <div key={item.productId} className="flex items-center justify-between group animate-in slide-in-from-right-2">
                      <div className="flex-1">
                        <p className="font-bold text-gray-800 text-sm leading-tight">{item.name}</p>
                        <p className="text-[10px] text-gray-500">{item.quantity}x {formatCurrency(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-black text-gray-900">{formatCurrency(item.price * item.quantity)}</span>
                        <button onClick={() => removeItem(item.productId)} className="text-gray-300 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-6 bg-gray-50/80 space-y-4 border-t">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Forma de Pagamento</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Dinheiro', 'TPA', 'Transferência', 'Multicaixa Express'].map(method => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method as PaymentMethod)}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl text-[10px] font-bold transition-all ${
                        paymentMethod === method ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-gray-500 border border-gray-100 hover:bg-white'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-end border-t border-gray-200 pt-4">
                <span className="text-gray-500 font-bold uppercase text-xs tracking-widest">Total</span>
                <span className="text-3xl font-black text-blue-600 tracking-tighter">{formatCurrency(currentTotal)}</span>
              </div>

              <button 
                disabled={selectedItems.length === 0 || !customerName.trim()}
                onClick={finalizeSale}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-100 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                Concluir Venda
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sales.length === 0 ? (
            <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-gray-200 text-center text-gray-400">
              <ShoppingCart size={48} className="mx-auto mb-4 opacity-10" />
              <p className="font-medium">Nenhuma venda registada hoje.</p>
            </div>
          ) : (
            sales.map(sale => (
              <div key={sale.id} className={`bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden ${sale.status === 'refunded' ? 'opacity-60 bg-red-50/10' : ''}`}>
                <div className="flex justify-between items-start mb-3">
                  <div className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest ${sale.status === 'refunded' ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                    #{sale.id} {sale.status === 'refunded' && '- REEMBOLSADA'}
                  </div>
                  <span className="text-[10px] font-bold text-gray-400">
                    {new Date(sale.date).toLocaleDateString('pt-AO')}
                  </span>
                </div>
                <div className="mb-4">
                   <p className="text-xs text-gray-500 font-bold uppercase tracking-tight">Valor</p>
                   <p className={`text-xl font-black ${sale.status === 'refunded' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{formatCurrency(sale.total)}</p>
                </div>

                {sale.status === 'refunded' && sale.refundReason && (
                  <div className="mb-4 p-2 bg-red-50 rounded-xl flex items-start gap-2 border border-red-100">
                    <AlertCircle size={12} className="text-red-500 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-red-700 italic font-medium leading-tight">"{sale.refundReason}"</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t gap-2">
                  <span className="text-xs font-bold text-gray-400 italic truncate flex-1">{sale.paymentMethod}</span>
                  <div className="flex items-center gap-2">
                    {sale.status !== 'refunded' && (
                        <button 
                            onClick={() => handleRefund(sale)}
                            className="p-2 text-gray-300 hover:text-red-500 transition-colors bg-gray-50 rounded-lg"
                            title="Reembolsar Venda"
                        >
                            <RotateCcw size={14} />
                        </button>
                    )}
                    <button 
                        onClick={() => setShowReceipt(sale)}
                        className={`text-xs font-bold ${sale.status === 'refunded' ? 'text-red-500' : 'text-blue-600'} hover:underline`}
                    >
                        Ver Recibo
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Sales;
