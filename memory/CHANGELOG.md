# TokHealth - Changelog

## 2026-02-26 - Session 2B: Camera Features & Report

### Camera on Health Coach
- Camera button added next to microphone in Health Coach chat
- Take a photo and AI analyzes it instantly — shows results as a coach message
- Works for medicine labels, food, symptoms, anything visual

### Camera on Wisdom Vault (Journal)
- "Capture a Memory" card in the Journal tab
- Take photos of poems, notes, artwork, handwritten items — anything you want to keep
- Photos are analyzed by AI and stored in your vault

### Medicine Label Scanner (Prescriptions)
- "Scan Medicine Label" card in Prescription Tracker
- Take a photo of your medicine bottle or label
- AI reads and explains the label information

### Detailed Feature Report
- Generated comprehensive feature report at /feature-report.txt
- Covers all 20+ feature areas with descriptions

## 2026-02-26 - Session 2A: Major Feature Expansion

### Data Privacy Dashboard
- View all stored data categories with record counts
- Export all personal data as downloadable JSON file
- Delete account with "type DELETE" confirmation

### AI Coach on All Pages
- Floating "Ask Your Health Coach" button on 13+ pages
- Context-aware: sends current page context to GPT-5.2

### Drug & Medication Lookup
- OpenFDA integration for drug details in Wisdom Vault
- RxNorm type-ahead search in Prescription Tracker
- AI-powered drug interaction checker

### Apple HealthKit Sync
- iOS detection, connection status, sync endpoint
- Instructions for non-iOS users

### Notifications & Reminders
- Browser push notifications, reminder CRUD
- Medication, hydration, exercise, custom types

### Privacy Enforcement (CRITICAL)
- All TEMP_USER_ID fallbacks removed from 17 backend modules
- Every endpoint returns 401 without auth token
- Complete user data isolation

### Baseline Enhancements
- Allergies, Food Tolerances, Spiritual Preference in profile

### Wisdom Vault - Lab Results
- Lab result image upload + AI Vision analysis

## Previous Sessions
- Full auth, family linking, PWA, Fitbit (backend)
- Spiritual Vault, Camera biometric scanner, PayPal
- Medical export, system audit, bug fixes
