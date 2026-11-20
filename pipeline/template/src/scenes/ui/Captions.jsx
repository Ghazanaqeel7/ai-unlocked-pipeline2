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
export const Captions = ({words}) => {
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

  return (
    <>
      {idx !== -1 && <CaptionLine words={words} idx={idx} narrow={narrow} />}
      <Watermark narrow={narrow} />
    </>
  );
};

const CaptionLine = ({words, idx, narrow}) => {
  const WINDOW = narrow ? 5 : 7;
  const startIdx = Math.max(0, idx - Math.floor(WINDOW / 2));
  const slice = words.slice(startIdx, startIdx + WINDOW);

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
            <ActiveWord key={startIdx + i} word={w.w} narrow={narrow} />
          ) : (
            <span
              key={startIdx + i}
              style={{
                fontFamily: F.sans,
                fontWeight: 600,
                fontSize: narrow ? 42 : 32,
                color: 'rgba(255,255,255,.72)',
                textShadow: '0 2px 10px rgba(0,0,0,.55)',
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
// the "selection tool picked this word" look from the reference videos.
const ActiveWord = ({word, narrow}) => {
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
          boxShadow: '0 0 14px rgba(59,130,246,.35)', pointerEvents: 'none',
        }}
      />
      {handle(0, 0)}
      {handle(0, '100%')}
      {handle('100%', 0)}
      {handle('100%', '100%')}
      <span
        style={{
          fontFamily: F.serif, fontStyle: 'italic', fontWeight: 700,
          fontSize: narrow ? 46 : 36, color: '#fff',
          textShadow: '0 2px 10px rgba(0,0,0,.6)',
        }}
      >
        {word}
      </span>
    </span>
  );
};

const Watermark = ({narrow}) => (
  <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: narrow ? 70 : 40, pointerEvents: 'none'}}>
    <div style={{fontFamily: F.sans, fontWeight: 700, fontSize: narrow ? 24 : 20, letterSpacing: 1, color: 'rgba(255,255,255,.35)'}}>
      @AIGraphicTV
    </div>
  </AbsoluteFill>
);
