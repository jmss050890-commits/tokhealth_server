# TokHealth - Product Requirements Document

## Overview
**App Name:** TokHealth  
**Tagline:** Keep People Alive (KPA) System  
**Version:** 1.2.0  
**Last Updated:** February 23, 2026

## Problem Statement
Build a mobile-first health and wellness tracking application for monitoring nutrition, fitness, mental wellness, and overall well-being. The app should be usable on a mobile phone with an AI-driven interface.

## Target Users
- Families tracking health metrics together
- Individuals managing chronic conditions (diabetes, heart conditions)
- Health-conscious users wanting comprehensive wellness tracking

## Architecture
- **Frontend:** React with Tailwind CSS, ShadcnUI components
- **Backend:** FastAPI (Python)
- **Database:** MongoDB
- **AI Integration:** GPT-5.2 via Emergent LLM Key
- **Authentication:** Token-based auth with Bearer tokens
- **Deployment:** Web app optimized for mobile browsers

## Core Features

### 1. User Authentication (NEW - v1.2.0)
- **Individual Accounts** - Each user has their own email/password account
- User registration with email, password, name
- Secure login with token-based auth
- Session persistence via localStorage
- Logout functionality
- All user data isolated by user_id
- Status: COMPLETE

### 2. Family Linking System (NEW - v1.2.0)
- **Invite-based Family Connections** - Link with family by email
- Each person maintains their own independent account
- Send family invitations to other TokHealth users
- Accept/decline incoming invitations
- View linked family members' health status (Green/Yellow/Red zone)
- Remove family links at any time
- Family dashboard shows all linked members
- Status: COMPLETE

### 3. User Profile / Baseline
- Captures: name, age, sex, height, weight, activity level, blood type
- Calculates personalized targets: BMI, BMR, TDEE, daily calories, protein, steps, water
- Heart rate zones based on age
- Now linked to authenticated user
- Status: COMPLETE

### 4. Disclaimer Screen
- Legal disclaimers (not medical advice, emergency situations, AI-powered insights, data privacy)
- Checkbox acceptance required before entry
- Status: COMPLETE

### 5. Dashboard (Main Hub)
- Light blue theme (user preference applied)
- **Shows logged-in user's name in header**
- Logout button in header
- Quick access cards for all modules
- Profile button, Medical Export card
- Today's quick stats (Calories, Protein, Steps, Water)
- Status: COMPLETE

### 6. The Loop (Health Visualization)
- Central circular status indicator
- Green/Yellow/Red zone calculations based on:
  - Nutrition (calories, protein targets)
  - Biometrics (heart rate, blood pressure, SpO2)
  - Activity (steps)
- "Back to Green" button appears when in yellow/red zone
- Status: COMPLETE

### 7. Back to Green (Mood Changer)
- Interventions when in yellow/red zone
- Animated breathing exercises
- Completion tracking
- Status: COMPLETE

### 8. AI Health Coach
- GPT-5.2 integration via emergentintegrations library
- Voice INPUT (Speech-to-Text) & OUTPUT (Text-to-Speech)
- Customizable coach name
- Context-aware responses
- Status: COMPLETE

### 9. Biometrics Tracker
- Heart rate, blood pressure, SpO2, temperature, steps
- Health zone indicators
- User-specific data storage
- Status: COMPLETE

### 10. Nutrition Logger
- Meal logging with macros
- **AI Photo Recognition** for food identification
- Status: COMPLETE

### 11. Emergency Contacts
- Contact management with 911 AI confirmation
- Status: COMPLETE

### 12. Wisdom Vault
- Private journal with mood tracking
- AI Wellness Suggestions
- Status: COMPLETE

### 13. Prescription Tracker
- Medication management with reminders
- Status: COMPLETE

### 14. Medical Export
- Printable HTML health report
- Status: COMPLETE

### 15. Hydration Tracking
- Quick log buttons, progress visualization
- Status: COMPLETE

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login and get token
- `GET /api/auth/me?token=xxx` - Get current user
- `POST /api/auth/logout?token=xxx` - Logout

### Family
- `GET /api/family/members` - Get linked family members
- `POST /api/family/invite` - Send family invitation
- `GET /api/family/invites/pending` - Get pending invites (sent & received)
- `POST /api/family/invites/{link_id}/respond` - Accept/decline invite
- `GET /api/family/dashboard` - Family health status overview
- `DELETE /api/family/members/{user_id}` - Remove family link

### Health Data (all require Bearer token)
- `/api/profile/*` - User profile CRUD
- `/api/biometrics/*` - Biometrics CRUD
- `/api/nutrition/*` - Nutrition logging
- `/api/loop/*` - The Loop status
- `/api/health-coach/*` - AI coach
- `/api/emergency-contacts/*` - Emergency contacts
- `/api/wisdom-vault/*` - Journal entries
- `/api/prescriptions/*` - Medications
- `/api/hydration/*` - Water tracking

## Database Collections
- `users` - User accounts (email, password_hash, name, token)
- `family_links` - Family connections (from_user_id, to_user_id, status)
- `user_profiles` - Health profiles linked to user_id
- `health_metrics` - Daily health data by user_id
- `biometric_readings` - Biometric history by user_id
- Plus existing collections for nutrition, prescriptions, etc.

## Completed Work (v1.2.0 - February 23, 2026)
- [x] User authentication system (register, login, logout)
- [x] Token-based auth with Bearer token support
- [x] Individual user accounts with data isolation
- [x] Family linking via email invitations
- [x] Accept/decline family invites
- [x] Family dashboard showing members' health zones
- [x] Dashboard shows logged-in user name
- [x] All health data endpoints updated for auth
- [x] Frontend auth screen (login/register toggle)
- [x] Frontend family manager with invite system
- [x] 100% test pass rate (20/20 backend, all frontend flows)

## Upcoming Tasks (P0-P1)
1. Google Fit Integration - Auto-sync steps and heart rate
2. Apple HealthKit Integration - iOS wearable support
3. Custom app icon/favicon

## Future Backlog (P2)
- Barcode scanning for nutrition logging
- Drug interaction warnings
- Advanced health trends/analytics
- Push notifications for reminders

## Testing
- Backend: 20/20 auth & family tests passed
- Frontend: All auth and family UI flows verified
- Test files:
  - `/app/backend/tests/test_auth_family.py`
  - `/app/test_reports/iteration_3.json`

## Test Accounts
- Meka: meka@demo.com / pass123
- JJ: jj@demo.com / pass123
(Both accounts are linked as family)

## Preview URL
https://tokhealth-kpa.preview.emergentagent.com
