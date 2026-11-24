import React from 'react';
import {AbsoluteFill, Img, Audio, staticFile, useCurrentFrame, useVideoConfig, spring, Sequence} from 'remotion';
import {
  Bolt, Shield, Terminal, Cpu, Database, Globe, Rocket, Sparkles, Layers, Workflow,
  Puzzle, Boxes, Wrench, Brain, LineChart, MessageSquare, Camera, Mic, Code2, Palette,
} from 'lucide-react';
import {C, F, tone} from '../theme.js';
import {prog, ease, rnd, lerp} from '../util.js';
import {HostAvatar} from './ui/HostAvatar.jsx';

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
  const line = t.line || C.glassLine;
  const vignette = t.vignette || t.bg;
  return (
    <AbsoluteFill style={{background: t.bg}}>
      <AbsoluteFill style={{
        backgroundImage: `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px)`,
        backgroundSize: `${cell}px ${cell}px`, opacity: 0.5,
      }} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 65% 55% at ${x}% ${y}%, ${t.accent}26 0%, rgba(0,0,0,0) 70%)`}} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 120% 90% at 50% 100%, ${vignette}cc 0%, rgba(0,0,0,0) 45%)`}} />
    </AbsoluteFill>
  );
};

// frosted glass card (dark polarity) OR crisp white editorial card (light/'alabaster' polarity) — pass
// `tn` (the resolved tone NAME, e.g. 'glass'|'alabaster') so the card picks the right treatment: on
// 'alabaster' this is a pure #FFFFFF elevated card with a hairline border and a soft multi-layer drop
// shadow + dark ink text context, never the muddy semi-transparent navy-tinted glass meant for dark
// backgrounds. w/h optional (defaults to auto via padding). radius/pad tunable.
export const GlassPanel = ({children, style, radius = 28, pad = '34px 44px', glow, tn}) => {
  const light = tn === 'alabaster';
  const bg = light ? '#FFFFFF' : C.glassBg;
  const border = light ? '1px solid rgba(15,23,42,.08)' : `1px solid ${C.glassLine}`;
  const boxShadow = light
    ? `0 1px 2px rgba(15,23,42,.05), 0 8px 16px rgba(15,23,42,.06), 0 24px 48px rgba(15,23,42,.10)${glow ? `, 0 0 36px ${glow}26` : ''}`
    : (glow ? `0 20px 60px rgba(0,0,0,.45), 0 0 40px ${glow}33` : '0 20px 60px rgba(0,0,0,.45)');
  return (
    <div style={{
      position: 'relative', background: bg, border, borderRadius: radius,
      padding: pad, backdropFilter: light ? 'none' : 'blur(20px)', WebkitBackdropFilter: light ? 'none' : 'blur(20px)',
      boxShadow, ...style,
    }}>{children}</div>
  );
};

// keyword pill / badge, e.g. "1 LINE = FULL VIDEO". color = background, dark text by default (gold/cyan are light bg).
export const Pill = ({text, color = C.skyBlue, dark = true, size = 34, style}) => (
  <span style={{
    display: 'inline-block', background: color, color: dark ? '#071018' : '#fff', fontFamily: F.display,
    fontSize: size, letterSpacing: 1, padding: `${size * 0.22}px ${size * 0.6}px`, borderRadius: size * 0.4,
    textTransform: 'uppercase', boxShadow: `0 10px 30px ${color}55`, ...style,
  }}>{text}</span>
);

// generic rounded glyph tile for a named tool/product — NEVER a real brand logo (trademark-safe by design).
// name is rendered as text; `glyph` is one of icons.jsx's names (falls back to a neutral dot, seeded
// per-name so each tile's abstract mark is visually distinct). Optional `role` renders a small caption
// line under the name (e.g. "Video gen", "Voice"). `tn` (resolved tone name) switches the tile itself
// between the dark-glass treatment and a crisp white editorial card, same rule as GlassPanel.
export const ToolBadge = ({name, role, glyph, color = C.skyBlue, size = 150, delay = 0, frame, tn}) => {
  const k = springPop(frame, delay, {damping: 16});
  const light = tn === 'alabaster';
  const bg = light ? '#FFFFFF' : C.glassBg;
  const border = light ? '1px solid rgba(15,23,42,.08)' : `1px solid ${C.glassLine}`;
  const shadow = light
    ? `0 2px 6px rgba(15,23,42,.06), 0 16px 34px rgba(15,23,42,.10), inset 0 0 0 1px ${color}14`
    : `0 16px 40px rgba(0,0,0,.4), inset 0 0 0 1px ${color}22`;
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, opacity: Math.min(1, k * 1.4), transform: `scale(${Math.min(1.08, k)}) translateY(${(1 - Math.min(1, k)) * 40}px)`}}>
      <div style={{width: size, height: size, borderRadius: size * 0.22, background: bg, border, backdropFilter: light ? 'none' : 'blur(14px)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: shadow}}>
        <ToolGlyph name={glyph || name} color={color} size={size * 0.46} />
      </div>
      {name && <div style={{fontFamily: F.sans, fontWeight: 700, fontSize: size * 0.17, color: light ? '#0F172A' : '#fff', textAlign: 'center', maxWidth: size * 1.3}}>{name}</div>}
      {role && <div style={{fontFamily: F.sans, fontWeight: 600, fontSize: size * 0.11, color: light ? 'rgba(15,23,42,.55)' : 'rgba(255,255,255,.5)', textAlign: 'center', maxWidth: size * 1.3, textTransform: 'uppercase', letterSpacing: 0.5}}>{role}</div>}
    </div>
  );
};

// Real lucide-react icon for a named tool/product — trademark-safe (no brand logo, just a generic tech
// glyph) AND never the old abstract "N dots around a circle" placeholder, which read as a broken/empty
// icon on dense topics (render_guide.md "permanently eliminate the 5-dot wheel"). `name` is matched by
// keyword against a curated semantic map (chart/trading, shield/security, terminal/code, brain/AI, etc.);
// unmatched names fall back to one of a small set of distinct, legible generic-tech icons chosen
// deterministically (by name hash) from ICON_FALLBACKS — never dots, never the same icon for every tile.
const ICON_MAP = [
  [/bolt|fast|speed|robinhood/i, Bolt], [/shield|secur|risk|guard/i, Shield],
  [/terminal|code|cli|claude code/i, Terminal], [/chip|cpu|compute|processor/i, Cpu],
  [/data|database|storage/i, Database], [/web|globe|browser|internet/i, Globe],
  [/rocket|launch|ship|deploy/i, Rocket], [/spark|ai|magic|generat/i, Sparkles],
  [/layer|stack/i, Layers], [/flow|workflow|pipeline|loop/i, Workflow],
  [/puzzle|plugin|integrat/i, Puzzle], [/box|package|module/i, Boxes],
  [/tool|wrench|config|settings/i, Wrench], [/brain|think|model|llm/i, Brain],
  [/chart|trading|market|invest|stat/i, LineChart], [/chat|message|comment|dm/i, MessageSquare],
  [/camera|record|video|screen/i, Camera], [/mic|voice|audio|sound/i, Mic],
  [/dev|engineer|build/i, Code2], [/design|palette|brand|ui/i, Palette],
];
const ICON_FALLBACKS = [Sparkles, Boxes, Layers, Workflow, Puzzle, Cpu, Globe, Rocket];
export const ToolGlyph = ({name, color, size}) => {
  const key = name || 'tool';
  const matched = ICON_MAP.find(([re]) => re.test(key));
  const Icon = matched ? matched[1] : ICON_FALLBACKS[Math.floor(rnd(key) * ICON_FALLBACKS.length)];
  return <Icon width={size} height={size} color={color} strokeWidth={1.8} />;
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

// ---- shared data-viz/animation primitives (DataVizCard, WorkflowStepper's "bars" body, BrowserSim's
// cursor, DocHighlighter's stamp) — kept here so none of those components duplicate this logic ----

// a single animated horizontal comparison bar with a counting number, staggered by `i`.
// `light` (bool): the dark track/label colors below are for the 'glass' dark tone — on 'alabaster'
// (light polarity, white card) they'd be nearly invisible, so pass `light` to flip to dark-ink
// label/track colors instead (crisp editorial-card rule).
export const AnimatedBar = ({name, value, max, color, frame, i = 0, narrow, startAt = 0, light}) => {
  const at = startAt + i * 6;
  const k = prog(frame, at, 40, ease);
  const pct = Math.max(0, Math.min(100, (value / (max || Math.max(value, 1))) * 100)) * k;
  const shown = value * k;
  return (
    <div style={{marginBottom: narrow ? 22 : 28}}>
      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontFamily: F.sans, fontWeight: 700, fontSize: narrow ? 24 : 22}}>
        <span style={{color: light ? 'rgba(15,23,42,.78)' : 'rgba(255,255,255,.85)'}}>{name}</span>
        <span style={{color}}>{fmtNumSafe(shown)}</span>
      </div>
      <div style={{width: '100%', height: narrow ? 16 : 18, borderRadius: 9, background: light ? 'rgba(15,23,42,.08)' : 'rgba(255,255,255,.08)', overflow: 'hidden'}}>
        <div style={{height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${color}aa, ${color})`, borderRadius: 9}} />
      </div>
    </div>
  );
};
const fmtNumSafe = (n) => Number(n).toLocaleString('en-US', {maximumFractionDigits: 1});

// circular 0->pct gauge arc (DataVizCard mode="gauge"). pct is 0..1 (already eased by the caller).
export const GaugeArc = ({pct, color, size = 220, strokeWidth = 16, light}) => {
  const r = (size - strokeWidth) / 2; const c = size / 2; const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{transform: 'rotate(-90deg)'}}>
      <circle cx={c} cy={c} r={r} fill="none" stroke={light ? 'rgba(15,23,42,.08)' : 'rgba(255,255,255,.08)'} strokeWidth={strokeWidth} />
      <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} style={{filter: light ? 'none' : `drop-shadow(0 0 10px ${color}88)`}} />
    </svg>
  );
};

// dot-matrix ratio grid (DataVizCard mode="matrix"): cols*rows dots, `lit` of them filled in reading order.
export const MatrixDots = ({cols = 10, rows = 10, lit = 0, color, size = 14, gap = 8, light}) => (
  <div style={{display: 'grid', gridTemplateColumns: `repeat(${cols}, ${size}px)`, gap}}>
    {Array.from({length: cols * rows}, (_, i) => (
      <div key={i} style={{
        width: size, height: size, borderRadius: size * 0.3,
        background: i < lit ? color : (light ? 'rgba(15,23,42,.08)' : 'rgba(255,255,255,.08)'),
        boxShadow: i < lit ? `0 0 8px ${color}aa` : 'none',
        transition: 'none',
      }} />
    ))}
  </div>
);

// piecewise-linear cursor position from keyframes [{x,y,at}] (x/y are 0-100 percent of the parent box).
// holds at the first keyframe before `at[0]` and the last after the final one.
export const cursorPos = (frame, keyframes) => {
  if (!keyframes || !keyframes.length) return {x: 50, y: 50};
  if (frame <= keyframes[0].at) return {x: keyframes[0].x, y: keyframes[0].y};
  for (let i = 0; i < keyframes.length - 1; i++) {
    const a = keyframes[i], b = keyframes[i + 1];
    if (frame >= a.at && frame <= b.at) {
      const k = prog(frame, a.at, Math.max(1, b.at - a.at), ease);
      return {x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k)};
    }
  }
  const last = keyframes[keyframes.length - 1];
  return {x: last.x, y: last.y};
};
// simulated mouse cursor + click pulse, positioned in percent coords inside a `position:relative` parent.
export const Cursor = ({frame, keyframes, color = '#fff'}) => {
  const {x, y} = cursorPos(frame, keyframes);
  const nearestClick = (keyframes || []).find((k) => Math.abs(frame - k.at) < 8);
  return (
    <div style={{position: 'absolute', left: `${x}%`, top: `${y}%`, pointerEvents: 'none', zIndex: 20}}>
      <svg width="22" height="22" viewBox="0 0 22 22" style={{filter: 'drop-shadow(0 2px 6px rgba(0,0,0,.6))'}}>
        <path d="M2 2 L2 18 L7 14 L10 20 L13 18.5 L10 12.5 L16 12 Z" fill={color} stroke="#0008" strokeWidth="1" />
      </svg>
      {nearestClick && (
        <div style={{
          position: 'absolute', left: 4, top: 4, width: 26, height: 26, borderRadius: '50%',
          border: `2px solid ${color}`, transform: `translate(-50%,-50%) scale(${1 + prog(frame, nearestClick.at, 14, ease) * 1.4})`,
          opacity: 1 - prog(frame, nearestClick.at, 14, ease),
        }} />
      )}
    </div>
  );
};

// Floating ambient light orbs — soft, large, blurred glow blobs drifting slowly (distinct from `Dust`'s
// small fast specks): adds a premium "alive" depth layer behind dark-polarity UI-card beats without
// competing with the card content in front of it. `active` (bool) lets the caller fade it in/out per
// current beat's polarity (e.g. only on 'dark'/'glass' beats, never on light 'alabaster' editorial cards).
export const AmbientOrbs = ({n = 5, color = '#22D3EE', active = true, opacity = 0.16}) => {
  const f = useCurrentFrame(); const {width: w, height: h} = useVideoConfig();
  const fade = active ? opacity : 0;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden', opacity: fade, transition: 'none'}}>
      {Array.from({length: n}, (_, i) => {
        const seed = rnd(`orb${i}`); const seed2 = rnd(`orb2${i}`);
        const baseX = seed * w, baseY = seed2 * h;
        const speed = 0.15 + rnd(`orbspeed${i}`) * 0.25;
        const x = baseX + Math.sin(f * speed / 40 + i) * (w * 0.08);
        const y = baseY + Math.cos(f * speed / 55 + i * 2) * (h * 0.08);
        const s = (0.5 + rnd(`orbsize${i}`) * 0.9) * (w * 0.22);
        return (
          <div key={i} style={{
            position: 'absolute', left: x - s / 2, top: y - s / 2, width: s, height: s, borderRadius: '50%',
            background: `radial-gradient(circle, ${color}bb 0%, ${color}00 70%)`, filter: 'blur(18px)',
          }} />
        );
      })}
    </AbsoluteFill>
  );
};

// slam-down verdict stamp (DocHighlighter): rotated, scales in with a hard spring, e.g. "VERIFIED"/"REFUSED".
export const Stamp = ({text, color = '#f0506e', at = 0, frame, rotate = -14}) => {
  const k = springPop(frame, at, {damping: 10, stiffness: 220});
  const s = Math.min(1.15, k);
  return (
    <div style={{
      position: 'absolute', right: '8%', top: '12%', opacity: Math.min(1, k * 1.5),
      transform: `rotate(${rotate}deg) scale(${s})`, border: `5px solid ${color}`, borderRadius: 10,
      padding: '10px 22px', color, fontFamily: F.display, fontSize: 40, letterSpacing: 3,
      textTransform: 'uppercase', boxShadow: `0 0 30px ${color}55`, mixBlendMode: 'normal',
    }}>{text}</div>
  );
};


// Reusable floating bottom-right HostAvatar PiP for a bespoke custom scene's mid-video "key twist" /
// technical beat (render_guide.md: HostAvatar should show up on Hook, Key Twist, and CTA beats, not
// just the hook/CTA templates that already wire it in). Drop into any custom scene:
//   import {HostAvatarPiP} from '../../scenes/common.jsx';
//   <HostAvatarPiP frame={frame} narrow={narrow} pose="explaining" at={10} />
export const HostAvatarPiP = ({frame, narrow, pose = 'explaining', at = 0, size}) => {
  const k = prog(frame, at, 14);
  const s = size || (narrow ? 170 : 200);
  return (
    <div style={{position: 'absolute', right: narrow ? 18 : 36, bottom: narrow ? 18 : 36, opacity: k, zIndex: 6}}>
      <HostAvatar pose={pose} size={s} delay={at} />
    </div>
  );
};
