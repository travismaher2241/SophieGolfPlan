# Sophie Smashes ⛳

A tap-to-record golf progress app for Sophie. It tracks her improvement beyond the scorecard, using the
U.S. Kids Golf Player Pathway (Levels 1–5), the Level 4 and 5 assessment sheets, the Player Development
pyramid and the Swing Speed Development sheet.

Everything is buttons. The only text box is in Settings, where a grown-up can add course names.

## What it records

- **Pathway**: every Form for Levels 1–5 (tap when she can say it and show it) and every Skills test,
  grouped into the five Achievement Pins: Putting, Around the Green, Full Swing, Knowledge and Scoring.
- **Skills tests**: tap each ball ✓/✗, tap strokes per ball, or fill the Level 4/5 putting grid
  (4 stations × 3 rounds). The app checks it against the pass mark and charts every attempt.
- **Rounds**: per hole, tap par, tee shot (left / fairway / right / trouble), score, putts, penalties,
  bunker, and whether she used her Plan · Setup · Play routine. Shows putts per hole, fairways, greens in
  regulation, saved par, 3-putts, penalties and routine %, last 5 rounds vs the 5 before.
- **Swing speed**: driver club speed and carry, with her percentile for girls her height, the U.S. Kids
  driver recommendation, next speed goal, and optimal launch and spin.
- **Practice log**: what she practised, for how long, and how fun it was.
- **Progress**: pins by level, 9-hole score chart against the next pyramid goal (54 → 51 → 48 … 36).

## Setup

### 1. Firebase

1. Create a project at <https://console.firebase.google.com>.
2. **Build → Authentication → Get started → Sign-in method → Google → Enable.**
3. **Build → Firestore Database → Create database** (production mode).
4. **Firestore → Rules**: paste in `firestore.rules` from this repo and Publish. Each Google account can
   only see its own data.
5. **Project settings → Your apps → Web app (`</>`)**: register an app and copy the config values.
6. **Authentication → Settings → Authorized domains**: add the Vercel domain (e.g. `sophie-smashes.vercel.app`).

### 2. Vercel

Import this repo in Vercel (framework preset: Vite) and add these environment variables from step 5,
then redeploy:

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

Sign in on each phone with the same family Google account so the data is shared. On iPhone, open the
site in Safari → Share → **Add to Home Screen** for an app icon.

Without the Firebase variables the app still runs, saving to that one device only.

### Offline on the course

Firestore's offline cache is on, so taps save instantly with no signal and sync when the phone is back online.

## Develop

```
npm install
cp .env.example .env.local   # fill in Firebase values, or leave blank for device-only mode
npm run dev
```

Curriculum lives in `src/data/curriculum.js` and the swing-speed tables in `src/data/swing.js`.
