import { BoardItem, BoardEdge, ProjectData } from '../types';
import { CARD_CONFIGS, COIN_CONFIGS, FRAME_STATUS_CONFIGS, RING_CONFIGS } from '../data/constants';

const object = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const owns = (value: object, key: unknown) => typeof key === 'string' && Object.hasOwn(value, key);
const optionalText = (value: unknown) => value === undefined || typeof value === 'string';

export function isBoardItem(value: unknown): value is BoardItem {
  if (!object(value) || typeof value.id !== 'string' || !value.id) return false;
  const config = value.type === 'CARD' ? CARD_CONFIGS : value.type === 'COIN' ? COIN_CONFIGS : null;
  return config !== null && owns(config, value.size) && finite(value.x) && finite(value.y)
    && finite(value.width) && value.width > 0 && finite(value.height) && value.height > 0
    && finite(value.zIndex) && typeof value.title === 'string' && typeof value.description === 'string'
    && owns(FRAME_STATUS_CONFIGS, value.frameStatus)
    && (value.ringType === undefined || owns(RING_CONFIGS, value.ringType))
    && (value.ringTone === undefined || value.ringTone === 'LIGHT' || value.ringTone === 'DARK')
    && optionalText(value.categoryTag) && optionalText(value.colorHex) && optionalText(value.bgHex);
}

export function parseBoard(value: unknown): { items: BoardItem[]; edges: BoardEdge[] } | null {
  if (!object(value) || !Array.isArray(value.items) || !value.items.every(isBoardItem)) return null;
  const ids = new Set(value.items.map(item => item.id));
  if (ids.size !== value.items.length) return null;
  const edges = value.edges ?? [];
  if (!Array.isArray(edges)) return null;
  const edgeIds = new Set<string>();
  for (const edge of edges) {
    if (!object(edge) || typeof edge.id !== 'string' || !edge.id || edgeIds.has(edge.id)
      || typeof edge.fromId !== 'string' || typeof edge.toId !== 'string'
      || !ids.has(edge.fromId) || !ids.has(edge.toId) || edge.fromId === edge.toId
      || !optionalText(edge.label) || !optionalText(edge.color)
      || (edge.isDashed !== undefined && typeof edge.isDashed !== 'boolean')
      || (edge.isQuiet !== undefined && typeof edge.isQuiet !== 'boolean')) return null;
    edgeIds.add(edge.id);
  }
  return { items: value.items, edges: edges as BoardEdge[] };
}

export function isProject(value: unknown): value is ProjectData {
  return object(value) && typeof value.id === 'string' && typeof value.name === 'string'
    && typeof value.description === 'string' && typeof value.updatedAt === 'string'
    && Number.isFinite(Date.parse(value.updatedAt)) && parseBoard(value) !== null;
}

export function isEditingTarget(target: EventTarget | null): boolean {
  return target instanceof Element && !!target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="dialog"]');
}
