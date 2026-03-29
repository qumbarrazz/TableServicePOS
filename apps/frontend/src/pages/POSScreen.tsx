import { useEffect } from 'react';
import { usePOSStore } from '../store/posStore';
import { apiFetch } from '../services/api';
import { db } from '../lib/db';
import { Floor } from '../types';

export function POSScreen() {
  const { tables, setTables, selectTable } = usePOSStore();

  useEffect(() => {
    apiFetch<Floor[]>('/floors')
      .then(async (floors) => {
        const flatten = floors.flatMap((f) => f.tables);
        setTables(flatten);
        await db.floors.bulkPut(floors);
        await db.diningTables.bulkPut(flatten);
      })
      .catch(async () => {
        setTables(await db.diningTables.toArray());
      });
  }, [setTables]);

  return (
    <div className="p-4 space-y-3">
      <h1 className="text-2xl font-bold">POS Screen</h1>
      <p className="text-sm text-slate-600">Tap a table to start ordering.</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tables.map((table) => (
          <button key={table.id} onClick={() => selectTable(table.id)} className="bg-white p-3 rounded shadow text-left border">
            <p className="font-semibold">{table.name}</p>
            <p className="text-xs">{table.status}</p>
            <p className="text-xs text-slate-500">Seats: {table.seats}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
