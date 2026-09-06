# Honey Chain Backend (FastAPI + SQLAlchemy)

Backend API service for Honey Chain - Smart Beekeeping and Honey Traceability Platform (SIH 2026).

## Stack
- **Framework**: Python 3.13 + FastAPI
- **Server**: Uvicorn
- **Database ORM**: SQLAlchemy 2.0 (PostgreSQL compatible with SQLite dev fallback)
- **Validation**: Pydantic v2 & Pydantic Settings

## Setup & Execution Instructions

### 1. Create Virtual Environment
```bash
python -m venv venv
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 4. Run Development Server
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### 5. Interactive API Documentation
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`
- Health Endpoint: `http://127.0.0.1:8000/api/v1/health`
