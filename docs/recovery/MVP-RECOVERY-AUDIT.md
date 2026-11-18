# FitBox MVP 2.0 recovery audit

Historical discrepancy audit against the v0.2 implementation. The v0.3 functional recovery now implements many groups listed below; see [current verification](../V0.3-STATUS.md). This audit is retained as the original gap record, not a claim that those functions remain absent or that exact Figma parity has been achieved.

Status: initial discrepancy audit. No repair is claimed complete and no UI changes were deployed during this audit.

## Authoritative reference

Use the user's corrected [MVP prototype](https://www.figma.com/proto/7vS0ax0bayEIE4QrXlBjsQ/FitBox-App?node-id=513-4807&starting-point-node-id=513%3A4807), starting at `513:4807` on page `513:4507` (MVP Version 2.0). Do not blend the old Version 1.0 onboarding and home flow into this journey.

The existing inventory covers both pages: 187 top-level frames, including 149 width-375 frames. Many are variants, overlays and intermediate states, so these counts do not represent 149 independent features or a completion percentage.

## Directly observed opening-flow discrepancy

Browser prototype navigation verified these transitions:

1. `513:4807` Welcome → Get Started → `523:6029` Select One Trainer.
2. Choose John → `788:11905`, with the radio selected and Continue enabled. Tina has a separate selected state (`788:11980` in the existing source inventory).
3. Continue → `523:5721` Select exercise activity.
4. Six selectable categories are visible: Muscle Exercise, Physical Training, Yoga, Meditation, Aerobics and Zumba. The source explicitly supports selecting multiple activity types. Clicking Muscle Exercise visibly selects its card.
5. Continue → `514:6570` Message Center. John introduces himself and asks the user to say hello, with Hello and Nah choices.

The current app instead starts with name/preference forms from the old flow, then a single-choice set of three activity types. Trainer selection and guided chat were added as separate destinations. That changes both sequence and capability; having similarly named destinations does not restore the MVP journey.

## Missing or materially simplified feature groups

Rows below distinguish source inventory and prior source review from newly observed navigation. These are discrepancy findings, not a completed audit of every state.

| Priority | Source group / examples | Current discrepancy | Required recovery |
| --- | --- | --- | --- |
| P0 | Welcome, trainer and activity selection: `513:4807`, `523:6029`, `788:11905`, `788:11980`, `523:5721` | Wrong opening sequence; three single-choice activities replace six multi-select categories | Restore the MVP sequence, source assets, selection states and persistence |
| P0 | Message Center: `514:6570`, `523:5052`, `523:5137`, `523:5225`, `523:5348`, `523:5464`; loading `523:5675` | Generic guided coach does not reproduce the complete staged conversation, branching and transition into the plan | Map each prompt, answer, skip/back path and loading transition before implementation |
| P0 | Main/home and Home Screen variants: `739:12421`, `758:11160`, `553:5643`, `572:5995`, `561:6211` and related frames | Old anatomy dashboard plus added launch buttons replaces the MVP home composition and tutorial/workout states | Restore the source hierarchy and route/state graph, including Task Center versus Check up Center |
| P1 | Task progression, completed-task overlays and premium prompts: `592:6945`, `827:25276`, `827:25175`, `820:19690` | Sequential tasks exist, but completion, prompts and subsequent-screen states are not reproduced | Connect task lifecycle to the correct source overlays and destinations |
| P1 | Body selection and comparison: `731:8302`, `747:11719` and other `747:*` variants | Text-only body choices replace illustrations and comparison variants | Restore the actual source artwork and selected/comparison states |
| P1 | Check-up/body controls: `758:11160` and related home states | Static front/back references and substituted metrics omit source body controls and status presentation | Recover controls and layouts; distinguish visual references from measurements the app actually supports |
| P1 | Level-up/rewards: `513:4620`, `572:5943`, `592:6755`, `815:19538` and related variants | Basic XP levels replace the celebration sequence, full-character progression, Sweat Points and upcoming rewards presentation | Reconstruct the reward state model and source presentation; do not label basic XP as equivalent |
| P1 | Learning/gallery: `513:4573`, `640:7036`, `640:7103`, `640:7172`; tag frames `739:14332`, `834:26423` | Written guides and basic category chips omit source search/results, tags and exercise-video states | Restore search/filter/tag navigation and the intended media-player states; identify unavailable content explicitly |
| P1 | Review: `640:7338`, `640:7541`, `834:26326`; dated video states `655:8639`, `658:8699`; overlays `834:26240`, `834:26241` | Local clip CRUD exists, but timeline/date and source overlay/filter behavior is incomplete | Map timeline, selected item, playback, menu, empty and return states |
| P1 | Insights: `513:4581`, `834:26515`, `827:25622` | A generic activity chart is not the complete source statistics/detail experience | Preserve source layout and drill-down interactions while binding supported real data |
| P1 | Message scheduling/day-two/report states: `642:7452`, `642:7556`, `642:7965`, `642:7995`, `642:9676` | Generic local responses do not implement the full staged journey, history and report-message flow | Build the local conversation/state lifecycle and explicit scheduling rules |
| P1 | Account dropdown/language/quit: `693:9376`, `708:8310`, `731:8705`, `751:11487`, `827:25781` | Generic profile settings; language route absent; source menus and exit states incomplete | Restore navigation placement, supported language behavior and source modal states |
| P1 | Subscription/payment/purchase: `795:11269`, `795:11456`, `795:11741`, `795:11921`, `795:11732`, `827:25479` | Real sandbox billing exists, but pricing and status screens are redesigned and do not reproduce the source flow | Restore in-app selection, summary, cancellation and verified-result presentation around Stripe's secure checkout |
| P2 | Bluetooth: `513:4508`, `513:4515` | Status notice replaces the source pairing experience; real device protocol is unavailable | Recover the UI states, but keep actual pairing unavailable until a real protocol/device exists |
| Deferred by user | Email/report source frames: `820:19796`, `820:19909` | Local email previews, not real delivery | Keep delivery disabled as requested until FitBox has a sender/domain; this user-approved exception does not excuse other omissions |

## Recovery acceptance criteria

- Every reachable MVP frame must map to a route, overlay or documented UI state; duplicates and working components must be identified explicitly.
- Check the initial state, trigger, destination, back/cancel behavior, validation, persistence and reload behavior for each flow.
- Verify rendered screens against the corresponding Figma screenshot and asset geometry. An implemented feature with a different layout is not a visual-parity pass.
- Preserve blue replacements for green UI accents, as requested, without replacing the product's overall visual design.
- Retain working on-device pose tracking, scalar-only cloud sync and sandbox billing while rebuilding the product flow around the MVP reference.
- Runtime/backend tests and screenshot parity are separate checks. Passing one must not be used to claim the other.

## Source access limitation

The corrected welcome node was requested again through Figma's design-context tool. It returned the Starter-plan MCP tool-call limit. Browser prototype reading still works and was used for the opening-flow observations above.

The applicable design-to-code skill requires implementation from high-fidelity design-context responses, with exact source assets and screenshot verification. Cached responses cover only part of the design. A new exact-fidelity rebuild must not silently substitute metadata, unrelated artwork or guessed screens for unavailable context. Restore detailed source access or obtain the missing design-context/assets before marking those repairs complete.
