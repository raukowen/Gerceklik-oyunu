import React from 'react';
import { BoardItem } from '../types';
import { RING_CONFIGS, COIN_CONFIGS, FRAME_STATUS_CONFIGS } from '../data/constants';
import { Circle, User, MapPin } from 'lucide-react';

interface CoinNodeProps {
  item: BoardItem;
  isSelected: boolean;
  isConnectSource: boolean;
  isConnectTargetCandidate: boolean;
  onSelect: (e: React.MouseEvent | React.TouchEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  onDoubleClick?: () => void;
}

export const CoinNode: React.FC<CoinNodeProps> = ({
  item,
  isSelected,
  isConnectSource,
  isConnectTargetCandidate,
  onSelect,
  onMouseDown,
  onTouchStart,
  onDoubleClick,
}) => {
  const coinConfig = COIN_CONFIGS[item.size as keyof typeof COIN_CONFIGS] || COIN_CONFIGS.SMALL;
  const ringConfig = RING_CONFIGS[item.ringType || 'NONE'] || RING_CONFIGS.NONE;
  const frameConfig = FRAME_STATUS_CONFIGS[item.frameStatus] || FRAME_STATUS_CONFIGS.NONE;

  const radius = item.width / 2;
  const centerX = radius;
  const centerY = radius;

  const isBig = item.size === 'BIG';

  return (
    <g
      transform={`translate(${item.x}, ${item.y})`}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onClick={onSelect}
      onDoubleClick={onDoubleClick}
      className="cursor-move select-none group"
    >
      {/* Shadow */}
      <circle
        cx={centerX}
        cy={centerY}
        r={radius}
        fill="#000000"
        fillOpacity={0.15}
        filter="url(#shadow)"
      />

      {/* Ring Ring / Outer Ring Accent if set */}
      {item.ringType && item.ringType !== 'NONE' && (
        <g>
          <circle
            cx={centerX}
            cy={centerY}
            r={radius + 7}
            fill="none"
            stroke={item.ringTone === 'DARK' ? ringConfig.darkColor : ringConfig.lightColor}
            strokeWidth={item.ringTone === 'DARK' ? 6 : 4}
            className="transition-all duration-200"
          />
          {item.ringTone === 'DARK' && (
            <circle
              cx={centerX}
              cy={centerY}
              r={radius + 11}
              fill="none"
              stroke={ringConfig.darkColor}
              strokeWidth={1.5}
              strokeDasharray="3 2"
              opacity={0.85}
            />
          )}
        </g>
      )}

      {/* Coin Base Body */}
      <circle
        cx={centerX}
        cy={centerY}
        r={radius}
        fill={item.bgHex || coinConfig.defaultBg}
        stroke="#374151"
        strokeWidth={2}
      />

      {/* Inner Decorative Circle Ring */}
      <circle
        cx={centerX}
        cy={centerY}
        r={radius - 4}
        fill="none"
        stroke="#6b7280"
        strokeWidth={1}
        strokeDasharray="4 2"
        opacity={0.6}
      />

      {/* Content Text ForeignObject */}
      <foreignObject x={2} y={2} width={item.width - 4} height={item.height - 4}>
        <div className="w-full h-full flex flex-col items-center justify-center text-center p-1 text-white overflow-hidden">
          {isBig ? (
            <MapPin size={16} className="text-amber-400 mb-0.5 shrink-0" />
          ) : (
            <User size={14} className="text-emerald-400 mb-0.5 shrink-0" />
          )}
          <span className="font-extrabold text-[10px] leading-tight line-clamp-2 px-1 text-gray-100">
            {item.title || coinConfig.defaultTitle}
          </span>
          {isBig && item.description && (
            <span className="text-[8px] text-gray-400 leading-none line-clamp-1 mt-0.5">
              {item.description}
            </span>
          )}
        </div>
      </foreignObject>

      {/* Frame Status Border if set */}
      {item.frameStatus !== 'NONE' && (
        <circle
          cx={centerX}
          cy={centerY}
          r={radius + 3}
          fill="none"
          stroke={frameConfig.color}
          strokeWidth={3}
          strokeDasharray={item.frameStatus === 'REALITY_LIMITS' ? '5 3' : 'none'}
        />
      )}

      {/* Selected Highlight Ring */}
      {isSelected && (
        <circle
          cx={centerX}
          cy={centerY}
          r={radius + 10}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={2}
          strokeDasharray="6 4"
          className="pointer-events-none animate-pulse"
        />
      )}

      {/* Connection Source Highlight */}
      {isConnectSource && (
        <circle
          cx={centerX}
          cy={centerY}
          r={radius + 12}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={3}
          className="pointer-events-none animate-pulse"
        />
      )}

      {/* Connection Target Candidate Hover Highlight */}
      {isConnectTargetCandidate && (
        <circle
          cx={centerX}
          cy={centerY}
          r={radius + 12}
          fill="none"
          stroke="#10b981"
          strokeWidth={3}
          strokeDasharray="4 3"
          className="pointer-events-none"
        />
      )}
    </g>
  );
};
