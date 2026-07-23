# NIVARA Platform - Production Deployment Guide

This guide covers the deployment workflow for the NIVARA Web Platform on Vercel and the Mobile App via Expo EAS Build (Android APK, Android AAB, iOS TestFlight IPA).

---

## 1. Web Deployment (Vercel)

### Prerequisites
- Vercel Account linked to GitHub repository (`belotetanmay/nivara`).
- PostgreSQL Database URL (Neap/Supabase/AWS RDS).

### Deployment Steps
1. Push release commits to the production branch.
2. Ensure Vercel environment variables are configured:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `NEXT_PUBLIC_APP_URL`
3. Trigger build:
   ```bash
   npm run build
   ```
4. Vercel automatically deploys the 75 compiled static & dynamic routes to `https://nivara-ten.vercel.app`.

---

## 2. Mobile App Build (Expo EAS)

### Prerequisites
- Expo Account logged in via `eas login`.
- EAS CLI installed (`npm install -g eas-cli`).

### Generating Production Builds

#### A. Direct Android Installable APK (Preview Profile)
```bash
cd mobile
eas build -p android --profile preview
```

#### B. Google Play Store App Bundle (AAB Profile)
```bash
cd mobile
eas build -p android --profile production
```

#### C. Apple App Store / TestFlight IPA
```bash
cd mobile
eas build -p ios --profile production
```

---

## 3. Database Migration & Maintenance

To apply production database migrations:
```bash
npx prisma db push
npx prisma generate
```

To seed initial categories and test partners:
```bash
npx tsx prisma/seed.ts
```
