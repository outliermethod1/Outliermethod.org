# Outlier Method — outliermethod.org

The Outdoors Belongs To Everyone.

Next.js site, deployed on Vercel. Design frozen at v2.

## Launch steps

### 1. Push to GitHub
1. Create a new repo on GitHub (e.g. `outlier-method`)
2. From this folder:
   ```
   git init
   git add .
   git commit -m "Outlier Method v1 — frozen design"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/outlier-method.git
   git push -u origin main
   ```

### 2. Deploy on Vercel
1. vercel.com → Add New → Project
2. Import the `outlier-method` repo
3. Framework preset auto-detects Next.js — no config needed
4. Deploy. You'll get a live `*.vercel.app` URL immediately.

### 3. Point outliermethod.org at Vercel
1. In Vercel: Project → Settings → Domains → add `outliermethod.org` and `www.outliermethod.org`
2. At your domain registrar, set DNS records exactly as Vercel's Domains screen instructs
   (typically an A record for the root domain and a CNAME for `www` — use the values
   Vercel shows you, since they can differ by account)
3. Propagation usually takes minutes, sometimes a few hours. Vercel shows a green check when live.

## Day-to-day editing

**`lib/config.js` is your control panel** — cams, ticker items, campfire content,
weather demo values, audio track. Edit → commit → push → Vercel auto-deploys.

## Content slots waiting on you
- `/public/hero.jpg` — hero photo (see the CSS note in `app/globals.css`)
- `/public/amos.jpg`, `/public/eleanor.jpg` — persona portraits (CSS note in same file)
- Cam embed URLs → `lib/config.js` CAMS array
- SoundCloud track URL → `lib/config.js` AUDIO + wiring notes in `components/FieldAudio.jsx`

## Phases (frozen roadmap)
1. **Now:** content, products, wildlife streams, music player, images
2. SEO, Instagram, newsletter (wire the subscribe form to your email provider —
   notes in `components/PathsRow.jsx`)
3. Amos & Eleanor AI — the API route is already stubbed at `app/api/ask/route.js`
   with the Claude call commented in place. Set `ANTHROPIC_API_KEY` in Vercel env vars.
4. Covey integration
