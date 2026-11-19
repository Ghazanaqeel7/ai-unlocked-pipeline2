// Look of AI Graphic TV: near-black/indigo background, electric-violet + cyan accents, kinetic typography, motion graphics.
export const W = 1920, H = 1080, FPS = 30;
export const C = {
  ink: '#0a0a14', ink2: '#121226', slate: '#1c1c38', line: '#30304f',
  paper: '#eef0ff', paper2: '#dcdffc', violet: '#8b5cf6', cyan: '#22d3ee', amber: '#fbbf24', green: '#34d399', red: '#f0506e',
  white: '#ffffff', mute: '#9fa3c8', black: '#040409',
};
export const F = {
  display: 'Anton, Impact, "Arial Black", sans-serif',
  serif: '"Playfair Display", Georgia, serif',
  sans: 'Inter, Arial, "Liberation Sans", sans-serif',
  mono: '"Space Mono", "Courier New", monospace',
};
export const TONES = {
  dark: {bg: C.ink, fg: C.white, sub: C.mute, accent: C.violet, card: C.slate},
  paper: {bg: C.paper, fg: '#13132a', sub: '#5a5e82', accent: C.violet, card: C.paper2},
  cyan: {bg: '#061018', fg: C.white, sub: '#9fdcec', accent: C.cyan, card: '#0d2230'},
  amber: {bg: '#1a1306', fg: C.white, sub: '#e8cf9a', accent: C.amber, card: '#2b2110'},
};
export const tone = (name) => TONES[name] || TONES.dark;
