import React from 'react';
import {AbsoluteFill, Img, Audio, staticFile, useCurrentFrame, useVideoConfig, spring, Sequence} from 'remotion';
import {C, F, tone} from '../theme.js';
import {prog, ease, rnd} from '../util.js';

// full-frame background of a scene (tone decides colour); soft moving glow so flat scenes are never static
export const Bg = ({tn = 'dark', glow = true}) => {
  const t = tone(tn); const f = useCurrentFrame();
  const x = 50 + Math.sin(f / 140) * 12, y = 40 + Math.cos(f / 170) * 10;
  return (
    <AbsoluteFill style={{background: t.bg}}>
      {glow && <AbsoluteFill style={{background: `radial-gradient(ellipse 60% 55% at ${x}% ${y}%, ${tn === 'paper' ? 'rgba(255,255,255,.55)' : 'rgba(80,110,190,.20)'} 0%, rgba(0,0,0,0) 70%)`}} />}
    </AbsoluteFill>
  );
};

// small key phrase bar at the bottom-left, slides in
export const Lower = ({text, tn = 'dark', delay = 6}) => {
  const f = useCurrentFrame(); if (!text) return null;
  const k = prog(f, delay, 14); const t = tone(tn);
  return (
    <div style={{position: 'absolute', left: 90, bottom: 86, transform: `translateX(${(1 - k) * -60}px)`, opacity: k}}>
      <div style={{display: 'inline-block', background: t.accent, color: tn === 'paper' ? '#fff' : '#1a1203', fontFamily: F.display, fontSize: 40, letterSpacing: 1.5, padding: '10px 26px', textTransform: 'uppercase', boxShadow: '0 10px 30px rgba(0,0,0,.35)'}}>{text}</div>
    </div>
  );
};

// local image from the resolved asset (fetch_assets.py fills image.resolved); returns null if missing
export const resolvedSrc = (image) => (image && image.resolved && image.resolved.file ? staticFile(image.resolved.file) : null);
export const SafeImg = ({image, style}) => {
  const src = resolvedSrc(image);
  if (!src) return null;
  return <Img src={src} style={style} />;
};

// ---- motion FX shared by scenes ----
// camera shake that decays after `at` (frames). returns css transform string
export const shake = (f, at, power = 18, len = 12) => {
  const t = f - at; if (t < 0 || t > len) return 'translate(0px,0px)';
  const k = (1 - t / len) * power;
  return `translate(${Math.sin(t * 2.7) * k}px, ${Math.cos(t * 3.1) * k * 0.7}px)`;
};

// slow rotating light rays + floating dust; makes flat dark scenes feel alive
export const Rays = ({color = 'rgba(242,177,52,.10)', cx = 50, cy = 45}) => {
  const f = useCurrentFrame(); const rot = f * 0.12;
  const rays = Array.from({length: 14}, (_, i) => `${color} ${i * (360 / 14)}deg ${i * (360 / 14) + 9}deg, transparent ${i * (360 / 14) + 9}deg ${(i + 1) * (360 / 14)}deg`).join(',');
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: `${cx}%`, top: `${cy}%`, width: 3200, height: 3200, marginLeft: -1600, marginTop: -1600, background: `conic-gradient(from ${rot}deg, ${rays})`, maskImage: 'radial-gradient(circle, #000 0%, transparent 55%)', WebkitMaskImage: 'radial-gradient(circle, #000 0%, transparent 55%)'}} />
      <Dust />
    </AbsoluteFill>
  );
};

export const Dust = ({n = 40, color = 'rgba(255,255,255,.35)'}) => {
  const f = useCurrentFrame(); const {width: w, height: h} = useVideoConfig();
  return (
    <AbsoluteFill>
      {Array.from({length: n}, (_, i) => {
        const r1 = (Math.sin(i * 91.7) + 1) / 2, r2 = (Math.sin(i * 37.3) + 1) / 2, r3 = (Math.sin(i * 13.1) + 1) / 2;
        const x = (r1 * w + f * (0.3 + r3)) % (w + 40) - 20, y = (r2 * h - f * (0.4 + r3 * 0.8) + h * 2) % (h + 20) - 10;
        const s = 2 + r3 * 4;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: '50%', background: color, opacity: 0.3 + 0.5 * Math.abs(Math.sin((f + i * 20) / 30))}} />;
      })}
    </AbsoluteFill>
  );
};

// film grain + vignette over the whole film (deterministic noise seed per frame). Sized to the live
// canvas (useVideoConfig) so it fully covers both the 16:9 Doc and the 9:16 ShortDoc compositions.
export const Grain = ({opacity = 0.09}) => {
  const f = useCurrentFrame(); const {width: w, height: h} = useVideoConfig();
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'overlay', opacity}}>
      <svg width={w} height={h}><filter id={`g${f % 6}`}><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f % 6} /></filter><rect width={w} height={h} filter={`url(#g${f % 6})`} /></svg>
    </AbsoluteFill>
  );
};

// ---- UI-card kinetic look (AI Graphic TV primary identity) ----

// deterministic spring pop-in; returns 0..~1.08 scale-ish progress value (not a transform string) so callers
// can use it for scale, opacity or translate as needed. `config` passed straight to remotion's spring().
export const springPop = (frame, at, config) => {
  const {fps} = {fps: 30}; // Doc/ShortDoc are both 30fps (theme.FPS); kept local to avoid a hook-order dependency
  return spring({frame: Math.max(0, frame - at), fps, config: {damping: 14, mass: 0.6, stiffness: 140, ...config}});
};

// subtle moving tech-grid + radial glow, used instead of Bg for 'glass'-tone UI-card scenes.
// reads the live canvas size so it works on both the 16:9 Doc and the 9:16 ShortDoc compositions.
export const GridBg = ({tn = 'glass'}) => {
  const t = tone(tn); const f = useCurrentFrame(); const {width: w, height: h} = useVideoConfig();
  const x = 50 + Math.sin(f / 160) * 10, y = 45 + Math.cos(f / 190) * 8;
  const cell = Math.round(w / 24);
  return (
    <AbsoluteFill style={{background: t.bg}}>
      <AbsoluteFill style={{
        backgroundImage: `linear-gradient(${C.glassLine} 1px, transparent 1px), linear-gradient(90deg, ${C.glassLine} 1px, transparent 1px)`,
        backgroundSize: `${cell}px ${cell}px`, opacity: 0.5,
      }} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 65% 55% at ${x}% ${y}%, ${t.accent}26 0%, rgba(0,0,0,0) 70%)`}} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 120% 90% at 50% 100%, ${C.navy}cc 0%, rgba(0,0,0,0) 45%)`}} />
    </AbsoluteFill>
  );
};

// frosted glass card. pass children; w/h optional (defaults to auto via padding). radius/pad tunable.
export const GlassPanel = ({children, style, radius = 28, pad = '34px 44px', glow}) => (
  <div style={{
    position: 'relative', background: C.glassBg, border: `1px solid ${C.glassLine}`, borderRadius: radius,
    padding: pad, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
    boxShadow: glow ? `0 20px 60px rgba(0,0,0,.45), 0 0 40px ${glow}33` : '0 20px 60px rgba(0,0,0,.45)',
    ...style,
  }}>{children}</div>
);

// keyword pill / badge, e.g. "1 LINE = FULL VIDEO". color = background, dark text by default (gold/cyan are light bg).
export const Pill = ({text, color = C.skyBlue, dark = true, size = 34, style}) => (
  <span style={{
    display: 'inline-block', background: color, color: dark ? '#071018' : '#fff', fontFamily: F.display,
    fontSize: size, letterSpacing: 1, padding: `${size * 0.22}px ${size * 0.6}px`, borderRadius: size * 0.4,
    textTransform: 'uppercase', boxShadow: `0 10px 30px ${color}55`, ...style,
  }}>{text}</span>
);

// generic rounded glyph tile for a named tool/product — NEVER a real brand logo (trademark-safe by design).
// name is rendered as text; `glyph` is one of icons.jsx's names (falls back to a neutral dot).
export const ToolBadge = ({name, glyph, color = C.skyBlue, size = 150, delay = 0, frame}) => {
  const k = springPop(frame, delay, {damping: 16});
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, opacity: Math.min(1, k * 1.4), transform: `scale(${Math.min(1.08, k)}) translateY(${(1 - Math.min(1, k)) * 40}px)`}}>
      <div style={{width: size, height: size, borderRadius: size * 0.26, background: C.glassBg, border: `1px solid ${C.glassLine}`, backdropFilter: 'blur(14px)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 16px 40px rgba(0,0,0,.4), inset 0 0 0 1px ${color}22`}}>
        <GlyphDot name={glyph} color={color} size={size * 0.46} />
      </div>
      {name && <div style={{fontFamily: F.sans, fontWeight: 700, fontSize: size * 0.17, color: '#fff', textAlign: 'center', maxWidth: size * 1.3}}>{name}</div>}
    </div>
  );
};

// minimal abstract glyph (circle + mark) so ToolBadge never needs a real icon library entry per product.
const GlyphDot = ({name, color, size}) => {
  const seed = rnd(name || 'x');
  const pts = 3 + Math.floor(seed * 3); // 3-5 sided abstract mark, stable per name
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="1.6" opacity="0.5" />
      {Array.from({length: pts}, (_, i) => {
        const a = (i / pts) * Math.PI * 2 - Math.PI / 2;
        return <circle key={i} cx={12 + Math.cos(a) * 6.5} cy={12 + Math.sin(a) * 6.5} r="2.1" fill={color} />;
      })}
    </svg>
  );
};

// ---- micro-SFX (placeholder CC0-style tones synthesized locally — swap public/assets/sfx/*.mp3 for a
// licensed pack any time; the SFX/useSfx API stays the same) ----
export const SFX = {whoosh: 'assets/sfx/whoosh.mp3', pop: 'assets/sfx/pop.mp3', click: 'assets/sfx/click.mp3'};

// drop this anywhere inside a scene/Doc-level component to play a short sound at a LOCAL frame offset
// (relative to whatever Sequence this is rendered inside — same convention as beats/transitions).
// type: 'whoosh' | 'pop' | 'click'. Renders nothing visual.
export const Sfx = ({type = 'pop', at = 0, volume = 0.7}) => {
  const src = SFX[type]; if (!src) return null;
  return (
    <Sequence from={Math.max(0, Math.round(at))} durationInFrames={60} layout="none">
      <Audio src={staticFile(src)} volume={volume} />
    </Sequence>
  );
};
