# FitBox v0.6.1 — quieter, duplicate-safe reminders

- Suppress scheduled coach nudges while FitBox is open, including an idle screen.
- Native app visits suppress a pending five-minute follow-up immediately, before the WebView finishes refreshing.
- Persist a bounded history of delivered event IDs to prevent restored/replayed alarms from posting twice or consuming extra daily slots.
- Keep only the current daily counter. Explicit test notifications still work inside the app.

Includes the adaptive programs, editable templates, local pose worker/framing and notification preferences from v0.6.0. Closed-app reminders use Android scheduling; browser schedules remain previews. OS battery policies can delay delivery. Email reports remain demo delivery.

Validation: 12 pure JVM delivery guard cases. Installed Android instrumentation passed actual posting, foreground/recent-visit suppression, persistent replay protection and daily caps. Debug test APK; physical-device battery/audio behavior remains unverified.
