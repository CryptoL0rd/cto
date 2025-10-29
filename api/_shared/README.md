# Backend Shared Utilities

This directory contains shared backend utilities for the game API.

## Files

### schema.sql
SQLite database schema defining four main tables:
- **games**: Game state and metadata
- **players**: Player information linked to games
- **moves**: Move history with column/row positions
- **messages**: Chat and system messages

Includes foreign key constraints, check constraints, and indices for optimal query performance.

### db.py
Database connection management with a context manager pattern suitable for serverless environments:
- `get_db()`: Context manager that automatically commits on success, rolls back on exception, and closes connections
- Foreign keys are automatically enabled
- Row factory set to sqlite3.Row for dict-like access

### init_db.py
CLI script for database initialization:
```bash
python api/_shared/init_db.py --db-path /path/to/db.db --seed
```
- Creates all tables from schema.sql
- Optional `--seed` flag to populate with sample data
- Configurable via DB_PATH environment variable

### models.py
Pydantic models for request/response validation:
- **CreateGameRequest**: Create new game
- **GameResponse**: Game information
- **JoinGameRequest**: Join existing game
- **PlayerResponse**: Player information
- **MoveRequest**: Make a move (with column validation)
- **MoveResponse**: Move information
- **ChatMessageRequest**: Send chat message
- **ChatMessageResponse**: Chat/system message
- **GameStateResponse**: Complete game state (game + players + moves + messages)

## Usage Examples

### Initialize Database
```python
from api._shared.init_db import init_database
init_database(db_path="/tmp/game.db", seed=True)
```

### Use Database Connection
```python
from api._shared.db import get_db

with get_db() as conn:
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM games")
    games = cursor.fetchall()
```

### Validate Request Data
```python
from api._shared.models import CreateGameRequest

request = CreateGameRequest(player_name="Alice", is_ai_opponent=False)
```
