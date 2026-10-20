# Call guide

The screen a caller keeps open beside the phone on a cold call. It walks through the eight stages of a first call, shows what prospects tend to say at each one, records what happened with a tap and the prospect's own words in one box, and saves the call. A second screen lists past calls and the stage each one reached.

The stage content is built from reading 100 cold-call transcripts. See [ANALYSIS.md](ANALYSIS.md).

## Live

- Screen (Vercel): https://YOUR-APP.vercel.app
- API (Render): https://YOUR-API.onrender.com
- Health: https://YOUR-API.onrender.com/health (add `?deep=1` to also check the database)

The API runs on Render's free tier and sleeps when idle. The screen pings `/health` as soon as it opens, so the first request can take up to a minute.

## The LLM, and what it's for

**Provider:** any of Gemini, Cerebras or Mistral, chosen by `LLM_PROVIDER` and `LLM_API_KEY` on the backend. The live deployment uses **YOUR PROVIDER**.

**Job:** after a call closes, it drafts a one-line summary and checks whether the outcome the caller picked matches what they recorded during the call.

**Why this one:** in the transcripts, 41 of 100 logged outcomes don't match the call. Ten calls were logged as `not_logged` after a next step was agreed, and `do_not_call` was used for "not the right person" 9 times out of 10. A wrong outcome loses the lead, and the record is what the next call is built on. It also runs after the call, not during it: the free API can take a minute to wake, which would freeze the screen while the prospect is talking.

**How it is kept honest:**
- Deterministic rules run first and always. The LLM can raise a flag, but cannot clear one the rules raised.
- Its suggested outcome must be one of the ten outcome words, or it is ignored.
- The prospect's words are passed as fenced data, never as instructions.
- If the LLM fails or is out of quota, the call is still saved and the rules still run.
- Nothing changes on its own: the caller sees the flag and taps to accept or ignore it.
- The key lives only on Render. The browser only talks to the API.

## Structure

```
supabase/schema.sql      tables: calls, stage_results (RLS on, no public access)
backend/                 Express API on Render
  src/index.js           app, CORS, /health
  src/routes/calls.js    the call endpoints
  src/review.js          outcome rules + LLM review
  src/llm.js             one client for Gemini / Cerebras / Mistral
  test/                  tests built from transcript cases (npm test)
frontend/                Vite + React screen on Vercel
  src/stages.js          what each stage shows, from the transcripts
  src/components/        call screen, stage line, close, past calls
```

## API

| Method | Path | Does |
|---|---|---|
| GET | `/health` | Answers when the API is up |
| POST | `/calls` | Start a call |
| POST | `/calls/:id/stages` | Save what happened at one stage |
| POST | `/calls/:id/close` | Close the call: outcome, next step, then the review |
| POST | `/calls/:id/outcome` | Accept a suggested outcome |
| GET | `/calls` | List past calls with the stage each reached |
| GET | `/calls/:id` | One call with its stages |

## Run it locally

1. In Supabase, run `supabase/schema.sql` in the SQL editor.
2. Backend:
   ```
   cd backend
   cp .env.example .env    # fill in Supabase and LLM values
   npm install
   npm run dev
   npm test
   ```
3. Frontend:
   ```
   cd frontend
   cp .env.example .env    # VITE_API_URL=http://localhost:8080
   npm install
   npm run dev
   ```

## Deploy

- **Render:** Web Service, root directory `backend`, build `npm install`, start `npm start`. Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `LLM_PROVIDER`, `LLM_API_KEY`, `FRONTEND_ORIGIN` (the Vercel URL).
- **Vercel:** import the repo, root directory `frontend`, framework Vite. Set `VITE_API_URL` to the Render URL.
