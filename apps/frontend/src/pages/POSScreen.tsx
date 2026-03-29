import { useEffect } from 'react';
import { usePOSStore } from '../store/posStore';
import { apiFetch } from '../services/api';
import { db } from '../lib/db';

export function POSScreen() {
  const { tables, setTables, selectTable } = usePOSStore();

  useEffect(() => {
    apiFetch<any[]>('/floors')
      .then(async (floors) => {
        const flatten = floors.flatMap((f) => f.tables);
        setTables(flatten);
        await db.tables.bulkPut(flatten);
      })
      .catch(async () => {
        setTables(await db.tables.toArray());
      });
  }, [setTables]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-3">POS Screen</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tables.map((table) => (
          <button key={table.id} onClick={() => selectTable(table.id)} className="bg-white p-3 rounded shadow text-left">
            <p className="font-semibold">{table.name}</p>
            <p className="text-xs">{table.status}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
