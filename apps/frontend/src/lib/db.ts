import Dexie, { Table } from 'dexie';
import { DiningTable, Floor, SyncQueueRecord } from '../types';

export interface DraftOrder {
  id: string;
  tableId: string;
  items: string;
  updatedAt: string;
}

class POSDatabase extends Dexie {
  floors!: Table<Floor, string>;
  diningTables!: Table<DiningTable, string>;
  draftOrders!: Table<DraftOrder, string>;
  syncQueue!: Table<SyncQueueRecord, string>;

  constructor() {
    super('table-service-pos-db');
    this.version(2).stores({
      floors: 'id,sortOrder',
      diningTables: 'id,floorId,status',
      draftOrders: 'id,tableId,updatedAt',
      syncQueue: 'id,entity,updatedAt'
    });
  }
}

export const db = new POSDatabase();
