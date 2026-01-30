
import React, { useRef } from 'react';
import { ArrowLeft, Printer, MessageCircle, Image as ImageIcon, CheckCircle, MapPin, Phone } from 'lucide-react';
import { Sale, Customer, ShopConfig } from '../types';
import html2canvas from 'html2canvas';

interface ReceiptProps {
  sale: Sale;
  customer?: Customer;
  onBack: () => void;
  shopConfig: ShopConfig;
}

const Receipt: React.FC<ReceiptProps> = ({ sale, customer, onBack, shopConfig }) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (value: number) => {
    const formatted = new Intl.NumberFormat('pt-AO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
    return `${formatted} ${shopConfig.currency || 'Kz'}`;
  };

  const handlePrint = () => window.print();

  const handleWhatsAppShare = () => {
    const text = `🎉 *${shopConfig.name} - Comprovativo*\n\n✅ Venda: #${sale.id}\n📅 Data: ${new Date(sale.date).toLocaleDateString('pt-AO')}\n👤 Cliente: ${customer?.name || 'Consumidor'}\n💰 Total: *${formatCurrency(sale.total)}*\n💳 Pagamento: ${sale.paymentMethod}\n\nObrigado pela preferência! Volte sempre.`;
    const phone = customer?.phone?.replace(/\D/g, '') || '';
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const downloadImage = async () => {
    if (!receiptRef.current) return;
    const canvas = await html2canvas(receiptRef.current, { scale: 3, backgroundColor: '#ffffff' });
    const link = document.createElement('a');
    link.download = `recibo-${sale.id}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="space-y-8 animate-in zoom-in-95 duration-300 max-w-2xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 no-print">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 font-bold hover:text-gray-900 transition-colors">
          <ArrowLeft size={20} /> Voltar
        </button>
        <div className="flex flex-wrap gap-2">
          <button onClick={downloadImage} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-bold text-xs hover:bg-gray-200"><ImageIcon size={14} className="inline mr-1" /> Imagem</button>
          <button onClick={handleWhatsAppShare} className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-emerald-600 shadow-lg shadow-emerald-100"><MessageCircle size={14} className="inline mr-1" /> WhatsApp</button>
          <button onClick={handlePrint} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-blue-700 shadow-lg shadow-blue-100"><Printer size={14} className="inline mr-1" /> Imprimir</button>
        </div>
      </div>

      <div className="flex justify-center no-print">
        <div 
          ref={receiptRef}
          className="bg-white w-full max-w-[380px] p-8 shadow-2xl rounded-[40px] border border-gray-50 flex flex-col relative overflow-hidden"
          style={{ minHeight: '550px' }}
        >
          {/* Header */}
          <div className="text-center space-y-3 mb-8">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-inner mb-2">
              <CheckCircle size={32} strokeWidth={3} />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900 uppercase">{shopConfig.name}</h1>
            <div className="space-y-1">
               {shopConfig.address && <p className="text-[10px] text-gray-400 font-medium flex items-center justify-center gap-1"><MapPin size={10}/> {shopConfig.address}</p>}
               {shopConfig.phone && <p className="text-[10px] text-gray-400 font-medium flex items-center justify-center gap-1"><Phone size={10}/> {shopConfig.phone}</p>}
               {shopConfig.nif && <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">NIF: {shopConfig.nif}</p>}
            </div>
            <div className="bg-gray-100 inline-block px-3 py-1 rounded-full text-[9px] font-black text-gray-500 uppercase tracking-widest mt-2">
               Comprovativo de Venda
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3 mb-8 text-xs font-medium text-gray-600 border-t border-b border-gray-50 py-4">
            <div className="flex justify-between">
              <span className="text-gray-400 uppercase tracking-tighter">Referência</span>
              <span className="font-black text-gray-900">#{sale.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 uppercase tracking-tighter">Data</span>
              <span className="text-gray-900">{new Date(sale.date).toLocaleString('pt-AO')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 uppercase tracking-tighter">Pagamento</span>
              <span className="text-gray-900 font-bold">{sale.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 uppercase tracking-tighter">Cliente</span>
              <span className="font-black text-blue-600">{customer?.name || 'Consumidor Final'}</span>
            </div>
          </div>

          {/* Items */}
          <div className="flex-1 space-y-4 mb-8">
            {sale.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <p className="font-bold text-gray-800 text-sm leading-tight">{item.name}</p>
                  <p className="text-[10px] text-gray-400">
                    {item.quantity} un x {formatCurrency(item.price)}
                  </p>
                </div>
                <span className="font-black text-gray-900 text-sm">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="bg-blue-50 p-6 rounded-[32px] border-2 border-dashed border-blue-100 mt-auto">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Total Pago</span>
              <span className="text-2xl font-black text-blue-600">
                {formatCurrency(sale.total)}
              </span>
            </div>
          </div>

          <div className="mt-8 text-center pt-6 opacity-40">
            <p className="text-[9px] font-black uppercase tracking-[0.2em]">Volte Sempre!</p>
          </div>
          
          <div className="absolute -bottom-4 left-0 right-0 flex justify-between px-4">
             {Array.from({length: 12}).map((_, i) => (
               <div key={i} className="w-4 h-4 bg-gray-50 rounded-full"></div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
