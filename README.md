# Code Carnival 3.0 – Heist Day Finale

Real-time Kahoot-style MCQ live quiz built for **Code Carnival 3.0** organised by the **Atmiya Developer Students Club (ADSC)**, Atmiya University.

Engineered to host 2,000 to 3,000 students live on mobile phones with projector presentation, running smoothly on Vercel's free serverless tier and Upstash Redis free tier.

---

## Architecture & Design Overview

- **Aesthetic**: Authentic Money Heist (La Casa de Papel) palette and motifs. Bold display typography, hard borders, Dalí-style original vector masks, bank vault graphics, falling vector banknotes, and inspection board leaderboards with red thread line art. Zero emojis, zero generic gradients, and zero AI filler.
- **24 Original SVG Avatars**: Red jumpsuits, Dali masks in various expressions, Professor glasses, gold bars, cash bundles, vault dials, keycards, walkie-talkies, and sirens.
- **Server-Authoritative Clock & Scoring**: Answers are scored on the server using an atomic Redis Lua script comparing against server timestamp. 1000ms grace window for network lag. Faster answers earn more points; ties broken by cumulative response time.
- **High-Concurrency Scale (2000–3000 players)**:
  - Global game state (`/api/state`) is identical for all players and CDN cached (`Cache-Control: public, s-maxage=1, stale-while-revalidate=2`).
  - No polling during active questions. Clients compute server time offset once via `/api/time` and run the countdown locally.
  - Reveal leaderboard snapshots are computed once under a Redis SETNX lock and cached.
  - One atomic Redis command per submitted answer (`EVAL` Lua script).

---

## 1. Upstash Redis Setup

1. Create a free account at [console.upstash.com](https://console.upstash.com).
2. Click **Create Database**:
   - Name: `code-carnival-heist`
   - Primary Region: Choose closest to your players (e.g. `ap-south-1` Mumbai or nearest available).
   - Eviction: Disable eviction.
3. Under the **REST API** section of your database dashboard, copy:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

---

## 2. Environment Variables

Create `.env.local` for local development or set these in your **Vercel Project Settings > Environment Variables**:

```env
UPSTASH_REDIS_REST_URL="https://your-database.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your_upstash_rest_token_here"

# The room code entered by students to join
GAME_CODE="VAULT36"

# Strong password for the admin stage controller
ADMIN_PASSWORD="super-secret-admin-passphrase"

# Secret unguessable slugs for the routes (do not include leading slash)
# Example: hq-a8f92b7c and screen-99d3e12a
ADMIN_PATH="hq-adsc-stage-control"
SCREEN_PATH="projector-atmiya-live"

# 32+ character random string to sign HMAC player sessions
SESSION_SECRET="atmiya-developer-students-club-secret-token-heist-2026-key"
```

---

## 3. URLs & Routes

Routing uses Next.js middleware rewrites so secret URLs are never leaked or discovered via robots/directory scanners:

| View | Route / Access URL | Purpose |
|---|---|---|
| **Player App** | `https://your-domain.vercel.app/` | Mobile-optimized interface for all participants. |
| **Projector Screen** | `https://your-domain.vercel.app/<SCREEN_PATH>` | 16:9 full-screen projector view with QR code, live clock, big answer cards, leaderboards, audio cues, and confetti. |
| **Admin Stage HQ** | `https://your-domain.vercel.app/<ADMIN_PATH>` | Password-protected host dashboard. Controls transitions, timer overrides, live answer counts, player kicking, and CSV exports. |

---

## 4. Local Development

```bash
# Install dependencies
npm install

# Generate placeholder logos (if not already created)
npm run placeholders

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for players.

---

## 5. Event-Day Checklist

### Phase 1: 4 Hours Before the Event
- [ ] Ensure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are active and responsive.
- [ ] Confirm `/public/brand/adsc-logo.png` and `/public/brand/atmiya-logo.png` are replaced with your official high-res assets.
- [ ] Check `.env` on Vercel and verify `GAME_CODE`, `ADMIN_PATH`, `SCREEN_PATH`, and `ADMIN_PASSWORD`.
- [ ] Open the Admin URL on your phone or laptop. Verify login works.
- [ ] Test the entire game loop with 3–5 phones:
  - Join with mobile numbers.
  - Start Lobby -> Start Q1 -> Answer on phone -> Watch Reveal -> Next Question -> Final.
- [ ] Click **Reset Game** in HQ (type `RESET`) to flush test players before real students join.

### Phase 2: Projector & AV Setup (1 Hour Before)
- [ ] Connect laptop to stage projector via HDMI. Set display mode to **Extended** (not Mirrored) so your admin panel stays hidden.
- [ ] Open Chrome in fullscreen (`F11` on Windows, `Cmd+Shift+F` on macOS) on the projector display navigating to `https://your-domain.vercel.app/<SCREEN_PATH>`.
- [ ] Click anywhere on the screen or click **Tap to enable sound** to unlock audio playback. Test mechanical audio cues (tick/lock/thud).
- [ ] Test QR code readability on the projector screen from the back of the auditorium using a phone camera.

### Phase 3: During the Game (Host Stage Instructions)
- [ ] **Lobby Open**: Open lobby from HQ. Announce game code and display QR code.
- [ ] **Start Round**: Click "Start Game" when crew count reaches expected turnout.
- [ ] **Timing**: Questions countdown automatically. Once ended, the reveal screen appears.
- [ ] **Pacing**: The leaderboard remains on the projector until the host presses **Next Question**. Do not rush students; let them celebrate leaderboard climbs!
- [ ] **Network / Campus Wi-Fi Hiccup**:
  - If a student's connection drops, the app displays a subtle "Reconnecting to the vault..." banner with exponential backoff.
  - If a phone reloads, the player session and score persist via signed session cookies and localStorage using their phone number.
- [ ] **Finale & Prize Distribution**:
  - Advance past Q11 to show the Final Podium and the Top 10 Gift Winners on the projector.
  - Open Admin HQ and click **Export CSV: Top 10** to retrieve winner names and phone numbers for verification.

---

## 6. Upstash Redis Command Budget & Sizing (2500 Players)

Upstash Redis Free Tier provides **10,000 commands/day** (or pay-as-you-go / standard with high soft limits).

### Per-Question Command Breakdown:
1. **Player Join** (one-time for all 2,500 students):
   - Pipeline (`INCR`, `EXPIRE`, `SISMEMBER`) = 3 commands
   - Save player (`HSETNX`, `HGET`, `ZADD`) = 3 commands
   - *Total Joins*: 2,500 × 6 = **15,000 commands** *(done once during lobby entry)*.
2. **Answer Submissions** (per question):
   - Handled via 1 atomic Lua script (`EVAL`) per student.
   - 2,500 players × 1 command = **2,500 commands** per question.
   - For 11 questions = 2,500 × 11 = **27,500 commands**.
3. **Public State Polling (`/api/state`)**:
   - CDN-cached via Vercel Edge (`s-maxage=1, stale-while-revalidate=2`).
   - Hits Redis at most **1 time per second**.
   - 20-minute event duration = ~1,200 requests/commands total.
4. **Reveal Leaderboard Snapshot**:
   - Computed **once per question** under a `SETNX` lock.
   - 11 questions × ~6 commands = **66 commands**.
5. **Player Result Query (`/api/me`)**:
   - Single atomic Lua script (`EVAL`) fetched once after reveal with client jitter.
   - 2,500 players × 11 questions = **27,500 commands**.

### Total Budget:
- Total Commands across 2,500 players & 11 questions: **~71,000 commands**.
- **Important**: The Upstash Free Tier cap is 10,000 commands/day. For an auditorium of 2,000–3,000 live players, upgrade to **Upstash Pay-As-You-Go ($0.20 per 100k requests)**. The total cost for the entire 2-hour event will be **less than $0.20 (approx ₹17 INR)**.

---

## 7. Load Testing with k6

A complete k6 load test script is included at `scripts/loadtest.js`.

### Installation
- Windows (via Chocolatey or winget):
  ```powershell
  winget install k6 --source winget
  ```
- Or download the binary from [k6.io](https://k6.io).

### Running the Load Test
```bash
# Test local deployment
k6 run scripts/loadtest.js

# Test deployed Vercel instance with custom game code
k6 run -e TARGET_URL=https://your-app.vercel.app -e GAME_CODE=VAULT36 scripts/loadtest.js
```

### What to Monitor:
- **`http_req_failed`**: Should stay below 1%.
- **`http_req_duration{endpoint:state}`**: Should average < 100ms thanks to edge CDN caching.
- **`http_req_duration{endpoint:answer}`**: Should maintain p95 < 400ms under full concurrency.

---

## 8. Known Limits & Edge Considerations

1. **Vercel Free Tier Concurrency**:
   - Serverless invocations have concurrency limits on Hobby tier. Because `/api/state` and `/api/reveal` are cached at the edge, serverless function invocation load is drastically reduced. Answer submission (`/api/answer`) hits edge/serverless functions directly; stagger student submission times naturally via question thinking time.
2. **Upstash Daily Free Limit**:
   - As calculated above, 2,500 students will exceed the 10,000 free daily commands. Upgrading to Upstash Pay-As-You-Go for the single day is recommended ($0.20 cost).
3. **Campus Wi-Fi NAT IP**:
   - Rate limiting by IP address is intentionally avoided. A single college Wi-Fi network shares 1 or 2 public IP addresses for all students. Rate-limiting is strictly enforced per phone number/session.
4. **Browser Autoplay Audio**:
   - Modern browsers block Web Audio until the user interacts with the page. The projector view includes a prominent "Tap to enable sound" button for the host to click once before starting.
