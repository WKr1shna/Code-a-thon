# 🚨 DisasterSOS & RakshAlert - Crisis Coordination & Safety Platform

A production-ready, high-availability platform designed to coordinate emergency relief operations, track first responder units (NDRF/NGOs), automate crisis verification using NLP pipelines, and broadcast high-priority safety alerts with real-time push notifications.

---

## 📂 Repository Structure

The platform is designed as a unified monorepo containing the REST backend, AI classifiers, web coordination portals, and a native mobile application:

```text
Code-a-thon/
├── disasterSOS/
│   ├── setup.sh                 # Modernized, interactive developer setup CLI tool
│   ├── apps/
│   │   ├── SOS/                 # Native Android Client (Kotlin, Jetpack Compose, Material3)
│   │   ├── rakshalert/          # Vite React Live Command Center (3D Maps, Socket.io)
│   │   ├── web/                 # Citizen Web Portal (Next.js, Server-Side Rendering)
│   │   └── backend/
│   │       ├── api/             # Node.js + Express REST API & Firebase Admin Gateway
│   │       └── ai-engine/       # Python FastAPI NLP Classifier pipeline
│   ├── packages/                # Shared types, UI assets, and DB schemas
│   └── infrastructure/          # Docker & routing configurations
├── .gitignore                   # Safe configuration ignoring JADX caches and private credentials
└── README.md                    # Primary repository documentation
```

---

## 🛠️ Rapid Developer Setup

We provide an automated, interactive bash setup tool to initialize environment credentials, check system dependencies, configure Python virtual environments, and link native Android settings.

### One-Click Automated Setup (macOS / Linux)
At the `disasterSOS/` root directory, execute:
```bash
cd disasterSOS
chmod +x setup.sh
./setup.sh
```

The script will automatically perform the following steps:
1. **Diagnostic Telemetry**: Verifies Node.js (>=18), npm, Python 3, and Java (including Android Studio's JBR).
2. **macOS Port Alignment**: Auto-generates `apps/backend/.env` from templates and maps the Express API `PORT` to `5050` to circumvent Control Center/AirPlay overlaps.
3. **Multi-Project Install**: Installs all required packages across `apps/backend/api`, `apps/rakshalert`, and `apps/web`.
4. **AI Python Environment**: Provisions a virtual environment in `apps/backend/ai-engine/venv` and installs the NLP requirements.
5. **Android Local Settings**: Sets up `apps/SOS/local.properties` with standard Android SDK targets if missing.
6. **DB Seeding**: Offers to automatically populate MongoDB database collections with seed accounts.

---

## 🚀 Running the Platform Services

To spin up the platform, open separate terminal tabs and execute the following commands:

### 1. Backend REST API (Express on Port 5050)
```bash
cd disasterSOS/apps/backend/api
npm run dev
```

### 2. Vite React Command Center (Port 5173)
```bash
cd disasterSOS/apps/rakshalert
npm run dev
```

### 3. Next.js Web Portal (Port 3000)
```bash
cd disasterSOS/apps/web
npm run dev
```

### 4. Python FastAPI AI Engine (Port 8000)
```bash
cd disasterSOS/apps/backend/ai-engine
source venv/bin/activate
uvicorn app.main:app --port 8000 --reload
```

### 5. Native Android Client (`com.raksh.alert`)
* Open **`disasterSOS/apps/SOS`** inside Android Studio to build, compile, and run.
* **To compile from CLI**:
  ```bash
  JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home" ./gradlew assembleDebug
  ```

---

## 👤 Seeded Test Credentials
All mock accounts share the default password: **`password123`**

| Role | Test Email Address | Purpose & Dashboard Controls |
| :--- | :--- | :--- |
| **Citizen** | `citizen@disastersos.com` | Mobile application navigation, SOS triggers, safety checklist guides, and real-time alerts. |
| **Admin** | `admin@disastersos.com` | Command center coordinates, active responders dispatch, and custom push warning broadcasts. |
| **NDRF Commander** | `ndrf@disastersos.com` | Accepting rescue targets, dispatching commander squads, and updating map overlays. |
| **NGO Coordinator** | `ngo@disastersos.com` | Managing supply chains (food, water, medical kits) and assigning volunteer runs. |

---

## 💻 Technical Stack & Major Dependencies

### 📱 A. Native Android Client (`apps/SOS`)
* **Framework & UI**: Kotlin, Jetpack Compose, Material3 UI, Accompanist Permissions.
* **DI System**: Dagger Hilt (`hilt-android` v2.50).
* **Networking & DB**: Retrofit 2, OkHttp 3, Gson serialization, Room DB (offline caching), and Preferences DataStore.
* **Location & Telemetry**: Google Play Services Location SDK & Maps Compose.
* **Firebase Services**: Firebase Messaging KTX (FCM) & Firebase Analytics.

### ⚙️ B. Backend API (`apps/backend/api`)
* **Runtime & Framework**: Node.js, Express.js.
* **Real-time Sync**: Socket.io websockets for instant dispatcher map pins.
* **Database & Auth**: MongoDB (via Mongoose ODM) & JSON Web Tokens (JWT).
* **Integrations**: Firebase Admin SDK (notification dispatches) & Twilio SDK (SMS).

### 🤖 C. Python AI Engine (`apps/backend/ai-engine`)
* **Framework & Server**: Python, FastAPI, Uvicorn, Pydantic.
* **ML Pipelines**: Custom NLP classifiers using NLTK/Spacy to score incoming SOS validity.

### 🖥️ D. Frontends (`apps/rakshalert` & `apps/web`)
* **Command Center**: React.js, Vite, Three.js (`@react-three/fiber` for 3D modeling), Socket.io Client.
* **Citizen Web**: Next.js 14, React, Server-Side Rendering (SSR).

---

## 🔒 Firebase Services & Advanced Configurations

### 1. FCM Token Key Alignment
* **Mismatched Key Solved**: Aligned Retrofit DTO objects with Express DTO variables. The Kotlin `FcmTokenRequestDto` properties are mapped using `@SerializedName("token")` to match the backend's expected `req.body.token` query.
* **Default FirebaseApp Initialization**: Programmatically instantiates `FirebaseOptions` inside the `onCreate` lifecycle of **[RakshAlertApp.kt](file:///apps/SOS/app/src/main/java/com/raksh/alert/RakshAlertApp.kt)**. This completely bypasses the default Google Services Gradle plugin constraints, enabling dynamic package compilation regardless of console settings.

### 2. 15-Second Push Notification Vibration
* Emergency warnings on Android are configured to vibrate for **15 seconds** to gain immediate citizen attention during high-priority disasters.
* This is driven inside **[FCMService.kt](file:///apps/SOS/app/src/main/java/com/raksh/alert/service/FCMService.kt)** using a dedicated timing array:
  ```kotlin
  val vibrationPattern = longArrayOf(0, 15000) // 0ms start delay, 15s vibration
  ```
* Applied to both pre-Oreo devices (via `NotificationCompat.Builder.setVibrate`) and modern devices (via `NotificationChannel.setVibrationPattern`).
* Bound to `EMER_CHANNEL_ID` identifier `"emergency_alerts_v3"` to force the Android OS to immediately discard old channel caches and apply the 15-second vibration duration settings.

### 3. Public Ngrok Tunneling
* The Android client connects locally via secure public tunnels pointing to backend port `5050`:
  ```bash
  ngrok http 5050 --domain=robe-aeration-diving.ngrok-free.dev
  ```

---

## 🛡️ Git Security Rules & Ignores
To secure operational environments and bypass GitHub Push Protection secret scanning, the [.gitignore](file:///.gitignore) file strictly excludes internal assets while preserving them locally:
* **Android Decompiler Cache**: `**/decompiled_src/`, `**/jadx_temp/` (prevents massive 109MB decompiler JAR files from breaking GitHub push limits).
* **Private Credentials**: `**/firebase-service-account.json`, `**/google-services-private-key.json`, and `*service-account*.json` private certificate keys are kept **local-only** and never committed to version control.
