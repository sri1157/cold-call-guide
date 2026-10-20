// Tests for the after-call review, using situations taken from the transcripts.
// Run: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ruleCheck, reviewCall, callRecord } from '../src/review.js';
import { parseJsonReply } from '../src/llm.js';

const call = (over) => ({ prospect_name: 'Test', call_type: 'first', reached_stage: 7, ...over });

test('T084: logged do_not_call, but a WhatsApp send and a Thursday call were agreed', () => {
  const r = ruleCheck(call({ outcome: 'do_not_call', next_step_channel: 'call', next_step_when: 'next Thursday' }), []);
  assert.equal(r.mismatch, true);
  assert.equal(r.suggested_outcome, 'next_step_agreed');
});

test('T024: logged do_not_call, prospect said speak to the CFO', () => {
  const r = ruleCheck(call({ outcome: 'do_not_call', reached_stage: 6 }), [{ stage: 6, taps: ['not_right_person'] }]);
  assert.equal(r.suggested_outcome, 'wrong_person');
});

test('T037: prospect said "don\'t send again", do_not_call is right', () => {
  const r = ruleCheck(call({ outcome: 'do_not_call' }), [{ stage: 6, taps: ['asked_no_more_calls'] }]);
  assert.equal(r.mismatch, false);
});

test('T046: not_logged after WhatsApp + call next week', () => {
  const r = ruleCheck(call({ outcome: 'not_logged', next_step_channel: 'whatsapp' }), []);
  assert.equal(r.suggested_outcome, 'agreed_to_receive_report');
});

test('T066: person left 8 years ago, logged not_interested', () => {
  const r = ruleCheck(call({ outcome: 'not_interested' }), [{ stage: 1, taps: ['left_company'] }]);
  assert.equal(r.suggested_outcome, 'moved_company');
});

test('T100: report plus a call next Monday is a next step', () => {
  const r = ruleCheck(call({ outcome: 'agreed_to_receive_report', next_step_channel: 'email', next_step_when: 'next Monday' }), []);
  assert.equal(r.suggested_outcome, 'next_step_agreed');
});

test('consistent call raises no flag', () => {
  const r = ruleCheck(call({ outcome: 'agreed_to_receive_report', next_step_channel: 'whatsapp' }), []);
  assert.equal(r.mismatch, false);
});

test('prospect words are fenced as data in the prompt', () => {
  const text = callRecord(call({ outcome: 'interested' }), [{ stage: 5, taps: ['named_problem'], prospect_words: 'skilled manpower' }]);
  assert.match(text, /<<skilled manpower>>/);
});

test('parses JSON wrapped in a code fence', () => {
  assert.deepEqual(parseJsonReply('```json\n{"a":1}\n```'), { a: 1 });
});

test('LLM failure still returns the rule result', async () => {
  delete process.env.LLM_API_KEY;
  const out = await reviewCall(call({ outcome: 'do_not_call', next_step_channel: 'email' }), []);
  assert.equal(out.summary, null);
  assert.equal(out.review.mismatch, true);
  assert.equal(out.review.llm_error, true);
});

test('LLM cannot clear a rule flag, and its own flag is used when rules pass', async () => {
  process.env.LLM_API_KEY = 'x';
  const realFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({ choices: [{ message: { content: '{"summary":"s","suggested_outcome":"interested","mismatch":true,"reason":"r"}' } }] }),
  });
  try {
    const a = await reviewCall(call({ outcome: 'do_not_call', next_step_channel: 'email' }), []);
    assert.equal(a.review.source, 'rules');
    const b = await reviewCall(call({ outcome: 'not_interested' }), [{ stage: 5, prospect_words: 'send me details, interesting' }]);
    assert.equal(b.review.source, 'llm');
    assert.equal(b.review.suggested_outcome, 'interested');
    assert.equal(b.summary, 's');
  } finally {
    globalThis.fetch = realFetch;
  }
});
