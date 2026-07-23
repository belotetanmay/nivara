# NIVARA Platform v1.0.0 - Final Production Deployment Guide

This document outlines the authoritative production deployment steps for the NIVARA Web Platform (Vercel) and Mobile Application (Expo EAS Build for Android & iOS).

---

## 1. Web Deployment (Vercel)

### Environment Prerequisites
Ensure the following variables are configured in the Vercel Dashboard for `Production`:
- `DATABASE_URL`: Production PostgreSQL database connection string.
- `JWT_SECRET`: Production 256-bit JWT secret token.
- `RAZORPAY_KEY_ID`: Live Razorpay API Key ID.
- `RAZORPAY_KEY_SECRET`: Live Razorpay HMAC Secret Key.
- `NEXT_PUBLIC_APP_URL`: `https://nivara-ten.vercel.app`

### Build Command
```bash
npm run build
```
Vercel compiles static and dynamic Next.js App Router routes and deploys to production URL `https://nivara-ten.vercel.app`.

---

## 2. Mobile App Deployment (Expo EAS)

### Environment Prerequisites
Configured in `mobile/eas.json`:
- `EXPO_PUBLIC_API_URL`: `https://nivara-ten.vercel.app/api`
- `EXPO_PUBLIC_ENVIRONMENT`: `production`

### Build Commands

#### A. Direct Installable Android APK (Internal QA / Testing Distribution)
```bash
cd mobile
eas build -p android --profile preview
```

#### B. Google Play Store App Bundle (AAB for Play Console)
```bash
cd mobile
eas build -p android --profile production
```

#### C. Apple App Store TestFlight IPA
```bash
cd mobile
eas build -p ios --profile production
```

---

## 3. Post-Deployment Database Tasks

Run database migration & seed check:
```bash
npx prisma db push
npx prisma generate
```
