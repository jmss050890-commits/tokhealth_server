# TokHealth - Changelog

## 2026-02-26 - Privacy Enforcement & Baseline Enhancements

### CRITICAL: Privacy & User Data Isolation
- **Removed all `TEMP_USER_ID = "demo-user-001"` fallbacks** from every backend module (17 files fixed)
- **All API endpoints now require authentication** — return HTTP 401 without a valid Bearer token
- **All data is scoped per authenticated user** — no shared data between users
- **Fixed exception handling** — `except HTTPException: raise` added before generic handlers across all modules
- **Frontend auth headers** — added `getAuthHeaders()` to all fetch calls in 8+ pages (NutritionLogger, EmergencyContacts, HealthCoach, BackToGreen, HydrationTracker, HealthTrends, Dashboard, WisdomVault, PrescriptionTracker)

### P1: Baseline Enhancements (User Profile)
- **Allergies** — tag-based input with dropdown of 20 common allergies + custom text
- **Food Tolerances** — tag-based input with dropdown of 12 sensitivities + custom text
- **Spiritual Preference** — dropdown of top 14 spiritual/religious options + custom text input

### P2: Wisdom Vault - Lab Results
- **Lab Result Image Upload** — camera capture or file upload for lab result images
- **AI Lab Analysis** — GPT-5.2 vision analyzes uploaded lab images and explains findings
- **Lab Results Tab** — new tab in Wisdom Vault showing analysis history

### P3: RxNorm Drug Search & Interaction Checker
- **RxNorm medication search** — type-ahead drug search in Prescription Tracker using NLM RxNorm API
- **AI Drug Interaction Checker** — GPT-5.2 analyzes potential interactions between user's medications
- **New `/api/medication/` endpoints** — search and check-interactions

## Previous Sessions
- Full auth system refactor (JWT)
- Family linking via invite system
- PWA with custom app icon
- Fitbit integration (backend - callback bug pending user config)
- CSV data import
- Spiritual Vault with AI guide
- Camera biometric scanner
- PayPal donation feature
- Medical export fix
- System audit (QuickStats, hydration fixes)
