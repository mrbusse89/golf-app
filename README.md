# Golf Tracker

A personal golf round tracking app built with Node/Express + React + SQLite.

## Features

- **Round Logging** — Log rounds with score, putts, fairways, GIR, weather, notes, and optional hole-by-hole scoring
- **Dashboard** — Score trends chart, stat cards, recent rounds, most-played courses
- **Course Directory** — 100 real US courses with search/filter by name, city, state
- **Course Reviews** — Rate courses on overall quality, condition, pace, and value (1-5 stars)
- **Friends** — Send/accept friend requests, view friends' recent rounds
- **Auth** — JWT-based registration and login

## Setup

### Prerequisites
- Node.js 18+
- npm

### Backend
```bash
cd backend
npm install
cp .env.example .env  # or use the existing .env
npm start             # runs on http://localhost:3001
```

### Frontend
```bash
cd frontend
npm install
npm run dev           # runs on http://localhost:5173 (proxies /api to backend)
```

### Production
```bash
cd frontend && npm run build   # builds to frontend/dist
cd ../backend && NODE_ENV=production npm start  # serves API + static frontend
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3001 | Backend server port |
| JWT_SECRET | (dev secret) | Secret for signing JWT tokens |
| DB_PATH | ../database/golf.db | Path to SQLite database file |

## API Endpoints

### Auth
- `POST /api/auth/register` — `{ username, email, password, displayName? }`
- `POST /api/auth/login` — `{ email, password }`
- `GET /api/auth/me` — Get current user (requires auth)

### Rounds (requires auth)
- `POST /api/rounds` — Log a round
- `GET /api/rounds` — List rounds (query: `?courseId=&limit=&offset=&sort=`)
- `GET /api/rounds/:id` — Round detail with hole scores
- `PUT /api/rounds/:id` — Update a round
- `DELETE /api/rounds/:id` — Delete a round

### Courses
- `GET /api/courses` — List courses (query: `?search=&state=&limit=&offset=`)
- `GET /api/courses/:id` — Course detail with review/round stats

### Reviews
- `GET /api/reviews?courseId=` — List reviews for a course
- `POST /api/reviews` — Create review (requires auth)
- `PUT /api/reviews/:id` — Update your review (requires auth)
- `DELETE /api/reviews/:id` — Delete your review (requires auth)

### Friends (requires auth)
- `GET /api/friends` — List friends + pending requests
- `POST /api/friends` — Send request `{ username }`
- `PUT /api/friends/:id` — Accept/decline `{ action: 'accept'|'decline' }`
- `DELETE /api/friends/:id` — Remove friend
- `GET /api/friends/:friendId/rounds` — View friend's rounds

### Dashboard (requires auth)
- `GET /api/dashboard` — Aggregated stats, trends, top courses

## Tech Stack
- **Backend:** Express, sql.js (SQLite), JWT, bcryptjs
- **Frontend:** React 18, React Router, Tailwind CSS, Recharts, Axios
- **Build:** Vite
