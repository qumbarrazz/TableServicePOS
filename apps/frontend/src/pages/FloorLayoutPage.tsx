import { FormEvent, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../services/api';
import { enqueueSync } from '../services/syncEngine';
import { db } from '../lib/db';
import { DiningTable, Floor, TableStatus } from '../types';

const statuses: TableStatus[] = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'BILLING', 'CLEANING'];

export function FloorLayoutPage() {
  const [floors, setFloors] = useState<Floor[]>([]);
  const [selectedFloorId, setSelectedFloorId] = useState<string>('');
  const [newFloorName, setNewFloorName] = useState('');
  const [newTableName, setNewTableName] = useState('');
  const [newTableSeats, setNewTableSeats] = useState(4);

  useEffect(() => {
    loadFloors();
  }, []);

  const selectedFloor = useMemo(
    () => floors.find((f) => f.id === selectedFloorId) ?? floors[0],
    [floors, selectedFloorId]
  );

  async function loadFloors() {
    try {
      const remote = await apiFetch<Floor[]>('/floors');
      setFloors(remote);
      if (!selectedFloorId && remote[0]) setSelectedFloorId(remote[0].id);
      await db.floors.bulkPut(remote);
      await db.diningTables.bulkPut(remote.flatMap((f) => f.tables));
    } catch {
      const cachedFloors = await db.floors.toArray();
      const cachedTables = await db.diningTables.toArray();
      const merged = cachedFloors.map((f) => ({ ...f, tables: cachedTables.filter((t) => t.floorId === f.id) }));
      setFloors(merged);
      if (!selectedFloorId && merged[0]) setSelectedFloorId(merged[0].id);
    }
  }

  async function createFloor(e: FormEvent) {
    e.preventDefault();
    if (!newFloorName.trim()) return;

    const floor = await apiFetch<Floor>('/floors', {
      method: 'POST',
      body: JSON.stringify({ name: newFloorName, sortOrder: floors.length + 1 })
    });

    setFloors((prev) => [...prev, { ...floor, tables: [] }]);
    setSelectedFloorId(floor.id);
    setNewFloorName('');
    await enqueueSync('floors', 'create', floor);
    await db.floors.put({ ...floor, tables: [] });
  }

  async function createTable(e: FormEvent) {
    e.preventDefault();
    if (!selectedFloor || !newTableName.trim()) return;

    const table = await apiFetch<DiningTable>('/tables', {
      method: 'POST',
      body: JSON.stringify({
        floorId: selectedFloor.id,
        name: newTableName,
        seats: newTableSeats,
        x: 30,
        y: 30,
        status: 'AVAILABLE'
      })
    });

    setFloors((prev) => prev.map((f) => (f.id === selectedFloor.id ? { ...f, tables: [...f.tables, table] } : f)));
    setNewTableName('');
    await enqueueSync('tables', 'create', table);
    await db.diningTables.put(table);
  }

  async function saveTable(table: DiningTable) {
    const updated = await apiFetch<DiningTable>('/tables', {
      method: 'POST',
      body: JSON.stringify(table)
    });

    setFloors((prev) =>
      prev.map((f) =>
        f.id === updated.floorId
          ? { ...f, tables: f.tables.map((t) => (t.id === updated.id ? updated : t)) }
          : f
      )
    );
    await enqueueSync('tables', 'update', updated);
    await db.diningTables.put(updated);
  }

  function moveTable(tableId: string, deltaX: number, deltaY: number) {
    if (!selectedFloor) return;

    setFloors((prev) =>
      prev.map((f) =>
        f.id !== selectedFloor.id
          ? f
          : {
              ...f,
              tables: f.tables.map((t) =>
                t.id === tableId ? { ...t, x: Math.max(0, t.x + deltaX), y: Math.max(0, t.y + deltaY) } : t
              )
            }
      )
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Floor Layout</h2>
      <div className="grid md:grid-cols-2 gap-3">
        <form onSubmit={createFloor} className="bg-white rounded p-3 shadow flex gap-2">
          <input
            value={newFloorName}
            onChange={(e) => setNewFloorName(e.target.value)}
            placeholder="New floor name"
            className="border rounded p-2 flex-1"
          />
          <button className="bg-slate-900 text-white rounded px-3">Add Floor</button>
        </form>

        <form onSubmit={createTable} className="bg-white rounded p-3 shadow grid grid-cols-3 gap-2">
          <input
            value={newTableName}
            onChange={(e) => setNewTableName(e.target.value)}
            placeholder="Table name"
            className="border rounded p-2"
          />
          <input
            type="number"
            min={1}
            value={newTableSeats}
            onChange={(e) => setNewTableSeats(Number(e.target.value))}
            className="border rounded p-2"
          />
          <button className="bg-emerald-600 text-white rounded px-3">Add Table</button>
        </form>
      </div>

      <div className="bg-white rounded p-3 shadow flex gap-2 overflow-auto">
        {floors.map((floor) => (
          <button
            key={floor.id}
            onClick={() => setSelectedFloorId(floor.id)}
            className={`px-3 py-1 rounded ${selectedFloor?.id === floor.id ? 'bg-slate-900 text-white' : 'bg-slate-200'}`}
          >
            {floor.name}
          </button>
        ))}
      </div>

      <div className="bg-slate-50 border rounded-xl h-[480px] relative overflow-hidden">
        {selectedFloor?.tables.map((table) => (
          <div
            key={table.id}
            className="absolute w-44 bg-white border shadow rounded p-2"
            style={{ left: table.x, top: table.y }}
          >
            <div className="font-semibold text-sm">{table.name}</div>
            <div className="text-xs text-slate-500">Seats: {table.seats}</div>
            <select
              value={table.status}
              onChange={(e) => {
                const status = e.target.value as TableStatus;
                setFloors((prev) =>
                  prev.map((f) =>
                    f.id !== selectedFloor.id ? f : { ...f, tables: f.tables.map((t) => (t.id === table.id ? { ...t, status } : t)) }
                  )
                );
              }}
              className="mt-2 w-full border rounded p-1 text-xs"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <div className="mt-2 grid grid-cols-4 gap-1 text-xs">
              <button onClick={() => moveTable(table.id, -15, 0)} className="border rounded px-1">◀</button>
              <button onClick={() => moveTable(table.id, 15, 0)} className="border rounded px-1">▶</button>
              <button onClick={() => moveTable(table.id, 0, -15)} className="border rounded px-1">▲</button>
              <button onClick={() => moveTable(table.id, 0, 15)} className="border rounded px-1">▼</button>
            </div>
            <button onClick={() => saveTable(table)} className="mt-2 w-full bg-blue-600 text-white rounded py-1 text-xs">Save</button>
          </div>
        ))}
      </div>
    </div>
  );
}
