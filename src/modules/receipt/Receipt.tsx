import React, { useRef } from 'react';
import { numberToWordsSpanish } from './utils/receiptFormatters';

export interface ReceiptProps {
  receiptRef?: React.RefObject<HTMLDivElement | null>;
  companyId: string;
  receiptNo?: string;
  items: Array<{ name: string; qty: number; price: number; unitPrice: number; desc?: string }>;
  customer?: { name: string; id?: string };
  total: number;
  date: string;
  logoUrl?: string;
  paymentMethod?: string;
}

export function Receipt({ receiptRef, companyId, receiptNo, items, customer, total, date, logoUrl, paymentMethod = 'Efectivo' }: ReceiptProps) {
  const internalRef = useRef<HTMLDivElement>(null);
  const ref = receiptRef ?? internalRef;

  if (!companyId) return <div className="p-6 text-center text-amber-900 font-serif bg-[#f4e9cf]">Seleccione empresa</div>;

  const handlePrint = () => { if (ref.current) window.print(); };
  const handleShare = () => { window.open(`https://wa.me/?text=${encodeURIComponent('Compra Raíces — Total: $' + total + ' — ' + date)}`, '_blank'); };

  return (
    <div>
      <div className="flex gap-3 mb-4">
        <button onClick={handlePrint} className="px-3 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded shadow text-sm font-bold">PDF / Imprimir</button>
        <button onClick={handleShare} className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded shadow text-sm font-bold">WhatsApp</button>
      </div>
      <div ref={ref} className="bg-[#f4e9cf] text-amber-950 p-6 max-w-[320mm] mx-auto rounded-sm shadow-xl print:shadow-none print:max-w-none print:rounded-none font-serif leading-relaxed border-2 border-amber-300">
        <div className="flex items-start gap-4 mb-3 border-b-2 border-amber-900/20 pb-3">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="w-14 h-14 object-contain rounded-full border-2 border-amber-800 bg-amber-50 shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-full border-2 border-amber-800 flex items-center justify-center bg-amber-50 shrink-0 text-amber-900 font-black text-xl">R</div>
          )}
          <div className="flex-1">
            <h2 className="font-black text-2xl text-amber-900 tracking-tight">RAÍZ Creativa</h2>
            <p className="text-xs text-amber-700 font-medium">Recibo N.º {receiptNo || '001'} — {date}</p>
          </div>
        </div>
        <div className="mb-2 text-sm font-bold text-amber-900">Recibí de: <span className="underline underline-offset-4 decoration-amber-700">{customer?.name || '—'}</span></div>
        <div className="text-xs text-amber-800 mb-3">La suma de <strong>${total.toLocaleString('es-AR')} ({numberToWordsSpanish(Math.round(total))})</strong> en concepto de pago a cuenta.</div>
        <table className="w-full text-sm border-collapse border border-amber-800/30 mb-3">
          <thead>
            <tr className="bg-amber-900 text-amber-50">
              <th className="py-1 px-1 text-left">Detalle</th>
              <th className="py-1 px-1 text-right">Cantidad</th>
              <th className="py-1 px-1 text-right">N° artículo</th>
              <th className="py-1 px-1 text-right">Descripción</th>
              <th className="py-1 px-1 text-right">Precio unitario</th>
              <th className="py-1 px-1 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i, idx) => (
              <tr key={idx} className="border-b border-amber-200">
                <td className="py-1 px-1">{i.name}</td>
                <td className="py-1 px-1 text-right font-mono">{i.qty}</td>
                <td className="py-1 px-1 text-right font-mono">{String(idx+1).padStart(3,'0')}</td>
                <td className="py-1 px-1 text-xs text-amber-700">{i.desc || '—'}</td>
                <td className="py-1 px-1 text-right font-mono">${i.unitPrice.toLocaleString('es-AR')}</td>
                <td className="py-1 px-1 text-right font-mono font-bold">${i.price.toLocaleString('es-AR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t-2 border-amber-900 pt-2 text-sm space-y-1 text-amber-950">
          <div className="flex justify-between"><span>Subtotal</span><span className="font-mono">${total.toLocaleString('es-AR')}</span></div>
          <div className="flex justify-between font-black text-base"><span>TOTAL</span><span className="font-mono">${total.toLocaleString('es-AR')}</span></div>
          <div className="text-xs text-amber-700 mt-1">Pago recibido (a cuenta): <strong>${total.toLocaleString('es-AR')}</strong> · Método: <strong>{paymentMethod}</strong></div>
          <div className="text-xs text-amber-700">Saldo pendiente contra entrega del producto</div>
        </div>
        <div className="mt-4 text-center text-xs text-amber-800 leading-relaxed border-t border-amber-300 pt-3">
          <p className="font-serif italic text-amber-900 text-base mb-2">¡Gracias por confiar!</p>
          <p>Contacto — Raíces ERP · {companyId}</p>
          <div className="mt-2 border-t border-amber-300 pt-2 flex justify-between text-[10px] text-amber-700">
            <span>Firma: _____________________</span>
            <span>Aclaración: ____________ DNI: ____________</span>
          </div>
        </div>
      </div>
    </div>
  );
}
