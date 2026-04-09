const express = require('express');
const { run, get, all } = require('../models/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

/**
 * GET /api/friends — list user's friends and pending requests
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;

    // Accepted friends (both directions)
    const friends = await all(
      `SELECT f.id as friendship_id, f.status, f.created_at,
              CASE WHEN f.requester_id = $1 THEN f.addressee_id ELSE f.requester_id END as friend_id,
              u.username, u.display_name, u.handicap
       FROM friends f
       JOIN users u ON u.id = CASE WHEN f.requester_id = $2 THEN f.addressee_id ELSE f.requester_id END
       WHERE (f.requester_id = $3 OR f.addressee_id = $4) AND f.status = 'accepted'
       ORDER BY u.username`,
      [userId, userId, userId, userId]
    );

    // Pending requests received
    const pendingReceived = await all(
      `SELECT f.id as friendship_id, f.created_at, u.id as friend_id, u.username, u.display_name
       FROM friends f JOIN users u ON u.id = f.requester_id
       WHERE f.addressee_id = $1 AND f.status = 'pending'`,
      [userId]
    );

    // Pending requests sent
    const pendingSent = await all(
      `SELECT f.id as friendship_id, f.created_at, u.id as friend_id, u.username, u.display_name
       FROM friends f JOIN users u ON u.id = f.addressee_id
       WHERE f.requester_id = $1 AND f.status = 'pending'`,
      [userId]
    );

    res.json({ friends, pendingReceived, pendingSent });
  } catch (err) {
    console.error('[FRIENDS] List error:', err.message);
    res.status(500).json({ error: 'Failed to fetch friends' });
  }
});

/**
 * POST /api/friends — send friend request
 */
router.post('/', async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const target = await get('SELECT id, username, display_name FROM users WHERE username = $1', [username]);
    if (!target) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (target.id === req.user.id) {
      return res.status(400).json({ error: "You can't friend yourself" });
    }

    // Check if friendship already exists (either direction)
    const existing = await get(
      `SELECT id, status FROM friends
       WHERE (requester_id = $1 AND addressee_id = $2) OR (requester_id = $3 AND addressee_id = $4)`,
      [req.user.id, target.id, target.id, req.user.id]
    );
    if (existing) {
      return res.status(409).json({ error: `Friend request already ${existing.status}` });
    }

    const { lastId } = await run(
      'INSERT INTO friends (requester_id, addressee_id) VALUES ($1, $2) RETURNING id',
      [req.user.id, target.id]
    );

    res.status(201).json({
      friendship: { id: lastId, status: 'pending', friend: target }
    });
  } catch (err) {
    console.error('[FRIENDS] Request error:', err.message);
    res.status(500).json({ error: 'Failed to send friend request' });
  }
});

/**
 * PUT /api/friends/:id — accept or decline a friend request
 */
router.put('/:id', async (req, res) => {
  try {
    const { action } = req.body;
    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({ error: 'Action must be accept or decline' });
    }

    const friendship = await get(
      'SELECT * FROM friends WHERE id = $1 AND addressee_id = $2 AND status = $3',
      [req.params.id, req.user.id, 'pending']
    );
    if (!friendship) {
      return res.status(404).json({ error: 'Pending friend request not found' });
    }

    const newStatus = action === 'accept' ? 'accepted' : 'declined';
    await run('UPDATE friends SET status = $1 WHERE id = $2', [newStatus, req.params.id]);

    res.json({ message: `Friend request ${newStatus}` });
  } catch (err) {
    console.error('[FRIENDS] Response error:', err.message);
    res.status(500).json({ error: 'Failed to respond to friend request' });
  }
});

/**
 * DELETE /api/friends/:id — remove a friend
 */
router.delete('/:id', async (req, res) => {
  try {
    const friendship = await get(
      'SELECT id FROM friends WHERE id = $1 AND (requester_id = $2 OR addressee_id = $3)',
      [req.params.id, req.user.id, req.user.id]
    );
    if (!friendship) {
      return res.status(404).json({ error: 'Friendship not found' });
    }

    await run('DELETE FROM friends WHERE id = $1', [req.params.id]);
    res.json({ message: 'Friend removed' });
  } catch (err) {
    console.error('[FRIENDS] Delete error:', err.message);
    res.status(500).json({ error: 'Failed to remove friend' });
  }
});

/**
 * GET /api/friends/:friendId/rounds — view a friend's recent rounds
 */
router.get('/:friendId/rounds', async (req, res) => {
  try {
    const userId = req.user.id;
    const friendId = Number(req.params.friendId);

    // Verify they're friends
    const friendship = await get(
      `SELECT id FROM friends
       WHERE ((requester_id = $1 AND addressee_id = $2) OR (requester_id = $3 AND addressee_id = $4))
       AND status = 'accepted'`,
      [userId, friendId, friendId, userId]
    );
    if (!friendship) {
      return res.status(403).json({ error: 'Not friends with this user' });
    }

    const rounds = await all(
      `SELECT r.id, r.date_played, r.total_score, r.total_putts, c.name as course_name, c.par as course_par
       FROM rounds r JOIN courses c ON c.id = r.course_id
       WHERE r.user_id = $1 ORDER BY r.date_played DESC LIMIT 20`,
      [friendId]
    );

    res.json({ rounds });
  } catch (err) {
    console.error('[FRIENDS] Rounds error:', err.message);
    res.status(500).json({ error: 'Failed to fetch friend rounds' });
  }
});

module.exports = router;
