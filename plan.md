# Nephew's Learning Game — Product Architecture

## Tech Stack

| Component | Choice | Reason |
|-----------|--------|--------|
| Framework | NestJS | Robust, TypeScript, scalable |
| Database | Supabase | Free tier, PostgreSQL, Auth built-in |
| Auth | Supabase Auth (Numeric ID + non-expiring session) | Simple for a child, no passwords |
| Storage | Supabase Storage | For sounds/animations when provided |
| Deployment | Vercel | Free tier, fast CDN |
| Email | None | Not needed for this app |

---

## Stages

### Stage 1: Foundation
**Goal:** Initialize project, configure environment variables.

**Deliverables:**
- NestJS project scaffolded
- `.env` file with Supabase credentials
- Project structure (modules for auth, game, levels)
- TypeScript configuration

---

### Stage 2: Database Schema
**Goal:** Design and create all database tables.

**Deliverables:**
- `profiles` table: `id` (numeric), `created_at`, `current_level`
- `levels` table: `id`, `letter`, `position_index`, `options` (array of 3 letters), `is_active`
- Database migrations
- Seed data: Level 1 with letter A

---

### Stage 3: Auth Module
**Goal:** Simple numeric ID registration + non-expiring session login.

**Deliverables:**
- Registration endpoint: generates next available numeric ID (1, 2, 3...)
- Login endpoint: accepts numeric ID, returns session
- Session never expires (no refresh token logic)
- Cookie-based session for browser persistence

---

### Stage 4: Game Core — Level Display & Controller Input
**Goal:** Display letter, 3 selection boxes, handle PS controller input via Web Gamepad API.

**Deliverables:**
- `GET /levels/:id` endpoint returning letter + 3 box options
- Frontend: Display large letter image in center
- Frontend: 3 boxes (2 with letters, 1 empty as the "mover" position)
- Frontend: Web Gamepad API integration to detect controller button presses
- Visual selector moves between boxes via D-pad
- X button confirms selection

---

### Stage 5: Answer Validation & Feedback
**Goal:** Validate answer, play sound, show UI feedback.

**Deliverables:**
- `POST /levels/:id/answer` endpoint: validates selected box vs correct answer
- Frontend: On correct → play success sound + green UI flash → auto-advance to next level
- Frontend: On wrong → play wrong sound + red UI flash → auto-retry same level
- Sound files stored in Supabase Storage (placeholder sounds initially)

---

### Stage 6: Level Progression Engine
**Goal:** Unlock next level on correct answer, persist progress.

**Deliverables:**
- Backend: On correct answer, increment `current_level` in profile
- Backend: Next level is revealed only when previous is completed
- Frontend: Dashboard shows levels 1-N with current level highlighted
- Only current level is playable

---

### Stage 7: Dashboard
**Goal:** Simple level selection screen.

**Deliverables:**
- `GET /profile` endpoint returning profile with `current_level`
- Frontend: List of levels 1, 2, 3... with current level marked
- "Start Game" button to begin current level
- No settings needed yet

---

### Stage 8: Deployment
**Goal:** Live on Vercel.

**Deliverables:**
- Vercel project configured for NestJS
- Environment variables set in Vercel dashboard
- Production URL for the game

---

## Out of Scope (User Did NOT Request)

- Numbers (only letters for now)
- Multiple languages
- Admin dashboard
- Parent/teacher accounts
- Progress analytics
- Animations (user will provide later)
- Mobile responsive design (browser + TV focus)
- Sound file assets (placeholder sounds used until user provides)
- PS5/advanced controller support beyond Web Gamepad API standard

---

## User-Provided Assets (To Be Integrated Later)

- Sound effects (right answer / wrong answer)
- Animation files
- Letter images (when available)

---

*Plan locked pending user approval. Update this file if scope changes.*