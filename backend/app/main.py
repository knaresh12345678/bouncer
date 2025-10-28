from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.security import HTTPBearer
import socketio

from app.core.config import settings
from app.core.database import engine, SessionLocal
from app.middleware.auth import AuthMiddleware
from app.middleware.rbac import RBACMiddleware
from app.api.auth import auth_router
from app.api.simple_auth import simple_auth_router
from app.api.users import users_router
from app.api.bookings import bookings_router
from app.api.bouncers import bouncers_router
from app.api.admin import admin_router
from app.services.websocket import sio

app = FastAPI(
    title="Bouncer App API",
    description="Role-based access control API for bouncer services",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS middleware - More permissive for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Security middleware
app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.ALLOWED_HOSTS)
app.add_middleware(AuthMiddleware)
app.add_middleware(RBACMiddleware)

# Socket.IO integration
socket_app = socketio.ASGIApp(sio, app)

# API Routes
# app.include_router(simple_auth_router, prefix="/api/auth", tags=["Authentication"])  # Simple auth
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])  # Full RBAC auth
app.include_router(users_router, prefix="/api/users", tags=["Users"])
app.include_router(bookings_router, prefix="/api/bookings", tags=["Bookings"])
app.include_router(bouncers_router, prefix="/api/bouncers", tags=["Bouncers"])
app.include_router(admin_router, prefix="/api/admin", tags=["Admin"])

@app.get("/")
async def root():
    return {"message": "Bouncer App API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)