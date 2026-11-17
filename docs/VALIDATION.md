# Validation record

Verified on November 17, 2026.

## Automated checks

| Check | Result |
| --- | --- |
| JavaScript syntax | Passed `node --check web/app.js` |
| Core test suite | 6 tests passed, 0 failed |
| Browser end-to-end flow | Passed `node tools/test-ui.mjs` |
| Screenshots | 14 browser captures plus Android emulator captures |
| Asset loading | Every visible `<img>` in tested screens loaded with nonzero dimensions |
| Responsive layout | No document horizontal overflow at tested phone and desktop widths |
| Android build | `assembleDebug` succeeded with JDK 17, AGP 8.12.2, Gradle 8.14.3 |
| APK signing | `apksigner verify` succeeded |
| Android installation | `adb install -r` succeeded on API 36.1 emulator |
| Android launch | MainActivity resumed; welcome and local demo dashboard rendered |
| Web deployment | Vercel production deployment reached READY; public root returned HTTP 200 |

The browser suite exercises the actual UI: onboarding through all preference steps, front/back anatomy, empty-state insights, manual repetition entry and undo, active timer pause/resume, save and claim, persistence after reload, guides, profile, device status, rest day, JSON export, timed meditation, reset confirmation cancellation, and completed reset. It checks that no uncaught browser page errors occurred.

Core tests cover plan scaling, cumulative partial sessions, claim eligibility and duplicate prevention, duplicate session IDs, invalid values, timed-task progress, calendar-day streaks, rest-day behavior, and corrupted storage recovery.

## Practical limits

- Browser flow testing is automated in Chromium. Native Android coverage is an emulator smoke test, not the same full automated browser suite.
- No physical phone or dedicated FitBox hardware was connected.
- Bluetooth transport and computer vision are not implemented or tested.
- The Android share flow is implemented; selection of a real recipient or storage destination is left to the user.
- There is no cross-device sync, encrypted application database, production account system, or server-side reward validation.
- No accessibility certification, exercise/clinical validation, battery benchmark, or broad Android device matrix is claimed.
- The APK is debug signed. A production store release requires separate release signing and distribution preparation.

The APK checksum is published beside the binary in the GitHub release.
