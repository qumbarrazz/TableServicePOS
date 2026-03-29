export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'BILLING' | 'CLEANING';

export interface Floor {
  id: string;
  name: string;
  sortOrder: number;
  tables: DiningTable[];
}

export interface DiningTable {
  id: string;
  floorId: string;
  name: string;
  seats: number;
  x: number;
  y: number;
  status: TableStatus;
}

export interface SyncQueueRecord {
  id: string;
  entity: string;
  action: 'create' | 'update' | 'delete';
  payload: unknown;
  updatedAt: string;
}

export interface DraftOrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
}
