import React from 'react';
import { BoardItem } from '../types';
import { FRAME_STATUS_CONFIGS, CARD_CONFIGS } from '../data/constants';
import { CheckCircle2, Clock, Ban, AlertTriangle, Layers } from 'lucide-react';

interface CardNodeProps {
  item: BoardItem;
  isSelected: boolean;
  isConnectSource: boolean;
  isConnectTargetCandidate: boolean;
  isQuietHighlight?: boolean;
  onSelect: (e: React.MouseEvent | React.KeyboardEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  onDoubleClick?: () => void;
}

export const CardNode: React.FC<CardNodeProps> = ({
  item,
  isSelected,
  isConnectSource,
  isConnectTargetCandidate,
  isQuietHighlight = false,
  onSelect,
  onMouseDown,
  onTouchStart,
  onDoubleClick,
}) => {
  const cardConfig = CARD_CONFIGS[item.size as keyof typeof CARD_CONFIGS] || CARD_CONFIGS.M;
  const frameConfig = FRAME_STATUS_CONFIGS[item.frameStatus] || FRAME_STATUS_CONFIGS.NONE;

  // Frame stroke styling
  let frameColor = 'none';
  let frameStrokeWidth = 0;
  let frameDashArray = 'none';

  if (item.frameStatus !== 'NONE') {
    frameColor = frameConfig.color;
    frameStrokeWidth = 3;
    if (item.frameStatus === 'REALITY_LIMITS') {
      frameDashArray = '6 3';
    }
  }

  // Get status icon
  const renderStatusIcon = () => {
    switch (item.frameStatus) {
      case 'READY':
        return <CheckCircle2 size={12} className="text-emerald-600 inline ml-1" />;
      case 'IN_PROGRESS':
        return <Clock size={12} className="text-blue-600 inline ml-1 animate-pulse" />;
      case 'CLOSED':
        return <Ban size={12} className="text-gray-500 inline ml-1" />;
      case 'REALITY_LIMITS':
        return <AlertTriangle size={12} className="text-red-600 inline ml-1" />;
      default:
        return null;
    }
  };

  const headerBg = item.colorHex || cardConfig.defaultColor;

  return (
    <g
      role="button" tabIndex={0} aria-label={item.title} data-item-id={item.id}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(e); } }}
      transform={`translate(${item.x}, ${item.y})`}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onClick={(e) => { e.stopPropagation(); if (e.detail === 0) onSelect(e); }}
      onDoubleClick={onDoubleClick}
      className="cursor-move select-none group"
    >
      {/* Outer Glow / Shadow */}
      <rect
        x={0}
        y={0}
        width={item.width}
        height={item.height}
        rx={12}
        ry={12}
        fill="#0c121e"
        filter="url(#shadow)"
        className="transition-shadow duration-150"
      />

      {/* Main Card Background */}
      <rect
        x={0}
        y={0}
        width={item.width}
        height={item.height}
        rx={12}
        ry={12}
        fill={item.bgHex && item.bgHex !== '#ffffff' ? item.bgHex : '#0c121e'}
        stroke="#1f2937"
        strokeWidth={1}
      />

      {/* Top Header Bar Accent */}
      <path
        d={`M 0,12 Q 0,0 12,0 L ${item.width - 12},0 Q ${item.width},0 ${item.width},12 L ${item.width},26 L 0,26 Z`}
        fill={headerBg}
      />

      {/* Category Tag in Header */}
      <foreignObject x={8} y={3} width={item.width - 16} height={20}>
        <div className="flex items-center justify-between text-white text-[10px] font-black tracking-wider uppercase truncate pr-1">
          <span className="flex items-center gap-1">
            <Layers size={10} className="opacity-80" />
            {item.categoryTag || item.size}
          </span>
          <span className="text-[9px] opacity-90 px-1 bg-black/40 rounded font-mono border border-white/10">
            {item.size}
          </span>
        </div>
      </foreignObject>

      {/* Card Content HTML ForeignObject */}
      <foreignObject x={8} y={30} width={item.width - 16} height={item.height - 34}>
        <div className="h-full flex flex-col justify-between overflow-hidden">
          <div>
            <div className="font-extrabold text-[12px] text-gray-100 leading-tight line-clamp-2 mb-1 flex items-center justify-between">
              <span>{item.title || cardConfig.defaultTitle}</span>
            </div>
            {item.description && (
              <div className="text-[10px] text-gray-400 leading-snug line-clamp-3 font-normal">
                {item.description}
              </div>
            )}
          </div>

          {/* Bottom Status Badge */}
          {item.frameStatus !== 'NONE' && (
            <div className="mt-1 flex items-center gap-1">
              <span
                className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded border"
                style={{
                  backgroundColor: frameConfig.badgeBg,
                  borderColor: frameConfig.color,
                  color: frameConfig.color,
                }}
              >
                {frameConfig.label}
                {renderStatusIcon()}
              </span>
            </div>
          )}
        </div>
      </foreignObject>

      {/* Status Frame Border Overlay */}
      {item.frameStatus !== 'NONE' && (
        <rect
          x={-3}
          y={-3}
          width={item.width + 6}
          height={item.height + 6}
          rx={15}
          ry={15}
          fill="none"
          stroke={frameColor}
          strokeWidth={frameStrokeWidth}
          strokeDasharray={frameDashArray}
          className="pointer-events-none"
        />
      )}

      {/* Selected Indicator Outline */}
      {isSelected && (
        <rect
          x={-5}
          y={-5}
          width={item.width + 10}
          height={item.height + 10}
          rx={16}
          ry={16}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={2}
          strokeDasharray="6 4"
          className="pointer-events-none animate-pulse"
        />
      )}

      {/* Connection Source Highlight */}
      {isConnectSource && (
        <rect
          x={-6}
          y={-6}
          width={item.width + 12}
          height={item.height + 12}
          rx={17}
          ry={17}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={3}
          className="pointer-events-none animate-pulse"
        />
      )}

      {/* Connection Target Candidate Hover Highlight */}
      {isConnectTargetCandidate && (
        <rect
          x={-6}
          y={-6}
          width={item.width + 12}
          height={item.height + 12}
          rx={17}
          ry={17}
          fill="none"
          stroke="#10b981"
          strokeWidth={3}
          strokeDasharray="4 3"
          className="pointer-events-none"
        />
      )}

      {/* Quiet Card Highlight Overlay */}
      {isQuietHighlight && (
        <g className="pointer-events-none">
          <rect
            x={-5}
            y={-5}
            width={item.width + 10}
            height={item.height + 10}
            rx={16}
            ry={16}
            fill="none"
            stroke="#a855f7"
            strokeWidth={2}
            strokeDasharray="4 4"
            className="animate-pulse"
          />
          <foreignObject x={item.width - 70} y={-10} width={75} height={20}>
            <span className="bg-purple-950 text-purple-300 border border-purple-600 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full shadow">
              Sessiz Kart
            </span>
          </foreignObject>
        </g>
      )}
    </g>
  );
};
