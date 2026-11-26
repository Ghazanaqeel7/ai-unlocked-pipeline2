import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {F, tone, studioTheme} from '../../theme.js';
import {prog, ease, rnd} from '../../util.js';
import {StudioBg, StudioCard, ToolGlyph} from '../common.jsx';
import {StudioHeadline} from './StudioHeadline.jsx';

// `PerspectiveWall`: a 3D-tilted multi-card showcase wall (15-30 thumbnail/tool cards) that drifts
// and zooms smoothly — the "calendar grid" / "content wall" beat from the reference videos.
// params:
//   kicker, headline, accent
//   cards — [{label, sub, glyph, color}] (12-30 entries recommended)
//   theme
export const PerspectiveWall = ({kicker, headline, accent = [], cards = [], theme}) => {
  const f = useCurrentFrame(); const tn = studioTheme(theme); const t = tone(tn); const {width: w} = useVideoConfig();
  const narrow = w < 1600;
  const cols = narrow ? 3 : 6;
  const drift = f * 0.15;

  return (
    <AbsoluteFill>
      <StudioBg tn={tn} />
      <AbsoluteFill style={{flexDirection: 'column', alignItems: 'center', paddingTop: '12%', overflow: 'hidden'}}>
        {headline && <StudioHeadline text={headline} accent={accent} kicker={kicker} theme={tn} />}
        <div style={{
          flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: 1600, marginTop: 20,
        }}>
          <div style={{
            display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: narrow ? 14 : 18,
            width: narrow ? '92%' : '88%', transform: `rotateX(14deg) rotateZ(${Math.sin(drift / 40) * 1.5}deg)`,
            transformStyle: 'preserve-3d',
          }}>
            {cards.slice(0, 30).map((c, i) => {
              const k = prog(f, 4 + i * 2.2, 16, ease);
              const seed = rnd(`wall${i}`);
              const z = Math.sin(drift / 30 + i) * 10;
              return (
                <div key={i} style={{
                  opacity: Math.min(1, k * 1.3),
                  transform: `translateY(${(1 - k) * 30 + Math.sin(drift / 50 + seed * 10) * 6}px) translateZ(${z}px) scale(${Math.min(1, k)})`,
                }}>
                  <StudioCard radius={14} pad={narrow ? '14px 12px' : '16px 14px'} tn={tn} style={{minHeight: narrow ? 100 : 120, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 8}}>
                    <ToolGlyph name={c.glyph || c.label} color={c.color || t.accent} size={narrow ? 26 : 28} />
                    <div style={{fontFamily: F.sans, fontWeight: 700, fontSize: narrow ? 13 : 13.5, color: t.fg, textAlign: 'center', lineHeight: 1.2}}>{c.label}</div>
                    {c.sub && <div style={{fontFamily: F.mono, fontSize: narrow ? 11 : 11, color: t.sub}}>{c.sub}</div>}
                  </StudioCard>
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
