# ComplianceOS — Mini Compliance Tracker

A SaaS-style compliance task management system for tracking regulatory tasks per client.

---

## 📁 Project Structure

```
mini-compliance-tracker/
│
├── backend/
│   ├── db.js                  # SQLite setup + seed data
│   ├── server.js              # Express app entry + route mounting
│   ├── package.json
│   └── routes/
│       ├── clients.js         # CRUD routes for clients
│       └── tasks.js           # CRUD + filter + stats routes for tasks
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx           # React entry point
│       ├── index.css          # Global design system + CSS variables
│       ├── api.js             # Axios API helpers
│       ├── App.jsx            # Root layout + state + search/sort logic
│       └── components/
│           ├── ClientList.jsx # Sidebar: client list + add client form
│           ├── TaskList.jsx   # Task cards: expand, update status, delete
│           ├── AddTask.jsx    # New task form (6 fields)
│           ├── Filters.jsx    # Status / category / priority dropdowns
│           ├── SearchSort.jsx # Search bar + sort dropdown
│           └── StatsChart.jsx # SVG donut chart: completion breakdown
│
├── README.md
└── GIT_HISTORY.md
```

---

## ⚙️ Setup & Running Locally

### Backend

```bash
cd backend
npm install
npm start          # runs on http://localhost:5000
# dev mode with auto-reload:
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev        # runs on http://localhost:3000
```

> The Vite dev server proxies `/clients`, `/tasks`, `/stats` to `localhost:5000` automatically — no CORS issues in development.

---

## 🔌 API Endpoints

### Clients

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/clients` | All clients |
| GET | `/clients/:id` | Single client |
| POST | `/clients` | Create client |
| PUT | `/clients/:id` | Update client |
| DELETE | `/clients/:id` | Delete client + all its tasks |

### Tasks

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/tasks/:clientId` | Tasks for a client (filterable) |
| GET | `/tasks/single/:id` | Single task by ID |
| POST | `/tasks` | Create task |
| PUT | `/tasks/:id` | Update any task field |
| DELETE | `/tasks/:id` | Delete task |

### Stats

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/stats/:clientId` | Task counts: total, completed, pending, in_progress, overdue |

### Filter Query Params (`GET /tasks/:clientId`)

```
?status=Pending|In Progress|Completed
?category=Tax|Compliance|Legal|HR|Regulatory|Audit|General
?priority=High|Medium|Low
```

---

## ✅ Features

- 👥 View, add, and manage multiple clients
- ✅ Add, update, delete compliance tasks per client
- 🔴 Automatic overdue detection — any Pending/In-Progress task past its due date is flagged
- 📊 Per-client stats dashboard: total, completed, in progress, pending, overdue
- 🍩 SVG donut chart showing completion % breakdown
- 🔍 Live search across task title, description, and category
- ↕️ Sort by: due date ↑↓, priority, title A–Z, status
- 🎛 Filter by status, category, and priority (server-side SQL)
- 🎨 Dark-mode SaaS UI with color-coded priority bars and status badges

---

## 🧾 Tradeoffs & Assumptions

- **SQLite** — chosen for zero-config simplicity; swap with PostgreSQL for production
- **No authentication** — single-user internal tool; add JWT middleware to scale
- **No pagination** — reasonable task volumes per client; add `LIMIT/OFFSET` to scale
- **Overdue is computed, not stored** — frontend derives it from `due_date < today`; never written to DB
- **Search is client-side** — runs on already-fetched data via `useMemo`; filters are server-side SQL
- **Basic validation only** — title and due date required; no complex business rules

---

## 🚀 Deployment

### Backend → Render / Railway

1. Push `backend/` to GitHub
2. Create Web Service → start command: `node server.js`
3. Copy the deployed URL (e.g. `https://compliance-api.onrender.com`)

### Frontend → Vercel / Netlify

1. Push `frontend/` to GitHub
2. Set env variable: `VITE_API_URL=https://your-backend-url`
3. Deploy

---

## 💡 Design Philosophy

> "Focused on shipping a working product quickly with clean structure and clear APIs. Prioritized usability over UI complexity."