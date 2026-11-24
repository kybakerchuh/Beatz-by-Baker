# Beatz by Baker

Arrow-key (`←`, `↓`, `↑`, `→`) 4-lane rhythm game synced to shuffled YouTube playlists, featuring Ohio State Test (OST) Algebra 1 Math Gateways, Google Sign-In student progress persistence, and live leaderboards.

## Features
- **Shuffled Multi-Playlist Library**: Merges all tracks from both configured YouTube playlists and shuffles them randomly so genres are mixed evenly, with a **Shuffle** button to re-randomize anytime.
- **4 Difficulties**: Easy, Medium, Hard, and Expert with progressive scroll speeds and note densities, plus a per-song BPM calibration slider and `CUSTOM_SONGS` override list in `src/config/songs.ts`.
- **OST Algebra 1 Math Gateways**: The first 5 songs are unlocked to start; solving an OST question lets students unlock whichever song they choose. Restricted YouTube embeds automatically skip to the next unlocked track.
- **Google Sign-In & Class Leaderboards**: Students can sign in with Google to save their unlocked songs and math accuracy across devices and compete on **OST Questions Correct**, **All-Songs High Score**, and **Song High Scores** leaderboards.

## Local Development

```bash
npm install
npm run dev
```

The dev server starts at `http://localhost:3000`.

## Deploying to GitHub Pages

This repository includes `.github/workflows/deploy.yml` and relative asset resolution (`base: './'` in `vite.config.ts`) so it deploys directly to GitHub Pages:

1. Push the repository to GitHub (`main` or `master` branch).
2. In GitHub **Settings → Pages**, set **Source** to **GitHub Actions**.
3. **Authorize your GitHub Pages domain for Google Sign-In**:
   - Open the [Firebase Console](https://console.firebase.google.com/) for your project.
   - Go to **Authentication → Settings → Authorized domains**.
   - Click **Add domain** and add `<your-username>.github.io` (or your custom domain).

## Optional Environment Overrides

By default, Firebase reads settings from `firebase-applet-config.json`. To point at a different Firebase project, configure `VITE_FIREBASE_*` variables (see `.env.example`).
