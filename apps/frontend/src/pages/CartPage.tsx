import { useMemo, useState } from 'react';
import { apiFetch } from '../services/api';
import { usePOSStore } from '../store/posStore';
import { enqueueSync } from '../services/syncEngine';
import { DraftOrderItem } from '../types';

const CART_KEY = 'pos-cart';

export function CartPage() {
  const { selectedTableId } = usePOSStore();
  const [items, setItems] = useState<DraftOrderItem[]>(() => {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  });
  const [notes, setNotes] = useState('');
  const subtotal = useMemo(() => items.reduce((acc, i) => acc + i.quantity * i.unitPrice, 0), [items]);

  async function placeOrder() {
    if (!selectedTableId || !items.length) return alert('Select table and add items.');

    const payload = {
      tableId: selectedTableId,
      notes,
      items: items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity, unitPrice: i.unitPrice, notes: i.notes, modifiers: [] }))
    };

    const order = await apiFetch<{ id: string }>('/orders', { method: 'POST', body: JSON.stringify(payload) });
    await enqueueSync('orders', 'create', { ...payload, orderId: order.id });

    setItems([]);
    localStorage.removeItem(CART_KEY);
    localStorage.setItem('last-order-id', order.id);
    alert(`Order placed: ${order.id}`);
  }

  return (
    <div className="p-4 space-y-3">
      <h2 className="text-xl font-bold">Cart</h2>
      {items.map((item) => (
        <div key={item.menuItemId} className="bg-white border rounded p-2 flex justify-between">
          <span>{item.name} x {item.quantity}</span>
          <span>${(item.quantity * item.unitPrice).toFixed(2)}</span>
        </div>
      ))}
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Order notes" className="w-full border rounded p-2" />
      <div className="font-semibold">Subtotal: ${subtotal.toFixed(2)}</div>
      <button onClick={placeOrder} className="bg-emerald-600 text-white rounded px-4 py-2">Submit Order</button>
    </div>
  );
}
