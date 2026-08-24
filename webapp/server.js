require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const db = require('./db');
const { assessRisk } = require('./risk');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    store: new SQLiteStore({ db: 'sessions.db', dir: path.join(__dirname, 'data') }),
    secret: process.env.SESSION_SECRET || 'cardiosmart-dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 },
  })
);

// --- Mailer (optional — falls back to console logging if SMTP is not configured) ---
let transporter = null;
if (process.env.SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
}

async function sendResultEmail(to, result, record) {
  const subject = 'Ditt screeningsresultat från CardioSmart';
  const html = `
    <html><body style="font-family:Inter,sans-serif;color:#333;">
      <p>Hej!</p>
      <p>Tack för att du gjorde en hälsoscreening hos <strong>CardioSmart</strong>. Här är dina resultat:</p>
      <p>Datum: ${new Date(record.created_at).toLocaleString('sv-SE')}</p>
      <p>Signal: <strong style="color:${result.color};text-transform:uppercase;">${result.cls}</strong></p>
      <h4 style="margin-top:1.5rem;">— Kliniska värden —</h4>
      <ul>
        <li>Blodtryck: ${record.systolic}/${record.diastolic} mmHg</li>
        <li>Vilopuls: ${record.heartrate} bpm</li>
        <li>NT-proBNP: ${record.ntprobnp} ng/L</li>
        <li>Vikt: ${record.weight} kg</li>
        <li>PR/QRS/QT: ${record.pr}/${record.qrs}/${record.qt} ms</li>
      </ul>
      <p style="margin-top:2rem;color:#777;">Med vänliga hälsningar,<br>CardioSmart-teamet</p>
    </body></html>`;

  if (!transporter) {
    console.log(`[mail:stub] Would send screening result email to ${to}\n${subject}`);
    return;
  }
  await transporter.sendMail({
    from: '"CardioSmart-teamet" <noreply@cardiosmart.nu>',
    to,
    subject,
    html,
  });
}

// --- Auth helpers ---
function requireAuth(req, res, next) {
  if (!req.session.userId) return res.redirect('/login');
  next();
}

function getCurrentUser(req) {
  if (!req.session.userId) return null;
  return db.prepare('SELECT id, name, email, consent_given_at FROM users WHERE id = ?').get(req.session.userId);
}

app.use((req, res, next) => {
  res.locals.currentUser = getCurrentUser(req);
  next();
});

// --- Routes: marketing / landing page ---
app.get('/', (req, res) => {
  res.render('index');
});

// --- Auth: register ---
app.get('/register', (req, res) => {
  if (req.session.userId) return res.redirect('/screening');
  res.render('register', { error: null });
});

app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.render('register', { error: 'Alla fält är obligatoriska.' });
  }
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) {
    return res.render('register', { error: 'Det finns redan ett konto med den e-postadressen.' });
  }
  const hash = await bcrypt.hash(password, 10);
  const info = db
    .prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
    .run(name, email.toLowerCase(), hash);
  req.session.userId = info.lastInsertRowid;
  res.redirect('/consent');
});

// --- Auth: login ---
app.get('/login', (req, res) => {
  if (req.session.userId) return res.redirect('/screening');
  res.render('login', { error: null });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get((email || '').toLowerCase());
  if (!user || !(await bcrypt.compare(password || '', user.password_hash))) {
    return res.render('login', { error: 'Fel e-postadress eller lösenord.' });
  }
  req.session.userId = user.id;
  res.redirect(user.consent_given_at ? '/screening' : '/consent');
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

// --- Consent (informed consent, digital equivalent of Samtyckes-overlay.html) ---
app.get('/consent', requireAuth, (req, res) => {
  if (res.locals.currentUser.consent_given_at) return res.redirect('/screening');
  res.render('consent');
});

app.post('/consent/accept', requireAuth, (req, res) => {
  db.prepare("UPDATE users SET consent_given_at = datetime('now') WHERE id = ?").run(req.session.userId);
  res.redirect('/screening');
});

app.post('/consent/decline', requireAuth, (req, res) => {
  res.redirect('/');
});

// --- Screening form ---
app.get('/screening', requireAuth, (req, res) => {
  if (!res.locals.currentUser.consent_given_at) return res.redirect('/consent');
  res.render('screening');
});

app.post('/screening', requireAuth, async (req, res) => {
  if (!res.locals.currentUser.consent_given_at) {
    return res.status(403).json({ error: 'Samtycke krävs innan screening kan genomföras.' });
  }

  const f = req.body;
  const hist = Array.isArray(f['hist[]']) ? f['hist[]'] : f['hist[]'] ? [f['hist[]']] : [];
  const symptom = Array.isArray(f['symptom[]']) ? f['symptom[]'] : f['symptom[]'] ? [f['symptom[]']] : [];

  const result = assessRisk({
    meds: f.meds,
    smoke: f.smoke,
    syncope: f.syncope,
    family_infarkt: f.family_infarkt,
    doc_advice: f.doc_advice,
    hist,
    symptom,
    systolic: f.systolic,
    diastolic: f.diastolic,
    heartrate: f.heartrate,
    ntprobnp: f.ntprobnp,
    weight: f.weight,
    pr: f.pr,
    qrs: f.qrs,
    qt: f.qt,
  });

  const info = db
    .prepare(
      `INSERT INTO screening_results (
        user_id, meds, meds_list, smoke, hist, symptom, syncope, family_infarkt, doc_advice,
        age_start, hrs_week, km_run, km_bike, cond_score,
        systolic, diastolic, heartrate, ntprobnp, weight, pr, qrs, qt,
        risk_score, screening_result, email_copy
      ) VALUES (@user_id, @meds, @meds_list, @smoke, @hist, @symptom, @syncope, @family_infarkt, @doc_advice,
        @age_start, @hrs_week, @km_run, @km_bike, @cond_score,
        @systolic, @diastolic, @heartrate, @ntprobnp, @weight, @pr, @qrs, @qt,
        @risk_score, @screening_result, @email_copy)`
    )
    .run({
      user_id: req.session.userId,
      meds: f.meds || null,
      meds_list: f.meds_list || null,
      smoke: f.smoke || null,
      hist: JSON.stringify(hist),
      symptom: JSON.stringify(symptom),
      syncope: f.syncope || null,
      family_infarkt: f.family_infarkt || null,
      doc_advice: f.doc_advice || null,
      age_start: f.age_start ? Number(f.age_start) : null,
      hrs_week: f.hrs_week ? Number(f.hrs_week) : null,
      km_run: f.km_run ? Number(f.km_run) : null,
      km_bike: f.km_bike ? Number(f.km_bike) : null,
      cond_score: f.cond_score ? Number(f.cond_score) : null,
      systolic: Number(f.systolic),
      diastolic: Number(f.diastolic),
      heartrate: Number(f.heartrate),
      ntprobnp: Number(f.ntprobnp),
      weight: Number(f.weight),
      pr: Number(f.pr),
      qrs: Number(f.qrs),
      qt: Number(f.qt),
      risk_score: result.risk,
      screening_result: result.cls,
      email_copy: f.email_copy || null,
    });

  const record = db.prepare('SELECT * FROM screening_results WHERE id = ?').get(info.lastInsertRowid);

  if (f.email_copy) {
    try {
      await sendResultEmail(f.email_copy, result, record);
    } catch (err) {
      console.error('Failed to send result email:', err.message);
    }
  }

  res.json({ ...result, created_at: record.created_at });
});

// --- Runner dashboard ---
app.get('/dashboard', requireAuth, (req, res) => {
  const rows = db
    .prepare('SELECT * FROM screening_results WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.session.userId);
  res.render('dashboard', { rows });
});

app.listen(PORT, () => {
  console.log(`CardioSmart webapp running at http://localhost:${PORT}`);
});
