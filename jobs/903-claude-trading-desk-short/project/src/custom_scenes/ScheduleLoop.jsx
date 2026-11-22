import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {Search, Brain, BookOpen, Moon} from 'lucide-react';
import {F, tone, resolveTone} from '../theme.js';
import {prog, ease} from '../util.js';
import {GridBg, GlassPanel} from '../scenes/common.jsx';

// Bespoke "it runs on a schedule, not a click" loop for 903-claude-trading-desk-short: 4 real icons
// lighting up in sequence around a cycle, each with its own label, then looping back — never a static
// frozen card.
export const ScheduleLoop = ({polarity, tone: tn}) => {
  const f = useCurrentFrame(); const tName = resolveTone(tn, polarity); const t = tone(tName);
  const {width: w} = useVideoConfig(); const narrow = w < 1600;
  const steps = [
    {Icon: Search, label: 'Research'},
    {Icon: Brain, label: 'Decide'},
    {Icon: BookOpen, label: 'Log'},
    {Icon: Moon, label: 'Sleep'},
  ];
  const activeIdx = Math.min(steps.length - 1, Math.floor(prog(f, 4, 56, ease) * steps.length));
  return (
    <>
      <GridBg tn={tName} />
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: narrow ? 36 : 26, padding: 30}}>
        <div style={{display: 'grid', gridTemplateColumns: narrow ? '1fr 1fr' : 'repeat(4, 1fr)', gap: narrow ? 20 : 22, maxWidth: narrow ? '86%' : '80%'}}>
          {steps.map(({Icon, label}, i) => {
            const k = prog(f, 6 + i * 8, 14, ease);
            const active = i <= activeIdx;
            return (
              <GlassPanel key={label} radius={20} pad={narrow ? '26px 18px' : '18px 16px'} glow={active ? t.accent : undefined} tn={tName}
                style={{opacity: Math.max(0.55, k), transform: `scale(${active ? 1.04 : 1})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
                <Icon size={narrow ? 48 : 34} color={active ? t.accent : t.sub} strokeWidth={2.2} />
                <div style={{fontFamily: F.sans, fontWeight: 800, fontSize: narrow ? 20 : 15, color: active ? t.fg : t.sub, textTransform: 'uppercase', letterSpacing: 1}}>{label}</div>
              </GlassPanel>
            );
          })}
        </div>
        <div style={{opacity: prog(f, 46, 16, ease), fontFamily: F.sans, fontWeight: 700, fontSize: narrow ? 30 : 22, color: t.sub, textAlign: 'center', maxWidth: '84%'}}>
          Runs on a schedule, never a click.
        </div>
      </div>
    </>
  );
};
