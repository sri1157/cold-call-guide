// Provider-agnostic LLM client.
// Gemini, Cerebras and Mistral all expose an OpenAI-style /chat/completions endpoint,
// so one function can talk to any of them. Switching provider = changing two env vars.

const PROVIDERS = {
  gemini: {
    url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    model: 'gemini-3.8-flash',
  },
  cerebras: {
    url: 'https://api.cerebras.ai/v1/chat/completions',
    model: 'gpt-oss-120b',
  },
  mistral: {
    url: 'https://api.mistral.ai/v1/chat/completions',
    model: 'mistral-small-latest',
  },
};

export function llmConfig() {
  const name = (process.env.LLM_PROVIDER || 'gemini').toLowerCase();
  const provider = PROVIDERS[name];
  if (!provider) throw new Error(`Unknown LLM_PROVIDER "${name}". Use one of: ${Object.keys(PROVIDERS).join(', ')}`);
  return {
    name,
    url: provider.url,
    model: process.env.LLM_MODEL || provider.model,
    key: process.env.LLM_API_KEY,
  };
}

// Sends messages, returns the reply text. Throws on timeout, HTTP error or a missing key.
export async function chat(messages, { timeoutMs = 20000, temperature = 0.2 } = {}) {
  const cfg = llmConfig();
  if (!cfg.key) throw new Error('LLM_API_KEY is not set');

  const res = await fetch(cfg.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cfg.key}`,
    },
    body: JSON.stringify({ model: cfg.model, messages, temperature }),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`${cfg.name} returned ${res.status}: ${body.slice(0, 300)}`);
  }
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error(`${cfg.name} returned no message content`);
  return text;
}

// Models sometimes wrap JSON in ```json fences or add a sentence around it.
// Take the first {...} block and parse it.
export function parseJsonReply(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end <= start) throw new Error('No JSON object in LLM reply');
  return JSON.parse(text.slice(start, end + 1));
}
