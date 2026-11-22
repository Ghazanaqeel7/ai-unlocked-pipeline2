import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {TrendingUp} from 'lucide-react';
import {F, tone, resolveTone} from '../theme.js';
import {prog, ease, rnd} from '../util.js';
import {GridBg, GlassPanel} from '../scenes/common.jsx';

// Bespoke live-watchlist candlestick chart for 903-claude-trading-desk-short: deterministic (per
// render_guide.md "no Math.random") pseudo-price series drawn as inline SVG candles revealing
// left-to-right, inside a dense glass card that fills the vertical hero stage — never a blank window.
const N = 18;
const candles = Array.from({length: N}, (_, i) => {
  const base = 100 + Math.sin(i / 2.3) * 14 + (rnd(`c${i}`) - 0.5) * 10;
  const o = base + (rnd(`o${i}`) - 0.5) * 6;
  const c = base + (rnd(`cl${i}`) - 0.5) * 6;
  const hi = Math.max(o, c) + rnd(`h${i}`) * 5;
  const lo = Math.min(o, c) - rnd(`l${i}`) * 5;
  return {o, c, hi, lo};
});
const MIN = Math.min(...candles.map((c) => c.lo)), MAX = Math.max(...candles.map((c) => c.hi));

export const CandleChart = ({polarity, tone: tn}) => {
  const f = useCurrentFrame(); const tName = resolveTone(tn, polarity); const t = tone(tName);
  const {width: w} = useVideoConfig(); const narrow = w < 1600;
  const chartW = narrow ? 820 : 760, chartH = narrow ? 420 : 320;
  const cw = chartW / N;
  const yOf = (v) => chartH - ((v - MIN) / (MAX - MIN)) * chartH;
  const revealed = Math.floor(prog(f, 6, 54, ease) * N);
  return (
    <>
      <GridBg tn={tName} />
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: narrow ? 28 : 20}}>
        <GlassPanel radius={24} pad={narrow ? '30px 24px' : '24px 28px'} glow={t.accent} tn={tName}
          style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
            <TrendingUp size={narrow ? 30 : 24} color={t.accent} strokeWidth={2.3} />
            <div style={{fontFamily: F.mono, fontWeight: 700, fontSize: narrow ? 22 : 17, color: t.fg, letterSpacing: 1}}>WATCHLIST · LIVE</div>
          </div>
          <svg width={chartW} height={chartH}>
            {candles.map((c, i) => {
              if (i > revealed) return null;
              const up = c.c >= c.o;
              const color = up ? '#34d399' : '#f0506e';
              const x = i * cw + cw * 0.5;
              const bodyTop = yOf(Math.max(c.o, c.c)), bodyBot = yOf(Math.min(c.o, c.c));
              const localK = prog(f, 6 + i * (54 / N), 10, ease);
              return (
                <g key={i} style={{opacity: localK}}>
                  <line x1={x} x2={x} y1={yOf(c.hi)} y2={yOf(c.lo)} stroke={color} strokeWidth={2} />
                  <rect x={x - cw * 0.3} y={bodyTop} width={cw * 0.6} height={Math.max(2, bodyBot - bodyTop)} fill={color} rx={2} />
                </g>
              );
            })}
          </svg>
        </GlassPanel>
        <div style={{opacity: prog(f, 30, 16, ease), fontFamily: F.sans, fontWeight: 700, fontSize: narrow ? 30 : 22, color: t.sub, textAlign: 'center', maxWidth: '82%'}}>
          Scanning the watchlist in real time.
        </div>
      </div>
    </>
  );
};
