const express = require('express');
const { run, get, all } = require('../models/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

/**
 * GET /api/driving-distance/stats — get driving distance stats for the user
 */
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id;

    // Overall driving distance stats
    const stats = await get(
      `SELECT
        COUNT(*) as total_rounds_with_distance,
        AVG(avg_driving_distance) as avg_driving_distance,
        MIN(avg_driving_distance) as shortest_distance,
        MAX(avg_driving_distance) as longest_distance,
        STDDEV(avg_driving_distance) as stddev_distance
       FROM rounds
       WHERE user_id = $1 AND avg_driving_distance IS NOT NULL`,
      [userId]
    );

    // Driving distance trend (last 20 rounds with distance data)
    const trend = await all(
      `SELECT r.id, r.date_played, r.avg_driving_distance, c.name as course_name
       FROM rounds r
       JOIN courses c ON c.id = r.course_id
       WHERE r.user_id = $1 AND r.avg_driving_distance IS NOT NULL
       ORDER BY r.date_played DESC LIMIT 20`,
      [userId]
    );

    res.json({
      stats: {
        totalRoundsWithDistance: Number(stats.total_rounds_with_distance),
        avgDrivingDistance: stats.avg_driving_distance ? Math.round(Number(stats.avg_driving_distance) * 10) / 10 : null,
        shortestDistance: stats.shortest_distance ? Math.round(Number(stats.shortest_distance) * 10) / 10 : null,
        longestDistance: stats.longest_distance ? Math.round(Number(stats.longest_distance) * 10) / 10 : null,
        stddevDistance: stats.stddev_distance ? Math.round(Number(stats.stddev_distance) * 10) / 10 : null
      },
      trend: trend.reverse()
    });
  } catch (err) {
    console.error('[DRIVING_DISTANCE] Stats error:', err.message);
    res.status(500).json({ error: 'Failed to fetch driving distance stats' });
  }
});

module.exports = router;
