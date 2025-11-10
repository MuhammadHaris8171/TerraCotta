require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./src/routes/auth');
const usersRoutes = require('./src/routes/users');
const transactionsRoutes = require('./src/routes/transactions');
const setupRoutes = require('./src/routes/setup');
const reportsRoutes = require('./src/routes/reports');
const auditRoutes = require('./src/routes/audit');
const importRoutes = require('./src/routes/import');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/setup', setupRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/import', importRoutes);

app.get('/health', (req, res) => res.json({ ok: true }));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Backend listening on ${port}`));
