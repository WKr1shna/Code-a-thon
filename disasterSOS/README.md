# 🚨 Disaster SOS: Real-Time AI Emergency Response Platform

**Disaster SOS** is an AI-powered, real-time crisis management platform designed to bridge the gap between citizens in distress and emergency responders (NDRF, NGOs). By leveraging artificial intelligence to filter out spam and WebSockets for instant data delivery, the platform ensures that critical, life-saving information reaches the right people instantly.

---

## 🌊 Full Project Flow

The core workflow of Disaster SOS is designed for maximum speed and accuracy during a crisis:

1. **Citizen Distress Signal**: A user facing an emergency (e.g., Flood, Earthquake) logs into the **Citizen Portal**. 
2. **GPS Lock**: The user clicks **"📍 Fetch GPS"** which immediately hooks into the browser's Geolocation API to lock onto their precise real-world coordinates. They describe the emergency and hit submit.
3. **AI Spam Filtering (Groq Llama 3.1)**: The Node.js API intercepts the SOS report and forwards the raw text to our Python FastAPI microservice. The lightning-fast **Llama 3.1 model (via Groq API)** performs NLP classification to determine if the report is a genuine emergency or malicious panic-inducing spam/fake news.
4. **WebSocket Broadcast**: 
   - If **Genuine**: The AI verifies the alert, upgrading it to `active` status. The Node.js server instantly broadcasts this via **Socket.io** to all connected clients.
   - If **Fake/Spam**: The alert is suppressed, flagged as `pending`, and quietly routed to the Admin's Fake Review Queue.
5. **Real-Time Mapping**: Without needing a page refresh, the newly verified emergency instantly drops a pulsing red marker on the **Leaflet GIS Map** across all Citizen and Responder dashboards globally.
6. **Responder Dispatch**: NDRF or NGO personnel open their tactical dashboards, view the active alert, and click **"Claim Task"** to assign their unit to the rescue, preventing duplicated rescue efforts.
7. **Multilingual Safety**: While waiting for rescue, the citizen can access AI-generated safety guidelines on their dashboard instantly translated into English, Hindi, or Tamil.

---

## 🛠️ Core Tech Stack

* **Frontend UI**: Next.js 14, React, Tailwind CSS, React-Leaflet (Interactive GIS Mapping).
* **Primary Backend**: Node.js, Express, MongoDB (Mongoose with `2dsphere` GeoJSON spatial indexing).
* **Real-Time Engine**: Socket.io for instantaneous, bi-directional event emission.
* **AI Microservice**: Python, FastAPI, and the **Groq API (Llama-3.1-8b-instant)** for NLP classification.

---

## 📁 Project Structure

```text
disasterSOS/
├── apps/
│   ├── web/                 # Next.js Frontend App Router Layout
│   ├── admin/               # Standalone National Analytics Portal
│   ├── mobile/              # Kotlin Android Application
│   └── backend/             
│       ├── api/             # Node.js + Express REST API (Socket.io)
│       └── ai-engine/       # Python FastAPI AI Pipeline (Groq SDK)
├── packages/
│   ├── ui/                  # Shared UI components
│   ├── types/               # Shared TypeScript schemas
│   ├── database/            # Database schema references
│   └── realtime/            # Socket.io shared configurations
├── infrastructure/          # Docker, K8s, Nginx setups
└── docs/                    # Technical architecture documents
```

---

## 💻 Step-by-Step Device Setup Guide

Follow these steps to run this project on any development machine.

### 1. Prerequisites
Ensure you have the following installed on your target device:
- **Node.js** (v18.x or higher) & **npm** (v9.x or higher)
- **MongoDB** Community Server running locally (Default port: `27017`)
- **Python** (v3.9 or higher) — *Required for the AI engine model classifier*

---

### 2. Manual Installation Steps

#### A. Setup Environment Files
Create a copy of `.env.example` in the backend root folder:
- Copy `/apps/backend/api/.env.example` to `/apps/backend/.env`
- Ensure you append your **Groq API Key** to the `.env` file: `GROQ_API_KEY=your_key_here`

#### B. Install Sub-Project Dependencies
Run `npm install` inside each application directory:

```bash
# 1. Install Backend REST API dependencies
cd apps/backend/api
npm install

# 2. Install Web Client app dependencies
cd ../../web
npm install
```

---

### 3. 🗄️ Database Seeding
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

### 4. 🚀 Starting the Application Servers

Start MongoDB locally on your device, then spin up the development servers:

#### A. Run Node.js REST API (and WebSockets)
```bash
cd apps/backend/api
npm run dev
```
*Runs backend listener on: `http://localhost:5001`*

#### B. Run Python AI Engine (Groq Llama 3.1)
Create a Python virtual environment and run the FastAPI server:
```bash
cd apps/backend/ai-engine
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
set -a && source ../../.env && set +a
uvicorn app.main:app --port 8000 --host 0.0.0.0
```
*Runs AI classification pipelines on: `http://localhost:8000`*

#### C. Run Next.js Web App
```bash
cd apps/web
npm run dev
```
*Runs Next.js client on: `http://localhost:3000`*
