from fastapi import FastAPI
from typing import Optional

app = FastAPI()


@app.get("/api/hello")
async def hello(name: Optional[str] = None):
    """
    Simple hello endpoint for vercel serverless function.
    """
    greeting = f"Hello, {name}!" if name else "Hello, Cosmos!"
    return {"message": greeting}
