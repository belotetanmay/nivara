# NIVARA Platform - REST API Reference

All backend routes are deployed under `https://nivara-ten.vercel.app/api`.

---

## 1. Authentication & Account APIs

- `POST /api/auth/register` - Create customer or vendor account.
- `POST /api/auth/login` - Authenticate with email/password and return JWT.
- `GET /api/auth/me` - Fetch authenticated user profile.
- `POST /api/auth/logout` - Revoke authentication session.
- `GET /api/auth/google/login` - Google OAuth sign-in flow.
- `POST /api/auth/google/mobile` - Mobile Google ID token verification.
- `POST /api/auth/apple` - Native Sign in with Apple verification (iOS).
- `POST /api/auth/forgot-password` - Dispatch OTP verification code.
- `POST /api/auth/reset-password` - Reset password with OTP code.
- `POST /api/auth/verify-email` - Complete email verification.

---

## 2. Customer APIs

- `GET /api/customer/vans` - List available wellness recovery vans.
- `GET /api/customer/vans/[id]` - Get van details, amenities, and pricing.
- `GET /api/customer/vans/[id]/slots` - Fetch real-time available booking slots.
- `POST /api/customer/bookings` - Reserve a wellness session.
- `GET /api/customer/bookings` - List customer booking history.
- `GET /api/customer/bookings/[bookingId]` - Fetch specific booking status & details.
- `POST /api/customer/favorites` - Toggle favorite vans.
- `GET /api/customer/notifications` - Fetch notification list & unread count.

---

## 3. Razorpay Payment Gateway APIs

- `POST /api/payments/razorpay/create-order` - Generate Razorpay Order ID for checkout.
- `POST /api/payments/razorpay/verify` - Verify HMAC-SHA256 signature & confirm booking.

---

## 4. Vendor APIs

- `GET /api/vendor/dashboard` - Fetch 80% host revenue, today/weekly metrics, active inbox.
- `GET /api/vendor/vans` - List partner's fleet vans.
- `POST /api/vendor/vans` - Create new van listing.
- `PUT /api/vendor/vans/[id]` - Update van details.
- `POST /api/vendor/availability/generate` - Generate bulk available slots.

---

## 5. Admin APIs

- `GET /api/admin/stats` - Fetch total platform revenue, 80/20 financial split, and metrics.
- `GET /api/admin/users` - Manage registered users & roles.
- `GET /api/admin/kyc` - Review vendor identity documents.
- `POST /api/admin/vans/[vanId]/approve` - Approve new van for platform listing.
