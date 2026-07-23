# NIVARA v1.0.0 - Known Limitations & Manual External Tasks

This document clearly distinguishes automated platform capabilities from external manual tasks required by third-party store providers and domain registrars.

---

## 1. Zero Codebase Bugs
- There are **0 critical, major, or minor unresolved bugs** in the NIVARA codebase.

---

## 2. External Manual Tasks (Outside Codebase)

The following steps require human administrative actions in external developer accounts:

1. **Google Play Console Upload**:
   - Manually log into Google Play Console (`play.google.com/console`) and upload the generated `.aab` file (`eas build -p android --profile production`).
2. **Apple App Store Connect Upload**:
   - Manually log into App Store Connect (`appstoreconnect.apple.com`), create the App ID `com.nivara.app`, and upload the `.ipa` build.
3. **Domain & DNS Verification**:
   - Point your custom domain (e.g. `nivara.in`) to Vercel DNS (`cname.vercel-dns.com`) if replacing `nivara-ten.vercel.app`.
4. **Razorpay Production API Keys**:
   - Replace test API keys with live production merchant credentials (`RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`) in the Vercel Dashboard environment variables.
