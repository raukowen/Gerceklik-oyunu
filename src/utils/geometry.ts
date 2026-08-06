import { BoardItem } from '../types';

export interface Point {
  x: number;
  y: number;
}

/**
 * Calculates center point of a board item.
 */
export function getItemCenter(item: BoardItem): Point {
  return {
    x: item.x + item.width / 2,
    y: item.y + item.height / 2,
  };
}

/**
 * Finds the intersection point on the boundary of a card (rectangle) or coin (circle)
 * pointing from center to targetPoint.
 */
export function getIntersectionPoint(item: BoardItem, targetPoint: Point): Point {
  const center = getItemCenter(item);
  const dx = targetPoint.x - center.x;
  const dy = targetPoint.y - center.y;

  if (Math.abs(dx) < 0.0001 && Math.abs(dy) < 0.0001) {
    return center;
  }

  if (item.type === 'COIN') {
    // Circle intersection
    const radius = item.width / 2;
    const angle = Math.atan2(dy, dx);
    return {
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle),
    };
  } else {
    // Rectangle intersection
    const halfWidth = item.width / 2;
    const halfHeight = item.height / 2;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    let scale: number;

    if (absDx * halfHeight > absDy * halfWidth) {
      // Intersects left or right boundary
      scale = halfWidth / absDx;
    } else {
      // Intersects top or bottom boundary
      scale = halfHeight / absDy;
    }

    return {
      x: center.x + dx * scale,
      y: center.y + dy * scale,
    };
  }
}

/**
 * Generates SVG path string (straight or curved line) between two items.
 */
export function calculateEdgePath(
  fromItem: BoardItem,
  toItem: BoardItem
): { path: string; fromPoint: Point; toPoint: Point; midPoint: Point } {
  const fromCenter = getItemCenter(fromItem);
  const toCenter = getItemCenter(toItem);

  const fromPoint = getIntersectionPoint(fromItem, toCenter);
  const toPoint = getIntersectionPoint(toItem, fromCenter);

  const midPoint = {
    x: (fromPoint.x + toPoint.x) / 2,
    y: (fromPoint.y + toPoint.y) / 2,
  };

  const path = `M ${fromPoint.x} ${fromPoint.y} L ${toPoint.x} ${toPoint.y}`;

  return { path, fromPoint, toPoint, midPoint };
}
