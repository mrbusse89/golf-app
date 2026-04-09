const express = require('express');
const { get, all } = require('../models/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

/**
 * GET /api/dashboard — aggregated stats for the logged-in user
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;

    // Overall stats
    const stats = await get(
      `SELECT
        COUNT(*) as total_rounds,
        AVG(total_score) as avg_score,
        MIN(total_score) as best_score,
        MAX(total_score) as worst_score,
        AVG(total_putts) as avg_putts,
        AVG(fairways_hit) as avg_fairways,
        AVG(greens_in_regulation) as avg_gir
       FROM rounds WHERE user_id = $1`,
      [userId]
    );

    // Recent 5 rounds
    const recentRounds = await all(
      `SELECT r.id, r.date_played, r.total_score, r.total_putts, c.name as course_name, c.par as course_par
       FROM rounds r JOIN courses c ON c.id = r.course_id
       WHERE r.user_id = $1
       ORDER BY r.date_played DESC LIMIT 5`,
      [userId]
    );

    // Score trend (last 20 rounds for charting)
    const scoreTrend = await all(
      `SELECT r.date_played, r.total_score, c.par as course_par, c.name as course_name
       FROM rounds r JOIN courses c ON c.id = r.course_id
       WHERE r.user_id = $1
       ORDER BY r.date_played DESC LIMIT 20`,
      [userId]
    );

    // Most played courses
    const topCourses = await all(
      `SELECT c.id, c.name, c.par, COUNT(*) as times_played, AVG(r.total_score) as avg_score, MIN(r.total_score) as best_score
       FROM rounds r JOIN courses c ON c.id = r.course_id
       WHERE r.user_id = $1
       GROUP BY c.id, c.name, c.par ORDER BY times_played DESC LIMIT 5`,
      [userId]
    );

    // Scoring distribution
    const scoringBreakdown = await get(
      `SELECT
        SUM(CASE WHEN hs.strokes <= par_per_hole - 2 THEN 1 ELSE 0 END) as eagles_or_better,
        SUM(CASE WHEN hs.strokes = par_per_hole - 1 THEN 1 ELSE 0 END) as birdies,
        SUM(CASE WHEN hs.strokes = par_per_hole THEN 1 ELSE 0 END) as pars,
        SUM(CASE WHEN hs.strokes = par_per_hole + 1 THEN 1 ELSE 0 END) as bogeys,
        SUM(CASE WHEN hs.strokes = par_per_hole + 2 THEN 1 ELSE 0 END) as double_bogeys,
        SUM(CASE WHEN hs.strokes >= par_per_hole + 3 THEN 1 ELSE 0 END) as triple_plus,
        COUNT(*) as total_holes
       FROM hole_scores hs
       JOIN rounds r ON r.id = hs.round_id
       JOIN (SELECT id, CAST(par AS REAL) / holes as par_per_hole FROM courses) cp ON cp.id = r.course_id
       WHERE r.user_id = $1`,
      [userId]
    );

    res.json({
      stats: {
        totalRounds: Number(stats.total_rounds),
        avgScore: stats.avg_score ? Math.round(Number(stats.avg_score) * 10) / 10 : null,
        bestScore: stats.best_score,
        worstScore: stats.worst_score,
        avgPutts: stats.avg_putts ? Math.round(Number(stats.avg_putts) * 10) / 10 : null,
        avgFairways: stats.avg_fairways ? Math.round(Number(stats.avg_fairways) * 10) / 10 : null,
        avgGir: stats.avg_gir ? Math.round(Number(stats.avg_gir) * 10) / 10 : null
      },
      recentRounds,
      scoreTrend: scoreTrend.reverse(),
      topCourses,
      scoringBreakdown
    });
  } catch (err) {
    console.error('[DASHBOARD] Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

module.exports = router;
