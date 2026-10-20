// The eight stages as one line, like a route map. The call moves down it.
// It only shows where the caller is; the data from the transcripts lives in each stage's tip.
import { useEffect, useRef } from 'react';
import { STAGES } from '../stages.js';

export default function StageRail({ current, visited, path, onJump }) {
  const ref = useRef(null);
  // On a phone the line runs sideways; keep the current stop in view.
  useEffect(() => {
    const el = ref.current?.querySelector('.stop.current');
    const nav = ref.current;
    if (el && nav && nav.scrollWidth > nav.clientWidth) {
      nav.scrollTo({ left: el.offsetLeft - nav.clientWidth / 2 + el.clientWidth / 2, behavior: 'smooth' });
    }
  }, [current]);

  return (
    <nav className="rail" aria-label="Call stages" ref={ref}>
      <ol>
        {STAGES.map((s) => {
          const state = s.n === current ? 'current' : visited.has(s.n) ? 'done' : 'ahead';
          // Stages off this call's path (the middle ones on a follow-up) stay visible but quiet.
          const off = !path.includes(s.n) && s.n !== current ? ' off' : '';
          return (
            <li key={s.n} className={`stop ${state}${off}`}>
              <button onClick={() => onJump(s.n)} aria-current={s.n === current ? 'step' : undefined}>
                <span className="dot" aria-hidden="true" />
                <span className="stop-name">{s.name}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Small version for the past-calls list: eight dots, filled up to the stage reached.
export function MiniLine({ reached }) {
  return (
    <span className="mini" role="img" aria-label={`Reached stage ${reached} of 8, ${STAGES[reached - 1]?.name}`}>
      {STAGES.map((s) => (
        <span key={s.n} className={s.n <= reached ? 'on' : ''} />
      ))}
    </span>
  );
}
