# AI Graphic TV — render guide (for Claude, writing `scenes.json`)

Adapted for AI Graphic TV's **UI-Card Kinetic Motion Graphics** look: a high-end broadcast-documentary
take on the viral AI-tool-explainer style (glass panels, tech grid, cyan/gold accents). Two formats now
exist — read the one that matches the job's `meta.json type`:

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

## Scene types (REGISTRY)

**Primary — this channel's UI-card identity (`src/scenes/ui/`). Use these for the large majority of beats:**

- `hookcard` — the core kinetic-typography beat: a bold split headline with keyword pills
  (`pills: ["1 LINE = FULL VIDEO"]`). Use for the hook, the payoff of a trick, or any line that should
  hit hard. This is the new workhorse type (replaces `headline` as the default).
- `mockup` — a simulated app window: title bar, optional model/tool chips, a prompt box that types in,
  optional response lines. Use whenever the script describes typing something into an AI tool or seeing
  a result. **Never recreate a specific real app's exact chrome/branding** — it's deliberately generic
  (plain traffic-light dots + a plain title you write), so it reads as "an AI tool," not a trademarked UI.
- `toolgrid` — floating grid of tool badges (`tools: [{name:'Claude', glyph:'bulb'}]`). Use when naming
  3+ tools together. Badges are a generic glass tile + the tool's name as **text** + an abstract glyph —
  never a real logo. `glyph` is any name from `src/scenes/icons.jsx`, or omit it for an abstract mark.
- `comparecard` — two glass cards side by side ("Old Way" vs "AI Way", Tool A vs Tool B). Same `rows`
  shape as the old `compare` type (`[{label, a, b, unit, dec, win}]`, values number or short text).
- `statcounter` — one big number in a glass card, optional progress bar (`bar:true`). Use for pricing,
  speed, token counts, benchmark percentages.
- `stepflow` — numbered glass cards connected by a glowing line (horizontal on `long`, stacked
  automatically on `short`'s vertical canvas). Use for workflows/step-by-steps instead of `list`.

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
- **Show, then tell the "why it matters."** After a `mockup`/`stepflow` beat demonstrating a trick, add
  a short `statcounter`/`hookcard` beat on the concrete outcome (time saved, money saved).
- **Numbered structure.** Group tricks/steps and use `chapter` scenes as dividers on `long` videos.
- **End with a recap + one clear next action** on the `endcard`.
- **Pacing:** one visual beat every **3-5 seconds** of narration — tighter than before. On `short` jobs
  aim at the tight end (3-4s) throughout; on `long` jobs the 8-15s exception still applies to
  `statcounter`/`chart` beats that need a moment to land.
- **No-repeat rule:** don't use the same `visual.type` more than **twice in a row** — rotate through the
  primary family (and drop in a secondary type occasionally) so the video doesn't feel templated.
  `validate_long.py`/`validate_short.py` enforce this; don't rely on memory alone.
- **Never fabricate a statistic, benchmark, or quote.** If a number can't be verified from the research
  step, cut it or phrase it qualitatively ("noticeably faster" instead of an invented %).
- **Never use a real brand's logo, exact product chrome, or trademarked wordmark.** `toolgrid` badges
  and `mockup` windows are built generic on purpose — name tools in plain text, never try to reproduce
  their actual icon or UI pixel-for-pixel.

## Tone names (theme.js)

- `glass` — **default now.** Deep navy (`#060B14`) background, tech grid, cyan/royal-blue accent, gold
  for secondary highlights (pills, `statcounter` color: `'gold'`). All six UI-card components read this
  tone by default if `tone` is omitted.
- `dark` / `cyan` / `amber` / `paper` — the older tones, still available on the secondary scene family
  for visual variety or a deliberate mood shift (e.g. `amber` for a caveat/warning beat).

## Palette reference (`src/theme.js`)

Primary (`glass` tone): background `#060B14`, card glass `rgba(16,26,46,.55)` with 1px
`rgba(255,255,255,.08)` border + `backdrop-filter: blur(20px)`, sky-blue/cyan accent `#22D3EE`, royal
blue `#3B82F6`, gold `#F59E0B`, white text. Legacy tones keep their old hexes (see `TONES` in
`theme.js`). Display font: Anton (headlines). Sans: Inter (body/mockup text). Mono: Space Mono (chips,
labels, stats).

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
`MockupWindow`/`ToolGrid`/`StepFlow` keyed to their own entrance timing. Use `<Sfx type="..." at={frame}
volume={0..1} />` from `scenes/common.jsx` to add more.

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
