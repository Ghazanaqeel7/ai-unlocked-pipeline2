import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {F, tone} from '../../theme.js';
import {prog, ease, fmtNum, lerp} from '../../util.js';
import {GridBg, GlassPanel, springPop} from '../common.jsx';

// Big number counting up inside a glass card, with an optional progress bar (for percentages/benchmarks)
// instead of Stat.jsx's icon-swarm/mini-store treatment. Use for pricing, speed, token counts, benchmark %s.
// params:
//   from, to, prefix, suffix, decimals, label, sub
//   bar      — if true (or a {max} object), draws a progress bar under the number filling toward `to`/max
//   color    — 'accent' | 'accent2' | 'gold' | hex string
//   tone
export const StatCounter = ({from = 0, to = 0, prefix = '', suffix = '', decimals = 0, label, sub, bar, color = 'accent', tone: tn = 'glass'}) => {
  const f = useCurrentFrame(); const t = tone(tn); const {width: w} = useVideoConfig();
  const narrow = w < 1600;
  const k = prog(f, 6, 54, ease); const v = lerp(from, to, k);
  const col = color === 'accent2' ? (t.accent2 || t.accent) : color === 'gold' ? (t.gold || t.accent) : color.startsWith('#') ? color : t.accent;
  const kIn = springPop(f, 0, {damping: 18});
  const barMax = bar && typeof bar === 'object' ? bar.max : Math.max(Math.abs(to), 1);
  const barPct = bar ? Math.min(100, (Math.abs(v) / barMax) * 100) : 0;
  return (
    <AbsoluteFill>
      <GridBg tn={tn} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div style={{opacity: Math.min(1, kIn * 1.3), transform: `scale(${0.9 + Math.min(1, kIn) * 0.1})`}}>
          <GlassPanel radius={30} pad={narrow ? '40px 44px' : '56px 86px'} glow={col}>
            {label && <div style={{fontFamily: F.mono, fontWeight: 700, fontSize: narrow ? 24 : 32, letterSpacing: 6, color: t.sub, textTransform: 'uppercase', marginBottom: 14, textAlign: 'center'}}>{label}</div>}
            <div style={{fontFamily: F.display, fontSize: narrow ? 140 : 220, lineHeight: 1, letterSpacing: 1, textAlign: 'center', background: `linear-gradient(180deg, #fff 0%, ${col} 75%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: `drop-shadow(0 0 30px ${col}55)`}}>{prefix}{fmtNum(v, decimals)}{suffix}</div>
            {bar && (
              <div style={{width: narrow ? 420 : 640, height: 14, borderRadius: 7, background: 'rgba(255,255,255,.08)', marginTop: 24, overflow: 'hidden'}}>
                <div style={{height: '100%', width: `${barPct}%`, background: `linear-gradient(90deg, ${col}aa, ${col})`, borderRadius: 7}} />
              </div>
            )}
            {sub && <div style={{marginTop: 20, fontFamily: F.sans, fontWeight: 600, fontSize: narrow ? 26 : 36, color: t.fg, opacity: prog(f, 44, 16), textAlign: 'center', maxWidth: narrow ? 460 : 760}}>{sub}</div>}
          </GlassPanel>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
