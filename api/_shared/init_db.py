#!/usr/bin/env python3
"""
Database initialization script.
Creates tables from schema.sql and optionally seeds test data.
"""
import sqlite3
import os
import sys
from pathlib import Path
from datetime import datetime
import uuid


def init_database(db_path: str = None, seed: bool = False) -> None:
    """
    Initialize the database with schema and optionally seed data.
    
    Args:
        db_path: Path to the database file. If None, uses DB_PATH env var or default.
        seed: If True, add sample data for testing.
    """
    if db_path is None:
        db_path = os.getenv("DB_PATH", "/tmp/game.db")
    
    # Ensure parent directory exists
    db_dir = Path(db_path).parent
    db_dir.mkdir(parents=True, exist_ok=True)
    
    # Read schema file
    schema_path = Path(__file__).parent / "schema.sql"
    if not schema_path.exists():
        print(f"Error: Schema file not found at {schema_path}", file=sys.stderr)
        sys.exit(1)
    
    with open(schema_path, "r") as f:
        schema_sql = f.read()
    
    # Create/update database
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA foreign_keys = ON")
    
    try:
        conn.executescript(schema_sql)
        conn.commit()
        print(f"✓ Database initialized at {db_path}")
        
        if seed:
            seed_data(conn)
            conn.commit()
            print("✓ Sample data seeded")
            
    except Exception as e:
        conn.rollback()
        print(f"Error initializing database: {e}", file=sys.stderr)
        sys.exit(1)
    finally:
        conn.close()


def seed_data(conn: sqlite3.Connection) -> None:
    """Add sample data to the database for testing."""
    now = datetime.now().isoformat()
    
    # Create a sample game
    game_id = str(uuid.uuid4())
    conn.execute(
        "INSERT INTO games (id, status, created_at) VALUES (?, ?, ?)",
        (game_id, "waiting", now)
    )
    
    # Create a sample player
    player_id = str(uuid.uuid4())
    conn.execute(
        "INSERT INTO players (id, game_id, player_number, player_name, joined_at, is_ai) VALUES (?, ?, ?, ?, ?, ?)",
        (player_id, game_id, 1, "Test Player", now, 0)
    )
    
    # Create a sample system message
    conn.execute(
        "INSERT INTO messages (game_id, player_id, message_type, content, created_at) VALUES (?, ?, ?, ?, ?)",
        (game_id, None, "system", "Game created", now)
    )


def main():
    """CLI entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Initialize game database")
    parser.add_argument(
        "--db-path",
        type=str,
        help="Path to database file (default: DB_PATH env var or /tmp/game.db)"
    )
    parser.add_argument(
        "--seed",
        action="store_true",
        help="Seed database with sample data"
    )
    
    args = parser.parse_args()
    init_database(db_path=args.db_path, seed=args.seed)


if __name__ == "__main__":
    main()
