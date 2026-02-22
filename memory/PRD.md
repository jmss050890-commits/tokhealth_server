# TokHealth - Product Requirements Document

## Overview
**App Name:** TokHealth  
**Tagline:** Keep People Alive (KPA) System  
**Version:** 1.0.0  
**Last Updated:** February 22, 2026

## Problem Statement
Build a mobile-first health and wellness tracking application for monitoring nutrition, fitness, mental wellness, and overall well-being. The app should be usable on a mobile phone with an AI-driven interface.

## Target Users
- Families tracking health metrics
- Individuals managing chronic conditions (diabetes, heart conditions)
- Health-conscious users wanting comprehensive wellness tracking

## Architecture
- **Frontend:** React with Tailwind CSS, ShadcnUI components
- **Backend:** FastAPI (Python)
- **Database:** MongoDB
- **AI Integration:** GPT-5.2 via Emergent LLM Key
- **Deployment:** Web app optimized for mobile browsers

## Core Features

### 1. Disclaimer Screen
- Legal disclaimers (not medical advice, emergency situations, AI-powered insights, data privacy)
- Checkbox acceptance required before entry
- Status: COMPLETE

### 2. Dashboard (Main Hub)
- Light blue theme (user preference applied)
- Quick access cards for all modules
- Today's quick stats (Calories, Protein, Steps, Water)
- Status: COMPLETE

### 3. The Loop (Health Visualization)
- Central circular status indicator
- Green/Yellow/Red zone calculations based on:
  - Nutrition (calories, protein targets)
  - Biometrics (heart rate, blood pressure, SpO2)
  - Activity (steps)
- Real-time data from MongoDB
- Status: COMPLETE

### 4. AI Health Coach
- GPT-5.2 integration via emergentintegrations library
- Multi-turn conversation support
- Voice output (browser TTS)
- Customizable coach name
- Context-aware responses based on user's health data
- Quick topic buttons (Nutrition, Exercise, Stress, Sleep)
- Status: COMPLETE

### 5. Biometrics Tracker
- Heart rate, blood pressure (systolic/diastolic)
- Blood oxygen (SpO2), body temperature
- Steps tracking
- Health zone indicators after logging
- Status: COMPLETE

### 6. Nutrition Logger
- Meal logging with food items
- Macro tracking (calories, protein, carbs, fat, fiber)
- AI meal recognition (planned)
- Status: PARTIAL - Basic logging works

### 7. Emergency Contacts
- Contact management (3-5 contacts)
- 911 button with AI confirmation
- Medical report generation (planned)
- Status: PARTIAL - Basic UI exists

### 8. Wisdom Vault
- Private journal entries
- Mood tracking
- AI wellness suggestions
- Encryption for privacy
- Status: PARTIAL - Basic UI exists

### 9. Prescription Tracker
- Medication management
- Reminder system
- Adherence tracking
- Status: PARTIAL - Basic UI exists

### 10. Hydration Tracking
- Daily water intake
- Progress visualization
- Status: PARTIAL - Dashboard widget exists

## Technical Details

### API Endpoints (Backend)
- `/api/health` - Health check
- `/api/biometrics/*` - Biometrics CRUD
- `/api/nutrition/*` - Nutrition logging
- `/api/loop/*` - The Loop status
- `/api/health-coach/*` - AI coach chat
- `/api/emergency-contacts/*` - Emergency contacts
- `/api/wisdom-vault/*` - Journal entries
- `/api/prescriptions/*` - Medication tracking

### Environment Variables
- `MONGO_URL` - MongoDB connection
- `DB_NAME` - Database name
- `EMERGENT_LLM_KEY` - AI integration key
- `REACT_APP_BACKEND_URL` - Frontend API URL

## Completed Work (This Session)
- [x] Applied light blue theme across all pages
- [x] Fixed architectural conflict (kept web app, removed mobile-only approach)
- [x] Integrated GPT-5.2 for AI Health Coach
- [x] The Loop displays real data with correct zone calculations
- [x] Mobile-responsive design (430px viewport tested)
- [x] All API endpoints tested and working

## Upcoming Tasks (P0 - Critical)
1. Emergency Contact 911 AI confirmation layer
2. Medical report export for doctor visits
3. Prescription reminder notifications

## Future Backlog (P1-P2)
- AI photo recognition for meal logging
- Barcode scanning for nutrition
- Drug interaction warnings
- Advanced health trends/analytics
- Multi-user/family support

## Testing
- Backend: 16/16 tests passed
- Frontend: All navigation and integration tests passed
- Test file: `/app/backend/tests/test_tokhealth_api.py`

## Preview URL
https://tokhealth-mobile.preview.emergentagent.com
