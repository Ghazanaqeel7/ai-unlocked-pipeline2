import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {F, tone, resolveTone} from '../../theme.js';
import {prog, ease, wordsWithAccent} from '../../util.js';
import {GridBg, Pill, springPop} from '../common.jsx';

// The core kinetic-typography beat: a bold split headline with one or more highlighted keyword pills.
// params:
//   kicker   — small label above the headline ("TRICK #1"), optional
//   text     — the headline itself (plain claim, no quotes marks needed)
//   accent   — words in `text` to render as glowing text instead of plain white (subset of HookCard's own
//              highlight system; different from Pill below)
//   pills    — array of strings/[{text,color}] rendered as glass-pill badges under the headline,
//              e.g. ["1 LINE = FULL VIDEO"] or [{text:'FREE', color: C.gold}]
//   stack    — optional 2-4 small fan-out badge cards [{label,value}], spring in staggered with a
//              slight rotation offset each (the "kinetic stack" look) — use for a quick multi-item
//              hook ("3 tools", "4 steps") instead of (or alongside) `pills`
//   sub      — one short supporting line under the pills/stack
//   polarity — 'dark' (default) | 'light' — per-beat Obsidian-Grid/Alabaster theme switch
//   tone     — explicit tone name override (back-compat); wins over `polarity` if both are given
export const HookCard = ({kicker, text = '', accent = [], pills = [], stack = [], sub, polarity, tone: tn}) => {
  const f = useCurrentFrame(); const tName = resolveTone(tn, polarity); const t = tone(tName); const {width: w} = useVideoConfig();
  const ws = wordsWithAccent(text, accent);
  const narrow = w < 1600; // vertical/Shorts canvas gets a smaller, tighter type size
  const fs = (ws.length > 9 ? 0.6 : ws.length > 5 ? 0.78 : 0.95) * (narrow ? 72 : 118);
  const step = 4; const lastHit = 3 + (ws.length - 1) * step;
  const kK = prog(f, 0, 12, ease);
  return (
    <AbsoluteFill>
      <GridBg tn={tn} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: narrow ? '0 70px' : '0 150px'}}>
        {kicker && (
          <div style={{marginBottom: 22, opacity: kK, transform: `translateY(${(1 - kK) * -16}px)`}}>
            <Pill text={kicker} color={t.gold || t.accent} size={narrow ? 26 : 32} />
          </div>
        )}
        {!!stack.length && (
          <div style={{display: 'flex', gap: narrow ? -18 : -26, marginBottom: 30}}>
            {stack.slice(0, 4).map((s, i) => {
              const k = springPop(f, i * 5, {damping: 15});
              const rot = (i - (stack.length - 1) / 2) * 7;
              return (
                <div key={i} style={{
                  opacity: Math.min(1, k * 1.4), zIndex: 10 - i,
                  transform: `translateY(${(1 - Math.min(1, k)) * 30}px) rotate(${rot * Math.min(1, k)}deg)`,
                  marginLeft: i === 0 ? 0 : (narrow ? -18 : -26),
                }}>
                  <div style={{
                    background: t.card, border: `1px solid ${t.line || 'rgba(255,255,255,.1)'}`, borderRadius: 16,
                    padding: narrow ? '14px 18px' : '18px 26px', boxShadow: '0 14px 34px rgba(0,0,0,.4)', textAlign: 'center',
                  }}>
                    <div style={{fontFamily: F.display, fontSize: narrow ? 34 : 46, color: t.accent}}>{s.value}</div>
                    <div style={{fontFamily: F.sans, fontWeight: 700, fontSize: narrow ? 14 : 16, color: t.sub, marginTop: 2}}>{s.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: `0 ${fs * 0.24}px`, maxWidth: narrow ? 900 : 1620, textAlign: 'center'}}>
          {ws.map((x, i) => {
            const at = 3 + i * step; const k = prog(f, at, 6, ease);
            const sc = 1 + (1 - k) * 1.3;
            return (
              <span key={i} style={{
                fontFamily: F.display, fontSize: fs, lineHeight: 1.1, letterSpacing: 0.5,
                color: x.a ? t.accent2 || t.accent : t.fg, textTransform: 'uppercase',
                opacity: k, transform: `scale(${sc})`,
                textShadow: x.a ? `0 0 30px ${t.accent2 || t.accent}88` : '0 8px 26px rgba(0,0,0,.5)',
              }}>{x.w}</span>
            );
          })}
        </div>
        {!!pills.length && (
          <div style={{display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginTop: 36, maxWidth: narrow ? 900 : 1400}}>
            {pills.map((p, i) => {
              const spec = typeof p === 'string' ? {text: p} : p;
              const k = springPop(f, lastHit + 6 + i * 6);
              return (
                <div key={i} style={{opacity: Math.min(1, k * 1.4), transform: `scale(${Math.min(1, k)}) translateY(${(1 - Math.min(1, k)) * 20}px)`}}>
                  <Pill text={spec.text} color={spec.color || t.accent} size={narrow ? 24 : 30} />
                </div>
              );
            })}
          </div>
        )}
        {sub && (
          <div style={{marginTop: 30, fontFamily: F.sans, fontWeight: 600, fontSize: narrow ? 30 : 42, color: t.sub, opacity: prog(f, lastHit + 14, 14), textAlign: 'center', maxWidth: narrow ? 820 : 1300}}>{sub}</div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
