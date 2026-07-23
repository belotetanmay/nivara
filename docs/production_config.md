# NIVARA Platform - Production Configuration & Environment Variables

This document defines all mandatory environment variables and security settings for running NIVARA in production.

---

## 1. Required Backend Environment Variables (.env)

| Variable Name | Required | Description | Example / Default |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/nivara?sslmode=require` |
| `JWT_SECRET` | Yes | 256-bit secret key for signing JWT tokens | `super-secret-production-jwt-key-2026` |
| `RAZORPAY_KEY_ID` | Yes | Live Razorpay merchant key ID | `rzp_live_XXXXXXXX` |
| `RAZORPAY_KEY_SECRET` | Yes | Live Razorpay HMAC secret key | `XXXXXXXXXXXXXXXX` |
| `NEXT_PUBLIC_APP_URL` | Yes | Production website origin URL | `https://nivara-ten.vercel.app` |
| `SMTP_HOST` | Optional | SMTP mailer host for email verification | `smtp.gmail.com` |
| `SMTP_PORT` | Optional | SMTP mailer port | `587` |
| `SMTP_USER` | Optional | SMTP mailer account email | `support@nivara.in` |
| `SMTP_PASS` | Optional | SMTP mailer app password | `encrypted_app_password` |

---

## 2. Required Mobile Environment Variables (mobile/.env)

| Variable Name | Required | Description | Value |
| :--- | :--- | :--- | :--- |
| `EXPO_PUBLIC_API_URL` | Yes | Production Next.js backend API URL | `https://nivara-ten.vercel.app/api` |
| `EXPO_PUBLIC_ENVIRONMENT` | Yes | Target runtime environment | `production` |

---

## 3. Production Security Checklist

- [x] **HTTPS Enforcement**: SSL/TLS certificate active on Vercel domain.
- [x] **JWT Expiry**: Tokens set to 7-day expiration with secure HTTP headers.
- [x] **API Rate Limiting**: In-memory rate limiter protecting auth, booking, and payment endpoints (100 req/min).
- [x] **Zero Localhost References**: Mobile environment configured to production production URL `https://nivara-ten.vercel.app/api`.
- [x] **Database Security**: Row-level tenant isolation enforced on Prisma queries.
