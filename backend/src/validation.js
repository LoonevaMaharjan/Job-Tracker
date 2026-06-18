const JOB_TYPES = ['Internship', 'Full-time', 'Part-time'];
const STATUSES = ['Applied', 'Interviewing', 'Offer', 'Rejected'];

// Used when creating a new application — every required field must be valid
function validateCreate(body) {
  const errors = {};
  const { company_name, job_title, job_type, status, applied_date } = body;

  if (!company_name || company_name.trim().length < 2) {
    errors.company_name = 'Company name is required and must be at least 2 characters.';
  }

  if (!job_title || job_title.trim().length === 0) {
    errors.job_title = 'Job title is required.';
  }

  if (!job_type || !JOB_TYPES.includes(job_type)) {
    errors.job_type = `Job type must be one of: ${JOB_TYPES.join(', ')}.`;
  }

  if (status !== undefined && !STATUSES.includes(status)) {
    errors.status = `Status must be one of: ${STATUSES.join(', ')}.`;
  }

  if (!applied_date || isNaN(Date.parse(applied_date))) {
    errors.applied_date = 'Applied date is required and must be a valid date.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

// Used when editing — only checks fields that were actually sent
function validateUpdate(body) {
  const errors = {};
  const { company_name, job_title, job_type, status, applied_date } = body;

  if (company_name !== undefined && company_name.trim().length < 2) {
    errors.company_name = 'Company name must be at least 2 characters.';
  }
  if (job_title !== undefined && job_title.trim().length === 0) {
    errors.job_title = 'Job title cannot be empty.';
  }
  if (job_type !== undefined && !JOB_TYPES.includes(job_type)) {
    errors.job_type = `Job type must be one of: ${JOB_TYPES.join(', ')}.`;
  }
  if (status !== undefined && !STATUSES.includes(status)) {
    errors.status = `Status must be one of: ${STATUSES.join(', ')}.`;
  }
  if (applied_date !== undefined && isNaN(Date.parse(applied_date))) {
    errors.applied_date = 'Applied date must be a valid date.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

module.exports = { validateCreate, validateUpdate, JOB_TYPES, STATUSES };