import { useMemo, useState } from 'react';
import { usePOSStore } from '../store/posStore';
import { DraftOrderItem } from '../types';
import { db } from '../lib/db';

const demoMenu = [
  { id: 'demo-soup', name: 'Tomato Soup', price: 6.5 },
  { id: 'demo-brus', name: 'Bruschetta', price: 7 },
  { id: 'demo-steak', name: 'Grilled Steak', price: 19 }
];

const CART_KEY = 'pos-cart';

export function TableOrderPage() {
  const { tables, selectedTableId } = usePOSStore();
  const [items, setItems] = useState<DraftOrderItem[]>(() => {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  });
  const [notes, setNotes] = useState('');

  const selectedTable = useMemo(() => tables.find((t) => t.id === selectedTableId), [tables, selectedTableId]);

  function addItem(menuItem: (typeof demoMenu)[number]) {
    setItems((prev) => {
      const existing = prev.find((p) => p.menuItemId === menuItem.id);
      const next = existing
        ? prev.map((p) => (p.menuItemId === menuItem.id ? { ...p, quantity: p.quantity + 1 } : p))
        : [...prev, { menuItemId: menuItem.id, name: menuItem.name, unitPrice: menuItem.price, quantity: 1 }];
      localStorage.setItem(CART_KEY, JSON.stringify(next));
      return next;
    });
  }

  async function saveDraft() {
    if (!selectedTableId || !items.length) return;
    await db.draftOrders.put({
      id: crypto.randomUUID(),
      tableId: selectedTableId,
      items: JSON.stringify({ items, notes }),
      updatedAt: new Date().toISOString()
    });
    alert('Draft order saved offline.');
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Table Order</h2>
      <p className="text-sm text-slate-600">Active table: {selectedTable?.name ?? 'Select a table from POS screen'}</p>

      <div className="grid md:grid-cols-3 gap-3">
        {demoMenu.map((item) => (
          <button key={item.id} onClick={() => addItem(item)} className="bg-white rounded border p-3 text-left">
            <div className="font-semibold">{item.name}</div>
            <div className="text-sm">${item.price.toFixed(2)}</div>
          </button>
        ))}
      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Kitchen notes"
        className="w-full border rounded p-2"
      />

      <button onClick={saveDraft} className="bg-amber-600 text-white rounded px-4 py-2">Hold / Save Draft</button>
    </div>
  );
}
