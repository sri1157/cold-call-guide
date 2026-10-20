-- Cold call guide: Supabase schema
-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run.

create extension if not exists pgcrypto;  -- for gen_random_uuid()

-- One row per call.
create table if not exists calls (
  id                 uuid primary key default gen_random_uuid(),
  prospect_name      text not null,
  prospect_role      text,
  company            text,
  call_type          text not null default 'first'
                       check (call_type in ('first', 'follow_up')),
  status             text not null default 'open'
                       check (status in ('open', 'closed')),
  started_at         timestamptz not null default now(),
  ended_at           timestamptz,
  -- furthest stage the call got to: 1 Opening .. 8 Close
  reached_stage      smallint not null default 1 check (reached_stage between 1 and 8),
  -- the caller's own outcome words (same 10 the transcripts use)
  outcome            text check (outcome in (
                       'agreed_to_receive_report', 'next_step_agreed', 'interested',
                       'follow_up', 'call_again', 'not_interested', 'do_not_call',
                       'wrong_person', 'moved_company', 'not_logged')),
  -- the one concrete next step (stage 7)
  next_step_channel  text check (next_step_channel in ('whatsapp', 'email', 'call', 'meeting', 'referral')),
  next_step_when     text,            -- free text: "Tue 2pm", "after the 20th"
  next_step_named_by text check (next_step_named_by in ('them', 'us')),
  referral_name      text,
  referral_contact   text,
  -- written after the call by the LLM review
  summary            text,
  review             jsonb            -- {suggested_outcome, mismatch, reason, source}
);

-- One row per stage the caller recorded on a call.
create table if not exists stage_results (
  id             bigint generated always as identity primary key,
  call_id        uuid not null references calls(id) on delete cascade,
  stage          smallint not null check (stage between 1 and 8),
  taps           text[] not null default '{}',   -- what happened, from the chips
  prospect_words text,                           -- the prospect's own words
  saved_at       timestamptz not null default now(),
  unique (call_id, stage)                        -- re-saving a stage overwrites it
);

create index if not exists calls_started_at_idx on calls (started_at desc);
create index if not exists stage_results_call_idx on stage_results (call_id);

-- Row Level Security on, with no policies: the public anon key can read nothing.
-- Only the backend, holding the service-role key, can read and write.
alter table calls enable row level security;
alter table stage_results enable row level security;
