// The live call. Holds what the caller recorded at each stage, saves each stage to the
// backend as the caller moves on, and lets them end the call from anywhere.
import { useEffect, useRef, useState } from 'react';
import { api } from '../api.js';
import { stageFor, pathFor } from '../stages.js';
import StageRail from './StageRail.jsx';
import NextStepFields from './NextStepFields.jsx';
import CloseStage from './CloseStage.jsx';

const emptyStep = { channel: '', when: '', named_by: '', referral_name: '', referral_contact: '' };

export default function CallScreen({ call, onDone }) {
  const path = pathFor(call.call_type); // 8 stops for a first call, 3 for a follow-up
  const [current, setCurrent] = useState(1);
  const [reached, setReached] = useState(1);
  const [visited, setVisited] = useState(() => new Set([1])); // stages the caller has been on
  const [record, setRecord] = useState({}); // { [stageNumber]: { taps: [], words: '' } }
  const [step, setStep] = useState(emptyStep);
  const [saveError, setSaveError] = useState('');
  const pending = useRef([]); // stage saves still in flight; Close waits for them
  const card = useRef(null);
  const elapsed = useElapsed();

  // A new stage should open at its top, not wherever the last one was scrolled to.
  useEffect(() => {
    const top = card.current?.getBoundingClientRect().top;
    // Scroll to the stage line (on a phone it sits just above the card) so both are in view.
    if (top !== undefined && top < 0) card.current.parentElement.querySelector('.rail').scrollIntoView({ block: 'start' });
  }, [current]);

  const stage = stageFor(current, call.call_type);
  const here = record[current] || { taps: [], words: '' };
  const update = (patch) => setRecord((r) => ({ ...r, [current]: { ...here, ...patch } }));

  // Tapping rules: single-choice stages keep one answer; a "solo" answer clears the others,
  // and any other answer clears a solo one. So contradictory answers can't sit together.
  function toggleTap(id) {
    const on = here.taps.includes(id);
    const tap = stage.taps.find((t) => t.id === id);
    let taps;
    if (on) taps = here.taps.filter((t) => t !== id);
    else if (stage.single || tap?.solo) taps = [id];
    else taps = [...here.taps.filter((t) => !stage.taps.find((x) => x.id === t)?.solo), id];
    update({ taps });
  }

  // Save one stage in the background. Retries once; tells the caller if it still fails.
  function save(n) {
    const r = record[n];
    const taps = n === 7 ? [step.channel].filter(Boolean) : r?.taps || [];
    const words = n === 7 ? [step.when, step.referral_name].filter(Boolean).join(', ') : r?.words || '';
    const p = api
      .saveStage(call.id, n, taps, words)
      .catch(() => api.saveStage(call.id, n, taps, words))
      .then(() => setSaveError(''))
      .catch(() => setSaveError(`Stage ${n} didn’t save. It will be included when you close the call.`));
    pending.current.push(p);
  }

  function goTo(n, preset) {
    if (n === current) return;
    // Record the stage we're leaving if the caller passed through it or noted something.
    const r = record[current];
    if (current !== 8 && (n > current || r?.taps?.length || r?.words)) save(current);
    if (preset) setStep((s) => ({ ...s, ...preset }));
    // "Reached" = furthest stage before Close. Jumping to Close doesn't count as reaching it.
    setReached((m) => Math.max(m, current === 8 ? 0 : current, n === 8 ? 0 : n));
    setVisited((v) => new Set(v).add(n));
    setCurrent(n);
  }

  const nextN = path.find((n) => n > current);
  const tapped = (stage.taps || []).filter((t) => here.taps.includes(t.id));
  const ender = tapped.find((t) => t.ends);
  const jump = tapped.find((t) => t.goto);
  const fill = (t) => t.replace('{company}', call.company || 'the company');

  return (
    <main className="call">
      <section className="who" aria-label="Prospect">
        <div>
          <strong>{call.prospect_name}</strong>
          <span>{[call.prospect_role, call.company].filter(Boolean).join(', ')}</span>
        </div>
        <span className="kind">{call.call_type === 'follow_up' ? 'Follow-up' : 'First call'}</span>
        <time aria-label="Call time">{elapsed}</time>
      </section>

      <StageRail current={current} visited={visited} path={path} onJump={(n) => goTo(n)} />

      <section ref={card} className={`stage ${stage.keyWords ? 'key' : ''}`} aria-live="polite">
        <p className="stage-count">
          {path.includes(current) ? `Step ${path.indexOf(current) + 1} of ${path.length}` : 'Extra stage for this follow-up'}
        </p>
        <h1>{stage.name}</h1>
        <p className="for">{fill(stage.forWhat)}</p>

        {stage.maySay.length > 0 && (
          <div className="maysay">
            <h2>They may say</h2>
            <ul>
              {stage.maySay.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>
        )}

        {stage.tips.map((t) => (
          <p className="tip" key={t}>{fill(t)}</p>
        ))}

        {stage.close ? (
          <CloseStage
            call={call}
            reached={reached}
            stage={stage}
            here={here}
            toggleTap={toggleTap}
            step={step}
            record={record}
            pending={pending}
            onDone={onDone}
          />
        ) : (
          <>
            {stage.nextStep ? (
              <NextStepFields step={step} setStep={setStep} />
            ) : (
              <fieldset className="chips">
                <legend>What happened</legend>
                {stage.taps.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    aria-pressed={here.taps.includes(t.id)}
                    onClick={() => toggleTap(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </fieldset>
            )}

            {!stage.nextStep && (
              <label className="words">
                {stage.words || 'Their words'}
                <textarea
                  rows={stage.keyWords ? 4 : 2}
                  value={here.words}
                  onChange={(e) => update({ words: e.target.value })}
                  placeholder="Type what they said, as they said it"
                />
              </label>
            )}

            {saveError && <p className="error" role="alert">{saveError}</p>}

            {/* The main button changes with what was tapped, so the caller never has to work out what's next. */}
            <div className="actions">
              {ender ? (
                <button className="primary end" onClick={() => goTo(8)}>{ender.ends}</button>
              ) : jump ? (
                <button className="primary" onClick={() => goTo(7, { channel: jump.channel, named_by: 'them' })}>
                  {jump.gotoLabel}
                </button>
              ) : (
                <button className="primary" onClick={() => goTo(nextN)}>
                  Next: {stageFor(nextN, call.call_type).name}
                </button>
              )}
              {!ender && (
                <button className="end" onClick={() => goTo(8)}>End call here</button>
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

function useElapsed() {
  const [start] = useState(Date.now);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const s = Math.floor((now - start) / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}
