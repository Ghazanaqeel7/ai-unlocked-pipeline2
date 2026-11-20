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
  glass: {bg: C.navy, fg: C.white, sub: '#aab7cf', accent: C.skyBlue, accent2: C.royal, gold: C.gold, card: C.navy2},
  dark: {bg: C.ink, fg: C.white, sub: C.mute, accent: C.violet, card: C.slate},
  paper: {bg: C.paper, fg: '#13132a', sub: '#5a5e82', accent: C.violet, card: C.paper2},
  cyan: {bg: '#061018', fg: C.white, sub: '#9fdcec', accent: C.cyan, card: '#0d2230'},
  amber: {bg: '#1a1306', fg: C.white, sub: '#e8cf9a', accent: C.amber, card: '#2b2110'},
};
export const tone = (name) => TONES[name] || TONES.glass;
