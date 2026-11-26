import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {F, tone, studioTheme} from '../../theme.js';
import {prog, ease, wordsWithAccent} from '../../util.js';
import {HighlightSweep} from '../common.jsx';

// Shared "kinetic headline" building block (style_reference.md "Top Stage"): a massive 2-line
// ExtraBold editorial headline where the power phrase(s) listed in `accent` sit inside an animated
// solid highlight block that wipes in behind the words, instead of the old glowing-text treatment.
// Used by hookcard replacements and any `scenes/studio/` primitive that needs a big opening line.
export const StudioHeadline = ({text = '', accent = [], kicker, theme, size, startAt = 0, align = 'center'}) => {
  const f = useCurrentFrame(); const t = tone(studioTheme(theme)); const {width: w} = useVideoConfig();
  const narrow = w < 1600;
  const ws = wordsWithAccent(text, accent);
  // Massive editorial display size (style_reference.md fix #1): 84-104px on 9:16, 72-92px on 16:9,
  // regardless of word count — the old 0.58x factor let a long headline shrink to ~63px, well below
  // "massive". `size` can still override for a one-off primitive that truly needs a smaller headline.
  const fs = size || (ws.length > 9 ? 0.76 : ws.length > 5 ? 0.86 : 0.95) * (narrow ? 110 : 97);
  const step = 4;
  return (
    <div style={{textAlign: align, maxWidth: narrow ? 900 : 1600}}>
      {kicker && (
        <div style={{
          opacity: prog(f, startAt, 10, ease), marginBottom: 18, fontFamily: F.sans, fontWeight: 800,
          fontSize: narrow ? 20 : 24, letterSpacing: 3, textTransform: 'uppercase', color: t.accent,
        }}>{kicker}</div>
      )}
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: align === 'left' ? 'flex-start' : 'center', gap: `${fs * 0.18}px ${fs * 0.22}px`}}>
        {ws.map((x, i) => {
          const at = startAt + 3 + i * step;
          const k = prog(f, at, 7, ease);
          const sc = 1 + (1 - k) * 1.15;
          return (
            <span key={i} style={{position: 'relative', display: 'inline-block', opacity: k, transform: `scale(${sc})`}}>
              {x.a && <HighlightSweep frame={f} at={at + 2} color={t.accent} style={{inset: '6% -4%', zIndex: 0}} />}
              <span style={{
                position: 'relative', zIndex: 1, fontFamily: F.display, fontSize: fs, lineHeight: 1.05,
                letterSpacing: '-0.03em', textTransform: 'uppercase', color: x.a ? t.onAccent : t.fg,
                padding: x.a ? `0 ${fs * 0.08}px` : 0,
              }}>{x.w}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
};
