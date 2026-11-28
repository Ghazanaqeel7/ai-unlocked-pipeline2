import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {F, tone, resolveTone} from '../../theme.js';
import {prog, ease} from '../../util.js';
import {GridBg, ToolBadge, Sfx} from '../common.jsx';

// Floating grid of tool badges popping in with spring physics. Badges are always generic glass/white
// tiles + the tool's name as text (see ToolBadge in common.jsx) — never a real brand logo, so this stays
// trademark-safe regardless of which tools are named. Each badge's abstract mark is seeded off its own
// name/glyph so tiles are never identical dots, even with no explicit `glyph` given.
// params:
//   title    — optional heading above the grid
//   tools    — [{name, role, glyph, color}] — `role` is a short caption under the name (e.g. "Video gen");
//              glyph is any name accepted by ToolBadge (falls back to a per-name seeded abstract mark)
//   polarity — 'dark' (default) | 'light'
export const ToolGrid = ({title, tools = [], polarity, tone: tn}) => {
  const f = useCurrentFrame(); const tName = resolveTone(tn, polarity); const t = tone(tName); const {width: w} = useVideoConfig();
  const narrow = w < 1600;
  const n = Math.max(1, tools.length);
  const perRow = narrow ? Math.min(2, n) : Math.min(5, n);
  // narrow (Shorts) canvas: large 260x260 tiles per the vertical hero-stage-fill rule, never the old
  // small floating-dot grid with dead space around it.
  const size = narrow ? 260 : (n <= 3 ? 220 : n <= 6 ? 190 : 160);
  return (
    <AbsoluteFill>
      <GridBg tn={tName} />
      {title && (
        <div style={{position: 'absolute', left: 0, right: 0, top: narrow ? 90 : 120, textAlign: 'center', fontFamily: F.display, fontSize: narrow ? 56 : 68, color: t.fg, textTransform: 'uppercase', letterSpacing: 1, opacity: prog(f, 0, 14, ease)}}>{title}</div>
      )}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', paddingTop: title ? (narrow ? 70 : 90) : 0}}>
        <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: narrow ? 32 : 46, maxWidth: perRow * (size + (narrow ? 32 : 46))}}>
          {tools.map((tl, i) => (
            <React.Fragment key={i}>
              <ToolBadge name={tl.name} role={tl.role} glyph={tl.glyph} color={tl.color || t.accent} size={size} delay={6 + i * 6} frame={f} tn={tName} />
              <Sfx type="pop" at={6 + i * 6} volume={0.3} />
            </React.Fragment>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
