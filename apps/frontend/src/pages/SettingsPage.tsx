import { db } from '../lib/db';
import { syncNow } from '../services/syncEngine';

export function SettingsPage() {
  async function manualSync() {
    await syncNow();
    alert('Manual sync attempted.');
  }

  async function clearLocalData() {
    await db.delete();
    location.reload();
  }

  return (
    <div className="p-4 space-y-3 max-w-lg">
      <h2 className="text-xl font-bold">Settings</h2>
      <button onClick={manualSync} className="bg-blue-600 text-white rounded px-4 py-2">Sync Now</button>
      <button onClick={clearLocalData} className="bg-red-600 text-white rounded px-4 py-2">Clear Offline Data</button>
      <button onClick={() => { localStorage.removeItem('token'); location.href = '/login'; }} className="bg-slate-800 text-white rounded px-4 py-2">Logout</button>
    </div>
  );
}
