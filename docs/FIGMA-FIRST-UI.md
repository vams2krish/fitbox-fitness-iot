# Original Figma UI restoration — v0.4.1

Visual references: original Figma file `7vS0ax0bayEIE4QrXlBjsQ`, first shared welcome node `364:3661`, and the user's supplied first FitBox screenshots. Live MCP design reads are still Starter-quota limited. Existing downloaded context/assets and the supplied screenshots provide the reference.

| Area | Restored design language |
| --- | --- |
| Welcome | Original gym photograph, centered Welcome to FitBox, bottom blue Get Started action |
| Onboarding | Centered white-screen headings, two trainer cards, compact activity/body choices, bottom blue continuation |
| Home | Avatar, progress bar and Bluetooth header; Check-up panel above Task Center; full-width yellow mystery rows |
| Check-up | Blue body/stats panel, Front/Back controls and expand action; real Blender-rendered front/reverse references |
| Navigation | Five tabs, black inactive icons, blue current tab, original Learning/Message labels |
| Learning | Three-column, twelve-category blue tile grid |
| Coach/rewards | Avatar-over-card dialogs; blue celebration and yellow level-up palette |

Replacement coach symbols and licensed digital athlete artwork are retained, as requested when the original clipart was rejected. The welcome photo is an intentional exception, restored from the original Figma asset. Statistics remain based on recorded activity, not source mock values. Hidden claimed tasks, eye toggle, cumulative set counts, draft recovery, settings, local media, report templates, SP wallet and call handling remain intact.

Native packaging now explicitly uses the existing user debug keystore unless FITBOX_DEBUG_KEYSTORE is provided; the private key is never committed. This avoids different debug signatures when emulator-related environment paths vary. APK version and displayed version are both 0.4.1, build 5.

Verification: 31 unit tests; original-layout assertions for welcome/trainer/yellow rows/back panel/three-column learning; full browser end-to-end flow locally and on production; native version/signing-certificate check. Native lifecycle results are recorded in the release notes after final testing.


Final checks passed: 31 unit tests; original-layout assertions; full browser flow locally and on production; installed Android emulator incoming-call pause/no auto-resume, native Bluetooth return, real on-device camera/model, camera release/explicit resume, and 3D controls. Native metadata is 0.4.1 / build 5 and the signing certificate matches the previous APK.

APK SHA-256: `b3a6c2a0e2266922b71efb8ef9e097af01f736fb923ed22d45c6bafac4f02277`
