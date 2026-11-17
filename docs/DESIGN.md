# Design provenance

> Historical v0.1 record. See [V0.2-STATUS.md](V0.2-STATUS.md) for current coverage and unresolved Figma states.

Source file: `7vS0ax0bayEIE4QrXlBjsQ`, original prototype starting at `364:3661`.

The file also contains an MVP Version 2.0 page. The shared URL points to the original Version 1.0 flow, so that is the primary visual reference for this release.

| Figma node | Reference | Implementation |
| --- | --- | --- |
| `364:3661` | Welcome Screen | Blurred gym background, centered welcome, blue primary action |
| `312:3159` | Onboarding 1 | Goal choices and four-step progress indicator |
| `364:4815` | Onboarding 2 | Fitness level selection |
| `364:4868` | Onboarding 3 | Available time |
| `364:4925` | Onboarding 4 | Schedule preference |
| `364:4986` | Activity Selection Area | Body Exercise, Yoga Pose, Meditation choices |
| `381:4523` | Homescreen 1 | Front anatomy, blue panels, daily workouts, exercise instructions |
| `455:5169` | Homescreen 2 | Back anatomy view |
| `435:4711` | Insights | Activity chart and exercise totals |
| `445:4674` | Gallery | Exercise imagery and browsing layout |

The implementation uses local Figma assets, not screenshots of screens as app backgrounds. API-provided asset URLs were downloaded into `web/assets`; `asset-manifest.json` records their provenance. There are no temporary Figma URLs used at runtime.

The app adapts prototype-only elements into working behavior: local profile replaces nonfunctional authentication, metrics use actual recorded data instead of fixed mock totals, the chart is dynamic, task claims require recorded activity, and device status explicitly states integration availability. Bright green prototype claim controls become blue at the user's request. Native Android system chrome replaces drawn iPhone status bars.

The front/back anatomy image itself is static. XP changes levels, not the anatomical illustration. Mountain pose uses written instructions, avoiding the activity selector's headstand image as a misleading illustration of a different pose.
