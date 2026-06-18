const test = require('node:test');
const assert = require('node:assert/strict');
const { validateCreate, validateUpdate } = require('../src/validation');
const { parsePagination } = require('../src/applicationsService');

test('validateCreate accepts a complete application payload', () => {
  const result = validateCreate({
    company_name: 'Acme Corp',
    job_title: 'Frontend Developer',
    job_type: 'Full-time',
    status: 'Applied',
    applied_date: '2026-06-18',
  });

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, {});
});

test('validateUpdate rejects invalid status values', () => {
  const result = validateUpdate({ status: 'Maybe Later' });

  assert.equal(result.valid, false);
  assert.equal(result.errors.status, 'Status must be one of: Applied, Interviewing, Offer, Rejected.');
});

test('parsePagination applies defaults and caps large limits', () => {
  assert.deepEqual(parsePagination({ page: '-2', limit: '999' }), { page: 1, limit: 50 });
});
