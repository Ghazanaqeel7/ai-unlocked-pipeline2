import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {AlertTriangle, Sparkles} from 'lucide-react';
import {F, tone, resolveTone} from '../../theme.js';
import {prog, ease, wordsWithAccent} from '../../util.js';
import {GridBg, Pill, springPop, GlassPanel} from '../common.jsx';
import {HostAvatar} from './HostAvatar.jsx';

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
//   pain     — (optional) the "old way"/FOMO line for the new split-contrast Pain/Shift hook
//              architecture (render_guide.md "Scroll-Stopping Pain-Point Hook"); when set, HookCard
//              renders the new two-card layout (red alert card on top, `text` becomes the emerald/cyan
//              "THE SHIFT" card below) with HostAvatar in 'alert' pose, INSTEAD of the classic single
//              kinetic-headline layout. Omit `pain` to keep the original layout unchanged (back-compat
//              for every job already using HookCard without it).
//   avatar   — set false to suppress the HostAvatar PiP on the pain/shift layout (default true)
export const HookCard = ({kicker, text = '', accent = [], pills = [], stack = [], sub, pain, avatar = true, polarity, tone: tn}) => {
  const f = useCurrentFrame(); const tName = resolveTone(tn, polarity); const t = tone(tName); const {width: w} = useVideoConfig();
  if (pain) return <PainShiftHook {...{kicker, text, accent, sub, pain, avatar, f, t, tName, w}} />;
  const ws = wordsWithAccent(text, accent);
  const narrow = w < 1600; // vertical/Shorts canvas gets a smaller, tighter type size
  const fs = (ws.length > 9 ? 0.6 : ws.length > 5 ? 0.78 : 0.95) * (narrow ? 72 : 118);
  const step = 4; const lastHit = 3 + (ws.length - 1) * step;
  const kK = prog(f, 0, 12, ease);
  return (
    <AbsoluteFill>
      <GridBg tn={tName} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: narrow ? '0 70px' : '0 150px'}}>
        {kicker && (
          <div style={{marginBottom: 22, opacity: kK, transform: `translateY(${(1 - kK) * -16}px)`}}>
            <Pill text={kicker} color={t.gold || t.accent} size={narrow ? 26 : 32} />
          </div>
        )}
        {!!stack.length && (
          <div style={{display: 'flex', gap: narrow ? -18 : -26, marginBottom: narrow ? 42 : 30}}>
            {stack.slice(0, 4).map((s, i) => {
              const k = springPop(f, i * 5, {damping: 15});
              const rot = (i - (stack.length - 1) / 2) * 7;
              const lightCard = t.card === '#FFFFFF';
              return (
                <div key={i} style={{
                  opacity: Math.min(1, k * 1.4), zIndex: 10 - i,
                  transform: `translateY(${(1 - Math.min(1, k)) * 30}px) rotate(${rot * Math.min(1, k)}deg)`,
                  marginLeft: i === 0 ? 0 : (narrow ? -18 : -26),
                }}>
                  <div style={{
                    background: t.card, border: `1px solid ${t.line || 'rgba(255,255,255,.1)'}`, borderRadius: 16,
                    padding: narrow ? '20px 24px' : '18px 26px', textAlign: 'center',
                    boxShadow: lightCard
                      ? '0 1px 2px rgba(15,23,42,.05), 0 8px 16px rgba(15,23,42,.06), 0 24px 48px rgba(15,23,42,.10)'
                      : '0 14px 34px rgba(0,0,0,.4)',
                  }}>
                    <div style={{fontFamily: F.display, fontSize: narrow ? 50 : 46, color: t.accent}}>{s.value}</div>
                    <div style={{fontFamily: F.sans, fontWeight: 700, fontSize: narrow ? 19 : 16, color: t.sub, marginTop: 2}}>{s.label}</div>
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

// High-tension split-contrast "Pain-Point / FOMO" hook (render_guide.md): top red-alert card ("THE PAIN
// / OLD WAY") with a warning pulse + brief shake micro-motion, bottom glowing emerald/cyan card ("THE
// SHIFT") — paired with HostAvatar in 'alert' pose. Every Short/Long should open on this for the first
// 0:00-0:03, instead of a single flat headline card.
const RED = '#f0506e', EMERALD = '#34d399';
const PainShiftHook = ({kicker, text, accent, sub, pain, avatar, f, t, tName, w}) => {
  const narrow = w < 1600;
  const painK = springPop(f, 0, {damping: 13});
  const shiftK = springPop(f, 16, {damping: 14});
  // brief shake on the pain card during its entrance (settles by ~frame 20)
  const shakeT = f; const shake = Math.sin(shakeT * 2.4) * Math.max(0, 6 - shakeT * 0.4);
  // slow warning-pulse glow (continuous, not just on entrance)
  const pulse = 0.55 + Math.sin(f / 9) * 0.35;
  const ws = wordsWithAccent(text, accent);
  const fs = (ws.length > 7 ? 0.62 : 0.8) * (narrow ? 50 : 76);
  return (
    <AbsoluteFill>
      <GridBg tn={tName} />
      <AbsoluteFill style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: narrow ? 26 : 30, padding: narrow ? '0 50px' : '0 140px'}}>
        {kicker && (
          <div style={{opacity: prog(f, 0, 10, ease), marginBottom: -4}}>
            <Pill text={kicker} color={t.gold || t.accent} size={narrow ? 22 : 28} />
          </div>
        )}
        <div style={{opacity: Math.min(1, painK * 1.4), transform: `translate(${shake}px, ${(1 - Math.min(1, painK)) * -24}px)`, width: '100%', maxWidth: narrow ? 900 : 1300}}>
          <GlassPanel radius={22} pad={narrow ? '22px 28px' : '20px 36px'}
            style={{border: `2px solid ${RED}`, boxShadow: `0 0 ${30 + pulse * 30}px ${RED}${Math.round(30 + pulse * 25).toString(16)}`}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
              <AlertTriangle size={narrow ? 34 : 30} color={RED} strokeWidth={2.4} style={{flexShrink: 0}} />
              <div>
                <div style={{fontFamily: F.display, fontSize: narrow ? 17 : 15, letterSpacing: 2, color: RED, marginBottom: 4}}>THE OLD WAY</div>
                <div style={{fontFamily: F.sans, fontWeight: 800, fontSize: narrow ? 26 : 24, color: t.fg, lineHeight: 1.25}}>{pain}</div>
              </div>
            </div>
          </GlassPanel>
        </div>

        <div style={{opacity: Math.min(1, shiftK * 1.4), transform: `translateY(${(1 - Math.min(1, shiftK)) * 24}px)`, width: '100%', maxWidth: narrow ? 900 : 1300}}>
          <GlassPanel radius={22} pad={narrow ? '26px 28px' : '24px 40px'}
            style={{border: `2px solid ${EMERALD}`, boxShadow: `0 0 50px ${EMERALD}44`}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
              <Sparkles size={narrow ? 36 : 32} color={EMERALD} strokeWidth={2.2} style={{flexShrink: 0}} />
              <div>
                <div style={{fontFamily: F.display, fontSize: narrow ? 18 : 16, letterSpacing: 2, color: EMERALD, marginBottom: 6}}>THE SHIFT</div>
                <div style={{display: 'flex', flexWrap: 'wrap', gap: `0 ${fs * 0.2}px`}}>
                  {ws.map((x, i) => {
                    const at = 22 + i * 3; const k = prog(f, at, 6, ease);
                    return (
                      <span key={i} style={{
                        fontFamily: F.display, fontSize: fs, lineHeight: 1.1, color: x.a ? EMERALD : t.fg,
                        textTransform: 'uppercase', opacity: k, transform: `scale(${1 + (1 - k) * 1.2})`,
                        textShadow: x.a ? `0 0 24px ${EMERALD}99` : 'none',
                      }}>{x.w}</span>
                    );
                  })}
                </div>
              </div>
            </div>
          </GlassPanel>
        </div>

        {sub && (
          <div style={{opacity: prog(f, 40, 14), fontFamily: F.sans, fontWeight: 600, fontSize: narrow ? 26 : 32, color: t.sub, textAlign: 'center', maxWidth: narrow ? 800 : 1200}}>{sub}</div>
        )}
      </AbsoluteFill>
      {avatar && (
        <div style={{position: 'absolute', right: narrow ? 20 : 40, bottom: narrow ? 20 : 40, opacity: prog(f, 8, 14)}}>
          <HostAvatar pose="alert" size={narrow ? 180 : 220} delay={8} />
        </div>
      )}
    </AbsoluteFill>
  );
};
