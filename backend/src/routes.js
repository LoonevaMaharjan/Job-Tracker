const express = require('express');
const router = express.Router();
const pool = require('./db');
const { validateCreate, validateUpdate, STATUSES } = require('./validation');

// GET /applications  — list everything, with optional ?status= and ?search=
router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;
    const conditions = [];
    const values = [];

    if (status) {
      if (!STATUSES.includes(status)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: ${STATUSES.join(', ')}.` });
      }
      values.push(status);
      conditions.push(`status = $${values.length}`);
    }

    if (search) {
      values.push(`%${search}%`);
      const idx = values.length;
      conditions.push(`(company_name ILIKE $${idx} OR job_title ILIKE $${idx})`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const query = `SELECT * FROM applications ${whereClause} ORDER BY applied_date DESC`;

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong fetching applications.' });
  }
});

// GET /applications/:id — get one by id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM applications WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong fetching this application.' });
  }
});

// POST /applications — create a new one
router.post('/', async (req, res) => {
  const { valid, errors } = validateCreate(req.body);
  if (!valid) {
    return res.status(422).json({ errors });
  }

  const { company_name, job_title, job_type, status, applied_date, notes } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO applications (company_name, job_title, job_type, status, applied_date, notes)
       VALUES ($1, $2, $3, $4::status_enum, $5, $6)
       RETURNING *`,
      [company_name.trim(), job_title.trim(), job_type, status || 'Applied', applied_date, notes || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong creating this application.' });
  }
});

// PATCH /applications/:id — update one or more fields
router.patch('/:id', async (req, res) => {
  const { valid, errors } = validateUpdate(req.body);
  if (!valid) {
    return res.status(422).json({ errors });
  }

  const fields = ['company_name', 'job_title', 'job_type', 'status', 'applied_date', 'notes'];
  const setClauses = [];
  const values = [];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      values.push(req.body[field]);
      setClauses.push(`${field} = $${values.length}`);
    }
  });

  if (setClauses.length === 0) {
    return res.status(422).json({ error: 'No fields provided to update.' });
  }

  values.push(req.params.id);

  try {
    const result = await pool.query(
      `UPDATE applications SET ${setClauses.join(', ')}, updated_at = now() WHERE id = $${values.length} RETURNING *`,
      values
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong updating this application.' });
  }
});

// DELETE /applications/:id — remove one
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM applications WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found.' });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong deleting this application.' });
  }
});

module.exports = router;