"use client";

import { useState, useCallback, useMemo } from "react";
import type { GameStateResponse, Symbol } from "@/lib/types";
import {
  buildBoard,
  getWinningLineClassic3,
  isPlayerTurn,
  isBoardFull,
} from "@/lib/game-logic";
import { makeMove } from "@/lib/api";

interface GameBoard3x3Props {
  gameState: GameStateResponse;
  playerId: string | null;
  onMoveComplete?: () => void;
}

interface OptimisticMove {
  row: number;
  col: number;
  symbol: Symbol;
}

export default function GameBoard3x3({
  gameState,
  playerId,
  onMoveComplete,
}: GameBoard3x3Props) {
  const [optimisticMove, setOptimisticMove] = useState<OptimisticMove | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [animatingCells, setAnimatingCells] = useState<Set<string>>(new Set());

  // Build board from game state
  const board = useMemo(() => {
    const builtBoard = buildBoard(
      "classic3",
      gameState.moves,
      gameState.players
    );

    // Apply optimistic move if exists
    if (optimisticMove && !isSubmitting) {
      builtBoard.cells[optimisticMove.row][optimisticMove.col] = {
        symbol: optimisticMove.symbol,
        player_number:
          gameState.players.find((p) => p.id === playerId)?.player_number ||
          null,
      };
    }

    return builtBoard;
  }, [
    gameState.moves,
    gameState.players,
    optimisticMove,
    isSubmitting,
    playerId,
  ]);

  // Get winning line if exists
  const winningLine = useMemo(() => {
    if (gameState.game.status !== "completed") return null;
    return getWinningLineClassic3(board);
  }, [board, gameState.game.status]);

  // Check if game is finished
  const isGameFinished =
    gameState.game.status === "completed" ||
    gameState.game.status === "abandoned";

  // Check if it's current player's turn
  const isMyTurn = playerId
    ? isPlayerTurn(playerId, gameState.game.current_turn, gameState.players)
    : false;

  // Check if game is a draw
  const isDraw =
    isGameFinished && !gameState.game.winner_id && isBoardFull(board);

  // Get player symbol
  const myPlayerNumber = useMemo(() => {
    return (
      gameState.players.find((p) => p.id === playerId)?.player_number || null
    );
  }, [gameState.players, playerId]);

  const mySymbol: Symbol =
    myPlayerNumber === 1 ? "X" : myPlayerNumber === 2 ? "O" : null;

  // Handle cell click
  const handleCellClick = useCallback(
    async (row: number, col: number) => {
      // Validate click
      if (
        !playerId ||
        !mySymbol ||
        isGameFinished ||
        !isMyTurn ||
        isSubmitting
      ) {
        return;
      }

      // Check if cell is occupied
      if (board.cells[row][col].symbol !== null) {
        return;
      }

      // Set optimistic move
      setOptimisticMove({ row, col, symbol: mySymbol });
      setIsSubmitting(true);

      // Add animation
      const cellKey = `${row}-${col}`;
      setAnimatingCells((prev) => new Set(prev).add(cellKey));

      try {
        // Make API call
        await makeMove({
          game_id: gameState.game.id,
          player_id: playerId,
          row_index: row,
          column_index: col,
        });

        // Success - clear optimistic state and trigger refetch
        setOptimisticMove(null);
        onMoveComplete?.();
      } catch (error) {
        // Rollback on error
        console.error("Failed to make move:", error);
        setOptimisticMove(null);

        // Show error feedback (could be enhanced with toast notification)
        alert(error instanceof Error ? error.message : "Failed to make move");
      } finally {
        setIsSubmitting(false);
        // Remove animation after delay
        setTimeout(() => {
          setAnimatingCells((prev) => {
            const newSet = new Set(prev);
            newSet.delete(cellKey);
            return newSet;
          });
        }, 500);
      }
    },
    [
      playerId,
      mySymbol,
      isGameFinished,
      isMyTurn,
      isSubmitting,
      board.cells,
      gameState.game.id,
      onMoveComplete,
    ]
  );

  // Check if cell should show hover effect
  const canInteract = !isGameFinished && isMyTurn && !isSubmitting;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Board container */}
      <div className="relative">
        {/* 3x3 Grid */}
        <div
          className="grid grid-cols-3 gap-2 p-4 bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-xl"
          style={{
            width: "min(90vw, 400px)",
            height: "min(90vw, 400px)",
          }}
        >
          {Array.from({ length: 3 }).map((_, row) =>
            Array.from({ length: 3 }).map((_, col) => {
              const cell = board.cells[row][col];
              const cellKey = `${row}-${col}`;
              const isAnimating = animatingCells.has(cellKey);
              const isEmpty = cell.symbol === null;
              const isWinningCell =
                winningLine?.positions.some(
                  ([r, c]) => r === row && c === col
                ) || false;

              return (
                <button
                  key={cellKey}
                  onClick={() => handleCellClick(row, col)}
                  disabled={!canInteract || !isEmpty}
                  className={`
                    relative aspect-square rounded-lg flex items-center justify-center
                    transition-all duration-200 text-5xl font-bold
                    ${isEmpty && canInteract ? "bg-slate-800/50 hover:bg-slate-700/70 hover:scale-105 cursor-pointer" : ""}
                    ${isEmpty && !canInteract ? "bg-slate-800/30 cursor-not-allowed" : ""}
                    ${!isEmpty ? "bg-slate-800/70" : ""}
                    ${isWinningCell ? "bg-cosmic-600/30" : ""}
                    ${isAnimating ? "animate-scale-fade" : ""}
                  `}
                  aria-label={`Cell ${row}-${col}`}
                >
                  {cell.symbol && (
                    <span
                      className={`
                        ${cell.player_number === 1 ? "text-cosmic-400 drop-shadow-glow-cosmic" : "text-nebula-400 drop-shadow-glow-nebula"}
                        ${isWinningCell ? "animate-pulse-glow" : ""}
                        transition-all duration-300
                      `}
                    >
                      {cell.symbol}
                    </span>
                  )}
                  {isEmpty && canInteract && (
                    <span className="absolute inset-0 flex items-center justify-center text-slate-600 opacity-0 hover:opacity-30 transition-opacity duration-200">
                      {mySymbol}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Winning line overlay */}
        {winningLine && (
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{
              width: "100%",
              height: "100%",
            }}
          >
            <WinningLineSVG winningLine={winningLine} />
          </svg>
        )}
      </div>

      {/* Status display */}
      <div className="text-center">
        {isDraw && (
          <div className="text-2xl font-bold text-galaxy-400 drop-shadow-glow-galaxy">
            It&apos;s a Draw! 🤝
          </div>
        )}
        {isGameFinished && !isDraw && gameState.game.winner_id && (
          <div className="text-2xl font-bold">
            {gameState.game.winner_id === playerId ? (
              <span className="text-cosmic-400 drop-shadow-glow-cosmic">
                You Won! 🎉
              </span>
            ) : (
              <span className="text-nebula-400 drop-shadow-glow-nebula">
                You Lost 😔
              </span>
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

// Component to render winning line SVG
interface WinningLineSVGProps {
  winningLine: NonNullable<ReturnType<typeof getWinningLineClassic3>>;
}

function WinningLineSVG({ winningLine }: WinningLineSVGProps) {
  const { type } = winningLine;

  // Calculate line coordinates based on type
  const getLineCoordinates = () => {
    // For simplicity, use percentages
    const paddingPercent = 4; // approximate

    switch (type) {
      case "row-0":
        return {
          x1: 10,
          y1: 16.66 + paddingPercent,
          x2: 90,
          y2: 16.66 + paddingPercent,
        };
      case "row-1":
        return { x1: 10, y1: 50, x2: 90, y2: 50 };
      case "row-2":
        return {
          x1: 10,
          y1: 83.34 - paddingPercent,
          x2: 90,
          y2: 83.34 - paddingPercent,
        };
      case "col-0":
        return {
          x1: 16.66 + paddingPercent,
          y1: 10,
          x2: 16.66 + paddingPercent,
          y2: 90,
        };
      case "col-1":
        return { x1: 50, y1: 10, x2: 50, y2: 90 };
      case "col-2":
        return {
          x1: 83.34 - paddingPercent,
          y1: 10,
          x2: 83.34 - paddingPercent,
          y2: 90,
        };
      case "diag-main":
        return { x1: 15, y1: 15, x2: 85, y2: 85 };
      case "diag-anti":
        return { x1: 85, y1: 15, x2: 15, y2: 85 };
      default:
        return { x1: 0, y1: 0, x2: 0, y2: 0 };
    }
  };

  const coords = getLineCoordinates();

  return (
    <line
      x1={`${coords.x1}%`}
      y1={`${coords.y1}%`}
      x2={`${coords.x2}%`}
      y2={`${coords.y2}%`}
      stroke="url(#cosmicGradient)"
      strokeWidth="4"
      strokeLinecap="round"
      className="animate-draw-line"
    >
      <defs>
        <linearGradient id="cosmicGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#a855f7" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#764ba2" stopOpacity="0.8" />
        </linearGradient>
      </defs>
    </line>
  );
}
