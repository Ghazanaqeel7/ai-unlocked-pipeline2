import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {F} from '../../theme.js';

// Signature "top kinetic caption" (render_guide.md spec): sits in the TOP safe zone (never buried at the
// bottom), mixes Regular Sans (context words) with an Italic Serif active word wrapped in the channel's
// signature blue selection-box (1.5px solid #3B82F6 with 4 corner square handles — the "design-tool
// picked this word" look from the reference videos). A small, separate @AIGraphicTV watermark stays in
// the bottom safe zone on every frame.
// Reads the flat {w,start,end}[] word list built from timing.json's per-scene character-proportional
// split (see make_voice_long.py: split_words()). Pure time-lookup — no per-frame ASR/alignment, so this
// stays cheap even on long-form renders.
// `words` is the full-video flat word list: [{w, start, end}] with start/end in seconds, global timeline.
// `polaritySegments` (optional): [{from, dur, polarity}] in frames, same clock as the beats themselves
// (built in Doc.jsx from each beat's resolved polarity) — lets the caption flip to dark ink whenever the
// beat underneath is a `polarity:"light"` card, instead of staying white (invisible on a light canvas).
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

  let polarity = 'dark';
  if (polaritySegments && polaritySegments.length) {
    for (let i = polaritySegments.length - 1; i >= 0; i--) {
      const s = polaritySegments[i];
      if (frame >= s.from) { polarity = s.polarity; break; }
    }
  }

  return (
    <>
      {idx !== -1 && <CaptionLine words={words} idx={idx} narrow={narrow} polarity={polarity} />}
      <Watermark narrow={narrow} polarity={polarity} />
    </>
  );
};

const CaptionLine = ({words, idx, narrow, polarity}) => {
  const WINDOW = narrow ? 5 : 7;
  const startIdx = Math.max(0, idx - Math.floor(WINDOW / 2));
  const slice = words.slice(startIdx, startIdx + WINDOW);
  const light = polarity === 'light';

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: narrow ? 150 : 90,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: narrow ? '10px 12px' : '8px 14px',
          maxWidth: narrow ? '88%' : '72%',
          padding: narrow ? '0 20px' : '0 30px',
        }}
      >
        {slice.map((w, i) => {
          const active = startIdx + i === idx;
          return active ? (
            <ActiveWord key={startIdx + i} word={w.w} narrow={narrow} light={light} />
          ) : (
            <span
              key={startIdx + i}
              style={{
                fontFamily: F.sans,
                fontWeight: 600,
                fontSize: narrow ? 42 : 32,
                color: light ? 'rgba(15,23,42,.78)' : 'rgba(255,255,255,.72)',
                textShadow: light ? '0 1px 2px rgba(255,255,255,.6)' : '0 2px 10px rgba(0,0,0,.55)',
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

// the signature pick: italic serif word inside a 1.5px blue box with 4 corner square handles, exactly
// the "selection tool picked this word" look from the reference videos. Crisp dark ink (#0F172A) on a
// light-polarity beat, white on dark — never white-on-white.
const ActiveWord = ({word, narrow, light}) => {
  const size = narrow ? 6 : 7;
  const handle = (top, left) => (
    <div
      style={{
        position: 'absolute', top, left, width: size, height: size,
        background: '#3B82F6', transform: 'translate(-50%, -50%)',
        boxShadow: '0 0 6px rgba(59,130,246,.9)',
      }}
    />
  );
  return (
    <span style={{position: 'relative', display: 'inline-block', padding: narrow ? '4px 10px' : '3px 12px'}}>
      <span
        style={{
          position: 'absolute', inset: 0, border: '1.5px solid #3B82F6', borderRadius: 4,
          background: light ? 'rgba(255,255,255,.55)' : 'transparent',
          boxShadow: light ? '0 0 14px rgba(59,130,246,.25)' : '0 0 14px rgba(59,130,246,.35)', pointerEvents: 'none',
        }}
      />
      {handle(0, 0)}
      {handle(0, '100%')}
      {handle('100%', 0)}
      {handle('100%', '100%')}
      <span
        style={{
          fontFamily: F.serif, fontStyle: 'italic', fontWeight: 700,
          fontSize: narrow ? 46 : 36, color: light ? '#0F172A' : '#fff',
          textShadow: light ? '0 1px 2px rgba(255,255,255,.4)' : '0 2px 10px rgba(0,0,0,.6)',
        }}
      >
        {word}
      </span>
    </span>
  );
};

const Watermark = ({narrow, polarity}) => {
  const light = polarity === 'light';
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: narrow ? 70 : 40, pointerEvents: 'none'}}>
      <div style={{fontFamily: F.sans, fontWeight: 700, fontSize: narrow ? 24 : 20, letterSpacing: 1, color: light ? 'rgba(15,23,42,.42)' : 'rgba(255,255,255,.35)'}}>
        @AIGraphicTV
      </div>
    </AbsoluteFill>
  );
};
