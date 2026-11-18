# FitBox v0.5.0 — Pixel Studio

Figma-inspired fitness flow refined from the 40 browser annotations. Original pixel coaches, exercise illustrations and 32 looping sprite sheets cover two coaches, 24 movements and six virtual store goodies. PNG strips, GIF exports, source atlases and prompts are included in the public repository.

- FitBox branding, blue sign-in, left/right onboarding conversation, distinct Blender body preferences and profile-driven athlete selection.
- Interactive Home athlete, detailed training stats, blue/violet mystery tasks, help, clear Goal Center/Store entries and a single FitBox+ membership route.
- Larger camera HUD with cumulative progress, goal ring, confidence and active time. Primary controls stay visible; camera/voice/recording/manual options are grouped below.
- Readable movement notes and muscle tags, local-only profile photo, authoritative premium crown/rim and one floating coach/Doubt Center entry.
- Compact local media thumbnails with muted inline hover previews, explicit playback, filters, import, favorites and deletion.
- Consistent five-tab active states, Reports beside Insights and end-day action in the back/exit confirmation.
- Native call protection re-registers after a cold launch when its optional permission is already granted. Returning from a call does not resume a workout automatically.

Android package `com.fitbox.app`, version 0.5.0, build 6. Debug signed for testing; Android 8+. It uses the same signing certificate as the prior release.

The app uses a pretrained deep-learning MediaPipe pose model on device and deterministic movement/coach logic. Camera media and raw landmarks are not uploaded. Cloud sync is opt-in for validated text/numeric summaries. Stripe remains sandbox-only; email remains a clearly labelled preview. Artwork animation illustrates movement and is separate from actual pose tracking.

Verification includes 31 core tests, complete browser user flows, real local-model inference over a test image, real Neon auth/sync/isolation, real Stripe sandbox lifecycle and the public production UI. The installed APK is tested separately on an Android emulator for interruptions, Bluetooth settings, camera disposal/resume and local 3D interaction. Physical-phone battery measurements and every third-party music/call app remain device-test work.
