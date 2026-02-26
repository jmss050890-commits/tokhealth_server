# TokHealth - Product Requirements Document

## Original Problem Statement
Build a comprehensive health and wellness application named "TokHealth," designed as a "Keep People Alive" (KPA) system optimized for mobile phone use.

## Core Features (All Implemented)
- **Auth System**: JWT-based registration/login with per-user data isolation
- **Family Linking**: Invite-by-email system for family members
- **User Profile/Baseline**: Age, Height, Weight, Activity Level, Blood Type, Allergies, Food Tolerances, Spiritual Preference
- **Nutrition & Wellness Engine**: Manual log, AI photo recognition (GPT-5.2)
- **Biometrics Tracking**: Manual log, Fitbit Sync, CSV Import, Camera Scanner
- **"The Loop" Dashboard**: Green/Yellow/Red health zones with QuickStats
- **AI Health Coach (GPT-5.2)**: Text & Voice, Floating "Ask Coach" on all pages
- **Emergency Contact System**: Quick-dial, medical report generation
- **Wisdom Vault**: Journal, mood tracker, AI suggestions, Lab Result image upload with AI analysis, Drug/Medication lookup (OpenFDA)
- **Spiritual Vault**: Journal, prayer tracker, AI spiritual guide, "Declare" tab
- **Prescription Tracker**: Reminders, RxNorm drug search, AI drug interaction checker
- **Hydration Tracker**: Quick-log buttons
- **Medical Export**: Printable health report
- **Health Trends**: Analytics page
- **Data Privacy Dashboard**: View stored data, export all data as JSON, delete account
- **Apple HealthKit**: Sync page with iOS detection (UI + backend ready)
- **Notifications & Reminders**: Push notifications, reminder CRUD (medication, hydration, exercise, custom)
- **PWA**: "Add to Home Screen" with custom icon
- **"Support Our Mission"**: PayPal donation link

## Privacy & Security
- All endpoints require JWT authentication (return 401 without token)
- No shared/fallback user IDs — complete user data isolation
- Data export and account deletion available to all users
- AI analysis used solely for user's health insights

## Tech Stack
- **Backend**: FastAPI, Python, MongoDB
- **Frontend**: React, JavaScript, Shadcn UI, Tailwind CSS
- **Auth**: JWT tokens
- **AI**: GPT-5.2 via Emergent LLM Key
- **Drug Data**: RxNorm API (drug search), OpenFDA (drug details/warnings)
- **Architecture**: Progressive Web App (PWA)

## Preview URL
https://tokhealth-kpa-1.preview.emergentagent.com

## Known Issues
- Fitbit callback 404 — user to configure Fitbit developer portal settings
