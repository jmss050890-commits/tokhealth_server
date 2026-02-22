# TokHealth - Product Requirements Document

## Overview
**App Name:** TokHealth  
**Tagline:** Keep People Alive (KPA) System  
**Version:** 1.1.0  
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

### 1. User Profile / Baseline (NEW)
- Captures: name, age, sex, height, weight, activity level, blood type
- Calculates personalized targets: BMI, BMR, TDEE, daily calories, protein, steps, water
- Heart rate zones based on age
- Status: COMPLETE

### 2. Disclaimer Screen
- Legal disclaimers (not medical advice, emergency situations, AI-powered insights, data privacy)
- Checkbox acceptance required before entry
- Status: COMPLETE

### 3. Dashboard (Main Hub)
- Light blue theme (user preference applied)
- Quick access cards for all modules
- Profile button in header
- Medical Export card
- Today's quick stats (Calories, Protein, Steps, Water)
- Status: COMPLETE

### 4. The Loop (Health Visualization)
- Central circular status indicator
- Green/Yellow/Red zone calculations based on:
  - Nutrition (calories, protein targets)
  - Biometrics (heart rate, blood pressure, SpO2)
  - Activity (steps)
- "Back to Green" button appears when in yellow/red zone
- Status: COMPLETE

### 5. Back to Green (NEW - Mood Changer)
- Interventions when in yellow/red zone:
  - STOP & Pause (high priority for red)
  - 4-7-8 Breathing exercise (guided)
  - Hydration Boost
  - Gratitude Moment
  - 5-4-3-2-1 Grounding
  - Quick Walk / Stretching
  - Cold Water Reset (red zone)
  - Reach Out (social connection)
- Animated breathing exercise with phases
- Completion tracking
- Status: COMPLETE

### 6. AI Health Coach
- GPT-5.2 integration via emergentintegrations library
- Multi-turn conversation support
- Voice output (browser TTS)
- Customizable coach name
- Context-aware responses based on user's health data
- Quick topic buttons (Nutrition, Exercise, Stress, Sleep)
- Status: COMPLETE

### 7. Biometrics Tracker
- Heart rate, blood pressure (systolic/diastolic)
- Blood oxygen (SpO2), body temperature
- Steps tracking
- Health zone indicators after logging
- Status: COMPLETE

### 8. Nutrition Logger
- Meal logging with food items
- Macro tracking (calories, protein, carbs, fat, fiber)
- **AI Photo Recognition** - Take/upload photo, AI identifies foods and estimates nutrition
- Auto-populates meal form from photo analysis
- Status: COMPLETE

### 9. Emergency Contacts
- Contact management (3-5 contacts)
- 911 button with AI confirmation (Police/Ambulance/Fire)
- Status: COMPLETE

### 10. Wisdom Vault
- Private journal entries
- Mood tracking
- AI wellness suggestions
- Status: PARTIAL - Basic UI exists

### 11. Prescription Tracker
- Medication management
- Basic tracking
- Status: PARTIAL - Needs reminder notifications

### 12. Medical Export (NEW)
- Generates printable HTML report
- Includes: patient info, vitals, medications, emergency contacts
- Opens in new window for printing
- Status: COMPLETE

### 13. Hydration Tracking
- Daily water intake
- Progress visualization
- Status: PARTIAL - Dashboard widget exists

## Technical Details

### API Endpoints (Backend)
- `/api/health` - Health check
- `/api/profile/*` - User profile/baseline CRUD
- `/api/biometrics/*` - Biometrics CRUD
- `/api/nutrition/*` - Nutrition logging + photo analysis
- `/api/loop/*` - The Loop status
- `/api/health-coach/*` - AI coach chat + Back to Green
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
- [x] Created User Profile/Baseline with target calculations
- [x] Implemented Back to Green interventions (breathing, hydration, gratitude, movement)
- [x] Built Medical Export with printable report
- [x] Integrated GPT-5.2 for AI Health Coach
- [x] **AI Meal Photo Recognition** - Take photo, AI analyzes and auto-fills nutrition
- [x] The Loop displays real data with correct zone calculations
- [x] Back to Green button appears in yellow/red zones
- [x] Mobile-responsive design (430px viewport tested)
- [x] All API endpoints tested and working

## Upcoming Tasks (P1)
1. Prescription reminder notifications (browser notifications)
2. Hydration tracking improvements
3. Wisdom Vault journal enhancements

## Future Backlog (P1-P2)
- Barcode scanning for nutrition logging
- Drug interaction warnings
- Advanced health trends/analytics
- Multi-user/family support
- Wearable device integration

## Testing
- Backend: 30/30 tests passed
- Frontend: All features verified at mobile viewport
- Test files:
  - `/app/backend/tests/test_tokhealth_api.py`
  - `/app/backend/tests/test_new_features.py`

## Preview URL
https://tokhealth-mobile.preview.emergentagent.com
