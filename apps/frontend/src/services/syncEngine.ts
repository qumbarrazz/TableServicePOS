import { db } from '../lib/db';
import { apiFetch } from './api';

export async function enqueueSync(entity: string, action: 'create' | 'update' | 'delete', payload: unknown) {
  await db.syncQueue.put({
    id: crypto.randomUUID(),
    entity,
    action,
    payload,
    updatedAt: new Date().toISOString()
  });
}

export async function syncNow() {
  const records = await db.syncQueue.toArray();
  if (!records.length || !navigator.onLine) return;

  const result = await apiFetch<{ synced: number }>('/sync/batch', {
    method: 'POST',
    body: JSON.stringify({
      records: records.map((r) => ({ clientRecordId: r.id, ...r }))
    })
  });

  if (result.synced) {
    await db.syncQueue.clear();
  }
}
