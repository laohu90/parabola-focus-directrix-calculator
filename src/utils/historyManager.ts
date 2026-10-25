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

export function isEquationBookmarked(equation: string): boolean {
  if (typeof window === 'undefined' || !equation) return false;
  try {
    const list = getHistory();
    const item = list.find((h) => h.equation.trim() === equation.trim());
    return !!item?.starred;
  } catch {
    return false;
  }
}

export function toggleBookmarkEquation(
  equation: string,
  conicType: ConicType
): { updatedList: HistoryItem[]; isBookmarked: boolean } {
  if (typeof window === 'undefined' || !equation) {
    return { updatedList: [], isBookmarked: false };
  }
  try {
    const existing = getHistory();
    const index = existing.findIndex((h) => h.equation.trim() === equation.trim());
    let isNowBookmarked = false;
    let updated: HistoryItem[] = [];

    if (index >= 0) {
      isNowBookmarked = !existing[index].starred;
      updated = existing.map((item, i) =>
        i === index ? { ...item, starred: isNowBookmarked } : item
      );
    } else {
      isNowBookmarked = true;
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        equation: equation.trim(),
        conicType,
        timestamp: Date.now(),
        starred: true
      };
      updated = [newItem, ...existing].slice(0, 30);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return { updatedList: updated, isBookmarked: isNowBookmarked };
  } catch {
    return { updatedList: [], isBookmarked: false };
  }
}

export function getBookmarks(): HistoryItem[] {
  return getHistory().filter((item) => item.starred);
}

