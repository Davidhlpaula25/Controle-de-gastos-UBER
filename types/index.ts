export type EntryType = 'income' | 'expense';
export type Entry = {
  id?: string;
  date: string;
  type: EntryType;
  category: string;
  amount: number;
  platform?: string;
  description?: string;
  createdAt?: unknown;
};
export type Journey = {
  id?: string;
  date: string;
  kmStart: number;
  kmEnd: number;
  startedAt: string;
  endedAt: string;
};
