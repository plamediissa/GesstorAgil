
import React, { useRef } from 'react';
import { Store, Phone, MapPin, Hash, DollarSign, Save, Download, Upload, ShieldAlert, Trash2 } from 'lucide-react';
import { ShopConfig } from '../types';

interface SettingsProps {
  shopConfig: ShopConfig;
  setShopConfig: React.Dispatch<React.SetStateAction<ShopConfig>>;
}

const Settings: React.FC<SettingsProps> = ({ shopConfig, setShopConfig }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShopConfig(prev => ({ ...prev, [name]: value }));
  };

  const exportData = () => {
    const data = {
      products: JSON.parse(localStorage.getItem('ga_products') || '[]'),
      customers: JSON.parse(localStorage.getItem('ga_customers') || '[]'),
      sales: JSON.parse(localStorage.getItem('ga_sales') || '[]'),
      expenses: JSON.parse(localStorage.getItem('ga_expenses') || '[]'),
      config: shopConfig
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-gestor-agil-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('Esta ação substituirá todos os seus dados atuais. Deseja continuar?')) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.products) localStorage.setItem('ga_products', JSON.stringify(data.products));
        if (data.customers) localStorage.setItem('ga_customers', JSON.stringify(data.customers));
        if (data.sales) localStorage.setItem('ga_sales', JSON.stringify(data.sales));
        if (data.expenses) localStorage.setItem('ga_expenses', JSON.stringify(data.expenses));
        if (data.config) {
            setShopConfig(data.config);
            localStorage.setItem('ga_shop_config', JSON.stringify(data.config));
        }
        alert('Dados restaurados com sucesso! A página será reiniciada.');
        window.location.reload();
      } catch (err) {
        alert('Erro ao importar arquivo. Certifique-se de que é um JSON válido do Gestor Ágil.');
      }
    };
    reader.readAsText(file);
  };

  const clearData = () => {
    if (confirm('ATENÇÃO: Isso apagará TODOS os dados do sistema permanentemente. Esta ação não pode ser desfeita. Tem certeza?')) {
        localStorage.clear();
        window.location.reload();
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 max-w-2xl mx-auto pb-20">
      <header>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Configurações</h1>
        <p className="text-gray-500 font-medium">Personalize a identidade do seu negócio e gira os seus dados.</p>
      </header>

      <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-xl space-y-6">
        <h3 className="font-black text-gray-800 uppercase text-xs tracking-widest flex items-center gap-2">
           <Store size={14} className="text-blue-600"/> Identidade da Empresa
        </h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1 flex items-center gap-2">
              Nome da Loja
            </label>
            <input 
              name="name"
              className="w-full p-4 bg-gray-50 border-none ring-1 ring-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-800"
              placeholder="Ex: Pastelaria Central"
              value={shopConfig.name}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Contacto Principal</label>
              <input 
                name="phone"
                className="w-full p-4 bg-gray-50 border-none ring-1 ring-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Ex: +244 923 000 000"
                value={shopConfig.phone}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">NIF</label>
              <input 
                name="nif"
                className="w-full p-4 bg-gray-50 border-none ring-1 ring-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="NIF da empresa"
                value={shopConfig.nif}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Endereço Físico</label>
            <input 
              name="address"
              className="w-full p-4 bg-gray-50 border-none ring-1 ring-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Ex: Rua Direita da Samba, Luanda"
              value={shopConfig.address}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Moeda (Sigla)</label>
            <input 
              name="currency"
              className="w-full p-4 bg-gray-50 border-none ring-1 ring-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Ex: Kz ou AOA"
              value={shopConfig.currency}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="pt-4">
          <button 
            onClick={() => alert('Configurações salvas automaticamente!')}
            className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Save size={20} /> Guardar Alterações
          </button>
        </div>
      </section>

      <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-xl space-y-6">
        <h3 className="font-black text-gray-800 uppercase text-xs tracking-widest flex items-center gap-2">
           <ShieldAlert size={14} className="text-orange-500"/> Segurança e Dados
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={exportData}
            className="flex items-center justify-center gap-3 p-6 rounded-3xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all border border-emerald-100"
          >
            <div className="bg-emerald-500 text-white p-2 rounded-xl">
              <Download size={20} />
            </div>
            <div className="text-left">
              <p className="font-black text-sm">Exportar Backup</p>
              <p className="text-[10px] uppercase font-bold opacity-60">Baixar dados .json</p>
            </div>
          </button>

          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-3 p-6 rounded-3xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all border border-blue-100"
          >
            <div className="bg-blue-500 text-white p-2 rounded-xl">
              <Upload size={20} />
            </div>
            <div className="text-left">
              <p className="font-black text-sm">Restaurar Dados</p>
              <p className="text-[10px] uppercase font-bold opacity-60">Upload de backup</p>
            </div>
          </button>
          <input type="file" ref={fileInputRef} onChange={importData} accept=".json" className="hidden" />
        </div>

        <div className="pt-4 border-t border-gray-100">
           <button 
             onClick={clearData}
             className="w-full flex items-center justify-center gap-2 p-4 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-all"
           >
             <Trash2 size={18} /> Resetar Todo o Sistema
           </button>
        </div>
      </section>

      <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
        <p className="text-blue-800 text-sm font-medium leading-relaxed">
          <strong>Privacidade Total:</strong> O Gestor Ágil funciona 100% offline. Todos os seus dados são guardados apenas no seu navegador. Recomendamos fazer um backup semanal para evitar perdas se limpar o histórico do browser.
        </p>
      </div>
    </div>
  );
};

export default Settings;
