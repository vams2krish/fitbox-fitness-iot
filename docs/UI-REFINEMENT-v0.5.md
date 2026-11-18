# FitBox v0.5 — browser feedback implementation

The supplied Figma flow remains the navigation reference. The user's latest annotations override its yellow mystery cards, red controls, duplicate routes and placeholder artwork.

| Feedback | Implementation |
|---|---|
| Brand and sign-in | FitBox mark, title and tagline; blue sign-in button |
| Pixel coaches, activities and exercises | Original generated illustrations; individual animated sheets for 24 movements and two coaches |
| Store goodies | Six looping cosmetic-item sheets, with prices, owned/equipped states and existing SP accounting |
| Chat alignment | Left coach bubbles, right blue user bubbles; one local guided coach/Doubt Center entry |
| Body and goal selections | Twelve Blender-rendered proportion thumbnails; selected male/female athlete follows setup/profile |
| Home athlete | Demand-rendered interactive WebGL viewport, no Front/Back buttons |
| Athlete detail | Gesture rotation and zoom; today/week/year metrics, saved muscle-group highlights and links to logs |
| Profile photo and crown | User-selected photo stays local; crown/rim follows server-confirmed sandbox entitlement |
| Mystery tasks | Blue/violet concealed cards, explanatory ? button, explicit reveal/claim, completed work hidden behind eye toggle |
| Home links | Dedicated Goal Center and Studio Store buttons; XP entry also opens Goal Center; premium banner opens the single membership page |
| Goal comparison | Current/desired illustrations, profile-to-flag progress bar, actual daily claims percentage and editable targets |
| Navigation | Persistent five-tab structure; only the current section is blue; Reports is part of Insights |
| End of day | Removed from Home; existing back/exit confirmation offers end-day analysis |
| Camera workout | Default supported tracking route with explicit camera start; manual/off fallback in options |
| Camera HUD | Goal ring, cumulative reps, confidence and active time inside larger camera viewport; saved/set breakdown restored before starting |
| Controls | Primary start/pause/save; secondary camera, voice, recording, break and muscle notes in options |
| Spoken instructions | Existing local TTS reads setup/start/counts/cues/finish; repeat-instructions action; honors voice switch and installed local voice availability |
| Lessons | Scrollable dialog, normal content container, left-aligned instructions and readable muscle tags |
| Review | Two-column thumbnails, photo/video overlays, muted inline hover/focus preview, explicit playback, favorites/deletion, compact filters and collapsible import |
| Media privacy | Blobs and thumbnail URLs stay in local IndexedDB/browser memory; no media upload endpoint; URLs released on navigation |
| XP motion | Gradient fill plus short earned-point burst; reduced-motion disables effects |
| Animation efficiency | Off-screen/hidden sprites pause, battery saver slows loops, reduced-motion shows a still; 3D renders on input/resize rather than an idle frame loop |

## Verification

`npm test` covers 31 workout, pose, day rollover, reward, report, sync and privacy cases. `tools/test-studio.mjs` walks FTUE, partial and resumed workouts, claims, hidden completed tasks, reports/exports, exclusions and cosmetics. `tools/test-ui-comments.mjs` checks the new visual routes, gender selection, readable lesson layout, HUD, one membership screen, local photo, muted thumbnail hover, unified coach and layouts at 320/375/480/961 px. `tools/test-v2-ui.mjs` runs the real local model over a test-image stream; it does not use a person's camera. `tools/test-fullstack.mjs` verifies real Neon authentication, summary-only sync and account isolation. `tools/test-billing.mjs` verifies real Stripe sandbox checkout, signed events, entitlement, cancellation and portal behavior.

Email remains demo-only. The local guided coach is deterministic. Illustrations and animation demonstrate movement and do not infer physical changes or certify form. Physical-phone battery drain and compatibility with every music/calling app require device testing; no such blanket claim is made.

Final installed-APK verification passed on the emulator: cold-start call protection, paused manual counts with no automatic resume, actual Bluetooth settings and return to the same activity, bundled on-device model, camera without microphone tracks, background camera release, explicit resume, gesture-controlled 3D and native voice/support bridges. APK version/signature checks passed. The same browser annotation suite also passed against the public production URL.

Release APK: 69,093,870 bytes. SHA-256: `ddbf0d7c731277893f61f483a8d05ce7507cbe7a22a1e3db26a321a8ea77bb86`.

## Art sources

Generated bitmap prompts are recorded in `pixel-art-prompts.json` and the animation atlas manifest. Sprite PNG strips and looping GIF exports are in `web/assets/design/sprites`. Code-authored fallback choreography is retained in `web/pixel-sprites.js`; the app does not call a generative service at runtime. Anatomy adaptations retain their CC BY-SA notice in `web/models/anatomy/ATTRIBUTION.txt`.
