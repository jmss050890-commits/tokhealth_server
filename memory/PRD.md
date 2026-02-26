# TokHealth - Product Requirements Document

## Original Problem Statement
Build a comprehensive health and wellness application named "TokHealth," designed as a "Keep People Alive" (KPA) system optimized for mobile phone use.

## Core Features
- **Auth System**: JWT-based registration/login with per-user data isolation
- **Family Linking**: Invite-by-email system for family members
- **User Profile/Baseline**: Age, Height, Weight, Activity Level, Blood Type, Allergies, Food Tolerances, Spiritual Preference
- **Nutrition & Wellness Engine**: Manual log, AI photo recognition (GPT-5.2)
- **Biometrics Tracking**: Manual log, Fitbit Sync, CSV Import
- **Camera Biometric Scanner**: Heart Rate, Stress, Respiratory Rate
- **"The Loop" Dashboard**: Green/Yellow/Red health zones with QuickStats
- **AI Health Coach (GPT-5.2)**: Text & Voice (In/Out)
- **Emergency Contact System**: Quick-dial, medical report generation
- **Wisdom Vault**: Encrypted journal, mood tracker, AI suggestions, Lab Result image upload with AI analysis
- **Spiritual Vault**: Journal, prayer tracker, AI spiritual guide, "Declare" tab
- **Prescription Tracker**: Reminders, RxNorm drug search, AI interaction checker
- **Hydration Tracker**: Quick-log buttons
- **Medical Export**: Printable health report
- **Health Trends**: Analytics page
- **PWA**: "Add to Home Screen" with custom icon
- **"Support Our Mission"**: PayPal donation link

## Privacy & Security
- **All endpoints require authentication** (JWT Bearer token)
- **No shared/fallback user IDs** - each user's data is completely isolated
- **All API calls return 401 Unauthorized** when no valid token is provided
- **Per-user data scoping** across all modules: profile, nutrition, hydration, prescriptions, emergency contacts, health coach, biometrics, wisdom vault, spiritual vault, trends, loop

## Tech Stack
- **Backend**: FastAPI, Python, MongoDB
- **Frontend**: React, JavaScript, Shadcn UI, Tailwind CSS
- **Auth**: JWT tokens
- **AI**: GPT-5.2 via Emergent LLM Key
- **Architecture**: Progressive Web App (PWA)

## DB Schema
- users: {email, hashed_password, name}
- user_profiles: {user_id, name, age, gender, height_cm, weight_kg, activity_level, blood_type, allergies[], food_tolerances[], spiritual_preference, targets{}, health_goals[], medical_conditions[]}
- health_metrics: {user_id, date, steps, heart_rate}
- nutrition_logs: {user_id, date, food_items}
- prescriptions: {user_id, medication_name, dosage, frequency}
- emergency_contacts: {user_id, name, relationship, phone}
- hydration_logs: {user_id, date, amount_ml, beverage_type}
- wisdom_vault_entries: {user_id, type, title, content, mood}
- lab_results: {user_id, filename, analysis, created_at}
- spiritual_vault_entries: {user_id, entry_type, content, mood}
- biometrics_daily: {user_id, date, heart_rate_bpm, blood_pressure, steps}

## Preview URL
https://tokhealth-kpa-1.preview.emergentagent.com
