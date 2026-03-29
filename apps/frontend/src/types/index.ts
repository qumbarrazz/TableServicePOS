export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'BILLING' | 'CLEANING';

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
