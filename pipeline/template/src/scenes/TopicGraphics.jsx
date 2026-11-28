import React from 'react';
import {useCurrentFrame, useVideoConfig, spring, interpolate} from 'remotion';

// ---------------------------------------------------------------------------------------------
// TopicGraphics — animated SVG graphic modules that sit next to the wording on every AutoLayout beat.
// chart (rising bars + spline + counter) · ring (radial progress) · flow (node path + traveling pulses)
// beforeafter (red problem vs cyan/gold solution) · mockup (mini app window + feature tiles + cursor)
// roadmap (milestone track). Everything is guarded: missing data falls back to neutral, non-numeric visuals.
// Palette: navy #040B16/#081324, cyan #38BDF8, gold #F59E0B, red-accent #F87171 for "problem" only.
// ---------------------------------------------------------------------------------------------
const C = {bg: '#040B16', bg2: '#081324', cyan: '#38BDF8', gold: '#F59E0B', red: '#F87171', text: '#E8EEF7', sub: '#9FB0C8', line: 'rgba(56,189,248,.22)'};
export const GRAPHIC_KINDS = ['chart', 'ring', 'flow', 'beforeafter', 'mockup', 'roadmap'];

const HEAD = '"Space Grotesk", Inter, Arial, sans-serif';
const arr = (x) => (Array.isArray(x) ? x : []);
const txt = (x) => (typeof x === 'string' ? x : typeof x === 'number' ? String(x) : x && typeof x === 'object' ? String(x.text || x.label || x.title || x.name || '') : '');
const clip = (s, n) => { s = String(s || '').trim(); return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s; };
const sm = (f, delay, d = {damping: 24, stiffness: 150, mass: 0.9}, fps = 30) => Math.min(1, Math.max(0, spring({frame: f - delay, fps, config: d})));
const labelsOf = (v, max, len = 14) => {
  const raw = arr(v.workflow).length ? arr(v.workflow) : arr(v.steps).length ? arr(v.steps) : arr(v.bullets || v.items || v.points || v.callouts);
  return raw.map((x) => clip(txt(x), len)).filter(Boolean).slice(0, max);
};
const parseNum = (s) => {
  const m = String(s == null ? '' : s).match(/^([^\d-]*)(-?\d[\d,]*\.?\d*)(.*)$/);
  if (!m) return null; const n = parseFloat(m[2].replace(/,/g, '')); return Number.isFinite(n) ? {pre: m[1] || '', n, suf: m[3] || ''} : null;
};
const firstMetric = (v) => {
  const ms = arr(v.metrics).filter((m) => m && typeof m === 'object' && (m.value != null || m.v != null));
  const raw = ms.length ? (ms[0].value != null ? ms[0].value : ms[0].v) : v.metric && typeof v.metric === 'object' ? v.metric.value : v.metric != null ? v.metric : v.value;
  const label = ms.length ? ms[0].label || ms[0].l || '' : v.metric && typeof v.metric === 'object' ? v.metric.label || '' : '';
  const p = parseNum(raw); return p ? {...p, label: clip(label, 22)} : null;
};
const fmt = (p, t) => { const val = p.n * t; const dec = String(p.n).includes('.') ? 1 : 0; return `${p.pre}${val.toLocaleString('en-US', {minimumFractionDigits: dec, maximumFractionDigits: dec})}${p.suf}`; };

const Icon = ({d, x, y, size, color, sw = 2.2}) => (
  <g transform={`translate(${x - size / 2} ${y - size / 2}) scale(${size / 24})`}><path d={d} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /></g>
);
const CHECK = 'M5 13l4 4L19 7'; const CROSS = 'M6 6l12 12M18 6L6 18';

const Frame = ({w, h, id, children, op = 1}) => (
  <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{display: 'block', overflow: 'hidden', opacity: op}}>
    <defs>
      <linearGradient id={id + 'p'} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#10223C" stopOpacity=".92" /><stop offset="1" stopColor="#081324" stopOpacity=".9" /></linearGradient>
      <linearGradient id={id + 'l'} x1="0" x2="1"><stop offset="0" stopColor={C.cyan} /><stop offset="1" stopColor={C.gold} /></linearGradient>
      <filter id={id + 'g'} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
    </defs>
    <rect x="2" y="2" width={w - 4} height={h - 4} rx="26" fill={`url(#${id}p)`} stroke={C.line} strokeWidth="2" />
    <rect x="3" y="3" width={w - 6} height="2" rx="1" fill="rgba(255,255,255,.12)" />
    {children}
  </svg>
);

// 1) Rising bars + spline + animated counter --------------------------------------------------------
const Chart = ({v, w, h, f}) => {
  const id = 'gc'; const pad = 34; const m = firstMetric(v); const top = m ? 104 : 46; const cw = w - pad * 2; const ch = h - top - pad;
  const ramp = [0.22, 0.34, 0.3, 0.5, 0.62, 0.78, 0.96]; const n = ramp.length; const bw = cw / n;
  const pts = ramp.map((r, i) => [pad + bw * i + bw / 2, top + ch - r * ch * sm(f, 4 + i * 3)]);
  let d = `M${pts[0][0]} ${pts[0][1]}`; for (let i = 1; i < n; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; d += ` C${(x0 + x1) / 2} ${y0} ${(x0 + x1) / 2} ${y1} ${x1} ${y1}`; }
  const draw = sm(f, 6, {damping: 30, stiffness: 60, mass: 1});
  const last = pts[n - 1];
  return (
    <Frame w={w} h={h} id={id}>
      {[0.25, 0.5, 0.75].map((k) => <line key={k} x1={pad} x2={w - pad} y1={top + ch * k} y2={top + ch * k} stroke="rgba(56,189,248,.12)" strokeDasharray="4 8" />)}
      {ramp.map((r, i) => <rect key={i} x={pad + bw * i + bw * 0.2} width={bw * 0.6} rx="8" y={top + ch - r * ch * sm(f, 4 + i * 3)} height={r * ch * sm(f, 4 + i * 3)} fill={i === n - 1 ? C.gold : C.cyan} opacity={i === n - 1 ? 0.9 : 0.28 + i * 0.06} />)}
      <path d={d} pathLength="1" strokeDasharray="1" strokeDashoffset={1 - draw} fill="none" stroke={`url(#${id}l)`} strokeWidth="6" strokeLinecap="round" filter={`url(#${id}g)`} />
      <circle cx={last[0]} cy={last[1]} r={9 + Math.sin(f * 0.2) * 2} fill={C.gold} opacity={draw > 0.9 ? 1 : 0} filter={`url(#${id}g)`} />
      {m ? <text x={pad} y={78} fill={C.gold} fontSize="64" fontWeight="700" fontFamily={HEAD} letterSpacing="-1">{fmt(m, sm(f, 2, {damping: 30, stiffness: 70, mass: 1}))}</text> : null}
      {m && m.label ? <text x={w - pad} y={76} textAnchor="end" fill={C.sub} fontSize="26" fontWeight="600" fontFamily="Inter, Arial, sans-serif">{m.label}</text> : null}
    </Frame>
  );
};

// 2) Radial progress ring + counter ---------------------------------------------------------------------
const Ring = ({v, w, h, f}) => {
  const m = firstMetric(v); const r = Math.min(w, h) * 0.3; const cx = w / 2; const cy = h / 2 - 6; const circ = 2 * Math.PI * r;
  const pct = m && /%/.test(m.suf) ? Math.min(0.98, Math.abs(m.n) / 100) : 0.82; const p = sm(f, 3, {damping: 30, stiffness: 55, mass: 1});
  const a = f * 0.045;
  return (
    <Frame w={w} h={h} id="gr">
      {Array.from({length: 48}).map((_, i) => { const t = (i / 48) * Math.PI * 2; return <line key={i} x1={cx + Math.cos(t) * (r + 26)} y1={cy + Math.sin(t) * (r + 26)} x2={cx + Math.cos(t) * (r + (i % 4 ? 32 : 40))} y2={cy + Math.sin(t) * (r + (i % 4 ? 32 : 40))} stroke={i / 48 < pct * p ? C.cyan : 'rgba(56,189,248,.16)'} strokeWidth="2" />; })}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(56,189,248,.14)" strokeWidth="16" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="url(#grl)" strokeWidth="16" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - pct * p)} transform={`rotate(-90 ${cx} ${cy})`} filter="url(#grg)" />
      <circle cx={cx + Math.cos(a) * (r - 28)} cy={cy + Math.sin(a) * (r - 28)} r="6" fill={C.gold} opacity=".9" />
      {m ? <text x={cx} y={cy + 20} textAnchor="middle" fill={C.text} fontSize={Math.round(r * 0.62)} fontWeight="700" fontFamily={HEAD}>{fmt(m, sm(f, 2, {damping: 30, stiffness: 70, mass: 1}))}</text>
        : <g><Icon d={CHECK} x={cx} y={cy} size={r * 0.8} color={C.gold} sw={2.6} /></g>}
      {m && m.label ? <text x={cx} y={cy + r * 0.55 + 14} textAnchor="middle" fill={C.sub} fontSize="24" fontWeight="600" fontFamily="Inter, Arial, sans-serif">{m.label}</text> : null}
    </Frame>
  );
};

// 3) Connected node path with traveling light pulses + status pill ------------------------------------
const Flow = ({v, w, h, f, iconPath}) => {
  const labels = labelsOf(v, 4, 12); const N = Math.max(3, labels.length); const L = labels.length ? labels : ['Start', 'Process', 'Result'];
  while (L.length < N) L.push('Step ' + (L.length + 1));
  const pad = 46; const nw = Math.min(190, (w - pad * 2) / N - 18); const nh = 92;
  const P = L.map((_, i) => [pad + nw / 2 + ((w - pad * 2 - nw) / (N - 1)) * i, h / 2 + (i % 2 ? 54 : -54) * (h > 300 ? 1 : 0.4)]);
  const seg = (i, t) => { const [x0, y0] = P[i], [x1, y1] = P[i + 1]; const mx = (x0 + x1) / 2; const u = 1 - t; return [u ** 3 * x0 + 3 * u * u * t * mx + 3 * u * t * t * mx + t ** 3 * x1, u ** 3 * y0 + 3 * u * u * t * y0 + 3 * u * t * t * y1 + t ** 3 * y1]; };
  let d = `M${P[0][0]} ${P[0][1]}`; for (let i = 1; i < N; i++) { const [x0, y0] = P[i - 1], [x1, y1] = P[i]; d += ` C${(x0 + x1) / 2} ${y0} ${(x0 + x1) / 2} ${y1} ${x1} ${y1}`; }
  const u = ((f * 0.045) % (N - 1)); const pulses = [u, (u + (N - 1) / 2) % (N - 1)].map((q) => seg(Math.min(N - 2, Math.floor(q)), q % 1));
  const active = Math.min(N - 1, Math.floor(u) + 1); const pill = clip(typeof v.gate === 'string' ? v.gate : v.verified ? 'Verified' : 'Live', 14);
  const draw = sm(f, 2, {damping: 30, stiffness: 60, mass: 1});
  return (
    <Frame w={w} h={h} id="gf">
      <path d={d} fill="none" stroke="rgba(56,189,248,.25)" strokeWidth="5" strokeLinecap="round" />
      <path d={d} pathLength="1" strokeDasharray="1" strokeDashoffset={1 - draw} fill="none" stroke="url(#gfl)" strokeWidth="5" strokeLinecap="round" />
      {pulses.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="9" fill={i ? C.cyan : C.gold} filter="url(#gfg)" />)}
      {P.map(([x, y], i) => {
        const on = i <= active && draw > 0.6; const s = sm(f, 6 + i * 5);
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${0.85 + 0.15 * s})`} opacity={s}>
            <rect x={-nw / 2} y={-nh / 2} width={nw} height={nh} rx="20" fill="#0A1A30" stroke={on ? (i === N - 1 ? C.gold : C.cyan) : C.line} strokeWidth="3" />
            <Icon d={iconPath(L[i], i)} x={-nw / 2 + 34} y={0} size={34} color={i === N - 1 ? C.gold : C.cyan} />
            <text x={-nw / 2 + 62} y={9} fill={C.text} fontSize="24" fontWeight="700" fontFamily="Inter, Arial, sans-serif">{L[i]}</text>
            {i === N - 1 ? <g transform={`translate(0 ${nh / 2 + 22})`}><rect x="-52" y="-16" width="104" height="32" rx="16" fill="rgba(245,158,11,.16)" stroke={C.gold} strokeWidth="2" /><text x="0" y="7" textAnchor="middle" fill={C.gold} fontSize="20" fontWeight="800" fontFamily="Inter, Arial, sans-serif">{pill}</text></g> : null}
          </g>
        );
      })}
    </Frame>
  );
};

// 4) Problem (red) vs solution (cyan/gold) ----------------------------------------------------------------
const BeforeAfter = ({v, w, h, f}) => {
  const gap = 56; const pw = (w - 68 - gap) / 2; const ph = h - 68; const y0 = 34;
  const bl = clip(txt(v.before && v.before.label) || 'Before', 12), al = clip(txt(v.after && v.after.label) || 'After', 12);
  const sL = sm(f, 2), sR = sm(f, 12); const draw = sm(f, 14, {damping: 30, stiffness: 60, mass: 1});
  const jag = Array.from({length: 9}).map((_, i) => [i / 8 * (pw - 60) + 30, ph * 0.62 + (i % 2 ? -1 : 1) * (14 + (i * 7) % 18) + i * 1.5]);
  const up = Array.from({length: 9}).map((_, i) => [i / 8 * (pw - 60) + 30, ph * 0.74 - (i / 8) ** 1.2 * ph * 0.42]);
  const pl = (a) => a.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ');
  return (
    <Frame w={w} h={h} id="gb">
      <g transform={`translate(34 ${y0})`} opacity={sL}>
        <rect width={pw} height={ph} rx="20" fill="rgba(248,113,113,.06)" stroke={C.red} strokeWidth="3" />
        <circle cx="52" cy="52" r="28" fill="rgba(248,113,113,.16)" /><Icon d={CROSS} x={52} y={52} size={26} color={C.red} sw={3} />
        <text x="96" y="62" fill={C.red} fontSize="28" fontWeight="900" letterSpacing="3" fontFamily="Inter, Arial, sans-serif">{bl.toUpperCase()}</text>
        <path d={pl(jag)} fill="none" stroke={C.red} strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" opacity=".75" />
        {[0.3, 0.55, 0.4].map((r, i) => <rect key={i} x={30 + i * 70} y={ph - 34 - r * 80} width="46" height={r * 80} rx="7" fill={C.red} opacity=".28" />)}
      </g>
      <g transform={`translate(${34 + pw + gap} ${y0})`} opacity={sR}>
        <rect width={pw} height={ph} rx="20" fill="rgba(56,189,248,.07)" stroke="url(#gbl)" strokeWidth="3.5" filter="url(#gbg)" />
        <circle cx="52" cy="52" r="28" fill="rgba(245,158,11,.18)" /><Icon d={CHECK} x={52} y={52} size={28} color={C.gold} sw={3} />
        <text x="96" y="62" fill={C.gold} fontSize="28" fontWeight="900" letterSpacing="3" fontFamily="Inter, Arial, sans-serif">{al.toUpperCase()}</text>
        <path d={pl(up)} pathLength="1" strokeDasharray="1" strokeDashoffset={1 - draw} fill="none" stroke="url(#gbl)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" filter="url(#gbg)" />
        {[0.3, 0.55, 0.9].map((r, i) => <rect key={i} x={30 + i * 70} y={ph - 34 - r * 80 * draw} width="46" height={r * 80 * draw} rx="7" fill={i === 2 ? C.gold : C.cyan} opacity=".7" />)}
      </g>
      <g transform={`translate(${34 + pw + gap / 2} ${h / 2})`}><circle r="22" fill={C.bg} stroke={C.gold} strokeWidth="3" /><path d="M-8 0h14M1 -8l8 8-8 8" fill="none" stroke={C.gold} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" transform={`translate(${Math.sin(f * 0.2) * 2} 0)`} /></g>
    </Frame>
  );
};

// 5) Mini app window with feature tiles and a clicking cursor -----------------------------------------
const Mockup = ({v, w, h, f, iconPath}) => {
  const labels = labelsOf(v, 3, 14); const L = labels.length >= 2 ? labels : ['Core', 'Smart', 'Fast']; const N = L.length;
  const wx = 30, wy = 30, ww = w - 60, wh = h - 60; const tileW = (ww - 40 - 16 * (N - 1)) / N; const ty = wy + 118; const th = wh - 118 - 24;
  const sw = sm(f, 1); const cyc = (f * 0.03) % N; const hi = Math.floor(cyc); const ct = cyc % 1;
  const tx = (i) => wx + 20 + i * (tileW + 16) + tileW * 0.55; const ny = Math.floor(cyc + 1) % N;
  const cx = tx(hi) + (tx(ny) - tx(hi)) * Math.min(1, ct * 1.6); const cy = ty + th * 0.62;
  return (
    <Frame w={w} h={h} id="gm">
      <g opacity={sw} transform={`translate(0 ${(1 - sw) * 24})`}>
        <rect x={wx} y={wy} width={ww} height={wh} rx="18" fill="#0A1A30" stroke="url(#gml)" strokeWidth="2.5" />
        <rect x={wx} y={wy} width={ww} height="44" rx="18" fill="rgba(56,189,248,.10)" />
        {[0, 1, 2].map((i) => <circle key={i} cx={wx + 26 + i * 22} cy={wy + 22} r="6" fill={[C.red, C.gold, C.cyan][i]} opacity=".85" />)}
        <rect x={wx + 120} y={wy + 12} width={ww - 240} height="20" rx="10" fill="rgba(255,255,255,.07)" />
        <rect x={wx + 20} y={wy + 58} width={ww * 0.46} height="22" rx="11" fill="url(#gml)" opacity=".9" />
        <rect x={wx + 20} y={wy + 90} width={ww * 0.3} height="10" rx="5" fill="rgba(255,255,255,.14)" />
        {L.map((t, i) => {
          const on = i === hi && ct > 0.55; return (
            <g key={i} transform={`translate(${wx + 20 + i * (tileW + 16)} ${ty})`}>
              <rect width={tileW} height={th} rx="16" fill={on ? 'rgba(245,158,11,.12)' : 'rgba(56,189,248,.06)'} stroke={on ? C.gold : C.line} strokeWidth="2.5" />
              <circle cx={tileW / 2} cy={th * 0.34} r="26" fill={on ? 'rgba(245,158,11,.2)' : 'rgba(56,189,248,.16)'} />
              <Icon d={iconPath(t, i)} x={tileW / 2} y={th * 0.34} size={28} color={on ? C.gold : C.cyan} />
              <text x={tileW / 2} y={th * 0.72} textAnchor="middle" fill={C.text} fontSize="20" fontWeight="700" fontFamily="Inter, Arial, sans-serif">{t}</text>
              {on ? <circle cx={tileW / 2} cy={th * 0.34} r={26 + (ct - 0.55) * 90} fill="none" stroke={C.gold} strokeWidth="2" opacity={1 - (ct - 0.55) * 2.2} /> : null}
            </g>
          );
        })}
        <path d={`M${cx} ${cy}l0 26l7 -6l5 11l5 -2l-5 -11l9 0z`} fill={C.text} stroke={C.bg} strokeWidth="1.5" />
      </g>
    </Frame>
  );
};

// 6) Milestone roadmap track ------------------------------------------------------------------------------
const Roadmap = ({v, w, h, f, iconPath}) => {
  const labels = labelsOf(v, 5, 12); const L = labels.length >= 3 ? labels : ['Start', 'Build', 'Grow', 'Win']; const N = L.length;
  const pad = 70; const y = h * 0.46; const xs = L.map((_, i) => pad + ((w - pad * 2) / (N - 1)) * i);
  const prog = sm(f, 2, {damping: 34, stiffness: 40, mass: 1.1}) * (N - 1); const pulse = (f * 0.05) % (N - 1);
  return (
    <Frame w={w} h={h} id="gr2">
      <line x1={xs[0]} x2={xs[N - 1]} y1={y} y2={y} stroke="rgba(56,189,248,.22)" strokeWidth="8" strokeLinecap="round" />
      <line x1={xs[0]} x2={xs[0] + (xs[N - 1] - xs[0]) * (prog / (N - 1))} y1={y} y2={y} stroke="url(#gr2l)" strokeWidth="8" strokeLinecap="round" filter="url(#gr2g)" />
      <circle cx={xs[0] + (xs[N - 1] - xs[0]) * (pulse / (N - 1))} cy={y} r="9" fill={C.gold} filter="url(#gr2g)" opacity={prog > N - 1.2 ? 1 : 0} />
      {xs.map((x, i) => {
        const on = prog >= i - 0.02; const last = i === N - 1; const s = sm(f, 4 + i * 5); const col = last ? C.gold : C.cyan;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${0.6 + 0.4 * s})`} opacity={s}>
            <circle r="34" fill={C.bg2} stroke={on ? col : C.line} strokeWidth="4" filter={on ? 'url(#gr2g)' : undefined} />
            <Icon d={last ? CHECK : iconPath(L[i], i)} x={0} y={0} size={30} color={on ? col : C.sub} sw={2.4} />
            <text x="0" y={i % 2 ? -52 : 70} textAnchor="middle" fill={on ? C.text : C.sub} fontSize="24" fontWeight="700" fontFamily="Inter, Arial, sans-serif">{L[i]}</text>
          </g>
        );
      })}
    </Frame>
  );
};

const MODS = {chart: Chart, ring: Ring, flow: Flow, beforeafter: BeforeAfter, mockup: Mockup, roadmap: Roadmap};

// Public component. `kind` chosen by planGraphics (AutoLayout.jsx); `t0` keeps loops continuous across beats.
export const TopicGraphic = ({kind, v, w, h, t0 = 0, frames, iconPath}) => {
  const lf = useCurrentFrame(); const {fps} = useVideoConfig();
  const M = MODS[kind] || Chart; const W = Math.max(240, Math.round(w || 800)); const H = Math.max(180, Math.round(h || 360));
  const exit = frames ? interpolate(lf, [frames - 6, frames], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1;
  const enter = Math.min(1, lf / 5);
  const safeIcon = typeof iconPath === 'function' ? iconPath : () => 'M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z';
  return (
    <div style={{width: W, height: H, opacity: Math.min(enter, exit), transform: `translateY(${(1 - enter) * 22}px)`, overflow: 'hidden', borderRadius: 26, boxShadow: '0 22px 50px rgba(0,0,0,.4), 0 0 40px rgba(56,189,248,.08)'}}>
      <M v={v || {}} w={W} h={H} f={lf + 0 * fps} iconPath={safeIcon} />
    </div>
  );
};
