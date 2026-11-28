// Look of AI Graphic TV, locked permanently in docs/style_reference.md ("Studio Editorial" standard):
// THREE rotating signature themes — 'sand' (Warm Cream Graph-Paper), 'studio' (Pure Crisp White),
// 'obsidian' (Matte Dark Lime) — are now the PRIMARY identity for `scenes/studio/` primitives. The
// older navy/glass "UI-card kinetic" tones (glass/dark/paper/cyan/amber/alabaster) are kept registered
// only for back-compat with already-rendered jobs — do not reach for them in new jobs.
export const W = 1920, H = 1080, FPS = 30;
// Vertical (Shorts) canvas — same FPS, same scene registry, components read these via useVideoConfig().
export const SW = 1080, SH = 1920;
export const C = {
  ink: '#0a0a14', ink2: '#121226', slate: '#1c1c38', line: '#30304f',
  paper: '#eef0ff', paper2: '#dcdffc', violet: '#8b5cf6', cyan: '#22d3ee', amber: '#fbbf24', green: '#34d399', red: '#f0506e',
  white: '#ffffff', mute: '#9fa3c8', black: '#040409',
  // glass / UI-card palette (legacy — back-compat only, see note above)
  navy: '#060B14', navy2: '#0b1526', glassLine: 'rgba(255,255,255,.08)', glassBg: 'rgba(16,26,46,.55)',
  skyBlue: '#22D3EE', royal: '#3B82F6', gold: '#F59E0B',
  // ---- Studio Editorial palette (docs/style_reference.md) — the 3 signature themes ----
  sandBg: '#F7F3EB', sandInk: '#111315', terracotta: '#D96B43', markerYellow: '#FACC15',
  studioBg: '#FFFFFF', studioBg2: '#F8FAFC', slateInk: '#0F172A', coral: '#E06D53',
  obsidianBg: '#0B0C0E', volt: '#C8F938', obsidianCyan: '#06B6D4',
};
export const F = {
  display: 'Anton, Impact, "Arial Black", sans-serif',
  serif: '"Playfair Display", Georgia, serif',
  head: '"Space Grotesk", Inter, Arial, "Liberation Sans", sans-serif',
  sans: 'Inter, Arial, "Liberation Sans", sans-serif',
  mono: '"Space Mono", "Courier New", monospace',
};
export const TONES = {
  // PRIMARY tone for AI Graphic TV's UI-card scenes (HookCard, MockupWindow, ToolGrid, ComparisonCard,
  // StatCounter, StepFlow). accent2/gold are extra channels those components read beyond the base 5 keys.
  // line/vignette let GridBg draw its grid lines + corner-darkening correctly on both dark and light tones.
  glass: {bg: C.navy, fg: C.white, sub: '#aab7cf', accent: C.skyBlue, accent2: C.royal, gold: C.gold, card: C.navy2, line: C.glassLine, vignette: C.navy},
  dark: {bg: C.ink, fg: C.white, sub: C.mute, accent: C.violet, card: C.slate, line: C.glassLine, vignette: C.ink},
  paper: {bg: C.paper, fg: '#13132a', sub: '#5a5e82', accent: C.violet, card: C.paper2, line: 'rgba(20,20,50,.07)', vignette: C.paper},
  cyan: {bg: '#061018', fg: C.white, sub: '#9fdcec', accent: C.cyan, card: '#0d2230', line: C.glassLine, vignette: '#061018'},
  amber: {bg: '#1a1306', fg: C.white, sub: '#e8cf9a', accent: C.amber, card: '#2b2110', line: C.glassLine, vignette: '#1a1306'},
  // "Warm Editorial Alabaster" (legacy, back-compat only — new jobs use 'sand'/'studio' instead).
  alabaster: {bg: '#F4F2EC', fg: '#0F172A', sub: '#5b5f6b', accent: C.royal, accent2: '#B45309', gold: C.gold, card: '#FFFFFF', line: 'rgba(10,15,25,.07)', vignette: '#F4F2EC', shadow: 'rgba(20,20,30,.12)'},

  // ==== Studio Editorial — the 3 permanent signature themes (docs/style_reference.md) ====
  // 1. Warm Cream Graph-Paper / Sand: ink-black editorial headlines, terracotta + marker-yellow
  //    highlight sweeps, white floating UI cards with a soft ambient shadow, over a subtle grid.
  sand: {
    bg: C.sandBg, fg: C.sandInk, sub: 'rgba(17,19,21,.6)', accent: C.terracotta, accent2: C.markerYellow,
    gold: C.markerYellow, card: '#FFFFFF', line: 'rgba(17,19,21,.07)', vignette: C.sandBg,
    shadow: '0 20px 50px rgba(0,0,0,.08)', pattern: 'lines', light: true, onAccent: '#FFFFFF',
  },
  // 2. Pure Crisp Studio White: ultra-clean Apple/Linear product UI, dark slate typography,
  //    terracotta/coral data curves and accents.
  studio: {
    bg: C.studioBg, fg: C.slateInk, sub: 'rgba(15,23,42,.55)', accent: C.coral, accent2: C.slateInk,
    gold: C.markerYellow, card: '#FFFFFF', line: 'rgba(15,23,42,.08)', vignette: C.studioBg2,
    shadow: '0 1px 2px rgba(15,23,42,.05), 0 8px 16px rgba(15,23,42,.06), 0 24px 48px rgba(15,23,42,.10)',
    pattern: 'none', light: true, onAccent: '#FFFFFF',
  },
  // 3. Matte Obsidian Dark: high-contrast white headlines, electric volt-lime + cyan + terracotta
  //    accents, glowing metric counters, dark-mode multi-pane dashboards. Dot-matrix texture.
  obsidian: {
    bg: C.obsidianBg, fg: '#FFFFFF', sub: 'rgba(255,255,255,.55)', accent: C.volt, accent2: C.obsidianCyan,
    gold: C.coral, card: 'rgba(255,255,255,.04)', line: 'rgba(255,255,255,.08)', vignette: C.obsidianBg,
    shadow: '0 24px 60px rgba(0,0,0,.6)', pattern: 'dots', light: false, onAccent: '#0B0C0E',
  },
};
export const tone = (name) => TONES[name] || TONES.glass;
// The 3 signature Studio Editorial themes, in their canonical rotation order (style_reference.md
// "rotate cleanly by topic"). `studioTheme(name)` resolves a `theme` prop to one of these 3, defaulting
// to 'obsidian' (the channel's default dark canvas) when omitted/unrecognized — never silently falling
// back to the legacy 'glass' navy tone.
export const STUDIO_THEMES = ['sand', 'studio', 'obsidian'];
export const studioTheme = (name) => (STUDIO_THEMES.includes(name) ? name : 'obsidian');
// Deterministic by-index rotation helper for scripts/validators that want to alternate themes
// automatically across a job's beats instead of hand-picking one per beat.
export const rotateStudioTheme = (i) => STUDIO_THEMES[i % STUDIO_THEMES.length];
// per-beat dark<->light polarity switch (render_guide.md): 'light' maps to the alabaster tone, anything
// else (including omitted) stays on the channel's primary dark 'glass' tone. Components accept EITHER an
// explicit `tone` name (back-compat) OR the friendlier `polarity` prop; `tone` wins if both are given.
export const polarityTone = (polarity) => (polarity === 'light' ? 'alabaster' : 'glass');
export const resolveTone = (toneName, polarity) => toneName || polarityTone(polarity);
