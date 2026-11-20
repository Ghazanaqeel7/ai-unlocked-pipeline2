import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {F, tone, resolveTone} from '../../theme.js';
import {prog, ease, fmtNum, lerp} from '../../util.js';
import {GridBg, GlassPanel, AnimatedBar, GaugeArc, MatrixDots, springPop} from '../common.jsx';

// Replaces StatCounter + ComparisonCard with ONE unified schema (the old split caused a real
// schema-mismatch bug in production: StatCounter's `to`/`bar:{max}` vs an author writing `value`/`bar:0.9`
// silently rendered a stuck "0"). `values[].value`/`values[].max` are both REQUIRED and always explicit.
// params:
//   mode   — "gauge" (single value, circular arc 0%->target) | "bars" (2+ values, side-by-side animated
//            comparison bars) | "matrix" (single value, dot-grid ratio)
//   label  — heading shown above the visual
//   values — [{name, value, max, color}] — REQUIRED: value and max as explicit numbers (never a bare
//            fraction like 0.9 — write value:90, max:100 for "90%")
//   sub    — optional one-line caption under the visual
//   polarity — 'dark' (default) | 'light'
export const DataVizCard = ({mode = 'gauge', label, values = [], sub, polarity, tone: tn}) => {
  const f = useCurrentFrame(); const tName = resolveTone(tn, polarity); const t = tone(tName); const {width: w, height: h} = useVideoConfig();
  const narrow = w < 1600;
  const kIn = springPop(f, 0, {damping: 18});

  return (
    <AbsoluteFill>
      <GridBg tn={tName} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div style={{opacity: Math.min(1, kIn * 1.3), transform: `scale(${0.92 + Math.min(1, kIn) * 0.08})`, width: narrow ? '86%' : '64%', maxWidth: narrow ? 900 : 1100}}>
          <GlassPanel radius={28} pad={narrow ? '48px 36px' : '48px 60px'} glow={(values[0] && values[0].color) || t.accent} tn={tName}
            style={{minHeight: narrow ? Math.round(h * 0.52) : undefined, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
            {label && <div style={{fontFamily: F.mono, fontWeight: 700, fontSize: narrow ? 26 : 26, letterSpacing: 5, color: t.sub, textTransform: 'uppercase', marginBottom: 20, textAlign: 'center'}}>{label}</div>}
            {mode === 'bars' && <BarsBody values={values} f={f} narrow={narrow} t={t} />}
            {mode === 'matrix' && <MatrixBody values={values} f={f} narrow={narrow} t={t} />}
            {(mode === 'gauge' || !mode) && <GaugeBody values={values} f={f} narrow={narrow} t={t} />}
            {sub && <div style={{marginTop: 22, fontFamily: F.sans, fontWeight: 600, fontSize: narrow ? 28 : 28, color: t.fg, opacity: prog(f, 44, 16), textAlign: 'center'}}>{sub}</div>}
          </GlassPanel>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const GaugeBody = ({values, f, narrow, t}) => {
  const v = values[0] || {value: 0, max: 100};
  const color = v.color || t.accent;
  const light = t.card === '#FFFFFF';
  const k = prog(f, 6, 54, ease);
  const pct = Math.max(0, Math.min(1, (v.value / (v.max || 1)))) * k;
  const shown = v.value * k;
  // "2x larger hero numbers" (render_guide.md vertical hero-stage-fill rule) — a much bigger gauge +
  // number on the narrow (Shorts) canvas than the old small floating ring.
  const size = narrow ? 340 : 260;
  return (
    <div style={{position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <GaugeArc pct={pct} color={color} size={size} strokeWidth={narrow ? 22 : 18} light={light} />
      <div style={{position: 'absolute', fontFamily: F.display, fontSize: narrow ? 108 : 76, color: t.fg, textShadow: light ? 'none' : `0 0 24px ${color}66`}}>
        {fmtNum(shown, 0)}{v.suffix || '%'}
      </div>
    </div>
  );
};

const BarsBody = ({values, f, narrow, t}) => {
  const light = t.card === '#FFFFFF';
  return (
    <div style={{width: narrow ? 640 : 620}}>
      {values.map((v, i) => (
        <AnimatedBar key={i} name={v.name} value={v.value} max={v.max} color={v.color || (i === 0 ? t.accent : t.accent2 || t.gold || t.accent)} frame={f} i={i} narrow={narrow} startAt={8} light={light} />
      ))}
    </div>
  );
};

const MatrixBody = ({values, f, narrow, t}) => {
  const v = values[0] || {value: 0, max: 100};
  const color = v.color || t.accent;
  const light = t.card === '#FFFFFF';
  const k = prog(f, 8, 50, ease);
  const pct = Math.max(0, Math.min(1, v.value / (v.max || 1))) * k;
  const total = 100; const lit = Math.round(pct * total);
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16}}>
      <MatrixDots cols={10} rows={10} lit={lit} color={color} size={narrow ? 18 : 16} gap={narrow ? 9 : 8} light={light} />
      <div style={{fontFamily: F.display, fontSize: narrow ? 72 : 54, color: t.fg, textShadow: light ? 'none' : '0 2px 10px rgba(0,0,0,.4)'}}>{fmtNum(pct * 100, 0)}{v.suffix || '%'}</div>
    </div>
  );
};
