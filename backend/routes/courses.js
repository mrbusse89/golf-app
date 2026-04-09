const express = require('express');
const { get, all } = require('../models/db');

const router = express.Router();

/**
 * GET /api/courses — list courses with search/filter
 * Query: ?search=&state=&limit=&offset=
 */
router.get('/', async (req, res) => {
  try {
    const { search, state, limit = 50, offset = 0 } = req.query;

    let sql = 'SELECT * FROM courses WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (search) {
      sql += ` AND (name ILIKE $${paramIndex} OR city ILIKE $${paramIndex + 1})`;
      params.push(`%${search}%`, `%${search}%`);
      paramIndex += 2;
    }
    if (state) {
      sql += ` AND state = $${paramIndex}`;
      params.push(state);
      paramIndex++;
    }

    sql += ` ORDER BY name ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(Number(limit), Number(offset));

    const courses = await all(sql, params);

    // Total count
    let countSql = 'SELECT COUNT(*) as total FROM courses WHERE 1=1';
    const countParams = [];
    let countIndex = 1;
    if (search) {
      countSql += ` AND (name ILIKE $${countIndex} OR city ILIKE $${countIndex + 1})`;
      countParams.push(`%${search}%`, `%${search}%`);
      countIndex += 2;
    }
    if (state) {
      countSql += ` AND state = $${countIndex}`;
      countParams.push(state);
    }
    const { total } = await get(countSql, countParams);

    res.json({ courses, total: Number(total) });
  } catch (err) {
    console.error('[COURSES] List error:', err.message);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

/**
 * GET /api/courses/:id — single course with avg rating
 */
router.get('/:id', async (req, res) => {
  try {
    const course = await get('SELECT * FROM courses WHERE id = $1', [req.params.id]);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const stats = await get(
      `SELECT COUNT(*) as review_count, AVG(rating) as avg_rating,
              AVG(condition_rating) as avg_condition, AVG(pace_rating) as avg_pace,
              AVG(value_rating) as avg_value
       FROM reviews WHERE course_id = $1`,
      [req.params.id]
    );

    const roundStats = await get(
      `SELECT COUNT(*) as times_played, AVG(total_score) as avg_score
       FROM rounds WHERE course_id = $1`,
      [req.params.id]
    );

    res.json({ course, reviewStats: stats, roundStats });
  } catch (err) {
    console.error('[COURSES] Get error:', err.message);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

module.exports = router;
