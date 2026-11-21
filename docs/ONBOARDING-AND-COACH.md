# FitBox onboarding and Message Center — v0.7.0

The setup follows the existing Figma-inspired trainer/activity/chat workflow, with twelve stages: coach, activities, account details, goals chat, program schedule, equipment, movement comfort, coaching preferences, reminders, body preference, desired direction and final review.

Users choose four experience levels, goals, seven program lengths, an 8–90 minute session ceiling, 2–6 training days/week, equipment, movement exclusions and initial readiness. Camera/manual mode, smart framing, local voice, battery saver and optional local recording are explicit preferences. Reminder setup covers workout time, 30/60-minute lead, a five-minute follow-up, sleep/work quiet hours, weekdays, sounds and daily cap. No camera permission is requested here; Android notification permission is requested only after the final confirmation when opted in. Web reminders remain schedule previews. Report email delivery stays demo-only.

Draft answers save locally as entered and resume after reload. The review includes the actual first-session sets/ranges and Edit links that return directly to review. Existing work/history is preserved when repeating setup. New program and activity preference revisions apply tomorrow after work starts today. Safety exclusions apply immediately. Future plans use the existing personal model; this questionnaire does not create a cloud account or subscription.

## Message Center NLP

`web/coach-nlp.js` implements local example-based intent retrieval: normalized text, aliases, word/bigram TF-IDF vectors, cosine similarity, a confidence/margin fallback and explicit symptom/exclusion guards. It includes **30 intent topics and 164 example questions**, plus an urgent-symptom response and an unknown-question clarification. This is a small domain-specific NLP system, not a generative language model or a human trainer.

Prepared responses use live local plan ranges, logs, equipment and settings. Response variants rotate for repeat intents. Exercise context supports follow-ups such as “What muscles does it work?” and “How many sets?”; excluded exercises are respected. Unknown questions ask for clarification. Guidance does not invent a payment status, delivered email, diagnosis or physique measurement. Buttons open allowed app screens; text does not silently change a plan, grant rewards or initiate a payment.

The chat stays on-device, with a bounded 120-message history. Its viewport scrolls the conversation while keeping suggestions and the multiline composer above the six-tab dock. The floating coach opens this same Message Center. The separate onboarding flow opens when explicitly requested.

[Inspect all example question/answer pairs](coach-qa-examples.json). Regenerate them with `node tools/export-coach-qa.mjs`; they use a fictional profile. Edit the runtime catalog/response templates in `web/coach-nlp.js` and validate with `tests/coach-nlp.test.cjs`.

## Task Center

The prescription decorator is idempotent across Home and nested Task Center rendering: exactly one sets × rep/seconds range appears per revealed activity. The separate live progress count remains visible. Concealed activities do not reveal their prescription.

## Verification

61 pure planner, onboarding, NLP, privacy/schema and product tests passed. Browser end-to-end checks covered all setup stages, draft reload, review edits, actual preference application, contextual conversation, app links, responsive layouts and single Task Center labels. Android installed-build and authenticated Postgres sync checks verify the same flows and bounded activity preference revisions. These checks do not establish clinical guidance accuracy or physical-device battery performance.
