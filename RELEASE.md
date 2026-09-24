# Releasing Nur Al-Quran on Google Play

## 1. Create your upload key (once, ever)

Run this in Terminal. It asks for a password and your name/organisation —
**you** choose the password; nobody else needs to know it.

```bash
mkdir -p ~/QURAN/nur-al-quran-keys
"/Applications/Android Studio.app/Contents/jbr/Contents/Home/bin/keytool" -genkeypair -v \
  -keystore ~/QURAN/nur-al-quran-keys/nur-al-quran-upload.jks \
  -alias upload -keyalg RSA -keysize 2048 -validity 10000
```

The key is kept **outside** the project folder so it can never be pushed to
GitHub.

> ⚠️ **Back up `nur-al-quran-upload.jks` and its password** (e.g. an
> encrypted USB drive and a password manager). With Play App Signing
> (default for new apps) Google can reset a lost *upload* key, but it takes
> days and support tickets. Never email it or put it in a public place.

## 2. Tell the build where the key is (once)

```bash
cp android/keystore.properties.example android/keystore.properties
```

Open `android/keystore.properties` and replace the two passwords with the
one you chose. This file is git-ignored — never commit it.

## 3. Build the release bundle (every release)

```bash
JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home" npm run build:release
```

Upload the result in Play Console:
`android/app/build/outputs/bundle/release/app-release.aab`

## 4. Before each new release

In `android/app/build.gradle`, increase `versionCode` by 1 (Play rejects a
repeated number) and update `versionName` (what users see, e.g. `1.1`).

## Play Console checklist

- Privacy policy URL: https://quran-eight-tau.vercel.app/privacy
- Data safety: approximate/precise **location** (used on device for prayer
  times and Qibla, sent to AlAdhan, not stored by us); **app activity**
  (anonymous page counts — no user ids); **user-provided content** only if
  someone sends feedback (optional name/email). No accounts, no ads.
- Permissions to explain: location (prayer times/Qibla), notifications
  (prayer alerts), alarms & reminders (on-time prayer alerts).
- New personal developer accounts must run a closed test with 12+ testers
  for 14 days before applying for production.
