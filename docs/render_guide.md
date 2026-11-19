# AI Graphic TV — render guide (for Claude, writing `scenes.json`)

This is the equivalent of Sneaky Deals' `longform_guide.md`, adapted for AI Graphic TV's single
format: 4-8 minute AI-tools/tricks explainer videos in a **kinetic typography + motion graphics**
style. Read this before writing `jobs/<id>/project/src/scenes.json` for any job.

## Engine

`pipeline/template/` is a Remotion project. `src/Doc.jsx` reads `scenes.json` (the content) and
`timing.json` (durations) and cross-fades a `Sequence` per scene using `REGISTRY` in `Doc.jsx` to
map each scene's `type` to a React component in `src/scenes/`.

## Scene types (REGISTRY)

- `title` — big opening/section title card. Use for the video's cold open and any major section break.
- `chapter` — a numbered chapter divider ("Trick #1", "Step 2").
- `headline` — one punchy animated line, the core kinetic-typography beat. Use for the hook, the
  payoff of a trick, or any line that should hit hard. This is the workhorse type for this channel.
- `list` — animated bullet/numbered list. Use for "3 ways to...", step-by-steps, feature rundowns.
- `compare` — two-column before/after or Tool A vs Tool B.
- `stat` — one big number with context (benchmarks, pricing, speed comparisons).
- `chart` / `timeline` — only if there's real data to show (benchmark charts, release timelines).
- `photo` — full-bleed image beat (tool screenshot substitute, UI mockup, abstract tech visuals).
- `quote` — a quoted line (official docs, a tweet, a reviewer) — max ~15 words, must be real and sourced.
- `map` — rarely needed for this niche; skip unless geography is actually relevant.
- `illustration` — icon-driven concept beat (use the icon registry in `src/scenes/icons.jsx`).
- `endcard` — outro: recap line + subscribe prompt + (optional) next-video tease.

## Writing principles for this niche (AI tools/tricks, broad "every type of user" audience)

- **Hook in the first 3 seconds.** Open on a `headline` or `title` scene stating the specific result
  ("This ChatGPT setting triples your output") — never a slow "hey guys welcome back."
- **One idea per scene.** Kinetic typography reads best when each beat carries a single short claim.
  Split a sentence with two ideas into two scenes.
- **Plain language first, jargon second.** The audience is broad — explain any tool name or term in
  the same breath it's introduced, as if to someone who has never opened the tool.
- **Show, then tell the "why it matters."** After a `list`/`headline` beat demonstrating a trick, add
  a short beat on the concrete outcome (time saved, money saved, quality gained).
- **Numbered structure.** Group tricks/steps and use `chapter` scenes as dividers — it reads as more
  rewatchable and scrubbable, and YouTube chapters boost retention metrics.
- **End with a recap + one clear next action** (subscribe, or "try trick #1 today") on the `endcard`.
- **Pacing:** aim for a new scene every 4-8 seconds during the hook/tricks, slower (8-15s) only for
  `stat`/`chart` beats that need a beat to land.
- **Never fabricate a statistic, benchmark, or quote.** If a number can't be verified from the
  research step, cut it or phrase it qualitatively ("noticeably faster" instead of an invented %).

## Tone names (theme.js)

- `dark` — near-black/indigo background (`C.ink`), white text, violet accent. Default tone — use for
  most scenes.
- `cyan` — deep teal-black background, cyan accent. Use for "trick/tip" beats to visually separate
  them from narrative beats.
- `amber` — warm dark background, amber accent. Use sparingly for warnings/caveats ("but watch out for...").
- `paper` — light background. Use only for screenshot-heavy beats where a light frame reads cleaner;
  don't overuse — the channel's primary identity is dark + violet/cyan.

## Palette reference (`src/theme.js`)

Background `#0a0a14`, card `#1c1c38`, violet accent `#8b5cf6`, cyan accent `#22d3ee`, amber `#fbbf24`,
green `#34d399`, red `#f0506e`, paper text on dark `#eef0ff`. Display font: Anton (big kinetic
headlines). Sans: Inter (body/list text). Mono: Space Mono (stats, code snippets, keyboard shortcuts).

## Thumbnail (`src/thumb.json` → `Thumb.jsx`)

Keep `line1`/`line2` short (2-4 words each), `box` as the punchy CTA/claim, `box_color` one of the
accent hexes above. `image.q` should describe an abstract/UI-adjacent visual (never a real app's
exact UI, to avoid trademark/screenshot issues) — e.g. "glowing neural network abstract", "futuristic
dashboard interface abstract".
