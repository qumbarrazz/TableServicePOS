import Dexie, { Table } from 'dexie';
import { DiningTable, SyncQueueRecord } from '../types';

class POSDatabase extends Dexie {
  diningTables!: Table<DiningTable, string>;
  syncQueue!: Table<SyncQueueRecord, string>;

  constructor() {
    super('table-service-pos-db');
    this.version(1).stores({
      diningTables: 'id,floorId,status',
      syncQueue: 'id,entity,updatedAt'
    });
  }
}

export const db = new POSDatabase();
