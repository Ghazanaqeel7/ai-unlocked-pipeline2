import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {F, tone, studioTheme} from '../../theme.js';
import {prog, ease} from '../../util.js';
import {StudioBg, StudioCard} from '../common.jsx';
import {StudioHeadline} from './StudioHeadline.jsx';

// `RetentionGraph`: an animated SVG line/curve chart with pulsing problem callouts (e.g. "people stop
// here • 0:02", "<- fix the hook here") and a green-vs-red comparison curve (good retention vs. a
// flop). Hand-sketched-chart energy from the reference videos, built as crisp vector SVG.
// params:
//   headline, kicker, accent
//   good — [0..1][] (retention curve, 0-100 scale assumed) — the "fixed hook" line, rendered in green
//   bad  — [0..1][] (optional second line) — the "old way" flop line, rendered in red/sub color
//   callouts — [{pct, label}] — pct = 0..1 position along the x-axis where a pulsing marker + label sits
//   theme
export const RetentionGraph = ({kicker, headline, accent = [], good = [], bad = [], callouts = [], theme}) => {
  const f = useCurrentFrame(); const tn = studioTheme(theme); const t = tone(tn); const {width: w, height: h} = useVideoConfig();
  const narrow = w < 1600;
  const cardH = Math.round(h * 0.5); // full-bleed stage (style_reference.md fix #2: 42-55% vh)
  const W = 900, H = 420, PAD = 40;
  const drawK = prog(f, 20, 55, ease);
  const toPath = (series) => {
    if (!series.length) return '';
    return series.map((v, i) => {
      const x = PAD + (i / (series.length - 1)) * (W - PAD * 2);
      const y = PAD + (1 - v) * (H - PAD * 2);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  };
  const goodD = toPath(good); const badD = toPath(bad);

  return (
    <AbsoluteFill>
      <StudioBg tn={tn} />
      <AbsoluteFill style={{flexDirection: 'column', alignItems: 'center', paddingTop: '12%', gap: narrow ? 26 : 30}}>
        {headline && <StudioHeadline text={headline} accent={accent} kicker={kicker} theme={tn} />}
        <StudioCard radius={24} pad={narrow ? '28px 24px' : '36px 46px'} tn={tn} glow={t.accent} style={{width: '88%', minHeight: cardH, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={Math.round(cardH * 0.62)}>
            {/* axis */}
            <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke={t.line} strokeWidth="2" />
            <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke={t.line} strokeWidth="2" />
            {badD && (
              <path d={badD} fill="none" stroke="#f0506e" strokeWidth="5"
                strokeDasharray={1400} strokeDashoffset={1400 * (1 - drawK)} opacity={0.85} />
            )}
            {goodD && (
              <path d={goodD} fill="none" stroke={t.accent} strokeWidth="6" strokeLinecap="round"
                strokeDasharray={1400} strokeDashoffset={1400 * (1 - drawK)}
                style={{filter: `drop-shadow(0 0 10px ${t.accent}88)`}} />
            )}
            {callouts.map((c, i) => {
              const x = PAD + c.pct * (W - PAD * 2);
              const series = good.length ? good : bad;
              const idx = Math.round(c.pct * (series.length - 1));
              const y = PAD + (1 - (series[idx] ?? 0.5)) * (H - PAD * 2);
              const k = prog(f, 40 + i * 10, 14, ease);
              const pulse = 0.7 + Math.sin(f / 7 + i) * 0.3;
              return (
                <g key={i} opacity={k}>
                  <circle cx={x} cy={y} r={7 + pulse * 3} fill="none" stroke="#f0506e" strokeWidth="2" opacity={pulse} />
                  <circle cx={x} cy={y} r={6} fill="#f0506e" />
                </g>
              );
            })}
          </svg>
          <div style={{display: 'flex', flexDirection: 'column', gap: 16, marginTop: 18}}>
            {callouts.map((c, i) => {
              const k = prog(f, 44 + i * 10, 14, ease);
              return (
                <div key={i} style={{opacity: k, display: 'flex', alignItems: 'center', gap: 12, transform: `translateX(${(1 - k) * -12}px)`}}>
                  <div style={{width: 14, height: 14, borderRadius: '50%', background: '#f0506e', flex: '0 0 auto'}} />
                  <div style={{fontFamily: F.sans, fontWeight: 700, fontSize: narrow ? 28 : 24, color: t.fg}}>{c.label}</div>
                </div>
              );
            })}
          </div>
        </StudioCard>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
