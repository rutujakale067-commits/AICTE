from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .routers.api import router
from .routers.tracking import router as tracking_router
Base.metadata.create_all(engine)
app = FastAPI(title="AICTE Official Scrutiny Portal")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], allow_methods=["*"], allow_headers=["*"])
app.include_router(router)
app.include_router(tracking_router)
