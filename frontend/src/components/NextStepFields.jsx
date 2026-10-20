// Stage 7: one concrete thing, with a channel and a time. Who named the time is recorded,
// because a time the prospect names is worth more than one the caller proposes.
import { CHANNELS } from '../stages.js';

export default function NextStepFields({ step, setStep }) {
  const set = (k, v) => setStep((s) => ({ ...s, [k]: v }));
  return (
    <div className="nextstep">
      <fieldset className="chips">
        <legend>What was agreed</legend>
        {CHANNELS.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={step.channel === c.id}
            onClick={() => set('channel', step.channel === c.id ? '' : c.id)}
          >
            {c.label}
          </button>
        ))}
      </fieldset>

      {step.channel === 'referral' ? (
        <div className="row">
          <label>
            Who
            <input value={step.referral_name} onChange={(e) => set('referral_name', e.target.value)} placeholder="Mr. Naik, operations" />
          </label>
          <label>
            Number or email
            <input value={step.referral_contact} onChange={(e) => set('referral_contact', e.target.value)} placeholder="If they gave one" />
          </label>
        </div>
      ) : (
        <label>
          When
          <input value={step.when} onChange={(e) => set('when', e.target.value)} placeholder="Tuesday after 2 PM" />
        </label>
      )}

      {step.when && step.channel !== 'referral' && (
        <fieldset className="segmented">
          <legend>Who named the time?</legend>
          <div className="seg-track">
            {[
              ['them', 'They did'],
              ['us', 'I proposed it'],
            ].map(([v, label]) => (
              <label key={v} className={step.named_by === v ? 'on' : ''}>
                <input type="radio" name="named_by" checked={step.named_by === v} onChange={() => set('named_by', v)} />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      )}
    </div>
  );
}
