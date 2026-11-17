# FitBox roadmap

> Historical v0.1 roadmap. On-device pose inference and authenticated Neon sync are now implemented. See [V0.2-STATUS.md](V0.2-STATUS.md) for current work and blockers.

## 0.1 — Software experience

Offline local profile, level-based starter goals, manual repetition tracking, active timers, partial-session persistence, daily claims, XP, streaks, rest days, anatomy references, guides, insights, export, Android package, and web preview.

## Hardware integration

Obtain a real firmware protocol before implementing BLE. Required inputs: advertised device identifiers, supported BLE services/characteristics, pairing and authentication rules, notification format, exercise and session IDs, timestamps, units, battery status, acknowledgement/error messages, and reconnect semantics.

Add a transport boundary that maps validated sensor events to sessions while keeping manual and sensor sources distinguishable. Cover duplicate/out-of-order events, interruptions, device disconnection, and background operation. Validate against an actual FitBox prototype.

## Computer vision

Assess mobile versus dedicated-device inference. Collect consented, appropriately licensed validation data. Evaluate pose estimation across camera positions, clothing, lighting, mobility ranges, and supported exercises. Define confidence and failure behavior; do not infer fitness or muscle growth from an unvalidated visual avatar.

A neural pose model would make this feature deep learning / computer vision. Rep phase logic may then use joint angles and state machines. The current software does not include any such model, dataset, or accuracy claim.

## Connected product

Design secure sign-in, data ownership, recovery, family profiles, cloud sync and conflicts, offline reconciliation, and explicit controls for storing or sharing exercise videos. Add notifications only after implementing Android permission, scheduling, cancellation, and user preference flows.

## Production readiness

Review exercise content with qualified instructors; expand the real-device and accessibility test matrix; set up release signing outside the repository; validate upgrade and data migration behavior; package for distribution; and finalize the product's privacy policy and content licenses.
