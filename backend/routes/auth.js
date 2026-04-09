const express = require('express');
const bcrypt = require('bcryptjs');
const { run, get } = require('../models/db');
const { generateToken, authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/auth/register
 * Body: { username, email, password, displayName? }
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, displayName } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = await get('SELECT id FROM users WHERE username = $1 OR email = $2', [username, email]);
    if (existing) {
      return res.status(409).json({ error: 'Username or email already taken' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const { lastId } = await run(
      'INSERT INTO users (username, email, password_hash, display_name) VALUES ($1, $2, $3, $4) RETURNING id',
      [username, email, passwordHash, displayName || username]
    );

    const user = { id: lastId, username, email };
    const token = generateToken(user);

    console.log(`[AUTH] User registered: ${username}`);
    res.status(201).json({ user: { ...user, displayName: displayName || username }, token });
  } catch (err) {
    console.error('[AUTH] Register error:', err.message);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await get('SELECT * FROM users WHERE email = $1', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken({ id: user.id, username: user.username, email: user.email });

    console.log(`[AUTH] User logged in: ${user.username}`);
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.display_name,
        handicap: user.handicap
      },
      token
    });
  } catch (err) {
    console.error('[AUTH] Login error:', err.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * GET /api/auth/me — get current user profile
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await get(
      'SELECT id, username, email, display_name, handicap, avatar_url, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    console.error('[AUTH] Me error:', err.message);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

module.exports = router;
