# Nivara Platform — Master Build Prompt for Antigravity

> Copy everything below this line directly into Antigravity as your build instructions.

---

## 0. What You Are Building (read this first)

Build **Nivara** — a real, production-grade, three-portal web platform, not a demo, not a mockup, not a landing page with fake buttons. The business model is **"MakeMyTrip / Booking.com, but the inventory is mobile wellness vans instead of hotel rooms."**

- A **van** = a listing (like a hotel room)
- A **booking session** = a reservation
- A **vendor** = a host/property partner who must be verified before going live
- A **customer** = a traveler who must complete KYC before their first booking
- The **founder (you)** = a single hardcoded admin account with full platform visibility — there is no public admin signup, ever

This has to function end-to-end: a real signup creates a real row in a real Postgres database, a real KYC document upload goes to real object storage and shows up in a real admin review queue, a real booking blocks a real time slot, and a real vendor sees that booking appear in their inbox. Nothing should be hardcoded/mocked data sitting behind a pretty UI — the UI is a thin layer over a working system.

**Critical positioning note — read carefully:** Nivara is **not a spa**. There is no service menu, no "treatments," and no shared staff working across multiple clients at once. A van is a **single-occupancy relaxation pod**: one attendant may be present inside the van, but they are dedicated exclusively to that one customer for the duration of their booked slot — never managing multiple clients or rooms simultaneously, the way spa staff do. The customer books a slot, arrives, and has the space (reclining/zero-gravity chair, soundproofed cabin, ambient lighting, aromatherapy, calming audio) — plus that one attendant if present — entirely to themselves for 15/30/45 minutes, then leaves. Do not write copy, screens, or vendor-facing language that implies a spa-style service menu, multiple treatment options, or staff shared across bookings ("choose your therapist," "pick a treatment"). If the vendor's van includes an attendant, model it as a single fixed role tied 1:1 to the booking (e.g. a "van attendant" field on the Van or Booking record), not a bookable resource of its own.

**Hard constraint on visual design:** this must NOT look like an AI-generated template. No default purple-to-blue gradients, no generic "boilerplate SaaS" hero with a stock illustration, no Lorem Ipsum, no unstyled shadcn-out-of-the-box components, no centered-card-on-gradient-background clichés. It should look and feel like a real, funded consumer brand — closer to Airbnb, MakeMyTrip, or a boutique spa's booking site than to a hackathon project. See Section 2 for exact brand direction and Section 10 for the anti-template checklist.

---

## 1. The Three Portals (one codebase, one database, three experiences)

### 1.1 Customer Portal
Discover nearby wellness vans → verify identity (KYC) → browse by location/price/amenities → pick a time slot → pay → get a booking confirmation with a QR/booking code → manage bookings → leave a review after the session.

### 1.2 Vendor Portal
Register as a van operator → submit business + verification documents → **wait for admin approval** before anything goes live → once approved, build a public-facing **vendor portfolio** (this is their trust profile, exactly like a hotel's partner page on MakeMyTrip — verified badge, bio, rating, van listings) → list and manage vans → manage availability calendars → receive booking requests in an inbox → accept/complete sessions → track earnings and payouts.

### 1.3 Admin Portal (Founder-only)
The single source of truth over the entire platform. Full read/write visibility into every user, every vendor, every van, every booking, every payment, and every KYC document. Approves or rejects vendor applications and van listings. Reviews and decides on customer KYC. Can suspend any account. Can issue refunds. Every single admin action is written to an immutable audit log (who did what, to what, and when) — this is non-negotiable, since it's the only accountability layer on a platform where the founder has unilateral power.

**Access control:** the admin role is seeded directly into the database at setup time (one row, one account). There is no `/admin/signup` route. There is no way for any user to self-promote to admin. Every admin API route is protected by RBAC middleware that checks the role server-side, not just a hidden frontend link.

---

## 2. Brand & Design Direction

- **Name:** Nivara — "Next-gen Immersive Vehicle for Active Recovery & Awareness"
- **Tagline:** "Escape the Chaos, Find Your Calm"
- **Color system:**
  - Primary: deep navy (`#0A2540`-ish) + sage/forest green
  - Backgrounds: off-white / cream, never stark white or dark-mode-by-default
  - Accent (used specifically on booking/detail/sanctuary screens): warm wood tones and soft amber, echoing the van's actual "warm-lit interior" feel
  - Explicitly avoid: neon, saturated tech-startup gradients, glassmorphism-as-default, anything that reads "crypto dashboard"
- **Typography:** a serif or humanist display font for headings (mirrors the logo's serif wordmark, signals calm/trust) paired with a clean, highly legible sans-serif for UI and body copy. Never use a default system font stack as the final choice.
- **Tone:** premium but approachable, calm but credible — like a private airport lounge pod or a quiet room, not a spa reception, not a hustle-culture SaaS dashboard, not a childish wellness app.
- **Logo:** use the provided `nivara_logo_transparent.png` exactly as-is (already properly transparent — do not regenerate, re-illustrate, re-color, or crop the artwork). Use it as the navbar mark, footer mark, and favicon (generate favicon sizes from it, don't distort the aspect ratio).
- Every screen — including error states, empty states, loading states, and form validation — must look intentionally designed. No placeholder text, no unstyled native browser alerts/inputs.

---

## 3. Tech Stack

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS. shadcn/ui as the component base, but every component must be restyled to the Nivara palette/typography above — it should not be visually identifiable as "default shadcn."
- **Backend:** Next.js server actions / API routes (or a separated Node/Express service if you prefer), with a clean service layer — business logic lives in `/lib/services`, never inline inside React components or route handlers.
- **Database:** PostgreSQL via Prisma ORM. Real relational schema with foreign keys, constraints, and enums — not a document-store-shaped JSON blob pretending to be a database. See Section 4 for the schema.
- **Auth:** JWT access + refresh tokens, bcrypt/argon2 password hashing, role-based access control for `customer` / `vendor` / `admin`. Email+password required; phone OTP as an optional second factor.
- **File storage:** S3-compatible object storage (or Firebase Storage) for KYC documents, van photos, and vendor ID proofs. Never store uploaded files as base64 blobs in Postgres.
- **Maps/location:** Google Maps Platform — Maps JS API + Places API + Geocoding — for van discovery by location and radius, styled to match the brand palette (not default Google Maps styling).
- **Payments:** Razorpay or Stripe, sandbox/test keys are fine, but the flow must be real: checkout session → webhook-confirmed payment → status update in the `Payment` table → refund handling on cancellation.
- **Notifications:** Email via Resend/SendGrid for booking confirmations, vendor alerts, and KYC status changes; SMS/WhatsApp optional.
- **Hosting/infra:** Vercel (frontend) + managed Postgres (Neon/Supabase/RDS). All secrets via environment variables — nothing hardcoded, and a `.env.example` file must be included.

---

## 4. Core Data Model

Implement this as a real Prisma schema with foreign keys and constraints:

- **User** — id, name, email, phone, password_hash, role (`customer`|`vendor`|`admin`), kyc_status (`unverified`|`pending`|`verified`|`rejected`), created_at
- **KYCDocument** — id, user_id, doc_type, doc_number (masked/encrypted at rest), file_url, status, reviewed_by, reviewed_at
- **VendorProfile** — id, user_id, business_name, bio, verification_status, payout_details, rating_avg, total_bookings, created_at
- **Van** — id, vendor_id, title, description, amenities[], photos[], base_location (lat/lng + address), service_radius, price_per_slot (15/30/45-min tiers), status (`active`|`inactive`|`under_review`), has_attendant (boolean), attendant_name (nullable)
- **Availability** — id, van_id, date, time_slot_start, time_slot_end, is_booked
- **Booking** — id, customer_id, van_id, vendor_id, slot_id, session_length, status (`pending`→`confirmed`→`completed`/`cancelled`), booking_code/QR, created_at
- **Payment** — id, booking_id, amount, currency, gateway_ref, status (`initiated`|`success`|`failed`|`refunded`)
- **Review** — id, booking_id, customer_id, van_id, rating, comment
- **AdminAuditLog** — id, admin_id, action, target_entity, timestamp

---

## 5. Customer Portal — Screens & Flows

1. **Landing page** — brand story, "how it works," trust signals, sign-up/log-in CTA.
2. **Signup/Login** — email/phone + password, email or OTP verification.
3. **KYC flow (mandatory before first booking)** — ID upload + selfie + name/DOB/address form. Status visible to the user at every stage (pending/verified/rejected). Only KYC-verified customers can complete a booking — mirror MakeMyTrip's verified-traveler gating.
4. **Discover/Search** — map + list view of nearby vans; filters for distance, price tier, rating, amenities, availability today.
5. **Van Detail** — photo gallery, amenities, vendor portfolio snippet, reviews, live slot picker.
6. **Booking & Checkout** — slot selection → price review → payment → confirmation with booking code/QR.
7. **My Bookings** — upcoming/past/cancelled, reschedule/cancel per policy, downloadable receipt.
8. **Profile & KYC status** — personal info, KYC document status, saved payment methods.
9. **Reviews** — post-session rating/review prompt.

---

## 6. Vendor Portal — Screens & Flows

1. **Vendor onboarding** — business details + KYC/business docs + payout info, submitted for **admin approval** before the vendor can go live (this mirrors how MakeMyTrip vets hotel partners — no self-serve go-live).
2. **Vendor Portfolio (public-facing)** — this is the trust profile customers see before booking: verified badge, bio, listed vans, aggregate rating, completed-session count.
3. **Van Listing management** — add/edit van (photos, amenities, description, pricing tiers, location + radius), submit for admin review, toggle active/inactive.
4. **Availability/Calendar** — set open time slots per van per day.
5. **Bookings Inbox** — incoming requests, accept/confirm, see customer name + verified-KYC badge (never the raw KYC documents), mark sessions complete.
6. **Earnings dashboard** — per-booking payout breakdown, pending payouts, historical earnings chart.
7. **Account settings** — profile edit, resubmit docs if rejected.

---

## 7. Admin Portal — Founder-Only

- Single seeded admin account, no public signup route, RBAC middleware on every admin route and API.
- **Overview dashboard** — total users/vendors/vans, bookings today/this week, GMV, pending approvals count.
- **User management** — search customers, KYC review queue (approve/reject with a reason field), suspend/ban.
- **Vendor management** — approve/reject vendor applications and van listings, view portfolios, suspend vans/vendors.
- **Booking oversight** — search all bookings, override status, process refunds/disputes.
- **Payments oversight** — transaction log, vendor payout status, refund log.
- **Analytics** — booking trends, top locations, revenue by tier, retention.
- **Audit log** — every admin action, viewable and filterable.

---

## 8. Non-Functional Requirements

- Mobile-first responsive design (most bookings happen near a van hotspot, on a phone).
- Real form validation and error states everywhere — no silent failures.
- Route protection on both frontend (redirects) and backend (API guards): a customer must never be able to reach a vendor or admin route by URL manipulation, and vice versa.
- Intentional loading states (skeletons) and empty states ("no vans nearby yet") — never a blank screen.
- Basic accessibility: semantic HTML, labeled form fields, sufficient contrast against the navy/green palette.
- Seed data: a handful of vendors, vans across 2–3 city hotspots, and sample bookings, so the app is demoable immediately.
- A README covering setup, environment variables, and how to run migrations/seed data.

---

## 9. Deliverables

- Complete Next.js + TypeScript codebase, cleanly separated: `/app` (routes per portal: `/customer`, `/vendor`, `/admin`), `/components`, `/lib` (services, db client, auth), `/prisma` (schema + migrations + seed script).
- Working auth + RBAC across all three portals.
- Working KYC upload/review flow with real file storage.
- Working van search-by-location → booking → payment (sandbox keys acceptable).
- Admin dashboard pulling from the same live database — never a separately mocked dataset.
- Nivara logo integrated as favicon, navbar mark, and footer mark from the provided transparent PNG.

---

## 10. Anti-Template Checklist (verify before calling this "done")

- [ ] No purple/blue default gradient hero section
- [ ] No stock "boilerplate SaaS" illustration or icon-in-a-circle grid as the main visual
- [ ] No Lorem Ipsum anywhere, including in seed data
- [ ] Every empty state has real, brand-voiced copy (not "No data found")
- [ ] Every form has real validation messages (not "Invalid input")
- [ ] shadcn components are visibly restyled to the navy/green/cream palette, not left in default gray/slate
- [ ] Maps are restyled to match the brand, not default Google red pins on default styling
- [ ] The three portals feel like three parts of one coherent brand, not three unrelated dashboards

---

Build this as if it is going into real production use — not a hackathon prototype, not a portfolio piece.
