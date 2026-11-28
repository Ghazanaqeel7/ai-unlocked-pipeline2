# AI Graphic TV — render guide (for Claude, writing `scenes.json`)

**Read `docs/style_reference.md` FIRST.** It is the permanently-locked visual standard — 3 signature
themes (Warm Cream Sand / Pure Studio White / Matte Obsidian Dark), the kinetic headline + bottom
floating-subtitle system, and the 6 `scenes/studio/` primitives (`tiltedagentstage`, `metricodometer`,
`retentiongraph`, `perspectivewall`, `interactiveuicard`, `commenttriggeroutro`). **`HostAvatar` (the
channel's old 2D cartoon tech-analyst mascot) has been PERMANENTLY DELETED — zero cartoon
characters/mascots in any scene, hook, or CTA, no exceptions.** Everything below this point that still
describes the old navy/"glass" UI-card family (`toolgrid`, `browsersim`, `dochighlighter`,
`workflowstepper`, `datavizcard`, `socialctacard`, `liveclipcard`, the `mockup`/`statcounter`/
`comparecard`/`stepflow` aliases, and any mention of HostAvatar) is **LEGACY, kept registered only so
already-rendered/already-approved jobs never break on a re-render** — never reach for any of it as the
default in a new job. `hookcard` is the one exception: it's still primary, just pass it
`theme: 'sand'|'studio'|'obsidian'` instead of the old `tone`/`polarity` pair.

## DEFAULT for every new job: `"autolayout": true` (locked)

Every new topic's `scenes.json` starts with `"autolayout": true` (optional `"seed": <int>` varies the layout order per topic).
`Doc` (16:9) and `ShortDoc` (9:16) then pick a content-matched layout + animated graphic per beat automatically
(`scenes/AutoLayout.jsx`, `scenes/TopicGraphics.jsx`). Write beats with the generic types (`headline`, `list`, `stat`,
`compare`, `quote`, `illustration`, `endcard`, or `auto`) and **rich structured fields instead of prose**:
`kicker`, `title` (short, punchy), `sub`, `items`/`bullets` (`[{text, sub}]`), `steps`, `workflow` (technical topics only),
`metrics` (`[{value, label}]`), `comparison` (`{before:{label,items}, after:{label,items}, metric:{value,label}}`),
`quote`/`author`, and on the last beat an `endcard` with `takeaway` + `cta`. Card counts always follow the real
`items`/`steps` length (a "5 tools" title is auto-corrected to match). The final beat renders the AI Graphic TV logo +
`@AIGraphicTV`; 16:9 also carries a subtle top-right watermark. `auto`/`autolayout` pass `validate_long.py` /
`validate_short.py`. Studio primitives and approved jobs are unchanged and can still be mixed in.

Two formats exist — read the one that matches the job's `meta.json type`:

- **`long`** — 6-10 minute deep-dive explainers.
- **`short`** — 35-55 second YouTube Shorts (9:16). Same engine, same `REGISTRY`, same `scenes.json`
  shape — components read the canvas size live, so the only real differences are pacing (faster) and
  scene choice (fewer, punchier beats; skip `chart`/`timeline`/`map`/`stepflow`-with-many-steps).

## Engine

`pipeline/template/` is a Remotion project. `src/Doc.jsx` (composition `Doc`, 1920×1080) and the same
file's `ShortDoc` export (1080×1920) both read `scenes.json` (the content) and `timing.json`
(durations), and cross-fade a `Sequence` per beat using `REGISTRY` to map each beat's `visual.type` to
a React component in `src/scenes/`. A scene can have one `visual` or an array of beats (see
`buildBeats` in `Doc.jsx`) — use the array form whenever ~3-5s of narration should show more than one
picture.

## Studio Editorial primitives (PRIMARY — `src/scenes/studio/`)

Full details, rotation rules and copy-paste JSON for all 6 in `docs/style_reference.md`. Quick reference:

- `hookcard` (`src/scenes/ui/HookCard.jsx`, theme-aware) — the kinetic-typography opening beat.
- `tiltedagentstage` — 3D-perspective multi-pane agent/dashboard workspace with camera drift (long-form
  retention beats, GitHub/AI-tool breakdowns).
- `metricodometer` — rolling-number or flip-clock counter with spring overshoot (the "big number" payoff).
- `retentiongraph` — animated SVG line/curve chart with pulsing problem callouts + good-vs-bad comparison.
- `perspectivewall` — 3D-tilted multi-card showcase wall (15-30 cards), smooth drift/zoom.
- `interactiveuicard` — one generic app-UI card animating a dropdown pick / live-typed search / ticking
  checklist (never a frozen screenshot).
- `commenttriggeroutro` — the comment-to-DM closing beat + exact unaltered `brand_logo.png` + optional
  PDF-guide preview. **Sole closing beat on a Short** — don't follow it with an `endcard`.

Every one of these takes `theme: 'sand' | 'studio' | 'obsidian'` (default `'obsidian'`) — alternate
themes roughly every 2-4 beats per `docs/style_reference.md`'s rotation rule, same spirit as the old
dark↔light polarity switch but across 3 themes instead of 2.

## Scene types (REGISTRY)

**Primary — this channel's UI-card identity (`src/scenes/ui/`). Use these for the large majority of beats.**
Every one of these accepts `polarity: "dark" | "light"` (see Dark↔Light canvas polarity below) in place
of (or alongside) the older `tone` prop — prefer `polarity` in new jobs.

- `hookcard` — the core kinetic-typography beat: a bold split headline with keyword pills, and now an
  optional fanned-out `stack` of mini-cards (a kinetic counter/stack effect) above the headline. Use for
  the hook, the payoff of a trick, or any line that should hit hard. `accent` is a list of **words from
  `text`** to render glowing (e.g. `["wasting", "hours"]`), never a color hex string — the glow color
  itself always comes from the resolved tone's accent, not a per-beat override.
- `toolgrid` — floating grid of tool badges (`tools: [{name:'Claude', role:'Chat', glyph:'bulb'}]`). Use
  when naming 3+ tools together. Badges are a generic glass/white tile (never a real logo) + the tool's
  **text** name + an optional short `role` caption (e.g. "Video gen", "Voice") + an abstract glyph —
  `glyph` is any name from `src/scenes/icons.jsx`, or omit it and each badge still gets its own distinct
  abstract mark seeded from the tool's own name, never an identical dot repeated across tiles. On the
  narrow (Shorts) canvas, tiles render at a large `260×260px` to fill the vertical hero stage (see below)
  instead of the old small floating-dot grid.
- `browsersim` — a simulated, trademark-safe interface in one of three `mode`s: `"app"` (AI tool
  chat/generator window — prompt types in, optional simulated cursor click, dropdown, upload progress),
  `"repo"` (generic GitHub-style repo card — stars, tags, file tree reveal), or `"terminal"` (generic CLI
  — lines appear with a running/ok status). Replaces the old `mockup` type (see Legacy aliases below).
  **Never recreate a specific real app's exact chrome/branding** — generic traffic-light dots + a plain
  title you write, so it reads as "an AI tool," not a trademarked UI.
- `dochighlighter` — a document/code/tweet scanner: `content` text with `highlights:[{text,color}]`
  marker-pen highlighted as a scan-line sweeps down, with an optional slam-down verdict `stamp` (e.g.
  "VERIFIED"/"FAKE"). Use for "here's the actual doc/tweet/code that proves it" beats.
  `kind: "article"|"tweet"|"code"`. (The old `compare`/`comparecard` dual-card "Old Way vs AI Way" look
  lives on as a legacy alias to `datavizcard`'s `mode:"bars"` — see below — but for a genuinely sourced
  side-by-side document, prefer `dochighlighter` with two highlight colors instead.)
- `workflowstepper` — a top row of 3-5 connected step tabs that sequentially activate (green check) while
  a single lower workspace card updates live underneath (`body.type: "checklist"|"bars"|"stack3d"`) —
  never a frozen screen. Replaces the old `stepflow` type (see Legacy aliases below). Use for
  workflows/step-by-steps instead of `list`.
- `datavizcard` — one unified numbers component, `mode: "gauge"` (single circular-arc counter),
  `"bars"` (2+ animated comparison bars), or `"matrix"` (dot-grid ratio). Replaces the old `statcounter`
  and `comparecard` types (see Legacy aliases below). **`values[].value` and `values[].max` are ALWAYS
  explicit numbers — never a bare fraction/percent** (e.g. `value:90, max:100`, not `bar:0.9`) — this is
  the schema fix for the "counter stuck at 0" bug; the validators now enforce it as a hard error.
- `socialctacard` — the comment-to-DM outro: a generic `@AIGraphicTV`-style profile card + a simulated
  comment box where `commentWord` types in and "sends," plus an optional top slide-down "Sent! Check
  your DMs" notification banner. **On a Short, this is the sole closing beat** — see "Single clean
  closing beat" below; don't follow it with an `endcard`.
- `liveclipcard` — a REAL headless-browser screen recording (`pipeline/video/record_clips.py`,
  Playwright) framed in the same glass browser-window chrome as `browsersim`, with a slow Ken Burns
  pan/zoom and a drifting spotlight glow. **Scope: public, loginless, open-source-adjacent pages only**
  — GitHub repos, HuggingFace spaces, official docs, public demo pages. `record_clips.py` checks the
  `url`'s host against an allow-list before even attempting a recording, on top of whatever scenes.json
  itself should already be scoped to; never point `url` at a site that requires sign-in. Recording has a
  strict ~12s time budget and fails silently per-clip — if the site blocks headless browsers, times out,
  or nothing records, the beat renders a generic fallback card (same trademark-safe rule as
  `browsersim`) instead of a blank frame, so a bad URL never breaks a render. Optional `actions` (a list
  of `{"type":"wait"|"scroll"|"click", ...}`) script simple interactions (dismiss-cookie-banner handling
  is automatic). `label` is a short caption shown under the window; it also doubles as the fallback
  card's headline when recording doesn't happen. `LiveClipCard.jsx` plays the recorded clip with
  Remotion's `OffthreadVideo` (never `Video`) — seeking a real `<video>` element per rendered frame was
  found to run at roughly 1/30th normal speed under this pipeline's headless/software-GL render flags,
  turning a ~1min Short into a 2h+ render; `OffthreadVideo` extracts frames via ffmpeg out-of-band
  instead and renders at the normal speed.

### High-budget SaaS-launch polish pass (Pain/Shift hooks, cinematic transitions, real icons)

**`HostAvatar` — PERMANENTLY REMOVED.** The channel's old 2D flat-vector tech-analyst mascot (and its
`HostAvatarPiP` helper) has been deleted from `src/scenes/` entirely, per `docs/style_reference.md`:
zero cartoon characters or mascots anywhere, in any scene, hook, or CTA, no exceptions. `HookCard`'s
`avatar` prop and `SocialCtaCard`'s `avatar` prop are now no-ops kept only so an older job's
`scenes.json` never fails validation — do not pass them in a new job, and never reintroduce a floating
character PiP. Use `commenttriggeroutro` (replaces the avatar-bearing `SocialCtaCard` for new jobs) and
`metricodometer`/`interactiveuicard` for a mid-video "key twist" beat instead.

Three further upgrades remain in effect (additive — every existing job's `scenes.json` keeps rendering
exactly as before):

1. **`HookCard`'s Pain/Shift hook architecture** — pass `pain` (the "old way"/FOMO line) alongside the
   existing `text` (now "the shift") to switch `HookCard` from its classic single-headline layout to the
   new split-contrast one: a red `#f0506e` alert card ("THE OLD WAY", warning-pulse glow + brief shake)
   on top, an emerald/cyan `#34d399` glowing card ("THE SHIFT") below. **Every Short/Long should open its
   first 0:00-0:03 on this**, not a flat statement — e.g.
   `{"type":"hookcard","theme":"obsidian","pain":"Developers were drowning in manual chart-watching.","text":"Claude now runs the whole desk.","accent":["Claude"]}`.
   Omit `pain` to keep the original single-card layout (still fine for a mid-video beat, just not the
   cold open anymore).
2. **Cinematic scene transitions + ambient depth (`Doc.jsx`, `common.jsx`)** — the global beat-to-beat
   cross-fade is now a combined spring slide + scale + **blur-dissolve** over an 11-frame overlap (never
   a hard cut), and an `AmbientOrbs` layer (soft, large, slowly-drifting blurred glow blobs — distinct
   from the small-speck `Dust`) now runs behind every dark-polarity beat automatically, fading off on
   light/`alabaster` beats. Neither needs any per-job wiring — both are global in `Doc.jsx`.
3. **Real icons everywhere, zero abstract dot-wheels (`common.jsx`'s `ToolGlyph`)** — `ToolBadge`/
   `toolgrid`'s glyph renderer is now backed by real `lucide-react` icons (a keyword map from `glyph`/
   `name` to a matching icon — "chart"/"trading" → `LineChart`, "shield"/"risk" → `Shield`, "terminal"/
   "code" → `Terminal`, etc.) with a small curated **non-dot** fallback set (`Sparkles`/`Boxes`/`Layers`/
   `Workflow`/etc., chosen deterministically per name) for anything unmatched. The old "3-5 dots seeded
   around a circle" placeholder is gone — a tile can never render as an empty-looking dot wheel again.

### Legacy aliases (do not use in new jobs, kept only so older jobs never break)

`mockup` → `browsersim` (mode:`"app"`), `statcounter`/`comparecard` → `datavizcard`, `stepflow` →
`workflowstepper`. Each old type string still works — a thin prop-adapting wrapper in
`src/scenes/ui/legacyAdapters.jsx` converts the old props to the new component's schema at render time
— but always write new `scenes.json` against the **new** type strings and schemas above (and the JSON
examples below), never the old ones.

**Secondary — kept for variety, chapter structure and sourced material. Use sparingly (see pacing below):**

- `title` — big opening/section title card. Still the right choice for the video's cold open.
- `chapter` — numbered chapter divider ("Trick #1").
- `quote` — a quoted line (official docs, a tweet, a reviewer) — max ~15 words, must be real and sourced.
- `endcard` — outro: recap line + subscribe prompt + (optional) next-video tease.
- `headline`, `list`, `compare`, `stat`, `illustration`, `photo`, `chart`, `timeline`, `map` — the
  original documentary-style scenes. Still fully working and still registered; use one occasionally
  for visual variety or when a beat genuinely needs something they do that the UI-card family doesn't
  (e.g. a real benchmark `chart` with axis data, a sourced `quote`). Don't lean on them as the default —
  they're off-brand for this channel now.

## Writing principles

- **Hook in the first 3 seconds** on a `hookcard` stating the specific result ("This ChatGPT setting
  triples your output") — never a slow "hey guys welcome back."
- **One idea per beat.** Split a sentence with two ideas into two beats.
- **Plain language first, jargon second.** Explain any tool name or term in the same breath it's
  introduced.
- **Show, then tell the "why it matters."** After a `browsersim`/`workflowstepper` beat demonstrating a
  trick, add a short `datavizcard`/`hookcard` beat on the concrete outcome (time saved, money saved).
- **Numbered structure.** Group tricks/steps and use `chapter` scenes as dividers on `long` videos.
- **End with a recap + one clear next action.** On `long` videos that's the `endcard`. On `short`
  videos, see "Single clean closing beat" below — `socialctacard` carries the whole outro alone.
- **Single clean closing beat (Shorts only):** a `short` job's last beat is `socialctacard` **or**
  `endcard` — never both back to back. The Comment-to-DM `socialctacard` is already a full, punchy
  closing screen (profile card + CTA + notification banner); stacking a legacy `endcard` right after it
  is a redundant second closing screen, not a cleaner one. `validate_short.py` enforces this as a hard
  error. (`long` videos are unaffected — they still close on an `endcard`, with an optional
  `socialctacard` beat earlier as a mid-video CTA if the script calls for one.)
- **Pacing — strict, per the reference-video rework:**
  - **Shorts: 14–16 fast beats at 2.0–3.2 seconds each** across the 35-55s runtime — tighter and more
    specific than a general "every few seconds" rule. `validate_short.py` warns if a job lands outside
    that beat-count or average-per-beat-duration band; treat the warning as a real signal to re-cut the
    scene list, not noise.
  - **Long-form: each beat holds 2.0–4.0 seconds.** Nothing sits frozen for 8+ seconds — if narration for
    one idea runs longer than ~4s, split it into two beats (e.g. a `browsersim` beat, then a
    `datavizcard` beat on the same idea's payoff) rather than stretching one beat's duration.
  - **Canvas fill 82–90%** — every primary component's main card/window should occupy roughly that
    fraction of the frame width/height (not a small box floating in empty space). `browsersim`'s window
    width is already set to `narrow ? '90%' : '74%'`+max-width by design; keep custom layouts in that
    range too.
  - **Vertical hero-stage fill on `short` jobs (1080×1920):** every primary component
    (`hookcard`/`browsersim`/`dochighlighter`/`workflowstepper`/`datavizcard`/`socialctacard`) fills the
    middle **~55-65% vertical stage (roughly 1050px of the 1920px canvas)** on the narrow canvas, via a
    multi-layered vertical composition (e.g. `browsersim`'s title-bar strip + a tall body area;
    `socialctacard`'s profile card + comment card stacked together) — each component sets an explicit
    `minHeight` for this on its narrow-canvas layout, so it's automatic, not something `scenes.json` has
    to request. Typography also scales up roughly **2x** on the narrow canvas vs. the old sizes (hero
    numbers, headlines, body text) to match — this is baked into each component, not a per-beat prop.
  - **Sub-beat motion every ~1 second** — nothing should be fully static for a whole beat. Rely on each
    component's own built-in staggered reveals (chip pop-ins, bar fills, typing cursors, checklist ticks,
    scan-lines) rather than one static card sitting still; if a beat genuinely has nothing left to
    animate after ~1s, it's a sign the beat is too long — shorten it. On top of each component's own
    reveals, `Doc.jsx`'s `Fade` wrapper also applies a subtle continuous zoom (`scale: 1.0 → 1.04`) across
    every beat's full on-screen duration automatically — nothing in `scenes.json` needs to ask for this,
    it's baked into the engine.
- **No-repeat rule:** don't use the same `visual.type` more than **twice in a row** (once in a row on
  `short` jobs) — rotate through the primary family (and drop in a secondary type occasionally) so the
  video doesn't feel templated. `validate_long.py`/`validate_short.py` enforce this; don't rely on
  memory alone.
- **No Repeated Scenes (hard rule, whole-video, not just back-to-back):** every beat must introduce a
  **distinct visual layout or data state** — never reuse an identical visual (same component, same
  content — e.g. the exact same candlestick chart, the exact same bento layout with the same numbers)
  back-to-back **or later in the same video**. This is stricter than the no-repeat rule above, which
  only catches the same *type* running back-to-back; a beat can pass that check and still be an
  accidental byte-for-byte duplicate of an earlier beat (how job `903`'s Beat 13 silently repeated
  Beat 5's chart). `beat_rules.py`'s `check_no_identical_beats` hashes every beat's full content and
  fails validation with a hard **ERROR** (not a warning) the moment any two beats — anywhere in the
  video — are identical. If a beat genuinely needs to revisit an earlier idea (a recap, a "remember
  this?" callback), change the data/labels/layout so it is not a literal duplicate.
- **Never fabricate a statistic, benchmark, or quote.** If a number can't be verified from the research
  step, cut it or phrase it qualitatively ("noticeably faster" instead of an invented %). For
  `datavizcard`, that also means never inventing a `max` just to make a bar look fuller — use the real
  ceiling (100 for a percentage, the real comparison total, etc).
- **Never use a real brand's logo, exact product chrome, or trademarked wordmark.** `toolgrid` badges,
  `browsersim` windows, and `socialctacard`'s avatar are all built generic on purpose — name tools/people
  in plain text or an initial-letter avatar, never try to reproduce a real icon, UI, or photo
  pixel-for-pixel.

## Dark↔Light canvas polarity

Every primary UI-card component now accepts `polarity: "dark" | "light"` (new jobs should use this
instead of the older `tone` name, though `tone` still works for back-compat). `polarity` picks a whole
tone — `"dark"` resolves to the existing `glass` tone (deep navy `#060B14`), `"light"` resolves to a new
`alabaster` tone (warm off-white `#F4F2EC` background, near-black text, same royal-blue/gold accents) —
so a video can alternate canvas polarity beat-to-beat rather than staying one flat dark tone for 8+
minutes, matching the reference videos' dark↔light rhythm. Alternate polarity roughly every 2-4 beats;
don't hold one polarity for an entire long-form chapter. Omit `polarity` (and `tone`) to default to dark.

On `polarity: "light"`, every component's cards render as **crisp editorial white**, not muddy gray: pure
white (`#FFFFFF`) elevated cards, a hairline `1px solid rgba(15,23,42,.08)` border, a soft multi-layer
drop shadow (no glow/blur meant for a dark background), dark-ink (`#0F172A`) text, and the same vibrant
cyan/royal-blue/gold accent colors as the dark tone for status pills, bars, and highlights — never a
desaturated/muddy gray box. `GlassPanel`/`ToolBadge`/`AnimatedBar`/`GaugeArc`/`MatrixDots` in
`common.jsx` all switch on the resolved tone name automatically; a component just needs to pass its
resolved tone (`tn`) through to them, it never needs its own light/dark card logic. The Top Kinetic
Captions (below) also flip to the same dark-ink `#0F172A` on a light-polarity beat instead of staying
white-on-white.

## Bottom Floating Subtitle (PERMANENTLY replaces the old Top Kinetic Captions)

`Captions.jsx` now renders a clean, centered **floating pill in the lower-third safe zone** —
PERMANENTLY replacing the old top-safe-zone blue-selection-box caption look (no more corner handles, no
more italic-serif "design tool picked this word" frame). The whole pill flips color with the beat
underneath it: a white card with bold dark text over a dark/grid (obsidian) beat, or a dark-ink pill with
crisp white text over a light (sand/studio) beat. The currently-spoken word is bold and highlighted in
that beat's own accent color (read from the beat's `theme`, or `#C8F938`/`#D96B43` as a dark/light
fallback for legacy beats). A small `@AIGraphicTV` watermark sits in the top-safe-zone at all times. This
is driven entirely by the same `timing.json → scenes[].words` data as before, plus each beat's `theme`
(or legacy `polarity`/`tone`) — nothing else in `scenes.json` changes for this; it's automatic on every job.

## Copy-paste JSON examples — the 6 Studio Editorial primitives (PRIMARY, use these in new jobs)

Every example below is a single valid `visual` beat object for `scenes.json`. All 6 (plus `hookcard`)
take `theme: 'sand'|'studio'|'obsidian'` — full prop reference in `docs/style_reference.md`.

**`hookcard`** (required: `text`):
```json
{"type": "hookcard", "theme": "obsidian", "kicker": "THE PROBLEM", "text": "You're wasting 10 hours a week on this",
 "accent": ["wasting", "hours"], "pills": ["1 LINE = FULL VIDEO"], "sub": "Here's the fix.",
 "stack": [{"label": "Tool A", "value": "Slow"}, {"label": "Tool B", "value": "Manual"}]}
```

**`tiltedagentstage`** (optional `steps`, `output`, `terminal`, `focus`):
```json
{"type": "tiltedagentstage", "theme": "obsidian", "kicker": "HOW THE AGENT RUNS", "headline": "One Agent, Three Live Panes",
 "accent": ["Agent"], "steps": [{"label": "Read task", "active": true}, {"label": "Plan steps"}, {"label": "Call tools"}],
 "output": {"title": "LIVE REASONING", "lines": ["Reading repo structure...", "Found 3 failing tests", "Writing a fix..."]},
 "terminal": {"title": "TERMINAL", "lines": [{"text": "npm test", "status": "running"}, {"text": "3 passed", "status": "ok"}]},
 "focus": ["left", "center", "right", "center"]}
```

**`metricodometer`** (required: `value`):
```json
{"type": "metricodometer", "theme": "sand", "kicker": "THIS MONTH", "label": "Views if you post daily",
 "value": 1000000, "suffix": "+", "sub": "100 posts x 10,000 views", "mode": "roll", "duration": 60}
```

**`retentiongraph`** (optional `good`, `bad`, `callouts`):
```json
{"type": "retentiongraph", "theme": "studio", "kicker": "THE FIX", "headline": "Watch Time Beats Skip Rate",
 "accent": ["Watch Time"], "good": [0.9,0.85,0.8,0.78,0.75,0.74,0.72], "bad": [0.9,0.5,0.3,0.22,0.18,0.15,0.12],
 "callouts": [{"pct": 0.28, "label": "Old hook: viewers leave by 0:02"}]}
```

**`perspectivewall`** (required: `cards` — 12-30 entries recommended):
```json
{"type": "perspectivewall", "theme": "obsidian", "kicker": "7 DAYS", "headline": "One Formula, Every Day",
 "cards": [{"label": "Day 1", "sub": "PDF -> Podcast", "glyph": "workflow"}, {"label": "Day 2", "sub": "Agent Loop", "glyph": "brain"}]}
```

**`interactiveuicard`** (required: `kind`; `dropdown`/`query`/`items` match the kind):
```json
{"type": "interactiveuicard", "theme": "studio", "kicker": "STEP 1", "headline": "Tell It Your Niche",
 "kind": "dropdown", "dropdown": {"label": "Your niche", "options": ["Fitness", "Real estate", "AI tools", "Finance"], "picked": 2}}
```
```json
{"type": "interactiveuicard", "theme": "sand", "kind": "checklist",
 "items": [{"text": "Pick a model"}, {"text": "Add your script"}, {"text": "Hit render"}]}
```

**`commenttriggeroutro`** (no required props — every value has a sane default; sole closing beat on a Short):
```json
{"type": "commenttriggeroutro", "theme": "obsidian", "handle": "@AIGraphicTV", "name": "AI Graphic TV",
 "bio": "Practical AI tool breakdowns", "commentWord": "GUIDE", "dmPreview": "Sent! Check your DMs"}
```

## Legacy UI-card JSON examples (back-compat only — do not use these types in a new job)

Every example below is a single valid `visual` beat object (or array entry) for `scenes.json`. These are
the old navy/"glass" family — kept only so an already-approved job never breaks on a re-render.

**`hookcard`** (required: `text`, legacy `polarity` prop):
```json
{"type": "hookcard", "kicker": "THE PROBLEM", "text": "You're wasting 10 hours a week on this",
 "accent": ["wasting", "hours"], "pills": ["1 LINE = FULL VIDEO"], "sub": "Here's the fix.",
 "stack": [{"label": "Tool A", "value": "Slow"}, {"label": "Tool B", "value": "Manual"}],
 "polarity": "dark"}
```

**`browsersim`** (required: `prompt` in `mode:"app"`; `title` in `mode:"repo"`; `lines` in `mode:"terminal"`):
```json
{"type": "browsersim", "mode": "app", "prompt": "Turn this script into a 60s video",
 "chips": ["Model: Fast", "Style: Kinetic"],
 "responseLines": ["Generating storyboard...", "Rendering 9:16 export..."],
 "cursor": [{"x": 50, "y": 70, "at": 30}], "polarity": "dark"}
```
```json
{"type": "browsersim", "mode": "repo", "title": "video-pipeline", "stars": "1.2k",
 "tags": ["python", "remotion"], "tree": ["render.yml", "make_guide.py", "scenes.json"],
 "polarity": "light"}
```
```json
{"type": "browsersim", "mode": "terminal",
 "lines": [{"text": "$ python3 render_chunk.sh job-01", "status": "running", "at": 0},
           {"text": "✓ rendered 24 beats", "status": "ok", "at": 40}],
 "polarity": "dark"}
```

**`dochighlighter`** (required: `kind`, `content`):
```json
{"type": "dochighlighter", "kind": "article", "content": "The report found usage grew 40% in Q3.",
 "highlights": [{"text": "grew 40% in Q3", "color": "#22D3EE"}],
 "scanLine": true, "stamp": "VERIFIED", "polarity": "light"}
```

**`workflowstepper`** (required: `steps` — 2+, each with `label`):
```json
{"type": "workflowstepper",
 "steps": [{"icon": "1", "label": "Write prompt"}, {"icon": "2", "label": "Generate"}, {"icon": "3", "label": "Export"}],
 "body": {"type": "checklist", "items": [{"text": "Pick a model"}, {"text": "Add your script"}, {"text": "Hit render"}]},
 "polarity": "dark"}
```
```json
{"type": "workflowstepper", "steps": [{"label": "Before"}, {"label": "After"}],
 "body": {"type": "bars", "items": [{"label": "Minutes spent", "value": 45, "max": 60, "color": "#F59E0B"}]},
 "polarity": "light"}
```

**`datavizcard`** (required: `values`, each entry with explicit `value` AND `max`):
```json
{"type": "datavizcard", "mode": "gauge", "label": "Time saved", "sub": "per video",
 "values": [{"name": "minutes", "value": 42, "max": 60, "color": "#22D3EE"}], "polarity": "dark"}
```
```json
{"type": "datavizcard", "mode": "bars", "label": "Old Way vs AI Way",
 "values": [{"name": "Manual · minutes", "value": 45, "max": 60, "color": "#64748b"},
            {"name": "AI Way · minutes", "value": 4, "max": 60, "color": "#22D3EE"}],
 "polarity": "light"}
```
```json
{"type": "datavizcard", "mode": "matrix", "label": "Accuracy", "sub": "9 of 10 correct",
 "values": [{"name": "correct", "value": 9, "max": 10, "color": "#22D3EE"}], "polarity": "dark"}
```

**`socialctacard`** (no required props — every value has a sane default):
```json
{"type": "socialctacard", "handle": "@AIGraphicTV", "name": "AI Graphic TV",
 "bio": "Practical AI tool breakdowns", "commentWord": "GUIDE",
 "dmPreview": "Sent! Check your DMs", "polarity": "dark"}
```

**`liveclipcard`** (required: `url`):
```json
{"type": "liveclipcard", "url": "https://github.com/some-org/some-repo",
 "label": "github.com/some-org/some-repo",
 "actions": [{"type": "wait", "ms": 600}, {"type": "scroll", "dy": 500}],
 "polarity": "light"}
```

## Bespoke per-job scenes are now the DEFAULT for new jobs (not an exception)

**Why:** job `902-hybrid-engine-short` proved the engine (real screen recording + custom scenes work),
but it also surfaced a content problem, not a rendering one: the generic `REGISTRY` templates
(`browsersim`, `toolgrid`, `hookcard`) are rigid JSON-driven boxes. Fed a topic they weren't shaped for,
they render oversized empty white space (a `browsersim` window with nothing inside it, a `toolgrid` with
few tiles rattling around a huge frame), fall back to a generic 5-dot abstract glyph for every tool
because `toolgrid`'s `glyph` has no real icon behind it, and — because the shared templates don't know
the video's actual subject — a script can drift into describing the pipeline/repo itself (meta content)
instead of the viral AI-tool topic the video is supposed to be about. None of that is a bug in the
components; it's what happens when a one-size-fits-all card is asked to carry a specific, dense idea.

**The fix:** for every new `type:short`/`type:long` job, write **bespoke per-job React components** in
that job's own `project/src/custom_scenes/` (see the mechanism below — this isn't new plumbing, `902`
already used it for one scene) for the bulk of the video's primary beats, instead of reaching for
`browsersim`/`toolgrid`/`hookcard` as the default. A bespoke scene is written for the beat's actual
content — the real icon set via `lucide-react` (never an abstract glyph placeholder), a dense multi-card
bento layout instead of one card floating in a big empty frame, a real metric/line/candlestick chart via
simple inline SVG, an animated code/prompt diff — so every frame is full and specific to that beat, never
a rigid box with blank space in it.

- **Full-bleed dark canvas by default:** `#060B14` (the `glass` tone background, same hex as today —
  reuse `GridBg`/the `tone('glass')` palette from `common.jsx`/`theme.js`, don't invent a new background
  color) with **zero empty white boxes** — every custom scene's content should fill the canvas-fill
  target already set out above (82-90% long-form / the ~55-65% vertical hero-stage band on Shorts), the
  same rule the primary `REGISTRY` components follow, just satisfied by bespoke layout instead of a
  generic card.
- **Real icons, not placeholder glyphs:** pull the actual `lucide-react` icon that matches the beat's
  real-world object (a chart icon for a metrics beat, a terminal icon for a CLI beat, a brain/sparkle icon
  for an AI-model beat) — never the abstract seeded-dot glyph `ToolBadge`/`toolgrid` falls back to when a
  job has no real icon for something. `902-hybrid-engine-short/project/src/custom_scenes/HybridBadge.jsx`
  is the worked example (three `lucide-react` icons in a row) — keep using that pattern, just apply it to
  most of a job's beats, not one.
- **Dense layouts, never one card in a big empty frame:** multi-card bento grids, stacked metric panels,
  inline SVG line/candlestick charts, animated diff/code blocks — build the specific picture the beat
  needs rather than fitting the beat into whichever generic card type is closest.
- **Stay on-topic — never describe this repo/pipeline itself** as the video's subject matter (that was a
  symptom of the generic templates having nothing specific to say): every beat's content must be about the
  real AI tool/trick the script is teaching, sourced and fact-checked per `PIPELINE.md`, not about how the
  video itself was produced.
- **Legacy templates stay registered, kept only for back-compat and genuine variety:** `hookcard`,
  `toolgrid`, `browsersim`, `dochighlighter`, `workflowstepper`, `datavizcard`, `socialctacard`,
  `liveclipcard` and the secondary family are all still fully working — older jobs that already use them
  keep rendering exactly as before, and a new job may still drop in one of them occasionally for the
  closing `socialctacard` beat (every Short still needs this one), a `liveclipcard` real-recording beat, or
  deliberate rhythm/variety — just don't reach for them as the first/default choice for a new job's
  primary content beats anymore.

## Custom per-job scenes (`src/custom_scenes/` mechanism)

For a one-off, job-specific visual, a job writes its own bespoke React component into its own
`project/src/custom_scenes/` folder and registers it there instead of in `Doc.jsx`:

```jsx
// jobs/<id>/project/src/custom_scenes/MyBespokeScene.jsx
export const MyBespokeScene = (props) => { /* ...like any other scene component... */ };
```
```js
// jobs/<id>/project/src/custom_scenes/index.js
import {MyBespokeScene} from './MyBespokeScene.jsx';
export default {mybespokescene: MyBespokeScene};
```

`scenes.json` then uses `{"type": "mybespokescene", ...}` like any other beat. `Doc.jsx` merges this
per-job map on top of the shared `REGISTRY` (a custom type can even override a shared one for that job
only). `render.yml`'s "refresh engine" step excludes `src/custom_scenes/` from the template sync, so a
job's bespoke scene survives every later re-render untouched — this is the one folder under `project/`
that isn't overwritten with the latest template code. Every job's `custom_scenes/index.js` must always
exist and default-export an object (an empty `{}` if the job has no bespoke scene); `render.yml`
guarantees this automatically for any job that doesn't already have one. Reuse the shared primitives in
`src/scenes/common.jsx` (`GridBg`, `GlassPanel`, `springPop`, etc.) rather than re-implementing the
channel's dark/light-polarity card look from scratch.

## Tone names (theme.js)

**PRIMARY — the 3 Studio Editorial themes (`theme` prop, every `scenes/studio/` primitive + `hookcard`):**

- `sand` — Warm Cream Graph-Paper (`#F7F3EB`, subtle grid lines). Ink-black (`#111315`) headlines,
  terracotta (`#D96B43`) + marker-yellow (`#FACC15`) highlight sweeps, white floating cards (20px radius,
  soft ambient shadow).
- `studio` — Pure Crisp Studio White (`#FFFFFF`/`#F8FAFC`). Dark-slate (`#0F172A`) typography, coral/
  terracotta (`#E06D53`) data curves and accents, flat — no grid texture.
- `obsidian` — Matte Obsidian Dark (`#0B0C0E`, dot-matrix texture). White headlines, electric volt-lime
  (`#C8F938`) + cyan (`#06B6D4`) + terracotta accents, glowing metric counters. **Default** when `theme`
  is omitted.

Rotate themes roughly every 2-4 beats (`docs/style_reference.md`) so a video doesn't sit on one canvas
look for its whole runtime.

**LEGACY (back-compat only, via `tone`/`polarity`):** `glass` (old default, deep navy), `alabaster` (old
light tone), `dark`/`cyan`/`amber`/`paper` (older secondary-family tones). Never pick these in a new job.

## Palette reference (`src/theme.js`)

**Studio Editorial (primary):** sand `#F7F3EB`/ink `#111315`/terracotta `#D96B43`/marker-yellow
`#FACC15`; studio `#FFFFFF`/`#F8FAFC`/slate-ink `#0F172A`/coral `#E06D53`; obsidian `#0B0C0E`/volt-lime
`#C8F938`/cyan `#06B6D4`. Display font: Anton (headlines). Sans: Inter (body/UI text). Mono: Space Mono
(chips, labels, stats, terminal panes).

Legacy (`glass` tone, back-compat only): background `#060B14`, card glass `rgba(16,26,46,.55)` with 1px
`rgba(255,255,255,.08)` border + `backdrop-filter: blur(20px)`, sky-blue/cyan accent `#22D3EE`, royal
blue `#3B82F6`, gold `#F59E0B`, white text. Other legacy tones keep their old hexes (see `TONES` in
`theme.js`).

## Thumbnail (`src/thumb.json` → `Thumb.jsx`)

Keep `line1`/`line2` short (2-4 words each), `box` as the punchy CTA/claim, `box_color` one of the
accent hexes above (gold `#F59E0B` reads well as a CTA color against the navy background). `image.q`
should describe an abstract/UI-adjacent visual (never a real app's exact UI or a real logo) — e.g.
"glowing neural network abstract", "futuristic glass dashboard interface abstract".

## Captions & micro-SFX

`make_voice_long.py` writes a fast, lightweight word-level caption split alongside the usual per-scene
timing — no ASR/alignment model: each scene's known speech duration is divided across its words
proportional to character length (`split_words()`), written as `timing.json → scenes[].words:
[{w,start,end}]` on the same global clock as the scene's own `start`/`end`. `src/scenes/ui/Captions.jsx`
flattens all scenes' `words` into one list and renders the active word highlighted (gold, bold) inside a
glass pill in the lower third, word-by-word, auto-sizing/positioning for both `Doc` and `ShortDoc`. It's
wired into `Doc.jsx` as a full-timeline overlay (not a per-beat scene type) and degrades safely — a job
whose `timing.json` predates this (no `words` field) still renders, just without captions. If word-
boundary accuracy ever needs to beat this simple proportional split, swap `split_words()` for
`faster-whisper` forced alignment later; nothing else in the caption pipeline needs to change.

Short UI "whoosh"/"pop"/"click" SFX (`public/assets/sfx/*.mp3`, currently CC0-style placeholders
synthesized with ffmpeg — swap for real licensed SFX whenever convenient) play automatically: a
`whoosh` on every scene-transition cross-fade (`Doc.jsx`), and context `pop`/`click` cues inside
`BrowserSim`/`ToolGrid`/`WorkflowStepper` keyed to their own entrance timing. Use `<Sfx type="..."
at={frame} volume={0..1} />` from `scenes/common.jsx` to add more.

## Creating a job (`pipeline/video/new_job.sh`)

`new_job.sh <id> [long|short]` (type defaults to `long`) scaffolds `jobs/<id>/` and seeds `meta.json`
with `{"type": "long"|"short"}` — fill in the rest of `meta.json` (`title`/`description`/`tags`/etc.)
per `PIPELINE.md`. The render workflow reads `meta.json.type` to pick the Remotion composition (`Doc`
vs `ShortDoc`) and the matching validator (`validate_long.py` vs `validate_short.py`) automatically —
nothing else about writing `scenes.json` changes between formats besides pacing and scene choice (see
the top of this guide).

## Companion guide (`project/src/guide.json` schema)

Every job (`long` and `short` alike) should also get a `project/src/guide.json` written in the **same
pass** that writes `scenes.json` — a lightweight/free LLM (Gemini Flash, Groq Llama-3.3-70B, etc.) can
produce both from one structured prompt using this doc alone, with zero extra Claude usage. After
render, `pipeline/video/make_guide.py` turns it (pure templating, **no LLM call**) into
`project/out/guide.md`, `guide.pdf` (styled A4, AI Graphic TV navy/cyan/gold banner + `@AIGraphicTV`
footer), and `social_copy.txt` (YouTube description, IG/FB Reel caption with a Comment-to-DM CTA, and a
pinned-comment template) — all shipped as release assets alongside the video. Missing `guide.json` is a
**warning**, not an error (`validate_long.py`/`validate_short.py`), and `make_guide.py` no-ops cleanly
if it's absent, so this never blocks a render.

Schema (every field optional except `title`; omit a key entirely rather than sending an empty array/
string you don't have content for):

```json
{
  "title": "3 AI Tools That Build Your Video in 1 Line",
  "tldr": [
    "First-line summary of the core result.",
    "Second-line summary — what the viewer walks away able to do."
  ],
  "tools": [
    {"name": "Runway", "link": "[TOOL_LINK]", "note": "short note on what it's used for"}
  ],
  "steps": [
    {"title": "Short imperative step title", "detail": "One sentence of extra detail, or omit"}
  ],
  "snippets": [
    {"label": "What this snippet is", "lang": "text|json|bash|python|...", "code": "the literal copy-paste text"}
  ],
  "tips": ["A pro tip, phrased as one short sentence"],
  "mistakes": ["A common mistake to avoid, phrased as one short sentence"],
  "cta": {
    "comment_word": "GUIDE",
    "affiliate_link": "[AFFILIATE_LINK]"
  }
}
```

Notes for whichever LLM is writing this:
- `tldr` — exactly **two** lines; only the first two are used even if more are given.
- `tools`/`steps`/`snippets`/`tips`/`mistakes` — any length; `tools[].link` and `cta.affiliate_link`
  should stay as the literal placeholder text (`[TOOL_LINK]`, `[AFFILIATE_LINK]`) unless a real
  affiliate/referral link has actually been supplied elsewhere in the job — never invent a URL.
  `[AFFILIATE_LINK]`/`[TOOL_LINK]` are filled in by hand (or a later automation pass) before
  publishing; `make_guide.py` passes them through as-is.
- `cta.comment_word` — a single short, shoutable word/phrase for the Comment-to-DM automation (defaults
  to `"GUIDE"` if omitted).
- Keep `steps[].title` imperative and short (checklist-style) — `make_guide.py` renders each as a
  `- [ ]` Markdown checkbox / PDF checkbox glyph.
- `snippets[].code` should be the exact literal text a viewer copy-pastes (a prompt, a CLI command, a
  config block) — don't wrap it in extra quoting or escape it; write it as it should appear on the
  page.
