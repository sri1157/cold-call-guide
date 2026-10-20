// The second screen: every saved call, the stage it reached, the outcome, the next step,
// and any outcome flag still open. The strip at the top shows where these calls end.
import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { STAGES, outcomeLabel, channelLabel } from '../stages.js';
import { MiniLine } from './StageRail.jsx';
import ReviewFlag from './ReviewFlag.jsx';

export default function PastCalls() {
  const [calls, setCalls] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.listCalls().then(setCalls).catch((e) => setError(`Couldn’t load calls: ${e.message}`));
  }, []);

  if (error) return <main className="past"><p className="error" role="alert">{error}</p></main>;
  if (!calls) return <main className="past"><p>Loading calls…</p></main>;
  if (!calls.length) {
    return (
      <main className="past">
        <h1>Past calls</h1>
        <p>No calls yet. Start one from New call and it will show here when you save it.</p>
      </main>
    );
  }

  const closed = calls.filter((c) => c.status === 'closed');
  const endedAt = STAGES.slice(0, 7).map((s) => closed.filter((c) => c.reached_stage === s.n).length);
  const max = Math.max(1, ...endedAt);
  const flagged = closed.filter((c) => c.review?.mismatch).length;

  return (
    <main className="past">
      <h1>Past calls</h1>

      <section className="endings" aria-label="Where your calls ended">
        <p>
          Where your {closed.length} saved calls ended
          {flagged > 0 && <>; <strong>{flagged}</strong> with an outcome to check</>}.
        </p>
        <ol>
          {STAGES.slice(0, 7).map((s, i) => (
            <li key={s.n}>
              <span className="bar" style={{ '--h': `${(endedAt[i] / max) * 100}%` }} />
              <span className="n">{endedAt[i]}</span>
              <span className="label">{s.name}</span>
            </li>
          ))}
        </ol>
      </section>

      <ul className="calllist">
        {calls.map((c) => (
          <CallRow key={c.id} initial={c} />
        ))}
      </ul>
    </main>
  );
}

function CallRow({ initial }) {
  const [c, setC] = useState(initial);
  return (
    <li className={c.review?.mismatch ? 'has-flag' : ''}>
      <div className="row-head">
        <div>
          <strong>{c.prospect_name}</strong>
          <span>{[c.prospect_role, c.company].filter(Boolean).join(', ')}</span>
        </div>
        <time dateTime={c.started_at}>{when(c.started_at)}</time>
      </div>
      <div className="row-stage">
        <MiniLine reached={c.reached_stage} />
        <span>{STAGES[c.reached_stage - 1]?.name}</span>
        <span className="outcome">{c.status === 'open' ? 'Not closed' : outcomeLabel(c.outcome)}</span>
      </div>
      {c.summary && <p className="summary">{c.summary}</p>}
      {c.next_step_channel && (
        <p className="next">Next: {channelLabel(c.next_step_channel)}{c.next_step_when ? `, ${c.next_step_when}` : ''}</p>
      )}
      {c.status === 'closed' && c.review?.mismatch && <ReviewFlag call={c} onChanged={setC} />}
    </li>
  );
}

function when(iso) {
  const d = new Date(iso);
  const today = new Date().toDateString() === d.toDateString();
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return today ? `Today ${time}` : `${d.toLocaleDateString([], { day: 'numeric', month: 'short' })} ${time}`;
}
