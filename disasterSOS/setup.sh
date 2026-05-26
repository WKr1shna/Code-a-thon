#!/bin/bash

# Disaster Response Platform - Comprehensive Setup Script
# Colors for beautiful console output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${CYAN}=====================================================${NC}"
echo -e "${BOLD}${MAGENTA}       🚨 DISASTER COORDINATION & SAFETY PLATFORM 🚨      ${NC}"
echo -e "${BOLD}${CYAN}                Unified Developer Setup              ${NC}"
echo -e "${CYAN}=====================================================${NC}"
echo ""

# 1. Check Requirements
echo -e "${BOLD}${BLUE}[1/6] Checking System Pre-requisites...${NC}"
requirements_met=true

# Node.js
if command -v node &> /dev/null; then
    echo -e "  ✅ Node.js:      ${GREEN}Installed ($(node -v))${NC}"
else
    echo -e "  ❌ Node.js:      ${RED}Not Found (Required >= v18)${NC}"
    requirements_met=false
fi

# npm
if command -v npm &> /dev/null; then
    echo -e "  ✅ npm:          ${GREEN}Installed ($(npm -v))${NC}"
else
    echo -e "  ❌ npm:          ${RED}Not Found${NC}"
    requirements_met=false
fi

# Python 3
if command -v python3 &> /dev/null; then
    echo -e "  ✅ Python 3:     ${GREEN}Installed ($(python3 --version))${NC}"
else
    echo -e "  ❌ Python 3:     ${RED}Not Found (Required for AI Engine)${NC}"
fi

# Java
if command -v java &> /dev/null; then
    echo -e "  ✅ Java / JDK:   ${GREEN}Installed ($(java -version 2>&1 | head -n 1))${NC}"
elif [ -f "/Applications/Android Studio.app/Contents/jbr/Contents/Home/bin/java" ]; then
    echo -e "  ✅ Java / JDK:   ${GREEN}Found in Android Studio JBR${NC}"
else
    echo -e "  ⚠️  Java / JDK:   ${YELLOW}Not Found (Required for Android compile)${NC}"
fi

if [ "$requirements_met" = false ]; then
    echo -e "\n${RED}ERROR: Core requirements (Node/npm) are missing. Setup aborted.${NC}"
    exit 1
fi
echo ""

# 2. Configure Environment Files
echo -e "${BOLD}${BLUE}[2/6] Configuring Environment Files...${NC}"
if [ ! -f "apps/backend/.env" ]; then
    if [ -f "apps/backend/api/.env.example" ]; then
        cp apps/backend/api/.env.example apps/backend/.env
        # Set PORT to 5050 to prevent conflicts with macOS AirPlay services
        sed -i '' 's/PORT=5000/PORT=5050/g' apps/backend/.env 2>/dev/null || sed -i 's/PORT=5000/PORT=5050/g' apps/backend/.env 2>/dev/null
        echo -e "  ✅ Created ${GREEN}apps/backend/.env${NC} from template (configured on macOS compatible port 5050)."
    else
        echo -e "  ⚠️  ${YELLOW}Could not find apps/backend/api/.env.example template.${NC}"
    fi
else
    echo -e "  ℹ️  ${CYAN}apps/backend/.env already exists.${NC} Skipping template override."
fi
echo ""

# 3. Install Node.js Dependencies
echo -e "${BOLD}${BLUE}[3/6] Installing Node.js Sub-project Dependencies...${NC}"

# A. Backend API
echo -e "\n${YELLOW}📦 Installing Backend REST API dependencies...${NC}"
cd apps/backend/api && npm install
cd ../../..

# B. RakshAlert (Vite)
echo -e "\n${YELLOW}📦 Installing RakshAlert Web Command Center dependencies...${NC}"
cd apps/rakshalert && npm install
cd ../..

# C. Web Portal (Next.js)
echo -e "\n${YELLOW}📦 Installing Citizen Web Portal (Next.js) dependencies...${NC}"
cd apps/web && npm install
cd ../..

echo -e "\n✅ ${GREEN}Node.js dependency installation complete!${NC}"
echo ""

# 4. Setup Python AI Engine Environment
echo -e "${BOLD}${BLUE}[4/6] Setting up Python AI Engine Pipeline...${NC}"
if command -v python3 &> /dev/null; then
    cd apps/backend/ai-engine
    echo -e "  ⚙️  Creating virtual environment in ${CYAN}apps/backend/ai-engine/venv${NC}..."
    python3 -m venv venv
    
    echo -e "  📦 Installing dependencies from requirements.txt..."
    ./venv/bin/pip install --upgrade pip
    ./venv/bin/pip install -r requirements.txt
    cd ../../..
    echo -e "  ✅ ${GREEN}AI Engine python environment configured successfully!${NC}"
else
    echo -e "  ⚠️  ${YELLOW}Python 3 is missing. Skipping AI Engine dependency setup.${NC}"
fi
echo ""

# 5. Align Native Android Client Settings
echo -e "${BOLD}${BLUE}[5/6] Aligning Native Android Client Settings...${NC}"
android_local_props="apps/SOS/local.properties"
if [ -d "apps/SOS" ]; then
    if [ ! -f "$android_local_props" ]; then
        echo -e "  ⚙️  Generating ${CYAN}local.properties${NC} for Android SDK path..."
        echo "sdk.dir=/Users/himangshuyadav/Library/Android/sdk" > "$android_local_props"
        echo -e "  ✅ Created ${GREEN}$android_local_props${NC} with SDK target: /Users/himangshuyadav/Library/Android/sdk"
    else
        echo -e "  ℹ️  ${CYAN}$android_local_props already exists.${NC}"
    fi
else
    echo -e "  ⚠️  ${YELLOW}Android app folder apps/SOS not found.${NC}"
fi
echo ""

# 6. Database Seeding Option
echo -e "${BOLD}${BLUE}[6/6] MongoDB Database Seeding...${NC}"
echo -e "Would you like to seed the database with mock accounts now? (y/n)"
read -r -p "Selection [y/N]: " seed_choice
if [[ "$seed_choice" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Running database seeder...${NC}"
    cd apps/backend/api && npm run seed
    cd ../../..
    echo -e "✅ ${GREEN}Database seeded successfully!${NC}"
else
    echo -e "ℹ️  ${CYAN}Seeding skipped.${NC} You can run it manually later via: ${BOLD}cd apps/backend/api && npm run seed${NC}"
fi
echo ""

# Summary and Next Steps
echo -e "${CYAN}=====================================================${NC}"
echo -e "${BOLD}${GREEN}           🎉 DEVELOPER SETUP COMPLETED! 🎉          ${NC}"
echo -e "${CYAN}=====================================================${NC}"
echo -e "${BOLD}To start the platform services, open separate terminal windows:${NC}"
echo ""
echo -e "  🚀 ${BOLD}1. Backend Express REST API (Port 5050)${NC}"
echo -e "     ${CYAN}cd apps/backend/api && npm run dev${NC}"
echo ""
echo -e "  🖥️  ${BOLD}2. Vite React Command Center (Port 5173)${NC}"
echo -e "     ${CYAN}cd apps/rakshalert && npm run dev${NC}"
echo ""
echo -e "  🌐 ${BOLD}3. Next.js Web Portal (Port 3000)${NC}"
echo -e "     ${CYAN}cd apps/web && npm run dev${NC}"
echo ""
echo -e "  🤖 ${BOLD}4. Python FastAPI AI Engine (Port 8000)${NC}"
echo -e "     ${CYAN}cd apps/backend/ai-engine && source venv/bin/activate && uvicorn app.main:app --port 8000 --reload${NC}"
echo ""
echo -e "  📱 ${BOLD}5. Native Android Client (com.raksh.alert)${NC}"
echo -e "     Open ${CYAN}apps/SOS${NC} in Android Studio to build, compile, and run on device/emulator."
echo -e "     To build from CLI: ${CYAN}JAVA_HOME=\"/Applications/Android Studio.app/Contents/jbr/Contents/Home\" ./gradlew assembleDebug${NC}"
echo -e "${CYAN}=====================================================${NC}"
