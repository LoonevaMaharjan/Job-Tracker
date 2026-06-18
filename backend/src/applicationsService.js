const pool = require('./db');
const { STATUSES } = require('./validation');

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

function parsePagination(query = {}) {
  const page = Number.parseInt(query.page, 10);
  const limit = Number.parseInt(query.limit, 10);

  return {
    page: Number.isFinite(page) && page > 0 ? page : DEFAULT_PAGE,
    limit: Number.isFinite(limit) && limit > 0 ? Math.min(limit, MAX_LIMIT) : DEFAULT_LIMIT,
  };
}

async function listApplications(filters = {}) {
  const { status, search } = filters;
  const { page, limit } = parsePagination(filters);
  const offset = (page - 1) * limit;
  const conditions = [];
  const values = [];

  if (status && status !== 'All') {
    if (!STATUSES.includes(status)) {
      const err = new Error(`Invalid status. Must be one of: ${STATUSES.join(', ')}.`);
      err.statusCode = 400;
      throw err;
    }
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  if (search && search.trim()) {
    values.push(`%${search.trim()}%`);
    const idx = values.length;
    conditions.push(`(company_name ILIKE $${idx} OR job_title ILIKE $${idx})`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const countResult = await pool.query(`SELECT COUNT(*) FROM applications ${whereClause}`, values);
  const totalCount = Number.parseInt(countResult.rows[0].count, 10);
  const dataValues = [...values, limit, offset];
  const dataQuery = `
    SELECT *
    FROM applications
    ${whereClause}
    ORDER BY applied_date DESC, created_at DESC
    LIMIT $${dataValues.length - 1} OFFSET $${dataValues.length}
  `;
  const result = await pool.query(dataQuery, dataValues);

  return {
    data: result.rows,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.max(1, Math.ceil(totalCount / limit)),
    },
  };
}

async function getApplication(id) {
  const result = await pool.query('SELECT * FROM applications WHERE id = $1', [id]);
  return result.rows[0] || null;
}

async function createApplication(body) {
  const { company_name, job_title, job_type, status, applied_date, notes } = body;
  const result = await pool.query(
    `INSERT INTO applications (company_name, job_title, job_type, status, applied_date, notes)
     VALUES ($1, $2, $3::job_type_enum, $4::status_enum, $5, $6)
     RETURNING *`,
    [company_name.trim(), job_title.trim(), job_type, status || 'Applied', applied_date, notes || null],
  );

  return result.rows[0];
}

async function updateApplication(id, body) {
  const fields = ['company_name', 'job_title', 'job_type', 'status', 'applied_date', 'notes'];
  const setClauses = [];
  const values = [];

  fields.forEach((field) => {
    if (body[field] !== undefined) {
      values.push(typeof body[field] === 'string' ? body[field].trim() : body[field]);
      const cast = field === 'status' ? '::status_enum' : field === 'job_type' ? '::job_type_enum' : '';
      setClauses.push(`${field} = $${values.length}${cast}`);
    }
  });

  if (setClauses.length === 0) {
    const err = new Error('No fields provided to update.');
    err.statusCode = 422;
    throw err;
  }

  values.push(id);
  const result = await pool.query(
    `UPDATE applications
     SET ${setClauses.join(', ')}, updated_at = now()
     WHERE id = $${values.length}
     RETURNING *`,
    values,
  );

  return result.rows[0] || null;
}

async function deleteApplication(id) {
  const result = await pool.query('DELETE FROM applications WHERE id = $1 RETURNING id', [id]);
  return result.rows.length > 0;
}

module.exports = {
  createApplication,
  deleteApplication,
  getApplication,
  listApplications,
  parsePagination,
  updateApplication,
};
