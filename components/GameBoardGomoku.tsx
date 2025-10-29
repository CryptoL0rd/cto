'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { GameStateResponse, Symbol, Move } from '@/lib/types';
import { isPlayerTurn } from '@/lib/game-logic';
import { makeMove } from '@/lib/api';

interface GameBoardGomokuProps {
  gameState: GameStateResponse;
  playerId: string | null;
  onMoveComplete?: () => void;
}

interface OptimisticMove {
  row: number;
  col: number;
  symbol: Symbol;
}

interface Viewport {
  centerX: number;
  centerY: number;
  cellSize: number;
}

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
}

const CELL_SIZE = 40;
const VISIBLE_RANGE = 20;

export default function GameBoardGomoku({
  gameState,
  playerId,
  onMoveComplete,
}: GameBoardGomokuProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const dragStateRef = useRef<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
  });

  const [viewport, setViewport] = useState<Viewport>({
    centerX: 0,
    centerY: 0,
    cellSize: CELL_SIZE,
  });
  const [optimisticMove, setOptimisticMove] = useState<OptimisticMove | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{
    row: number;
    col: number;
  } | null>(null);

  const isGameFinished =
    gameState.game.status === 'completed' || gameState.game.status === 'abandoned';
  const isMyTurn = playerId
    ? isPlayerTurn(playerId, gameState.game.current_turn, gameState.players)
    : false;
  const canInteract = !isGameFinished && isMyTurn && !isSubmitting;

  const myPlayerNumber = useMemo(() => {
    return gameState.players.find((p) => p.id === playerId)?.player_number || null;
  }, [gameState.players, playerId]);

  const mySymbol: Symbol = myPlayerNumber === 1 ? 'X' : myPlayerNumber === 2 ? 'O' : null;

  const movesMap = useMemo(() => {
    const map = new Map<string, Move>();
    gameState.moves.forEach((move) => {
      map.set(`${move.row_index},${move.column_index}`, move);
    });
    return map;
  }, [gameState.moves]);

  const lastMove = useMemo(() => {
    if (gameState.moves.length === 0) return null;
    return gameState.moves[gameState.moves.length - 1];
  }, [gameState.moves]);

  const getActiveRegionCenter = useCallback(() => {
    if (gameState.moves.length === 0) return { x: 0, y: 0 };

    let minRow = Infinity;
    let maxRow = -Infinity;
    let minCol = Infinity;
    let maxCol = -Infinity;

    gameState.moves.forEach((move) => {
      minRow = Math.min(minRow, move.row_index);
      maxRow = Math.max(maxRow, move.row_index);
      minCol = Math.min(minCol, move.column_index);
      maxCol = Math.max(maxCol, move.column_index);
    });

    return {
      x: Math.floor((minCol + maxCol) / 2),
      y: Math.floor((minRow + maxRow) / 2),
    };
  }, [gameState.moves]);

  useEffect(() => {
    const center = getActiveRegionCenter();
    setViewport((prev) => ({
      ...prev,
      centerX: center.x,
      centerY: center.y,
    }));
  }, [getActiveRegionCenter]);

  const screenToBoard = useCallback(
    (screenX: number, screenY: number): { row: number; col: number } => {
      const canvas = canvasRef.current;
      if (!canvas) return { row: 0, col: 0 };

      const rect = canvas.getBoundingClientRect();
      const canvasCenterX = rect.width / 2;
      const canvasCenterY = rect.height / 2;

      const offsetX = screenX - canvasCenterX;
      const offsetY = screenY - canvasCenterY;

      const col = Math.round(viewport.centerX + offsetX / viewport.cellSize);
      const row = Math.round(viewport.centerY + offsetY / viewport.cellSize);

      return { row, col };
    },
    [viewport]
  );

  const getVisibleBounds = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return {
        minRow: viewport.centerY - VISIBLE_RANGE,
        maxRow: viewport.centerY + VISIBLE_RANGE,
        minCol: viewport.centerX - VISIBLE_RANGE,
        maxCol: viewport.centerX + VISIBLE_RANGE,
      };
    }

    const visibleCols = Math.ceil(canvas.width / viewport.cellSize / 2) + VISIBLE_RANGE;
    const visibleRows = Math.ceil(canvas.height / viewport.cellSize / 2) + VISIBLE_RANGE;

    return {
      minRow: Math.floor(viewport.centerY - visibleRows),
      maxRow: Math.ceil(viewport.centerY + visibleRows),
      minCol: Math.floor(viewport.centerX - visibleCols),
      maxCol: Math.ceil(viewport.centerX + visibleCols),
    };
  }, [viewport]);

  const drawBoard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const canvasCenterX = rect.width / 2;
    const canvasCenterY = rect.height / 2;

    ctx.clearRect(0, 0, rect.width, rect.height);

    const bounds = getVisibleBounds();

    ctx.strokeStyle = 'rgba(71, 85, 105, 0.3)';
    ctx.lineWidth = 1;

    for (let row = bounds.minRow; row <= bounds.maxRow; row++) {
      const y = canvasCenterY + (row - viewport.centerY) * viewport.cellSize;
      if (y >= -viewport.cellSize && y <= rect.height + viewport.cellSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(rect.width, y);
        ctx.stroke();
      }
    }

    for (let col = bounds.minCol; col <= bounds.maxCol; col++) {
      const x = canvasCenterX + (col - viewport.centerX) * viewport.cellSize;
      if (x >= -viewport.cellSize && x <= rect.width + viewport.cellSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, rect.height);
        ctx.stroke();
      }
    }

    ctx.font = '10px monospace';
    ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const labelStep = Math.max(1, Math.floor(10 / (viewport.cellSize / CELL_SIZE)));
    for (let row = bounds.minRow; row <= bounds.maxRow; row += labelStep) {
      const y = canvasCenterY + (row - viewport.centerY) * viewport.cellSize;
      if (y >= 0 && y <= rect.height) {
        ctx.fillText(row.toString(), 20, y);
      }
    }

    for (let col = bounds.minCol; col <= bounds.maxCol; col += labelStep) {
      const x = canvasCenterX + (col - viewport.centerX) * viewport.cellSize;
      if (x >= 0 && x <= rect.width) {
        ctx.fillText(col.toString(), x, 20);
      }
    }

    const playerMap = new Map(gameState.players.map((p) => [p.id, p]));

    movesMap.forEach((move) => {
      const player = playerMap.get(move.player_id);
      if (!player) return;

      const x = canvasCenterX + (move.column_index - viewport.centerX) * viewport.cellSize;
      const y = canvasCenterY + (move.row_index - viewport.centerY) * viewport.cellSize;

      if (
        x >= -viewport.cellSize &&
        x <= rect.width + viewport.cellSize &&
        y >= -viewport.cellSize &&
        y <= rect.height + viewport.cellSize
      ) {
        const symbol = player.player_number === 1 ? 'X' : 'O';
        const isLast = lastMove && move.id === lastMove.id;

        ctx.save();

        if (isLast) {
          ctx.fillStyle =
            player.player_number === 1 ? 'rgba(102, 126, 234, 0.3)' : 'rgba(244, 63, 94, 0.3)';
          ctx.beginPath();
          ctx.arc(x, y, viewport.cellSize * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.font = `bold ${viewport.cellSize * 0.5}px sans-serif`;
        ctx.fillStyle = player.player_number === 1 ? '#667eea' : '#f43f5e';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(symbol, x, y);

        ctx.restore();
      }
    });

    if (optimisticMove && !isSubmitting) {
      const x = canvasCenterX + (optimisticMove.col - viewport.centerX) * viewport.cellSize;
      const y = canvasCenterY + (optimisticMove.row - viewport.centerY) * viewport.cellSize;

      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.font = `bold ${viewport.cellSize * 0.5}px sans-serif`;
      ctx.fillStyle = myPlayerNumber === 1 ? '#667eea' : '#f43f5e';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(optimisticMove.symbol || '', x, y);
      ctx.restore();
    }

    if (hoveredCell && canInteract) {
      const x = canvasCenterX + (hoveredCell.col - viewport.centerX) * viewport.cellSize;
      const y = canvasCenterY + (hoveredCell.row - viewport.centerY) * viewport.cellSize;

      const key = `${hoveredCell.row},${hoveredCell.col}`;
      if (
        !movesMap.has(key) &&
        (!optimisticMove ||
          optimisticMove.row !== hoveredCell.row ||
          optimisticMove.col !== hoveredCell.col)
      ) {
        ctx.save();
        ctx.fillStyle = 'rgba(102, 126, 234, 0.15)';
        ctx.beginPath();
        ctx.arc(x, y, viewport.cellSize * 0.35, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 0.3;
        ctx.font = `bold ${viewport.cellSize * 0.4}px sans-serif`;
        ctx.fillStyle = myPlayerNumber === 1 ? '#667eea' : '#f43f5e';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(mySymbol || '', x, y);
        ctx.restore();
      }
    }
  }, [
    viewport,
    movesMap,
    lastMove,
    optimisticMove,
    isSubmitting,
    hoveredCell,
    canInteract,
    gameState.players,
    mySymbol,
    myPlayerNumber,
    getVisibleBounds,
  ]);

  useEffect(() => {
    drawBoard();
  }, [drawBoard]);

  useEffect(() => {
    const handleResize = () => {
      drawBoard();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawBoard]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    dragStateRef.current = {
      isDragging: true,
      startX: e.clientX - rect.left,
      startY: e.clientY - rect.top,
      lastX: e.clientX - rect.left,
      lastY: e.clientY - rect.top,
    };
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (dragStateRef.current.isDragging) {
        const deltaX = mouseX - dragStateRef.current.lastX;
        const deltaY = mouseY - dragStateRef.current.lastY;

        dragStateRef.current.lastX = mouseX;
        dragStateRef.current.lastY = mouseY;

        const moved = Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2;

        if (moved) {
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
          }

          animationFrameRef.current = requestAnimationFrame(() => {
            setViewport((prev) => ({
              ...prev,
              centerX: prev.centerX - deltaX / prev.cellSize,
              centerY: prev.centerY - deltaY / prev.cellSize,
            }));
          });
        }
      } else {
        const cell = screenToBoard(mouseX, mouseY);
        setHoveredCell(cell);
      }
    },
    [screenToBoard]
  );

  const handleMouseUp = useCallback(() => {
    dragStateRef.current.isDragging = false;
  }, []);

  const handleMouseLeave = useCallback(() => {
    dragStateRef.current.isDragging = false;
    setHoveredCell(null);
  }, []);

  const handleClick = useCallback(
    async (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const startDist = Math.sqrt(
        Math.pow(mouseX - dragStateRef.current.startX, 2) +
          Math.pow(mouseY - dragStateRef.current.startY, 2)
      );

      if (startDist > 5) return;

      if (!playerId || !mySymbol || !canInteract) return;

      const { row, col } = screenToBoard(mouseX, mouseY);
      const key = `${row},${col}`;

      if (movesMap.has(key)) return;

      setOptimisticMove({ row, col, symbol: mySymbol });
      setIsSubmitting(true);

      try {
        await makeMove({
          game_id: gameState.game.id,
          player_id: playerId,
          row_index: row,
          column_index: col,
        });

        setOptimisticMove(null);
        onMoveComplete?.();
      } catch (error) {
        console.error('Failed to make move:', error);
        setOptimisticMove(null);
        alert(error instanceof Error ? error.message : 'Failed to make move');
      } finally {
        setIsSubmitting(false);
      }
    },
    [playerId, mySymbol, canInteract, screenToBoard, movesMap, gameState.game.id, onMoveComplete]
  );

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length !== 1) return;
    e.preventDefault();

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const touch = e.touches[0];
    dragStateRef.current = {
      isDragging: true,
      startX: touch.clientX - rect.left,
      startY: touch.clientY - rect.top,
      lastX: touch.clientX - rect.left,
      lastY: touch.clientY - rect.top,
    };
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length !== 1) return;
    e.preventDefault();

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const touch = e.touches[0];
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;

    if (dragStateRef.current.isDragging) {
      const deltaX = touchX - dragStateRef.current.lastX;
      const deltaY = touchY - dragStateRef.current.lastY;

      dragStateRef.current.lastX = touchX;
      dragStateRef.current.lastY = touchY;

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        setViewport((prev) => ({
          ...prev,
          centerX: prev.centerX - deltaX / prev.cellSize,
          centerY: prev.centerY - deltaY / prev.cellSize,
        }));
      });
    }
  }, []);

  const handleTouchEnd = useCallback(
    async (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const touch = e.changedTouches[0];
      const touchX = touch.clientX - rect.left;
      const touchY = touch.clientY - rect.top;

      const startDist = Math.sqrt(
        Math.pow(touchX - dragStateRef.current.startX, 2) +
          Math.pow(touchY - dragStateRef.current.startY, 2)
      );

      dragStateRef.current.isDragging = false;

      if (startDist > 10) return;

      if (!playerId || !mySymbol || !canInteract) return;

      const { row, col } = screenToBoard(touchX, touchY);
      const key = `${row},${col}`;

      if (movesMap.has(key)) return;

      setOptimisticMove({ row, col, symbol: mySymbol });
      setIsSubmitting(true);

      try {
        await makeMove({
          game_id: gameState.game.id,
          player_id: playerId,
          row_index: row,
          column_index: col,
        });

        setOptimisticMove(null);
        onMoveComplete?.();
      } catch (error) {
        console.error('Failed to make move:', error);
        setOptimisticMove(null);
        alert(error instanceof Error ? error.message : 'Failed to make move');
      } finally {
        setIsSubmitting(false);
      }
    },
    [playerId, mySymbol, canInteract, screenToBoard, movesMap, gameState.game.id, onMoveComplete]
  );

  const isDraw = isGameFinished && !gameState.game.winner_id;

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div ref={containerRef} className="relative w-full" style={{ height: 'min(80vh, 600px)' }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-xl cursor-move touch-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
        <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-700/50 text-sm text-slate-300">
          <div>
            Center: ({Math.round(viewport.centerX)}, {Math.round(viewport.centerY)})
          </div>
          <div>Moves: {gameState.moves.length}</div>
        </div>
      </div>

      <div className="text-center">
        {isDraw && (
          <div className="text-2xl font-bold text-galaxy-400 drop-shadow-glow-galaxy">
            It&apos;s a Draw! 🤝
          </div>
        )}
        {isGameFinished && !isDraw && gameState.game.winner_id && (
          <div className="text-2xl font-bold">
            {gameState.game.winner_id === playerId ? (
              <span className="text-cosmic-400 drop-shadow-glow-cosmic">You Won! 🎉</span>
            ) : (
              <span className="text-nebula-400 drop-shadow-glow-nebula">You Lost 😔</span>
            )}
          </div>
        )}
        {!isGameFinished && (
          <div className="text-lg">
            {isMyTurn ? (
              <span className="text-cosmic-400 drop-shadow-glow-cosmic font-semibold">
                Your Turn ({mySymbol})
              </span>
            ) : (
              <span className="text-slate-400">Waiting for opponent...</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
