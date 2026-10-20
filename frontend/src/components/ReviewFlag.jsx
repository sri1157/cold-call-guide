// Shows the outcome check for one call. If the review found a mismatch, the caller can
// accept the suggested outcome with one tap. The caller always decides; nothing changes on its own.
import { useState } from 'react';
import { api } from '../api.js';
import { outcomeLabel } from '../stages.js';

export default function ReviewFlag({ call, onChanged }) {
  const [busy, setBusy] = useState(false);
  const r = call.review;
  if (!r?.mismatch) {
    return r?.resolved ? <p className="ok">Outcome corrected.</p> : <p className="ok">Outcome matches what you recorded.</p>;
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
