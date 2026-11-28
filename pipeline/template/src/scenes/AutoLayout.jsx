import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing, spring} from 'remotion';
import {F} from '../theme.js';
import {TopicGraphic, GRAPHIC_KINDS} from './TopicGraphics.jsx';
import {BrandLogo} from './BrandLogo.jsx';

// ---------------------------------------------------------------------------------------------
// AutoLayout — 5 genuinely distinct scene layouts rendered from scenes.json fields.
// Doc.jsx picks the layout deterministically: layoutIndex = (autoIndex + jobSeedOffset) % 5, where
// autoIndex counts auto-layout beats in order, so ADJACENT beats never share a layout and different
// jobs (different seeds) start on different visuals. The last beat always uses the Summary/Outro
// layout, whose variant is chosen from the job seed + takeaway.
// Palette: orbital navy #040B16/#081324, cyan #38BDF8, gold #F59E0B, silver text.
// Motion: cubic-bezier(0.22,1,0.36,1) settle, staggered entry, short exit fade — never stuck mid-opacity.
// ---------------------------------------------------------------------------------------------
const GRAD = {backgroundImage: 'linear-gradient(90deg, #F59E0B 0%, #FDE7B0 45%, #38BDF8 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', WebkitTextFillColor: 'transparent'};
const P = {bg: '#040B16', bg2: '#081324', cyan: '#38BDF8', gold: '#F59E0B', text: '#E8EEF7', sub: '#9FB0C8', line: 'rgba(56,189,248,.18)', card: 'linear-gradient(160deg, rgba(16,34,60,.92), rgba(8,19,36,.9))'};
const CARD = {background: P.card, boxShadow: 'inset 0 1px 0 rgba(255,255,255,.10), inset 0 0 0 1px rgba(56,189,248,.05), 0 18px 44px rgba(0,0,0,.38)'};
const EASE = Easing.bezier(0.22, 1, 0.36, 1);
export const LAYOUT_NAMES = ['split', 'steps', 'compare', 'kinetic', 'outro', 'metric', 'quote', 'grid'];

const useBox = () => {
  const {width, height} = useVideoConfig();
  const narrow = height > width;
  const m = narrow ? 96 : 80;                       // safe margin
  const capB = narrow ? 360 : 190;                  // bottom room for the Captions pill
  return {width, height, narrow, m, capB, w: width - 2 * m, h: height - m - capB - (narrow ? 40 : 0), top: narrow ? 140 : m};
};
// staggered entry 0..1 (with exit fade over the last 10 frames), clean settle, no snaps
const useIn = (frames, delay = 0, len = 20) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const t = Math.min(1, Math.max(0, spring({frame: f - delay, fps, config: {damping: 24, stiffness: 190, mass: 0.8}})));
  const out = frames ? interpolate(f, [frames - 6, frames], [1, 0.0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1;
  return {t, o: Math.min(1, t * 1.7) * Math.max(out, 0.0) || 0, f};
};
const Rise = ({children, frames, delay = 0, dy = 34, dx = 0, style}) => {
  const {t, o} = useIn(frames, delay);
  return <div style={{opacity: o, transform: `translate(${(1 - t) * dx}px, ${(1 - t) * dy}px)`, ...style}}>{children}</div>;
};

// small inline icon set, picked from the label's keywords (so each topic gets matching icons automatically)
const ICONS = {
  bolt: 'M13 2L4 14h6l-1 8 9-12h-6l1-8z', check: 'M5 13l4 4L19 7', mail: 'M3 6h18v12H3zM3 7l9 6 9-6', doc: 'M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7',
  gear: 'M12 8a4 4 0 100 8 4 4 0 000-8zM12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2', chart: 'M4 20V10M10 20V4M16 20v-8M22 20H2',
  heart: 'M12 21s-7-4.5-9-9a5 5 0 019-3 5 5 0 019 3c-2 4.5-9 9-9 9z', book: 'M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2zM4 19a2 2 0 012-2h13',
  coin: 'M12 3a9 9 0 100 18 9 9 0 000-18zM12 7v10M9.5 9.5c0-1 1-1.5 2.5-1.5s2.5.5 2.5 1.5-1 1.5-2.5 1.5-2.5.5-2.5 1.5 1 1.5 2.5 1.5 2.5-.5 2.5-1.5',
  camera: 'M3 8h4l2-3h6l2 3h4v12H3zM12 11a3.5 3.5 0 100 7 3.5 3.5 0 000-7z', mic: 'M12 3a3 3 0 013 3v6a3 3 0 01-6 0V6a3 3 0 013-3zM5 11a7 7 0 0014 0M12 18v3',
  people: 'M9 11a3 3 0 100-6 3 3 0 000 6zM3 20a6 6 0 0112 0M17 8a2.5 2.5 0 110 5M18 20a5 5 0 00-3-4.6',
  link: 'M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1', spark: 'M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z',
};
const KEYS = [[/health|sleep|fitness|workout|diet|stress|mental|wellness|habit/i, 'heart'], [/learn|study|course|skill|lesson|school|read|book|exam/i, 'book'], [/money|revenue|profit|income|sales|price|cost|budget|invest|cash|roi/i, 'coin'], [/audience|communit|team|people|customer|listener|fans?|follower|hire/i, 'people'], [/video|film|photo|camera|content|reel|shoot/i, 'camera'], [/podcast|voice|audio|record|mic\b|music/i, 'mic'], [/mail|email|inbox|send/i, 'mail'], [/doc|sheet|file|note|report|pdf/i, 'doc'], [/data|metric|chart|track|analy|report|stat/i, 'chart'], [/trigger|webhook|api|connect|link|integrat/i, 'link'], [/automat|workflow|setup|config|build|run|node/i, 'gear'], [/verif|check|test|gate|approve|done|result/i, 'check'], [/fast|speed|save|time|instant|boost/i, 'bolt']];
const iconFor = (label, i = 0) => { for (const [re, k] of KEYS) if (re.test(label || '')) return k; return ['spark', 'bolt', 'gear', 'chart'][i % 4]; };
const Icon = ({k, size = 30, color = P.bg}) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{flex: '0 0 auto'}}><path d={ICONS[k] || ICONS.spark} /></svg>);

// ---- field helpers (render real scenes.json data; derive from narration when fields are absent) ----
const txtOf = (v) => `${(v && (v.title || v.headline || v.text || '')) || ''} ${(v && v.kicker) || ''} ${(v && v.narration) || ''}`.toLowerCase();
// node-flow / connector visuals are used ONLY for technical / workflow topics; other domains get editorial rows
const isTech = (v) => !!(v && (arr(v.workflow).length || v.gate || /\b(workflow|automat\w*|n8n|api|webhook|code|coding|software|integration|pipeline|node|nodes|agent|agents|database|script|deploy\w*|zapier|trigger|prompt|model)\b/.test(txtOf(v))));
// accept `comparison: {before, after, metric}` as an alias of top-level before/after/metric
const norm = (p) => { const o = p && typeof p === 'object' ? p : {}; const c = o.comparison && typeof o.comparison === 'object' ? o.comparison : null; return c ? {...o, before: o.before || c.before, after: o.after || c.after, metric: o.metric || c.metric || c.efficiency || c.time_saved} : o; };
const arr = (x) => (Array.isArray(x) ? x : []);
const asText = (x) => (typeof x === 'string' ? x : typeof x === 'number' ? String(x) : x && typeof x === 'object' ? String(x.text || x.label || x.title || x.name || '') : '');
const sentences = (s) => String(s || '').split(/(?<=[.!?])\s+/).map((x) => x.trim()).filter(Boolean);
const clip = (s, n) => { s = String(s || '').trim(); return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s; };
const pickList = (v, max = 4) => {
  const raw = v.bullets || v.items || v.points || v.steps || v.callouts || [];
  let list = (Array.isArray(raw) ? raw : []).map((x) => ({label: clip(asText(x), 56), sub: clip(x && x.sub ? x.sub : x && x.detail ? x.detail : '', 80)})).filter((x) => x.label);
  if (!list.length) list = sentences(v.narration).slice(1, max + 1).map((s) => ({label: clip(s, 48), sub: ''}));
  return list.slice(0, max);
};
const headline = (v) => clip(v.title || v.headline || v.text || sentences(v.narration)[0] || '', 60);
const kicker = (v) => clip(v.kicker || v.label || '', 40);
const metrics = (v) => arr(v.metrics).filter((m) => m && typeof m === 'object' && (m.value != null || m.v != null)).slice(0, 3).map((m) => ({value: clip(String(m.value != null ? m.value : m.v), 12), label: clip(m.label || m.l || '', 28)}));
const NUMW = {two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10};
const NOUNS = 'tools?|steps?|ways?|tips?|points?|apps?|mistakes?|reasons?|hacks?|things?|ideas?|rules?|habits?|tricks?|stages?|workflows?|templates?|prompts?|secrets?|lessons?|features?|strategies|methods?|examples?|questions?|platforms?|agents?';
const COUNT_RE = new RegExp('\\b(\\d{1,2}|' + Object.keys(NUMW).join('|') + ')(\\s+(?:[a-z-]+\\s+){0,2}?)(' + NOUNS + ')\\b', 'i');
// keep on-screen count claims ("5 tools") equal to the cards actually shown
const fixCount = (title, n) => {
  if (!title || !Number.isFinite(n) || n < 2 || n > 10) return title;
  return String(title).replace(COUNT_RE, (m, num, mid, noun) => {
    const digit = /^\d/.test(num); const cur = digit ? Number(num) : NUMW[num.toLowerCase()];
    if (cur === n) return m;
    let w = String(n); if (!digit) { w = Object.keys(NUMW).find((k) => NUMW[k] === n) || w; if (num[0] === num[0].toUpperCase()) w = w[0].toUpperCase() + w.slice(1); }
    return w + mid + noun;
  });
};
const firstNumber = (t) => { const m = String(t || '').match(/[$€£]?\d[\d,.]*\s?(?:%|x|k|m|hrs?|hours|min|days|×)?/i); return m ? m[0].trim() : ''; };

// font size that fits: longer text -> smaller, clamped, so nothing clips
const fit = (text, base, min, perChar = 0.9) => Math.max(min, Math.min(base, base - Math.max(0, String(text).length - 18) * perChar));

const Waves = ({box, t0 = 0}) => {
  const f = useCurrentFrame() + t0; const {width: W, height: H} = box;
  const wave = (amp, len, speed, phase, y0) => { let d = `M0 ${H}`; for (let x = 0; x <= W; x += 40) d += ` L${x} ${(y0 + Math.sin((x / len) + f * speed + phase) * amp).toFixed(1)}`; return d + ` L${W} ${H} Z`; };
  const bx = ((f * 3.2) % (W * 2.4)) - W * 0.7;      // slow diagonal light beam, always alive
  return (
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, transform: `translate(${(-Math.sin(f * 0.03) * 7).toFixed(1)}px, ${(-Math.cos(f * 0.025) * 5).toFixed(1)}px) scale(1.03)`}}>
      <defs><linearGradient id="alBeam" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stopColor="rgba(56,189,248,0)" /><stop offset="0.5" stopColor="rgba(56,189,248,.10)" /><stop offset="1" stopColor="rgba(56,189,248,0)" /></linearGradient></defs>
      <polygon points={`${bx},0 ${bx + W * 0.28},0 ${bx + W * 0.28 - H * 0.35},${H} ${bx - H * 0.35},${H}`} fill="url(#alBeam)" />
      <path d={wave(34, 260, 0.035, 0, H * 0.84)} fill="rgba(56,189,248,.07)" />
      <path d={wave(26, 340, -0.028, 2, H * 0.89)} fill="rgba(245,158,11,.06)" />
      <path d={wave(20, 200, 0.045, 4, H * 0.94)} fill="rgba(56,189,248,.08)" />
      {[0.34, 0.5, 0.68].map((k, i) => <circle key={i} cx={W * 0.86} cy={H * 0.14} r={Math.min(W, H) * k} fill="none" stroke={i === 1 ? 'rgba(245,158,11,.14)' : 'rgba(56,189,248,.14)'} strokeWidth="2" strokeDasharray={i === 1 ? '6 16' : '2 0'} style={{transformOrigin: `${W * 0.86}px ${H * 0.14}px`, transform: `rotate(${f * (i % 2 ? -0.12 : 0.1)}deg)`}} />)}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => <circle key={'p' + i} cx={(W * (0.08 + i * 0.115) + Math.sin(f * 0.02 + i) * 26)} cy={(H * (0.16 + (i % 4) * 0.22) + Math.cos(f * 0.017 + i * 2) * 20 - (f * 0.25 * (1 + (i % 3) * 0.4)) % 40)} r={2.5 + (i % 3)} fill={i % 2 ? 'rgba(245,158,11,.4)' : 'rgba(56,189,248,.4)'} />)}
      <circle cx={W * (0.82 + 0.03 * Math.sin(f * 0.02))} cy={H * 0.18} r={Math.min(W, H) * 0.28} fill="rgba(56,189,248,.05)" />
    </svg>
  );
};
const Brackets = ({box}) => {
  const L = 38; const o = Math.round(box.m * 0.45); const st = {position: 'absolute', width: L, height: L, borderColor: 'rgba(56,189,248,.35)', borderStyle: 'solid', borderWidth: 0};
  return (<>
    <div style={{...st, left: o, top: o, borderTopWidth: 3, borderLeftWidth: 3}} /><div style={{...st, right: o, top: o, borderTopWidth: 3, borderRightWidth: 3}} />
    <div style={{...st, left: o, bottom: o, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: 'rgba(245,158,11,.35)'}} /><div style={{...st, right: o, bottom: o, borderBottomWidth: 3, borderRightWidth: 3, borderColor: 'rgba(245,158,11,.35)'}} />
  </>);
};
// light-streak wipe on every beat entry (except the very first) so cuts feel like one continuous motion
const Sweep = ({t0}) => {
  const f = useCurrentFrame(); if (!(t0 > 0) || f >= 16) return null; const t = f / 16; const x = t * 150 - 30;
  return <AbsoluteFill style={{pointerEvents: 'none', background: `linear-gradient(105deg, transparent ${x - 22}%, rgba(56,189,248,.20) ${x - 8}%, rgba(245,158,11,.16) ${x}%, transparent ${x + 10}%)`, opacity: 1 - t * 0.6}} />;
};
const Bars = ({box, t0}) => {
  const f = useCurrentFrame() + t0; const n = box.narrow ? 28 : 56; const bw = box.w / n;
  return (
    <div style={{position: 'absolute', left: box.m, bottom: box.capB + 14, width: box.w, height: 64, display: 'flex', alignItems: 'flex-end', gap: 0, opacity: 0.55, overflow: 'hidden'}}>
      {Array.from({length: n}).map((_, i) => <div key={i} style={{width: bw - 4, marginRight: 4, height: 8 + Math.abs(Math.sin(f * 0.12 + i * 0.55) * Math.cos(f * 0.05 + i * 0.2)) * 54, borderRadius: 3, background: i % 5 === 0 ? P.gold : P.cyan}} />)}
    </div>
  );
};
const Shell = ({children, v, box}) => {
  const t0 = Number.isFinite(v.t0) ? v.t0 : 0; const f = useCurrentFrame() + t0;
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 70% at 18% 12%, ${P.bg2} 0%, ${P.bg} 70%)`, overflow: 'hidden', fontFamily: F.sans}}>
      <Waves box={box} t0={t0} />
      <AbsoluteFill style={{backgroundImage: `linear-gradient(${P.line} 1px, transparent 1px), linear-gradient(90deg, ${P.line} 1px, transparent 1px)`, backgroundSize: '72px 72px', backgroundPosition: `${(f * 0.25).toFixed(1)}px ${(f * 0.18).toFixed(1)}px`, opacity: 0.32}} />
      <Brackets box={box} />
      {v.isLast || v.layout === 'outro' ? <Bars box={box} t0={t0} /> : null}
      <div style={{position: 'absolute', left: box.m, top: box.top, width: box.w, height: box.h, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', transform: `translate(${(Math.sin(f * 0.03) * 5).toFixed(1)}px, ${(Math.cos(f * 0.025) * 4).toFixed(1)}px)`}}>{children}</div>
      <Sweep t0={t0} />
    </AbsoluteFill>
  );
};
const Kick = ({v, frames}) => (kicker(v) ? <Rise frames={frames} dy={14} style={{color: P.cyan, fontWeight: 800, letterSpacing: '0.18em', fontSize: 24, textTransform: 'uppercase', marginBottom: 18}}>{kicker(v)}</Rise> : null);

// 1) Split Editorial + Visual Diagram -----------------------------------------------------------
const Split = ({v, frames, box}) => {
  const list = pickList(v, 5); const n = Math.max(list.length, 2);
  const col = {display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0, maxWidth: '100%'};
  const wf = Array.isArray(v.workflow) ? v.workflow.filter(Boolean).map((x) => ({label: clip(asText(x), 40), sub: ''})) : null;
  const nodes = (wf && wf.length ? wf : list.length ? list : [{label: 'Idea'}, {label: 'Result'}]).slice(0, 5);
  const title = fixCount(headline(v), nodes.length);
  const tech = isTech(v);
  const gate = v.gate === false ? '' : clip(typeof v.gate === 'string' ? v.gate : v.verified ? 'Gate Verified' : '', 24);
  return (
    <div style={{display: 'flex', flexDirection: box.narrow ? 'column' : 'row', gap: box.narrow ? 30 : 72, alignItems: box.narrow ? 'stretch' : 'center', justifyContent: 'center', height: '100%'}}>
      <div style={{...col, flex: box.narrow ? '0 0 auto' : '1 1 52%'}}>
        <Kick v={v} frames={frames} />
        <Rise frames={frames} delay={4} style={{color: P.text, fontFamily: F.head, fontWeight: 700, lineHeight: 1.06, letterSpacing: '-0.025em', fontSize: box.narrow ? fit(title, 88, 56) : fit(title, 84, 52)}}>{title}</Rise>
        <Rise frames={frames} delay={12} style={{marginTop: 24, width: 120, height: 6, borderRadius: 3, background: P.gold}} />
        {v.sub || v.caption ? <Rise frames={frames} delay={16} style={{marginTop: 22, color: P.sub, fontSize: box.narrow ? 36 : 30, lineHeight: 1.35}}>{clip(v.sub || v.caption, 140)}</Rise> : null}
      </div>
      <div style={{...col, flex: box.narrow ? '0 0 auto' : '1 1 48%', gap: tech ? 0 : 16}}>
        {nodes.map((it, i) => (
          <React.Fragment key={i}>
            <Rise frames={frames} delay={6 + i * 5} dx={box.narrow ? 0 : 40} dy={box.narrow ? 24 : 0}
              style={{display: 'flex', alignItems: 'center', gap: 20, ...CARD, border: `2px solid ${tech ? (i === nodes.length - 1 ? P.gold : P.cyan) : P.line}`, borderLeft: tech ? undefined : `7px solid ${i % 2 ? P.gold : P.cyan}`, borderRadius: tech ? 22 : 18, padding: '20px 26px', boxSizing: 'border-box'}}>
              <div style={{flex: '0 0 auto', width: 56, height: 56, borderRadius: 16, background: i === nodes.length - 1 ? P.gold : P.cyan, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon k={iconFor(it.label, i)} /></div>
              <div style={{minWidth: 0, flex: '1 1 auto', color: P.text, fontWeight: 700, fontSize: box.narrow ? 34 : 30, lineHeight: 1.2}}>{it.label}</div>
              {gate && i === nodes.length - 1 ? <div style={{flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(245,158,11,.14)', border: `2px solid ${P.gold}`, color: P.gold, borderRadius: 999, padding: '8px 16px', fontWeight: 800, fontSize: 22}}><Icon k="check" size={22} color={P.gold} />{gate}</div> : null}
            </Rise>
            {tech && i < nodes.length - 1 ? <Rise frames={frames} delay={14 + i * 7} dy={0} style={{alignSelf: 'center', width: 4, height: box.narrow ? 22 : 18, background: `linear-gradient(${P.cyan}, ${P.gold})`}} /> : null}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// 2) Step / Process Cards -----------------------------------------------------------------------
const Steps = ({v, frames, box}) => {
  const list = pickList(v, 5); const title = fixCount(headline(v), list.length);
  const {f} = useIn(frames);
  const active = Math.min(list.length - 1, Math.floor((f / Math.max(1, frames)) * list.length));
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: box.narrow ? 36 : 40, height: '100%', justifyContent: 'center'}}>
      <div>
        <Kick v={v} frames={frames} />
        <Rise frames={frames} delay={3} style={{color: P.text, fontFamily: F.head, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.08, fontSize: box.narrow ? fit(title, 74, 48) : fit(title, 68, 44)}}>{title}</Rise>
      </div>
      <div style={{display: 'flex', flexDirection: box.narrow ? 'column' : 'row', gap: 22, alignItems: 'stretch'}}>
        {list.map((it, i) => (
          <Rise key={i} frames={frames} delay={6 + i * 5} dy={44}
            style={{flex: '1 1 0', minWidth: 0, boxSizing: 'border-box', ...CARD, borderRadius: 26, padding: '26px 28px', border: `2px solid ${i === active ? P.gold : P.line}`, boxShadow: i === active ? '0 0 0 4px rgba(245,158,11,.12)' : 'none'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}><div style={{color: i === active ? P.gold : P.cyan, fontFamily: F.head, fontWeight: 700, fontSize: box.narrow ? 54 : 48, lineHeight: 1}}>{String(i + 1).padStart(2, '0')}</div><Icon k={iconFor(it.label, i)} size={40} color={i === active ? P.gold : P.cyan} /></div>
            <div style={{marginTop: 14, color: P.text, fontWeight: 800, lineHeight: 1.2, fontSize: box.narrow ? (list.length > 3 ? 32 : 38) : (list.length > 4 ? 25 : 30)}}>{it.label}</div>
            {it.sub && !(box.narrow && list.length > 3) && !(!box.narrow && list.length > 4) ? <div style={{marginTop: 10, color: P.sub, fontSize: box.narrow ? 28 : 22, lineHeight: 1.3}}>{it.sub}</div> : null}
          </Rise>
        ))}
      </div>
    </div>
  );
};

// 3) Before / After Comparison ------------------------------------------------------------------
const Compare = ({v, frames, box}) => {
  const before = v.before || {}; const after = v.after || {};
  const lines = (side, fb) => (arr(side && (side.items || side.bullets)).length ? arr(side.items || side.bullets) : Array.isArray(side) ? side : fb).map(asText).filter(Boolean).slice(0, 3).map((s) => clip(s, 70));
  const list = pickList(v, 6);
  const bl = lines(before, list.slice(0, Math.ceil(list.length / 2)).map((x) => x.label));
  const al = lines(after, list.slice(Math.ceil(list.length / 2)).map((x) => x.label));
  const title = headline(v);
  const m0 = v.metric || v.efficiency || v.time_saved || (Array.isArray(v.metrics) && v.metrics[0]) || null;
  const mt = m0 ? (typeof m0 === 'object' ? {value: String(m0.value != null ? m0.value : m0.v || ''), label: clip(m0.label || m0.l || 'faster', 40)} : {value: String(m0), label: 'saved'}) : null;
  const Side = ({label, items, color, delay, dx}) => (
    <Rise frames={frames} delay={delay} dx={dx} dy={0} style={{flex: '1 1 0', minWidth: 0, boxSizing: 'border-box', ...CARD, border: `2px solid ${color}`, borderRadius: 28, padding: '28px 32px'}}>
      <div style={{color, fontFamily: F.head, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', fontSize: 26}}>{clip(asText(label) || '', 24)}</div>
      <div style={{marginTop: 18, display: 'flex', flexDirection: 'column', gap: 16}}>
        {items.map((s, i) => <div key={i} style={{color: P.text, fontSize: box.narrow ? 36 : 30, lineHeight: 1.25, fontWeight: 600, display: 'flex', gap: 14}}><span style={{color, flex: '0 0 auto'}}>{color === P.gold ? '✓' : '✕'}</span><span style={{minWidth: 0}}>{s}</span></div>)}
      </div>
    </Rise>
  );
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 34, height: '100%', justifyContent: 'center'}}>
      <div><Kick v={v} frames={frames} /><Rise frames={frames} delay={3} style={{color: P.text, fontFamily: F.head, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.08, fontSize: box.narrow ? fit(title, 72, 46) : fit(title, 64, 42)}}>{title}</Rise></div>
      <div style={{display: 'flex', flexDirection: box.narrow ? 'column' : 'row', gap: 26, alignItems: 'stretch'}}>
        <Side label={before.label || 'Before'} items={bl} color="#F87171" delay={10} dx={-50} />
        <Side label={after.label || 'After'} items={al} color={P.gold} delay={18} dx={50} />
      </div>
      {mt ? <Rise frames={frames} delay={28} style={{alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(245,158,11,.12)', border: `2px solid ${P.gold}`, borderRadius: 18, padding: '14px 26px'}}><Icon k="bolt" size={34} color={P.gold} /><span style={{color: P.gold, fontFamily: F.head, fontWeight: 700, fontSize: box.narrow ? 46 : 40}}>{mt.value}</span><span style={{color: P.text, fontSize: box.narrow ? 30 : 26, fontWeight: 600}}>{mt.label}</span></Rise> : null}
    </div>
  );
};

// 4) Kinetic Statement + Key Points -------------------------------------------------------------
const Kinetic = ({v, frames, box}) => {
  const title = headline(v); const words = title.split(/\s+/); const list = pickList(v, 3); const mt = metrics(v);
  const acc = new Set((Array.isArray(v.accent) ? v.accent : v.accent ? [v.accent] : []).map((a) => String(a).toLowerCase()));
  const size = box.narrow ? fit(title, 112, 64, 1.1) : fit(title, 104, 58, 1.0);
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 34, height: '100%', justifyContent: 'center'}}>
      <Kick v={v} frames={frames} />
      <div style={{display: 'flex', flexWrap: 'wrap', gap: `0 ${Math.round(size * 0.25)}px`, color: P.text, fontFamily: F.head, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.05, fontSize: size}}>
        {words.map((w, i) => (
          <Rise key={i} frames={frames} delay={2 + i * 3} dy={size * 0.5} style={acc.has(w.toLowerCase().replace(/[^a-z0-9$%.]/g, '')) || i === words.length - 1 ? GRAD : {color: P.text}}>{w}</Rise>
        ))}
      </div>
      <div style={{display: 'flex', flexDirection: box.narrow ? 'column' : 'row', gap: 18}}>
        {mt.map((m, i) => (
          <Rise key={'m' + i} frames={frames} delay={14 + i * 6} style={{flex: '1 1 0', minWidth: 0, boxSizing: 'border-box', ...CARD, border: `2px solid ${P.cyan}`, borderRadius: 22, padding: '18px 24px'}}>
            <div style={{color: P.cyan, fontFamily: F.head, fontWeight: 700, fontSize: box.narrow ? 64 : 56, lineHeight: 1}}>{m.value}</div>
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
  const Handle = ({delay}) => <Rise frames={frames} delay={delay} style={{marginTop: 22, color: P.cyan, fontWeight: 800, fontSize: box.narrow ? 34 : 28, letterSpacing: '0.04em'}}>@AIGraphicTV</Rise>;
  const Cta = ({delay}) => <Rise frames={frames} delay={delay} style={{alignSelf: 'flex-start', marginTop: 34, background: P.gold, color: P.bg, fontFamily: F.head, fontWeight: 700, fontSize: box.narrow ? 38 : 32, padding: '16px 36px', borderRadius: 16, maxWidth: '100%', boxSizing: 'border-box'}}>{cta}</Rise>;
  if (variant === 0) {          // recap checklist
    return (
      <div style={{display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center'}}>
        <Rise frames={frames} delay={0} dy={0} style={{marginBottom: 22, alignSelf: 'flex-start'}}><BrandLogo size={box.narrow ? 130 : 120} /></Rise>
        <Kick v={{kicker: v.kicker || 'Recap'}} frames={frames} />
        <Rise frames={frames} delay={3} style={{color: P.text, fontFamily: F.head, fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.025em', fontSize: size}}>{takeaway}</Rise>
        <div style={{marginTop: 28, display: 'flex', flexDirection: 'column', gap: 14}}>
          {list.map((it, i) => <Rise key={i} frames={frames} delay={12 + i * 6} style={{display: 'flex', gap: 16, color: P.text, fontSize: box.narrow ? 36 : 30, fontWeight: 600}}><span style={{color: P.gold, fontFamily: F.head, fontWeight: 700}}>✓</span><span style={{minWidth: 0}}>{it.label}</span></Rise>)}
        </div>
        <Cta delay={22} /><Handle delay={28} />
      </div>
    );
  }
  if (variant === 1) {          // big takeaway panel
    return (
      <div style={{display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'flex-start'}}>
        <Rise frames={frames} delay={0} dy={0} style={{marginBottom: 22, alignSelf: 'flex-start'}}><BrandLogo size={box.narrow ? 130 : 120} /></Rise>
        <Rise frames={frames} delay={2} style={{width: '100%', boxSizing: 'border-box', ...CARD, border: `3px solid ${P.cyan}`, borderRadius: 34, padding: box.narrow ? '48px 44px' : '44px 56px'}}>
          <div style={{color: P.cyan, fontWeight: 800, letterSpacing: '0.2em', fontSize: 24, textTransform: 'uppercase'}}>The takeaway</div>
          <div style={{marginTop: 20, color: P.text, fontFamily: F.head, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.025em', fontSize: size}}>{takeaway}</div>
        </Rise>
        <Cta delay={16} /><Handle delay={22} />
      </div>
    );
  }
  return (                       // next-step card
    <div style={{display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center'}}>
      <Rise frames={frames} delay={0} dy={0} style={{marginBottom: 22, alignSelf: 'flex-start'}}><BrandLogo size={box.narrow ? 130 : 120} /></Rise>
        <Rise frames={frames} delay={2} style={{color: P.gold, fontFamily: F.head, fontWeight: 700, letterSpacing: '0.2em', fontSize: 26, textTransform: 'uppercase'}}>Your next step</Rise>
      <Rise frames={frames} delay={7} style={{marginTop: 18, color: P.text, fontFamily: F.head, fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.025em', fontSize: size}}>{takeaway}</Rise>
      <Rise frames={frames} delay={14} style={{marginTop: 26, width: 160, height: 6, borderRadius: 3, background: P.cyan}} />
      <Cta delay={20} /><Handle delay={26} />
    </div>
  );
};

// 6) Metric / KPI Spotlight --------------------------------------------------------------------
const Metric = ({v, frames, box}) => {
  const mt = metrics(v);
  const hero = mt[0] || {value: clip(String(v.value != null ? v.value : firstNumber(v.title || v.narration) || '✓'), 12), label: clip(v.label || '', 28)};
  const rest = mt.slice(1); const title = headline(v);
  const size = Math.max(80, Math.min(box.narrow ? 190 : 170, (box.w * (box.narrow ? 1 : 0.9)) / Math.max(2.2, hero.value.length * 0.62)));
  return (
    <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 22, height: '100%', minWidth: 0}}>
      <Kick v={v} frames={frames} />
      <Rise frames={frames} delay={2} dy={30} style={{...GRAD, fontFamily: F.head, fontWeight: 700, fontSize: size, lineHeight: 1, letterSpacing: '-0.025em', whiteSpace: 'nowrap'}}>{hero.value}</Rise>
      {hero.label ? <Rise frames={frames} delay={6} style={{color: P.sub, fontSize: box.narrow ? 32 : 26, fontWeight: 600}}>{hero.label}</Rise> : null}
      <Rise frames={frames} delay={8} style={{color: P.text, fontFamily: F.head, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.08, fontSize: box.narrow ? fit(title, 66, 44) : fit(title, 58, 38)}}>{title}</Rise>
      <div style={{display: 'flex', gap: 16, flexWrap: 'wrap'}}>
        {rest.map((m, i) => <Rise key={i} frames={frames} delay={14 + i * 5} style={{...CARD, border: `2px solid ${P.line}`, borderRadius: 18, padding: '12px 22px', boxSizing: 'border-box', maxWidth: '100%'}}><span style={{color: P.cyan, fontFamily: F.head, fontWeight: 700, fontSize: 40}}>{m.value}</span><span style={{color: P.sub, fontSize: 24, marginLeft: 12}}>{m.label}</span></Rise>)}
      </div>
    </div>
  );
};

// 7) Quote / Hook Statement ---------------------------------------------------------------------
const Quote = ({v, frames, box}) => {
  const text = clip(v.quote || v.hook || v.title || v.headline || v.text || sentences(v.narration)[0] || '', 140);
  const by = clip(v.author || v.source || v.sub || '', 50);
  const size = box.narrow ? fit(text, 84, 52, 0.7) : fit(text, 76, 44, 0.6);
  return (
    <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', position: 'relative'}}>
      <Rise frames={frames} delay={0} dy={20} style={{color: P.gold, fontFamily: F.head, fontWeight: 700, fontSize: box.narrow ? 220 : 190, lineHeight: 0.7, height: box.narrow ? 120 : 100}}>“</Rise>
      <Rise frames={frames} delay={6} style={{color: P.text, fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.12, fontSize: size, borderLeft: `6px solid ${P.cyan}`, paddingLeft: 32}}>{text}</Rise>
      {by ? <Rise frames={frames} delay={16} style={{marginTop: 26, paddingLeft: 38, color: P.cyan, fontWeight: 700, fontSize: box.narrow ? 32 : 26, letterSpacing: '0.06em'}}>— {by}</Rise> : null}
    </div>
  );
};

// 8) Visual Card Grid ---------------------------------------------------------------------------
const Grid = ({v, frames, box}) => {
  const list = pickList(v, 6); const title = fixCount(headline(v), list.length);
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 30, height: '100%', justifyContent: 'center'}}>
      <div><Kick v={v} frames={frames} /><Rise frames={frames} delay={3} style={{color: P.text, fontFamily: F.head, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.08, fontSize: box.narrow ? fit(title, 70, 46) : fit(title, 62, 40)}}>{title}</Rise></div>
      <div style={{display: 'grid', gridTemplateColumns: box.narrow ? '1fr' : '1fr 1fr', gap: 20}}>
        {list.map((it, i) => (
          <Rise key={i} frames={frames} delay={6 + i * 5} dy={36} style={{gridColumn: !box.narrow && list.length % 2 === 1 && i === list.length - 1 ? '1 / -1' : 'auto', display: 'flex', gap: 20, alignItems: 'center', minWidth: 0, boxSizing: 'border-box', ...CARD, border: `2px solid ${i % 3 === 2 ? P.gold : P.line}`, borderRadius: 24, padding: '22px 26px', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.08)'}}>
            <div style={{flex: '0 0 auto', width: 64, height: 64, borderRadius: 18, background: i % 3 === 2 ? P.gold : P.cyan, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon k={iconFor(it.label, i)} size={34} /></div>
            <div style={{minWidth: 0}}><div style={{color: P.text, fontWeight: 800, fontSize: box.narrow ? 34 : 28, lineHeight: 1.2}}>{it.label}</div>{it.sub ? <div style={{color: P.sub, fontSize: box.narrow ? 26 : 21, marginTop: 6, lineHeight: 1.3}}>{it.sub}</div> : null}</div>
          </Rise>
        ))}
      </div>
    </div>
  );
};

// ---- content-driven layout planner (deterministic, no adjacent repeats) ----------------------------
const DEFAULT_ROT = ['kinetic', 'split', 'quote', 'grid', 'metric', 'steps', 'compare'];
const candidates = (v) => {
  const o = v && typeof v === 'object' ? v : {};
  if (LAYOUT_NAMES.includes(o.layout)) return [o.layout];
  const txt = `${o.title || ''} ${o.headline || ''} ${o.text || ''} ${o.narration || ''}`.toLowerCase();
  const list = arr(o.bullets || o.items || o.points || o.steps || o.callouts); const c = [];
  if (o.before || o.after || /\b(vs\.?|versus|before|after|instead of|without|compared)\b/.test(txt)) c.push('compare');
  if (arr(o.workflow).length > 1 || arr(o.steps).length > 1 || /\b(step|steps|first|then|next|workflow|pipeline|how to)\b/.test(txt)) c.push(list.length > 3 ? 'steps' : 'split');
  if (metrics(o).length || o.metric || o.value != null || /\d\s?(%|x|×|k\b|hours?|hrs?|min|days?|\$)/.test(txt)) c.push('metric');
  if (o.quote || o.hook || o.type === 'quote' || /\?\s*$/.test(String(o.title || o.text || '').trim())) c.push('quote');
  if (list.length >= 4) c.push('grid'); else if (list.length >= 2) c.push('split', 'grid');
  return c;
};
export const planLayouts = (visuals0, seed = 0) => {
  const visuals = arr(visuals0).map(norm); const out = []; const n = DEFAULT_ROT.length; const s0 = Number.isFinite(seed) ? Math.abs(Math.floor(seed)) : 0;
  arr(visuals).forEach((v, i, all) => {
    if (i === all.length - 1) { out.push('outro'); return; }
    const pool = [...candidates(v), ...DEFAULT_ROT.map((_, k) => DEFAULT_ROT[(s0 + i + k) % n])];
    const prev = out[i - 1]; const prev2 = out[i - 2];
    const pick = pool.find((x) => x !== prev && x !== prev2 && x !== 'outro') || pool.find((x) => x !== prev) || 'kinetic';
    out.push(pick);
  });
  return out;
};

const LAYOUTS = {split: Split, steps: Steps, compare: Compare, kinetic: Kinetic, outro: Outro, metric: Metric, quote: Quote, grid: Grid};

class Boundary extends React.Component {
  constructor(p) { super(p); this.state = {bad: false}; }
  static getDerivedStateFromError() { return {bad: true}; }
  render() {
    if (!this.state.bad) return this.props.children;
    const {box, v} = this.props; const t = clip(headline(v) || 'AI Graphic TV', 60);
    return <div style={{display: 'flex', alignItems: 'center', height: '100%', color: P.text, fontFamily: F.head, fontWeight: 700, fontSize: box.narrow ? 72 : 64, lineHeight: 1.1}}>{t}</div>;
  }
}

// ---- topic-matched graphic planner: content/domain first, never the same graphic on adjacent beats ----
const GR_ROT = ['chart', 'mockup', 'roadmap', 'flow', 'ring', 'beforeafter'];
const graphicPrefs = (v, layout) => {
  const o = v && typeof v === 'object' ? v : {}; const t = txtOf(o); const p = [];
  if (GRAPHIC_KINDS.includes(o.graphic)) return [o.graphic];
  if (layout === 'compare' || o.before || o.after) p.push('beforeafter', 'ring');
  if (arr(o.workflow).length || isTech(o)) p.push('flow');
  if (metrics(o).length || o.metric || /%|\d|grow\w*|revenue|money|profit|roi|sales|income|rise|faster|earn|save/.test(t)) p.push('chart', 'ring');
  if (layout === 'steps' || /roadmap|plan|phase|journey|milestone|timeline|steps?|stage|launch|strategy|path|habits?|routine/.test(t)) p.push('roadmap');
  if (/\b(app|apps|website|site|product|dashboard|template|tool|tools|feature|platform|page|course|guide|software|stack)\b/.test(t)) p.push('mockup');
  if (/problem|pain|mistake|stop|fix|wrong|waste|struggle|tired|quit|fail|vs\b|before/.test(t)) p.push('beforeafter');
  return p;
};
export const planGraphics = (visuals0, layouts, seed = 0) => {
  const visuals = arr(visuals0).map(norm); const out = []; const n = GR_ROT.length; const s0 = Number.isFinite(seed) ? Math.abs(Math.floor(seed)) : 0;
  arr(visuals).forEach((v, i) => {
    if (i === arr(visuals).length - 1) { out.push('ring'); return; }
    const pool = [...graphicPrefs(v, (layouts || [])[i]), ...GR_ROT.map((_, k) => GR_ROT[(s0 + i + k) % n])];
    const prev = out[i - 1]; const prev2 = out[i - 2];
    out.push(pool.find((x) => x !== prev && x !== prev2) || pool.find((x) => x !== prev) || 'chart');
  });
  return out;
};

class Safe extends React.Component {
  constructor(p) { super(p); this.state = {bad: false}; }
  static getDerivedStateFromError() { return {bad: true}; }
  render() { return this.state.bad ? null : this.props.children; }
}

// Props injected by Doc.jsx: layout + graphic (planned names), seed, isLast, t0, narration, frames. Everything is guarded.
export const AutoLayout = (rawProps) => {
  const props = norm(rawProps);
  const box = useBox();
  const frames = Number.isFinite(props.frames) && props.frames > 0 ? props.frames : 60;
  const name = props.isLast ? 'outro' : LAYOUTS[props.layout] ? props.layout : 'kinetic';
  const L = LAYOUTS[name];
  const seed = Number.isFinite(props.seed) ? props.seed : 0;
  const kind = GRAPHIC_KINDS.includes(props.graphic) ? props.graphic : 'chart';
  const iconPath = (l, i) => ICONS[iconFor(l, i)] || ICONS.spark;
  const dense = ['steps', 'grid', 'compare', 'split'].includes(name) || pickList(props, 6).length > 3;
  const t0 = Number.isFinite(props.t0) ? props.t0 : 0;
  let inner;
  if (box.narrow) {
    const gH = dense ? 320 : 460; const sub = {...box, h: box.h - gH - 22};
    inner = (
      <div style={{display: 'flex', flexDirection: 'column', gap: 22, height: '100%'}}>
        <div style={{flex: `0 0 ${gH}px`, display: 'flex', justifyContent: 'center', overflow: 'hidden'}}><Safe><TopicGraphic kind={kind} v={props} w={box.w} h={gH} t0={t0} frames={frames} iconPath={iconPath} /></Safe></div>
        <div style={{flex: '1 1 auto', minHeight: 0, overflow: 'hidden'}}><Boundary box={sub} v={props}><L v={props} frames={frames} box={sub} seed={seed} /></Boundary></div>
      </div>
    );
  } else if (['kinetic', 'quote', 'outro', 'metric'].includes(name)) {
    const gw = Math.round(box.w * 0.4); const gh = Math.min(box.h, 440); const sub = {...box, w: box.w - gw - 56};
    inner = (
      <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 56, height: '100%'}}>
        <div style={{flex: '1 1 auto', minWidth: 0, height: '100%', overflow: 'hidden'}}><Boundary box={sub} v={props}><L v={props} frames={frames} box={sub} seed={seed} /></Boundary></div>
        <div style={{flex: `0 0 ${gw}px`}}><Safe><TopicGraphic kind={kind} v={props} w={gw} h={gh} t0={t0} frames={frames} iconPath={iconPath} /></Safe></div>
      </div>
    );
  } else {
    inner = <Boundary box={box} v={props}><L v={props} frames={frames} box={box} seed={seed} /></Boundary>;
  }
  return <Shell v={props} box={box}>{inner}</Shell>;
};
