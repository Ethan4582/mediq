from fastapi import FastAPI
from routers import upload, agent, chat, keys

app = FastAPI(title="MediQ API", version="0.1.0")

app.include_router(upload.router)
app.include_router(agent.router)
app.include_router(chat.router)
app.include_router(keys.router)

@app.get("/health")
def health_check():
    return {"status": "ok", "version": "0.1.0"}
