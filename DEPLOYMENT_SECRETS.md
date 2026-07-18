# Nivara Deployment & API Keys Guide

This document lists every environment variable and API key used by the **Nivara** platform, along with details on how to obtain, configure, and secure them for production deployment (e.g., on Vercel, Supabase, and custom servers).

---

## Environment Variables Reference Table

| Variable Name | Environment Scope | Purpose | Source / How to Obtain |
|:---|:---|:---|:---|
| `DATABASE_URL` | Server | Main connection string to Postgres (Pooled) | Supabase Dashboard > Database > Connection URI (port 6543) |
| `DIRECT_URL` | Server (Prisma) | Direct connection string to Postgres (Unpooled) | Supabase Dashboard > Database > Connection URI (port 5432) |
| `JWT_SECRET` | Server | Secret phrase to sign Auth access tokens | Locally generated secure key |
| `JWT_REFRESH_SECRET` | Server | Secret phrase to sign Auth refresh tokens | Locally generated secure key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client & Server | Public identifier for client-side Stripe elements | Stripe Dashboard > Developers > API Keys |
| `STRIPE_SECRET_KEY` | Server | Authenticates backend requests to Stripe API | Stripe Dashboard > Developers > API Keys |
| `STRIPE_WEBHOOK_SECRET` | Server | Validates payment webhook payloads | Stripe Dashboard > Developers > Webhooks (after endpoint setup) |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Client & Server | Powers interactive maps and address lookups | Google Cloud Console > APIs & Services > Credentials |
| `NEXT_PUBLIC_SUPABASE_URL` | Client & Server | Base URL of the Supabase backend project | Supabase Dashboard > Project Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client & Server | Public client-side connection key | Supabase Dashboard > Project Settings > API |
| `NEXT_PUBLIC_APP_URL` | Client & Server | Fully qualified URL of the hosted application | Production domain (e.g., `https://nivara.vercel.app`) |
| `GOOGLE_CLIENT_ID` | Server | Identifies application to Google's OAuth API | Google Cloud Console > Credentials > OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Server | Authenticates OAuth requests to Google | Google Cloud Console > Credentials > OAuth Client ID |
| `PORT` | Server | Informs Next.js / Node server which port to bind | Typically `3000` (auto-configured by hosting platforms) |

---

## Detailed API Key Setups

### 1. Supabase Database Connection (`DATABASE_URL`, `DIRECT_URL`)
Prisma ORM requires two connection strings for serverless environments to prevent connection limit exhaustion:
* **`DATABASE_URL` (Connection Pooler)**: Uses port `6543` and includes `?pgbouncer=true` at the end. Use this for serverless API routing.
* **`DIRECT_URL` (Direct Connection)**: Uses port `5432`. Prisma uses this connection to apply database migrations (`npx prisma migrate dev`).
* **Retrieval Steps**:
  1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
  2. Select your project.
  3. Navigate to **Project Settings** (Gear icon) > **Database**.
  4. Scroll down to **Connection string** > Select the **URI** tab.
  5. Copy the strings, replacing `[YOUR-PASSWORD]` with your database user password.

### 2. Supabase API Credentials (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
Used by client-side utilities to communicate with Supabase storage buckets (for KYC documents and van photos) and optional database features.
* **Retrieval Steps**:
  1. Go to **Project Settings** > **API**.
  2. Copy the **Project URL** to populate `NEXT_PUBLIC_SUPABASE_URL`.
  3. Copy the **anon / public** key to populate `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### 3. Stripe Billing Integration (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`)
Stripe powers the wellness van session payments.
* **Retrieval Steps**:
  1. Register or log in to the [Stripe Dashboard](https://dashboard.stripe.com).
  2. Toggle **Test Mode** (during development/staging) or leave off (for production).
  3. Go to **Developers** > **API Keys**.
  4. Copy the **Publishable key** (`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`) and **Secret key** (`STRIPE_SECRET_KEY`).
  5. To configure webhooks: navigate to **Developers** > **Webhooks**, add an endpoint pointing to your production URL (`https://your-domain.com/api/webhook/stripe`), choose the `checkout.session.completed` event, and copy the generated **Signing secret** to populate `STRIPE_WEBHOOK_SECRET`.

### 4. Google Maps API (`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`)
Powers the van locator search, address auto-completes, and map markers.
* **Required Enablements**: In the Google Cloud Console, you must enable the following APIs under the key:
  - **Maps JavaScript API** (renders the map interface)
  - **Places API** (autocomplete location bar)
  - **Geocoding API** (translates text addresses into latitude/longitude)
* **Retrieval Steps**:
  1. Go to the [Google Cloud Console](https://console.cloud.google.com).
  2. Create or select a project.
  3. Navigate to **APIs & Services** > **Library** to search and enable the three APIs listed above.
  4. Navigate to **APIs & Services** > **Credentials**.
  5. Click **+ Create Credentials** > **API Key**. Copy this key.
  6. **Security Recommendation**: Restrict the API key under settings to only accept requests originating from your production HTTP referrers (your website domain) to prevent unauthorized usage.

### 5. JWT Secret Keys (`JWT_SECRET`, `JWT_REFRESH_SECRET`)
Used to securely sign access tokens on login to authenticate API requests.
* **Production Configuration**: Generate distinct, long, random strings.
* **Generation Command**: Run the following in your terminal to generate secure random keys:
  ```bash
  openssl rand -base64 32
  ```

### 6. Google Sign-In Credentials (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`)
Enables customers and vendors to log in using their Google accounts.
* **Retrieval Steps**:
  1. Open the [Google Cloud Console](https://console.cloud.google.com).
  2. Navigate to **APIs & Services** > **OAuth consent screen**, set user type, and complete details.
  3. Navigate to **Credentials** > Click **+ Create Credentials** > **OAuth client ID**.
  4. Set application type to **Web application**.
  5. Add your authorized redirect URIs (e.g., `https://your-domain.com/api/auth/callback/google` or local hosting).
  6. Click create and copy the **Client ID** and **Client Secret**.
