# Disaster Response Coordination & Community Safety Alert Platform

A production-ready platform designed to coordinate relief, track first responder units (NDRF/NGOs), and broadcast high-priority safety alerts to citizens during natural crises.

## Project Structure

```text
disasterSOS/
├── apps/
│   ├── rakshalert/          # Vite React Frontend Command Center
│   ├── admin/               # Standalone National Analytics Portal
│   ├── mobile/              # Kotlin Android Application
│   └── backend/             
│       ├── api/             # Node.js + Express REST API
│       └── ai-engine/       # Python FastAPI AI Pipeline
├── packages/
│   ├── ui/                  # Shared UI components
│   ├── types/               # Shared TypeScript schemas
│   ├── database/            # Database schema references
│   └── realtime/            # Socket.io shared configurations
├── infrastructure/          # Docker, K8s, Nginx setups
└── docs/                    # Technical architecture documents
```

---

## 🛠️ Step-by-Step Device Setup Guide

Follow these steps to run this project on any development machine.

### 1. Prerequisites
Ensure you have the following installed on your target device:
- **Node.js** (v18.x or higher) & **npm** (v9.x or higher)
- **MongoDB** Community Server running locally (Default port: `27017`)
- **Python** (v3.9 or higher) — *Required for the AI engine model classifier*

---

### 2. Automatic One-Click Setup (macOS / Linux)
We provide an automated setup script that configures environment files and installs all dependencies across subfolders.

At the root directory (`disasterSOS/`), run:
```bash
./setup.sh
```

---

### 3. Manual Installation Steps (All Platforms)

If you are on Windows or prefer installing manually:

#### A. Setup Environment Files
Create a copy of `.env.example` in the backend root folder:
- Copy `/apps/backend/api/.env.example` to `/apps/backend/.env`
- Open `/apps/backend/.env` and review variables (e.g. adjust ports or Twilio placeholders).

#### B. Install Sub-Project Dependencies
Run `npm install` inside each application directory:

```bash
# 1. Install Backend REST API dependencies
cd apps/backend/api
npm install

# 2. Install Web Client (RakshAlert) dependencies
cd ../../rakshalert
npm install
```

---

### 4. 🗄️ Database Seeding
To log in immediately with role guards configured (Admin, NGO, NDRF, Citizen), run the database seeder to populate mock accounts:

```bash
cd apps/backend/api
npm run seed
```

This populates the following test logins (Password: `password123`):
* 👑 **Admin**: `admin@disastersos.com`
* 🎖️ **NDRF Commander**: `ndrf@disastersos.com`
* 🤝 **NGO Coordinator**: `ngo@disastersos.com`
* 👤 **Citizen**: `citizen@disastersos.com`

---

### 5. 🚀 Starting the Application Servers

Start MongoDB locally on your device, then spin up the development servers:

#### A. Run Node.js REST API
```bash
cd apps/backend/api
npm run dev
```
*Runs backend listener on: `http://localhost:5001`*

#### B. Run Vite React Web App (RakshAlert)
```bash
cd apps/rakshalert
npm run dev
```
*Runs RakshAlert client on: `http://localhost:5173`*

#### C. Run Python AI Engine (Optional)
Create a Python virtual environment and run the FastAPI server:
```bash
cd apps/backend/ai-engine
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
```
*Runs AI classification pipelines on: `http://localhost:8000`*
