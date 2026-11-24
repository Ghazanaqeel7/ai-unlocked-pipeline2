import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {Headphones} from 'lucide-react';
import {F, tone, resolveTone} from '../theme.js';
import {prog, ease, rnd} from '../util.js';
import {GridBg, GlassPanel} from '../scenes/common.jsx';

// Output #1 zoom-in: NotebookLM's real "Audio Overview" feature (podcast-style discussion generated
// from your own uploaded sources) — deterministic pseudo-waveform bars (no Math.random), dense glass
// card filling the vertical hero stage.
const N = 26;
const bars = Array.from({length: N}, (_, i) => 0.25 + rnd(`wav${i}`) * 0.75);

export const AudioWaveCard = ({polarity, tone: tn}) => {
  const f = useCurrentFrame(); const tName = resolveTone(tn, polarity); const t = tone(tName);
  const {width: w, height: h} = useVideoConfig(); const narrow = w < 1600;
  const barW = narrow ? 22 : 14, gap = narrow ? 10 : 6, chartH = narrow ? 480 : 160;
  const revealed = Math.floor(prog(f, 4, 40, ease) * N);
  return (
    <>
      <GridBg tn={tName} />
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: narrow ? 46 : 20}}>
        <GlassPanel radius={24} pad={narrow ? '44px 36px' : '26px 28px'} glow={t.accent} tn={tName}
          style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: narrow ? 28 : 16, minWidth: narrow ? 920 : 620}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
            <Headphones size={narrow ? 32 : 26} color={t.accent} strokeWidth={2.2} />
            <div style={{fontFamily: F.mono, fontWeight: 700, fontSize: narrow ? 22 : 17, color: t.fg, letterSpacing: 1}}>AUDIO OVERVIEW</div>
          </div>
          <div style={{display: 'flex', alignItems: 'flex-end', gap, height: chartH}}>
            {bars.map((h, i) => {
              if (i > revealed) return <div key={i} style={{width: barW}} />;
              const bump = 1 + Math.sin(f / 6 + i) * 0.08;
              return (
                <div key={i} style={{
                  width: barW, height: chartH * h * bump, borderRadius: 6,
                  background: `linear-gradient(180deg, ${t.accent}, ${t.accent2 || t.accent})`,
                  opacity: prog(f, 4 + i * (40 / N), 8, ease),
                }} />
              );
            })}
          </div>
          <div style={{fontFamily: F.sans, fontWeight: 600, fontSize: narrow ? 20 : 15, color: t.sub}}>Two AI hosts, talking through your PDF</div>
        </GlassPanel>
        <div style={{opacity: prog(f, 36, 16, ease), fontFamily: F.sans, fontWeight: 700, fontSize: narrow ? 30 : 22, color: t.sub, textAlign: 'center', maxWidth: '82%'}}>
          Output #1: a ready-to-listen podcast.
        </div>
      </div>
    </>
  );
};
