
import React, { useState, useMemo } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Plus, Calendar, Trash2, PieChart } from 'lucide-react';
import { Sale, Expense, ShopConfig } from '../types';

interface FinancesProps {
  sales: Sale[];
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  shopConfig: ShopConfig;
}

const Finances: React.FC<FinancesProps> = ({ sales, expenses, setExpenses, shopConfig }) => {
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({ description: '', amount: 0, category: 'Outros' });

  const categories = ['Aluguer', 'Stock', 'Marketing', 'Energia/Água', 'Salários', 'Transporte', 'Outros'];

  const formatCurrency = (value: number) => {
    const formatted = new Intl.NumberFormat('pt-AO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
    return `${formatted} ${shopConfig.currency || 'Kz'}`;
  };

  const summary = useMemo(() => {
    // Only count non-refunded sales for income
    const activeSales = sales.filter(s => s.status !== 'refunded');
    const totalIncome = activeSales.reduce((acc, s) => acc + s.total, 0);
    const totalOut = expenses.reduce((acc, e) => acc + e.amount, 0);
    return {
      totalIncome,
      totalOut,
      net: totalIncome - totalOut
    };
  }, [sales, expenses]);

  const handleAddExpense = () => {
    if (!newExpense.description || !newExpense.amount) return;
    const exp: Expense = {
      id: Math.random().toString(36).substr(2, 6).toUpperCase(),
      date: new Date().toISOString(),
      description: newExpense.description,
      amount: Number(newExpense.amount),
      category: newExpense.category
    };
    setExpenses([exp, ...expenses]);
    setIsAddingExpense(false);
    setNewExpense({ description: '', amount: 0, category: 'Outros' });
  };

  const removeExpense = (id: string) => {
    if (confirm('Excluir esta despesa?')) {
      setExpenses(expenses.filter(e => e.id !== id));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Finanças</h1>
          <p className="text-gray-500 font-medium">Controle sua saúde financeira.</p>
        </div>
        <button 
          onClick={() => setIsAddingExpense(!isAddingExpense)}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
            isAddingExpense ? 'bg-gray-100 text-gray-600' : 'bg-red-500 text-white shadow-xl shadow-red-100'
          }`}
        >
          {isAddingExpense ? 'Cancelar' : <><Plus size={20} /> Registrar Despesa</>}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-gray-50 shadow-sm">
          <div className="flex items-center gap-3 text-emerald-600 mb-4 bg-emerald-50 w-fit px-3 py-1 rounded-full">
            <ArrowUpCircle size={16} />
            <span className="font-black text-[10px] uppercase tracking-widest">Entradas</span>
          </div>
          <p className="text-2xl font-black text-gray-900 tracking-tighter truncate">{formatCurrency(summary.totalIncome)}</p>
          <p className="text-xs text-gray-400 mt-2">Vendas Ativas</p>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-gray-50 shadow-sm">
          <div className="flex items-center gap-3 text-red-600 mb-4 bg-red-50 w-fit px-3 py-1 rounded-full">
            <ArrowDownCircle size={16} />
            <span className="font-black text-[10px] uppercase tracking-widest">Saídas</span>
          </div>
          <p className="text-2xl font-black text-gray-900 tracking-tighter truncate">{formatCurrency(summary.totalOut)}</p>
          <p className="text-xs text-gray-400 mt-2">Despesas Operacionais</p>
        </div>

        <div className={`p-8 rounded-[32px] shadow-xl text-white ${summary.net >= 0 ? 'bg-blue-600 shadow-blue-200' : 'bg-red-600 shadow-red-200'}`}>
          <div className="flex items-center gap-3 mb-4 bg-white/20 w-fit px-3 py-1 rounded-full">
            <PieChart size={16} />
            <span className="font-black text-[10px] uppercase tracking-widest">Saldo Real</span>
          </div>
          <p className="text-2xl font-black tracking-tighter truncate">{formatCurrency(summary.net)}</p>
          <p className="text-xs opacity-60 mt-2">Disponível em Caixa</p>
        </div>
      </div>

      {isAddingExpense && (
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-xl flex flex-col md:flex-row gap-4 animate-in slide-in-from-top-4">
          <input 
            className="flex-1 p-4 bg-gray-50 border-none ring-1 ring-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Descrição da despesa..."
            value={newExpense.description}
            onChange={e => setNewExpense({...newExpense, description: e.target.value})}
          />
          <select 
            className="w-full md:w-48 p-4 bg-gray-50 border-none ring-1 ring-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
            value={newExpense.category}
            onChange={e => setNewExpense({...newExpense, category: e.target.value})}
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input 
            type="number"
            className="w-full md:w-32 p-4 bg-gray-50 border-none ring-1 ring-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Valor"
            value={newExpense.amount || ''}
            onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value)})}
          />
          <button 
            onClick={handleAddExpense}
            className="bg-slate-900 text-white font-black px-8 py-4 rounded-2xl hover:bg-black transition-all"
          >
            Registrar
          </button>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight ml-2">Histórico de Despesas</h2>
        {expenses.length === 0 ? (
          <div className="py-20 text-center text-gray-400 bg-white rounded-[32px] border border-dashed">
            Nenhuma despesa registrada. Ótimo trabalho!
          </div>
        ) : (
          expenses.map(exp => (
            <div key={exp.id} className="bg-white p-5 rounded-[24px] border border-gray-50 shadow-sm flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
                  <ArrowDownCircle size={20} />
                </div>
                <div>
                  <p className="font-black text-gray-800">{exp.description}</p>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <span>{exp.category}</span>
                    <span>•</span>
                    <span>{new Date(exp.date).toLocaleDateString('pt-AO')}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className="font-black text-red-600 text-lg">{formatCurrency(exp.amount)}</span>
                <button onClick={() => removeExpense(exp.id)} className="text-gray-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Finances;
