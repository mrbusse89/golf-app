const express = require('express');
const { run, get, all } = require('../models/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All routes require auth
router.use(authenticate);

/**
 * GET /api/handicap — get current handicap and trend data
 * Returns current handicap index and historical data for trending
 */
router.get('/', async (req, res) => {
  try {
    // Get the last 20 rounds for this user (ordered by date)
    const rounds = await all(
      `SELECT r.id, r.total_score, r.date_played, c.course_rating, c.slope_rating
       FROM rounds r
       JOIN courses c ON c.id = r.course_id
       WHERE r.user_id = $1
       ORDER BY r.date_played DESC
       LIMIT 20`,
      [req.user.id]
    );

    if (rounds.length === 0) {
      return res.json({
        handicapIndex: null,
        roundsUsed: 0,
        message: 'No rounds logged yet. Log rounds to calculate handicap.',
        trendData: []
      });
    }

    // Calculate handicap index using the standard formula:
    // 1. Calculate score differential for each round: (Score - Course Rating) * 113 / Slope
    // 2. Take the best 8 of the last 20 score differentials
    // 3. Average them and multiply by 0.96

    const reversedRounds = rounds.reverse(); // chronological order for display
    const differentials = reversedRounds.map(r => ({
      date: r.date_played,
      score: r.total_score,
      courseRating: r.course_rating,
      slopeRating: r.slope_rating,
      differential: (r.total_score - r.course_rating) * 113 / r.slope_rating
    }));

    // Sort by differential (ascending) to get the best 8
    const sortedByDifferential = [...differentials].sort((a, b) => a.differential - b.differential);
    const bestEight = sortedByDifferential.slice(0, Math.min(8, differentials.length));
    const averageDifferential = bestEight.reduce((sum, d) => sum + d.differential, 0) / bestEight.length;
    const handicapIndex = Math.round(averageDifferential * 0.96 * 10) / 10; // Round to 1 decimal

    // Create trend data: calculate rolling handicap for visualization
    const trendData = [];
    for (let i = 0; i < differentials.length; i++) {
      const upToIndex = differentials.slice(0, i + 1);
      const sortedUpTo = [...upToIndex].sort((a, b) => a.differential - b.differential);
      const bestUpTo = sortedUpTo.slice(0, Math.min(8, upToIndex.length));
      const rollingAvg = bestUpTo.reduce((sum, d) => sum + d.differential, 0) / bestUpTo.length;
      const rollingHandicap = Math.round(rollingAvg * 0.96 * 10) / 10;

      trendData.push({
        date: upToIndex[i].date,
        handicapIndex: rollingHandicap,
        roundsInCalc: bestUpTo.length,
        score: upToIndex[i].score
      });
    }

    console.log(`[HANDICAP] Calculated handicap for user ${req.user.id}: ${handicapIndex} (using ${bestEight.length} best rounds)`);

    res.json({
      handicapIndex,
      roundsUsed: bestEight.length,
      roundsAvailable: differentials.length,
      bestRoundDifferential: bestEight[0].differential.toFixed(1),
      worstRoundDifferential: bestEight[bestEight.length - 1].differential.toFixed(1),
      trendData,
      rawDifferentials: differentials // for detailed analysis if needed
    });
  } catch (err) {
    console.error('[HANDICAP] Calculation error:', err.message);
    res.status(500).json({ error: 'Failed to calculate handicap' });
  }
});

/**
 * GET /api/handicap/history — get detailed handicap history with explanations
 * Returns handicap calculations for all rounds
 */
router.get('/history', async (req, res) => {
  try {
    const rounds = await all(
      `SELECT r.id, r.total_score, r.date_played, c.name, c.course_rating, c.slope_rating
       FROM rounds r
       JOIN courses c ON c.id = r.course_id
       WHERE r.user_id = $1
       ORDER BY r.date_played ASC`,
      [req.user.id]
    );

    if (rounds.length === 0) {
      return res.json({ history: [] });
    }

    // Calculate differential for each round
    const history = rounds.map(r => ({
      id: r.id,
      date: r.date_played,
      courseName: r.name,
      score: r.total_score,
      courseRating: r.course_rating,
      slopeRating: r.slope_rating,
      differential: (r.total_score - r.course_rating) * 113 / r.slope_rating
    }));

    console.log(`[HANDICAP] Retrieved history for user ${req.user.id}: ${history.length} rounds`);
    res.json({ history });
  } catch (err) {
    console.error('[HANDICAP] History error:', err.message);
    res.status(500).json({ error: 'Failed to fetch handicap history' });
  }
});

module.exports = router;
