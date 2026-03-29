import { FormEvent, useMemo, useState } from 'react';
import { apiFetch } from '../services/api';

export function PaymentPage() {
  const [orderId, setOrderId] = useState(localStorage.getItem('last-order-id') ?? '');
  const [amount, setAmount] = useState(0);
  const [tipAmount, setTipAmount] = useState(0);
  const [method, setMethod] = useState<'CASH' | 'CARD'>('CASH');
  const total = useMemo(() => amount + tipAmount, [amount, tipAmount]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    await apiFetch('/payments', {
      method: 'POST',
      body: JSON.stringify({ orderId, amount, tipAmount, method, reference: method === 'CARD' ? `CARD-${Date.now()}` : null })
    });
    alert('Payment recorded.');
  }

  return (
    <form onSubmit={submit} className="p-4 space-y-3 max-w-xl">
      <h2 className="text-xl font-bold">Payment</h2>
      <input value={orderId} onChange={(e) => setOrderId(e.target.value)} className="w-full border rounded p-2" placeholder="Order ID" />
      <input value={amount} onChange={(e) => setAmount(Number(e.target.value))} type="number" className="w-full border rounded p-2" placeholder="Amount" />
      <input value={tipAmount} onChange={(e) => setTipAmount(Number(e.target.value))} type="number" className="w-full border rounded p-2" placeholder="Tip" />
      <select value={method} onChange={(e) => setMethod(e.target.value as 'CASH' | 'CARD')} className="w-full border rounded p-2">
        <option value="CASH">Cash</option>
        <option value="CARD">Card</option>
      </select>
      <div className="font-semibold">Total paid: ${total.toFixed(2)}</div>
      <button className="bg-slate-900 text-white rounded px-4 py-2">Record Payment</button>
    </form>
  );
}
