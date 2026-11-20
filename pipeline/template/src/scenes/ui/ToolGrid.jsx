import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {F, tone} from '../../theme.js';
import {prog, ease} from '../../util.js';
import {GridBg, ToolBadge, Sfx} from '../common.jsx';

// Floating grid of tool badges popping in with spring physics. Badges are always generic glass tiles +
// the tool's name as text (see ToolBadge in common.jsx) — never a real brand logo, so this stays
// trademark-safe regardless of which tools are named.
// params:
//   title  — optional heading above the grid
//   tools  — [{name, glyph, color}] — glyph is any name accepted by ToolBadge (falls back to an abstract mark)
//   tone
export const ToolGrid = ({title, tools = [], tone: tn = 'glass'}) => {
  const f = useCurrentFrame(); const t = tone(tn); const {width: w} = useVideoConfig();
  const narrow = w < 1600;
  const n = Math.max(1, tools.length);
  const perRow = narrow ? Math.min(2, n) : Math.min(5, n);
  const size = narrow ? 170 : (n <= 3 ? 220 : n <= 6 ? 190 : 160);
  return (
    <AbsoluteFill>
      <GridBg tn={tn} />
      {title && (
        <div style={{position: 'absolute', left: 0, right: 0, top: narrow ? 90 : 120, textAlign: 'center', fontFamily: F.display, fontSize: narrow ? 46 : 68, color: t.fg, textTransform: 'uppercase', letterSpacing: 1, opacity: prog(f, 0, 14, ease)}}>{title}</div>
      )}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', paddingTop: title ? (narrow ? 60 : 90) : 0}}>
        <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: narrow ? 28 : 46, maxWidth: perRow * (size + (narrow ? 28 : 46))}}>
          {tools.map((tl, i) => (
            <React.Fragment key={i}>
              <ToolBadge name={tl.name} glyph={tl.glyph} color={tl.color || t.accent} size={size} delay={6 + i * 6} frame={f} />
              <Sfx type="pop" at={6 + i * 6} volume={0.3} />
            </React.Fragment>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
