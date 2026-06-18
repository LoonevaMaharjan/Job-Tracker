const express = require('express');
const router = express.Router();
const { validateCreate, validateUpdate } = require('./validation');
const {
  createApplication,
  deleteApplication,
  getApplication,
  listApplications,
  updateApplication,
} = require('./applicationsService');

// GET /applications - list with optional ?status=, ?search=, ?page=, ?limit=
router.get('/', async (req, res) => {
  try {
    const applications = await listApplications(req.query);
    res.json(applications);
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({
      error: err.statusCode ? err.message : 'Something went wrong fetching applications.',
    });
  }
});

// GET /applications/:id - get one by id
router.get('/:id', async (req, res) => {
  try {
    const application = await getApplication(req.params.id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found.' });
    }
    res.json(application);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong fetching this application.' });
  }
});

// POST /applications - create a new one
router.post('/', async (req, res) => {
  const { valid, errors } = validateCreate(req.body);
  if (!valid) {
    return res.status(422).json({ errors });
  }

  try {
    const application = await createApplication(req.body);
    res.status(201).json(application);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong creating this application.' });
  }
});

// PATCH /applications/:id - update one or more fields
router.patch('/:id', async (req, res) => {
  const { valid, errors } = validateUpdate(req.body);
  if (!valid) {
    return res.status(422).json({ errors });
  }

  try {
    const application = await updateApplication(req.params.id, req.body);
    if (!application) {
      return res.status(404).json({ error: 'Application not found.' });
    }
    res.json(application);
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({
      error: err.statusCode ? err.message : 'Something went wrong updating this application.',
    });
  }
});

// DELETE /applications/:id - remove one
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await deleteApplication(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Application not found.' });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong deleting this application.' });
  }
});

module.exports = router;
