require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ─── Seed data ────────────────────────────────────────────────────────────────
const ABACUS_SEED = [
  { type: 'abacus', tens: { upper: 0, lower: 1 }, units: { upper: 0, lower: 2 }, answer: 12 },
  { type: 'abacus', tens: { upper: 0, lower: 1 }, units: { upper: 1, lower: 0 }, answer: 15 },
  { type: 'abacus', tens: { upper: 0, lower: 1 }, units: { upper: 1, lower: 4 }, answer: 19 },
  { type: 'abacus', tens: { upper: 0, lower: 2 }, units: { upper: 0, lower: 3 }, answer: 23 },
  { type: 'abacus', tens: { upper: 0, lower: 2 }, units: { upper: 1, lower: 3 }, answer: 28 },
  { type: 'abacus', tens: { upper: 0, lower: 3 }, units: { upper: 0, lower: 1 }, answer: 31 },
  { type: 'abacus', tens: { upper: 0, lower: 3 }, units: { upper: 0, lower: 4 }, answer: 34 },
  { type: 'abacus', tens: { upper: 0, lower: 3 }, units: { upper: 1, lower: 3 }, answer: 38 },
  { type: 'abacus', tens: { upper: 0, lower: 4 }, units: { upper: 0, lower: 1 }, answer: 41 },
  { type: 'abacus', tens: { upper: 0, lower: 4 }, units: { upper: 1, lower: 0 }, answer: 45 },
  { type: 'abacus', tens: { upper: 0, lower: 4 }, units: { upper: 1, lower: 2 }, answer: 47 },
  { type: 'abacus', tens: { upper: 1, lower: 0 }, units: { upper: 0, lower: 2 }, answer: 52 },
  { type: 'abacus', tens: { upper: 1, lower: 0 }, units: { upper: 1, lower: 1 }, answer: 56 },
  { type: 'abacus', tens: { upper: 1, lower: 1 }, units: { upper: 0, lower: 3 }, answer: 63 },
  { type: 'abacus', tens: { upper: 1, lower: 1 }, units: { upper: 1, lower: 0 }, answer: 65 },
  { type: 'abacus', tens: { upper: 1, lower: 2 }, units: { upper: 0, lower: 4 }, answer: 74 },
  { type: 'abacus', tens: { upper: 1, lower: 2 }, units: { upper: 1, lower: 4 }, answer: 79 },
  { type: 'abacus', tens: { upper: 1, lower: 3 }, units: { upper: 0, lower: 3 }, answer: 83 },
  { type: 'abacus', tens: { upper: 1, lower: 4 }, units: { upper: 0, lower: 1 }, answer: 91 },
  { type: 'abacus', tens: { upper: 1, lower: 4 }, units: { upper: 1, lower: 1 }, answer: 96 },
];

const MATH_SEED = [
  { type: 'math', problem: '15 + 3 + 7 + 5',  answer: 30 },
  { type: 'math', problem: '11 + 9 + 4 + 7',  answer: 31 },
  { type: 'math', problem: '34 + 5 + 6 + 2',  answer: 47 },
  { type: 'math', problem: '24 + 8 + 6 + 1',  answer: 39 },
  { type: 'math', problem: '56 + 4 + 9 + 1',  answer: 70 },
  { type: 'math', problem: '74 + 5 + 2 + 7',  answer: 88 },
  { type: 'math', problem: '32 + 6 + 3 + 5',  answer: 46 },
  { type: 'math', problem: '15 + 3 + 2 + 4',  answer: 24 },
  { type: 'math', problem: '35 + 3 + 1 + 8',  answer: 47 },
  { type: 'math', problem: '77 + 2 + 6 + 5',  answer: 90 },
  { type: 'math', problem: '19 + 6 + 3 + 7',  answer: 35 },
  { type: 'math', problem: '28 - 7 + 3 - 1',  answer: 23 },
  { type: 'math', problem: '37 + 2 + 1 + 4',  answer: 44 },
  { type: 'math', problem: '62 + 6 + 2 + 4',  answer: 74 },
  { type: 'math', problem: '15 + 5 + 3 + 8',  answer: 31 },
  { type: 'math', problem: '43 + 7 + 2 + 6',  answer: 58 },
  { type: 'math', problem: '22 + 8 + 5 + 3',  answer: 38 },
  { type: 'math', problem: '61 + 4 + 3 + 2',  answer: 70 },
  { type: 'math', problem: '18 + 7 + 5 + 4',  answer: 34 },
  { type: 'math', problem: '46 - 3 + 8 - 2',  answer: 49 },
  { type: 'math', problem: '53 + 2 + 4 + 6',  answer: 65 },
  { type: 'math', problem: '38 + 7 - 3 + 5',  answer: 47 },
  { type: 'math', problem: '27 + 4 + 8 + 1',  answer: 40 },
  { type: 'math', problem: '64 - 4 + 3 + 7',  answer: 70 },
  { type: 'math', problem: '13 + 6 + 8 + 4',  answer: 31 },
  { type: 'math', problem: '71 + 5 - 2 + 6',  answer: 80 },
  { type: 'math', problem: '45 + 6 + 3 + 1',  answer: 55 },
  { type: 'math', problem: '83 - 6 + 4 - 2',  answer: 79 },
  { type: 'math', problem: '29 + 5 + 3 + 8',  answer: 45 },
  { type: 'math', problem: '66 - 3 + 7 - 1',  answer: 69 },
  { type: 'math', problem: '14 + 9 + 5 + 2',  answer: 30 },
  { type: 'math', problem: '57 + 3 - 4 + 6',  answer: 62 },
  { type: 'math', problem: '42 + 5 + 7 + 3',  answer: 57 },
  { type: 'math', problem: '36 + 4 - 2 + 8',  answer: 46 },
  { type: 'math', problem: '25 + 7 + 6 + 2',  answer: 40 },
  { type: 'math', problem: '73 - 5 + 4 + 3',  answer: 75 },
  { type: 'math', problem: '48 + 2 + 5 - 3',  answer: 52 },
  { type: 'math', problem: '31 + 9 + 4 - 5',  answer: 39 },
  { type: 'math', problem: '67 - 4 + 3 + 5',  answer: 71 },
  { type: 'math', problem: '54 + 6 - 2 + 7',  answer: 65 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Strip answer before sending to client
function safeQ(row) {
  const q = { id: row.id, type: row.type };
  if (row.type === 'math')   q.problem = row.problem;
  if (row.type === 'abacus') { q.thousands = row.thousands; q.hundreds = row.hundreds; q.tens = row.tens; q.units = row.units; }
  return q;
}

// Build per-question detail for submission record
function buildDetail(row, userAnswer) {
  const raw     = userAnswer !== undefined ? String(userAnswer).trim() : '';
  const correct = parseInt(raw, 10) === row.answer;
  const rec     = { questionId: row.id, type: row.type, userAnswer: raw, correctAnswer: row.answer, correct };
  if (row.type === 'math')   rec.problem = row.problem;
  if (row.type === 'abacus') { rec.thousands = row.thousands; rec.hundreds = row.hundreds; rec.tens = row.tens; rec.units = row.units; }
  return rec;
}

// ─── DB setup ─────────────────────────────────────────────────────────────────
async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id         SERIAL       PRIMARY KEY,
        type       VARCHAR(10)  NOT NULL,
        problem    TEXT,
        thousands  JSONB,
        hundreds   JSONB,
        tens       JSONB,
        units      JSONB,
        answer     INTEGER      NOT NULL,
        is_seeded  BOOLEAN      DEFAULT FALSE,
        created_at TIMESTAMPTZ  DEFAULT NOW()
      );
      ALTER TABLE questions ADD COLUMN IF NOT EXISTS thousands JSONB;
      ALTER TABLE questions ADD COLUMN IF NOT EXISTS hundreds  JSONB;

      CREATE TABLE IF NOT EXISTS question_paper (
        singleton    INTEGER      PRIMARY KEY DEFAULT 1,
        name         VARCHAR(255) NOT NULL DEFAULT 'Custom Paper',
        question_ids INTEGER[]    NOT NULL DEFAULT '{}',
        set_at       TIMESTAMPTZ  DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS test_submissions (
        id           SERIAL       PRIMARY KEY,
        name         VARCHAR(255),
        email        VARCHAR(255) NOT NULL,
        score        INTEGER      NOT NULL,
        total        INTEGER      NOT NULL,
        percentage   NUMERIC(5,2) NOT NULL,
        time_taken   INTEGER,
        answers      JSONB        NOT NULL,
        submitted_at TIMESTAMPTZ  DEFAULT NOW()
      );
    `);

    // Seed questions – re-seed if DB count doesn't match expected total
    const expectedCount = ABACUS_SEED.length + MATH_SEED.length;
    const { rows: [{ count }] } = await client.query(
      `SELECT COUNT(*) FROM questions WHERE is_seeded = TRUE`
    );
    if (parseInt(count) !== expectedCount) {
      await client.query(`DELETE FROM questions WHERE is_seeded = TRUE`);
      for (const q of [...ABACUS_SEED, ...MATH_SEED]) {
        await client.query(
          `INSERT INTO questions (type, problem, thousands, hundreds, tens, units, answer, is_seeded)
           VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)`,
          [q.type, q.problem ?? null,
           q.thousands ? JSON.stringify(q.thousands) : null,
           q.hundreds  ? JSON.stringify(q.hundreds)  : null,
           q.tens  ? JSON.stringify(q.tens)  : null,
           q.units ? JSON.stringify(q.units) : null,
           q.answer]
        );
      }
      // Clear any stale paper that references old IDs
      await client.query(`DELETE FROM question_paper WHERE singleton = 1`);
      console.log(`Seeded ${expectedCount} questions (${ABACUS_SEED.length} abacus + ${MATH_SEED.length} math).`);
    }

    console.log('Database ready.');
  } finally {
    client.release();
  }
}

// ─── Student routes ───────────────────────────────────────────────────────────

// GET /api/questions – honour active paper, else random 5+15
app.get('/api/questions', async (_req, res) => {
  try {
    const { rows: paper } = await pool.query(
      `SELECT * FROM question_paper WHERE singleton = 1`
    );

    let questions;
    if (paper.length > 0 && paper[0].question_ids.length > 0) {
      const { rows } = await pool.query(
        `SELECT * FROM questions WHERE id = ANY($1)`,
        [paper[0].question_ids]
      );
      // Abacus first (shuffled within group), then math (shuffled within group)
      const ab = shuffle(rows.filter(q => q.type === 'abacus'));
      const ma = shuffle(rows.filter(q => q.type === 'math'));
      questions = [...ab, ...ma];
    } else {
      const { rows: ab } = await pool.query(
        `SELECT * FROM questions WHERE type = 'abacus' ORDER BY RANDOM() LIMIT 5`
      );
      const { rows: ma } = await pool.query(
        `SELECT * FROM questions WHERE type = 'math' ORDER BY RANDOM() LIMIT 15`
      );
      questions = [...ab, ...ma];
    }

    res.json(questions.map(safeQ));
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to load questions' });
  }
});

// POST /api/submit
app.post('/api/submit', async (req, res) => {
  const { name, email, answers, questionIds, timeTaken } = req.body;
  if (!email || typeof answers !== 'object' || !Array.isArray(questionIds)) {
    return res.status(400).json({ error: 'email, answers, and questionIds are required' });
  }
  try {
    const { rows } = await pool.query(
      `SELECT * FROM questions WHERE id = ANY($1)`,
      [questionIds.map(Number)]
    );
    if (!rows.length) return res.status(400).json({ error: 'No valid questions found' });

    let score = 0;
    const detail = rows.map(q => {
      const rec = buildDetail(q, answers[q.id]);
      if (rec.correct) score++;
      return rec;
    });

    const total      = rows.length;
    const percentage = ((score / total) * 100).toFixed(2);

    const result = await pool.query(
      `INSERT INTO test_submissions (name, email, score, total, percentage, time_taken, answers)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [name || 'Anonymous', email, score, total, percentage, timeTaken || 0, JSON.stringify(detail)]
    );
    res.json({ success: true, submissionId: result.rows[0].id, score, total, percentage, detail });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to save submission' });
  }
});

// GET /api/results
app.get('/api/results', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, email, score, total, percentage, time_taken, submitted_at
       FROM test_submissions ORDER BY submitted_at DESC LIMIT 200`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

// GET /api/results/:id
app.get('/api/results/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM test_submissions WHERE id = $1`, [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch result' });
  }
});

// ─── Admin – questions CRUD ───────────────────────────────────────────────────

app.get('/api/admin/questions', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM questions ORDER BY type DESC, id ASC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

app.post('/api/admin/questions', async (req, res) => {
  const { type, problem, number } = req.body;
  if (!['math', 'abacus'].includes(type)) {
    return res.status(400).json({ error: 'type must be math or abacus' });
  }
  try {
    let finalProblem = null, thousands = null, hundreds = null, tens = null, units = null, answer;

    if (type === 'math') {
      if (!problem) return res.status(400).json({ error: 'problem is required' });
      finalProblem = problem.trim();
      // Evaluate the expression to derive the answer
      const safe = finalProblem.replace(/[^0-9+\-\s]/g, '');
      answer = Function(`"use strict"; return (${safe})`)();
      if (!Number.isFinite(answer)) return res.status(400).json({ error: 'Cannot evaluate expression' });
    } else {
      const n = parseInt(number, 10);
      if (isNaN(n) || n < 1 || n > 9999) {
        return res.status(400).json({ error: 'number must be 1–9999 for abacus' });
      }
      const th = Math.floor(n / 1000), h = Math.floor((n % 1000) / 100), t = Math.floor((n % 100) / 10), u = n % 10;
      thousands = { upper: th >= 5 ? 1 : 0, lower: th >= 5 ? th - 5 : th };
      hundreds  = { upper: h  >= 5 ? 1 : 0, lower: h  >= 5 ? h  - 5 : h  };
      tens      = { upper: t  >= 5 ? 1 : 0, lower: t  >= 5 ? t  - 5 : t  };
      units     = { upper: u  >= 5 ? 1 : 0, lower: u  >= 5 ? u  - 5 : u  };
      answer = n;
    }

    const { rows } = await pool.query(
      `INSERT INTO questions (type, problem, thousands, hundreds, tens, units, answer, is_seeded)
       VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE) RETURNING *`,
      [type, finalProblem,
       thousands ? JSON.stringify(thousands) : null,
       hundreds  ? JSON.stringify(hundreds)  : null,
       tens      ? JSON.stringify(tens)      : null,
       units     ? JSON.stringify(units)     : null,
       answer]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to add question' });
  }
});

app.delete('/api/admin/questions/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    await pool.query(`DELETE FROM questions WHERE id = $1`, [id]);
    // Remove from active paper if present
    await pool.query(
      `UPDATE question_paper
       SET question_ids = array_remove(question_ids, $1)
       WHERE singleton = 1`,
      [id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

// ─── Admin – question paper ───────────────────────────────────────────────────

app.get('/api/admin/question-paper', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM question_paper WHERE singleton = 1`
    );
    res.json(rows[0] ?? null);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch question paper' });
  }
});

app.post('/api/admin/question-paper', async (req, res) => {
  const { name, questionIds } = req.body;
  if (!Array.isArray(questionIds) || questionIds.length === 0) {
    return res.status(400).json({ error: 'questionIds must be a non-empty array' });
  }
  try {
    await pool.query(
      `INSERT INTO question_paper (singleton, name, question_ids, set_at)
       VALUES (1, $1, $2, NOW())
       ON CONFLICT (singleton) DO UPDATE
         SET name = EXCLUDED.name,
             question_ids = EXCLUDED.question_ids,
             set_at = EXCLUDED.set_at`,
      [name || 'Custom Paper', questionIds.map(Number)]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to set question paper' });
  }
});

app.delete('/api/admin/question-paper', async (_req, res) => {
  try {
    await pool.query(`DELETE FROM question_paper WHERE singleton = 1`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear question paper' });
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  try {
    await initDB();
  } catch (err) {
    console.error('DB init failed:', err.message);
    console.error('Make sure DATABASE_URL is set in .env');
  }
  console.log(`Abacus Test → http://localhost:${PORT}`);
  console.log(`Seed pool: ${ABACUS_SEED.length} abacus + ${MATH_SEED.length} math`);
});
