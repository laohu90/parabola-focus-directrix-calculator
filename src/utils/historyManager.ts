import { ConicType } from './conicTypes.ts';

export interface HistoryItem {
  id: string;
  equation: string;
  conicType: ConicType;
  timestamp: number;
  starred?: boolean;
}

const STORAGE_KEY = 'conic_solver_history_v1';

export function getHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveHistoryItem(equation: string, conicType: ConicType): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const existing = getHistory();
    // Avoid exact duplicate at the top
    const filtered = existing.filter((item) => item.equation.trim() !== equation.trim());
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      equation: equation.trim(),
      conicType,
      timestamp: Date.now()
    };
    const updated = [newItem, ...filtered].slice(0, 30); // keep last 30
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function toggleStarHistoryItem(id: string): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const existing = getHistory();
    const updated = existing.map((item) =>
      item.id === id ? { ...item, starred: !item.starred } : item
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
