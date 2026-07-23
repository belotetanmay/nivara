# NIVARA v1.0.0 - Store Submission Guide (Play Store & App Store)

This guide details the step-by-step submission process and store listing specifications for Google Play Store and Apple App Store.

---

## 1. Google Play Console Submission

### Package Information
- **App Title**: NIVARA – Wellness on Wheels
- **Package Name**: `com.nivara.app`
- **Version Name**: `1.0.0`
- **Category**: Health & Fitness

### Upload Steps
1. Log in to [Google Play Console](https://play.google.com/console).
2. Create a new app entry with package ID `com.nivara.app`.
3. Navigate to **Production** -> **Create new release**.
4. Upload the generated `.aab` file from `eas build -p android --profile production`.
5. Paste the short description, full description, support contacts, and privacy policy URL (`https://nivara-ten.vercel.app/privacy`) from `docs/store_metadata.md`.
6. Submit for Google Play Store review.

---

## 2. Apple App Store Connect Submission

### App Information
- **App Name**: NIVARA – Wellness on Wheels
- **Bundle ID**: `com.nivara.app`
- **Version**: `1.0.0`
- **Category**: Health & Fitness

### Upload Steps
1. Log in to [App Store Connect](https://appstoreconnect.apple.com).
2. Register App ID `com.nivara.app` and create a new App entry.
3. Build the `.ipa` using `eas build -p ios --profile production` or submit via Transporter / Xcode.
4. Select the build in TestFlight or App Store tab.
5. Provide App Store metadata, support URL (`https://nivara-ten.vercel.app`), and privacy URL (`https://nivara-ten.vercel.app/privacy`).
6. Submit for Apple App Store review.
