# AI Graphic TV — Studio Editorial style reference (PERMANENT, locked 2026-11-26)

This is the permanent visual, pacing, typography and motion standard for **AI Graphic TV**
(@AIGraphicTV) across both **9:16 Shorts** and **16:9 Long-form** video. It supersedes the old
"UI-Card Kinetic Motion Graphics" navy/glass identity described in `docs/render_guide.md`'s legacy
sections. Read this file before writing any new job's `scenes.json`.

Locked from: the owner's 4 reference clips (Apple/Notion-grade editorial motion graphics matching
`@turbantechguy` / `@jayantcreates.ai`), the channel's brand logo, and the long-form competitor
benchmark `@crackshash_mod` (e.g. "Decepticon — Autonomous Agent").

## 1. Zero mascots, ever

**`HostAvatar` — the channel's old 2D cartoon tech-analyst character — has been permanently deleted**
from `pipeline/template/src/scenes/ui/HostAvatar.jsx` and every place that referenced it
(`HookCard`'s pain/shift layout, `SocialCtaCard`, `common.jsx`'s `HostAvatarPiP` helper). There is
**zero tolerance for cartoon characters or mascots** in any scene, hook, or CTA, in any future job. The
old empty dark boxes and blue-selection-box caption look are retired too (see §4).

If a bespoke `custom_scenes/` component for an older job still imports a character, delete that import
when the job is next touched; don't carry it into a new job.

## 2. The 3 signature editorial themes

Every beat picks one of 3 themes via a `theme` prop (`'sand' | 'studio' | 'obsidian'`, default
`'obsidian'`). Rotate cleanly by topic — alternate roughly every 2-4 beats so a video doesn't sit on one
canvas look for its whole runtime, the same spirit as the old dark↔light polarity switch but across 3
themes instead of 2. Defined in `pipeline/template/src/theme.js`'s `TONES.sand` / `.studio` / `.obsidian`.

| | Warm Cream Graph-Paper (`sand`) | Pure Crisp Studio White (`studio`) | Matte Obsidian Dark (`obsidian`) |
|---|---|---|---|
| Background | `#F7F3EB` + subtle grid lines | `#FFFFFF` / `#F8FAFC`, flat | `#0B0C0E` + dot-matrix texture |
| Headline/text | Ink-black `#111315` | Dark slate `#0F172A` | White, high contrast |
| Accent | Terracotta-orange `#D96B43` | Terracotta/coral `#E06D53` | Electric volt-lime `#C8F938` |
| Accent 2 | Marker-yellow `#FACC15` | — | Cyan `#06B6D4` |
| Cards | White floating UI cards, `border-radius: 20px`, soft ambient shadow `0 20px 50px rgba(0,0,0,.08)` | Ultra-clean Apple/Linear product UI cards, perspective reel/app grids | Glowing metric counters, sleek dark-mode multi-pane dashboards |
| Feel | Editorial headline sweeps | Crisp product/app walkthroughs | High-contrast data/agent dashboards |

Implementation: `tone('sand'|'studio'|'obsidian')` in `theme.js` returns `{bg, fg, sub, accent, accent2,
card, line, shadow, pattern, light, onAccent}`. `StudioBg`/`GridBg` (in `scenes/common.jsx`) read
`pattern` ('lines' for sand, 'dots' for obsidian, 'none' for studio) to draw the right texture
automatically — a primitive never hardcodes its own grid style. `StudioCard` picks the white-elevated-card
vs. dark-glass-glow treatment from the tone's own `light`/`shadow` fields.

## 3. Kinetic headline + bottom floating-subtitle system

**Top Stage** — the opening/section headline (`StudioHeadline` in `scenes/studio/StudioHeadline.jsx`,
used by `hookcard` and every `scenes/studio/` primitive's optional `headline`): a massive, tight-tracked
editorial headline (Anton/display font, ExtraBold weight) where the power phrase (`accent: [...]`) sits
inside an animated solid highlight block that wipes in behind the words (the theme's own accent color),
instead of plain glow text.

**Bottom Stage** — `scenes/ui/Captions.jsx` now renders a clean, centered **floating subtitle pill** in
the lower-third safe zone (PERMANENTLY replaces the old top-of-frame blue-selection-box caption). The
whole pill flips color with the beat underneath it:
- **White card with bold dark text** over a dark/grid (obsidian) beat.
- **Dark-ink pill with crisp white text** over a light (sand/studio) beat.

The active word is bold and highlighted in the current beat's own accent color — never a blue bounding
box or corner handles. A small `@AIGraphicTV` watermark stays in the top-safe-zone at all times. Driven
by the same `timing.json → scenes[].words` data as before, plus each beat's `theme` (or legacy
`polarity`/`tone` for old jobs) — nothing else about `scenes.json`'s shape changes.

## 4. High-retention motion primitives (`pipeline/template/src/scenes/studio/`)

Six reusable components, all theme-aware (`theme` prop), all registered in `Doc.jsx`'s `REGISTRY`:

1. **`TiltedAgentStage`** (from `@crackshash_mod`) — a 3D-perspective floating multi-pane workspace: left
   agent/step sidebar + center live-reasoning/output card + right live-terminal/code stream, with a
   smooth automated camera zoom-in/pan drifting between panes every 2-3 seconds. Essential for 16:9
   long-form retention and GitHub/AI-tool breakdowns. Props: `steps`, `output`, `terminal`, `focus`
   (camera drift order).
2. **`MetricOdometer`** — fast rolling-number counter (`0 -> 1,000,000`) or flip-clock digit mode, with a
   spring overshoot landing on the final value. Props: `value`, `prefix`/`suffix`, `mode: 'roll'|'flip'`.
3. **`RetentionGraph`** — animated SVG line/curve chart with pulsing problem callouts ("people stop
   here", "fix the hook here") and a green-vs-red good/bad comparison curve. Props: `good`, `bad`,
   `callouts: [{pct,label}]`.
4. **`PerspectiveWall`** — a 3D-tilted multi-card showcase wall (15-30 cards) zooming/panning smoothly.
   Props: `cards: [{label,sub,glyph,color}]`.
5. **`InteractiveUiCard`** — one generic (trademark-safe) app-UI card animating a dropdown pick, a
   live-typed search query, or a checklist ticking green one item at a time — never a frozen screenshot.
   Props: `kind: 'dropdown'|'typing'|'checklist'`, plus `dropdown`/`query`/`items`.
6. **`CommentTriggerOutro`** — the comment-to-DM closing beat: typing animation in a social comment bar,
   the exact unaltered `brand_logo.png` (`object-fit: contain`, zero color distortion), an optional top
   "Sent! Check your DMs" banner, and an optional free-PDF-guide preview card. **Zero avatar.** Sole
   closing beat on a Short — never follow it with an `endcard`.

Full JSON examples for every one of these: `docs/render_guide.md` → "Copy-paste JSON examples — the 6
Studio Editorial primitives".

## 5. Pacing: tight 1.5s-2.5s beats, zero repetition

Every beat introduces a new visual state — a smooth spring scale/slide/camera-zoom over 10-12 frames,
never a static hold. The engine's existing rules still apply on top of this: the global 11-frame
spring-slide + scale + blur-dissolve cross-fade between beats (`Doc.jsx`'s `Fade`), the subtle
continuous 1.0→1.04 zoom across a beat's full on-screen duration, and the **no-repeat** /
**no-identical-beats** rules (never the same component type back-to-back on a Short, never a literal
duplicate beat anywhere in the video).

## 6. Global audience & dual format

Target audience: **US, UK, Pakistan, and India**, in crisp, authoritative **global English**. Hooks are
engineered around high-leverage AI tools, open-source agents, automation workflows, SaaS/creator growth,
and real, sourced numbers that stop scrolling in the first 1.5 seconds. Apply this exact studio
motion-graphics standard to both **9:16 Shorts (40-55s)** and **16:9 Long-form (6-10 min)**, plus the
companion `guide.pdf`, the Central PDF Vault, Slack + Dashboard approval gates, the multi-platform
auto-scheduler (YouTube + IG + FB), and the follow-gated Comment-to-DM responder — see `PIPELINE.md`'s
"Not yet built" list for the automation pieces that still need secrets/credentials before they can ship.

**Competitor watchlist** (`research/config.json`): `@crackshash_mod` added alongside the existing list
(`@princegupta.ai`, `@engineeringwithmohit`, `@automationmentor2`, `@qodemaker`, `@aiseekhoai2026`,
`@theromanknox`, plus `@turbantechguy`/`@jayantcreates.ai` for the sand/studio/obsidian theme benchmark)
so the research bot also pulls trending open-source AI agents and developer/automation tools.

## 7. What changed, file by file

- `pipeline/template/src/theme.js` — added `sand`/`studio`/`obsidian` tones + `STUDIO_THEMES`/
  `studioTheme()`/`rotateStudioTheme()` helpers.
- `pipeline/template/src/scenes/common.jsx` — added `StudioBg`, `StudioCard`, `HighlightSweep`;
  `GridBg` now reads a tone's `pattern` field; removed `HostAvatar` import and the `HostAvatarPiP` helper.
- `pipeline/template/src/scenes/ui/HostAvatar.jsx` — **deleted.**
- `pipeline/template/src/scenes/ui/HookCard.jsx`, `SocialCtaCard.jsx` — avatar rendering removed
  (`avatar` prop kept as a no-op for back-compat); `HookCard` now accepts `theme`.
- `pipeline/template/src/scenes/ui/Captions.jsx` — rebuilt as the bottom floating-subtitle pill (§3).
- `pipeline/template/src/scenes/studio/` — new folder, the 6 primitives in §4.
- `pipeline/template/src/Doc.jsx` — registers the 6 new primitives; `resolvePolarity` now also resolves
  a beat's `theme` for the Captions pill's color + accent.
- `pipeline/template/public/brand_logo.png` — re-saved from the owner's attached logo (pixel-identical;
  no distortion).
- `research/config.json` — `@crackshash_mod`, `@turbantechguy`, `@jayantcreates.ai` added to
  `competitors`.
- `docs/render_guide.md` — updated to point here first and mark the old navy/glass UI-card family as
  legacy/back-compat only.

Every change above is **additive to the engine, destructive only to HostAvatar**: an already-rendered or
already-approved job (e.g. `001-launch-ai-workflow-short`) is untouched and keeps rendering exactly as
it did before, because the legacy component types stay registered in `Doc.jsx`'s `REGISTRY`. Only NEW
jobs should use the Studio Editorial primitives above.
