// Shared vocabulary. The backend validates against these, and the LLM prompt uses them.

export const STAGES = {
  1: 'Opening',
  2: 'Purpose',
  3: 'Permission',
  4: 'Their business',
  5: 'Their need',
  6: 'Objection',
  7: 'Next step',
  8: 'Close',
};

// The 10 outcome words the callers in the transcripts used, with what they meant.
export const OUTCOMES = {
  agreed_to_receive_report: 'prospect agreed to receive a document on WhatsApp or email',
  next_step_agreed: 'a meeting, a call at a set time, or a report plus a follow-up call was agreed',
  interested: 'prospect said they were interested, without a fixed next step',
  follow_up: 'the caller is to call again',
  call_again: 'the number is to be called again, often because of language or line quality',
  not_interested: 'prospect declined',
  do_not_call: 'prospect asked not to be called',
  wrong_person: 'the person reached was not the person listed, or not the right person',
  moved_company: 'the person no longer works at the listed company',
  not_logged: 'nothing logged',
};

export const CHANNELS = ['whatsapp', 'email', 'call', 'meeting', 'referral'];
