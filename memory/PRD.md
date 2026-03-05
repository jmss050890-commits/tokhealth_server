# TokHealth - Product Requirements Document (PRD)

## App Name: TOKHEALTH - "Keep People Alive" (KPA) System
- **Primary Goal:** AI-driven health tracking app for nutrition, fitness, mental wellness, and overall well-being
- **Platform:** Progressive Web App (PWA), mobile-optimized
- **Tech Stack:** React + FastAPI + MongoDB + OpenAI GPT-5.2 (via Emergent LLM Key)

## Core Features (Implemented)
- Full user authentication (Register/Login) with JWT enforcement
- Disclaimer acceptance screen
- User Profile/Baseline (Age, Height, Weight, Allergies, Food Tolerances, Spiritual Preferences)
- **The Loop** - Central health dashboard with Green/Yellow/Red zone system
- AI Health Coach (GPT-5.2) with Text, Voice, Camera integration, warm conversational tone
- Nutrition Tracker with AI photo recognition & manual logging
- Barcode Scanner for nutrition lookup (Open Food Facts API)
- Biometrics Tracker with camera-based scanning
- Prescription Tracker with medicine label scanner and drug interaction checker
- Hydration Tracker with quick-log buttons
- Wisdom Vault (encrypted journal, lab result analysis, drug database lookup)
- Spiritual Vault with journal, prayer tracker, AI spiritual guide, "Declare" tab
- Emergency Contact System with 911 integration
- Medical Export for printable health reports
- Health Trends Analytics
- Family Manager (invite-based system)
- Import Data (CSV, Fitbit)
- Data Privacy Dashboard
- PWA with custom app icon
- "Support Our Mission" donation feature (PayPal)
- **Share My Health Progress** - Shareable wellness summary card with nutrition, hydration, steps, zone, streak
- **Gamification** - Daily streaks, 10 achievement badges with progress tracking
- Multi-language support (10 languages: EN, ES, FR, AR, ZH, HI, PT, RU, JA, BN)

## Recent Changes (March 5, 2026)
- **NEW:** Share My Health Progress feature - shareable card with daily stats, zone indicator, and streak count
- **NEW:** Gamification system - daily check-in streaks, 10 badges (First Bite, Hydration Hero, Step Starter, Vitals Check, Week Warrior, Month Master, Journal Keeper, Prayer Warrior, Meal Master, Centurion), progress tracking
- **NEW:** AI Health Coach tone refined - warmer, more conversational, celebrates small wins
- **Fixed:** Profile button now shows "Your Baseline" instead of user name
- **Fixed:** Quick Stats nutrition calculation bug (wrong API field paths)
- **Completed:** Dashboard reorganized - 6 primary cards + collapsible "More Features"
- **Completed:** Full i18n translation for all 10 languages across all pages
- **Testing:** 26/26 frontend + 32/32 backend tests passing (100%)

## Known Issues
- **Fitbit Integration:** Returns 404 on callback. Backend correctly configured. User needs to verify Fitbit Developer App redirect URL matches preview URL
- **Apple HealthKit Sync:** Placeholder UI exists, core sync logic not implemented
- **Push Notifications:** Placeholder UI exists, logic not implemented

## Upcoming Tasks
- P1: Continue deepening page-level translations (more granular text within each page)
- P2: Apple HealthKit sync logic
- P2: Push Notification logic
- P3: Android packaging (Bubblewrap) for Google Play Store

## Architecture
- Backend: FastAPI with modular routes in /app/backend/modules/
  - /modules/share/ - Share Progress API
  - /modules/gamification/ - Streaks & Badges API
  - /modules/nutrition/ - Nutrition tracking
  - /modules/hydration/ - Hydration tracking
  - /modules/biometrics/ - Biometrics tracking
  - /modules/health_coach/ - AI Health Coach (GPT-5.2)
  - /modules/user_profile/ - User profiles & targets
  - /modules/auth/ - Authentication
- Frontend: React with pages in /app/frontend/src/pages/
- Auth: JWT tokens stored in localStorage
- i18n: react-i18next with locale files in /app/frontend/src/i18n/locales/
- Database: MongoDB via MONGO_URL env var
  - Collections: users, user_profiles, nutrition_logs, hydration_logs, biometric_logs, streaks, badges, wisdom_entries, spiritual_entries, prescriptions, emergency_contacts, family_invites
