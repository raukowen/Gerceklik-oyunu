import { BoardItem, BoardEdge } from '../types';
export interface Snapshot { items: BoardItem[]; edges: BoardEdge[]; projectName: string }
export interface HistoryState { entries: Snapshot[]; index: number }
export const HISTORY_LIMIT = 100;
const sameList = <T extends object>(a: T[], b: T[]) => a === b || (a.length === b.length && a.every((item, i) =>
  item === b[i] || (Object.keys(item).length === Object.keys(b[i]).length && Object.keys(item).every(key => item[key] === b[i][key]))));
export function recordSnapshot(state: HistoryState, snapshot: Snapshot): HistoryState {
  const current = state.entries[state.index];
  if (current.projectName === snapshot.projectName && sameList(current.items, snapshot.items) && sameList(current.edges, snapshot.edges)) return state;
  const entries = [...state.entries.slice(0, state.index + 1), snapshot].slice(-HISTORY_LIMIT);
  return { entries, index: entries.length - 1 };
}
