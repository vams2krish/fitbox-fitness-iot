# FitBox v0.6.0 — programs and coach reminders

- Adaptive multi-day programs across seven horizons, four experience levels and goal/equipment filters. Personal local regression adjusts capacity and pace from historical summaries.
- Program Library with 80 preset combinations, editable sets/ranges and manual Task Center imports. Completed days, recovery and future sessions are visible.
- Six-tab mobile dock with Store between Insights and Message; improved multiline composer.
- On-device pose inference worker and bounded smart preview framing; raw media stays local.
- Opt-in Android scheduled coach reminders, quiet sleep/work hours, 30/60-minute workout lead time, recovery/comeback and verified membership messages. Original CC0 chimes, matching icons and coach imagery.

Web notification UI previews schedules; remote Web Push/FCM is not configured. Android timing is subject to system battery restrictions. Email reports remain demo delivery. This is a debug test APK, not a Play Store production signing build.

Validation: 51 pure logic/schema tests passed. Browser regression checked Day 1 completion, Day 2 recovery, Day 3 rollover, partial progress, fixed same-day targets, seven horizons, dock state and multiline messaging. See model card and notification documentation for implementation limits.

Installed emulator verification passed: native notification permission, scheduled alarms, actual system notification with custom sound channel, deep-link routing and cancellation. Real Postgres signup/sync, isolation, idempotency, raw-landmark rejection and signout passed. Pose worker inference ran on both browser fixture and Android camera. Physical-device battery/audio behavior remains unverified.
