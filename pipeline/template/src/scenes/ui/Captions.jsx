import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {F} from '../../theme.js';

// Signature "Bottom Floating Subtitle" system (docs/style_reference.md "Bottom Stage" — PERMANENTLY
// replaces the older top-of-frame blue-selection-box caption look): a clean, centered floating pill
// sits in the lower-third safe zone. The whole pill flips color with the beat underneath it — a white
// card with bold dark text over a dark/grid (obsidian) background, or a dark-ink pill with crisp white
// text over a light (sand/studio) background — never a transparent box with a colored border. The
// currently-spoken word is highlighted inside the pill with the beat's own accent color. No blue
// bounding-box, no corner handles.
// Reads the flat {w,start,end}[] word list built from timing.json's per-scene character-proportional
// split (see make_voice_long.py: split_words()). Pure time-lookup — no per-frame ASR/alignment, so this
// stays cheap even on long-form renders.
// `words` is the full-video flat word list: [{w, start, end}] with start/end in seconds, global timeline.
// `polaritySegments` (optional): [{from, dur, polarity}] in frames, same clock as the beats themselves
// (built in Doc.jsx from each beat's resolved polarity/theme) — lets the pill flip dark<->light with
// whichever of the 3 signature themes the current beat is on.
export const Captions = ({words, polaritySegments}) => {
  const frame = useCurrentFrame();
  const {fps, width} = useVideoConfig();
  const narrow = width < 1600;
  const t = frame / fps;

  let idx = words && words.length ? -1 : -1;
  if (words && words.length) {
    for (let i = 0; i < words.length; i++) {
      if (t >= words[i].start && t < words[i].end) {
        idx = i;
        break;
      }
    }
    if (idx === -1) {
      for (let i = 0; i < words.length; i++) {
        if (t < words[i].start) {
          idx = i;
          break;
        }
      }
    }
  }

  let polarity = 'dark'; let accent = '#C8F938';
  if (polaritySegments && polaritySegments.length) {
    for (let i = polaritySegments.length - 1; i >= 0; i--) {
      const s = polaritySegments[i];
      if (frame >= s.from) { polarity = s.polarity; accent = s.accent || accent; break; }
    }
  }

  return (
    <>
      {idx !== -1 && <CaptionPill words={words} idx={idx} narrow={narrow} polarity={polarity} accent={accent} />}
      <Watermark narrow={narrow} polarity={polarity} />
    </>
  );
};

const CaptionPill = ({words, idx, narrow, polarity, accent}) => {
  const WINDOW = narrow ? 5 : 7;
  const startIdx = Math.max(0, idx - Math.floor(WINDOW / 2));
  const slice = words.slice(startIdx, startIdx + WINDOW);
  const light = polarity === 'light'; // sand/studio beat underneath -> dark-ink pill, white text
  const pillBg = light ? '#0F172A' : '#FFFFFF';
  const ctxColor = light ? 'rgba(255,255,255,.72)' : 'rgba(15,23,42,.65)';
  const activeColor = light ? '#FFFFFF' : '#0F172A';

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: narrow ? 210 : 130,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: narrow ? '6px 10px' : '5px 12px',
          maxWidth: narrow ? '86%' : '68%',
          background: pillBg,
          borderRadius: narrow ? 40 : 46,
          padding: narrow ? '18px 30px' : '16px 34px',
          boxShadow: '0 18px 46px rgba(0,0,0,.28)',
        }}
      >
        {slice.map((w, i) => {
          const active = startIdx + i === idx;
          return (
            <span
              key={startIdx + i}
              style={{
                fontFamily: F.sans,
                fontWeight: active ? 800 : 600,
                fontSize: narrow ? 34 : 28,
                color: active ? accent : ctxColor,
                letterSpacing: '-0.01em',
              }}
            >
              {active ? w.w.toUpperCase() : w.w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Watermark = ({narrow, polarity}) => {
  const light = polarity === 'light';
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-start', paddingTop: narrow ? 60 : 36, pointerEvents: 'none'}}>
      <div style={{fontFamily: F.sans, fontWeight: 700, fontSize: narrow ? 24 : 20, letterSpacing: 1, color: light ? 'rgba(15,23,42,.42)' : 'rgba(255,255,255,.4)'}}>
        @AIGraphicTV
      </div>
    </AbsoluteFill>
  );
};
