
import React, { useState } from 'react';
import { Package, Plus, Trash2, Search, Tag, Filter, CheckCircle2, XCircle, Briefcase, Pencil, Save, X } from 'lucide-react';
import { Product, ShopConfig } from '../types';

interface InventoryProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  shopConfig: ShopConfig;
}

const Inventory: React.FC<InventoryProps> = ({ products, setProducts, shopConfig }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    price: 0,
    cost: 0,
    stock: 0,
    manageStock: false,
    category: 'Geral'
  });

  const categories = ['Todas', 'Alimentos', 'Bebidas', 'Roupas', 'Serviços', 'Eletrônicos', 'Geral'];

  const formatCurrency = (value: number) => {
    const formatted = new Intl.NumberFormat('pt-AO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
    return `${formatted} ${shopConfig.currency || 'Kz'}`;
  };

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === 'Todas' || p.category === selectedCategory)
  );

  const handleSubmit = () => {
    if (!formData.name || !formData.price) {
      alert("Por favor, preencha o nome e o preço.");
      return;
    }

    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? {
        ...p,
        name: formData.name!,
        price: Number(formData.price),
        cost: Number(formData.cost),
        stock: formData.manageStock ? Number(formData.stock) : 0,
        manageStock: formData.manageStock ?? false,
        category: formData.category || 'Geral'
      } : p));
      setEditingProduct(null);
    } else {
      const prod: Product = {
        id: Math.random().toString(36).substr(2, 6).toUpperCase(),
        name: formData.name!,
        price: Number(formData.price),
        cost: Number(formData.cost),
        stock: formData.manageStock ? Number(formData.stock) : 0,
        manageStock: formData.manageStock ?? false,
        category: formData.category || 'Geral'
      };
      setProducts([...products, prod]);
    }

    setIsAdding(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', price: 0, cost: 0, stock: 0, manageStock: false, category: 'Geral' });
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const removeProduct = (id: string) => {
    if (confirm('Deseja excluir este item permanentemente?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Catálogo de Itens</h1>
          <p className="text-gray-500 font-medium">Cadastre e gira os seus serviços ou produtos.</p>
        </div>
        <button 
          onClick={() => {
            if (isAdding) {
              setIsAdding(false);
              setEditingProduct(null);
              resetForm();
            } else {
              setIsAdding(true);
            }
          }}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
            isAdding ? 'bg-gray-100 text-gray-600' : 'bg-blue-600 text-white shadow-xl shadow-blue-100'
          }`}
        >
          {isAdding ? <><X size={20} /> Cancelar</> : <><Plus size={20} /> Novo Item</>}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-xl space-y-6 animate-in slide-in-from-top-4">
          <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
            {editingProduct ? <Pencil size={20} className="text-blue-600"/> : <Plus size={20} className="text-blue-600"/>}
            {editingProduct ? 'Editar Item' : 'Novo Cadastro'}
          </h2>
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Nome do Item</label>
                  <input 
                    className="w-full p-4 bg-gray-50 border-none ring-1 ring-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Ex: Lavagem Completa ou Arroz Doce"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Categoria</label>
                  <select 
                    className="w-full p-4 bg-gray-50 border-none ring-1 ring-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    {categories.filter(c => c !== 'Todas').map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Preço de Venda ( {shopConfig.currency} )</label>
                  <input 
                    type="number"
                    className="w-full p-4 bg-gray-50 border-none ring-1 ring-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-black text-blue-600"
                    placeholder="0.00"
                    value={formData.price || ''}
                    onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                  />
                </div>
                
                <div className="flex flex-col justify-end pb-2">
                  <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 rounded-2xl ring-1 ring-gray-100 hover:bg-gray-100 transition-colors">
                    <input 
                      type="checkbox"
                      checked={formData.manageStock}
                      onChange={e => setFormData({...formData, manageStock: e.target.checked})}
                      className="w-5 h-5 rounded-lg border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-bold text-gray-700 block">Gerir Stock</span>
                      <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest">
                        {formData.manageStock ? 'Item Físico' : 'Serviço / Ilimitado'}
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {formData.manageStock && (
                <div className="space-y-2 animate-in slide-in-from-left-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Quantidade em Stock</label>
                  <input 
                    type="number"
                    className="w-full p-4 bg-gray-50 border-none ring-1 ring-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="0"
                    value={formData.stock || ''}
                    onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
                  />
                </div>
              )}
            </div>
          </div>
          <button 
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {editingProduct ? 'Guardar Alterações' : 'Confirmar Cadastro'}
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text"
            placeholder="Procurar itens..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl border-none ring-1 ring-gray-100 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map(p => (
          <div key={p.id} className="bg-white p-6 rounded-[32px] border border-gray-50 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${p.manageStock ? 'text-blue-600 bg-blue-50' : 'text-purple-600 bg-purple-50'}`}>
                  {p.manageStock ? 'Produto' : 'Serviço'}
                </span>
                <div className="flex gap-1">
                  <button 
                    onClick={() => startEdit(p)} 
                    className="p-2 text-gray-300 hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100 bg-gray-50 rounded-lg"
                  >
                    <Pencil size={14} />
                  </button>
                  <button 
                    onClick={() => removeProduct(p.id)} 
                    className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 bg-gray-50 rounded-lg"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div>
                <h3 className="font-black text-gray-800 text-lg leading-tight mb-1 truncate">{p.name}</h3>
                <p className="text-xl font-black text-slate-900">{formatCurrency(p.price)}</p>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">{p.category}</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t pt-4">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${p.manageStock ? 'bg-blue-50 text-blue-500' : 'bg-purple-50 text-purple-500'}`}>
                   {p.manageStock ? <Package size={16} /> : <Briefcase size={16} />}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {p.manageStock ? 'Stock' : 'Disponibilidade'}
                  </span>
                  <span className={`text-sm font-black ${p.manageStock ? (p.stock < 10 ? 'text-red-600' : 'text-emerald-600') : 'text-purple-600'}`}>
                     {p.manageStock ? `${p.stock} unid.` : 'Ilimitado'}
                  </span>
                </div>
              </div>
            </div>
            
            {p.manageStock && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
                 <div 
                   className={`h-full transition-all duration-1000 ${p.stock <= 0 ? 'bg-red-500' : p.stock < 10 ? 'bg-orange-500' : 'bg-blue-500'}`} 
                   style={{ width: `${Math.min(100, (p.stock / 50) * 100)}%` }}
                 ></div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {filtered.length === 0 && (
        <div className="py-20 text-center bg-white rounded-[32px] border border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
            <Package size={32} />
          </div>
          <p className="text-gray-500 font-medium">Nenhum item encontrado.</p>
        </div>
      )}
    </div>
  );
};

export default Inventory;
