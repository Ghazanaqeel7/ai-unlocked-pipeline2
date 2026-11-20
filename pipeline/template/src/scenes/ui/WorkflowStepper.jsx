import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {F, tone, resolveTone} from '../../theme.js';
import {prog, ease} from '../../util.js';
import {GridBg, GlassPanel, AnimatedBar, springPop, Sfx} from '../common.jsx';

// Replaces StepFlow: a top row of 3-5 connected step tabs that sequentially activate (green checkmark
// fill) while a single lower workspace card updates live underneath — never a frozen screen.
// params:
//   steps          — [{icon, label}] (3-5) — `icon` is a short glyph/emoji or omitted for a step number
//   activeDuration — frames per step before the next one activates (default: frames/steps.length)
//   body           — {type:"checklist"|"bars"|"stack3d", items}
//                      checklist items: [{text}]            — rows tick in one by one
//                      bars items:      [{label,value,max,color}] — animated comparison bars
//                      stack3d items:   [{label}]            — isometric cards assembling
//   polarity       — 'dark' (default) | 'light'
export const WorkflowStepper = ({steps = [], activeDuration, body, polarity, tone: tn, frames = 90}) => {
  const f = useCurrentFrame(); const tName = resolveTone(tn, polarity); const t = tone(tName); const {width: w} = useVideoConfig();
  const narrow = w < 1600;
  const n = Math.max(1, steps.length);
  const dur = activeDuration || Math.max(14, Math.floor(frames / n));
  const activeStep = Math.min(n - 1, Math.floor(f / dur));

  return (
    <AbsoluteFill>
      <GridBg tn={tName} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: narrow ? '0 40px' : '0 90px'}}>
        <div style={{width: narrow ? '100%' : '82%', maxWidth: narrow ? 900 : 1500}}>
          <div style={{display: 'flex', alignItems: 'center', marginBottom: narrow ? 26 : 34}}>
            {steps.slice(0, 5).map((s, i) => {
              const done = i < activeStep; const active = i === activeStep;
              const k = springPop(f, i * (dur * 0.6), {damping: 18});
              return (
                <React.Fragment key={i}>
                  {i > 0 && <div style={{flex: 1, height: 3, background: done || active ? t.accent : 'rgba(255,255,255,.12)', boxShadow: done ? `0 0 10px ${t.accent}aa` : 'none'}} />}
                  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: Math.min(1, k * 1.4), flex: '0 0 auto'}}>
                    <div style={{
                      width: narrow ? 46 : 54, height: narrow ? 46 : 54, borderRadius: '50%',
                      background: done ? t.accent : active ? (t.card || 'rgba(255,255,255,.1)') : 'rgba(255,255,255,.06)',
                      border: active ? `2px solid ${t.accent}` : '2px solid transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: F.sans, fontWeight: 800, fontSize: narrow ? 18 : 20,
                      color: done ? '#071018' : t.fg, boxShadow: active ? `0 0 20px ${t.accent}66` : 'none',
                    }}>
                      {done ? '✓' : s.icon || i + 1}
                    </div>
                    <div style={{fontFamily: F.sans, fontWeight: 600, fontSize: narrow ? 13 : 14, color: active ? t.fg : t.sub, textAlign: 'center', maxWidth: 100}}>{s.label}</div>
                  </div>
                  <Sfx type="pop" at={i * dur} volume={0.25} />
                </React.Fragment>
              );
            })}
          </div>
          <GlassPanel radius={20} pad={narrow ? '22px 24px' : '30px 38px'} glow={t.accent}>
            {body && body.type === 'bars' && (body.items || []).map((it, i) => (
              <AnimatedBar key={i} name={it.label} value={it.value} max={it.max} color={it.color || t.accent} frame={f} i={i} narrow={narrow} startAt={6} />
            ))}
            {body && body.type === 'stack3d' && <Stack3D items={body.items || []} f={f} t={t} narrow={narrow} />}
            {(!body || body.type === 'checklist') && <Checklist items={(body && body.items) || []} f={f} t={t} narrow={narrow} />}
          </GlassPanel>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Checklist = ({items, f, t, narrow}) => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
    {items.map((it, i) => {
      const k = prog(f, 10 + i * 12, 10, ease);
      return (
        <div key={i} style={{display: 'flex', alignItems: 'center', gap: 14, opacity: Math.min(1, k * 1.3), transform: `translateX(${(1 - k) * -16}px)`}}>
          <div style={{
            width: 26, height: 26, borderRadius: 7, border: `2px solid ${t.accent}`, flex: '0 0 auto',
            background: k >= 0.98 ? t.accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#071018', fontWeight: 900, fontSize: 16,
          }}>{k >= 0.98 ? '✓' : ''}</div>
          <div style={{fontFamily: F.sans, fontWeight: 600, fontSize: narrow ? 20 : 22, color: t.fg}}>{it.text}</div>
        </div>
      );
    })}
  </div>
);

const Stack3D = ({items, f, t, narrow}) => (
  <div style={{position: 'relative', height: narrow ? 180 : 220, display: 'flex', alignItems: 'flex-end', justifyContent: 'center'}}>
    {items.map((it, i) => {
      const k = springPop(f, 8 + i * 10, {damping: 14});
      const depth = items.length - i;
      return (
        <div key={i} style={{
          position: 'absolute', bottom: i * (narrow ? 26 : 32), width: narrow ? 260 : 340,
          opacity: Math.min(1, k * 1.3), transform: `translateY(${(1 - Math.min(1, k)) * 40}px) scale(${0.9 + Math.min(1, k) * 0.1}) rotateX(${6}deg)`,
          background: t.card, border: `1px solid ${t.line || 'rgba(255,255,255,.1)'}`, borderRadius: 14,
          padding: '14px 20px', boxShadow: `0 ${10 + depth * 4}px 26px rgba(0,0,0,.4)`, textAlign: 'center',
          fontFamily: F.sans, fontWeight: 700, fontSize: narrow ? 17 : 19, color: t.fg, zIndex: i,
        }}>{it.label}</div>
      );
    })}
  </div>
);
