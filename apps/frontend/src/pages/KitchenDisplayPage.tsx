import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:4000');

type KDSOrder = { id: string; table: string; status: 'PENDING' | 'PREPARING' | 'READY' | 'SERVED'; priority: 'normal' | 'high' };

export function KitchenDisplayPage() {
  const [orders, setOrders] = useState<KDSOrder[]>([]);

  useEffect(() => {
    socket.on('order:created', (order: KDSOrder) => {
      setOrders((prev) => [order, ...prev]);
    });
    socket.on('kds:status-updated', (update: { id: string; status: KDSOrder['status'] }) => {
      setOrders((prev) => prev.map((o) => (o.id === update.id ? { ...o, status: update.status } : o)));
    });
    return () => {
      socket.off('order:created');
      socket.off('kds:status-updated');
    };
  }, []);

  function setStatus(id: string, status: KDSOrder['status']) {
    socket.emit('kds:status-update', { id, status });
  }

  return (
    <div className="p-4 space-y-3">
      <h2 className="text-xl font-bold">Kitchen Display</h2>
      <div className="grid md:grid-cols-4 gap-3">
        {['PENDING', 'PREPARING', 'READY', 'SERVED'].map((lane) => (
          <div key={lane} className="bg-white border rounded p-2">
            <h3 className="font-semibold mb-2">{lane}</h3>
            {orders.filter((o) => o.status === lane).map((o) => (
              <div key={o.id} className="border rounded p-2 mb-2 text-sm">
                <div>{o.id}</div>
                <div>Table: {o.table}</div>
                <button onClick={() => setStatus(o.id, lane === 'PENDING' ? 'PREPARING' : lane === 'PREPARING' ? 'READY' : 'SERVED')} className="mt-2 text-xs bg-slate-900 text-white rounded px-2 py-1">Advance</button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
