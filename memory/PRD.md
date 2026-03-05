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
- AI Health Coach (GPT-5.2) with Text, Voice, Camera integration
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
- Multi-language support (10 languages: EN, ES, FR, AR, ZH, HI, PT, RU, JA, BN)

## Recent Changes (March 5, 2026)
- **Fixed:** Profile button now shows "Your Baseline" instead of user name, guiding users to fill in their health profile
- **Fixed:** Quick Stats nutrition calculation bug - frontend was reading wrong API field paths (data.total_calories vs data.totals.calories)
- **Completed:** Dashboard reorganized - 6 primary cards + collapsible "More Features" section
- **Completed:** Comprehensive i18n locale files for all 10 languages covering every page
- **Testing:** 36/36 frontend tests + 21/21 backend tests passing (100%)

## Known Issues
- **Fitbit Integration:** Returns 404 on callback. Backend is correctly configured. User needs to verify Fitbit Developer App settings (redirect URL must match current preview URL)
- **Apple HealthKit Sync:** Placeholder UI exists, core sync logic not implemented
- **Push Notifications:** Placeholder UI exists, logic not implemented

## Upcoming Tasks
- P0: Implement `useTranslation` hooks in all page components (locale files ready)
- P1: Refine AI Health Coach tone (warmer, more natural)
- P2: Gamification (streaks & badges)
- Future: Apple HealthKit logic, Push Notifications, Android packaging (Bubblewrap)

## Architecture
- Backend: FastAPI with modular routes in /app/backend/modules/
- Frontend: React with pages in /app/frontend/src/pages/
- Auth: JWT tokens stored in localStorage
- i18n: react-i18next with locale files in /app/frontend/src/i18n/locales/
- Database: MongoDB via MONGO_URL env var
