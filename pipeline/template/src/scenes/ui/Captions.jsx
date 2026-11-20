import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {C} from '../../theme.js';

// Dynamic word-by-word highlighted captions. Reads the flat {w,start,end}[] word list built from
// timing.json's per-scene character-proportional split (see make_voice_long.py: split_words()).
// Pure lookup by current time against pre-computed absolute (global-timeline) word windows — no
// per-frame ASR/alignment, so this stays cheap even on long-form renders.
// `words` is the full-video flat word list: [{w, start, end}] with start/end in seconds, global timeline.
export const Captions = ({words}) => {
  const frame = useCurrentFrame();
  const {fps, width} = useVideoConfig();
  const narrow = width < 1600;
  if (!words || !words.length) return null;
  const t = frame / fps;

  // find active word index (linear scan is fine: a few hundred-2000 words max per video)
  let idx = -1;
  for (let i = 0; i < words.length; i++) {
    if (t >= words[i].start && t < words[i].end) {
      idx = i;
      break;
    }
  }
  if (idx === -1) {
    // between words (gap/pause): show the nearest upcoming/just-finished word context, but no highlight
    for (let i = 0; i < words.length; i++) {
      if (t < words[i].start) {
        idx = i;
        break;
      }
    }
    if (idx === -1) return null;
  }

  const WINDOW = narrow ? 5 : 7;
  const startIdx = Math.max(0, idx - Math.floor(WINDOW / 2));
  const slice = words.slice(startIdx, startIdx + WINDOW);

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: narrow ? 200 : 110,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: narrow ? 10 : 14,
          maxWidth: narrow ? '86%' : '70%',
          padding: narrow ? '18px 26px' : '14px 28px',
          borderRadius: 18,
          background: 'rgba(6,11,20,.55)',
          backdropFilter: 'blur(14px)',
          border: `1px solid ${C.glassLine}`,
        }}
      >
        {slice.map((w, i) => {
          const active = startIdx + i === idx;
          return (
            <span
              key={startIdx + i}
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontWeight: active ? 800 : 600,
                fontSize: narrow ? 44 : 34,
                color: active ? C.gold : 'rgba(255,255,255,.75)',
                textShadow: active ? `0 0 18px ${C.gold}66` : 'none',
                transition: 'none',
                letterSpacing: '-0.01em',
              }}
            >
              {w.w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
