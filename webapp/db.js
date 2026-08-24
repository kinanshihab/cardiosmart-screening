const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'cardiosmart.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    consent_given_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS screening_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),

    meds TEXT, meds_list TEXT, smoke TEXT,
    hist TEXT, symptom TEXT, syncope TEXT,
    family_infarkt TEXT, doc_advice TEXT,

    age_start INTEGER, hrs_week REAL, km_run REAL, km_bike REAL, cond_score INTEGER,

    systolic INTEGER, diastolic INTEGER, heartrate INTEGER,
    ntprobnp INTEGER, weight REAL, pr INTEGER, qrs INTEGER, qt INTEGER,

    risk_score INTEGER,
    screening_result TEXT,
    email_copy TEXT
  );
`);

module.exports = db;
