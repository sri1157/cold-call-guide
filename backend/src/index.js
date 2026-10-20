// Entry point: builds the Express app, wires middleware and routes, starts listening.
import express from 'express';
import cors from 'cors';
import callsRouter from './routes/calls.js';
import { supabase } from './db.js';
import { llmConfig } from './llm.js';

const app = express();
app.set('trust proxy', 1); // Render sits behind a proxy; needed for correct client IPs in rate limiting

// Only the Vercel screen may call this API from a browser.
// Trailing slashes and spaces are stripped, because browsers send the origin without them.
const origins = (process.env.FRONTEND_ORIGIN || '')
  .split(',')
  .map((s) => s.trim().replace(/\/+$/, ''))
  .filter(Boolean);
app.use(cors({ origin: origins.includes('*') ? true : origins }));
app.use(express.json({ limit: '50kb' }));

// Health: answers fast and never touches the LLM.
// /health?deep=1 also checks the database.
app.get('/health', async (req, res) => {
  const body = { status: 'ok', uptime_s: Math.round(process.uptime()), time: new Date().toISOString() };
  try {
    body.llm_provider = llmConfig().name;
  } catch {
    body.llm_provider = 'misconfigured';
  }
  if (req.query.deep) {
    const { error } = await supabase.from('calls').select('id', { head: true, count: 'exact' });
    body.database = error ? 'error' : 'ok';
  }
  res.json(body);
});

app.use('/calls', callsRouter);

app.use((req, res) => res.status(404).json({ error: 'not found' }));
// Bad JSON bodies and other thrown errors end up here.
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'invalid JSON' });
  console.error(err);
  res.status(500).json({ error: 'server error' });
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`cold-call-guide API on :${port}`));
