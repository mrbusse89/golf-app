const express = require('express');
const { run, get, all } = require('../models/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All routes require auth
router.use(authenticate);

/**
 * POST /api/rounds — log a new round
 */
router.post('/', async (req, res) => {
  try {
    const { courseId, datePlayed, totalScore, totalPutts, fairwaysHit, greensInRegulation, avgDrivingDistance, notes, weather, teesPlayed, holeScores } = req.body;

    if (!courseId || !datePlayed || !totalScore) {
      return res.status(400).json({ error: 'courseId, datePlayed, and totalScore are required' });
    }

    // Verify course exists
    const course = await get('SELECT id FROM courses WHERE id = $1', [courseId]);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const { lastId } = await run(
      `INSERT INTO rounds (user_id, course_id, date_played, total_score, total_putts, fairways_hit, greens_in_regulation, avg_driving_distance, notes, weather, tees_played)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
      [req.user.id, courseId, datePlayed, totalScore, totalPutts || null, fairwaysHit || null, greensInRegulation || null, avgDrivingDistance || null, notes || null, weather || null, teesPlayed || null]
    );

    // Insert hole-by-hole scores if provided
    if (holeScores && Array.isArray(holeScores)) {
      for (const hole of holeScores) {
        await run(
          `INSERT INTO hole_scores (round_id, hole_number, strokes, putts, fairway_hit, gir)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [lastId, hole.holeNumber, hole.strokes, hole.putts || null, hole.fairwayHit ?? null, hole.gir ?? null]
        );
      }
    }

    const round = await get(
      `SELECT r.*, c.name as course_name FROM rounds r
       JOIN courses c ON c.id = r.course_id WHERE r.id = $1`,
      [lastId]
    );

    console.log(`[ROUNDS] New round logged: ${round.course_name} - ${totalScore}`);
    res.status(201).json({ round });
  } catch (err) {
    console.error('[ROUNDS] Create error:', err.message);
    res.status(500).json({ error: 'Failed to log round' });
  }
});

/**
 * GET /api/rounds — list user's rounds (with optional filters)
 */
router.get('/', async (req, res) => {
  try {
    const { courseId, limit = 50, offset = 0, sort = 'date_played' } = req.query;

    const allowedSorts = ['date_played', 'total_score', 'created_at'];
    const sortCol = allowedSorts.includes(sort) ? sort : 'date_played';

    let sql = `SELECT r.*, c.name as course_name, c.par as course_par
               FROM rounds r JOIN courses c ON c.id = r.course_id
               WHERE r.user_id = $1`;
    const params = [req.user.id];
    let paramIndex = 2;

    if (courseId) {
      sql += ` AND r.course_id = $${paramIndex}`;
      params.push(Number(courseId));
      paramIndex++;
    }

    sql += ` ORDER BY r.${sortCol} DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(Number(limit), Number(offset));

    const rounds = await all(sql, params);

    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM rounds WHERE user_id = $1';
    const countParams = [req.user.id];
    let countIndex = 2;
    if (courseId) {
      countSql += ` AND course_id = $${countIndex}`;
      countParams.push(Number(courseId));
    }
    const { total } = await get(countSql, countParams);

    res.json({ rounds, total: Number(total), limit: Number(limit), offset: Number(offset) });
  } catch (err) {
    console.error('[ROUNDS] List error:', err.message);
    res.status(500).json({ error: 'Failed to fetch rounds' });
  }
});

/**
 * GET /api/rounds/:id — get a single round with hole scores
 */
router.get('/:id', async (req, res) => {
  try {
    const round = await get(
      `SELECT r.*, c.name as course_name, c.par as course_par
       FROM rounds r JOIN courses c ON c.id = r.course_id
       WHERE r.id = $1 AND r.user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (!round) {
      return res.status(404).json({ error: 'Round not found' });
    }

    const holeScores = await all('SELECT * FROM hole_scores WHERE round_id = $1 ORDER BY hole_number', [round.id]);
    res.json({ round, holeScores });
  } catch (err) {
    console.error('[ROUNDS] Get error:', err.message);
    res.status(500).json({ error: 'Failed to fetch round' });
  }
});

/**
 * PUT /api/rounds/:id — update a round
 */
router.put('/:id', async (req, res) => {
  try {
    const existing = await get('SELECT id FROM rounds WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Round not found' });
    }

    const { totalScore, totalPutts, fairwaysHit, greensInRegulation, notes, weather, teesPlayed, datePlayed, holeScores } = req.body;

    // Build dynamic UPDATE
    const fields = [];
    const params = [];
    let paramIndex = 1;
    if (totalScore !== undefined) { fields.push(`total_score = $${paramIndex++}`); params.push(totalScore); }
    if (totalPutts !== undefined) { fields.push(`total_putts = $${paramIndex++}`); params.push(totalPutts); }
    if (fairwaysHit !== undefined) { fields.push(`fairways_hit = $${paramIndex++}`); params.push(fairwaysHit); }
    if (greensInRegulation !== undefined) { fields.push(`greens_in_regulation = $${paramIndex++}`); params.push(greensInRegulation); }
    if (notes !== undefined) { fields.push(`notes = $${paramIndex++}`); params.push(notes); }
    if (weather !== undefined) { fields.push(`weather = $${paramIndex++}`); params.push(weather); }
    if (teesPlayed !== undefined) { fields.push(`tees_played = $${paramIndex++}`); params.push(teesPlayed); }
    if (datePlayed !== undefined) { fields.push(`date_played = $${paramIndex++}`); params.push(datePlayed); }
    fields.push('updated_at = CURRENT_TIMESTAMP');

    params.push(req.params.id, req.user.id);
    await run(`UPDATE rounds SET ${fields.join(', ')} WHERE id = $${paramIndex++} AND user_id = $${paramIndex}`, params);

    // Update hole scores if provided
    if (holeScores && Array.isArray(holeScores)) {
      await run('DELETE FROM hole_scores WHERE round_id = $1', [req.params.id]);
      for (const hole of holeScores) {
        await run(
          `INSERT INTO hole_scores (round_id, hole_number, strokes, putts, fairway_hit, gir)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [req.params.id, hole.holeNumber, hole.strokes, hole.putts || null, hole.fairwayHit ?? null, hole.gir ?? null]
        );
      }
    }

    const round = await get(
      `SELECT r.*, c.name as course_name FROM rounds r
       JOIN courses c ON c.id = r.course_id WHERE r.id = $1`,
      [req.params.id]
    );
    res.json({ round });
  } catch (err) {
    console.error('[ROUNDS] Update error:', err.message);
    res.status(500).json({ error: 'Failed to update round' });
  }
});

/**
 * DELETE /api/rounds/:id — delete a round
 */
router.delete('/:id', async (req, res) => {
  try {
    const existing = await get('SELECT id FROM rounds WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Round not found' });
    }

    await run('DELETE FROM rounds WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ message: 'Round deleted' });
  } catch (err) {
    console.error('[ROUNDS] Delete error:', err.message);
    res.status(500).json({ error: 'Failed to delete round' });
  }
});

module.exports = router;
