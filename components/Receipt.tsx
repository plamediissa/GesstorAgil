
import React, { useRef } from 'react';
import { ArrowLeft, Printer, MessageCircle, Image as ImageIcon, CheckCircle, MapPin, Phone, FileText, XCircle, AlertCircle } from 'lucide-react';
import { Sale, Customer, ShopConfig } from '../types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

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
    const statusText = sale.status === 'refunded' ? '⚠️ *ESTA VENDA FOI REEMBOLSADA*' : '✅ Venda Concluída';
    const text = `🎉 *${shopConfig.name} - Comprovativo*\n\n${statusText}\n\n🎫 Referência: #${sale.id}\n📅 Data: ${new Date(sale.date).toLocaleDateString('pt-AO')}\n👤 Cliente: ${customer?.name || 'Consumidor'}\n💰 Total: *${formatCurrency(sale.total)}*\n💳 Pagamento: ${sale.paymentMethod}\n${sale.status === 'refunded' ? `🕒 Reembolsado em: ${new Date(sale.refundedAt!).toLocaleString('pt-AO')}\n📝 Motivo: ${sale.refundReason}\n` : ''}\nObrigado pela preferência! Volte sempre.`;
    const phone = customer?.phone?.replace(/\D/g, '') || '';
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const downloadImage = async () => {
    if (!receiptRef.current) return;
    const canvas = await html2canvas(receiptRef.current, { 
      scale: 3, 
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false
    });
    const link = document.createElement('a');
    link.download = `recibo-${sale.id}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const downloadPDF = async () => {
    if (!receiptRef.current) return;
    const canvas = await html2canvas(receiptRef.current, { 
      scale: 3, 
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false
    });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width / 3, canvas.height / 3]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 3, canvas.height / 3);
    pdf.save(`recibo-${sale.id}.pdf`);
  };

  return (
    <div className="space-y-8 animate-in zoom-in-95 duration-300 max-w-2xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 no-print">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 font-bold hover:text-gray-900 transition-colors">
          <ArrowLeft size={20} /> Voltar
        </button>
        <div className="flex flex-wrap gap-2">
          <button onClick={downloadImage} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-bold text-xs hover:bg-gray-200"><ImageIcon size={14} className="inline mr-1" /> Imagem</button>
          <button onClick={downloadPDF} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-bold text-xs hover:bg-gray-200"><FileText size={14} className="inline mr-1" /> PDF</button>
          <button onClick={handleWhatsAppShare} className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-emerald-600 shadow-lg shadow-emerald-100"><MessageCircle size={14} className="inline mr-1" /> WhatsApp</button>
          <button onClick={handlePrint} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-blue-700 shadow-lg shadow-blue-100"><Printer size={14} className="inline mr-1" /> Imprimir</button>
        </div>
      </div>

      <div className="flex justify-center no-print pb-20">
        <div 
          ref={receiptRef}
          className="bg-white w-full max-w-[380px] p-8 shadow-2xl rounded-[40px] border border-gray-50 flex flex-col relative overflow-hidden"
          style={{ minHeight: '600px' }}
        >
          {/* Refund Watermark */}
          {sale.status === 'refunded' && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center rotate-[-35deg] opacity-10">
              <span className="text-6xl font-black text-red-600 border-8 border-red-600 p-4 rounded-3xl">REEMBOLSADO</span>
            </div>
          )}

          {/* Header */}
          <div className="text-center space-y-3 mb-8">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white mx-auto shadow-inner mb-2 ${sale.status === 'refunded' ? 'bg-red-500' : 'bg-blue-600'}`}>
              {sale.status === 'refunded' ? <XCircle size={32} strokeWidth={3} /> : <CheckCircle size={32} strokeWidth={3} />}
            </div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900 uppercase">{shopConfig.name}</h1>
            <div className="space-y-1">
               {shopConfig.address && <p className="text-[10px] text-gray-400 font-medium flex items-center justify-center gap-1"><MapPin size={10}/> {shopConfig.address}</p>}
               {shopConfig.phone && <p className="text-[10px] text-gray-400 font-medium flex items-center justify-center gap-1"><Phone size={10}/> {shopConfig.phone}</p>}
               {shopConfig.nif && <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">NIF: {shopConfig.nif}</p>}
            </div>
            <div className={`${sale.status === 'refunded' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'} inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mt-2`}>
               {sale.status === 'refunded' ? 'Comprovativo de Reembolso' : 'Comprovativo de Venda'}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3 mb-6 text-xs font-medium text-gray-600 border-t border-b border-gray-50 py-4">
            <div className="flex justify-between">
              <span className="text-gray-400 uppercase tracking-tighter">Referência</span>
              <span className="font-black text-gray-900">#{sale.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 uppercase tracking-tighter">Data Original</span>
              <span className="text-gray-900">{new Date(sale.date).toLocaleString('pt-AO')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 uppercase tracking-tighter">Pagamento</span>
              <span className="text-gray-900 font-bold">{sale.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 uppercase tracking-tighter">Cliente</span>
              <span className={`font-black ${sale.status === 'refunded' ? 'text-red-500' : 'text-blue-600'}`}>{customer?.name || 'Consumidor Final'}</span>
            </div>
          </div>

          {/* Refund Specific Details */}
          {sale.status === 'refunded' && (
            <div className="mb-6 p-4 bg-red-50 rounded-3xl border border-red-100 animate-in slide-in-from-top-2">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={14} className="text-red-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-red-600">Detalhes do Reembolso</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px]">
                  <span className="text-red-400 font-bold uppercase">Data</span>
                  <span className="text-red-700 font-black">{new Date(sale.refundedAt!).toLocaleString('pt-AO')}</span>
                </div>
                {sale.refundReason && (
                  <div className="pt-2 border-t border-red-100">
                    <span className="text-[9px] text-red-400 font-black uppercase block mb-1">Motivo</span>
                    <p className="text-xs text-red-800 font-medium italic leading-relaxed">"{sale.refundReason}"</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Items */}
          <div className="flex-1 space-y-4 mb-8">
            {sale.items.map((item, idx) => (
              <div key={idx} className={`flex justify-between items-start gap-4 ${sale.status === 'refunded' ? 'opacity-50' : ''}`}>
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
          <div className={`p-6 rounded-[32px] border-2 border-dashed mt-auto ${sale.status === 'refunded' ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'}`}>
            <div className="flex justify-between items-center">
              <span className={`text-xs font-bold uppercase tracking-widest ${sale.status === 'refunded' ? 'text-red-400' : 'text-blue-400'}`}>
                {sale.status === 'refunded' ? 'Total Reembolsado' : 'Total Pago'}
              </span>
              <span className={`text-2xl font-black ${sale.status === 'refunded' ? 'text-red-600' : 'text-blue-600'}`}>
                {formatCurrency(sale.total)}
              </span>
            </div>
          </div>

          <div className="mt-8 text-center pt-6 opacity-40">
            <p className="text-[9px] font-black uppercase tracking-[0.2em]">{sale.status === 'refunded' ? 'Transação Anulada' : 'Obrigado pela Preferência'}</p>
          </div>
          
          <div className="absolute -bottom-4 left-0 right-0 flex justify-between px-4">
             {Array.from({length: 12}).map((_, i) => (
               <div key={i} className={`w-4 h-4 rounded-full ${sale.status === 'refunded' ? 'bg-red-50' : 'bg-gray-50'}`}></div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
