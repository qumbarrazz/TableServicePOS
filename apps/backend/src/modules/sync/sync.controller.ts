import { Request, Response } from 'express';
import { prisma } from '../../config/db.js';

export const syncBatch = async (req: Request, res: Response) => {
  const { records } = req.body as { records: Array<{ clientRecordId: string; entity: string; action: string; updatedAt: string; payload: any }> };

  const results = [];
  for (const record of records) {
    const existing = await prisma.syncLog.findFirst({
      where: { clientRecordId: record.clientRecordId, entity: record.entity }
    });

    const incomingTime = new Date(record.updatedAt);
    const conflict = existing ? incomingTime < existing.serverVersion : false;

    const syncLog = await prisma.syncLog.upsert({
      where: { id: existing?.id ?? 'missing-id' },
      create: {
        clientRecordId: record.clientRecordId,
        entity: record.entity,
        action: record.action,
        lastSyncedAt: incomingTime,
        conflict,
        metadata: record.payload
      },
      update: {
        lastSyncedAt: incomingTime,
        conflict,
        metadata: record.payload
      }
    }).catch(async () => prisma.syncLog.create({
      data: {
        clientRecordId: record.clientRecordId,
        entity: record.entity,
        action: record.action,
        lastSyncedAt: incomingTime,
        conflict,
        metadata: record.payload
      }
    }));

    results.push(syncLog);
  }

  return res.json({ synced: results.length, results });
};
