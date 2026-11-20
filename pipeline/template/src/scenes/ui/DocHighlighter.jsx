import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {F, tone, resolveTone} from '../../theme.js';
import {prog, ease} from '../../util.js';
import {GridBg, GlassPanel, Stamp, springPop} from '../common.jsx';

// Article/tweet/code "document scanner" beat: marker-pen highlight sweeps over named phrases, an
// optional red/cyan scan line sweeps once top-to-bottom, and an optional verdict stamp slams down.
// params:
//   kind       — "article" (default) | "tweet" | "code" — only changes the card chrome/font, not the logic
//   content    — the text/code shown (plain string; for "code" it's rendered in monospace)
//   highlights — [{text, color}] — each `text` is matched once (first occurrence) in `content` and gets
//                a marker-pen background reveal, staggered by index
//   stamp      — e.g. "VERIFIED" | "REFUSED" | any short word; omit for none
//   scanLine   — bool, default false — a single top-to-bottom scan-line sweep over the card
//   polarity   — 'dark' (default) | 'light'
export const DocHighlighter = ({kind = 'article', content = '', highlights = [], stamp, scanLine = false, polarity, tone: tn}) => {
  const f = useCurrentFrame(); const tName = resolveTone(tn, polarity); const t = tone(tName);
  const {width: w, height: h} = useVideoConfig(); const narrow = w < 1600;
  const kIn = springPop(f, 0, {damping: 16});
  const segs = splitHighlights(content, highlights);
  const code = kind === 'code';
  const scanY = scanLine ? prog(f, 10, 50, ease) * 100 : null;

  return (
    <>
      <GridBg tn={tName} />
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{
          width: narrow ? '88%' : '72%', maxWidth: narrow ? 900 : 1400, position: 'relative',
          opacity: Math.min(1, kIn * 1.3), transform: `scale(${0.95 + Math.min(1, kIn) * 0.05})`,
        }}>
          <GlassPanel radius={16} pad={narrow ? '26px 26px' : '38px 46px'} glow={t.accent} style={{overflow: 'hidden', position: 'relative'}}>
            {kind === 'tweet' && (
              <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16}}>
                <div style={{width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg, ${t.accent}, ${t.accent2 || t.accent})`}} />
                <div style={{fontFamily: F.sans, fontWeight: 700, fontSize: narrow ? 18 : 17, color: t.fg}}>@source</div>
              </div>
            )}
            <div style={{
              fontFamily: code ? F.mono : F.sans, fontSize: code ? (narrow ? 18 : 18) : (narrow ? 24 : 23),
              lineHeight: 1.6, color: t.fg, whiteSpace: code ? 'pre-wrap' : 'normal',
            }}>
              {segs.map((seg, i) => (
                <HighlightSpan key={i} seg={seg} f={f} i={i} />
              ))}
            </div>
            {scanLine && (
              <div style={{
                position: 'absolute', left: 0, right: 0, top: `${scanY}%`, height: 3,
                background: `linear-gradient(90deg, transparent, ${t.accent}, transparent)`,
                boxShadow: `0 0 20px ${t.accent}`, opacity: scanY > 0 && scanY < 100 ? 1 : 0,
              }} />
            )}
            {stamp && <Stamp text={stamp} color={stamp.toUpperCase().includes('REFUS') ? '#f0506e' : '#34d399'} at={60} frame={f} />}
          </GlassPanel>
        </div>
      </div>
    </>
  );
};

// splits content into {text, color|null} segments so each highlighted phrase can be revealed on its own.
const splitHighlights = (content, highlights) => {
  if (!highlights || !highlights.length) return [{text: content, color: null}];
  let segs = [{text: content, color: null}];
  for (const h of highlights) {
    const next = [];
    for (const s of segs) {
      if (s.color || !h.text) { next.push(s); continue; }
      const idx = s.text.indexOf(h.text);
      if (idx === -1) { next.push(s); continue; }
      if (idx > 0) next.push({text: s.text.slice(0, idx), color: null});
      next.push({text: h.text, color: h.color || '#fbbf24'});
      if (idx + h.text.length < s.text.length) next.push({text: s.text.slice(idx + h.text.length), color: null});
    }
    segs = next;
  }
  return segs;
};

const HighlightSpan = ({seg, f, i}) => {
  if (!seg.color) return <span>{seg.text}</span>;
  const k = prog(f, 20 + i * 10, 14, ease);
  return (
    <span style={{position: 'relative'}}>
      <span style={{
        position: 'absolute', left: 0, top: '15%', height: '70%', width: `${k * 100}%`,
        background: seg.color, opacity: 0.4, borderRadius: 3, zIndex: 0,
      }} />
      <span style={{position: 'relative', fontWeight: 700}}>{seg.text}</span>
    </span>
  );
};
