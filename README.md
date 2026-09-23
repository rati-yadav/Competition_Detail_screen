# Feedants — Competition Details Screen

Full-stack implementation of the Competition Details Screen for the Feedants Full Stack Development Internship technical assignment.

---

## Tech Stack

| Layer    | Technology                                      |
| -------- | ----------------------------------------------- |
| Frontend | React 18 + Vite (web, mobile-width layout)      |
| Backend  | Node.js + Express.js                            |
| Database | MongoDB + Mongoose                              |
| Auth     | JWT (Bearer token, 7-day expiry)                |

> **Note:** The assignment specifies React Native. This implementation uses React (web) with a mobile-first layout (max-width 480 px) that mirrors the provided design exactly. All component logic, API integration, and state management patterns are identical to what would be used in React Native.

---

## Project Structure

```
Competition Details Screen/
├── backend/
│   ├── src/
│   │   ├── config/         # MongoDB connection
│   │   ├── controllers/    # Route handlers (auth, competition, registration, leaderboard, user)
│   │   ├── middleware/     # JWT auth, error handler
│   │   ├── models/         # Mongoose schemas (User, Competition, Registration, LeaderboardEntry)
│   │   ├── routes/         # Express routers
│   │   ├── scripts/        # seed.js — populates DB with sample data
│   │   ├── utils/          # AppError, jwt helpers
│   │   ├── app.js          # Express app setup
│   │   └── server.js       # Entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/     # Reusable UI: CountdownTimer, InstructorCard, PrizeList,
    │   │                   #   LeaderboardTable, TabSection, ParticipantAvatars,
    │   │                   #   StatusBadge, BottomNav
    │   ├── context/        # AuthContext (JWT session, login/register/logout)
    │   ├── pages/          # CompetitionDetailsPage, CompetitionsListPage,
    │   │                   #   LoginPage, RegisterPage
    │   ├── services/       # axios API layer (competitionService, registrationService,
    │   │                   #   leaderboardService, authService)
    │   ├── styles/         # global.css with CSS variables
    │   ├── App.jsx         # Routes
    │   └── main.jsx        # Entry point
    ├── index.html
    ├── vite.config.js      # Proxy /api → localhost:5000
    └── package.json
```

---

## Running the Project

### Prerequisites
- Node.js 18+
- MongoDB running locally on port 27017 (or update `MONGODB_URI` in `.env`)

### 1. Backend

```bash
cd backend
npm install

# Copy and edit env (set MONGODB_URI, JWT_SECRET)
copy .env.example .env

# Seed the database with sample competitions, users, leaderboard data
npm run seed

# Start the server (port 5000)
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install

# Start dev server (port 5173)
npm run dev
```

Open **http://localhost:5173** in your browser.

### Demo Credentials (after seeding)

| Role       | Email                    | Password       |
| ---------- | ------------------------ | -------------- |
| User       | priya@example.com        | User@1234      |
| Instructor | mair@feedants.com        | Instructor@123 |
| Admin      | admin@feedants.com       | Admin@123      |

---

## API Endpoints

### Auth
| Method | Path             | Auth     | Description            |
| ------ | ---------------- | -------- | ---------------------- |
| POST   | /api/auth/register | —      | Create account         |
| POST   | /api/auth/login    | —      | Login, receive JWT     |
| GET    | /api/auth/me       | Bearer | Get current user       |

### Competitions
| Method | Path                        | Auth          | Description               |
| ------ | --------------------------- | ------------- | ------------------------- |
| GET    | /api/competitions           | Optional      | List all (paginated)      |
| GET    | /api/competitions/:idOrSlug | Optional      | Competition details + user registration status |
| POST   | /api/competitions           | Admin         | Create competition        |
| PATCH  | /api/competitions/:id       | Admin         | Update competition        |
| DELETE | /api/competitions/:id       | Admin         | Delete competition        |
| GET    | /api/competitions/:id/stats | Admin         | Registration stats        |

### Registrations
| Method | Path                                    | Auth   | Description               |
| ------ | --------------------------------------- | ------ | ------------------------- |
| GET    | /api/registrations/my                   | Bearer | My registrations          |
| POST   | /api/registrations/:competitionId/register | Bearer | Register for competition |
| DELETE | /api/registrations/:competitionId/cancel  | Bearer | Cancel registration      |
| POST   | /api/registrations/:competitionId/submit  | Bearer | Submit entry             |

### Leaderboard
| Method | Path                                          | Auth              | Description       |
| ------ | --------------------------------------------- | ----------------- | ----------------- |
| GET    | /api/leaderboard/:competitionId               | —                 | Public leaderboard|
| GET    | /api/leaderboard/:competitionId/me            | Bearer            | My rank           |
| PATCH  | /api/leaderboard/:competitionId/:userId/score | Admin/Instructor  | Update score      |

---

## Key Technical Decisions

### 1. MongoDB transactions for registration
Registration uses a `findOneAndUpdate` with an atomic `$inc` + `$expr` filter to guarantee slot counts stay consistent under concurrent load. A session/transaction wraps the entire operation (registration document + leaderboard entry creation), so a partial failure never leaves the DB in an inconsistent state.

### 2. Optimistic UI updates
After a successful registration or cancellation, the frontend updates `registeredCount` immediately without waiting for a re-fetch — giving instant feedback while keeping the backend as the source of truth.

### 3. `optionalAuth` middleware
Competition detail routes use optional auth so unauthenticated users get full competition data, while authenticated users also get their own registration status — all in a single API call.

### 4. Denormalized `liveStatus` virtual
`Competition.liveStatus` is a Mongoose virtual computed from the current time and date fields. This means frontend never has to compute state — it just reads the value. The stored `status` field allows manual overrides (e.g., admin can force-cancel).

### 5. Slug-based routing
Competitions are accessible by slug (`/competitions/feedants-classical-dance`) for SEO-friendly and shareable URLs, falling back to ObjectId for internal links.

### 6. Rate limiting
Global: 100 req/15 min per IP. Auth routes: 20 req/15 min per IP. Prevents brute-force attacks and API abuse.

---

## Important Assumptions

1. **Payment** is simulated — `paymentStatus` is set to `completed` for free competitions and `pending` for paid ones. A real implementation would integrate Razorpay/Stripe before marking `completed`.
2. **File uploads** (video/image submissions) are handled via URL submission. A production system would use S3/Cloudinary with pre-signed upload URLs.
3. **Email verification** is scaffolded (the `isVerified` field exists) but not enforced — email sending infrastructure was outside scope.
4. **Judge scoring** supports multiple judges averaging their scores. Public voting can also contribute to `finalScore` via `voteCount` (infrastructure ready, UI not wired).

---

## What I Would Improve for Production

1. **Redis cache** for leaderboard reads — these are read-heavy and can be cached with a 30-second TTL and invalidated on score updates.
2. **WebSocket / SSE** for live countdown and leaderboard updates instead of polling.
3. **Razorpay integration** for the actual payment flow before registration confirmation.
4. **Input sanitisation** via `express-validator` on all POST/PATCH endpoints.
5. **Indexes** tuned after query profiling with real traffic patterns.
6. **Docker Compose** file for one-command local setup.
7. **CI pipeline** (GitHub Actions) running lint + tests on every PR.
