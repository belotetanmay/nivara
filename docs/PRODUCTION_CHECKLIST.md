# NIVARA v1.0.0 - Production Readiness Checklist

This checklist must be verified prior to launching live traffic.

---

## 1. Codebase & Builds

- [x] **Mobile TypeScript Compilation**: `cd mobile && npx tsc --noEmit` (**PASSED - 0 errors**)
- [x] **Next.js Web Build**: `npm run build` (**PASSED - 75 routes compiled**)
- [x] **Zero "Coming Soon" Placeholders**: All settings and legal sub-screens are 100% functional.
- [x] **Zero Localhost References**: Mobile environment points to `https://nivara-ten.vercel.app/api`.

---

## 2. Authentication & Social Sign-In

- [x] **Email & Password**: Registration, login, JWT issuance, and session persistence verified.
- [x] **Google OAuth**: Web & Mobile Google sign-in working.
- [x] **Sign in with Apple**: Native iOS Apple Sign-In button active on iOS (`Platform.OS === 'ios'`).
- [x] **Forgot Password**: Verification OTP dispatch & password reset flow verified.

---

## 3. Payments & Gateway

- [x] **Razorpay SDK Integration**: Server-side HMAC-SHA256 signature verification active.
- [x] **Payment Methods**: Supports UPI, Credit Cards, Debit Cards, Net Banking, and Wallets.
- [x] **Booking Confirmation**: Bookings confirmed only post signature verification.

---

## 4. Legal & Store Compliance

- [x] **DPDP Act 2023 Compliance**: Privacy Policy, Terms & Conditions, Refund Policy, Grievance Redressal.
- [x] **Grievance Officer**: Named officer details published (`Tanmay Belote`, `grievance@nivara.in`).
- [x] **Store Metadata**: Play Store & App Store descriptions ready in `docs/store_metadata.md`.
