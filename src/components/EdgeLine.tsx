import React from 'react';
import { BoardEdge, BoardItem } from '../types';
import { calculateEdgePath } from '../utils/geometry';
import { X } from 'lucide-react';

interface EdgeLineProps {
  edge: BoardEdge;
  fromItem: BoardItem;
  toItem: BoardItem;
  isSelected: boolean;
  isQuietHighlightMode?: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onDelete?: () => void;
}

export const EdgeLine: React.FC<EdgeLineProps> = ({
  edge,
  fromItem,
  toItem,
  isSelected,
  isQuietHighlightMode = false,
  onSelect,
  onDelete,
}) => {
  if (!fromItem || !toItem) return null;

  const isQuietArrow =
    edge.isDashed ||
    edge.isQuiet ||
    (edge.label && edge.label.toUpperCase().includes('SESSİZ')) ||
    edge.color === '#6b7280' ||
    edge.color === '#9ca3af';

  const isDashed = edge.isDashed || edge.isQuiet || (isQuietHighlightMode && isQuietArrow);

  let strokeColor = isSelected ? '#3b82f6' : (isQuietHighlightMode && isQuietArrow) ? '#9ca3af' : (edge.color || '#6b7280');
  if (!isSelected && isDashed) {
    strokeColor = '#9ca3af';
  }
  const strokeWidth = isSelected ? 3 : 2;

  const { path, midPoint } = calculateEdgePath(fromItem, toItem);

  return (
    <g className="group cursor-pointer" onClick={onSelect}>
      {/* Invisible thicker hit area for easier clicking */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={18}
        className="pointer-events-auto"
      />

      {/* Main Connection Line */}
      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={isDashed ? '6 4' : 'none'}
        markerEnd={`url(#arrow-${edge.id})`}
        className="transition-colors duration-150"
      />

      {/* Arrowhead Marker Definition */}
      <defs>
        <marker
          id={`arrow-${edge.id}`}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={strokeColor} />
        </marker>
      </defs>

      {/* Selection Highlight Glow */}
      {isSelected && (
        <path
          d={path}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={7}
          strokeOpacity={0.4}
          className="pointer-events-none animate-pulse"
        />
      )}

      {/* Midpoint Label & Delete Button */}
      {midPoint && (
        <foreignObject
          x={midPoint.x - 65}
          y={midPoint.y - 14}
          width={130}
          height={28}
          className="pointer-events-auto overflow-visible"
        >
          <div className="w-full h-full flex items-center justify-center">
            <div
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold border shadow-lg transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-500 ring-2 ring-blue-500/50 shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                  : isQuietHighlightMode && isQuietArrow
                  ? 'bg-[#111827] text-gray-300 border-gray-600 ring-1 ring-gray-500/40'
                  : 'bg-[#0d1117] backdrop-blur text-gray-200 border-gray-800 group-hover:border-gray-600'
              }`}
            >
              <span className="truncate max-w-[85px]">
                {edge.label || (isQuietArrow ? 'SESSİZ OK' : 'Ok Bağlantısı')}
              </span>

              {/* Delete Edge Button on Select or Hover */}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className={`p-0.5 rounded-full transition-colors ${
                    isSelected
                      ? 'hover:bg-blue-700 text-white'
                      : 'hover:bg-red-950/80 hover:text-red-400 text-gray-400'
                  }`}
                  title="Bağlantıyı Sil"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          </div>
        </foreignObject>
      )}
    </g>
  );
};
