import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {F, tone} from '../../theme.js';
import {prog, ease} from '../../util.js';
import {GridBg, GlassPanel, springPop, Sfx} from '../common.jsx';

// Step-by-step workflow: glass cards connected by a glowing animated line, each popping in in sequence.
// Horizontal on widescreen, vertical (stacked) automatically on the 9:16 Shorts canvas.
// params:
//   title  — optional heading
//   steps  — [{n, title, sub}] — n defaults to 1-based index if omitted
//   tone
export const StepFlow = ({title, steps = [], tone: tn = 'glass'}) => {
  const f = useCurrentFrame(); const t = tone(tn); const {width: w} = useVideoConfig();
  const vertical = w < 1600;
  const n = Math.max(1, steps.length);
  const gap = vertical ? 28 : 46;
  const cardW = vertical ? 760 : Math.min(460, (1700 - gap * (n - 1)) / n);
  return (
    <AbsoluteFill>
      <GridBg tn={tn} />
      {title && <div style={{position: 'absolute', left: 0, right: 0, top: vertical ? 90 : 110, textAlign: 'center', fontFamily: F.display, fontSize: vertical ? 46 : 64, color: t.fg, textTransform: 'uppercase', opacity: prog(f, 0, 14, ease)}}>{title}</div>}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', paddingTop: title ? (vertical ? 70 : 90) : 0}}>
        <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row', alignItems: vertical ? 'stretch' : 'center', gap}}>
          {steps.map((s, i) => {
            const delay = 8 + i * 14;
            const k = springPop(f, delay, {damping: 16});
            const lineK = prog(f, delay + 6, 14, ease);
            return (
              <React.Fragment key={i}>
                {i > 0 && (
                  vertical
                    ? <div style={{width: 4, height: 36, margin: '0 auto', background: t.accent, opacity: lineK, transform: `scaleY(${lineK})`, transformOrigin: 'top'}} />
                    : <div style={{width: 46, height: 4, background: t.accent, opacity: lineK, transform: `scaleX(${lineK})`, transformOrigin: 'left', boxShadow: `0 0 16px ${t.accent}aa`}} />
                )}
                <div style={{width: cardW, opacity: Math.min(1, k * 1.3), transform: `translateY(${(1 - Math.min(1, k)) * 30}px) scale(${0.94 + Math.min(1, k) * 0.06})`}}>
                  <GlassPanel radius={22} pad={vertical ? '22px 26px' : '28px 30px'} glow={t.accent}>
                    <div style={{display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10}}>
                      <div style={{width: 40, height: 40, borderRadius: 20, background: t.accent, color: '#071018', fontFamily: F.display, fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto'}}>{s.n ?? i + 1}</div>
                      <div style={{fontFamily: F.sans, fontWeight: 700, fontSize: vertical ? 26 : 28, color: t.fg}}>{s.title}</div>
                    </div>
                    {s.sub && <div style={{fontFamily: F.sans, fontSize: vertical ? 20 : 21, color: t.sub, lineHeight: 1.35}}>{s.sub}</div>}
                  </GlassPanel>
                </div>
                <Sfx type="pop" at={delay} volume={0.3} />
              </React.Fragment>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
