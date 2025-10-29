from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI()

@app.get("/api/hello")
async def hello():
    return JSONResponse(content={"message": "Hello from FastAPI!"})


handler = app
