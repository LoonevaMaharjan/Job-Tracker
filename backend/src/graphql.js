const express = require('express');
const {
  createApplication,
  deleteApplication,
  getApplication,
  getApplicationStats,
  listApplications,
  updateApplication,
} = require('./applicationsService');
const { validateCreate, validateUpdate } = require('./validation');

const router = express.Router();

function graphQLError(message, statusCode = 400) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function pickVariables(variables = {}) {
  return {
    id: variables.id,
    input: variables.input || {},
    status: variables.status,
    search: variables.search,
    page: variables.page,
    limit: variables.limit,
  };
}

router.post('/', async (req, res) => {
  const { query = '', variables = {} } = req.body || {};
  const args = pickVariables(variables);

  try {
    if (query.includes('applications')) {
      const result = await listApplications(args);
      return res.json({ data: { applications: result } });
    }

    if (query.includes('applicationStats')) {
      const result = await getApplicationStats(args);
      return res.json({ data: { applicationStats: result } });
    }

    if (query.includes('application(')) {
      if (!args.id) throw graphQLError('Variable "id" is required.');
      const result = await getApplication(args.id);
      return res.json({ data: { application: result } });
    }

    if (query.includes('createApplication')) {
      const { valid, errors } = validateCreate(args.input);
      if (!valid) {
        return res.status(422).json({ errors: [{ message: 'Validation failed', details: errors }] });
      }
      const result = await createApplication(args.input);
      return res.json({ data: { createApplication: result } });
    }

    if (query.includes('updateApplication')) {
      if (!args.id) throw graphQLError('Variable "id" is required.');
      const { valid, errors } = validateUpdate(args.input);
      if (!valid) {
        return res.status(422).json({ errors: [{ message: 'Validation failed', details: errors }] });
      }
      const result = await updateApplication(args.id, args.input);
      return res.json({ data: { updateApplication: result } });
    }

    if (query.includes('deleteApplication')) {
      if (!args.id) throw graphQLError('Variable "id" is required.');
      const result = await deleteApplication(args.id);
      return res.json({ data: { deleteApplication: result } });
    }

    throw graphQLError('Unsupported GraphQL operation.');
  } catch (err) {
    console.error(err);
    return res.status(err.statusCode || 500).json({
      errors: [{ message: err.statusCode ? err.message : 'GraphQL request failed.' }],
    });
  }
});

router.get('/', (req, res) => {
  res.json({
    endpoint: '/graphql',
    operations: ['applications', 'application', 'createApplication', 'updateApplication', 'deleteApplication'],
  });
});

module.exports = router;
