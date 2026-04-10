const express = require('express');
const { all, get } = require('../models/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

/**
 * GET /api/leaderboard — get friends leaderboard for last 30 days
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateThreshold = thirtyDaysAgo.toISOString().split('T')[0];

    // Get all friends (accepted only) + current user
    const friends = await all(
      `SELECT DISTINCT
        CASE WHEN f.requester_id = $1 THEN f.addressee_id ELSE f.requester_id END as friend_id
       FROM friends f
       WHERE (f.requester_id = $1 OR f.addressee_id = $1) AND f.status = 'accepted'`,
      [userId]
    );

    // Build list of user IDs: self + friends
    const userIds = [userId, ...friends.map(f => f.friend_id)];

    // Get aggregated stats for each user for last 30 days
    const leaderboard = await all(
      `SELECT
        u.id,
        u.username,
        u.display_name,
        u.handicap,
        COUNT(r.id) as rounds_count,
        ROUND(AVG(r.total_score)::numeric, 1) as avg_score,
        MIN(r.total_score) as best_score,
        (SELECT date_played FROM rounds WHERE user_id = u.id AND date_played >= $2 ORDER BY total_score ASC LIMIT 1) as best_round_date
       FROM users u
       LEFT JOIN rounds r ON u.id = r.user_id AND r.date_played >= $2
       WHERE u.id = ANY($1::int[])
       GROUP BY u.id, u.username, u.display_name, u.handicap
       ORDER BY COALESCE(AVG(r.total_score), 999), MIN(r.total_score) DESC`,
      [userIds, dateThreshold]
    );

    res.json({ leaderboard });
  } catch (err) {
    console.error('[LEADERBOARD] List error:', err.message);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;
