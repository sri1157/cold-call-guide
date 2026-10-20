// The call endpoints. Each handler: validate input -> one or two Supabase queries -> JSON.
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { supabase } from '../db.js';
import { OUTCOMES, CHANNELS } from '../constants.js';
import { reviewCall } from '../review.js';

const router = Router();

// Small helpers so every handler validates the same way.
const str = (v, max = 500) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null);
const isUuid = (v) => /^[0-9a-f-]{36}$/i.test(v);
const bad = (res, msg) => res.status(400).json({ error: msg });
const fail = (res, err) => {
  console.error(err);
  res.status(500).json({ error: 'Database error' });
};

// The LLM key costs quota, so limit how often anyone can trigger a review.
const reviewLimiter = rateLimit({ windowMs: 60_000, limit: 10, standardHeaders: true, legacyHeaders: false });

// POST /calls  -> start a call
router.post('/', async (req, res) => {
  const prospect_name = str(req.body.prospect_name, 120);
  if (!prospect_name) return bad(res, 'prospect_name is required');
  const call_type = req.body.call_type === 'follow_up' ? 'follow_up' : 'first';

  const { data, error } = await supabase
    .from('calls')
    .insert({
      prospect_name,
      prospect_role: str(req.body.prospect_role, 120),
      company: str(req.body.company, 120),
      call_type,
    })
    .select()
    .single();
  if (error) return fail(res, error);
  res.status(201).json(data);
});

// POST /calls/:id/stages  -> save what happened at one stage (re-saving overwrites)
router.post('/:id/stages', async (req, res) => {
  const { id } = req.params;
  if (!isUuid(id)) return bad(res, 'bad call id');
  const stage = Number(req.body.stage);
  if (!Number.isInteger(stage) || stage < 1 || stage > 8) return bad(res, 'stage must be 1-8');
  const taps = Array.isArray(req.body.taps)
    ? req.body.taps.filter((t) => typeof t === 'string').map((t) => t.slice(0, 60)).slice(0, 10)
    : [];

  const { data: call, error: e1 } = await supabase.from('calls').select('status, reached_stage').eq('id', id).single();
  if (e1 || !call) return res.status(404).json({ error: 'call not found' });
  if (call.status === 'closed') return res.status(409).json({ error: 'call already closed' });

  const { data, error } = await supabase
    .from('stage_results')
    .upsert(
      { call_id: id, stage, taps, prospect_words: str(req.body.prospect_words, 2000), saved_at: new Date().toISOString() },
      { onConflict: 'call_id,stage' },
    )
    .select()
    .single();
  if (error) return fail(res, error);

  // reached_stage only moves forward. Close (8) doesn't count: every call ends there,
  // so "reached" means the furthest real stage before the close.
  if (stage > call.reached_stage && stage < 8) {
    await supabase.from('calls').update({ reached_stage: stage }).eq('id', id);
  }
  res.json(data);
});

// POST /calls/:id/close  -> outcome + next step, then the review
router.post('/:id/close', reviewLimiter, async (req, res) => {
  const { id } = req.params;
  if (!isUuid(id)) return bad(res, 'bad call id');
  const b = req.body;
  if (b.outcome && !OUTCOMES[b.outcome]) return bad(res, 'unknown outcome');
  if (b.next_step_channel && !CHANNELS.includes(b.next_step_channel)) return bad(res, 'unknown next step channel');

  // 1. Save the close first. Whatever the LLM does next, the record is safe.
  const { data: call, error } = await supabase
    .from('calls')
    .update({
      status: 'closed',
      ended_at: new Date().toISOString(),
      outcome: b.outcome || 'not_logged',
      next_step_channel: b.next_step_channel || null,
      next_step_when: str(b.next_step_when, 120),
      next_step_named_by: ['them', 'us'].includes(b.next_step_named_by) ? b.next_step_named_by : null,
      referral_name: str(b.referral_name, 120),
      referral_contact: str(b.referral_contact, 120),
    })
    .eq('id', id)
    .select()
    .single();
  if (error || !call) return res.status(404).json({ error: 'call not found' });

  // 2. Review it (rules + LLM) and store the result.
  const { data: stages } = await supabase.from('stage_results').select('stage, taps, prospect_words').eq('call_id', id);
  const { summary, review } = await reviewCall(call, stages || []);
  const { data: updated, error: e2 } = await supabase
    .from('calls')
    .update({ summary, review })
    .eq('id', id)
    .select()
    .single();
  if (e2) return fail(res, e2);
  res.json({ ...updated, stages: stages || [] });
});

// POST /calls/:id/outcome  -> the caller accepts the suggested outcome (or picks another)
router.post('/:id/outcome', async (req, res) => {
  const { id } = req.params;
  if (!isUuid(id)) return bad(res, 'bad call id');
  if (!OUTCOMES[req.body.outcome]) return bad(res, 'unknown outcome');
  const { data: call } = await supabase.from('calls').select('review').eq('id', id).single();
  const review = call?.review ? { ...call.review, mismatch: false, resolved: true } : null;
  const { data, error } = await supabase
    .from('calls')
    .update({ outcome: req.body.outcome, review })
    .eq('id', id)
    .select()
    .single();
  if (error) return fail(res, error);
  res.json(data);
});

// GET /calls  -> past calls, newest first, with the stage each one reached
router.get('/', async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const { data, error } = await supabase
    .from('calls')
    .select('id, prospect_name, prospect_role, company, call_type, status, started_at, ended_at, reached_stage, outcome, next_step_channel, next_step_when, summary, review')
    .order('started_at', { ascending: false })
    .limit(limit);
  if (error) return fail(res, error);
  res.json(data);
});

// GET /calls/:id  -> one call with its stage results
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (!isUuid(id)) return bad(res, 'bad call id');
  const { data, error } = await supabase.from('calls').select('*, stage_results(stage, taps, prospect_words, saved_at)').eq('id', id).single();
  if (error || !data) return res.status(404).json({ error: 'call not found' });
  res.json(data);
});

export default router;
