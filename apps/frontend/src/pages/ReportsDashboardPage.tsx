import { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';

export function ReportsDashboardPage() {
  const [daily, setDaily] = useState<{ _sum?: { totalAmount?: number }; _count?: { id?: number } }>({});
  const [top, setTop] = useState<Array<{ menuItemId: string; _sum: { quantity: number } }>>([]);

  useEffect(() => {
    apiFetch<{ _sum?: { totalAmount?: number }; _count?: { id?: number } }>('/reports/daily-sales').then((data) => setDaily(data)).catch(() => undefined);
    apiFetch<Array<{ menuItemId: string; _sum: { quantity: number } }>>('/reports/top-items').then((data) => setTop(data)).catch(() => undefined);
  }, []);

  return (
    <div className="p-4 space-y-3">
      <h2 className="text-xl font-bold">Reports Dashboard</h2>
      <div className="grid md:grid-cols-2 gap-3">
        <div className="bg-white rounded border p-3">
          <p className="text-sm text-slate-500">Orders</p>
          <p className="text-2xl font-semibold">{daily._count?.id ?? 0}</p>
        </div>
        <div className="bg-white rounded border p-3">
          <p className="text-sm text-slate-500">Daily Sales</p>
          <p className="text-2xl font-semibold">${Number(daily._sum?.totalAmount ?? 0).toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white rounded border p-3">
        <h3 className="font-semibold mb-2">Top Selling Items</h3>
        {top.map((item) => (
          <div key={item.menuItemId} className="flex justify-between text-sm border-b py-1">
            <span>{item.menuItemId}</span>
            <span>{item._sum.quantity}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
