import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing} from 'remotion';
import {F} from '../theme.js';

// ---------------------------------------------------------------------------------------------
// AutoLayout — 5 genuinely distinct scene layouts rendered from scenes.json fields.
// Doc.jsx picks the layout deterministically: layoutIndex = (autoIndex + jobSeedOffset) % 5, where
// autoIndex counts auto-layout beats in order, so ADJACENT beats never share a layout and different
// jobs (different seeds) start on different visuals. The last beat always uses the Summary/Outro
// layout, whose variant is chosen from the job seed + takeaway.
// Palette: orbital navy #040B16/#081324, cyan #38BDF8, gold #F59E0B, silver text.
// Motion: cubic-bezier(0.22,1,0.36,1) settle, staggered entry, short exit fade — never stuck mid-opacity.
// ---------------------------------------------------------------------------------------------
const P = {bg: '#040B16', bg2: '#081324', cyan: '#38BDF8', gold: '#F59E0B', text: '#E8EEF7', sub: '#9FB0C8', line: 'rgba(56,189,248,.18)', card: 'rgba(8,19,36,.88)'};
const EASE = Easing.bezier(0.22, 1, 0.36, 1);
export const LAYOUT_NAMES = ['split', 'steps', 'compare', 'kinetic', 'outro'];

const useBox = () => {
  const {width, height} = useVideoConfig();
  const narrow = height > width;
  const m = narrow ? 96 : 80;                       // safe margin
  const capB = narrow ? 360 : 190;                  // bottom room for the Captions pill
  return {width, height, narrow, m, capB, w: width - 2 * m, h: height - m - capB - (narrow ? 40 : 0), top: narrow ? 140 : m};
};
// staggered entry 0..1 (with exit fade over the last 10 frames), clean settle, no snaps
const useIn = (frames, delay = 0, len = 20) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [delay, delay + len], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE});
  const out = frames ? interpolate(f, [frames - 10, frames], [1, 0.0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1;
  return {t, o: Math.min(1, t * 1.25) * Math.max(out, 0.0) || 0, f};
};
const Rise = ({children, frames, delay = 0, dy = 34, dx = 0, style}) => {
  const {t, o} = useIn(frames, delay);
  return <div style={{opacity: o, transform: `translate(${(1 - t) * dx}px, ${(1 - t) * dy}px)`, ...style}}>{children}</div>;
};

// ---- field helpers (render real scenes.json data; derive from narration when fields are absent) ----
const asText = (x) => (typeof x === 'string' ? x : x ? x.text || x.label || x.title || x.name || '' : '');
const sentences = (s) => String(s || '').split(/(?<=[.!?])\s+/).map((x) => x.trim()).filter(Boolean);
const clip = (s, n) => { s = String(s || '').trim(); return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s; };
const pickList = (v, max = 4) => {
  const raw = v.bullets || v.items || v.points || v.steps || v.callouts || [];
  let list = (Array.isArray(raw) ? raw : []).map((x) => ({label: clip(asText(x), 90), sub: clip(x && x.sub ? x.sub : x && x.detail ? x.detail : '', 80)})).filter((x) => x.label);
  if (!list.length) list = sentences(v.narration).slice(1, max + 1).map((s) => ({label: clip(s, 90), sub: ''}));
  return list.slice(0, max);
};
const headline = (v) => clip(v.title || v.headline || v.text || sentences(v.narration)[0] || '', 80);
const kicker = (v) => clip(v.kicker || v.label || '', 40);
const metrics = (v) => (Array.isArray(v.metrics) ? v.metrics : []).slice(0, 3).map((m) => ({value: String(m.value != null ? m.value : m.v), label: clip(m.label || m.l || '', 28)}));

// font size that fits: longer text -> smaller, clamped, so nothing clips
const fit = (text, base, min, perChar = 0.9) => Math.max(min, Math.min(base, base - Math.max(0, String(text).length - 18) * perChar));

const Shell = ({children, v, box}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 70% at 18% 12%, ${P.bg2} 0%, ${P.bg} 70%)`, overflow: 'hidden', fontFamily: F.sans}}>
    <AbsoluteFill style={{backgroundImage: `linear-gradient(${P.line} 1px, transparent 1px), linear-gradient(90deg, ${P.line} 1px, transparent 1px)`, backgroundSize: '72px 72px', opacity: 0.35}} />
    <div style={{position: 'absolute', left: box.m, top: box.top, width: box.w, height: box.h, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>{children}</div>
  </AbsoluteFill>
);
const Kick = ({v, frames}) => (kicker(v) ? <Rise frames={frames} dy={14} style={{color: P.cyan, fontWeight: 800, letterSpacing: '0.18em', fontSize: 24, textTransform: 'uppercase', marginBottom: 18}}>{kicker(v)}</Rise> : null);

// 1) Split Editorial + Visual Diagram -----------------------------------------------------------
const Split = ({v, frames, box}) => {
  const list = pickList(v, 4); const title = headline(v); const n = Math.max(list.length, 2);
  const col = {display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0, maxWidth: '100%'};
  const nodes = (list.length ? list : [{label: 'Idea'}, {label: 'Result'}]).slice(0, 4);
  return (
    <div style={{display: 'flex', flexDirection: box.narrow ? 'column' : 'row', gap: box.narrow ? 48 : 72, alignItems: box.narrow ? 'stretch' : 'center', height: '100%'}}>
      <div style={{...col, flex: box.narrow ? '0 0 auto' : '1 1 52%'}}>
        <Kick v={v} frames={frames} />
        <Rise frames={frames} delay={4} style={{color: P.text, fontWeight: 900, lineHeight: 1.06, letterSpacing: '-0.02em', fontSize: box.narrow ? fit(title, 88, 56) : fit(title, 84, 52)}}>{title}</Rise>
        <Rise frames={frames} delay={12} style={{marginTop: 24, width: 120, height: 6, borderRadius: 3, background: P.gold}} />
        {v.sub || v.caption ? <Rise frames={frames} delay={16} style={{marginTop: 22, color: P.sub, fontSize: box.narrow ? 36 : 30, lineHeight: 1.35}}>{clip(v.sub || v.caption, 140)}</Rise> : null}
      </div>
      <div style={{...col, flex: '1 1 48%', gap: 0}}>
        {nodes.map((it, i) => (
          <React.Fragment key={i}>
            <Rise frames={frames} delay={10 + i * 7} dx={box.narrow ? 0 : 40} dy={box.narrow ? 24 : 0}
              style={{display: 'flex', alignItems: 'center', gap: 20, background: P.card, border: `2px solid ${i === nodes.length - 1 ? P.gold : P.cyan}`, borderRadius: 22, padding: '20px 26px', boxSizing: 'border-box'}}>
              <div style={{flex: '0 0 auto', width: 52, height: 52, borderRadius: 14, background: i === nodes.length - 1 ? P.gold : P.cyan, color: P.bg, fontWeight: 900, fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</div>
              <div style={{minWidth: 0, color: P.text, fontWeight: 700, fontSize: box.narrow ? 34 : 30, lineHeight: 1.2}}>{it.label}</div>
            </Rise>
            {i < nodes.length - 1 ? <Rise frames={frames} delay={14 + i * 7} dy={0} style={{alignSelf: 'center', width: 4, height: box.narrow ? 22 : 18, background: `linear-gradient(${P.cyan}, ${P.gold})`}} /> : null}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// 2) Step / Process Cards -----------------------------------------------------------------------
const Steps = ({v, frames, box}) => {
  const list = pickList(v, 4); const title = headline(v);
  const {f} = useIn(frames);
  const active = Math.min(list.length - 1, Math.floor((f / Math.max(1, frames)) * list.length));
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: box.narrow ? 36 : 40, height: '100%', justifyContent: 'center'}}>
      <div>
        <Kick v={v} frames={frames} />
        <Rise frames={frames} delay={3} style={{color: P.text, fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.08, fontSize: box.narrow ? fit(title, 74, 48) : fit(title, 68, 44)}}>{title}</Rise>
      </div>
      <div style={{display: 'flex', flexDirection: box.narrow ? 'column' : 'row', gap: 22, alignItems: 'stretch'}}>
        {list.map((it, i) => (
          <Rise key={i} frames={frames} delay={10 + i * 8} dy={44}
            style={{flex: '1 1 0', minWidth: 0, boxSizing: 'border-box', background: P.card, borderRadius: 26, padding: '26px 28px', border: `2px solid ${i === active ? P.gold : P.line}`, boxShadow: i === active ? '0 0 0 4px rgba(245,158,11,.12)' : 'none'}}>
            <div style={{color: i === active ? P.gold : P.cyan, fontWeight: 900, fontSize: box.narrow ? 54 : 48, lineHeight: 1}}>{String(i + 1).padStart(2, '0')}</div>
            <div style={{marginTop: 14, color: P.text, fontWeight: 800, lineHeight: 1.2, fontSize: box.narrow ? 38 : 30}}>{it.label}</div>
            {it.sub ? <div style={{marginTop: 10, color: P.sub, fontSize: box.narrow ? 28 : 22, lineHeight: 1.3}}>{it.sub}</div> : null}
          </Rise>
        ))}
      </div>
    </div>
  );
};

// 3) Before / After Comparison ------------------------------------------------------------------
const Compare = ({v, frames, box}) => {
  const before = v.before || {}; const after = v.after || {};
  const lines = (side, fb) => ((side && (side.items || side.bullets)) || (Array.isArray(side) ? side : fb)).map(asText).filter(Boolean).slice(0, 3).map((s) => clip(s, 70));
  const list = pickList(v, 6);
  const bl = lines(before, list.slice(0, Math.ceil(list.length / 2)).map((x) => x.label));
  const al = lines(after, list.slice(Math.ceil(list.length / 2)).map((x) => x.label));
  const title = headline(v);
  const Side = ({label, items, color, delay, dx}) => (
    <Rise frames={frames} delay={delay} dx={dx} dy={0} style={{flex: '1 1 0', minWidth: 0, boxSizing: 'border-box', background: P.card, border: `2px solid ${color}`, borderRadius: 28, padding: '28px 32px'}}>
      <div style={{color, fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', fontSize: 26}}>{clip(asText(label) || '', 24)}</div>
      <div style={{marginTop: 18, display: 'flex', flexDirection: 'column', gap: 16}}>
        {items.map((s, i) => <div key={i} style={{color: P.text, fontSize: box.narrow ? 36 : 30, lineHeight: 1.25, fontWeight: 600, display: 'flex', gap: 14}}><span style={{color, flex: '0 0 auto'}}>{color === P.gold ? '✓' : '✕'}</span><span style={{minWidth: 0}}>{s}</span></div>)}
      </div>
    </Rise>
  );
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 34, height: '100%', justifyContent: 'center'}}>
      <div><Kick v={v} frames={frames} /><Rise frames={frames} delay={3} style={{color: P.text, fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.08, fontSize: box.narrow ? fit(title, 72, 46) : fit(title, 64, 42)}}>{title}</Rise></div>
      <div style={{display: 'flex', flexDirection: box.narrow ? 'column' : 'row', gap: 26, alignItems: 'stretch'}}>
        <Side label={before.label || 'Before'} items={bl} color="#F87171" delay={10} dx={-50} />
        <Side label={after.label || 'After'} items={al} color={P.gold} delay={18} dx={50} />
      </div>
    </div>
  );
};

// 4) Kinetic Statement + Key Points -------------------------------------------------------------
const Kinetic = ({v, frames, box}) => {
  const title = headline(v); const words = title.split(/\s+/); const list = pickList(v, 3); const mt = metrics(v);
  const acc = new Set((v.accent || []).map((a) => String(a).toLowerCase()));
  const size = box.narrow ? fit(title, 112, 64, 1.1) : fit(title, 104, 58, 1.0);
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 34, height: '100%', justifyContent: 'center'}}>
      <Kick v={v} frames={frames} />
      <div style={{display: 'flex', flexWrap: 'wrap', gap: `0 ${Math.round(size * 0.25)}px`, color: P.text, fontWeight: 900, letterSpacing: '-0.025em', lineHeight: 1.05, fontSize: size}}>
        {words.map((w, i) => (
          <Rise key={i} frames={frames} delay={2 + i * 3} dy={size * 0.5} style={{color: acc.has(w.toLowerCase().replace(/[^a-z0-9$%.]/g, '')) || i === words.length - 1 ? P.gold : P.text}}>{w}</Rise>
        ))}
      </div>
      <div style={{display: 'flex', flexDirection: box.narrow ? 'column' : 'row', gap: 18}}>
        {mt.map((m, i) => (
          <Rise key={'m' + i} frames={frames} delay={14 + i * 6} style={{flex: '1 1 0', minWidth: 0, boxSizing: 'border-box', background: P.card, border: `2px solid ${P.cyan}`, borderRadius: 22, padding: '18px 24px'}}>
            <div style={{color: P.cyan, fontWeight: 900, fontSize: box.narrow ? 64 : 56, lineHeight: 1}}>{m.value}</div>
            <div style={{color: P.sub, fontSize: 24, marginTop: 6}}>{m.label}</div>
          </Rise>
        ))}
        {!mt.length ? list.map((it, i) => (
          <Rise key={i} frames={frames} delay={14 + i * 6} style={{flex: '1 1 0', minWidth: 0, boxSizing: 'border-box', borderLeft: `6px solid ${i % 2 ? P.gold : P.cyan}`, padding: '6px 0 6px 22px', color: P.text, fontWeight: 700, fontSize: box.narrow ? 36 : 28, lineHeight: 1.25}}>{it.label}</Rise>
        )) : null}
      </div>
    </div>
  );
};

// 5) Summary / Outro Card (variant chosen per job from seed + takeaway) ---------------------------
const Outro = ({v, frames, box, seed = 0}) => {
  const takeaway = clip(v.takeaway || v.title || v.headline || v.text || sentences(v.narration).slice(-1)[0] || '', 120);
  const list = pickList(v, 3); const cta = clip(v.cta || v.sub || 'Subscribe to AI Graphic TV', 60);
  const variant = (seed + takeaway.length) % 3;
  const size = box.narrow ? fit(takeaway, 92, 54, 0.8) : fit(takeaway, 80, 46, 0.7);
  const Cta = ({delay}) => <Rise frames={frames} delay={delay} style={{alignSelf: 'flex-start', marginTop: 34, background: P.gold, color: P.bg, fontWeight: 900, fontSize: box.narrow ? 38 : 32, padding: '16px 36px', borderRadius: 16, maxWidth: '100%', boxSizing: 'border-box'}}>{cta}</Rise>;
  if (variant === 0) {          // recap checklist
    return (
      <div style={{display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center'}}>
        <Kick v={{kicker: v.kicker || 'Recap'}} frames={frames} />
        <Rise frames={frames} delay={3} style={{color: P.text, fontWeight: 900, lineHeight: 1.08, letterSpacing: '-0.02em', fontSize: size}}>{takeaway}</Rise>
        <div style={{marginTop: 28, display: 'flex', flexDirection: 'column', gap: 14}}>
          {list.map((it, i) => <Rise key={i} frames={frames} delay={12 + i * 6} style={{display: 'flex', gap: 16, color: P.text, fontSize: box.narrow ? 36 : 30, fontWeight: 600}}><span style={{color: P.gold, fontWeight: 900}}>✓</span><span style={{minWidth: 0}}>{it.label}</span></Rise>)}
        </div>
        <Cta delay={22} />
      </div>
    );
  }
  if (variant === 1) {          // big takeaway panel
    return (
      <div style={{display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'flex-start'}}>
        <Rise frames={frames} delay={2} style={{width: '100%', boxSizing: 'border-box', background: P.card, border: `3px solid ${P.cyan}`, borderRadius: 34, padding: box.narrow ? '48px 44px' : '44px 56px'}}>
          <div style={{color: P.cyan, fontWeight: 800, letterSpacing: '0.2em', fontSize: 24, textTransform: 'uppercase'}}>The takeaway</div>
          <div style={{marginTop: 20, color: P.text, fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.02em', fontSize: size}}>{takeaway}</div>
        </Rise>
        <Cta delay={16} />
      </div>
    );
  }
  return (                       // next-step card
    <div style={{display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center'}}>
      <Rise frames={frames} delay={2} style={{color: P.gold, fontWeight: 900, letterSpacing: '0.2em', fontSize: 26, textTransform: 'uppercase'}}>Your next step</Rise>
      <Rise frames={frames} delay={7} style={{marginTop: 18, color: P.text, fontWeight: 900, lineHeight: 1.08, letterSpacing: '-0.02em', fontSize: size}}>{takeaway}</Rise>
      <Rise frames={frames} delay={14} style={{marginTop: 26, width: 160, height: 6, borderRadius: 3, background: P.cyan}} />
      <Cta delay={20} />
    </div>
  );
};

const LAYOUTS = [Split, Steps, Compare, Kinetic, Outro];

// Props injected by Doc.jsx: layoutIndex (0-4), seed (job offset), isLast, narration, frames.
export const AutoLayout = (props) => {
  const box = useBox();
  const {frames = 60, layoutIndex = 0, seed = 0, isLast = false} = props;
  const idx = isLast ? 4 : ((layoutIndex % 5) + 5) % 5;
  const L = LAYOUTS[props.layout && LAYOUT_NAMES.includes(props.layout) ? LAYOUT_NAMES.indexOf(props.layout) : idx];
  return <Shell v={props} box={box}><L v={props} frames={frames} box={box} seed={seed} /></Shell>;
};
