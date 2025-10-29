#!/usr/bin/env python3
"""
Database initialization script.

Reads schema from api/_shared/schema.sql and applies it to the configured database.
"""
import os
import sqlite3
from pathlib import Path


def init_database():
    db_path = os.getenv("DATABASE_PATH", "./data/app.db")
    schema_path = Path(__file__).parent.parent / "api" / "_shared" / "schema.sql"

    db_dir = Path(db_path).parent
    db_dir.mkdir(parents=True, exist_ok=True)

    print(f"Initializing database at {db_path}...")

    if not schema_path.exists():
        print(f"Schema file not found at {schema_path}")
        return

    with open(schema_path, "r", encoding="utf-8") as f:
        schema_sql = f.read()

    conn = sqlite3.connect(db_path)
    try:
        conn.executescript(schema_sql)
        conn.commit()
        print("Database initialized successfully!")
    except Exception as e:
        print(f"Error initializing database: {e}")
    finally:
        conn.close()


if __name__ == "__main__":
    init_database()
