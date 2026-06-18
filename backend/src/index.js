const express = require('express');
const cors = require('cors');
require('dotenv').config();

const applicationsRouter = require('./routes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// All application-related routes live under /applications
app.use('/applications', applicationsRouter);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});