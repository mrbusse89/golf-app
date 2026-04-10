const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const fs = require('fs');
const { getDb, get } = require('./models/db');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${req.method}] ${req.originalUrl} → ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/rounds', require('./routes/rounds'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/friends', require('./routes/friends'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

// Initialize DB then start server
async function start() {
  try {
    await getDb();

    // Seed database with courses if needed
    const pool = new Pool(
      process.env.DATABASE_URL
        ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
        : {
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            database: process.env.DB_NAME || 'golf_app',
          }
    );

    const courseCount = await get('SELECT COUNT(*) as count FROM courses');
    const count = Number(courseCount.count);

    if (count === 0) {
      // Load initial seed data
      const seedPath = path.resolve(__dirname, '../database/seed.sql');
      if (fs.existsSync(seedPath)) {
        const seed = fs.readFileSync(seedPath, 'utf-8');
        await pool.query(seed);
        console.log('[DB] Seed data loaded');
      }
    }

    // Always try to load additional courses (uses ON CONFLICT DO NOTHING)
    const extraSeeds = [
      path.resolve(__dirname, '../database/michigan_courses.sql'),
    ];
    for (const seedFile of extraSeeds) {
      if (fs.existsSync(seedFile)) {
        const sql = fs.readFileSync(seedFile, 'utf-8');
        await pool.query(sql);
        console.log(`[DB] Loaded ${path.basename(seedFile)}`);
      }
    }

    await pool.end();

    const finalCount = await get('SELECT COUNT(*) as count FROM courses');
    console.log(`[DB] ${finalCount.count} courses loaded`);

    app.listen(PORT, () => {
      console.log(`[SERVER] Golf App API running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[SERVER] Failed to start:', err);
    process.exit(1);
  }
}

start();
