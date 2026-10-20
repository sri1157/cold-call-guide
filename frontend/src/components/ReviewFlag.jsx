// Shows the outcome check for one call. If the review found a mismatch, the caller can
// accept the suggested outcome with one tap. The caller always decides; nothing changes on its own.
// When the outcome fits, it says what it was checked against, so the caller can see why.
import { useState } from 'react';
import { api } from '../api.js';
import { STAGES, outcomeLabel, channelLabel } from '../stages.js';

// The evidence the check looked at, in plain words: the next step if there was one,
// otherwise the stage the call ended at.
function evidence(call) {
  if (call.next_step_channel) {
    return [channelLabel(call.next_step_channel), call.next_step_when].filter(Boolean).join(', ');
  }
  return `ended at ${STAGES[call.reached_stage - 1]?.name || 'Opening'}, no next step`;
}

export default function ReviewFlag({ call, onChanged }) {
  const [busy, setBusy] = useState(false);
  const r = call.review;

  if (!r?.mismatch) {
    return r?.resolved ? (
      <p className="ok">✓ Outcome changed to {outcomeLabel(call.outcome)}.</p>
    ) : (
      <p className="ok">✓ Outcome fits your notes: {evidence(call)}.</p>
    );
  }

  async function accept() {
    setBusy(true);
    try {
      onChanged({ ...call, ...(await api.setOutcome(call.id, r.suggested_outcome)) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flag" role="note">
      <p>
        Logged as <strong>{outcomeLabel(call.outcome)}</strong>. {r.reason}
      </p>
      {r.suggested_outcome && (
        <button onClick={accept} disabled={busy}>
          Change to “{outcomeLabel(r.suggested_outcome)}”
        </button>
      )}
      <span className="source">{r.source === 'rules' ? 'Found by the outcome rules' : 'Found by the AI review'}</span>
    </div>
  );
}
