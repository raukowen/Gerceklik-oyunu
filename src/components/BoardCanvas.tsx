import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { BoardItem, BoardEdge } from '../types';
import { CardNode } from './CardNode';
import { CoinNode } from './CoinNode';
import { EdgeLine } from './EdgeLine';
import { isEditingTarget } from '../utils/projectData';
import { getItemCenter } from '../utils/geometry';
import { Plus, Minus, RotateCcw, Hand, MousePointer } from 'lucide-react';

interface BoardCanvasProps {
  items: BoardItem[];
  edges: BoardEdge[];
  selectedItemIds: string[];
  selectedEdgeId: string | null;
  connectSourceId: string | null;
  isConnectMode: boolean;
  isQuietHighlightMode?: boolean;
  onSelectItems: (ids: string[]) => void;
  onSelectItemToggle: (id: string) => void;
  onSelectEdge: (id: string | null) => void;
  onMoveEnd?: () => void;
  onMoveItem: (id: string, x: number, y: number) => void;
  onMoveMultipleItems: (deltas: { id: string; dx: number; dy: number }[]) => void;
  onCompleteConnect: (targetId: string) => void;
  onDeleteSelected: () => void;
  onDeleteEdge: (id: string) => void;
  keyboardEnabled?: boolean;
  onDoubleTouchOrClickItem?: (id: string) => void;
}

export const BoardCanvas: React.FC<BoardCanvasProps> = ({
  items,
  edges,
  selectedItemIds,
  selectedEdgeId,
  connectSourceId,
  isConnectMode,
  isQuietHighlightMode = false,
  onSelectItems,
  onSelectItemToggle,
  onSelectEdge,
  onMoveEnd,
  onMoveItem,
  onMoveMultipleItems,
  onCompleteConnect,
  onDeleteSelected,
  onDeleteEdge,
  keyboardEnabled = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeDrag = useRef(false);
  const lastTouch = useRef(0);
  const spacePressed = useRef(false);
  const itemById = useMemo(() => new Map(items.map(item => [item.id, item])), [items]);
  const connectedIds = useMemo(() => new Set(edges.flatMap(edge => [edge.fromId, edge.toId])), [edges]);
  const coins = useMemo(() => isQuietHighlightMode ? items.filter(item => item.type === 'COIN') : [], [items, isQuietHighlightMode]);

  // Pan & Zoom state
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [isPanMode, setIsPanMode] = useState<boolean>(false);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Dragging item state
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragItemStartPos, setDragItemStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Selection Box (Rubberband) state
  const [isSelectingBox, setIsSelectingBox] = useState<boolean>(false);
  const [boxStart, setBoxStart] = useState<{ x: number; y: number } | null>(null);
  const [boxCurrent, setBoxCurrent] = useState<{ x: number; y: number } | null>(null);

  // Touch Pinch Zoom state
  const [pinchDistance, setPinchDistance] = useState<number | null>(null);

  // Mouse hover coordinate for connecting arrow preview
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  // Convert screen coordinates to canvas world coordinates
  const screenToWorld = useCallback(
    (screenX: number, screenY: number) => {
      if (!containerRef.current) return { x: screenX, y: screenY };
      const rect = containerRef.current.getBoundingClientRect();
      const x = (screenX - rect.left - pan.x) / zoom;
      const y = (screenY - rect.top - pan.y) / zoom;
      return { x, y };
    },
    [pan, zoom]
  );

  // Handle Zoom controls
  const handleZoomIn = () => setZoom((z) => Math.min(z * 1.2, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z / 1.2, 0.3));
  const handleZoomReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // A non-passive listener prevents browser zoom/scroll during board gestures.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        setZoom(z => Math.min(Math.max(z * zoomFactor, 0.3), 3));
      } else {
        setPan(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
      }
    };
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  // Stage Pan or Rubberband Selection Mouse Down
  const handleStageMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 && e.button !== 1) return;
    if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).tagName === 'rect') {
      const world = screenToWorld(e.clientX, e.clientY);

      if (isPanMode || e.button === 1 || spacePressed.current) {
        e.preventDefault();
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      } else {
        // Rubberband box selection
        setIsSelectingBox(true);
        setBoxStart(world);
        setBoxCurrent(world);
        if (!e.shiftKey) {
          onSelectItems([]);
          onSelectEdge(null);
        }
      }
    }
  };

  // Stage Touch Start
  const handleStageTouchStart = (e: React.TouchEvent) => {
    lastTouch.current = Date.now();
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).tagName === 'rect') {
        if (isPanMode) {
          setIsPanning(true);
          setPanStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
        } else {
          const world = screenToWorld(touch.clientX, touch.clientY);
          setIsSelectingBox(true);
          setBoxStart(world);
          setBoxCurrent(world);
          onSelectItems([]);
          onSelectEdge(null);
        }
      }
    } else if (e.touches.length === 2) {
      handleMouseUp();
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      setPinchDistance(dist);
    }
  };

  // Item Mouse Down for Dragging
  const handleItemMouseDown = (item: BoardItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (Date.now() - lastTouch.current < 750 || (e.button !== 0 && e.button !== 1)) return;
    if (isPanMode || e.button === 1 || spacePressed.current) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    // If in connect mode, handle connect target click
    if (isConnectMode) {
      if (!selectedItemIds.includes(item.id) || (connectSourceId && connectSourceId !== item.id) || selectedItemIds.length <= 1) {
        onCompleteConnect(item.id);
        return;
      }
    }

    if (isPanMode) return;

    const isShift = e.shiftKey || e.metaKey;

    if (isShift) {
      onSelectItemToggle(item.id);
      return;
    }

    // If item is not in current multi-selection, select only this item
    let currentSelected = selectedItemIds;
    if (!selectedItemIds.includes(item.id)) {
      currentSelected = [item.id];
      onSelectItems(currentSelected);
    }
    onSelectEdge(null);

    const world = screenToWorld(e.clientX, e.clientY);
    activeDrag.current = true;
    setDraggingItemId(item.id);
    setDragStartPos(world);
    setDragItemStartPos({ x: item.x, y: item.y });
  };

  // Item Touch Start for Dragging
  const handleItemTouchStart = (item: BoardItem, e: React.TouchEvent) => {
    e.stopPropagation();
    lastTouch.current = Date.now();
    if (e.touches.length === 2) { handleStageTouchStart(e); return; }

    if (e.touches.length === 1) {
      const touch = e.touches[0];

      if (isConnectMode) {
        if (!selectedItemIds.includes(item.id) || (connectSourceId && connectSourceId !== item.id) || selectedItemIds.length <= 1) {
          onCompleteConnect(item.id);
          return;
        }
      }

      if (isPanMode) {
        setIsPanning(true);
        setPanStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
        return;
      }

      if (!selectedItemIds.includes(item.id)) {
        onSelectItems([item.id]);
      }
      onSelectEdge(null);

      const world = screenToWorld(touch.clientX, touch.clientY);
      activeDrag.current = true;
      setDraggingItemId(item.id);
      setDragStartPos(world);
      setDragItemStartPos({ x: item.x, y: item.y });
    }
  };

  // Mouse Move on Container
  const handleMouseMove = (e: React.MouseEvent) => {
    const world = screenToWorld(e.clientX, e.clientY);
    if (connectSourceId) setMousePos(world);

    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    } else if (isSelectingBox && boxStart) {
      setBoxCurrent(world);

      // Compute rubberband box bounds
      const minX = Math.min(boxStart.x, world.x);
      const maxX = Math.max(boxStart.x, world.x);
      const minY = Math.min(boxStart.y, world.y);
      const maxY = Math.max(boxStart.y, world.y);

      // Find all items intersecting selection box
      const enclosedIds = items
        .filter((item) => {
          const itemMaxX = item.x + item.width;
          const itemMaxY = item.y + item.height;
          return item.x < maxX && itemMaxX > minX && item.y < maxY && itemMaxY > minY;
        })
        .map((i) => i.id);

      onSelectItems(enclosedIds);
    } else if (draggingItemId) {
      const dx = Math.round(world.x - dragStartPos.x);
      const dy = Math.round(world.y - dragStartPos.y);

      if (selectedItemIds.length > 1 && selectedItemIds.includes(draggingItemId)) {
        // Multi-item move
        const deltas = selectedItemIds.map((id) => ({ id, dx, dy }));
        onMoveMultipleItems(deltas);
        setDragStartPos({ x: dragStartPos.x + dx, y: dragStartPos.y + dy });
      } else {
        // Single item move
        const newX = dragItemStartPos.x + dx;
        const newY = dragItemStartPos.y + dy;
        onMoveItem(draggingItemId, newX, newY);
      }
    }
  };

  // Touch Move on Container
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const world = screenToWorld(touch.clientX, touch.clientY);
      if (connectSourceId) setMousePos(world);

      if (isPanning) {
        setPan({
          x: touch.clientX - panStart.x,
          y: touch.clientY - panStart.y,
        });
      } else if (isSelectingBox && boxStart) {
        setBoxCurrent(world);

        const minX = Math.min(boxStart.x, world.x);
        const maxX = Math.max(boxStart.x, world.x);
        const minY = Math.min(boxStart.y, world.y);
        const maxY = Math.max(boxStart.y, world.y);

        const enclosedIds = items
          .filter((item) => {
            const itemMaxX = item.x + item.width;
            const itemMaxY = item.y + item.height;
            return item.x < maxX && itemMaxX > minX && item.y < maxY && itemMaxY > minY;
          })
          .map((i) => i.id);

        onSelectItems(enclosedIds);
      } else if (draggingItemId) {
        const dx = Math.round(world.x - dragStartPos.x);
        const dy = Math.round(world.y - dragStartPos.y);

        if (selectedItemIds.length > 1 && selectedItemIds.includes(draggingItemId)) {
          const deltas = selectedItemIds.map((id) => ({ id, dx, dy }));
          onMoveMultipleItems(deltas);
          setDragStartPos({ x: dragStartPos.x + dx, y: dragStartPos.y + dy });
        } else {
          const newX = dragItemStartPos.x + dx;
          const newY = dragItemStartPos.y + dy;
          onMoveItem(draggingItemId, newX, newY);
        }
      }
    } else if (e.touches.length === 2 && pinchDistance !== null) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const newDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      if (newDist > 0 && pinchDistance > 0) {
        const factor = newDist / pinchDistance;
        setZoom((z) => Math.min(Math.max(z * factor, 0.3), 3));
        setPinchDistance(newDist);
      }
    }
  };

  // Mouse / Touch End
  const handleMouseUp = () => {
    if (activeDrag.current) { activeDrag.current = false; onMoveEnd?.(); }
    setIsPanning(false);
    setDraggingItemId(null);
    setIsSelectingBox(false);
    setBoxStart(null);
    setBoxCurrent(null);
    setPinchDistance(null);
  };

  // End gestures even when the release happens outside the board or window.
  const finishGesture = useRef(handleMouseUp);
  finishGesture.current = handleMouseUp;
  useEffect(() => {
    const finish = () => { finishGesture.current(); };
    const blur = () => { spacePressed.current = false; finish(); };
    window.addEventListener('mouseup', finish);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('mouseup', finish);
      window.removeEventListener('blur', blur);
    };
  }, []);

  // Keep board shortcuts out of dialogs and editable controls.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!keyboardEnabled || e.defaultPrevented || isEditingTarget(e.target)) return;
      if (e.code === 'Space' && !(e.target instanceof Element && e.target.closest('button, [role="button"]'))) {
        spacePressed.current = true;
        e.preventDefault();
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onDeleteSelected();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => { if (e.code === 'Space') spacePressed.current = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onDeleteSelected, keyboardEnabled]);

  // Connect source item
  const connectSourceItem = itemById.get(connectSourceId);
  const connectSourceCenter = connectSourceItem ? getItemCenter(connectSourceItem) : null;

  return (
    <div
      ref={containerRef}
      onMouseDown={handleStageMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleStageTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
      onTouchCancel={handleMouseUp}
      style={{ touchAction: 'none' }}
      className={`relative w-full h-full overflow-hidden bg-[#050608] select-none ${
        isPanMode || isPanning ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
      }`}
    >
      {/* Dynamic Grid Background Pattern */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <pattern
            id="grid-dots"
            width={30 * zoom}
            height={30 * zoom}
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(${pan.x}, ${pan.y})`}
          >
            <circle cx={2 * zoom} cy={2 * zoom} r={1.5 * zoom} fill="#1f2937" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-dots)" />
      </svg>

      {/* Transformable Canvas Group */}
      <svg data-board="true" className="w-full h-full absolute inset-0 pointer-events-none">
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000000" floodOpacity="0.6" />
          </filter>
        </defs>

        <g
          transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
          className="pointer-events-auto"
        >
          {/* 1. EDGES LAYER */}
          <g>
            {edges.map((edge) => {
              const fromItem = itemById.get(edge.fromId);
              const toItem = itemById.get(edge.toId);
              if (!fromItem || !toItem) return null;

              return (
                <EdgeLine
                  key={edge.id}
                  edge={edge}
                  fromItem={fromItem}
                  toItem={toItem}
                  isSelected={edge.id === selectedEdgeId}
                  isQuietHighlightMode={isQuietHighlightMode}
                  onSelect={(e) => {
                    e.stopPropagation();
                    onSelectEdge(edge.id);
                    onSelectItems([]);
                  }}
                  onDelete={() => onDeleteEdge(edge.id)}
                />
              );
            })}
          </g>

          {/* CONNECT ARROW PREVIEW DYNAMIC LINE */}
          {connectSourceCenter && mousePos && (
            <g className="pointer-events-none">
              <line
                x1={connectSourceCenter.x}
                y1={connectSourceCenter.y}
                x2={mousePos.x}
                y2={mousePos.y}
                stroke="#3b82f6"
                strokeWidth={3}
                strokeDasharray="6 4"
                className="animate-pulse"
              />
              <circle cx={mousePos.x} cy={mousePos.y} r={6} fill="#3b82f6" />
            </g>
          )}

          {/* 2. CARDS & COINS ITEMS LAYER */}
          <g>
            {items.map((item) => {
              const isSelected = selectedItemIds.includes(item.id);
              const isConnectSource = item.id === connectSourceId || (isConnectMode && isSelected);
              const isCandidate = isConnectMode && !isConnectSource;

              if (item.type === 'CARD') {
                const hasCoinNear = isQuietHighlightMode && coins.some(
                  (coin) => Math.hypot(coin.x - item.x, coin.y - item.y) < 100
                );
                const hasConnectedEdge = connectedIds.has(item.id);
                const isCardClosed = item.frameStatus === 'CLOSED';
                const isQuietCard = !hasCoinNear && !hasConnectedEdge && !isCardClosed;

                return (
                  <CardNode
                    key={item.id}
                    item={item}
                    isSelected={isSelected}
                    isConnectSource={isConnectSource}
                    isConnectTargetCandidate={isCandidate}
                    isQuietHighlight={isQuietHighlightMode && isQuietCard}
                    onSelect={(e) => {
                      e.stopPropagation();
                      if (isConnectMode) {
                        onCompleteConnect(item.id);
                      } else {
                        if (e.shiftKey) {
                          onSelectItemToggle(item.id);
                        } else {
                          onSelectItems([item.id]);
                        }
                        onSelectEdge(null);
                      }
                    }}
                    onMouseDown={(e) => handleItemMouseDown(item, e)}
                    onTouchStart={(e) => handleItemTouchStart(item, e)}
                  />
                );
              } else {
                return (
                  <CoinNode
                    key={item.id}
                    item={item}
                    isSelected={isSelected}
                    isConnectSource={isConnectSource}
                    isConnectTargetCandidate={isCandidate}
                    onSelect={(e) => {
                      e.stopPropagation();
                      if (isConnectMode) {
                        onCompleteConnect(item.id);
                      } else {
                        if (e.shiftKey) {
                          onSelectItemToggle(item.id);
                        } else {
                          onSelectItems([item.id]);
                        }
                        onSelectEdge(null);
                      }
                    }}
                    onMouseDown={(e) => handleItemMouseDown(item, e)}
                    onTouchStart={(e) => handleItemTouchStart(item, e)}
                  />
                );
              }
            })}
          </g>

          {/* 3. RUBBERBAND SELECTION BOX OVERLAY */}
          {isSelectingBox && boxStart && boxCurrent && (
            <rect
              x={Math.min(boxStart.x, boxCurrent.x)}
              y={Math.min(boxStart.y, boxCurrent.y)}
              width={Math.abs(boxCurrent.x - boxStart.x)}
              height={Math.abs(boxCurrent.y - boxStart.y)}
              fill="rgba(59, 130, 246, 0.12)"
              stroke="#3b82f6"
              strokeWidth={1.5}
              strokeDasharray="4 2"
              rx={4}
              ry={4}
              className="pointer-events-none"
            />
          )}
        </g>
      </svg>

      {/* Floating Canvas Controls (Zoom & Pan) */}
      <div className="absolute bottom-5 left-5 z-20 flex items-center gap-1.5 p-1.5 bg-[#0a0c10]/90 backdrop-blur-md rounded-2xl border border-gray-800 shadow-2xl select-none">
        <button
          onClick={handleZoomIn}
          className="w-8 h-8 flex items-center justify-center bg-gray-900 hover:bg-gray-800 rounded-xl font-bold text-gray-200 border border-gray-800 transition-colors"
          title="Yakınlaştır (+)"
        >
          <Plus size={16} />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-8 h-8 flex items-center justify-center bg-gray-900 hover:bg-gray-800 rounded-xl font-bold text-gray-200 border border-gray-800 transition-colors"
          title="Uzaklaştır (-)"
        >
          <Minus size={16} />
        </button>
        <button
          onClick={handleZoomReset}
          className="px-2 h-8 flex items-center justify-center bg-gray-900 hover:bg-gray-800 rounded-xl font-black text-xs text-gray-300 border border-gray-800 transition-colors"
          title="Zoom & Konumu Sıfırla (%100)"
        >
          <RotateCcw size={13} className="mr-1 text-gray-400" />
          {Math.round(zoom * 100)}%
        </button>
        <div className="w-px h-5 bg-gray-800 mx-0.5" />
        <button
          onClick={() => setIsPanMode(!isPanMode)}
          className={`w-8 h-8 flex items-center justify-center rounded-xl font-bold transition-all border ${
            isPanMode
              ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_12px_rgba(37,99,235,0.4)]'
              : 'bg-gray-900 hover:bg-gray-800 text-gray-300 border-gray-800'
          }`}
          title="Masa Kaydırma Modu (Hand tool)"
        >
          {isPanMode ? <Hand size={16} /> : <MousePointer size={16} />}
        </button>
      </div>
    </div>
  );
};
