
import React, { useState } from 'react';
import { Users, Plus, Search, MessageCircle, Phone, Award, Calendar, Pencil, X, Save, Trash2 } from 'lucide-react';
import { Customer, Sale, ShopConfig } from '../types';

interface CRMProps {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  sales: Sale[];
  shopConfig: ShopConfig;
}

const CRM: React.FC<CRMProps> = ({ customers, setCustomers, sales, shopConfig }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ name: '', phone: '' });

  const formatCurrency = (value: number) => {
    const formatted = new Intl.NumberFormat('pt-AO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
    return `${formatted} ${shopConfig.currency || 'Kz'}`;
  };

  const filtered = customers
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSubmit = () => {
    if (!formData.name) return;

    if (editingCustomer) {
      setCustomers(customers.map(c => c.id === editingCustomer.id ? {
        ...c,
        name: formData.name,
        phone: formData.phone
      } : c));
      setEditingCustomer(null);
    } else {
      const cust: Customer = {
        id: Math.random().toString(36).substr(2, 6).toUpperCase(),
        name: formData.name,
        phone: formData.phone,
        totalSpent: 0
      };
      setCustomers([cust, ...customers]);
    }

    setIsAdding(false);
    setFormData({ name: '', phone: '' });
  };

  const startEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({ name: customer.name, phone: customer.phone });
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const removeCustomer = (id: string) => {
    if (confirm('Deseja excluir este cliente? O histórico de compras não será afetado nas estatísticas de vendas.')) {
      setCustomers(customers.filter(c => c.id !== id));
    }
  };

  const openWhatsApp = (phone: string) => {
    const formatted = phone.replace(/\D/g, '');
    if (!formatted) {
      alert("Este cliente não tem um contacto válido.");
      return;
    }
    window.open(`https://wa.me/${formatted}`, '_blank');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Fidelização</h1>
          <p className="text-gray-500 font-medium">Mantenha o histórico e contacto dos seus clientes fiéis.</p>
        </div>
        <button 
          onClick={() => {
            if (isAdding) {
              setIsAdding(false);
              setEditingCustomer(null);
              setFormData({ name: '', phone: '' });
            } else {
              setIsAdding(true);
            }
          }}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
            isAdding ? 'bg-gray-100 text-gray-600' : 'bg-blue-600 text-white shadow-xl shadow-blue-100'
          }`}
        >
          {isAdding ? <><X size={20} /> Cancelar</> : <><Plus size={20} /> Novo Cliente</>}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-xl space-y-6 animate-in slide-in-from-top-4">
          <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
            {editingCustomer ? <Pencil size={20} className="text-blue-600"/> : <Plus size={20} className="text-blue-600"/>}
            {editingCustomer ? 'Editar Cliente' : 'Novo Cadastro'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Nome Completo</label>
              <input 
                className="w-full p-4 bg-gray-50 border-none ring-1 ring-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ex: João Manuel"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">WhatsApp</label>
              <input 
                className="w-full p-4 bg-gray-50 border-none ring-1 ring-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ex: 244920000000"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>
          <button 
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl transition-all hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {editingCustomer ? 'Guardar Alterações' : 'Cadastrar Cliente'}
          </button>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text"
          placeholder="Buscar cliente por nome..."
          className="w-full pl-12 pr-4 py-4 rounded-2xl border-none ring-1 ring-gray-100 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((customer, index) => (
          <div key={customer.id} className="bg-white p-6 rounded-[32px] border border-gray-50 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 flex gap-2">
               {index === 0 && customer.totalSpent > 0 && <Award className="text-yellow-500 animate-bounce" size={24} />}
               <button 
                  onClick={() => startEdit(customer)} 
                  className="p-2 text-gray-300 hover:text-blue-500 transition-colors bg-gray-50 rounded-lg opacity-0 group-hover:opacity-100"
               >
                 <Pencil size={14} />
               </button>
               <button 
                  onClick={() => removeCustomer(customer.id)} 
                  className="p-2 text-gray-300 hover:text-red-500 transition-colors bg-gray-50 rounded-lg opacity-0 group-hover:opacity-100"
               >
                 <Trash2 size={14} />
               </button>
            </div>

            <div className="flex flex-col h-full justify-between">
              <div className="mb-6">
                <h3 className="font-black text-xl text-gray-800 mb-1 truncate pr-16">{customer.name}</h3>
                <div className="flex items-center gap-2 text-gray-400 text-xs font-bold">
                  <Phone size={12} /> {customer.phone || 'Sem contacto'}
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-2xl flex justify-between items-center">
                  <div className="truncate flex-1">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Gasto Total</p>
                    <p className="text-lg font-black text-blue-600 truncate">{formatCurrency(customer.totalSpent)}</p>
                  </div>
                  {customer.phone && (
                    <button 
                      onClick={() => openWhatsApp(customer.phone)}
                      className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-600 shadow-lg shadow-emerald-100 transition-all active:scale-90"
                      title="Enviar WhatsApp"
                    >
                      <MessageCircle size={20} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold px-2">
                  <Calendar size={12} />
                  Última visita: {customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString('pt-AO') : 'Pendente'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-20 text-center bg-white rounded-[32px] border border-dashed border-gray-200">
           <Users size={48} className="mx-auto text-gray-200 mb-4" />
           <p className="text-gray-500">Nenhum cliente registado.</p>
        </div>
      )}
    </div>
  );
};

export default CRM;
