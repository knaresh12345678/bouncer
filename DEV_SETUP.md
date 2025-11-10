# Development Setup Guide

This guide explains how to run the Bouncer application with:
- **Frontend & Backend**: Running normally (not in Docker) for easier development
- **Services** (PostgreSQL, Redis): Running in Docker

## Quick Start

### Option 1: Use the Start Script (Recommended)
Simply run:
```bash
start-dev.bat
```

This will:
1. Start PostgreSQL and Redis in Docker
2. Start the backend server on http://localhost:8000
3. Start the frontend dev server on http://localhost:3000

To stop services:
```bash
stop-dev.bat
```

## Manual Setup

### Step 1: Start Docker Services

Start only PostgreSQL and Redis:
```bash
docker-compose -f docker-compose.services.yml up -d
```

Check if services are healthy:
```bash
docker-compose -f docker-compose.services.yml ps
```

### Step 2: Start Backend

Navigate to the backend directory and run:

**Option A: Using simple_app.py (SQLite-based, simpler)**
```bash
cd backend
python simple_app.py
```

**Option B: Using full app (PostgreSQL-based)**
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at: http://localhost:8000

### Step 3: Start Frontend

Open a new terminal and run:
```bash
cd frontend
npm run dev
```

The frontend will be available at: http://localhost:3000

## Service Endpoints

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **PostgreSQL**: localhost:5433
  - Database: `bouncer_db`
  - User: `bouncer_user`
  - Password: `bouncer_pass`
- **Redis**: localhost:6380

## Environment Variables

### Backend Environment Variables
If using the full app (not simple_app.py), you may need to set:
```bash
DATABASE_URL=postgresql://bouncer_user:bouncer_pass@localhost:5433/bouncer_db
REDIS_URL=redis://localhost:6380
JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production
ENVIRONMENT=development
```

### Frontend Environment Variables
Create a `.env` file in the frontend directory if needed:
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

## Prerequisites

Make sure you have installed:
- **Docker Desktop** (for running PostgreSQL and Redis)
- **Python 3.8+** (for backend)
- **Node.js 16+** (for frontend)

### Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Frontend Dependencies
```bash
cd frontend
npm install
```

## Stopping the Application

1. **Docker Services**:
   ```bash
   docker-compose -f docker-compose.services.yml down
   ```

2. **Backend & Frontend**: Press `Ctrl+C` in their respective terminal windows

## Troubleshooting

### Port Already in Use
If you get port conflict errors:
- PostgreSQL (5433): `netstat -ano | findstr :5433`
- Redis (6380): `netstat -ano | findstr :6380`
- Backend (8000): `netstat -ano | findstr :8000`
- Frontend (3000): `netstat -ano | findstr :3000`

Then kill the process:
```bash
taskkill /PID <process_id> /F
```

### Docker Services Not Starting
```bash
# Check Docker is running
docker ps

# View service logs
docker-compose -f docker-compose.services.yml logs -f

# Restart services
docker-compose -f docker-compose.services.yml restart
```

### Database Connection Issues
If the backend can't connect to PostgreSQL:
1. Ensure Docker services are running: `docker ps`
2. Check PostgreSQL is healthy: `docker-compose -f docker-compose.services.yml ps`
3. Wait a few seconds for PostgreSQL to fully initialize

## Development Tips

- **Hot Reload**: Both frontend (Vite) and backend (with --reload flag) support hot reloading
- **API Documentation**: Visit http://localhost:8000/docs for Swagger UI
- **Database Access**: Use any PostgreSQL client with the connection details above
- **Redis Access**: Use Redis CLI: `docker exec -it bouncer_redis redis-cli`

## Full Docker Mode

If you want to run everything in Docker (including frontend and backend):
```bash
docker-compose up -d
```

This uses the original `docker-compose.yml` file.
