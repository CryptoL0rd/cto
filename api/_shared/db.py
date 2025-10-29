import sqlite3
import os
from contextlib import contextmanager
from pathlib import Path
from typing import Generator

DB_PATH = os.getenv("DB_PATH", "/tmp/game.db")


@contextmanager
def get_db() -> Generator[sqlite3.Connection, None, None]:
    """
    Context manager for SQLite database connections.
    Suitable for serverless use - opens connection, yields it, then closes.
    Automatically commits on success, rolls back on exception.
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def get_db_path() -> str:
    """Get the configured database path."""
    return DB_PATH


def set_db_path(path: str) -> None:
    """Set the database path (useful for testing)."""
    global DB_PATH
    DB_PATH = path
