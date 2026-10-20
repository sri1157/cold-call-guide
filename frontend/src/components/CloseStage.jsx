// Stage 8: how the call ended, the outcome, then save. After saving, shows the
// LLM summary and, if the outcome doesn't fit what was recorded, the flag.
import { useState } from 'react';
import { api } from '../api.js';
import { STAGES, OUTCOMES, channelLabel, suggestOutcome } from '../stages.js';
import ReviewFlag from './ReviewFlag.jsx';

export default function CloseStage({ call, reached, stage, here, toggleTap, step, record, pending, onDone }) {
  // Start from the outcome the notes point to; the caller confirms or changes it.
  const suggested = suggestOutcome(record, step);
  const [outcome, setOutcome] = useState(suggested || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  async function saveCall() {
    setBusy(true);
    setError('');
    try {
      await Promise.allSettled(pending.current);
      // Re-send every stage with something in it. Saves are upserts, so this is safe,
      // and it covers any background save that failed during the call.
      const saves = Object.entries(record)
        .filter(([n, r]) => Number(n) < 7 && (r.taps.length || r.words))
        .map(([n, r]) => api.saveStage(call.id, Number(n), r.taps, r.words));
      if (step.channel) saves.push(api.saveStage(call.id, 7, [step.channel], [step.when, step.referral_name].filter(Boolean).join(', ')));
      if (here.taps.length || here.words) saves.push(api.saveStage(call.id, 8, here.taps, here.words));
      await Promise.all(saves);

      setResult(
        await api.closeCall(call.id, {
          outcome: outcome || 'not_logged',
          next_step_channel: step.channel || null,
          next_step_when: step.when,
          next_step_named_by: step.named_by || null,
          referral_name: step.referral_name,
          referral_contact: step.referral_contact,
        }),
      );
    } catch (err) {
      setError(`Couldn’t save the call: ${err.message}. Your notes are still here; try again.`);
    } finally {
      setBusy(false);
    }
  }

  if (result) {
    return (
      <div className="closed">
        <h2>Saved</h2>
        <p className="summary">{result.summary || 'No summary this time: the AI review was unavailable. The outcome check still ran.'}</p>
        <ReviewFlag call={result} onChanged={setResult} />
        <div className="actions">
          <button className="primary" onClick={onDone}>Start the next call</button>
          <a className="button" href="#/calls" onClick={onDone}>See past calls</a>
        </div>
      </div>
    );
  }

  return (
    <>
      <p className="reached">This call reached <strong>{STAGES[reached - 1].name}</strong>.</p>

      <fieldset className="chips">
        <legend>How it ended</legend>
        {stage.taps.map((t) => (
          <button key={t.id} type="button" aria-pressed={here.taps.includes(t.id)} onClick={() => toggleTap(t.id)}>
            {t.label}
          </button>
        ))}
      </fieldset>

      <fieldset className="outcomes">
        <legend>
          Outcome
          {suggested && outcome === suggested && <span className="hint"> (suggested from your notes, change it if it’s wrong)</span>}
        </legend>
        {OUTCOMES.map((o) => (
          <label key={o.id} className={outcome === o.id ? 'on' : ''}>
            <input type="radio" name="outcome" value={o.id} checked={outcome === o.id} onChange={() => setOutcome(o.id)} />
            {o.label}
          </label>
        ))}
      </fieldset>

      {step.channel && (
        <p className="reached">
          Next step on record: <strong>{channelLabel(step.channel)}</strong>
          {step.when && `, ${step.when}`}
          {step.referral_name && `, ${step.referral_name}`}.
        </p>
      )}

      {error && <p className="error" role="alert">{error}</p>}
      {!outcome && <p className="hint">Pick an outcome to save the call.</p>}
      <div className="actions">
        <button className="primary" onClick={saveCall} disabled={busy || !outcome}>
          {busy ? 'Saving and checking…' : 'Save call'}
        </button>
      </div>
    </>
  );
}
