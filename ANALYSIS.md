# What the 100 transcripts show

I read all 100 calls and coded each one: the stage it ended in, why it ended, and whether the outcome the caller logged matches what was said. The screen's content comes from this. The transcripts themselves are not in this repo; they were provided for the task only.

## Where calls end

| Stage the call ended in | Calls | What ended them |
|---|---|---|
| 1 Opening | 8 | Wrong number, number reassigned years ago, language, bad line |
| 2 Purpose | 13 | A no after a long explanation, confusion about what we are, person had left the company |
| 3 Permission | 6 | "Call me in an hour", "I'm at a school event" |
| 4 Their business | 0 | |
| 5 Their need | 2 | Line trouble; a long monologue with no next step |
| 6 Objection | 21 | Not the right person, already have consultants, can't share data |
| 7 Next step | 50 | Mostly "send it on WhatsApp/email"; about a dozen agreed a call at a set time |

## What prospects say

| What they said | Calls | Example |
|---|---|---|
| "Calling from where? Who is this?" | 38 | "Uh, from where? Can you say it again?" |
| "Regarding what?" | 33 | "No, no. Regarding what is it, madam?" |
| "Send it on WhatsApp / email" | 25 | "You send it on WhatsApp to me." |
| "Call me later" / "I'm driving, in a meeting" | 17 | "Can you call me in an hour?" |
| Took us for something else (consulting, job, SEO, media, bank) | 14 | "Is it like SEO?" "Why, is this the bank?" |
| "Not the right person" / decided elsewhere | about 15 | "Those decisions are taken at corporate in the US." |
| "What does your company do?" | 10 | "What is Meridian?" |
| "Is it paid? What's in it for you?" | 9 | "Are you an NGO, or working for profit?" |
| "Already have consultants / an internal team" | 8 | "We have global tie-ups with the big four." |
| "Can't share data" | 5 | "Why would we give you that kind of data?" |
| "Where did you get my number?" | 5 | "Where did you get my contact from?" |

## Patterns that shaped the screen

1. **Permission was asked before purpose.** 75 calls ask "is this a good time?" early; in 38 the prospect replied "who are you" or "regarding what?" instead of yes or no. The screen says why first, then asks.
2. **The purpose did not land.** 14 prospects took the call for something else. Stage 2 says: two sentences, then stop.
3. **Wrong and moved people were found late.** 8 calls pitched before learning the person had left (one left 8 years earlier). Opening prompts "Are you still at {company}?".
4. **Stage 4 was mostly skipped.** 19 calls explained Meridian before asking anything; about 25 asked the prospect anything at all.
5. **Stage 5 words were lost.** Only 15 prospects stated a need in their own words ("skilled manpower", "new products with our facility", "customers want sustainability for US and Europe"). None of it survives in the logged outcome. Stage 5 has the largest text box on the screen.
6. **Follow-ups are common.** About 1 in 7 calls follow up on a report. The screen has a follow-up mode that goes straight to the next step.

## Logged outcomes vs. the calls

41 of 100 logged outcomes don't match the call (32 clearly, 9 mildly):

- 10 calls logged `not_logged` after a next step had been agreed.
- `do_not_call` was logged 10 times; 9 of those prospects never asked not to be called. Most said "I'm not the right person", and one (T084) had agreed a call for next Thursday.
- Calls where the person had left the company were logged as `not_interested`, `call_again` or `follow_up`.

This is why the LLM feature checks the outcome after the call rather than doing something during it.
