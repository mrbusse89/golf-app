const express = require('express');
const { run, get, all } = require('../models/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/reviews?courseId= — list reviews for a course
 */
router.get('/', async (req, res) => {
  try {
    const { courseId, limit = 50, offset = 0 } = req.query;

    let sql = `SELECT r.*, u.username, u.display_name
               FROM reviews r JOIN users u ON u.id = r.user_id`;
    const params = [];
    let paramIndex = 1;

    if (courseId) {
      sql += ` WHERE r.course_id = $${paramIndex}`;
      params.push(Number(courseId));
      paramIndex++;
    }

    sql += ` ORDER BY r.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(Number(limit), Number(offset));

    const reviews = await all(sql, params);
    res.json({ reviews });
  } catch (err) {
    console.error('[REVIEWS] List error:', err.message);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

/**
 * POST /api/reviews — create a review (one per user per course)
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { courseId, rating, title, body, conditionRating, paceRating, valueRating } = req.body;

    if (!courseId || !rating) {
      return res.status(400).json({ error: 'courseId and rating are required' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check for existing review
    const existing = await get('SELECT id FROM reviews WHERE user_id = $1 AND course_id = $2', [req.user.id, courseId]);
    if (existing) {
      return res.status(409).json({ error: 'You already reviewed this course. Use PUT to update.' });
    }

    const { lastId } = await run(
      `INSERT INTO reviews (user_id, course_id, rating, title, body, condition_rating, pace_rating, value_rating)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [req.user.id, courseId, rating, title || null, body || null, conditionRating || null, paceRating || null, valueRating || null]
    );

    const review = await get('SELECT r.*, u.username, u.display_name FROM reviews r JOIN users u ON u.id = r.user_id WHERE r.id = $1', [lastId]);
    res.status(201).json({ review });
  } catch (err) {
    console.error('[REVIEWS] Create error:', err.message);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

/**
 * PUT /api/reviews/:id — update your review
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const existing = await get('SELECT id FROM reviews WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const { rating, title, body, conditionRating, paceRating, valueRating } = req.body;

    const fields = [];
    const params = [];
    let paramIndex = 1;
    if (rating !== undefined) { fields.push(`rating = $${paramIndex++}`); params.push(rating); }
    if (title !== undefined) { fields.push(`title = $${paramIndex++}`); params.push(title); }
    if (body !== undefined) { fields.push(`body = $${paramIndex++}`); params.push(body); }
    if (conditionRating !== undefined) { fields.push(`condition_rating = $${paramIndex++}`); params.push(conditionRating); }
    if (paceRating !== undefined) { fields.push(`pace_rating = $${paramIndex++}`); params.push(paceRating); }
    if (valueRating !== undefined) { fields.push(`value_rating = $${paramIndex++}`); params.push(valueRating); }
    fields.push('updated_at = CURRENT_TIMESTAMP');

    params.push(req.params.id, req.user.id);
    await run(`UPDATE reviews SET ${fields.join(', ')} WHERE id = $${paramIndex++} AND user_id = $${paramIndex}`, params);

    const review = await get('SELECT r.*, u.username, u.display_name FROM reviews r JOIN users u ON u.id = r.user_id WHERE r.id = $1', [req.params.id]);
    res.json({ review });
  } catch (err) {
    console.error('[REVIEWS] Update error:', err.message);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

/**
 * DELETE /api/reviews/:id — delete your review
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const existing = await get('SELECT id FROM reviews WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Review not found' });
    }
    await run('DELETE FROM reviews WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ message: 'Review deleted' });
  } catch (err) {
    console.error('[REVIEWS] Delete error:', err.message);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

module.exports = router;
