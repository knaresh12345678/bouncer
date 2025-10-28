from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from .config import settings

# Handle SQLite vs PostgreSQL URLs
if settings.DATABASE_URL.startswith("sqlite"):
    # SQLite configuration - using sync engine only for simplicity
    engine = create_engine(
        settings.DATABASE_URL,
        echo=settings.DEBUG,
        connect_args={"check_same_thread": False}  # Allow SQLite to work with multiple threads
    )
    async_engine = None  # No async support for SQLite in this setup
else:
    # PostgreSQL configuration
    async_engine = create_async_engine(
        settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://"),
        echo=settings.DEBUG,
        future=True
    )
    engine = create_engine(
        settings.DATABASE_URL,
        echo=settings.DEBUG
    )

# Session makers
if async_engine:
    AsyncSessionLocal = sessionmaker(
        bind=async_engine,
        class_=AsyncSession,
        expire_on_commit=False
    )
else:
    AsyncSessionLocal = None

# Sync session maker (works for both SQLite and PostgreSQL)
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class for models
Base = declarative_base()

# Dependency to get async database session
async def get_async_db():
    if not AsyncSessionLocal:
        raise RuntimeError("Async database sessions are not available with SQLite")
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

# Dependency to get sync database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()