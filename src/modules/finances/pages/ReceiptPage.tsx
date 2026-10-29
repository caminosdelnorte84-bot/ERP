import { useState } from 'react';
import { Receipt } from '../../receipt/Receipt';
import { useTenantStore } from '../../../store/useTenantStore';

export function ReceiptPage() {
  const companyId = useTenantStore((s) => s.activeCompanyId) || '';
  const [items, setItems] = useState([{ name: 'Taza', qty: 1, price: 3000, unitPrice: 3000 }]);
  const [customer, setCustomer] = useState<{ name: string; id?: string } | undefined>(undefined);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemPrice, setNewItemPrice] = useState(0);
  const [date] = useState(new Date().toLocaleDateString('es-AR') + ' ' + new Date().toLocaleTimeString('es-AR'));

  const total = items.reduce((sum, i) => sum + i.price, 0);

  const addItem = () => {
    if (!newItemName.trim() || newItemPrice <= 0) return;
    setItems(prev => [...prev, { name: newItemName, qty: newItemQty, price: newItemPrice, unitPrice: Math.round(newItemPrice / newItemQty) }]);
    setNewItemName(''); setNewItemQty(1); setNewItemPrice(0);
  };

  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-black mb-4">Nuevo recibo</h1>
      <div className="mb-4 grid gap-2">
        <input value={customer?.name || ''} placeholder="Cliente" className="border p-2 rounded" onChange={e => setCustomer({ name: e.target.value })} />
        <div className="flex gap-2">
          <input value={newItemName} placeholder="Item" className="border p-2 rounded flex-1" onChange={e => setNewItemName(e.target.value)} />
          <input value={newItemQty} type="number" placeholder="Qty" className="border p-2 rounded w-16" onChange={e => setNewItemQty(Number(e.target.value))} />
          <input value={newItemPrice} type="number" placeholder="Total $" className="border p-2 rounded w-24" onChange={e => setNewItemPrice(Number(e.target.value))} />
          <button onClick={addItem} className="px-3 py-2 bg-indigo-600 text-white rounded font-bold">+ Agregar</button>
        </div>
      </div>

      <div className="mb-4">
        {items.map((i, idx) => (
          <div key={idx} className="flex justify-between items-center bg-slate-50 rounded px-3 py-2 mb-1 text-sm">
            <span>{i.name} × {i.qty}</span>
            <span className="font-mono">${i.price}</span>
            <button onClick={() => removeItem(idx)} className="text-red-500 font-bold">×</button>
          </div>
        ))}
      </div>

      <Receipt
        receiptRef={undefined}
        companyId={companyId}
        items={items}
        customer={customer}
        total={total}
        date={date}
      />
    </div>
  );
}
