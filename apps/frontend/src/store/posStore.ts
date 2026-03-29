import { create } from 'zustand';
import { DiningTable } from '../types';

type POSState = {
  tables: DiningTable[];
  selectedTableId?: string;
  setTables: (tables: DiningTable[]) => void;
  selectTable: (id: string) => void;
};

export const usePOSStore = create<POSState>((set) => ({
  tables: [],
  setTables: (tables) => set({ tables }),
  selectTable: (selectedTableId) => set({ selectedTableId })
}));
