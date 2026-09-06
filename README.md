# Honey Chain (SIH 2026 Project)

**Honey Chain** is an integrated AI + IoT + Blockchain smart beekeeping and honey traceability platform.

---

## Key System Pillars
1. **Beekeeper Registration**: Digital profile management and apiary registration.
2. **Hive Registration**: Individual hive metadata, location, and colony logs.
3. **IoT Hive Monitoring**: Temperature, humidity, sound frequency, and weight telemetry.
4. **Hive Health Analysis**: AI colony condition scoring and health monitoring.
5. **Disease & Stress Detection**: Predictive ML alerts for Varroa mite infestation & swarming risks.
6. **Honey Productivity Prediction**: Yield forecasting per apiary season.
7. **Honey Quality Monitoring**: Lab test parameters (HMF, moisture, pollen origin, purity).
8. **Honey Batch Creation**: Batch harvesting, packaging, and lot tagging.
9. **Blockchain Traceability**: Modular local private blockchain ledger for tamper-proof records.
10. **QR-Code Generation**: Unique QR codes printed on honey jars.
11. **Consumer QR Verification**: Public web page for instant origin & purity verification.
12. **Beekeeper Dashboard**: Operational telemetry, alert management & harvest tracking.
13. **KVIC / Admin Dashboard**: Regional analytics, subsidy distribution & quality compliance.
14. **Consumer Verification Page**: Public verification landing page.

---

## Directory Architecture

```
honey-chain/
├── backend/                  # FastAPI Python Backend
│   ├── app/
│   │   ├── api/v1/endpoints/ # 10 Module Routers (/health, /auth, /beekeepers, etc.)
│   │   ├── core/             # config.py, database.py, security.py
│   │   ├── models/           # SQLAlchemy DB models
│   │   ├── schemas/          # Pydantic validation schemas
│   │   ├── modules/          # Domain module code (auth, beekeepers, hives, iot, ai, quality, batches, blockchain, qr, dashboards)
│   │   └── main.py           # FastAPI app instance
│   ├── .env.example
│   └── requirements.txt
├── frontend/                 # React + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/       # Landing page & UI components
│   │   ├── modules/          # Domain frontend module code (10 modules)
│   │   ├── pages/            # LandingPage.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── .env.example
└── README.md
```

---

## Quick Start Guide

### Step 1: Start Backend (FastAPI)
```bash
# In project root:
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Backend API will be running at `http://127.0.0.1:8000/api/v1/health`.

### Step 2: Start Frontend (React + Vite)
```bash
# In a new terminal:
cd frontend
npm install
npm run dev
```
Frontend web app will be running at `http://localhost:5173`.
