-- Games table
CREATE TABLE IF NOT EXISTS games (
    id TEXT PRIMARY KEY,
    status TEXT NOT NULL CHECK(status IN ('waiting', 'active', 'completed', 'abandoned')),
    created_at TEXT NOT NULL,
    started_at TEXT,
    finished_at TEXT,
    current_turn INTEGER,
    winner_id TEXT,
    FOREIGN KEY (winner_id) REFERENCES players(id)
);

-- Players table
CREATE TABLE IF NOT EXISTS players (
    id TEXT PRIMARY KEY,
    game_id TEXT NOT NULL,
    player_number INTEGER NOT NULL CHECK(player_number IN (1, 2)),
    player_name TEXT NOT NULL,
    joined_at TEXT NOT NULL,
    is_ai INTEGER NOT NULL DEFAULT 0 CHECK(is_ai IN (0, 1)),
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    UNIQUE(game_id, player_number)
);

-- Moves table
CREATE TABLE IF NOT EXISTS moves (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id TEXT NOT NULL,
    player_id TEXT NOT NULL,
    move_number INTEGER NOT NULL,
    column_index INTEGER NOT NULL CHECK(column_index >= 0 AND column_index < 7),
    row_index INTEGER NOT NULL CHECK(row_index >= 0 AND row_index < 6),
    created_at TEXT NOT NULL,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    UNIQUE(game_id, move_number)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id TEXT NOT NULL,
    player_id TEXT,
    message_type TEXT NOT NULL CHECK(message_type IN ('chat', 'system')),
    content TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE SET NULL
);

-- Indices for common queries
CREATE INDEX IF NOT EXISTS idx_players_game_id ON players(game_id);
CREATE INDEX IF NOT EXISTS idx_moves_game_id ON moves(game_id);
CREATE INDEX IF NOT EXISTS idx_moves_player_id ON moves(player_id);
CREATE INDEX IF NOT EXISTS idx_messages_game_id ON messages(game_id);
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_moves_game_move_number ON moves(game_id, move_number);
