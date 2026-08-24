# CardioSmart – Standalone Web App

A self-contained implementation of the CardioSmart cardiovascular screening
platform described in the project's root `README.md`. It reproduces the same
flow that previously lived as WordPress theme snippets (`Registering.html`,
`Samtyckes-overlay.html`, `formulärfrågor-kod.html`, `function.php`) as a
runnable Node.js/Express application with its own database, so it can be
deployed anywhere without a WordPress install.

## Features

- **Landing page** — hero, "why it matters", races section, Karolinska Institutet mention.
- **Registration modal** shown once to first-time visitors (localStorage), plus real account registration/login (bcrypt-hashed passwords, sessions).
- **Digital informed consent** — recorded per user before any screening can be submitted.
- **Interactive health form** — medical history, cardiology anamnesis, symptoms, heredity, training background, and clinical parameters (BP, heart rate, NT-proBNP, weight, ECG intervals), styled as collapsible sections with pill-style option buttons.
- **Smart risk assessment** — the same threshold-based scoring as the original JS, run server-side, with instant SweetAlert2 traffic-light feedback (green/yellow/red).
- **Runner Dashboard** — table of a user's full screening history.
- **Optional email copy** of results (via SMTP if configured, otherwise logged to the console).

## Stack

- Node.js + Express, EJS templates
- SQLite (`better-sqlite3`) for users & screening results, `connect-sqlite3` for sessions
- SweetAlert2 (CDN) for result popups
- Plain CSS (no build step) matching the CardioSmart navy/lavender visual identity

## Getting started

```bash
cd webapp
npm install
cp .env.example .env   # optional: configure SMTP + session secret
npm start
```

Visit `http://localhost:3000`.

The SQLite database is created automatically at `webapp/data/cardiosmart.db`
on first run.

## Project layout

```
webapp/
  server.js       Express app & routes
  db.js           SQLite schema/connection
  risk.js         Shared risk-scoring logic (used server-side; also copied to public/js for reference)
  views/          EJS templates (landing, auth, consent, screening form, dashboard)
  public/         CSS, client-side JS, static assets
```
