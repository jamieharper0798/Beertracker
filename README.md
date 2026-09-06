# Beer Tracker

A login-gated group app for tracking who's drinking how many beers. Every submission needs a photo,
the group total and a per-person leaderboard update live, and every 100th beer (group-wide) requires
a video as well as a photo.

## Features

- Email/password login and signup (Firebase Authentication)
- Submit a beer with a required photo upload
- Live group total counter
- Live leaderboard ranked by each person's count
- Recent activity feed with thumbnails — click one to view the full photo/video and comment
- Comment on a submission, editable later by whoever posted it
- Delete your own submissions
- Every 100th submission (tracked globally, atomically) requires a video before it will save
- Installable as a home-screen app (PWA) with a custom icon

## How the "every 100th" rule works

A shared counter document is incremented inside a Firestore transaction each time someone submits.
If the number the transaction claims is a multiple of 100, the transaction is aborted unless a video
was already attached — the UI then prompts the user to attach a video and resubmit (their photo stays
picked, no need to redo that part). Doing this inside a transaction keeps it correct even if two
people submit at the exact same moment.

## Setup

This app needs two free accounts (GitHub Pages, where this app is deployed, only serves static
files, so login/database/uploads all come from third-party services):

- [Firebase](https://firebase.google.com/) for login and the shared database (free "Spark" plan —
  no credit card needed).
- [Cloudinary](https://cloudinary.com/) for photo/video uploads (free tier, no credit card needed).
  Firebase's own file storage now requires a paid billing plan even for free-tier usage, so this app
  uses Cloudinary instead.

### Firebase

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com/).
2. **Authentication** → Sign-in method → enable **Email/Password**.
3. **Firestore Database** → create a database (production mode is fine), then paste the contents of
   [`firestore.rules`](./firestore.rules) into the Rules tab and publish.
4. **Project settings** → General → "Your apps" → add a Web app, and note the config values shown
   (`apiKey`, `authDomain`, `projectId`, `messagingSenderId`, `appId`).

### Cloudinary

1. Sign up free at [cloudinary.com](https://cloudinary.com/).
2. Your **Cloud name** is shown on the Dashboard homepage.
3. **Settings → Upload → Upload presets → Add upload preset** → set **Signing Mode** to
   **Unsigned** → Save. Note the preset name (unsigned presets are safe to use directly from the
   browser — Cloudinary just won't let the client set anything beyond what the preset allows).

### Put it together

Copy `.env.example` to `.env` and fill in both sets of values:

```bash
cp .env.example .env
# then fill in the VITE_FIREBASE_* and VITE_CLOUDINARY_* values
```

Install dependencies and run:

```bash
npm install
npm run dev
```

Anyone who signs up through the app becomes part of the same shared group — the group total and
leaderboard are shared across all users of the same Firebase project.

## Deployment (GitHub Pages)

This repo is standalone — it deploys entirely on its own, with no dependency on any other repo or
app. `.github/workflows/deploy-pages.yml` builds it and publishes it to
`https://<owner>.github.io/beertracker/`.

Since this config is baked into the build, add these as **repository secrets** (Settings →
Secrets and variables → Actions → New repository secret), using the same values as your `.env`:

- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_UPLOAD_PRESET`

Then in the Firebase console under **Authentication → Settings → Authorized domains**, add
`<owner>.github.io` — otherwise login will fail on the deployed site with an unauthorized-domain
error (Firebase only allows sign-in from domains you've explicitly listed).

One-time repo setup: **Settings → Pages → Build and deployment → Source** must be set to
"GitHub Actions", and the repo must be public unless you're on a paid GitHub plan.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — type-check and build for production
- `npm run lint` — lint with oxlint
- `npm run preview` — preview the production build
- `npm run gen-icons` — regenerate `public/icons/*` from `scripts/icon-source.png`

## Notes

- Photos and videos are uploaded directly to Cloudinary from the browser via an unsigned upload
  preset; Cloudinary's free tier includes 25GB of storage and 25GB/month of bandwidth.
- To cap upload sizes, set a **Max file size** on the upload preset in Cloudinary's dashboard
  (Settings → Upload → your preset → Advanced options).

## Icon / installing as an app

The app icon lives at `scripts/icon-source.png` (a high-res master) and is resized into every size
the browser tab, home-screen, and PWA manifest need. To change it: replace `scripts/icon-source.png`
with a new square image (at least 512×512, ideally with the subject centered and some padding so it
still looks right once a phone crops it into a circle/squircle), then regenerate:

```bash
npm run gen-icons
```

That overwrites everything in `public/icons/`. On a phone, visiting the deployed site offers an
**Install App** button (or, on iOS Safari, a hint to use Share → Add to Home Screen) that adds it
with this icon and opens it full-screen like a native app.
