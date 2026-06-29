from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import upload, keys, analytics, agent, chat

app = FastAPI(title="MediQ API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router,    prefix="/api")
app.include_router(keys.router,      prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(agent.router,     prefix="/api")
app.include_router(chat.router,      prefix="/api")

@app.get("/health")
def health():
    return {"status": "ok", "version": "0.1.0"}
