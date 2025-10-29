"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card, {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import Modal, {
  ModalHeader,
  ModalTitle,
  ModalContent,
  ModalFooter,
} from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { createGame, joinGame } from "@/lib/api";
import { useLocalPlayer } from "@/lib/hooks";
import type { GameMode } from "@/lib/types";

export default function Home() {
  const router = useRouter();
  const { showToast } = useToast();
  const { savePlayerId } = useLocalPlayer();

  // Create game modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Join game form state
  const [inviteCode, setInviteCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [inviteCodeError, setInviteCodeError] = useState("");

  const handleCreateGame = async (mode: GameMode) => {
    setIsCreating(true);

    try {
      const response = await createGame({
        player_name: "Player",
        mode,
        is_ai_opponent: false,
      });

      // Save player ID to localStorage
      savePlayerId(response.player_id);

      // Save invite code to localStorage for display on game page
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(
            `invite_code_${response.game.id}`,
            response.invite_code
          );
        } catch (err) {
          console.error("Failed to save invite code:", err);
        }
      }

      // Show success message
      showToast("Game created successfully!", "success");

      // Redirect to game page
      router.push(`/game/${response.game.id}`);
    } catch (error) {
      console.error("Failed to create game:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to create game",
        "error"
      );
      setIsCreating(false);
      setIsCreateModalOpen(false);
    }
  };

  const validateInviteCode = (code: string): string | null => {
    if (!code) {
      return "Invite code is required";
    }

    // Remove any spaces and convert to uppercase
    const cleanCode = code.replace(/\s/g, "").toUpperCase();

    // Basic validation - should have format like ABC-1234 or similar
    // At minimum, it should have some alphanumeric characters
    if (cleanCode.length < 3) {
      return "Invite code is too short";
    }

    if (!/^[A-Z0-9-]+$/.test(cleanCode)) {
      return "Invite code can only contain letters, numbers, and hyphens";
    }

    return null;
  };

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate invite code
    const error = validateInviteCode(inviteCode);
    if (error) {
      setInviteCodeError(error);
      return;
    }

    setIsJoining(true);
    setInviteCodeError("");

    try {
      // Clean and uppercase the invite code
      const cleanCode = inviteCode.replace(/\s/g, "").toUpperCase();

      const response = await joinGame({
        invite_code: cleanCode,
        player_name: "Player",
      });

      // Save player ID to localStorage
      savePlayerId(response.player.id);

      // Show success message
      showToast("Joined game successfully!", "success");

      // Redirect to game page
      router.push(`/game/${response.game_id}`);
    } catch (error) {
      console.error("Failed to join game:", error);

      // Handle specific error cases
      let errorMessage = "Failed to join game";

      if (error instanceof Error) {
        const message = error.message.toLowerCase();

        if (
          message.includes("not found") ||
          message.includes("invalid") ||
          message.includes("does not exist")
        ) {
          errorMessage = "Invalid invite code. Please check and try again.";
        } else if (
          message.includes("full") ||
          message.includes("already has")
        ) {
          errorMessage = "This game is full. Please try another invite code.";
        } else if (message.includes("already started")) {
          errorMessage = "This game has already started.";
        } else {
          errorMessage = error.message;
        }
      }

      setInviteCodeError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setIsJoining(false);
    }
  };

  const handleInviteCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Convert to uppercase as user types
    const value = e.target.value.toUpperCase();
    setInviteCode(value);

    // Clear error when user starts typing
    if (inviteCodeError) {
      setInviteCodeError("");
    }
  };

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text animate-float">
              Cosmic Tic-Tac-Toe
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto">
              Challenge your friends in classic 3×3 or test your skills in
              Gomoku 5-in-a-row. The cosmic battlefield awaits!
            </p>
          </div>

          {/* Main Actions */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Create Game Card */}
            <Card hoverable glowOnHover>
              <CardHeader>
                <CardTitle>Create New Game</CardTitle>
                <CardDescription>
                  Start a new game and invite your friends to join
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  Create Game
                </Button>
              </CardContent>
            </Card>

            {/* Join Game Card */}
            <Card hoverable glowOnHover>
              <CardHeader>
                <CardTitle>Join Game</CardTitle>
                <CardDescription>
                  Enter an invite code to join an existing game
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleJoinGame} className="space-y-4">
                  <Input
                    label="Invite Code"
                    placeholder="ABC-1234-XYZ"
                    value={inviteCode}
                    onChange={handleInviteCodeChange}
                    error={inviteCodeError}
                    disabled={isJoining}
                    helperText="Enter the code shared by your friend"
                  />
                  <Button
                    type="submit"
                    variant="secondary"
                    size="lg"
                    className="w-full"
                    disabled={isJoining || !inviteCode}
                  >
                    {isJoining ? "Joining..." : "Join Game"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Game Modes Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-cosmic-400">Classic 3×3</CardTitle>
                <CardDescription>
                  The timeless tic-tac-toe experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-start">
                    <span className="text-cosmic-400 mr-2">✦</span>
                    <span>3×3 grid for quick matches</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-cosmic-400 mr-2">✦</span>
                    <span>Get three in a row to win</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-cosmic-400 mr-2">✦</span>
                    <span>Perfect for casual play</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-galaxy-400">Gomoku 5×5</CardTitle>
                <CardDescription>
                  A strategic twist on the classic
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-start">
                    <span className="text-galaxy-400 mr-2">✦</span>
                    <span>Larger board for deeper strategy</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-galaxy-400 mr-2">✦</span>
                    <span>Get five in a row to win</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-galaxy-400 mr-2">✦</span>
                    <span>More challenging gameplay</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Create Game Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => !isCreating && setIsCreateModalOpen(false)}
      >
        <ModalHeader>
          <ModalTitle>Choose Game Mode</ModalTitle>
        </ModalHeader>
        <ModalContent>
          <p className="text-slate-300 mb-6">
            Select the game mode you&apos;d like to play:
          </p>
          <div className="space-y-3">
            <button
              onClick={() => handleCreateGame("classic3")}
              disabled={isCreating}
              className="w-full p-4 rounded-lg bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-cosmic-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h4 className="text-lg font-semibold text-cosmic-400 group-hover:text-cosmic-300">
                    Classic 3×3
                  </h4>
                  <p className="text-sm text-slate-400">
                    Traditional tic-tac-toe
                  </p>
                </div>
                <svg
                  className="w-6 h-6 text-cosmic-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>

            <button
              onClick={() => handleCreateGame("gomoku")}
              disabled={isCreating}
              className="w-full p-4 rounded-lg bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-galaxy-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h4 className="text-lg font-semibold text-galaxy-400 group-hover:text-galaxy-300">
                    Gomoku 5-in-a-row
                  </h4>
                  <p className="text-sm text-slate-400">
                    Strategic five-in-a-row
                  </p>
                </div>
                <svg
                  className="w-6 h-6 text-galaxy-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>
          </div>
        </ModalContent>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setIsCreateModalOpen(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
