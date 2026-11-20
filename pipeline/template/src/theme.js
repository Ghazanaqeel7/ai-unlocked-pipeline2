// Look of AI Graphic TV: deep navy "UI-card kinetic" look (glass panels + tech grid) is the PRIMARY identity
// (tone 'glass'); the older near-black/indigo violet/cyan tones are kept for legacy scene variety.
export const W = 1920, H = 1080, FPS = 30;
// Vertical (Shorts) canvas — same FPS, same scene registry, components read these via useVideoConfig().
export const SW = 1080, SH = 1920;
export const C = {
  ink: '#0a0a14', ink2: '#121226', slate: '#1c1c38', line: '#30304f',
  paper: '#eef0ff', paper2: '#dcdffc', violet: '#8b5cf6', cyan: '#22d3ee', amber: '#fbbf24', green: '#34d399', red: '#f0506e',
  white: '#ffffff', mute: '#9fa3c8', black: '#040409',
  // glass / UI-card palette
  navy: '#060B14', navy2: '#0b1526', glassLine: 'rgba(255,255,255,.08)', glassBg: 'rgba(16,26,46,.55)',
  skyBlue: '#22D3EE', royal: '#3B82F6', gold: '#F59E0B',
};
export const F = {
  display: 'Anton, Impact, "Arial Black", sans-serif',
  serif: '"Playfair Display", Georgia, serif',
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
  // "Warm Editorial Alabaster" — the light half of AI Graphic TV's dark<->light per-beat polarity system
  // (render_guide.md "polarity" rule): step-by-step tool walkthroughs use this instead of 'glass'.
  alabaster: {bg: '#F4F2EC', fg: '#0F172A', sub: '#5b5f6b', accent: C.royal, accent2: '#B45309', gold: C.gold, card: '#FFFFFF', line: 'rgba(10,15,25,.07)', vignette: '#F4F2EC', shadow: 'rgba(20,20,30,.12)'},
};
export const tone = (name) => TONES[name] || TONES.glass;
// per-beat dark<->light polarity switch (render_guide.md): 'light' maps to the alabaster tone, anything
// else (including omitted) stays on the channel's primary dark 'glass' tone. Components accept EITHER an
// explicit `tone` name (back-compat) OR the friendlier `polarity` prop; `tone` wins if both are given.
export const polarityTone = (polarity) => (polarity === 'light' ? 'alabaster' : 'glass');
export const resolveTone = (toneName, polarity) => toneName || polarityTone(polarity);
