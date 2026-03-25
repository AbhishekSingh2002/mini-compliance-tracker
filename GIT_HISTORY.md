# Git Commit History Guide

A clean, professional Git history that tells the story of your build.
Run these commands **in order** from the project root.

---

## Initial Setup

```bash
git init
git branch -M main
```

---

## Commit 1 — Project scaffold

```bash
# After creating folder structure and package.json files
git add backend/package.json frontend/package.json frontend/vite.config.js frontend/index.html
git commit -m "chore: initialise project structure (backend + frontend)"
```

---

## Commit 2 — Database layer

```bash
git add backend/db.js
git commit -m "feat(db): set up SQLite schema for clients and tasks with seed data"
```

---

## Commit 3 — REST API

```bash
git add backend/server.js
git commit -m "feat(api): implement CRUD endpoints for clients and tasks

- GET /clients, POST /clients
- GET /tasks/:clientId (with status/category/priority filters), POST /tasks
- PUT /tasks/:id, DELETE /tasks/:id
- GET /stats/:clientId for dashboard aggregates"
```

---

## Commit 4 — API client + global styles

```bash
git add frontend/src/api.js frontend/src/index.css frontend/src/main.jsx
git commit -m "feat(frontend): add axios API helpers and global design system"
```

---

## Commit 5 — Client sidebar

```bash
git add frontend/src/components/ClientList.jsx
git commit -m "feat(ui): add ClientList sidebar with inline add-client form"
```

---

## Commit 6 — Task list with overdue detection

```bash
git add frontend/src/components/TaskList.jsx
git commit -m "feat(ui): add TaskList with expandable cards, status update, delete, and overdue highlighting"
```

---

## Commit 7 — Add task form

```bash
git add frontend/src/components/AddTask.jsx
git commit -m "feat(ui): add AddTask form with title, due date, category, priority, status fields"
```

---

## Commit 8 — Filters

```bash
git add frontend/src/components/Filters.jsx
git commit -m "feat(ui): add Filters component for status, category, and priority"
```

---

## Commit 9 — Root App wiring

```bash
git add frontend/src/App.jsx
git commit -m "feat(app): wire up App layout, client selection, stats dashboard, task refresh flow"
```

---

## Commit 10 — Search + Sort

```bash
git add frontend/src/components/SearchSort.jsx
git commit -m "feat(ui): add search bar and sort controls (due date, priority, title, status)"
```

---

## Commit 11 — Donut stats chart

```bash
git add frontend/src/components/StatsChart.jsx
git commit -m "feat(ui): add SVG donut chart showing task completion breakdown"
```

---

## Commit 12 — Integrate search/sort/chart into App

```bash
git add frontend/src/App.jsx
git commit -m "feat(app): integrate SearchSort and StatsChart; add client-side search + sort logic"
```

---

## Commit 13 — README

```bash
git add README.md
git commit -m "docs: add README with setup, API reference, deployment steps, and tradeoffs"
```

---

## Commit 14 — Git history guide

```bash
git add GIT_HISTORY.md
git commit -m "docs: add structured git commit guide for clean project history"
```

---

## Pushing to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/mini-compliance-tracker.git
git push -u origin main
```

---

## Tips for Your Submission

- Use **conventional commits** format: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
- Each commit should be **one logical change** — reviewers scan commit history
- Keep commit messages under 72 chars on the first line; use body for detail
- A clean history says: "I know how to work in a team"

---

## Commit Message Cheatsheet

| Prefix     | When to use                                      |
|------------|--------------------------------------------------|
| `feat:`    | New feature or UI component                      |
| `fix:`     | Bug fix                                          |
| `chore:`   | Setup, config, tooling, dependencies             |
| `docs:`    | README, comments, guides                         |
| `refactor:`| Code restructure with no behaviour change        |
| `style:`   | CSS, formatting, no logic change                 |
| `test:`    | Adding or fixing tests                           |