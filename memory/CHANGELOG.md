# TokHealth - Changelog

## 2026-02-26 - Session 2: Major Feature Expansion

### Data Privacy Dashboard (NEW)
- View all stored data categories with record counts
- Export all personal data as downloadable JSON file
- Delete account with "type DELETE" confirmation — permanently removes all data

### AI Coach on All Pages (NEW)
- Floating "Ask Your Health Coach" button on Dashboard and all feature pages
- Context-aware: sends current page context to GPT-5.2
- Chat UI with send/close, appears as a bottom-right floating panel

### Drug & Medication Lookup (NEW)
- OpenFDA integration for drug details (brand name, generic, purpose, dosage, side effects, warnings)
- Available in Wisdom Vault "Lab Results" tab
- RxNorm type-ahead search in Prescription Tracker

### Apple HealthKit Sync (NEW)
- iOS detection for HealthKit availability
- Backend endpoints: /api/healthkit/status and /api/healthkit/sync
- Connection status, data type list, sync instructions for non-iOS users

### Notifications & Reminders (NEW)
- Browser push notification permission request
- Reminder CRUD: create, view, delete reminders
- Reminder types: medication, hydration, exercise, custom
- Time and day-of-week scheduling
- Local notification scheduling when tab is open

### Privacy Enforcement (CRITICAL FIX)
- Removed ALL TEMP_USER_ID fallbacks from 17 backend modules
- Every endpoint returns HTTP 401 without a valid auth token
- Complete user data isolation verified with multi-user testing
- Auth headers added to ALL frontend fetch calls

### Baseline Enhancements (Profile)
- Allergies: tag-based input with 20 common presets + custom
- Food Tolerances: tag-based input with 12 presets + custom
- Spiritual Preference: dropdown of 14 options + custom text

### Wisdom Vault - Lab Results
- Camera/image upload for lab result images
- AI Vision analysis via GPT-5.2
- Lab results history with expandable analysis

### RxNorm Drug Search & Interaction Checker
- Type-ahead medication search in Prescription Tracker
- AI-powered drug interaction analysis for 2+ medications

## Previous Sessions
- Full auth system, family linking, PWA, Fitbit (backend), CSV import
- Spiritual Vault, Camera biometric scanner, PayPal donations
- Medical export, system audit, QuickStats/hydration bug fixes
