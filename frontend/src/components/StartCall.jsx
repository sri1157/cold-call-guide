// Before dialling: who are we calling, and is it a first call or a follow-up?
import { useState } from 'react';
import { api } from '../api.js';

export default function StartCall({ onStarted }) {
  const [form, setForm] = useState({ prospect_name: '', prospect_role: '', company: '', call_type: 'first' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      onStarted(await api.startCall(form));
    } catch (err) {
      setError(`Couldn’t start the call: ${err.message}. Check the server status above and try again.`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="start">
      <h1>Who are you calling?</h1>
      <form onSubmit={submit}>
        <label>
          Prospect name
          <input required value={form.prospect_name} onChange={set('prospect_name')} placeholder="Dhruv Mehta" autoFocus />
        </label>
        <label>
          Role
          <input value={form.prospect_role} onChange={set('prospect_role')} placeholder="Director" />
        </label>
        <label>
          Company
          <input value={form.company} onChange={set('company')} placeholder="Studio Arka" />
        </label>
        <fieldset className="segmented">
          <legend>This call is</legend>
          <div className="seg-track">
            {[
              ['first', 'A first call'],
              ['follow_up', 'A follow-up'],
            ].map(([v, label]) => (
              <label key={v} className={form.call_type === v ? 'on' : ''}>
                <input type="radio" name="call_type" value={v} checked={form.call_type === v} onChange={set('call_type')} />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="primary" disabled={busy}>{busy ? 'Starting…' : 'Start call'}</button>
      </form>
    </main>
  );
}
