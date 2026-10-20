// What each stage shows on screen. Everything here comes from reading the 100 transcripts
// (see ANALYSIS.md): the "they may say" lines are real prospect lines, lightly shortened,
// and the counts are how many of the 100 calls ended at that stage.

export const STAGES = [
  {
    n: 1,
    name: 'Opening',
    single: true,
    forWhat: 'Reach the right person and say who you are. They decide in ten seconds whether this is worth a minute.',
    endedHere: 8,
    maySay: [
      'Calling from where? Who is this?',
      'Prakash Rao hasn’t had this number for 14 years.',
      'I’m driving, but go ahead.',
    ],
    tips: [
      'Check they are still at {company} before you say more. In 8 calls the caller pitched first and then heard the person had left.',
      'Don’t ask “is this a good time?” yet. Say why you called first: in 38 calls that question only got “regarding what?”.',
    ],
    taps: [
      { id: 'right_person', label: 'Right person' },
      { id: 'gatekeeper', label: 'Reception or assistant' },
      { id: 'wrong_person', label: 'Wrong person or number', ends: true, endLabel: 'End call: wrong person', outcome: 'wrong_person' },
      { id: 'left_company', label: 'Left the company', ends: true, endLabel: 'End call: they left', outcome: 'moved_company' },
      { id: 'language_line', label: 'Language or bad line', ends: true, endLabel: 'End call: line or language', outcome: 'call_again' },
    ],
    followTaps: [
      { id: 'reminded', label: 'Reminded them what we sent' },
      { id: 'resend', label: 'Didn’t get it, resend', goto: 7, channel: 'whatsapp', note: 'Note where to resend', outcome: 'agreed_to_receive_report' },
      { id: 'call_back', label: 'Call back later', goto: 7, channel: 'call', note: 'Note the call-back time', outcome: 'next_step_agreed' },
      { id: 'left_company', label: 'Left the company', ends: true, endLabel: 'End call: they left', outcome: 'moved_company' },
    ],
  },
  {
    n: 2,
    name: 'Purpose',
    forWhat: 'Say why you called in one or two sentences they could repeat to a colleague.',
    endedHere: 13,
    maySay: [
      'Regarding what? What does your company do?',
      'So you’re a consulting firm? Is this about a job?',
      'Is it a paid service? How do you benefit from this?',
    ],
    tips: [
      'Two sentences, then stop. Prospects took the call for consulting, a job, SEO, a media house and even the bank (14 calls).',
    ],
    taps: [
      { id: 'understood', label: 'Understood, go on', solo: true },
      { id: 'asked_what_we_do', label: 'Asked what we do' },
      { id: 'thought_something_else', label: 'Thought we’re something else' },
      { id: 'asked_cost', label: 'Asked about cost or our gain' },
      { id: 'asked_source', label: 'Asked where we got the number' },
      { id: 'flat_no', label: 'No, without a reason', ends: true, solo: true, endLabel: 'End call: they said no', outcome: 'not_interested' },
    ],
  },
  {
    n: 3,
    name: 'Permission',
    single: true,
    forWhat: 'Ask if they can talk now. Yes, no, or a time to call back are all good outcomes. Talking on without one is not.',
    endedHere: 6,
    maySay: [
      'Can you call me after 30 minutes? I’m in a call.',
      'Okay, but let it be quick. I have others.',
      'Send it on WhatsApp first, I’ll see.',
    ],
    tips: ['If they name a time, write it down and end the call. Don’t push on after “call me later”.'],
    taps: [
      { id: 'yes_now', label: 'Yes, now' },
      { id: 'call_back', label: 'Call back later', goto: 7, channel: 'call', note: 'Note the call-back time', outcome: 'next_step_agreed' },
      { id: 'send_first', label: 'Send something first', goto: 7, channel: 'whatsapp', note: 'Note where to send it', outcome: 'agreed_to_receive_report' },
      { id: 'no', label: 'No', ends: true, endLabel: 'End call: they said no', outcome: 'not_interested' },
    ],
  },
  {
    n: 4,
    name: 'Their business',
    forWhat: 'Ask about their company and their work before saying more about yours.',
    endedHere: 0,
    maySay: [
      'Our company is the market leader.',
      'We only do manufacturing, job work. No R&D team.',
      'First tell me what you guys do.',
    ],
    tips: ['In 19 calls the caller explained Meridian before asking anything. Ask one question about their work first.'],
    taps: [
      { id: 'told_us', label: 'Told us about their work' },
      { id: 'corrected_us', label: 'Corrected us' },
      { id: 'one_line', label: 'One line, waiting for the pitch', solo: true },
      { id: 'asked_us_first', label: 'Asked about us first' },
    ],
    words: 'What they do, as they put it',
  },
  {
    n: 5,
    name: 'Their need',
    forWhat: 'Hear what they are trying to do or struggling with. Write down exactly what they say.',
    endedHere: 2,
    maySay: [
      'The biggest challenge is skilled manpower.',
      'Thankfully we are on the right track.',
      'What can you do for a company like ours?',
    ],
    tips: ['Only 15 of 100 prospects said their need in their own words, and none of it survived in the logged outcome. Type it as they say it.'],
    taps: [
      { id: 'named_goal', label: 'Named a goal' },
      { id: 'named_problem', label: 'Named a problem' },
      { id: 'all_fine', label: 'All fine, nothing needed', solo: true },
      { id: 'turned_back', label: 'Asked what we can do for them' },
    ],
    words: 'Their exact words',
    keyWords: true,
  },
  {
    n: 6,
    name: 'Objection',
    forWhat: 'Hear the reason for a no and understand it. A reason you understood can be answered later; one you talked over cannot.',
    endedHere: 21,
    maySay: [
      'I’m not the right person. That’s decided at head office.',
      'We already have consultants. The big four, globally.',
      'Why would we give you that kind of data?',
    ],
    tips: ['This is where most calls are lost: 21 of 100. The most common reason is “I’m not the right person”. Ask who is, by name.'],
    taps: [
      { id: 'not_right_person', label: 'Not the right person' },
      { id: 'have_consultant', label: 'Already have consultants or a team' },
      { id: 'cant_share', label: 'Can’t share data' },
      { id: 'send_writing', label: 'Send something in writing', goto: 7, channel: 'email', note: 'Note where to send it', outcome: 'agreed_to_receive_report' },
      { id: 'no_time', label: 'No time, not now' },
      { id: 'asked_no_more_calls', label: 'Asked not to be called again', ends: true, solo: true, endLabel: 'End call: do not call', outcome: 'do_not_call' },
    ],
    words: 'Their reason, in their words',
  },
  {
    n: 7,
    name: 'Next step',
    forWhat: 'Agree one concrete thing: a document, a call at a named time, a meeting or a referral.',
    reached: 50,
    maySay: [
      'Send it on WhatsApp, same number.',
      'Tuesday is a good day. After 2 PM.',
      'Speak to Mr. Naik, he handles our operations.',
    ],
    tips: ['Half the calls got here, mostly to “send it on WhatsApp”. A time they name is worth more than one you propose.'],
    nextStep: true,
  },
  {
    n: 8,
    name: 'Close',
    single: true,
    forWhat: 'End the call clearly and record what happened. The record is what the next call is built on.',
    maySay: [
      'Hold on one second. (The call never came back.)',
      'Thank you, thank you. (A warm goodbye after a no is still a no.)',
      'Okay, bye.',
    ],
    tips: ['41 of 100 logged outcomes didn’t match what was said. Pick the one that fits the call.'],
    taps: [
      { id: 'clean_end', label: 'Ended clearly' },
      { id: 'line_dropped', label: 'Line dropped or they hung up' },
      { id: 'warm_no', label: 'Warm goodbye after a no' },
    ],
    close: true,
  },
];

export const CHANNELS = [
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'email', label: 'Email' },
  { id: 'call', label: 'Call at a time' },
  { id: 'meeting', label: 'Meeting' },
  { id: 'referral', label: 'Referral' },
];

// The callers' own outcome words, with plain labels.
export const OUTCOMES = [
  { id: 'agreed_to_receive_report', label: 'Will receive a document' },
  { id: 'next_step_agreed', label: 'Next step agreed (time or meeting)' },
  { id: 'interested', label: 'Interested, no fixed step' },
  { id: 'follow_up', label: 'We call again' },
  { id: 'call_again', label: 'Call again (language or line)' },
  { id: 'not_interested', label: 'Not interested' },
  { id: 'do_not_call', label: 'Asked not to be called' },
  { id: 'wrong_person', label: 'Wrong or not the right person' },
  { id: 'moved_company', label: 'Left the company' },
];

export const outcomeLabel = (id) => OUTCOMES.find((o) => o.id === id)?.label || 'Nothing logged';

export const channelLabel = (id) => CHANNELS.find((c) => c.id === id)?.label || id;

export function tapsFor(stage, callType) {
  if (callType === 'follow_up' && stage.followTaps) return stage.followTaps;
  return stage.taps || [];
}

// The outcome the record already implies. An ending tap wins. A time they named
// beats "send a document". Used to pre-select Close, and a call is not saved without one.
export function suggestOutcome(record, step, callType = 'first') {
  let fromTap = '';
  let fromEnd = '';
  for (const stage of STAGES) {
    const chosen = record[stage.n]?.taps || [];
    for (const tap of tapsFor(stage, callType)) {
      if (!chosen.includes(tap.id) || !tap.outcome) continue;
      if (tap.ends) fromEnd = tap.outcome;
      else fromTap = tap.outcome;
    }
  }
  if (fromEnd) return fromEnd;
  if (step?.when && step.channel && step.channel !== 'referral') return 'next_step_agreed';
  if (step?.channel === 'whatsapp' || step?.channel === 'email') return 'agreed_to_receive_report';
  if (step?.channel) return 'next_step_agreed';
  return fromTap;
}
