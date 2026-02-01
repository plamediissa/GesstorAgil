
import React, { useMemo, useState } from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  ArrowRight,
  Sparkles,
  Users,
  CreditCard,
  Target,
  Medal,
  WifiOff
} from 'lucide-react';
import { Sale, Expense, Product, Customer, AppView, ShopConfig } from '../types';
import { GoogleGenAI } from "@google/genai";

interface DashboardProps {
  sales: Sale[];
  expenses: Expense[];
  products: Product[];
  customers: Customer[];
  setActiveView: (view: AppView) => void;
  shopConfig: ShopConfig;
}

const Dashboard: React.FC<DashboardProps> = ({ sales, expenses, products, customers, setActiveView, shopConfig }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);

  const isOnline = navigator.onLine;

  const formatCurrency = (value: number) => {
    const formatted = new Intl.NumberFormat('pt-AO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
    return `${formatted} ${shopConfig.currency || 'Kz'}`;
  };

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaySales = sales
      .filter(s => s.date.startsWith(today))
      .reduce((acc, s) => acc + s.total, 0);
    
    const totalRevenue = sales.reduce((acc, s) => acc + s.total, 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
    const totalProfit = totalRevenue - totalExpenses;
    
    const managedProducts = products.filter(p => p.manageStock);
    const lowStockCount = managedProducts.filter(p => p.stock < 10 && p.stock > 0).length;
    const outOfStockCount = managedProducts.filter(p => p.stock === 0).length;

    const avgTicket = sales.length > 0 ? totalRevenue / sales.length : 0;

    // Calculate Top Products
    const productSalesMap: Record<string, { name: string, count: number }> = {};
    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (!productSalesMap[item.productId]) {
          productSalesMap[item.productId] = { name: item.name, count: 0 };
        }
        productSalesMap[item.productId].count += item.quantity;
      });
    });

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    return {
      todaySales,
      totalRevenue,
      totalProfit,
      lowStockCount,
      outOfStockCount,
      avgTicket,
      totalCustomers: customers.length,
      topProducts
    };
  }, [sales, expenses, products, customers]);

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const daySales = sales
        .filter(s => s.date.startsWith(date))
        .reduce((acc, s) => acc + s.total, 0);
      return {
        name: new Date(date).toLocaleDateString('pt-AO', { weekday: 'short' }),
        vendas: daySales,
      };
    });
  }, [sales]);

  const generateAIInsight = async () => {
    if (!isOnline) return;
    setIsGeneratingInsight(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Você é um CFO consultor para a loja "${shopConfig.name}" em Angola. 
      Dados atuais:
      - Faturamento Total: ${formatCurrency(stats.totalRevenue)}
      - Lucro Líquido: ${formatCurrency(stats.totalProfit)}
      - Ticket Médio: ${formatCurrency(stats.avgTicket)}
      - Clientes Registrados: ${stats.totalCustomers}
      - Produtos sem Stock: ${stats.outOfStockCount}
      - Top Produtos: ${stats.topProducts.map(p => p.name).join(', ')}
      
      Dê uma orientação estratégica curta (2 frases) personalizada para este negócio. Seja profissional e direto. Use um tom encorajador.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      setInsight(response.text || "Mantenha o foco na gestão de stock.");
    } catch (err) {
      setInsight("Analise seus custos fixos para melhorar a margem de lucro este mês.");
    } finally {
      setIsGeneratingInsight(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight truncate max-w-lg">{shopConfig.name}</h1>
          <p className="text-gray-500 font-medium">Bom trabalho! Aqui estão os seus números consolidados.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setActiveView('sales')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            <DollarSign size={20} /> Vender Agora
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Faturado Hoje', value: formatCurrency(stats.todaySales), icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Lucro Líquido', value: formatCurrency(stats.totalProfit), icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Ticket Médio', value: formatCurrency(stats.avgTicket), icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Clientes', value: stats.totalCustomers, icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-transform hover:scale-[1.02]">
            <div className={`w-10 h-10 ${item.bg} ${item.color} rounded-xl flex items-center justify-center mb-4`}>
              <item.icon size={20} />
            </div>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">{item.label}</p>
            <p className="text-xl font-black text-gray-900 truncate">{item.value}</p>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <h3 className="font-black text-gray-800 text-sm uppercase tracking-widest mb-8">Performance Semanal</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => [formatCurrency(value), 'Faturado']}
                />
                <Area type="monotone" dataKey="vendas" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorVendas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <section className="bg-slate-900 p-8 rounded-[32px] text-white relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="text-blue-400 group-hover:animate-pulse" size={20} />
                <h3 className="font-black text-[10px] uppercase tracking-[0.2em]">Consultoria IA</h3>
              </div>
              
              {!isOnline ? (
                <div className="flex flex-col items-center justify-center py-4 text-center space-y-3">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-amber-400">
                    <WifiOff size={24} />
                  </div>
                  <p className="text-slate-400 text-xs font-bold leading-relaxed px-4">
                    A Consultoria IA requer internet para analisar os seus dados. Conecte-se para receber novos insights.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-slate-300 text-sm leading-relaxed min-h-[80px]">
                    {insight || "Os seus dados financeiros estão prontos para análise. Clique para uma orientação estratégica."}
                  </p>
                  {!insight && !isGeneratingInsight && (
                    <button 
                      onClick={generateAIInsight}
                      className="mt-6 w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                    >
                      Analisar Negócio
                    </button>
                  )}
                  {isGeneratingInsight && (
                    <div className="mt-6 flex items-center justify-center gap-3 text-sm text-slate-400 font-bold italic">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent"></div>
                      Processando...
                    </div>
                  )}
                  {insight && (
                    <button 
                      onClick={() => setInsight(null)}
                      className="mt-6 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
                    >
                      Nova Análise
                    </button>
                  )}
                </>
              )}
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 opacity-5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          </section>

          <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
            <h3 className="font-black text-[10px] uppercase tracking-widest text-gray-400 mb-6">Mais Vendidos</h3>
            <div className="space-y-6">
              {stats.topProducts.length === 0 ? (
                <p className="text-gray-400 text-xs italic">Aguardando as primeiras vendas.</p>
              ) : (
                stats.topProducts.map((p, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 font-black text-xs">
                      #{i + 1}
                    </div>
                    <div className="flex-1 truncate">
                      <p className="font-black text-gray-800 text-sm truncate">{p.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{p.count} unid. vendidas</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button 
              onClick={() => setActiveView('sales')}
              className="mt-8 w-full text-blue-600 text-[10px] font-black uppercase tracking-widest hover:underline flex items-center justify-center gap-2"
            >
              Ver Todas as Vendas <ArrowRight size={12} />
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
