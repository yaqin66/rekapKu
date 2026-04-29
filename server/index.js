import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import walletsRouter from './routes/wallets.js';
import transactionsRouter from './routes/transactions.js';
import budgetsRouter from './routes/budgets.js';
import billsRouter from './routes/bills.js';
import goalsRouter from './routes/goals.js';
import debtsRouter from './routes/debts.js';

const app = express();
const PORT = process.env.PORT || 5173;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/wallets', walletsRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/budgets', budgetsRouter);
app.use('/api/bills', billsRouter);
app.use('/api/goals', goalsRouter);
app.use('/api/debts', debtsRouter);

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Resolve directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend static files if in production (or if dist folder exists)
app.use(express.static(path.join(__dirname, '../dist')));

// Catch-all route for React Router (must be placed AFTER API routes)
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
