// What each stage shows on screen. Everything here comes from reading the 100 transcripts
// (see ANALYSIS.md): the "they may say" lines are real prospect lines, lightly shortened,
// and the counts are how many of the 100 calls ended at that stage.
//
// Tap options:
//   single: true  on a stage -> only one answer at a time
//   solo: true    on a tap   -> picking it clears the others (and the others clear it)
//   ends: '...'   on a tap   -> the call is over; the text is the End button's label
//   goto: 7       on a tap   -> offers a jump to Next step with the channel filled in

export const STAGES = [
  {
    n: 1,
    name: 'Opening',
    forWhat: 'Reach the right person, check they are still at {company}, and say who you are. They decide in ten seconds.',
    endedHere: 8,
    maySay: [
      'Calling from where? Who is this?',
      'Prakash Rao hasn’t had this number for 14 years.',
      'I’m driving, but go ahead.',
    ],
    tips: ['Say why you’re calling before asking for time. “Is this a good time?” first got “regarding what?” in 38 calls.'],
    single: true,
    taps: [
      { id: 'right_person', label: 'Right person' },
      { id: 'gatekeeper', label: 'Reception or assistant' },
      { id: 'wrong_person', label: 'Wrong person or number', ends: 'End call: wrong person' },
      { id: 'left_company', label: 'Left the company', ends: 'End call: they left' },
      { id: 'language_line', label: 'Language or bad line', ends: 'End call: call again later' },
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
    tips: ['Two sentences, then stop. 14 prospects thought we were consulting, a job, SEO or even the bank.'],
    taps: [
      { id: 'understood', label: 'Understood, go on', solo: true },
      { id: 'asked_what_we_do', label: 'Asked what we do' },
      { id: 'thought_something_else', label: 'Thought we’re something else' },
      { id: 'asked_cost', label: 'Asked about cost or our gain' },
      { id: 'asked_source', label: 'Asked where we got the number' },
      { id: 'flat_no', label: 'No, without a reason', solo: true, ends: 'End call: they said no' },
    ],
  },
  {
    n: 3,
    name: 'Permission',
    forWhat: 'Ask if they can talk now. Yes, no, or a time to call back are all good outcomes. Talking on without one is not.',
    endedHere: 6,
    maySay: [
      'Can you call me after 30 minutes? I’m in a call.',
      'Okay, but let it be quick. I have others.',
      'Send it on WhatsApp first, I’ll see.',
    ],
    tips: ['If they name a time, note it and end the call. Don’t push on after “call me later”.'],
    single: true,
    taps: [
      { id: 'yes_now', label: 'Yes, now' },
      { id: 'call_back', label: 'Call back later', goto: 7, channel: 'call', gotoLabel: 'Note the call-back time' },
      { id: 'send_first', label: 'Send something first', goto: 7, channel: 'whatsapp', gotoLabel: 'Note what to send' },
      { id: 'no', label: 'No', ends: 'End call: they said no' },
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
    tips: ['Ask one question about their work before talking about ours. 19 callers pitched first.'],
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
    tips: ['Type it as they say it. Only 15 of 100 prospects said this, and every one of those words was lost.'],
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
    tips: ['Most calls are lost here (21 of 100), usually to “not the right person”. Ask who is, by name.'],
    taps: [
      { id: 'not_right_person', label: 'Not the right person' },
      { id: 'have_consultant', label: 'Already have consultants or a team' },
      { id: 'cant_share', label: 'Can’t share data' },
      { id: 'send_writing', label: 'Send something in writing', goto: 7, channel: 'email', gotoLabel: 'Note what to send' },
      { id: 'no_time', label: 'No time, not now' },
      { id: 'asked_no_more_calls', label: 'Asked not to be called again', solo: true, ends: 'End call: don’t call again' },
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
    tips: ['One thing, with a time or a channel. A time they name is worth more than one you propose.'],
    nextStep: true,
  },
  {
    n: 8,
    name: 'Close',
    forWhat: 'End the call clearly and record what happened. The record is what the next call is built on.',
    maySay: [],
    tips: ['The outcome is suggested from your notes. Check it: 41 of 100 callers logged the wrong one.'],
    single: true,
    taps: [
      { id: 'clean_end', label: 'Ended clearly' },
      { id: 'line_dropped', label: 'Line dropped or they hung up' },
      { id: 'warm_no', label: 'Warm goodbye after a no' },
    ],
    close: true,
  },
];

// A follow-up call (about 1 in 7 transcript calls) only needs three stops.
export const FOLLOW_UP_PATH = [1, 7, 8];

// The follow-up Opening, from the follow-up calls in the transcripts.
const FOLLOW_UP_OPENING = {
  n: 1,
  name: 'Opening',
  forWhat: 'Say who you are and remind them what you sent, and when.',
  maySay: [
    'Actually I haven’t gone through it. Allow me a day.',
    'Can you send the mail again? I think it got lost.',
    'I spoke to management. They’re not interested.',
  ],
  tips: ['Follow-ups go straight to the next step. The middle stages are there if the talk goes that way.'],
  single: true,
  taps: [
    { id: 'read_it', label: 'They read it' },
    { id: 'not_read', label: 'Got it, not read yet', goto: 7, channel: 'call', gotoLabel: 'Note when to call back' },
    { id: 'not_received', label: 'Didn’t get it, resend', goto: 7, channel: 'email', gotoLabel: 'Note where to resend' },
    { id: 'not_interested_now', label: 'Not interested now', ends: 'End call: not interested' },
  ],
};

// The stage to show, given the call type.
export const stageFor = (n, callType) => (n === 1 && callType === 'follow_up' ? FOLLOW_UP_OPENING : STAGES[n - 1]);
export const pathFor = (callType) => (callType === 'follow_up' ? FOLLOW_UP_PATH : [1, 2, 3, 4, 5, 6, 7, 8]);

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

// Proposes an outcome from what the caller tapped, so they confirm rather than pick from scratch.
// Most specific signal wins. Returns null when the notes don't point anywhere.
export function suggestOutcome(record, step) {
  const tapped = new Set(Object.values(record).flatMap((r) => r.taps || []));
  const has = (...ids) => ids.some((id) => tapped.has(id));
  if (has('asked_no_more_calls')) return 'do_not_call';
  if (has('left_company')) return 'moved_company';
  if (has('wrong_person')) return 'wrong_person';
  if (has('language_line')) return 'call_again';
  if (step.channel === 'referral') return 'wrong_person';
  if (step.channel === 'call' || step.channel === 'meeting') return 'next_step_agreed';
  if (step.channel && step.when) return 'next_step_agreed';
  if (step.channel) return 'agreed_to_receive_report';
  if (has('not_right_person')) return 'wrong_person';
  if (has('flat_no', 'no', 'not_interested_now', 'have_consultant', 'all_fine', 'no_time')) return 'not_interested';
  return null;
}
