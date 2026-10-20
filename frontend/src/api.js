// Every request to the backend goes through here. The screen never talks to Supabase
// or the LLM directly; it only knows this one URL.
const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '');

async function request(path, { method = 'GET', body, timeoutMs = 60000 } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    // 60s default: Render's free tier can take ~50s to wake from sleep.
    signal: AbortSignal.timeout(timeoutMs),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  health: () => request('/health', { timeoutMs: 70000 }),
  startCall: (prospect) => request('/calls', { method: 'POST', body: prospect }),
  saveStage: (id, stage, taps, prospect_words) =>
    request(`/calls/${id}/stages`, { method: 'POST', body: { stage, taps, prospect_words } }),
  closeCall: (id, close) => request(`/calls/${id}/close`, { method: 'POST', body: close }),
  setOutcome: (id, outcome) => request(`/calls/${id}/outcome`, { method: 'POST', body: { outcome } }),
  listCalls: () => request('/calls'),
};
